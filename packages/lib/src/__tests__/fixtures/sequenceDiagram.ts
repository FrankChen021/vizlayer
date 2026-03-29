import type { SequenceDiagramDocument } from "../../diagrams/sequenceDiagram/types";

export const brokenSequenceAlias = {
  input: `sequenceDiagram
participant api as API(service/v1)
User->>api: fetch data; retry if stale`,
  expectedMermaid: `sequenceDiagram
participant api as "API(service/v1)"
User->>api: fetch data#59; retry if stale`,
};

export const sequenceDiagramDocument: SequenceDiagramDocument = {
  participants: [
    { id: "user", label: "User" },
    { id: "engine", label: "Vizlayer Engine" },
  ],
  messages: [
    { from: "user", to: "engine", text: "generate diagram" },
    { from: "engine", to: "user", text: "return mermaid" },
  ],
};
