import { stripMermaidFrontmatter } from "../../core/normalize";
import type { Diagnostic, FixRecord } from "../../core/types";
import type { FlowchartDocument } from "./types";

const FLOWCHART_DIRECTIONS = new Set(["TB", "TD", "LR", "RL", "BT"]);

export class Flowchart {
  static fromJson(input: FlowchartDocument, kind: "flowchart" = "flowchart") {
    if (kind !== "flowchart") {
      throw new Error("UNSUPPORTED_JSON_KIND");
    }

    if (input.nodes.length === 0) {
      throw new Error("INVALID_JSON_SHAPE");
    }

    const direction = input.direction ?? "TD";
    const lines = input.title
      ? ["---", `title: ${JSON.stringify(normalizeTitle(input.title))}`, "---"]
      : [];
    lines.push(`flowchart ${direction}`);

    for (const node of input.nodes) {
      lines.push(`  ${node.id}["${escapeNodeLabel(node.label)}"]`);
    }

    for (const edge of input.edges) {
      const label = edge.label ? `|${escapeEdgeLabel(edge.label)}| ` : "";
      lines.push(`  ${edge.from} --> ${label}${edge.to}`);
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
    const normalizedInput = stripMermaidFrontmatter(mermaidInput);
    const hasHeader =
      normalizedInput.startsWith("flowchart") ||
      normalizedInput.startsWith("graph ");
    if (!hasHeader) {
      return [
        {
          code: "MISSING_HEADER",
          message: "Flowcharts must start with `flowchart` or `graph`.",
        },
      ];
    }

    const hasBody = normalizedInput
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

  static validateDocument(document: Record<string, unknown>) {
    if (document.title !== undefined && !isNonEmptyString(document.title)) {
      return "Flowchart documents must use a non-empty string `title` when provided.";
    }

    if (
      document.direction !== undefined &&
      !FLOWCHART_DIRECTIONS.has(document.direction as string)
    ) {
      return "Flowchart documents must use `direction` set to `TB`, `TD`, `LR`, `RL`, or `BT`.";
    }

    if (!Array.isArray(document.nodes) || document.nodes.length === 0) {
      return "Flowchart documents must include a non-empty `nodes` array.";
    }

    if (!Array.isArray(document.edges)) {
      return "Flowchart documents must include an `edges` array.";
    }

    const nodeIds = new Set<string>();
    for (const [index, node] of document.nodes.entries()) {
      if (!isRecord(node)) {
        return `Flowchart node at index ${index} must be an object.`;
      }

      if (!isNonEmptyString(node.id)) {
        return `Flowchart node at index ${index} must include a non-empty string \`id\`.`;
      }

      if (!isNonEmptyString(node.label)) {
        return `Flowchart node \`${node.id}\` must include a non-empty string \`label\`.`;
      }

      if (nodeIds.has(node.id)) {
        return `Flowchart node IDs must be unique. Duplicate ID \`${node.id}\` was provided.`;
      }

      nodeIds.add(node.id);
    }

    for (const [index, edge] of document.edges.entries()) {
      if (!isRecord(edge)) {
        return `Flowchart edge at index ${index} must be an object.`;
      }

      if (!isNonEmptyString(edge.from) || !isNonEmptyString(edge.to)) {
        return `Flowchart edge at index ${index} must include non-empty string \`from\` and \`to\` fields.`;
      }

      if (edge.label !== undefined && !isNonEmptyString(edge.label)) {
        return `Flowchart edge ${edge.from} -> ${edge.to} must use a non-empty string \`label\` when provided.`;
      }

      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        return `Flowchart edge ${edge.from} -> ${edge.to} must reference declared node IDs.`;
      }
    }

    return null;
  }
}

function escapeNodeLabel(label: string) {
  return sanitizeLabel(label).replaceAll('"', '\\"');
}

function escapeEdgeLabel(label: string) {
  return sanitizeLabel(label).replaceAll("|", "&#124;");
}

function sanitizeLabel(label: string) {
  return label
    .replaceAll("[", "&#91;")
    .replaceAll("]", "&#93;")
    .replaceAll("(", "&#40;")
    .replaceAll(")", "&#41;")
    .replaceAll("{", "&#123;")
    .replaceAll("}", "&#125;")
    .replaceAll("\r\n", "<br/>")
    .replaceAll("\n", "<br/>");
}

function normalizeTitle(title: string) {
  return title.replaceAll("\r\n", " ").replaceAll("\n", " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
