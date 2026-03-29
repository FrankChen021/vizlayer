import { useEffect, useId, useState } from "react";

interface MermaidPreviewProps {
  chart: string;
}

export function MermaidPreview({ chart }: MermaidPreviewProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default",
        });

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

        setSvg(null);
        setError(
          renderError instanceof Error
            ? renderError.message
            : "Failed to render"
        );
      }
    }

    void renderChart();

    return () => {
      active = false;
    };
  }, [chart, id]);

  if (error) {
    return <div className="panel panel-error">{error}</div>;
  }

  if (!svg) {
    return <div className="panel">Rendering diagram...</div>;
  }

  return (
    <div
      className="panel mermaid-preview"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
