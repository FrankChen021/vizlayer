import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MermaidDiagram, VizlayerDiagram } from "../index";

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (_id: string, chart: string) => ({
      svg: `<svg><desc>${chart}</desc></svg>`,
    })),
  },
}));

describe("@vizlayer/react", () => {
  it("renders raw Mermaid charts", async () => {
    const { container } = render(
      <MermaidDiagram chart={"flowchart TD\n  a[A]"} />
    );

    expect(screen.getByText("Rendering diagram...")).toBeTruthy();

    await waitFor(() => {
      expect(container.querySelector("desc")?.textContent).toContain(
        "flowchart TD"
      );
    });
  });

  it("renders flowchart JSON through VizlayerDiagram", async () => {
    const { container } = render(
      <VizlayerDiagram
        kind="flowchart"
        document={{
          direction: "LR",
          nodes: [
            { id: "user", label: "User" },
            { id: "engine", label: "Vizlayer" },
          ],
          edges: [{ from: "user", to: "engine", label: "describe" }],
        }}
      />
    );

    await waitFor(() => {
      expect(container.querySelector("desc")?.textContent).toContain(
        "flowchart LR"
      );
      expect(container.querySelector("desc")?.textContent).toContain(
        "user --> |describe| engine"
      );
    });
  });

  it("renders sequence and class JSON through the generic component", async () => {
    const { container, rerender } = render(
      <VizlayerDiagram
        kind="sequence"
        document={{
          participants: [
            { id: "user", label: "User" },
            { id: "engine", label: "Vizlayer Engine" },
          ],
          messages: [{ from: "user", to: "engine", text: "draw sequence" }],
        }}
      />
    );

    await waitFor(() => {
      expect(container.querySelector("desc")?.textContent).toContain(
        "sequenceDiagram"
      );
      expect(container.querySelector("desc")?.textContent).toContain(
        "user->>engine: draw sequence"
      );
    });

    rerender(
      <VizlayerDiagram
        kind="class"
        document={{
          classes: [
            { id: "Artifact", members: [{ name: "mermaid", type: "string" }] },
          ],
        }}
      />
    );

    await waitFor(() => {
      expect(container.querySelector("desc")?.textContent).toContain(
        "classDiagram"
      );
      expect(container.querySelector("desc")?.textContent).toContain(
        "class Artifact {"
      );
    });
  });

  it("surfaces invalid diagram JSON before Mermaid render", () => {
    render(
      <VizlayerDiagram
        kind="sequence"
        document={{ participants: [], messages: [] }}
        invalidDocumentFallback={(message) => <div>{message}</div>}
      />
    );

    expect(screen.getByText("INVALID_JSON_SHAPE")).toBeTruthy();
  });
});
