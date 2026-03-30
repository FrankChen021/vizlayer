# @vizlayer/core

`@vizlayer/core` provides the core Vizlayer APIs for typed diagram payloads, Mermaid generation, validation, repair, and streaming-friendly JSON parsing.

## Install

```bash
pnpm add @vizlayer/core
```

## Usage

```ts
import { Flowchart, Vizlayer } from "@vizlayer/core";

const payload = {
  kind: "flowchart",
  document: {
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
  },
} as const;

const chart = Flowchart.fromJson(payload.document);
const parsed = Vizlayer.parse(JSON.stringify(payload));
const validation = Vizlayer.validate(chart);
const repaired = Vizlayer.repair(chart);

console.log(parsed.ok, validation.ok, Vizlayer.explain(repaired));
```

### Streaming example

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

  console.log(parsed.spec);
  break;
}
```

## Docs

- Repository: [github.com/FrankChen021/vizlayer](https://github.com/FrankChen021/vizlayer)
- Flowchart reference: [skills/reference/flowchart.md](https://github.com/FrankChen021/vizlayer/blob/main/skills/reference/flowchart.md)
- Sequence diagram reference: [skills/reference/sequence-diagram.md](https://github.com/FrankChen021/vizlayer/blob/main/skills/reference/sequence-diagram.md)
- Class diagram reference: [skills/reference/class-diagram.md](https://github.com/FrankChen021/vizlayer/blob/main/skills/reference/class-diagram.md)

## License

Apache-2.0
