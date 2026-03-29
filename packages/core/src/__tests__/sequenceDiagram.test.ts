import { describe, expect, it } from "vitest";
import { repair, SequenceDiagram, validate } from "../index";
import type { SequenceDiagramDocument } from "../diagrams/sequenceDiagram/types";

const brokenSequenceAlias = {
  input: `sequenceDiagram
participant api as API(service/v1)
User->>api: fetch data; retry if stale`,
  expectedMermaid: `sequenceDiagram
participant api as "API(service/v1)"
User->>api: fetch data#59; retry if stale`,
};

const sequenceDiagramDocument: SequenceDiagramDocument = {
  participants: [
    { id: "user", label: "User" },
    { id: "engine", label: "Vizlayer Engine" },
  ],
  messages: [
    { from: "user", to: "engine", text: "generate diagram" },
    { from: "engine", to: "user", text: "return mermaid" },
  ],
};

describe("sequenceDiagram", () => {
  it("repairs common Mermaid issues", () => {
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

  it("renders from structured JSON", () => {
    const result = SequenceDiagram.fromJson(sequenceDiagramDocument);

    expect(result).toContain("sequenceDiagram");
    expect(result).toContain('participant engine as "Vizlayer Engine"');
    expect(result).toContain("user->>engine: generate diagram");
  });

  it("validates rendered Mermaid", () => {
    expect(validate(SequenceDiagram.fromJson(sequenceDiagramDocument)).ok).toBe(
      true
    );
  });
});
