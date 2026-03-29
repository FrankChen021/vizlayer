import type { RepairResult } from "../types/results";

export function explain(result: RepairResult) {
  if (result.ok && result.fixes.length === 0) {
    return "The input was already valid Mermaid. No repairs were needed.";
  }

  const lines: string[] = [];

  if (result.fixes.length > 0) {
    lines.push("Vizlayer applied these repairs:");
    for (const fix of result.fixes) {
      lines.push(`- ${fix.description}`);
    }
  }

  if (result.residuals.length > 0) {
    lines.push("Remaining issues:");
    for (const residual of result.residuals) {
      lines.push(`- [${residual.code}] ${residual.message}`);
    }
  }

  if (lines.length === 0) {
    return "No explanation available.";
  }

  return lines.join("\n");
}
