"use client";

import { useEffect } from "react";

/** Keep an iframe preview in the same visual theme without reloading it. */
export function PreviewThemeSync() {
  useEffect(() => {
    if (window.parent === window) return;

    const sendReady = () => {
      window.parent.postMessage(
        { type: "kickui:preview-ready" },
        window.location.origin,
      );
    };

    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent
      ) return;

      if (event.data?.type === "kickui:request-preview-ready") {
        sendReady();
        return;
      }
      if (event.data?.type !== "kickui:preview-theme") return;

      const theme = event.data.theme;
      if (theme !== "light" && theme !== "dark") return;
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
    };

    window.addEventListener("message", handleMessage);
    sendReady();
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
