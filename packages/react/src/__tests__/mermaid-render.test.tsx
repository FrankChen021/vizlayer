/**
 * @vitest-environment jsdom
 */

import mermaid from "mermaid";
import { describe, expect, it } from "vitest";
import { Flowchart } from "../../../core/src/index";

const unknownTableRootCauseFlowchart = {
  direction: "TD" as const,
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

describe("Mermaid integration", () => {
  it("renders escaped flowchart labels from LLM-generated Vizlayer JSON", async () => {
    SVGElement.prototype.getBBox ??= () =>
      ({
        x: 0,
        y: 0,
        width: 160,
        height: 40,
      }) as DOMRect;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "default",
    });

    const chart = Flowchart.fromJson(unknownTableRootCauseFlowchart);
    const result = await mermaid.render("unknown-table-root-cause", chart);

    expect(result.svg).toContain("<svg");
    expect(chart).toContain(
      'atomic_path["DatabaseAtomic: resolve table data path"]'
    );
    expect(chart).toContain(
      'throw["throw Exception&#40;ErrorCodes::UNKNOWN_TABLE&#41;"]'
    );
  });
});
