import type { Diagnostic, FixRecord } from "../../core/types";
import type { SequenceDiagramDocument } from "./types";

export class SequenceDiagram {
  static fromJson(input: SequenceDiagramDocument) {
    if (input.participants.length === 0 || input.messages.length === 0) {
      throw new Error("INVALID_JSON_SHAPE");
    }

    const lines = ["sequenceDiagram"];

    for (const participant of input.participants) {
      lines.push(
        participant.label
          ? `participant ${participant.id} as "${escapeSequenceLabel(participant.label)}"`
          : `participant ${participant.id}`
      );
    }

    for (const message of input.messages) {
      lines.push(
        `${message.from}->>${message.to}: ${escapeSequenceLabel(message.text)}`
      );
    }

    return lines.join("\n");
  }

  static normalizeMermaid(input: string) {
    const next = input
      .split("\n")
      .map((line) => {
        const quoted = quoteSequenceAliasLabel(line);
        return escapeSequenceMessageSemicolons(quoted);
      })
      .join("\n");

    const fixes: FixRecord[] = [];

    if (
      input.split("\n").some((line, index) => {
        const after = next.split("\n")[index];
        return quoteSequenceAliasLabel(line) !== line && after !== line;
      })
    ) {
      fixes.push({
        code: "QUOTE_SEQUENCE_ALIAS_LABEL",
        description:
          "Quoted sequence alias labels with Mermaid-breaking punctuation.",
        changed: true,
      });
    }

    if (
      input.split("\n").some((line, index) => {
        const after = next.split("\n")[index];
        return escapeSequenceMessageSemicolons(line) !== line && after !== line;
      })
    ) {
      fixes.push({
        code: "ESCAPE_SEQUENCE_SEMICOLONS",
        description: "Escaped semicolons inside sequence message bodies.",
        changed: true,
      });
    }

    return {
      text: next,
      fixes,
    };
  }

  static validateMermaid(input: string): Diagnostic[] {
    const lines = input.split("\n").map((line) => line.trim());
    const hasHeader = lines[0] === "sequenceDiagram";
    if (!hasHeader) {
      return [
        {
          code: "MISSING_HEADER",
          message: "Sequence diagrams must start with `sequenceDiagram`.",
        },
      ];
    }

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
}

function escapeSequenceLabel(label: string) {
  return label.replaceAll('"', '\\"');
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
