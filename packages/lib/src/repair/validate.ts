import { detectKind, preprocessInput } from "./normalize";
import type {
  Diagnostic,
  ValidateResult,
  VisualizationKind,
} from "../types/results";

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
    const lines = input.split("\n").map((line) => line.trim());
    const hasInteraction = lines.some((line) =>
      /(->>|-->>|->|-->|-x|--x)/.test(line)
    );

    if (!hasInteraction) {
      return [
        {
          code: "MISSING_SEQUENCE_INTERACTION",
          message: "Sequence diagrams must contain at least one interaction.",
        },
      ];
    }

    return [];
  }

  const hasHeader = input.startsWith("flowchart") || input.startsWith("graph ");
  if (!hasHeader) {
    return [
      {
        code: "MISSING_HEADER",
        message: "Flowcharts must start with `flowchart` or `graph`.",
      },
    ];
  }

  const hasBody = input
    .split("\n")
    .slice(1)
    .some((line) => line.trim().length > 0);
  if (!hasBody) {
    return [
      {
        code: "MISSING_FLOW_CONTENT",
        message: "Flowcharts must include at least one node or edge.",
      },
    ];
  }

  return [];
}
