import type { Diagnostic, FixRecord } from "../../core/types";
import type { FlowchartDocument } from "./types";

export class Flowchart {
  static fromJson(input: FlowchartDocument, kind: "flowchart" = "flowchart") {
    if (kind !== "flowchart") {
      throw new Error("UNSUPPORTED_JSON_KIND");
    }

    if (input.nodes.length === 0) {
      throw new Error("INVALID_JSON_SHAPE");
    }

    const direction = input.direction ?? "TD";
    const lines = [`flowchart ${direction}`];

    for (const node of input.nodes) {
      lines.push(`  ${node.id}[${escapeLabel(node.label)}]`);
    }

    for (const edge of input.edges) {
      const label = edge.label ? `|${escapeLabel(edge.label)}| ` : "";
      lines.push(`  ${edge.from} --> ${label}${edge.to}`);
    }

    return lines.join("\n");
  }

  static normalizeMermaid(input: string) {
    const fixes: FixRecord[] = [];

    return {
      text: input,
      fixes,
    };
  }

  static validateMermaid(input: string): Diagnostic[] {
    const hasHeader =
      input.startsWith("flowchart") || input.startsWith("graph ");
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
}

export function normalizeFlowchartMermaid(input: string) {
  return Flowchart.normalizeMermaid(input);
}

export function validateFlowchart(input: string): Diagnostic[] {
  return Flowchart.validateMermaid(input);
}

export function fromFlowchartJson(
  input: FlowchartDocument,
  kind: "flowchart" = "flowchart"
) {
  return Flowchart.fromJson(input, kind);
}

function escapeLabel(label: string) {
  return label.replaceAll("[", "(").replaceAll("]", ")");
}
