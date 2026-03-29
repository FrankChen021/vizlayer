import type { FlowchartDocument } from "../diagrams/flowchart/types";
import type { ClassDiagramDocument } from "../diagrams/class/types";
import type { SequenceDiagramDocument } from "../diagrams/sequence/types";

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

export const sequenceDocument: SequenceDiagramDocument = {
  participants: [
    { id: "user", label: "User" },
    { id: "engine", label: "Vizlayer Engine" },
  ],
  messages: [
    { from: "user", to: "engine", text: "generate diagram" },
    { from: "engine", to: "user", text: "return mermaid" },
  ],
};

export const classDiagramDocument: ClassDiagramDocument = {
  classes: [
    {
      id: "PromptSpec",
      members: [
        { name: "id", type: "string" },
        { name: "content", type: "string" },
      ],
    },
    {
      id: "DiagramArtifact",
      members: [{ name: "mermaid", type: "string" }],
    },
  ],
  relations: [{ from: "PromptSpec", to: "DiagramArtifact", label: "produces" }],
};
