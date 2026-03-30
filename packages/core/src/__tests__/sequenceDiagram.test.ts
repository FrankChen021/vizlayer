import { describe, expect, it } from "vitest";
import { SequenceDiagram, Vizlayer } from "../index";
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
    const result = Vizlayer.repair(brokenSequenceAlias.input);

    expect(result.ok).toBe(true);
    expect(result.mermaid).toBe(brokenSequenceAlias.expectedMermaid);
    expect(result.fixes.map((fix) => fix.code)).toEqual([
      "QUOTE_SEQUENCE_ALIAS_LABEL",
      "ESCAPE_SEQUENCE_SEMICOLONS",
    ]);
  });

  it("is idempotent once repaired", () => {
    const first = Vizlayer.repair(brokenSequenceAlias.input);
    const second = Vizlayer.repair(first.mermaid);

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

  it("escapes semicolons and line breaks in direct JSON generation", () => {
    const result = SequenceDiagram.fromJson({
      participants: [
        { id: "api", label: "API" },
        { id: "user", label: "User" },
      ],
      messages: [
        {
          from: "user",
          to: "api",
          text: "retry; fallback\nshow warning",
        },
      ],
    });

    expect(result).toContain("user->>api: retry#59; fallback<br/>show warning");
    expect(Vizlayer.validate(result).ok).toBe(true);
  });

  it("repairs lowercase end aliases that Mermaid treats as reserved", () => {
    const result = Vizlayer.repair(
      `sequenceDiagram\nparticipant done as end\nUser->>done: finished`
    );

    expect(result.ok).toBe(true);
    expect(result.mermaid).toContain('participant done as "end"');
    expect(result.fixes.map((fix) => fix.code)).toContain(
      "QUOTE_SEQUENCE_ALIAS_LABEL"
    );
  });

  it("validates rendered Mermaid", () => {
    expect(
      Vizlayer.validate(SequenceDiagram.fromJson(sequenceDiagramDocument)).ok
    ).toBe(true);
  });
});
