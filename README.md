# Vizlayer

Vizlayer is a structured visualization engine for AI systems.

This repository is organized as a small TypeScript workspace:

- `apps/web`: React + Vite demo application, designed for Cloudflare Pages
- `packages/lib`: reusable visualization library
- `docs`: markdown content rendered inside the demo app

## Goals

- Make AI-generated diagrams safer and easier to inspect
- Keep the visualization core reusable outside the demo app
- Ship docs and demos in one deployable web application

## Getting Started

```bash
pnpm install
pnpm dev
```

## Workspace Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
