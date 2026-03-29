---
name: vizlayer
description: Produce valid JSON documents for mermaid flowchart, sequenceDiagram, and classDiagram diagrams. Use when an AI system needs to turn natural-language structure into mermaid diagram input, Mermaid-safe JSON, or typed visualization payloads.
metadata:
  author: System
  disable-slash-command: true
---

# Vizlayer JSON Authoring

Use this skill when the task is to generate structured Vizlayer input instead of hand-writing Mermaid.

## Supported Diagram Families

- `flowchart`
- `sequenceDiagram`
- `classDiagram`

If the user asks for another diagram family, do not improvise a near-match silently. Say Vizlayer currently supports flowcharts, sequence diagrams, and class diagrams.

## Core Rule

Prefer returning a Vizlayer payload instead of hand-writing Mermaid.

Good targets:

- a `vizlayer` payload with `kind: "flowchart"`
- a `vizlayer` payload with `kind: "sequenceDiagram"`
- a `vizlayer` payload with `kind: "classDiagram"`

Note:

- Mermaid headers are `flowchart`, `sequenceDiagram`, and `classDiagram`.

## Kind Selection

Choose the diagram family by relationship shape:

- Use `flowchart` for pipelines, decisions, branching, stages, or directional movement.
- Use `sequenceDiagram` for actors exchanging messages over time.
- Use `classDiagram` for entities with members and relations.

## Authoring Rules

- Use stable, code-friendly IDs like `user`, `engine`, `request_parser`.
- Keep labels human-readable.
- Do not add extra fields outside the supported schema.
- Do not return Mermaid unless the user explicitly asks for Mermaid instead of JSON.
- If the user gives partial information, fill small obvious gaps but do not invent core entities or messages that change meaning.

## Output Style

When the user wants only the payload, return only the Vizlayer payload and use the `vizlayer` code fence so clients can render it directly.

Fence rules:

- Use ```vizlayer for final diagram answers.
- Put the selected diagram family in the top-level `kind` field.
- Put the diagram-specific document in the top-level `document` field.
- Do not use ```json for final diagram answers when the client is expected to render the output as a diagram.

When explanation is useful, use this format:

1. State the chosen diagram family.
2. Provide the payload in the `vizlayer` code fence.
3. Optionally note why that family fits.

Canonical payload shape:

```vizlayer
{
  "kind": "sequenceDiagram",
  "document": {
    "participants": [
      { "id": "user", "label": "User" },
      { "id": "agent", "label": "AI Agent" }
    ],
    "messages": [{ "from": "user", "to": "agent", "text": "request diagram" }]
  }
}
```

## Common Conversions

- "Show the request pipeline" -> `flowchart`
- "Show how user, agent, and renderer talk" -> `sequenceDiagram`
- "Model the request and artifact objects" -> `classDiagram`

## Additional Resource

- For flowcharts, see [reference/flowchart.md](reference/flowchart.md)
- For sequence diagrams, see [reference/sequence-diagram.md](reference/sequence-diagram.md)
- For class diagrams, see [reference/class-diagram.md](reference/class-diagram.md)
