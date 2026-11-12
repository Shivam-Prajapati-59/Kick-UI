#!/usr/bin/env node

/**
 * Release smoke-check for the registry.
 *
 * Serves public/r locally, scaffolds a fresh Next.js app, installs every
 * registry item with the real shadcn CLI, asserts the installed file paths,
 * copies the component demos into e2e pages, runs `next build`, then serves
 * the built app and renders every demo in headless Chrome/Edge over the
 * DevTools protocol, failing on console errors, failed requests and blank
 * renders. Catches broken dependency URLs, missing type packages, install-path
 * regressions and demos that cannot render in a customer app.
 *
 * Run: bun scripts/check-install.mjs [--keep]
 * Browser: set BROWSER_PATH to override Chrome/Edge discovery.
 * Location: set KICKUI_CHECK_DIR to scaffold somewhere other than the OS temp dir.
 */

import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(root, "public", "r");
const keep = process.argv.includes("--keep");

const config = JSON.parse(
  fs.readFileSync(path.join(root, "registry.json"), "utf8"),
);
const registry = JSON.parse(
  fs.readFileSync(path.join(OUT_DIR, "registry.json"), "utf8"),
);
const homepage = config.homepage.replace(/\/+$/, "");
const items = registry.items;

let base = "";
let server;
let tempDir;
let nextServer;
let browser;

/**
 * Run a command, capture output, resolve on exit (never blocks the server).
 * A step that hangs (e.g. npx stuck on the network) is killed after 10 min.
 */
function run(command, args, cwd, timeout = 600000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: true,
      detached: process.platform !== "win32",
    });
    let output = "";
    const timer = setTimeout(() => {
      output += `\nTimed out after ${timeout / 1000}s.`;
      stopChild(child);
    }, timeout);
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
}

function tail(text, lines = 20) {
  return text.trimEnd().split(/\r?\n/).slice(-lines).join("\n");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function step(label, command, args, cwd) {
  const { code, output } = await run(command, args, cwd);
  if (code !== 0) {
    console.error(`✗ ${label}`);
    console.error(tail(output));
    const error = new Error(`${label} failed (exit ${code}).`);
    error.reported = true;
    throw error;
  }
  console.log(`✓ ${label}`);
}

/** Serve public/r, rewriting own-registry dependency URLs to this server. */
function startServer() {
  server = http.createServer((req, res) => {
    const name = /^\/r\/([a-z0-9-]+)\.json$/.exec(req.url ?? "")?.[1];
    const file = name && path.join(OUT_DIR, `${name}.json`);
    if (!file || !fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const body = fs
      .readFileSync(file, "utf8")
      .replaceAll(`${homepage}/r/`, `${base}/r/`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(body);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

/** Poll a URL until it answers 2xx (or the deadline passes). */
async function waitForUrl(url, label, timeout = 120000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not up yet.
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${label} at ${url}.`);
}

/**
 * Copy each demo into the app as a client page and provide the bits the docs
 * site sets up for them: the dropdown-menu dependency, the /assets files
 * (demos build some paths at runtime, so copy the folder) and the image
 * hosts.
 */
function prepareDemos(appDir) {
  const demosDir = path.join(appDir, "src", "demos");
  const pagesDir = path.join(appDir, "src", "app", "e2e");
  fs.mkdirSync(demosDir, { recursive: true });

  for (const item of items) {
    const source = fs.readFileSync(
      path.join(root, "src", "demos", `${item.name}.tsx`),
      "utf8",
    );
    const demo = source.replaceAll(
      /@registry\/new-york\/components\/[a-z0-9-]+\/([a-z0-9-]+)/g,
      "@/components/ui/$1",
    );
    fs.writeFileSync(path.join(demosDir, `${item.name}.tsx`), demo);

    const page = `import Demo from "@/demos/${item.name}";

export default function Page() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      data-e2e-root
    >
      <Demo />
    </main>
  );
}
`;
    fs.mkdirSync(path.join(pagesDir, item.name), { recursive: true });
    fs.writeFileSync(path.join(pagesDir, item.name, "page.tsx"), page);
  }

  fs.cpSync(
    path.join(root, "public", "assets"),
    path.join(appDir, "public", "assets"),
    { recursive: true },
  );

  fs.writeFileSync(
    path.join(appDir, "next.config.ts"),
    `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
`,
  );

  console.log(`✓ Wrote ${items.length} demo pages`);
}

/** Start `next start` on a free port and wait until the app answers. */
async function startApp(appDir) {
  const port = await freePort();
  let output = "";
  nextServer = spawn("npx", ["next", "start", "-p", `${port}`], {
    cwd: appDir,
    shell: true,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  nextServer.stdout.on("data", (chunk) => (output += chunk));
  nextServer.stderr.on("data", (chunk) => (output += chunk));

  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForUrl(`${url}/`, "next start", 60000);
  } catch (error) {
    throw new Error(`${error.message}\n${tail(output)}`);
  }
  console.log(`✓ Serving the built app at ${url}`);
  return url;
}

/** Locate a Chromium-based browser, honouring BROWSER_PATH. */
function findBrowser() {
  if (process.env.BROWSER_PATH) {
    if (!fs.existsSync(process.env.BROWSER_PATH)) {
      throw new Error(
        `BROWSER_PATH does not exist: ${process.env.BROWSER_PATH}`,
      );
    }
    return process.env.BROWSER_PATH;
  }

  const {
    PROGRAMFILES,
    "PROGRAMFILES(X86)": PROGRAMFILES_X86,
    LOCALAPPDATA,
  } = process.env;
  const candidates = [
    PROGRAMFILES &&
      path.join(PROGRAMFILES, "Google/Chrome/Application/chrome.exe"),
    PROGRAMFILES_X86 &&
      path.join(PROGRAMFILES_X86, "Google/Chrome/Application/chrome.exe"),
    LOCALAPPDATA &&
      path.join(LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
    PROGRAMFILES_X86 &&
      path.join(PROGRAMFILES_X86, "Microsoft/Edge/Application/msedge.exe"),
    PROGRAMFILES &&
      path.join(PROGRAMFILES, "Microsoft/Edge/Application/msedge.exe"),
    LOCALAPPDATA &&
      path.join(LOCALAPPDATA, "Microsoft/Edge/Application/msedge.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  ].filter(Boolean);

  for (const name of [
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "microsoft-edge",
    "brave-browser",
  ]) {
    for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
      candidates.push(path.join(dir, name), path.join(dir, `${name}.exe`));
    }
  }

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      "No Chrome, Edge or Chromium found. Set BROWSER_PATH to a Chromium-based browser.",
    );
  }
  return found;
}

/** Launch headless Chromium and return its DevTools port. */
async function startBrowser(profileDir) {
  const executable = findBrowser();
  fs.mkdirSync(profileDir, { recursive: true });
  browser = spawn(
    executable,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--enable-unsafe-swiftshader",
      "--window-size=1280,800",
    ],
    {
      stdio: "ignore",
      detached: process.platform !== "win32",
    },
  );

  const portFile = path.join(profileDir, "DevToolsActivePort");
  const deadline = Date.now() + 30000;
  let port;
  while (Date.now() < deadline) {
    if (browser.exitCode !== null) {
      throw new Error(
        `Browser exited during startup (exit ${browser.exitCode}): ${executable}`,
      );
    }
    if (fs.existsSync(portFile)) {
      port = Number(fs.readFileSync(portFile, "utf8").split(/\r?\n/)[0]);
      if (port > 0) break;
    }
    await delay(100);
  }
  if (!port) {
    throw new Error(
      `Timed out waiting for browser DevTools port: ${executable}`,
    );
  }

  await waitForUrl(
    `http://127.0.0.1:${port}/json/version`,
    "browser DevTools",
    15000,
  );
  console.log(`✓ Launched headless browser (${path.basename(executable)})`);
  return port;
}

/** Minimal CDP client over one page target's websocket. */
class Cdp {
  static async connect(url) {
    const cdp = new Cdp();
    cdp.ws = new WebSocket(url);
    cdp.ws.addEventListener("message", (event) => cdp.receive(event.data));
    await new Promise((resolve, reject) => {
      cdp.ws.addEventListener("open", resolve, { once: true });
      cdp.ws.addEventListener(
        "error",
        () => reject(new Error(`CDP connection failed: ${url}`)),
        { once: true },
      );
    });
    return cdp;
  }

  constructor() {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Set();
  }

  on(listener) {
    this.listeners.add(listener);
  }

  receive(raw) {
    const message = JSON.parse(raw);
    if (!message.id) {
      for (const listener of this.listeners) listener(message);
      return;
    }
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    if (message.error) {
      pending.reject(
        new Error(`${message.error.message} (${message.error.code})`),
      );
    } else {
      pending.resolve(message.result);
    }
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

/** Evaluate an expression in the page and return its value. */
async function evaluate(cdp, expression) {
  const { result, exceptionDetails } = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) {
    throw new Error(
      exceptionDetails.exception?.description ?? exceptionDetails.text,
    );
  }
  return result.value;
}

/** Render one demo page, collecting everything that went wrong. */
async function renderItem(browserPort, appUrl, name, screenshotDir) {
  const response = await fetch(
    `http://127.0.0.1:${browserPort}/json/new?about:blank`,
    { method: "PUT" },
  );
  const target = await response.json();
  const cdp = await Cdp.connect(target.webSocketDebuggerUrl);

  const problems = [];
  const requests = new Map();
  cdp.on(({ method, params }) => {
    if (method === "Runtime.exceptionThrown") {
      problems.push(
        `exception: ${params.exceptionDetails.exception?.description ?? params.exceptionDetails.text}`,
      );
    } else if (
      method === "Runtime.consoleAPICalled" &&
      (params.type === "error" || params.type === "assert")
    ) {
      const text = params.args
        .map((arg) => arg.value ?? arg.description ?? arg.type)
        .join(" ");
      problems.push(`console.${params.type}: ${text}`);
    } else if (method === "Log.entryAdded" && params.entry.level === "error") {
      problems.push(`log: ${params.entry.text}`);
    } else if (method === "Network.requestWillBeSent") {
      requests.set(params.requestId, params.request.url);
    } else if (method === "Network.loadingFailed") {
      const url = requests.get(params.requestId) ?? params.requestId;
      if (!url.includes("/favicon.ico")) {
        problems.push(`request failed: ${url} (${params.errorText})`);
      }
    } else if (method === "Network.responseReceived") {
      const { url, status } = params.response;
      if (status >= 400 && !url.includes("/favicon.ico")) {
        problems.push(`HTTP ${status}: ${url}`);
      }
    }
  });

  let visible = null;
  try {
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Log.enable");
    await cdp.send("Network.enable");

    const loaded = new Promise((resolve) => {
      cdp.on((message) => {
        if (message.method === "Page.loadEventFired") resolve();
      });
    });
    await cdp.send("Page.navigate", { url: `${appUrl}/e2e/${name}` });
    await Promise.race([loaded, delay(15000)]);

    // Give effects, animations and image loads time to run, but don't wait on
    // an empty root forever if the page errored before mounting.
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      const mounted = await evaluate(
        cdp,
        `document.querySelector("[data-e2e-root]")?.firstElementChild != null`,
      ).catch(() => false);
      if (mounted) break;
      await delay(250);
    }
    await delay(3000);

    visible = await evaluate(
      cdp,
      `(() => {
        const root = document.querySelector("[data-e2e-root]");
        if (!root) return { ok: false, reason: "missing [data-e2e-root]" };
        const first = root.firstElementChild;
        if (!first) return { ok: false, reason: "root has no element children" };
        const rect = first.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          return {
            ok: false,
            reason: "first child has zero size (" + rect.width + "x" + rect.height + ")",
          };
        }
        return { ok: true };
      })()`,
    );

    const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      path.join(screenshotDir, `${name}.png`),
      Buffer.from(shot.data, "base64"),
    );

    if (!visible.ok) problems.push(`not visible: ${visible.reason}`);
  } catch (error) {
    problems.push(`render failed: ${error.message}`);
  } finally {
    cdp.close();
    await fetch(
      `http://127.0.0.1:${browserPort}/json/close/${target.id}`,
    ).catch(() => {});
  }

  if (problems.length === 0) {
    console.log(`✓ render ${name}`);
    return null;
  }
  console.error(`✗ render ${name}`);
  for (const problem of problems) {
    const line = problem.length > 300 ? `${problem.slice(0, 300)}…` : problem;
    console.error(`  ${line}`);
  }
  return { name, problems };
}

/** Kill a child process and its descendants. */
function stopChild(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    child.once("close", resolve);
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", `${child.pid}`, "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    }
    setTimeout(resolve, 5000);
  });
}

try {
  console.log(`✓ Loaded ${items.length} registry items`);

  await startServer();
  base = `http://127.0.0.1:${server.address().port}`;
  console.log(`✓ Serving public/r at ${base}`);

  // A package.json above the app (often a stray one in the user's home, which
  // contains the Windows temp dir) makes Next.js and Tailwind treat that
  // folder as the project: CSS imports break and no utilities are generated.
  const workDir = path.resolve(process.env.KICKUI_CHECK_DIR ?? os.tmpdir());
  for (let dir = workDir; ; dir = path.dirname(dir)) {
    const stray = path.join(dir, "package.json");
    if (fs.existsSync(stray)) {
      throw new Error(
        `${stray} sits above the test app, so Next.js and Tailwind would treat that folder as the project. Remove it or set KICKUI_CHECK_DIR to a folder with no package.json above it.`,
      );
    }
    if (path.dirname(dir) === dir) break;
  }
  fs.mkdirSync(workDir, { recursive: true });
  tempDir = fs.mkdtempSync(path.join(workDir, "kickui-install-"));
  const appDir = path.join(tempDir, "app");
  console.log(`✓ Scaffolding Next.js app in ${appDir}`);

  await step(
    "create-next-app",
    "npx",
    [
      "-y",
      "create-next-app@latest",
      "app",
      "--ts",
      "--tailwind",
      "--app",
      "--src-dir",
      "--use-npm",
      "--disable-git",
      "--yes",
    ],
    tempDir,
  );

  await step(
    "shadcn init",
    "npx",
    ["-y", "shadcn@latest", "init", "-d", "-y"],
    appDir,
  );

  for (const item of items) {
    await step(
      item.name,
      "npx",
      ["-y", "shadcn@latest", "add", `${base}/r/${item.name}.json`, "-y", "-o"],
      appDir,
    );
  }

  const missing = [];
  for (const item of items) {
    for (const file of item.files) {
      const target = path.join(
        appDir,
        "src/components/ui",
        path.basename(file.path),
      );
      if (!fs.existsSync(target)) missing.push(`${item.name}: ${target}`);
    }
  }
  if (missing.length > 0) {
    missing.forEach((entry) => console.error(`✗ ${entry}`));
    throw new Error(`${missing.length} installed file(s) missing.`);
  }
  console.log(
    `✓ All ${items.length} components installed into src/components/ui`,
  );

  prepareDemos(appDir);

  // The timeframe-tabs demo composes a plain shadcn dropdown menu.
  await step(
    "shadcn add dropdown-menu",
    "npx",
    ["-y", "shadcn@latest", "add", "dropdown-menu", "-y", "-o"],
    appDir,
  );

  await step("next build", "npx", ["next", "build"], appDir);

  const appUrl = await startApp(appDir);
  const browserPort = await startBrowser(path.join(tempDir, "browser-profile"));

  const screenshotDir = path.join(tempDir, "screenshots");
  fs.mkdirSync(screenshotDir, { recursive: true });

  const failures = [];
  for (const item of items) {
    const failure = await renderItem(
      browserPort,
      appUrl,
      item.name,
      screenshotDir,
    );
    if (failure) failures.push(failure);
  }

  if (failures.length > 0) {
    throw new Error(
      `${failures.length} of ${items.length} components failed to render: ${failures
        .map((failure) => failure.name)
        .join(", ")}.`,
    );
  }

  console.log(
    `✓ Install check passed (${items.length} components + build + browser render)`,
  );
} catch (error) {
  if (!error.reported)
    console.error(`✗ Install check failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await stopChild(browser);
  await stopChild(nextServer);
  if (server) {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
  if (tempDir) {
    if (keep) {
      console.log(`✓ Kept temp app at ${tempDir}`);
      console.log(`✓ Screenshots in ${path.join(tempDir, "screenshots")}`);
    } else {
      fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 3 });
    }
  }
}
