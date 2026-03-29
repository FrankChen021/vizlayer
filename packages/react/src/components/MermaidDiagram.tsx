import { useEffect, useId, useState, type ReactNode } from "react";

const DEFAULT_LOADING_MESSAGE = "Rendering diagram...";

let mermaidPromise: Promise<(typeof import("mermaid"))["default"]> | undefined;

export interface MermaidDiagramProps {
  chart: string;
  className?: string;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode | ((message: string) => ReactNode);
  onError?: (error: Error) => void;
  theme?: "default" | "dark" | "forest" | "neutral";
}

export function MermaidDiagram({
  chart,
  className,
  loadingFallback,
  errorFallback,
  onError,
  theme = "default",
}: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const mermaid = await loadMermaid(theme);
        const result = await mermaid.render(`vizlayer-${id}`, chart);
        if (!active) {
          return;
        }

        setSvg(result.svg);
        setError(null);
      } catch (renderError) {
        if (!active) {
          return;
        }

        const nextError =
          renderError instanceof Error
            ? renderError
            : new Error("Failed to render Mermaid diagram.");
        setSvg(null);
        setError(nextError.message);
        onError?.(nextError);
      }
    }

    setSvg(null);
    setError(null);
    void renderChart();

    return () => {
      active = false;
    };
  }, [chart, id, onError, theme]);

  if (error) {
    if (typeof errorFallback === "function") {
      return <>{errorFallback(error)}</>;
    }

    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return <div role="alert">{error}</div>;
  }

  if (!svg) {
    return <>{loadingFallback ?? DEFAULT_LOADING_MESSAGE}</>;
  }

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

async function loadMermaid(theme: MermaidDiagramProps["theme"]) {
  mermaidPromise ??= import("mermaid").then((module) => module.default);
  const mermaid = await mermaidPromise;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme,
  });
  return mermaid;
}
