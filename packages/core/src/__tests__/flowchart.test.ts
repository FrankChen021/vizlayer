import { describe, expect, it } from "vitest";
import { Flowchart, Vizlayer } from "../index";
import type { FlowchartDocument } from "../diagrams/flowchart/types";

const flowchartDocument: FlowchartDocument = {
  title: "Basic flow",
  direction: "LR",
  nodes: [
    { id: "user", label: "User" },
    { id: "engine", label: "Vizlayer Engine" },
    { id: "view", label: "Rendered View" },
  ],
  edges: [
    { from: "user", to: "engine", label: "send spec" },
    { from: "engine", to: "view", label: "emit mermaid" },
  ],
};

export const unknownTableRootCauseFlowchart: FlowchartDocument = {
  direction: "TD",
  nodes: [
    { id: "start", label: "Operation references a table" },
    { id: "atomic_path", label: "DatabaseAtomic: resolve table data path" },
    { id: "atomic_drop", label: "DatabaseAtomic: DROP TABLE" },
    { id: "lazy_mtime", label: "DatabaseLazy: read metadata mtime" },
    { id: "backup_collect", label: "Backup: collect tables" },
    { id: "missing", label: "Table not found in expected registry/set/cache" },
    { id: "throw", label: "throw Exception(ErrorCodes::UNKNOWN_TABLE)" },
  ],
  edges: [
    { from: "start", to: "atomic_path", label: "needs data path" },
    { from: "start", to: "atomic_drop", label: "DROP TABLE" },
    { from: "start", to: "lazy_mtime", label: "needs metadata mtime" },
    { from: "start", to: "backup_collect", label: "backup scan" },
    {
      from: "atomic_path",
      to: "missing",
      label: "table_name_to_path has no entry",
    },
    {
      from: "atomic_drop",
      to: "missing",
      label: "tryGetTable() returned null",
    },
    { from: "lazy_mtime", to: "missing", label: "tables_cache has no entry" },
    {
      from: "backup_collect",
      to: "missing",
      label: "expected table not found in scan",
    },
    { from: "missing", to: "throw", label: "UNKNOWN_TABLE (code 60)" },
  ],
};

describe("flowchart", () => {
  it("renders from structured JSON", () => {
    const result = Flowchart.fromJson(flowchartDocument);

    expect(result).toContain('title: "Basic flow"');
    expect(result).toContain("flowchart LR");
    expect(result).toContain('user["User"]');
    expect(result).toContain("user --> |send spec| engine");
  });

  it("validates rendered Mermaid", () => {
    expect(Vizlayer.validate(Flowchart.fromJson(flowchartDocument)).ok).toBe(
      true
    );
  });

  it("escapes LLM-generated labels into Mermaid-safe quoted nodes", () => {
    const result = Flowchart.fromJson(unknownTableRootCauseFlowchart);

    expect(result).toContain(
      'atomic_path["DatabaseAtomic: resolve table data path"]'
    );
    expect(result).toContain(
      'throw["throw Exception&#40;ErrorCodes::UNKNOWN_TABLE&#41;"]'
    );
    expect(result).toContain(
      "missing --> |UNKNOWN_TABLE &#40;code 60&#41;| throw"
    );
    expect(Vizlayer.validate(result).ok).toBe(true);
  });

  it("preserves square brackets in labels instead of rewriting their meaning", () => {
    const result = Flowchart.fromJson({
      direction: "TD",
      nodes: [{ id: "array_access", label: "array[i]" }],
      edges: [],
    });

    expect(result).toContain('array_access["array&#91;i&#93;"]');
    expect(result).not.toContain('array_access["array(i)"]');
    expect(Vizlayer.validate(result).ok).toBe(true);
  });

  it("renders lowercase end safely inside quoted labels", () => {
    const result = Flowchart.fromJson({
      direction: "TD",
      nodes: [{ id: "finish", label: "end" }],
      edges: [],
    });

    expect(result).toContain('finish["end"]');
    expect(Vizlayer.validate(result).ok).toBe(true);
  });

  it("normalizes multiline titles into Mermaid frontmatter", () => {
    const result = Flowchart.fromJson({
      title: "Root cause\nanalysis",
      direction: "TD",
      nodes: [{ id: "start", label: "Start" }],
      edges: [],
    });

    expect(result).toContain('title: "Root cause analysis"');
    expect(Vizlayer.validate(result).ok).toBe(true);
  });
});
