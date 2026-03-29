import {
  ClassDiagram as ClassDiagramModel,
  Flowchart,
  SequenceDiagram as SequenceDiagramModel,
  type ClassDiagramDocument,
  type FlowchartDocument,
  type SequenceDiagramDocument,
} from "@vizlayer/core";
import { useMemo, type ReactNode } from "react";
import { MermaidDiagram, type MermaidDiagramProps } from "./MermaidDiagram";

type SharedDiagramProps = Omit<MermaidDiagramProps, "chart"> & {
  invalidDocumentFallback?: ReactNode | ((message: string) => ReactNode);
};

export type VizlayerDiagramProps =
  | ({
      kind: "flowchart";
      document: FlowchartDocument;
    } & SharedDiagramProps)
  | ({
      kind: "sequence";
      document: SequenceDiagramDocument;
    } & SharedDiagramProps)
  | ({
      kind: "class";
      document: ClassDiagramDocument;
    } & SharedDiagramProps);

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
  const chart = useMemo<BuildChartResult>(() => {
    try {
      return buildChart(props);
    } catch (error) {
      return {
        chart: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to build Mermaid from diagram JSON.",
      };
    }
  }, [props]);

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

function buildChart(props: VizlayerDiagramProps): BuildChartResult {
  if (props.kind === "flowchart") {
    return {
      chart: Flowchart.fromJson(props.document),
      error: null,
    };
  }

  if (props.kind === "sequence") {
    return {
      chart: SequenceDiagramModel.fromJson(props.document),
      error: null,
    };
  }

  return {
    chart: ClassDiagramModel.fromJson(props.document),
    error: null,
  };
}
