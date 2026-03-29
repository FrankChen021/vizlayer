import { ClassDiagram } from "../diagrams/class/impl";
import { Flowchart } from "../diagrams/flowchart/impl";
import { SequenceDiagram } from "../diagrams/sequence/impl";
import { detectKind, preprocessInput } from "./normalize";
import type { Diagnostic, ValidateResult, VisualizationKind } from "./types";

export function validate(input: string): ValidateResult {
  const preprocessed = preprocessInput(input);
  const kind = detectKind(preprocessed.text);
  const diagnostics = buildDiagnostics(preprocessed.text, kind);

  return {
    ok: diagnostics.length === 0,
    kind,
    diagnostics,
  };
}

function buildDiagnostics(
  input: string,
  kind: VisualizationKind
): Diagnostic[] {
  if (input.length === 0) {
    return [
      {
        code: "EMPTY_INPUT",
        message: "Input is empty after preprocessing.",
      },
    ];
  }

  if (kind === "unknown") {
    return [
      {
        code: "UNKNOWN_KIND",
        message: "Could not detect a supported Mermaid header.",
      },
    ];
  }

  if (kind === "sequence") {
    return SequenceDiagram.validateMermaid(input);
  }

  if (kind === "class") {
    return ClassDiagram.validateMermaid(input);
  }

  return Flowchart.validateMermaid(input);
}
