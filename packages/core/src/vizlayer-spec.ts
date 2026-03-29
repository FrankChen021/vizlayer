import type { ClassDiagramDocument } from "./diagrams/classDiagram/types";
import type { FlowchartDocument } from "./diagrams/flowchart/types";
import type { SequenceDiagramDocument } from "./diagrams/sequenceDiagram/types";

export type VizlayerPayload =
  | {
      kind: "flowchart";
      document: FlowchartDocument;
    }
  | {
      kind: "sequenceDiagram";
      document: SequenceDiagramDocument;
    }
  | {
      kind: "classDiagram";
      document: ClassDiagramDocument;
    };

export type ParsedVizlayerSpec =
  | {
      ok: true;
      spec: VizlayerPayload;
    }
  | {
      ok: false;
      error: string;
    };

export class VizlayerSpecParser {
  static parseVizlayerSpec(spec: string): ParsedVizlayerSpec {
    if (isJsonObjectStillStreaming(spec)) {
      return {
        ok: false,
        error: "Vizlayer payload is still streaming.",
      };
    }

    try {
      const parsedSpec = JSON.parse(spec) as unknown;
      return resolveVizlayerSpec(parsedSpec);
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse Vizlayer JSON document.",
      };
    }
  }
}

const FLOWCHART_DIRECTIONS = new Set(["TB", "TD", "LR", "RL", "BT"]);

function isJsonObjectStillStreaming(spec: string) {
  let started = false;
  let insideString = false;
  let escaping = false;
  const stack: string[] = [];

  for (const char of spec) {
    if (!started) {
      if (isWhitespace(char)) {
        continue;
      }

      if (char !== "{") {
        return false;
      }

      started = true;
      stack.push("}");
      continue;
    }

    if (insideString) {
      if (escaping) {
        escaping = false;
        continue;
      }

      if (char === "\\") {
        escaping = true;
        continue;
      }

      if (char === '"') {
        insideString = false;
      }

      continue;
    }

    if (char === '"') {
      insideString = true;
      continue;
    }

    if (char === "{") {
      stack.push("}");
      continue;
    }

    if (char === "[") {
      stack.push("]");
      continue;
    }

    if (char === "}" || char === "]") {
      const expected = stack.at(-1);
      if (expected !== char) {
        return false;
      }

      stack.pop();
      if (stack.length === 0) {
        continue;
      }
    }
  }

  return !started || insideString || stack.length > 0;
}

function resolveVizlayerSpec(parsedSpec: unknown): ParsedVizlayerSpec {
  if (!isRecord(parsedSpec)) {
    return {
      ok: false,
      error: "Vizlayer payload must be a JSON object.",
    };
  }

  const payloadKind = parsedSpec.kind;
  const payloadDocument = parsedSpec.document;

  if (!isVizlayerKind(payloadKind)) {
    return {
      ok: false,
      error:
        "Unified Vizlayer payloads must include `kind` set to `flowchart`, `sequenceDiagram`, or `classDiagram`.",
    };
  }

  if (!isRecord(payloadDocument)) {
    return {
      ok: false,
      error:
        "Unified Vizlayer payloads must include an object `document` field.",
    };
  }

  const documentError = validateVizlayerDocument(payloadKind, payloadDocument);
  if (documentError) {
    return {
      ok: false,
      error: documentError,
    };
  }

  return {
    ok: true,
    spec: {
      kind: payloadKind,
      document: payloadDocument as unknown as VizlayerPayload["document"],
    } as VizlayerPayload,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWhitespace(char: string) {
  return char === " " || char === "\n" || char === "\r" || char === "\t";
}

function isVizlayerKind(value: unknown): value is VizlayerPayload["kind"] {
  return (
    value === "flowchart" ||
    value === "sequenceDiagram" ||
    value === "classDiagram"
  );
}

function validateVizlayerDocument(
  kind: VizlayerPayload["kind"],
  document: Record<string, unknown>
) {
  if (kind === "flowchart") {
    return validateFlowchartDocument(document);
  }

  if (kind === "sequenceDiagram") {
    return validateSequenceDiagramDocument(document);
  }

  return validateClassDiagramDocument(document);
}

function validateFlowchartDocument(document: Record<string, unknown>) {
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

function validateSequenceDiagramDocument(document: Record<string, unknown>) {
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

    if (!participantIds.has(message.from) || !participantIds.has(message.to)) {
      return `Sequence message ${message.from} -> ${message.to} must reference declared participant IDs.`;
    }
  }

  return null;
}

function validateClassDiagramDocument(document: Record<string, unknown>) {
  if (!Array.isArray(document.classes) || document.classes.length === 0) {
    return "Class diagram documents must include a non-empty `classes` array.";
  }

  if (document.relations !== undefined && !Array.isArray(document.relations)) {
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
