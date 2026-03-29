import type { FlowchartDocument } from "../types/results";

export function fromJson(
  input: FlowchartDocument,
  kind: "flowchart" = "flowchart"
) {
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

function escapeLabel(label: string) {
  return label.replaceAll("[", "(").replaceAll("]", ")");
}
