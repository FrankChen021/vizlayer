import { describe, expect, it, vi } from "vitest";
import { Vizlayer } from "../index";

describe("vizlayer spec", () => {
  it("parses complete unified vizlayer payloads", () => {
    const result = Vizlayer.parse(
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

    const result = Vizlayer.parse('{"kind":"flowchart"');

    expect(result).toEqual({
      ok: false,
      error: "Diagram is incomplete. Maybe it's still streaming?",
    });
    expect(jsonParseSpy).not.toHaveBeenCalled();
    jsonParseSpy.mockRestore();
  });

  it("parses complete payloads with trailing whitespace", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = Vizlayer.parse(
      '{"kind":"flowchart","document":{"direction":"TD","nodes":[{"id":"a","label":"A"}],"edges":[]}}\n  '
    );

    expect(result.ok).toBe(true);
    expect(jsonParseSpy).toHaveBeenCalledOnce();
    jsonParseSpy.mockRestore();
  });

  it("waits for nested arrays and strings to close before parsing", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = Vizlayer.parse(`{
  "kind": "flowchart",
  "document": {
    "nodes": [{"id":"a","label":"A"}],
    "edges": [{"from":"a","to":"a","label":"unfinished"`);

    expect(result).toEqual({
      ok: false,
      error: "Diagram is incomplete. Maybe it's still streaming?",
    });
    expect(jsonParseSpy).not.toHaveBeenCalled();
    jsonParseSpy.mockRestore();
  });

  it("parses complete payloads with leading whitespace", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = Vizlayer.parse(
      ' \n\t{"kind":"flowchart","document":{"direction":"TD","nodes":[{"id":"a","label":"A"}],"edges":[]}}'
    );

    expect(result.ok).toBe(true);
    expect(jsonParseSpy).toHaveBeenCalledOnce();
    jsonParseSpy.mockRestore();
  });

  it("does not treat malformed non-streaming closers as still streaming", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = Vizlayer.parse('{"kind":"flowchart","document":[}');

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected malformed JSON to fail parsing.");
    }
    expect(result.error).toContain("JSON");
    expect(jsonParseSpy).toHaveBeenCalled();
    jsonParseSpy.mockRestore();
  });

  it("does not treat non-object JSON values as still streaming", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = Vizlayer.parse("[]");

    expect(result.ok).toBe(false);
    expect(jsonParseSpy).toHaveBeenCalled();
    jsonParseSpy.mockRestore();
  });

  it("handles escaped quotes inside complete JSON strings", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = Vizlayer.parse(
      '{"kind":"flowchart","document":{"direction":"TD","nodes":[{"id":"a","label":"say \\"hi\\""}],"edges":[]}}'
    );

    expect(result.ok).toBe(true);
    expect(jsonParseSpy).toHaveBeenCalled();
    jsonParseSpy.mockRestore();
  });

  it("ignores closing bracket characters inside quoted strings", () => {
    const jsonParseSpy = vi.spyOn(JSON, "parse");

    const result = Vizlayer.parse(
      '{"kind":"flowchart","document":{"direction":"TD","nodes":[{"id":"a","label":"array[i] } done"}],"edges":[]}}'
    );

    expect(result.ok).toBe(true);
    expect(jsonParseSpy).toHaveBeenCalled();
    jsonParseSpy.mockRestore();
  });

  it("rejects flowchart payloads with invalid runtime shape", () => {
    const result = Vizlayer.parse(
      '{"kind":"flowchart","document":{"direction":"LEFT","nodes":[{"id":"a","label":"A"}],"edges":[]}}'
    );

    expect(result).toEqual({
      ok: false,
      error:
        "Flowchart documents must use `direction` set to `TB`, `TD`, `LR`, `RL`, or `BT`.",
    });
  });

  it("rejects cross-reference errors inside valid JSON payloads", () => {
    const result = Vizlayer.parse(
      '{"kind":"sequenceDiagram","document":{"participants":[{"id":"user","label":"User"}],"messages":[{"from":"user","to":"engine","text":"draw"}]}}'
    );

    expect(result).toEqual({
      ok: false,
      error:
        "Sequence message user -> engine must reference declared participant IDs.",
    });
  });
});
