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
    if (!endsWithCompleteJsonObject(spec)) {
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

function endsWithCompleteJsonObject(spec: string) {
  for (let index = spec.length - 1; index >= 0; index -= 1) {
    const char = spec.charAt(index);
    if (char === " " || char === "\n" || char === "\r" || char === "\t") {
      continue;
    }

    return char === "}";
  }

  return false;
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

function isVizlayerKind(value: unknown): value is VizlayerPayload["kind"] {
  return (
    value === "flowchart" ||
    value === "sequenceDiagram" ||
    value === "classDiagram"
  );
}
