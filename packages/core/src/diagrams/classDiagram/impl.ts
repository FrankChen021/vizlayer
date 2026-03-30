import { stripMermaidFrontmatter } from "../../core/normalize";
import type { ClassDiagramDocument } from "./types";

import type { Diagnostic, FixRecord } from "../../core/types";

export class ClassDiagram {
  static fromJson(input: ClassDiagramDocument) {
    if (input.classes.length === 0) {
      throw new Error("INVALID_JSON_SHAPE");
    }

    const lines = ["classDiagram"];

    for (const item of input.classes) {
      lines.push(`class ${item.id} {`);
      for (const member of item.members ?? []) {
        lines.push(
          member.type ? `  ${member.type} ${member.name}` : `  ${member.name}`
        );
      }
      lines.push("}");
    }

    for (const relation of input.relations ?? []) {
      const suffix = relation.label ? ` : ${relation.label}` : "";
      lines.push(`${relation.from} --> ${relation.to}${suffix}`);
    }

    return lines.join("\n");
  }

  static normalize(mermaidInput: string) {
    const fixes: FixRecord[] = [];

    return {
      text: mermaidInput,
      fixes,
    };
  }

  static validate(mermaidInput: string): Diagnostic[] {
    const lines = stripMermaidFrontmatter(mermaidInput)
      .split("\n")
      .map((line) => line.trim());
    const hasHeader = lines[0] === "classDiagram";
    if (!hasHeader) {
      return [
        {
          code: "MISSING_HEADER",
          message: "Class diagrams must start with `classDiagram`.",
        },
      ];
    }

    const hasClassBody = lines.some((line) => line.startsWith("class "));
    if (!hasClassBody) {
      return [
        {
          code: "MISSING_CLASS_CONTENT",
          message: "Class diagrams must define at least one class.",
        },
      ];
    }

    return [];
  }

  static validateDocument(document: Record<string, unknown>) {
    if (!Array.isArray(document.classes) || document.classes.length === 0) {
      return "Class diagram documents must include a non-empty `classes` array.";
    }

    if (
      document.relations !== undefined &&
      !Array.isArray(document.relations)
    ) {
      return "Class diagram documents must use a `relations` array when provided.";
    }

    const classIds = new Set<string>();
    for (const [index, item] of document.classes.entries()) {
      if (!isRecord(item)) {
        return `Class diagram entry at index ${index} must be an object.`;
      }

      if (!isNonEmptyString(item.id)) {
        return `Class diagram entry at index ${index} must include a non-empty string \`id\`.`;
      }

      if (classIds.has(item.id)) {
        return `Class diagram IDs must be unique. Duplicate ID \`${item.id}\` was provided.`;
      }

      if (item.members !== undefined) {
        if (!Array.isArray(item.members)) {
          return `Class diagram entry \`${item.id}\` must use a \`members\` array when provided.`;
        }

        for (const [memberIndex, member] of item.members.entries()) {
          if (!isRecord(member)) {
            return `Class member at index ${memberIndex} for \`${item.id}\` must be an object.`;
          }

          if (!isNonEmptyString(member.name)) {
            return `Class member at index ${memberIndex} for \`${item.id}\` must include a non-empty string \`name\`.`;
          }

          if (member.type !== undefined && !isNonEmptyString(member.type)) {
            return `Class member \`${member.name}\` for \`${item.id}\` must use a non-empty string \`type\` when provided.`;
          }
        }
      }

      classIds.add(item.id);
    }

    for (const [index, relation] of (document.relations ?? []).entries()) {
      if (!isRecord(relation)) {
        return `Class relation at index ${index} must be an object.`;
      }

      if (!isNonEmptyString(relation.from) || !isNonEmptyString(relation.to)) {
        return `Class relation at index ${index} must include non-empty string \`from\` and \`to\` fields.`;
      }

      if (relation.label !== undefined && !isNonEmptyString(relation.label)) {
        return `Class relation ${relation.from} -> ${relation.to} must use a non-empty string \`label\` when provided.`;
      }

      if (!classIds.has(relation.from) || !classIds.has(relation.to)) {
        return `Class relation ${relation.from} -> ${relation.to} must reference declared class IDs.`;
      }
    }

    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
