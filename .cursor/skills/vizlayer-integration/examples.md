# Vizlayer Integration Examples

## AI Response Shape

A practical response shape for AI systems:

```json
{
  "diagram": {
    "kind": "flowchart",
    "document": {
      "direction": "LR",
      "nodes": [
        { "id": "user", "label": "User" },
        { "id": "engine", "label": "Vizlayer" }
      ],
      "edges": [{ "from": "user", "to": "engine", "label": "request diagram" }]
    }
  }
}
```

## React Consumer

```tsx
import { VizlayerDiagram } from "@vizlayer/react";

export function MessageDiagram({ diagram }) {
  if (!diagram) {
    return null;
  }

  return (
    <VizlayerDiagram
      kind={diagram.kind}
      document={diagram.document}
      loadingFallback={<div>Rendering diagram...</div>}
      invalidDocumentFallback={(message) => <div>{message}</div>}
    />
  );
}
```

## Repair Pipeline

Use the lib when an LLM returns Mermaid directly:

```ts
import { explain, repair, validate } from "@vizlayer/lib";

const validation = validate(rawMermaid);
const result = repair(rawMermaid);
const explanation = explain(result);
```

## When To Prefer JSON

Prefer Vizlayer JSON when:

- the AI is generating diagrams from natural language
- you need stronger structure than Mermaid text
- you want UI code to stay stable while diagram content changes

Prefer raw Mermaid only when:

- the upstream system already stores Mermaid
- the user is editing Mermaid manually
- you are demonstrating Mermaid repair behavior
