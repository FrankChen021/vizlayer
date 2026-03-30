# @vizlayer/react

`@vizlayer/react` provides React components for rendering Vizlayer payloads and Mermaid charts.

## Install

```bash
pnpm add @vizlayer/react
```

## Usage

```tsx
import { VizlayerDiagram } from "@vizlayer/react";

export function App() {
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

## Docs

- Repository: [github.com/FrankChen021/vizlayer](https://github.com/FrankChen021/vizlayer)
- Root README: [README.md](https://github.com/FrankChen021/vizlayer/blob/main/README.md)
- Publishing guide: [docs/dev/README.md](https://github.com/FrankChen021/vizlayer/blob/main/docs/dev/README.md)

## License

Apache-2.0
