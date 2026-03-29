import type { FixRecord, VisualizationKind } from "../types/results";

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
  const firstMeaningfulLine = input
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

  return "unknown";
}

export function normalizeMermaidChart(input: string, kind: VisualizationKind) {
  let next = input;
  const fixes: FixRecord[] = [];

  if (kind === "sequence") {
    next = input
      .split("\n")
      .map((line) => {
        const quoted = quoteSequenceAliasLabel(line);
        return escapeSequenceMessageSemicolons(quoted);
      })
      .join("\n");
  }

  if (next !== input) {
    const before = input.split("\n");
    const after = next.split("\n");

    if (
      before.some(
        (line, index) =>
          quoteSequenceAliasLabel(line) !== line && after[index] !== line
      )
    ) {
      fixes.push({
        code: "QUOTE_SEQUENCE_ALIAS_LABEL",
        description:
          "Quoted sequence alias labels with Mermaid-breaking punctuation.",
        changed: true,
      });
    }

    if (
      before.some(
        (line, index) =>
          escapeSequenceMessageSemicolons(line) !== line &&
          after[index] !== line
      )
    ) {
      fixes.push({
        code: "ESCAPE_SEQUENCE_SEMICOLONS",
        description: "Escaped semicolons inside sequence message bodies.",
        changed: true,
      });
    }
  }

  return {
    text: next,
    fixes,
  };
}

function unwrapMarkdownFence(input: string) {
  const match = input.match(/^```(?:mermaid)?\n([\s\S]*?)\n```$/i);
  return match ? match[1] : input;
}

function quoteSequenceAliasLabel(line: string) {
  const match = line.match(/^(\s*(?:actor|participant)\s+\S+\s+as\s+)(.+)$/);
  if (!match) {
    return line;
  }

  const [, prefix, label] = match;
  const trimmedLabel = label.trim();
  if (
    trimmedLabel.length === 0 ||
    (trimmedLabel.startsWith('"') && trimmedLabel.endsWith('"')) ||
    !/[()/:;]/.test(trimmedLabel)
  ) {
    return line;
  }

  return `${prefix}"${trimmedLabel.replaceAll('"', '\\"')}"`;
}

function escapeSequenceMessageSemicolons(line: string) {
  if (!/(->>|-->>|->|-->|-x|--x)/.test(line)) {
    return line;
  }

  const colonIndex = line.indexOf(":");
  if (colonIndex === -1) {
    return line;
  }

  const prefix = line.slice(0, colonIndex + 1);
  const body = line.slice(colonIndex + 1);
  if (!body.includes(";")) {
    return line;
  }

  return `${prefix}${body.replace(/(?<!#59);/g, "#59;")}`;
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
