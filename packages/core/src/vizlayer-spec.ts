import { explain as explainResult } from "./core/explain";
import { JsonUtils } from "./core/json-utils";
import { repair as repairInput } from "./core/repair";
import type { RepairResult } from "./core/types";
import { validate as validateInput } from "./core/validate";
import { ClassDiagram } from "./diagrams/classDiagram/impl";
import { Flowchart } from "./diagrams/flowchart/impl";
import { SequenceDiagram } from "./diagrams/sequenceDiagram/impl";
import type { ClassDiagramDocument } from "./diagrams/classDiagram/types";
import type { FlowchartDocument } from "./diagrams/flowchart/types";
import type { SequenceDiagramDocument } from "./diagrams/sequenceDiagram/types";

export type VizlayerSpec =
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
      spec: VizlayerSpec;
    }
  | {
      ok: false;
      error: string;
    };

export class Vizlayer {
  static validate(input: string) {
    return validateInput(input);
  }

  static repair(input: string) {
    return repairInput(input);
  }

  static explain(result: RepairResult) {
    return explainResult(result);
  }

  static parse(spec: string): ParsedVizlayerSpec {
    if (JsonUtils.isJsonObjectStillStreaming(spec)) {
      return {
        ok: false,
        error: "Diagram is incomplete. Maybe it's still streaming?",
      };
    }

    try {
      const parsedSpec = JSON.parse(spec) as unknown;
      return Vizlayer.resolveVizlayerSpec(parsedSpec);
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

  private static resolveVizlayerSpec(parsedSpec: unknown): ParsedVizlayerSpec {
    if (!Vizlayer.isRecord(parsedSpec)) {
      return {
        ok: false,
        error: "Vizlayer payload must be a JSON object.",
      };
    }

    const payloadKind = parsedSpec.kind;
    const payloadDocument = parsedSpec.document;

    if (!Vizlayer.isVizlayerKind(payloadKind)) {
      return {
        ok: false,
        error:
          "Unified Vizlayer payloads must include `kind` set to `flowchart`, `sequenceDiagram`, or `classDiagram`.",
      };
    }

    if (!Vizlayer.isRecord(payloadDocument)) {
      return {
        ok: false,
        error:
          "Unified Vizlayer payloads must include an object `document` field.",
      };
    }

    const documentError = Vizlayer.validateVizlayerDocument(
      payloadKind,
      payloadDocument
    );
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
        document: payloadDocument as unknown as VizlayerSpec["document"],
      } as VizlayerSpec,
    };
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private static isVizlayerKind(value: unknown): value is VizlayerSpec["kind"] {
    return (
      value === "flowchart" ||
      value === "sequenceDiagram" ||
      value === "classDiagram"
    );
  }

  private static validateVizlayerDocument(
    kind: VizlayerSpec["kind"],
    document: Record<string, unknown>
  ) {
    if (kind === "flowchart") {
      return Flowchart.validateDocument(document);
    }

    if (kind === "sequenceDiagram") {
      return SequenceDiagram.validateDocument(document);
    }

    return ClassDiagram.validateDocument(document);
  }
}
