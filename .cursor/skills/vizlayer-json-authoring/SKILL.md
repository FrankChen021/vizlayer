---
name: vizlayer-json-authoring
description: Produce valid Vizlayer JSON documents for flowchart, sequence, and class diagrams. Use when an AI system needs to turn natural-language structure into Vizlayer diagram input, Mermaid-safe JSON, or typed visualization payloads.
---

# Vizlayer JSON Authoring

Use this skill when the task is to generate structured Vizlayer input instead of hand-writing Mermaid.

## Supported Kinds

- `flowchart`
- `sequence`
- `class`

If the user asks for another diagram kind, do not improvise a near-match silently. Say Vizlayer currently supports `flowchart`, `sequence`, and `class`.

## Core Rule

Prefer returning JSON that can be passed directly into `VizlayerDiagram` or the class-style lib API.

Good targets:

- `Flowchart.fromJson(document)`
- `SequenceDiagram.fromJson(document)`
- `ClassDiagram.fromJson(document)`
- `<VizlayerDiagram kind="..." document={document} />`

## Kind Selection

Choose the kind by relationship shape:

- Use `flowchart` for pipelines, decisions, branching, stages, or directional movement.
- Use `sequence` for actors exchanging messages over time.
- Use `class` for entities with members and relations.

## Schemas

### Flowchart

```json
{
  "direction": "LR",
  "nodes": [
    { "id": "user", "label": "User" },
    { "id": "engine", "label": "Vizlayer" }
  ],
  "edges": [{ "from": "user", "to": "engine", "label": "describe diagram" }]
}
```

Requirements:

- `nodes` must be non-empty.
- Every node needs `id` and `label`.
- Every edge needs `from` and `to`.
- `direction` should be one of `TB`, `TD`, `LR`, `RL`, `BT`.

### Sequence

```json
{
  "participants": [
    { "id": "user", "label": "User" },
    { "id": "engine", "label": "Vizlayer Engine" }
  ],
  "messages": [{ "from": "user", "to": "engine", "text": "draw diagram" }]
}
```

Requirements:

- `participants` must be non-empty.
- `messages` must be non-empty.
- Every participant needs `id`; `label` is optional but preferred for readability.
- Every message needs `from`, `to`, and `text`.

### Class

```json
{
  "classes": [
    {
      "id": "VisualizationRequest",
      "members": [
        { "name": "kind", "type": "string" },
        { "name": "payload", "type": "object" }
      ]
    }
  ],
  "relations": [
    {
      "from": "VisualizationRequest",
      "to": "VisualizationArtifact",
      "label": "produces"
    }
  ]
}
```

Requirements:

- `classes` must be non-empty.
- Every class needs `id`.
- `members` may be omitted.
- Every member needs `name`; `type` is optional.
- `relations` may be omitted.

## Authoring Rules

- Use stable, code-friendly IDs like `user`, `engine`, `request_parser`.
- Keep labels human-readable.
- Do not add extra fields outside the supported schema.
- Do not return Mermaid unless the user explicitly asks for Mermaid instead of JSON.
- If the user gives partial information, fill small obvious gaps but do not invent core entities or messages that change meaning.

## Output Style

When the user wants only the payload, return only the JSON document.

When explanation is useful, use this format:

1. State the chosen kind.
2. Provide the JSON.
3. Optionally note why that kind fits.

## Common Conversions

- "Show the request pipeline" -> `flowchart`
- "Show how user, agent, and renderer talk" -> `sequence`
- "Model the request and artifact objects" -> `class`

## Additional Resource

- For concrete examples, see [examples.md](examples.md)
