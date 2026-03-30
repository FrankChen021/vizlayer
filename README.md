# Vizlayer

## Introduction

Vizlayer is a type-safe visualization toolkit for AI systems that turns structured JSON into **100%** syntax-correct Mermaid diagrams, works extremely well with streaming LLM output, and frees you from repeatedly fixing the Mermaid syntax errors that LLMs often produce.

## Packages & Skills

Vizlayer is organized as a small TypeScript workspace with one core library, one React wrapper, and one authoring skill:

- `@vizlayer/core`: the runtime for typed Vizlayer payloads, Mermaid generation, parsing, validation, repair, and diagnostics
- `@vizlayer/react`: React components for rendering Vizlayer payloads and Mermaid charts in UI flows
- `skills/SKILL.md`: an agent skill that guides LLMs to emit valid Vizlayer payloads for supported diagram families

## Usage

### Install

```bash
pnpm add @vizlayer/core
pnpm add @vizlayer/react
```

### Parse LLM output into a Vizlayer payload

```ts
import { Vizlayer } from "@vizlayer/core";

const response = `{
  "kind": "flowchart",
  "document": {
    "title": "Request pipeline",
    "direction": "LR",
    "nodes": [
      { "id": "request", "label": "Request" },
      { "id": "router", "label": "Router" },
      { "id": "worker", "label": "Worker" }
    ],
    "edges": [
      { "from": "request", "to": "router" },
      { "from": "router", "to": "worker" }
    ]
  }
}`;

const parsed = Vizlayer.parse(response);

if (!parsed.ok) {
  throw new Error(parsed.error);
}

console.log(parsed.spec.kind);
```

### Parse streaming LLM output safely

`Vizlayer.parse()` is streaming-friendly: if the JSON object is still incomplete, it returns a clear `"Diagram is incomplete. Maybe it's still streaming?"` error instead of failing early with a generic JSON parse error.

```ts
import { Vizlayer } from "@vizlayer/core";

let streamed = "";

for await (const chunk of streamFromYourModel()) {
  streamed += chunk;

  const parsed = Vizlayer.parse(streamed);
  if (!parsed.ok) {
    if (parsed.error === "Diagram is incomplete. Maybe it's still streaming?") {
      continue;
    }

    throw new Error(parsed.error);
  }

  console.log("Vizlayer spec is complete:", parsed.spec);
  break;
}
```

### Render a payload in React with `@vizlayer/react`

```tsx
import { VizlayerDiagram } from "@vizlayer/react";

export function DiagramPreview() {
  return (
    <VizlayerDiagram
      kind="flowchart"
      document={{
        title: "Request pipeline",
        direction: "LR",
        nodes: [
          { id: "request", label: "Request" },
          { id: "router", label: "Router" },
          { id: "worker", label: "Worker" },
        ],
        edges: [
          { from: "request", to: "router" },
          { from: "router", to: "worker" },
        ],
      }}
    />
  );
}
```

### Render Vizlayer blocks with `react-markdown`

```tsx
import { Vizlayer } from "@vizlayer/core";
import { VizlayerDiagram } from "@vizlayer/react";
import ReactMarkdown from "react-markdown";

const markdown = `
\`\`\`vizlayer
{
  "kind": "flowchart",
  "document": {
    "direction": "LR",
    "nodes": [
      { "id": "request", "label": "Request" },
      { "id": "worker", "label": "Worker" }
    ],
    "edges": [{ "from": "request", "to": "worker" }]
  }
}
\`\`\`
`;

export function MarkdownWithVizlayer() {
  return (
    <ReactMarkdown
      components={{
        code(props) {
          const language = props.className?.replace("language-", "");
          const content = String(props.children).trim();

          if (language !== "vizlayer") {
            return <code>{props.children}</code>;
          }

          const parsed = Vizlayer.parse(content);
          if (!parsed.ok) {
            return <pre>{parsed.error}</pre>;
          }

          return <VizlayerDiagram {...parsed.spec} />;
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
```

### Use the bundled skill with an LLM

Load `skills/SKILL.md` into your agent or system prompt so the model returns Vizlayer JSON instead of handwritten Mermaid. Then parse the model output with `Vizlayer`, render it with `@vizlayer/react`, or convert it to Mermaid with `@vizlayer/core`.

```ts
import { readFileSync } from "node:fs";
import { Vizlayer } from "@vizlayer/core";

const skill = readFileSync("skills/SKILL.md", "utf8");

const messages = [
  {
    role: "system",
    content: `You generate diagrams as Vizlayer JSON.\n\n${skill}`,
  },
  {
    role: "user",
    content: "Show the request pipeline as a flowchart.",
  },
];

const responseText = await callYourModel(messages);
const parsed = Vizlayer.parse(responseText);

if (!parsed.ok) {
  throw new Error(parsed.error);
}

console.log(parsed.spec);
```

## Build

Install dependencies from the repository root:

```bash
pnpm install
```

Build all workspace packages and the demo app:

```bash
pnpm build
```

Build only the published libraries:

```bash
pnpm --filter @vizlayer/core build
pnpm --filter @vizlayer/react build
```

Build artifacts are written to `packages/core/dist` and `packages/react/dist`.

## Docs

- [Publishing guide](docs/dev/README.md)
- [Flowchart reference](skills/reference/flowchart.md)
- [Sequence diagram reference](skills/reference/sequence-diagram.md)
- [Class diagram reference](skills/reference/class-diagram.md)
- [Vizlayer skill](skills/SKILL.md)

## LICENSE

Vizlayer is licensed under the [Apache License 2.0](LICENSE).
