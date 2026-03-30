import { describe, expect, it } from "vitest";
import { Vizlayer } from "../index";

describe("vizlayer core", () => {
  it("validates empty input as an error", () => {
    const result = Vizlayer.validate("   ");

    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]?.code).toBe("EMPTY_INPUT");
  });

  it("explains repairs in plain language", () => {
    const result = Vizlayer.repair(`sequenceDiagram
participant api as API(service/v1)
User->>api: fetch data; retry if stale`);
    const explanation = Vizlayer.explain(result);

    expect(explanation).toContain("Vizlayer applied these repairs");
    expect(explanation).toContain("Quoted sequence alias labels");
  });
});
