# Class Diagram Reference

Use this reference when the requested structure is structural: entities, members, and relations between them.

## Schema

```vizlayer-class-diagram
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

## Requirements

- `classes` must be non-empty.
- Every class needs `id`.
- `members` may be omitted.
- Every member needs `name`; `type` is optional.
- `relations` may be omitted.

## Authoring Guidance

- Use class diagrams for types or domain objects, not runtime steps.
- Keep `id` singular and code-friendly.
- Put data shape into `members`.
- Use `relations` only when the relationship adds useful structure.

## Example

Prompt:

`Show the core entities for a diagram request system.`

Output:

```vizlayer-class-diagram
{
  "classes": [
    {
      "id": "DiagramRequest",
      "members": [
        { "name": "kind", "type": "string" },
        { "name": "document", "type": "object" }
      ]
    },
    {
      "id": "DiagramArtifact",
      "members": [
        { "name": "mermaid", "type": "string" },
        { "name": "svg", "type": "string" }
      ]
    }
  ],
  "relations": [
    { "from": "DiagramRequest", "to": "DiagramArtifact", "label": "produces" }
  ]
}
```

## Common Mistakes

- Using class diagrams for workflows that should be flowcharts
- Omitting `classes` and only returning `relations`
- Treating `members` like free-form text instead of structured fields
