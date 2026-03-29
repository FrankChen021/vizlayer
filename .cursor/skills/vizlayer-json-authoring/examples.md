# Vizlayer JSON Examples

## Flowchart Example

Prompt:

`Show a product manager sending a spec to an AI engine, then the engine returns a rendered diagram.`

Output:

```json
{
  "direction": "LR",
  "nodes": [
    { "id": "pm", "label": "Product Manager" },
    { "id": "engine", "label": "AI Engine" },
    { "id": "diagram", "label": "Rendered Diagram" }
  ],
  "edges": [
    { "from": "pm", "to": "engine", "label": "send spec" },
    { "from": "engine", "to": "diagram", "label": "return output" }
  ]
}
```

## Sequence Example

Prompt:

`Show a user asking an agent for a diagram, and the agent calling Vizlayer.`

Output:

```json
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

## Class Example

Prompt:

`Show the core entities for a diagram request system.`

Output:

```json
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
