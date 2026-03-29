import type { FixRecord, VisualizationKind } from "./types";

export function preprocessInput(input: string) {
  let next = input;
  const fixes: FixRecord[] = [];

  const unwrapped = unwrapMarkdownFence(next);
  next = recordFix(
    fixes,
    "UNWRAP_MARKDOWN_FENCE",
    "Removed markdown code fences.",
    next,
    unwrapped
  );

  const normalized = next.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  next = recordFix(
    fixes,
    "NORMALIZE_LINE_ENDINGS",
    "Normalized line endings to LF.",
    next,
    normalized
  );

  return {
    text: next.trim(),
    fixes,
  };
}

export function detectKind(input: string): VisualizationKind {
  const firstMeaningfulLine = stripMermaidFrontmatter(input)
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("%%"));

  if (!firstMeaningfulLine) {
    return "unknown";
  }

  if (
    firstMeaningfulLine.startsWith("flowchart") ||
    firstMeaningfulLine.startsWith("graph ")
  ) {
    return "flowchart";
  }

  if (firstMeaningfulLine.startsWith("sequenceDiagram")) {
    return "sequence";
  }

  if (firstMeaningfulLine.startsWith("classDiagram")) {
    return "class";
  }

  return "unknown";
}

export function stripMermaidFrontmatter(input: string) {
  const lines = input.split("\n");
  if (lines[0]?.trim() !== "---") {
    return input;
  }

  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index]?.trim() === "---") {
      return lines
        .slice(index + 1)
        .join("\n")
        .trimStart();
    }
  }

  return input;
}

function unwrapMarkdownFence(input: string) {
  const match = input.match(/^```(?:mermaid)?\n([\s\S]*?)\n```$/i);
  return match ? match[1] : input;
}

function recordFix(
  fixes: FixRecord[],
  code: FixRecord["code"],
  description: string,
  before: string,
  after: string
) {
  if (before !== after) {
    fixes.push({
      code,
      description,
      changed: true,
    });
  }

  return after;
}
