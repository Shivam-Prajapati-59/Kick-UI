"use client";

import React from "react";
import CodeBlock from "./CodeBlock";

const Installation = () => {
  return (
    <section className="docs-section">
      <h3 className="docs-category-title">Installation</h3>

      <p className="docs-paragraph dim">
        Components are available via the shadcn CLI registry. Add any component
        directly into your project with a single command.
      </p>

      <hr className="docs-separator" />

      <h3 className="docs-category-title">CLI Installation</h3>

      <p className="docs-paragraph">
        Use the shadcn CLI to install components. Each component page has its own
        install command, or you can browse the full registry.
      </p>

      <h4 className="docs-category-subtitle">Single component</h4>
      <CodeBlock>{`npx shadcn@latest add https://kick-ui.vercel.app/r/shiny-button.json`}</CodeBlock>

      <h4 className="docs-category-subtitle">Full registry</h4>
      <CodeBlock>{`npx shadcn@latest add https://kick-ui.vercel.app/r/registry.json`}</CodeBlock>

      <p className="docs-paragraph dim" style={{ marginTop: "1rem" }}>
        You can also use other package managers — just swap the prefix:{" "}
        <code>bunx shadcn@latest add</code>,{" "}
        <code>pnpm dlx shadcn@latest add</code>, or{" "}
        <code>yarn dlx shadcn@latest add</code>.
      </p>

      <hr className="docs-separator" />

      <h3 className="docs-category-title">Manual Installation</h3>

      <p className="docs-paragraph">
        Open any component&apos;s page, click the <strong>Code</strong> tab, and copy
        the source. Install the listed dependencies first via your package manager.
      </p>

      <hr className="docs-separator" />

      <h4 className="docs-category-subtitle">That&apos;s all!</h4>

      <p className="docs-paragraph">
        The code is yours to modify — tweak the styling, adjust animations, or
        extend functionality as needed.
      </p>
    </section>
  );
};

export default Installation;
