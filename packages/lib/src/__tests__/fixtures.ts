import type { FlowchartDocument } from "../diagrams/flowchart/types";

export const brokenSequenceAlias = {
  input: `sequenceDiagram
participant api as API(service/v1)
User->>api: fetch data; retry if stale`,
  expectedMermaid: `sequenceDiagram
participant api as "API(service/v1)"
User->>api: fetch data#59; retry if stale`,
};

export const flowchartDocument: FlowchartDocument = {
  title: "Basic flow",
  direction: "LR",
  nodes: [
    { id: "user", label: "User" },
    { id: "engine", label: "Vizlayer Engine" },
    { id: "view", label: "Rendered View" },
  ],
  edges: [
    { from: "user", to: "engine", label: "send spec" },
    { from: "engine", to: "view", label: "emit mermaid" },
  ],
};
