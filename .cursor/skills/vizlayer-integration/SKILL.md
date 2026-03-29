---
name: vizlayer-integration
description: Integrate Vizlayer into AI products using the right package boundary and rendering path. Use when adding Vizlayer to a React app, wiring AI-generated diagram JSON to UI, or choosing between @vizlayer/lib and @vizlayer/react.
---

# Vizlayer Integration

Use this skill when the user wants to add Vizlayer to an AI application, chat product, coding agent UI, or internal tool.

## Package Choice

Choose the package by runtime:

- Use `@vizlayer/react` for React apps that need immediate rendering.
- Use `@vizlayer/lib` for server logic, agent logic, validation, repair, or non-React environments.
- It is normal to use both: `@vizlayer/lib` in generation/validation code and `@vizlayer/react` in the UI.

## Preferred React API

For JSON-driven rendering, prefer one public component:

```tsx
import { VizlayerDiagram } from "@vizlayer/react";

<VizlayerDiagram kind="flowchart" document={document} />;
```

Supported `kind` values:

- `"flowchart"`
- `"sequence"`
- `"class"`

## Integration Workflow

1. Decide whether the AI should emit Vizlayer JSON directly or emit Mermaid.
2. Prefer Vizlayer JSON when the AI is describing structure.
3. Validate or normalize Mermaid only when raw Mermaid is unavoidable.
4. Render JSON with `VizlayerDiagram`.
5. Keep JSON generation in the agent layer and rendering in the UI layer.

## Recommended Architecture

### AI Layer

- Convert user intent into a `kind` and `document`.
- Keep the generated payload small and schema-valid.
- If raw Mermaid enters the system, use `repair()` and `validate()` from `@vizlayer/lib`.

### UI Layer

- Render the chosen `kind` and `document` through `VizlayerDiagram`.
- Use `MermaidDiagram` only when you already have Mermaid text.
- Provide an error fallback for invalid or incomplete AI output.

## React Example

```tsx
import { useMemo } from "react";
import { VizlayerDiagram } from "@vizlayer/react";

export function DiagramPanel({ response }) {
  const diagram = useMemo(() => response.diagram, [response.diagram]);

  if (!diagram) {
    return <div>No diagram yet.</div>;
  }

  return (
    <VizlayerDiagram
      kind={diagram.kind}
      document={diagram.document}
      invalidDocumentFallback={(message) => <div>{message}</div>}
    />
  );
}
```

## Raw Mermaid Example

```tsx
import { MermaidDiagram } from "@vizlayer/react";

<MermaidDiagram chart={result.mermaid} />;
```

## Lib Example

```ts
import { Flowchart, repair, validate } from "@vizlayer/lib";

const mermaid = Flowchart.fromJson(flowchartDocument);
const checked = validate(mermaid);
const repaired = repair(rawMermaid);
```

## Guardrails

- Do not mix rendering concerns into `@vizlayer/lib`.
- Do not invent unsupported diagram kinds.
- Do not expose custom JSON fields unless the local app has extended the schema intentionally.
- If an AI response is ambiguous, choose the kind explicitly before generating code.

## Additional Resources

- For implementation examples, see [examples.md](examples.md)
