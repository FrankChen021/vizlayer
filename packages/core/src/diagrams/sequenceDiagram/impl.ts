import { stripMermaidFrontmatter } from "../../core/normalize";
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

  static normalize(mermaidInput: string) {
    const next = mermaidInput
      .split("\n")
      .map((line) => {
        const quoted = quoteSequenceAliasLabel(line);
        return escapeSequenceMessageSemicolons(quoted);
      })
      .join("\n");

    const fixes: FixRecord[] = [];

    if (
      mermaidInput.split("\n").some((line, index) => {
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
      mermaidInput.split("\n").some((line, index) => {
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

  static validate(mermaidInput: string): Diagnostic[] {
    const lines = stripMermaidFrontmatter(mermaidInput)
      .split("\n")
      .map((line) => line.trim());
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

  static validateDocument(document: Record<string, unknown>) {
    if (
      !Array.isArray(document.participants) ||
      document.participants.length === 0
    ) {
      return "Sequence documents must include a non-empty `participants` array.";
    }

    if (!Array.isArray(document.messages) || document.messages.length === 0) {
      return "Sequence documents must include a non-empty `messages` array.";
    }

    const participantIds = new Set<string>();
    for (const [index, participant] of document.participants.entries()) {
      if (!isRecord(participant)) {
        return `Sequence participant at index ${index} must be an object.`;
      }

      if (!isNonEmptyString(participant.id)) {
        return `Sequence participant at index ${index} must include a non-empty string \`id\`.`;
      }

      if (
        participant.label !== undefined &&
        !isNonEmptyString(participant.label)
      ) {
        return `Sequence participant \`${participant.id}\` must use a non-empty string \`label\` when provided.`;
      }

      if (participantIds.has(participant.id)) {
        return `Sequence participant IDs must be unique. Duplicate ID \`${participant.id}\` was provided.`;
      }

      participantIds.add(participant.id);
    }

    for (const [index, message] of document.messages.entries()) {
      if (!isRecord(message)) {
        return `Sequence message at index ${index} must be an object.`;
      }

      if (
        !isNonEmptyString(message.from) ||
        !isNonEmptyString(message.to) ||
        !isNonEmptyString(message.text)
      ) {
        return `Sequence message at index ${index} must include non-empty string \`from\`, \`to\`, and \`text\` fields.`;
      }

      if (
        !participantIds.has(message.from) ||
        !participantIds.has(message.to)
      ) {
        return `Sequence message ${message.from} -> ${message.to} must reference declared participant IDs.`;
      }
    }

    return null;
  }
}

function escapeSequenceLabel(label: string) {
  return label
    .replaceAll("\r\n", "<br/>")
    .replaceAll("\n", "<br/>")
    .replaceAll(/(?<!#59);/g, "#59;")
    .replaceAll('"', '\\"');
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
    (!/[()/:;]/.test(trimmedLabel) && trimmedLabel.toLowerCase() !== "end")
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
