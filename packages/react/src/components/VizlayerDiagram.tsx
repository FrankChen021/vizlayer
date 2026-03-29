import {
  ClassDiagram,
  Flowchart,
  SequenceDiagram,
  type VizlayerPayload,
} from "@vizlayer/core";
import type { ReactNode } from "react";
import { MermaidDiagram, type MermaidDiagramProps } from "./MermaidDiagram";

type SharedDiagramProps = Omit<MermaidDiagramProps, "chart"> & {
  invalidDocumentFallback?: ReactNode | ((message: string) => ReactNode);
};

export type VizlayerDiagramProps = VizlayerPayload & SharedDiagramProps;

type BuildChartResult =
  | {
      chart: string;
      error: null;
    }
  | {
      chart: null;
      error: string;
    };

export function VizlayerDiagram(props: VizlayerDiagramProps) {
  const chart = buildChartSpec(props);

  if (chart.error) {
    if (typeof props.invalidDocumentFallback === "function") {
      return <>{props.invalidDocumentFallback(chart.error)}</>;
    }

    if (props.invalidDocumentFallback) {
      return <>{props.invalidDocumentFallback}</>;
    }

    return <div role="alert">{chart.error}</div>;
  }

  if (chart.chart === null) {
    return <div role="alert">Failed to build Mermaid from diagram JSON.</div>;
  }

  return (
    <MermaidDiagram
      chart={chart.chart}
      className={props.className}
      loadingFallback={props.loadingFallback}
      errorFallback={props.errorFallback}
      onError={props.onError}
      theme={props.theme}
    />
  );
}

export function toChartSpec(props: VizlayerPayload) {
  if (props.kind === "flowchart") {
    return Flowchart.fromJson(props.document);
  }

  if (props.kind === "sequenceDiagram") {
    return SequenceDiagram.fromJson(props.document);
  }

  return ClassDiagram.fromJson(props.document);
}

function buildChartSpec(props: VizlayerPayload): BuildChartResult {
  try {
    return {
      chart: toChartSpec(props),
      error: null,
    };
  } catch (error) {
    return {
      chart: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to build Mermaid from diagram JSON.",
    };
  }
}
