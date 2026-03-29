import { describe, expect, it, vi } from "vitest";
import { VizlayerSpecParser } from "../index";

describe("vizlayer spec", () => {
  it("parses complete unified vizlayer payloads", () => {
    const result = VizlayerSpecParser.parseVizlayerSpec(
      '{"kind":"flowchart","document":{"direction":"TD","nodes":[{"id":"a","label":"A"}],"edges":[]}}'
    );

    expect(result).toEqual({
      ok: true,
      spec: {
        kind: "flowchart",
        document: {
          direction: "TD",
          nodes: [{ id: "a", label: "A" }],
          edges: [],
        },
      },
    });
  });

  it("skips parsing when a vizlayer payload is still streaming", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = VizlayerSpecParser.parseVizlayerSpec('{"kind":"flowchart"');

    expect(result).toEqual({
      ok: false,
      error: "Vizlayer payload is still streaming.",
    });
    expect(jsonParseSpy).not.toHaveBeenCalled();
    jsonParseSpy.mockRestore();
  });

  it("parses complete payloads with trailing whitespace", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = VizlayerSpecParser.parseVizlayerSpec(
      '{"kind":"flowchart","document":{"direction":"TD","nodes":[{"id":"a","label":"A"}],"edges":[]}}\n  '
    );

    expect(result.ok).toBe(true);
    expect(jsonParseSpy).toHaveBeenCalledOnce();
    jsonParseSpy.mockRestore();
  });
});
