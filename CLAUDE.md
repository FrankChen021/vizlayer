# Vizlayer

Vizlayer is a structured visualization engine for AI systems.

## Repository Layout

- `apps/web`: Vite React application that hosts demos and rendered docs pages
- `packages/core`: reusable TypeScript library for structured visualization primitives
- `docs`: markdown content compiled into the web application at build time

## Working Rules

- Prefer the smallest change that keeps the workspace coherent.
- Keep the library pure where possible; browser-only rendering belongs in `apps/web`.
- Treat docs as source content, not a separate site.
- Preserve clear boundaries between `packages/core` and `apps/web`.

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`

## Testing

- Use `vitest` for both library and app-level tests when practical.
- Favor fixture-based tests for library transformations and parsing logic.
- Add focused regression tests whenever behavior changes.
