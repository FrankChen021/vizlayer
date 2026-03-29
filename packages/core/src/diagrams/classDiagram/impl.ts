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
    const lines = mermaidInput.split("\n").map((line) => line.trim());
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
          code: "MISSING_FLOW_CONTENT",
          message: "Class diagrams must define at least one class.",
        },
      ];
    }

    return [];
  }
}
