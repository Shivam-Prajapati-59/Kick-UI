"use client";

import React, { useState, type ReactNode } from "react";
import CodeBlock from "./CodeBlock";
import { Copy, Terminal } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ICON_STYLE: React.CSSProperties = { fontSize: "50px" };

interface Method {
  key: string;
  icon: ReactNode;
  label: string;
}

const METHODS: Method[] = [
  { key: "manual", icon: <Copy style={ICON_STYLE} />, label: "Manual" },
  { key: "cli", icon: <Terminal style={ICON_STYLE} />, label: "CLI" },
];

interface Variant {
  code: string;
  label: string;
}

const SHADCN_VARIANTS: Variant[] = [
  { code: "JS-CSS", label: "JavaScript + Plain CSS" },
  { code: "JS-TW", label: "JavaScript + Tailwind" },
  { code: "TS-CSS", label: "TypeScript + Plain CSS" },
  { code: "TS-TW", label: "TypeScript + Tailwind" },
];

const JSREPO_VARIANTS: Variant[] = [
  { code: "default", label: "JavaScript + Plain CSS" },
  { code: "tailwind", label: "JavaScript + Tailwind" },
  { code: "ts/default", label: "TypeScript + Plain CSS" },
  { code: "ts/tailwind", label: "TypeScript + Tailwind" },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

interface VariantListProps {
  label: string;
  variants: Variant[];
}

const VariantList = ({ label, variants }: VariantListProps) => (
  <>
    <p className="docs-paragraph short">{label}</p>
    <ul className="docs-list">
      {variants.map(({ code, label: desc }) => (
        <li key={code} className="docs-list-item">
          <span className="docs-highlight">{code}</span> - {desc}
        </li>
      ))}
    </ul>
  </>
);

interface MethodSelectorProps {
  methods: Method[];
  selected: string;
  onSelect: (key: string) => void;
}

const MethodSelector = ({ methods, selected, onSelect }: MethodSelectorProps) => (
  <div className="flex gap-4 my-6">
    {methods.map((method) => (
      <button
        key={method.key}
        onClick={() => onSelect(method.key)}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-8 py-6 transition-all duration-200 cursor-pointer ${
          selected === method.key
            ? "border-primary bg-primary/10 text-foreground"
            : "border-border bg-card text-muted-foreground hover:border-primary/50"
        }`}
      >
        {method.icon}
        <span className="text-sm font-medium">{method.label}</span>
      </button>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Manual Steps                                                       */
/* ------------------------------------------------------------------ */

const ManualSteps = () => (
  <>
    <p className="docs-paragraph dim">
      Follow these steps to manually install components:
    </p>

    <h4 className="docs-category-subtitle">1. Pick a component</h4>
    <p className="docs-paragraph">
      Preview components and find something you like, then head to the{" "}
      <span className="docs-highlight">Code</span> tab.
    </p>

    <h4 className="docs-category-subtitle">2. Install dependencies</h4>
    <p className="docs-paragraph short">
      Components may use external libraries, don&apos;t forget to install them
      by selecting <span className="docs-highlight">Manual</span>, copying the
      command, and running it in your terminal.
    </p>
    <CodeBlock showLineNumbers>npm install gsap</CodeBlock>

    <h4 className="docs-category-subtitle">3. Copy the code</h4>
    <p className="docs-paragraph short">
      The <span className="docs-highlight">Code</span> tab also contains all
      the code you need to copy — you can use the controls to switch between
      technologies on the Code tab.
    </p>

    <h4 className="docs-category-subtitle">4. Use the component</h4>
    <p className="docs-paragraph short">
      A basic usage example is provided for every component, and if you want to
      go into details, you can check all the available props on the{" "}
      <span className="docs-highlight">Preview</span> tab.
    </p>
    <CodeBlock showLineNumbers>
      {`import SplitText from "./SplitText";

<SplitText
  text="Hello, you!"
  delay={100}
  duration={0.6}
/>`}
    </CodeBlock>
  </>
);

/* ------------------------------------------------------------------ */
/*  CLI Steps                                                          */
/* ------------------------------------------------------------------ */

const CliSteps = () => (
  <>
    <p className="docs-paragraph dim">
      Use a one-time command to pull any component directly into your project.
    </p>

    <p className="docs-paragraph">
      Kick UI supports two CLI installation methods:{" "}
      <a
        style={{ textDecoration: "underline" }}
        href="https://ui.shadcn.com/"
        target="_blank"
        rel="noreferrer"
      >
        shadcn
      </a>{" "}
      and{" "}
      <a
        style={{ textDecoration: "underline" }}
        href="https://jsrepo.dev/"
        target="_blank"
        rel="noreferrer"
      >
        jsrepo
      </a>
      . Pick whichever you prefer – they both fetch the same component source.
    </p>

    <h4 className="docs-category-subtitle">Installation</h4>
    <p className="docs-paragraph short">
      Below are example commands for the SplitText component. Replace
      placeholders to fit your stack.
    </p>

    <h4
      className="docs-category-subtitle docs-highlight"
      style={{ marginTop: "1.25rem" }}
    >
      shadcn
    </h4>
    <p className="docs-paragraph short"></p>
    <CodeBlock>{`npx shadcn@latest add https://reactbits.dev/r/<Component>-<LANG>-<STYLE>`}</CodeBlock>
    <VariantList
      label="<LANGUAGE> + <STYLE> combinations:"
      variants={SHADCN_VARIANTS}
    />

    <h4
      className="docs-category-subtitle docs-highlight"
      style={{ marginTop: "1.25rem" }}
    >
      jsrepo
    </h4>
    <p className="docs-paragraph short"></p>
    <CodeBlock>{`npx jsrepo@latest add https://reactbits.dev/r/<Component>-<LANG>-<STYLE>`}</CodeBlock>
    <VariantList label="<VARIANT> options:" variants={JSREPO_VARIANTS} />

    <p className="docs-paragraph dim" style={{ marginTop: "1rem" }}>
      Tip: You can run these with other package managers (pnpm, yarn, bun) –
      just swap the prefix (e.g. <code>pnpm dlx</code> or <code>yarn</code>{" "}
      instead of <code>npx</code>).
    </p>
  </>
);

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const Installation = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("manual");

  return (
    <section className="docs-section">
      <h3 className="docs-category-title">Installation</h3>

      <p className="docs-paragraph dim">
        Using components is very straightforward, anyone can do it.
      </p>

      <hr className="docs-separator" />

      <h3 className="docs-category-title">Pick The Method</h3>

      <p className="docs-paragraph">
        You can keep it simple and copy code directly from the documentation, or
        you can use CLI commands to install components into your project.
      </p>

      <p className="docs-paragraph dim">
        Click the cards below to change your preferred method.
      </p>

      <MethodSelector
        methods={METHODS}
        selected={selectedMethod}
        onSelect={setSelectedMethod}
      />

      <h3 className="docs-category-title">Steps</h3>

      {selectedMethod === "manual" ? <ManualSteps /> : <CliSteps />}

      <hr className="docs-separator" />

      <h4 className="docs-category-subtitle">That&apos;s all!</h4>

      <p className="docs-paragraph">
        From here on, it&apos;s all about how you integrate the component into
        your project. The code is yours to play around with – modify styling,
        functionalities, anything goes!
      </p>
    </section>
  );
};

export default Installation;
