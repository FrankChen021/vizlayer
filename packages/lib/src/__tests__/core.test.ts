import { describe, expect, it } from "vitest";
import { explain, Flowchart, repair, validate } from "../index";
import { brokenSequenceAlias, flowchartDocument } from "./fixtures";

describe("vizlayer core", () => {
  it("validates empty input as an error", () => {
    const result = validate("   ");

    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]?.code).toBe("EMPTY_INPUT");
  });

  it("repairs common sequence issues", () => {
    const result = repair(brokenSequenceAlias.input);

    expect(result.ok).toBe(true);
    expect(result.mermaid).toBe(brokenSequenceAlias.expectedMermaid);
    expect(result.fixes.map((fix) => fix.code)).toEqual([
      "QUOTE_SEQUENCE_ALIAS_LABEL",
      "ESCAPE_SEQUENCE_SEMICOLONS",
    ]);
  });

  it("is idempotent once repaired", () => {
    const first = repair(brokenSequenceAlias.input);
    const second = repair(first.mermaid);

    expect(second.ok).toBe(true);
    expect(second.mermaid).toBe(first.mermaid);
    expect(second.fixes).toEqual([]);
  });

  it("renders a flowchart from structured JSON", () => {
    const result = Flowchart.fromJson(flowchartDocument);

    expect(result).toContain("flowchart LR");
    expect(result).toContain("user[User]");
    expect(result).toContain("user --> |send spec| engine");
  });

  it("explains repairs in plain language", () => {
    const result = repair(brokenSequenceAlias.input);
    const explanation = explain(result);

    expect(explanation).toContain("Vizlayer applied these repairs");
    expect(explanation).toContain("Quoted sequence alias labels");
  });
});
