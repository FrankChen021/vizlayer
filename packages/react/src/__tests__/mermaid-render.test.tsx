/**
 * @vitest-environment jsdom
 */

import mermaid from "mermaid";
import { describe, expect, it } from "vitest";
import { Flowchart, SequenceDiagram } from "../../../core/src/index";

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

function ensureSvgGetBBox() {
  const svgElementPrototype =
    SVGElement.prototype as SVGElementPrototypeWithGetBBox;
  svgElementPrototype.getBBox ??= () =>
    ({
      x: 0,
      y: 0,
      width: 160,
      height: 40,
    }) as DOMRect;
}

describe("Mermaid integration", () => {
  it("renders escaped flowchart labels from LLM-generated Vizlayer JSON", async () => {
    ensureSvgGetBBox();

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

  it("renders flowcharts with reserved words and bracketed labels", async () => {
    ensureSvgGetBBox();

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "default",
    });

    const chart = Flowchart.fromJson({
      direction: "TD",
      nodes: [
        { id: "finish", label: "end" },
        { id: "array_access", label: "array[i]" },
      ],
      edges: [{ from: "finish", to: "array_access", label: "read value" }],
    });

    const result = await mermaid.render("flowchart-reserved-labels", chart);

    expect(result.svg).toContain("<svg");
    expect(chart).toContain('finish["end"]');
    expect(chart).toContain('array_access["array&#91;i&#93;"]');
  });

  it("renders sequence diagrams with semicolons and multiline messages", async () => {
    ensureSvgGetBBox();

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "default",
    });

    const chart = SequenceDiagram.fromJson({
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

    const result = await mermaid.render("sequence-message-escaping", chart);

    expect(result.svg).toContain("<svg");
    expect(chart).toContain("user->>api: retry#59; fallback<br/>show warning");
  });
});

type SVGElementPrototypeWithGetBBox = typeof SVGElement.prototype & {
  getBBox?: () => DOMRect;
};
