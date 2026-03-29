import type { ClassDiagramDocument } from "../../diagrams/classDiagram/types";

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
