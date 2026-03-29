# Sequence Diagram Reference

Use this reference when the requested structure is temporal: actors, participants, and message exchange over time.

## Schema

```vizlayer-sequence-diagram
{
  "participants": [
    { "id": "user", "label": "User" },
    { "id": "engine", "label": "Vizlayer Engine" }
  ],
  "messages": [{ "from": "user", "to": "engine", "text": "draw diagram" }]
}
```

## Requirements

- `participants` must be non-empty.
- `messages` must be non-empty.
- Every participant needs `id`; `label` is optional but preferred for readability.
- Every message needs `from`, `to`, and `text`.

## Authoring Guidance

- Use `participants` for stable actors and systems.
- Keep `messages[].text` short and action-oriented.
- Order messages in the same order they happen.
- Prefer one participant entry per actor instead of repeating labels in messages.

## Example

Prompt:

`Show a user asking an agent for a diagram, and the agent calling Vizlayer.`

Output:

```vizlayer-sequence-diagram
{
  "participants": [
    { "id": "user", "label": "User" },
    { "id": "agent", "label": "AI Agent" },
    { "id": "vizlayer", "label": "Vizlayer" }
  ],
  "messages": [
    { "from": "user", "to": "agent", "text": "request architecture diagram" },
    { "from": "agent", "to": "vizlayer", "text": "build flowchart JSON" },
    { "from": "vizlayer", "to": "agent", "text": "return Mermaid" }
  ]
}
```

## Common Mistakes

- Returning `messages` without defining the corresponding participants
- Using paragraphs or multiple clauses in one message
- Encoding branches or graph topology that should be a flowchart instead
