import {
  detectKind,
  normalizeMermaidChart,
  preprocessInput,
} from "./normalize";
import { validate } from "./validate";
import type { RepairResult, ResidualError } from "../types/results";

/**
 * Repair pipeline
 *
 * input -> preprocess -> detect kind -> normalize known syntax hazards -> validate
 *      -> success with fixes or failure with residuals
 */
export function repair(input: string): RepairResult {
  const preprocessed = preprocessInput(input);
  const kind = detectKind(preprocessed.text);
  const normalized = normalizeMermaidChart(preprocessed.text, kind);
  const validation = validate(normalized.text);

  if (validation.ok) {
    return {
      ok: true,
      mermaid: normalized.text,
      kind: validation.kind,
      fixes: [...preprocessed.fixes, ...normalized.fixes],
      residuals: [],
    };
  }

  return {
    ok: false,
    mermaid: normalized.text,
    kind: validation.kind,
    fixes: [...preprocessed.fixes, ...normalized.fixes],
    residuals: validation.diagnostics.map(toResidual),
  };
}

function toResidual(diagnostic: {
  code: ResidualError["code"];
  message: string;
}): ResidualError {
  return {
    code: diagnostic.code,
    message: diagnostic.message,
    phase: "final-validate",
  };
}
