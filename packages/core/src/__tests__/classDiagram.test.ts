import { describe, expect, it } from "vitest";
import { ClassDiagram, validate } from "../index";
import type { ClassDiagramDocument } from "../diagrams/classDiagram/types";

const classDiagramDocument: ClassDiagramDocument = {
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

describe("classDiagram", () => {
  it("renders from structured JSON", () => {
    const result = ClassDiagram.fromJson(classDiagramDocument);

    expect(result).toContain("classDiagram");
    expect(result).toContain("class PromptSpec {");
    expect(result).toContain("PromptSpec --> DiagramArtifact : produces");
  });

  it("validates rendered Mermaid", () => {
    expect(validate(ClassDiagram.fromJson(classDiagramDocument)).ok).toBe(true);
  });

  it("returns a class-specific diagnostic code for empty diagrams", () => {
    const result = validate("classDiagram");

    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]?.code).toBe("MISSING_CLASS_CONTENT");
  });
});
