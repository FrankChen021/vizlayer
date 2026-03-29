# Vizlayer

Vizlayer is a structured visualization engine for AI systems.

This repository is organized as a small TypeScript workspace:

- `apps/web`: React + Vite demo application, designed for Cloudflare Pages
- `packages/core`: reusable visualization library
- `packages/react`: React wrapper for rendering Vizlayer JSON and Mermaid
- `docs`: markdown content rendered inside the demo app
- `skills`: project skill for Vizlayer JSON authoring

## Goals

- Make AI-generated diagrams safer and easier to inspect
- Keep the visualization core reusable outside the demo app
- Ship docs and demos in one deployable web application

## Getting Started

```bash
pnpm install
pnpm dev
```

## Packages

- `@vizlayer/core`: class-style JSON-to-Mermaid generation, repair, and validation
- `@vizlayer/react`: `VizlayerDiagram` for JSON-driven rendering

## Workspace Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
