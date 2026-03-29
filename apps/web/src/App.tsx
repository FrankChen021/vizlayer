import {
  fromJson,
  explain,
  repair,
  validate,
  type FlowchartDocument,
} from "@vizlayer/lib";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { docs } from "virtual:docs-content";
import { MermaidPreview } from "./components/MermaidPreview";

const demoDocument: FlowchartDocument = {
  direction: "LR",
  nodes: [
    { id: "prompt", label: "Prompt" },
    { id: "engine", label: "Vizlayer" },
    { id: "output", label: "Diagram" },
  ],
  edges: [
    { from: "prompt", to: "engine", label: "structured input" },
    { from: "engine", to: "output", label: "validated mermaid" },
  ],
};

const brokenSequence = `sequenceDiagram
participant api as API(service/v1)
User->>api: fetch data; retry if stale`;

export function App() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Vizlayer</p>
          <h1>Structured visualization engine for AI systems</h1>
          <p className="muted">
            Demos, docs, and a reusable TypeScript library in one workspace.
          </p>
        </div>

        <nav className="nav">
          <Link to="/">Overview</Link>
          <Link to="/demo/repair">Repair demo</Link>
          <Link to="/demo/json">JSON demo</Link>
          <Link to="/docs">Docs</Link>
        </nav>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/demo/repair" element={<RepairDemoPage />} />
          <Route path="/demo/json" element={<JsonDemoPage />} />
          <Route path="/docs" element={<DocsIndexPage />} />
          <Route path="/docs/:slug" element={<DocDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function OverviewPage() {
  return (
    <section className="stack">
      <div className="hero">
        <p className="eyebrow">Overview</p>
        <h2>One library, one demo app, one docs surface.</h2>
        <p className="muted">
          Vizlayer keeps the core transformation logic in `packages/lib` and
          uses this app to show what the engine does with Mermaid text and
          structured flowchart JSON.
        </p>
      </div>

      <div className="grid">
        <article className="panel">
          <h3>Repair unsafe Mermaid</h3>
          <p>
            Normalize common LLM-generated Mermaid issues and explain what
            changed.
          </p>
        </article>
        <article className="panel">
          <h3>Emit from JSON</h3>
          <p>
            Turn a constrained JSON contract into flowchart Mermaid for
            downstream rendering.
          </p>
        </article>
        <article className="panel">
          <h3>Docs in the app</h3>
          <p>
            The root `docs/` content is compiled into the same web app for one
            deployment.
          </p>
        </article>
      </div>
    </section>
  );
}

function RepairDemoPage() {
  const [input, setInput] = useState(brokenSequence);
  const result = useMemo(() => repair(input), [input]);
  const diagnostics = useMemo(() => validate(input), [input]);

  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Demo</p>
        <h2>Repair Mermaid output</h2>
      </div>

      <div className="two-column">
        <label className="stack">
          <span>Input Mermaid</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={12}
          />
        </label>

        <div className="stack">
          <div className="panel">
            <h3>Validation</h3>
            <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
          </div>

          <div className="panel">
            <h3>Explanation</h3>
            <pre>{explain(result)}</pre>
          </div>
        </div>
      </div>

      <div className="two-column">
        <div className="panel">
          <h3>Repaired Mermaid</h3>
          <pre>{result.mermaid}</pre>
        </div>

        <div className="stack">
          <h3>Preview</h3>
          <MermaidPreview chart={result.mermaid} />
        </div>
      </div>
    </section>
  );
}

function JsonDemoPage() {
  const mermaid = useMemo(() => fromJson(demoDocument), []);

  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Demo</p>
        <h2>Emit Mermaid from flowchart JSON</h2>
      </div>

      <div className="two-column">
        <div className="panel">
          <h3>Structured input</h3>
          <pre>{JSON.stringify(demoDocument, null, 2)}</pre>
        </div>
        <div className="panel">
          <h3>Generated Mermaid</h3>
          <pre>{mermaid}</pre>
        </div>
      </div>

      <div className="stack">
        <h3>Preview</h3>
        <MermaidPreview chart={mermaid} />
      </div>
    </section>
  );
}

function DocsIndexPage() {
  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Docs</p>
        <h2>Documentation</h2>
      </div>

      {docs.length === 0 ? (
        <div className="panel">
          No docs are wired yet. The next scaffold step will connect the root
          `docs/` directory.
        </div>
      ) : (
        <div className="grid">
          {docs.map((doc) => (
            <Link
              key={doc.slug}
              to={`/docs/${doc.slug}`}
              className="panel panel-link"
            >
              <h3>{doc.title}</h3>
              <p className="muted">{doc.slug}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function DocDetailPage() {
  const { slug } = useParams();
  const doc = docs.find((entry) => entry.slug === slug);

  if (!doc) {
    return <Navigate to="/docs" replace />;
  }

  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Docs</p>
        <h2>{doc.title}</h2>
      </div>
      <article className="panel markdown">
        <ReactMarkdown>{doc.body}</ReactMarkdown>
      </article>
    </section>
  );
}
