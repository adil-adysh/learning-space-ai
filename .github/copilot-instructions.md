# Copilot Instructions — Learning Space AI

## Purpose

This file gives concise, project-specific guidance for AI coding assistants so suggestions are immediately useful and low-risk.

## Quick summary

- Stack: Svelte 5 (runes API), SvelteKit routing, TypeScript with `verbatimModuleSyntax`, Electron main + preload IPC bridge, Vite build, LowDB persistence.
- Key files: `src/main.ts`, `src/preload.ts`, `src/app.d.ts`, `src/types.ts`, `src/db.ts`, `src/lib/*` (managers & components), `scripts/*` (packaging helpers).

## What to prioritize

- Preserve IPC contract: updates touching `src/preload.ts` must also update `src/main.ts` and `src/app.d.ts` types.
- Use type-only imports for interfaces/types: prefer `import type { Foo } from './types'` (tsconfig uses `verbatimModuleSyntax`).
- Keep UI changes small and accessible: follow existing modal patterns (`role="dialog"`, `aria-modal`, focus traps, `Escape` to close).
- Validation limits: prompt/systemPrompt limits were expanded to 8000 chars — mirror that in any new validations, labels, or tests.

## Architecture notes (big picture)

- Electron main process (`src/main.ts`) owns OS-level responsibilities and LowDB-backed persistence. It exposes async IPC handlers.
- `src/preload.ts` is the single secure bridge exposing a typed `window.api` surface consumed by renderer code. Avoid other globals.
- Renderer: Svelte components + `cardManager.svelte.ts` / `projectManager.svelte.ts` call `window.api` methods. Keep managers as the client-side surface for app logic.
- Data flow: UI -> manager -> `window.api` -> main handlers -> `db.ts` -> JSON store (LowDB). Responses flow back via resolved Promises.

## Common patterns and conventions

- Type imports: use `import type` for anything that's a type to avoid TS1484 errors under `verbatimModuleSyntax`.
- IPC handlers: return Promises and use simple serializable payloads (plain objects, strings, numbers). Keep functions small and explicit.
- Console usage: prefer `console.info` in production/main scripts; avoid `console.log` in committed code.
- Confirmation dialogs: prefer `window.confirm` usage was standardized in components; prefer modal components for UX improvements.
- Svelte 5 runes: prefer using `$state`, `$derived`, `$effect` where needed and keep component logic concise.

## Developer workflows & critical commands

- Dev iterate: `npm run dev` (renderer dev server + electron dev pattern used by repo). Verify live reload.
- Lint/format: `npm run lint` and `npm run lint:fix` (run before commits). The repo enforces ESLint + Prettier rules.
- Typecheck: `npm run typecheck` (runs `tsc --noEmit`). Fix type-only import errors and other TS issues before PRs.
- Build: `npm run build` to produce production renderer assets; packaging uses scripts in `scripts/` for dist/electron builds.

## Files to update together when changing contracts

- If changing an API method (name, arg, return): update `src/main.ts`, `src/preload.ts`, `src/app.d.ts`, and any callers in `src/lib/*`.
- If changing persisted schema: update `src/db.ts`, `src/types.ts`, and migration or compatibility helpers in `scripts/` if needed.

## Examples (concrete guidance)

- Type-only import in `src/preload.ts`:
  - Good: `import type { LearningCard, RawCard } from './types';`
  - Bad: `import { LearningCard } from './types';` (causes TS1484 with `verbatimModuleSyntax`).
- Updating an IPC method `getCards()`:
  1. Add/modify handler in `src/main.ts`.
  2. Expose typed wrapper in `src/preload.ts`.
  3. Add type to `src/app.d.ts` and update any manager/caller (`src/lib/cardManager.svelte.ts`).

## Risk management and review hints

- Prefer small, incremental PRs that update types and implementations together to avoid CI/typecheck failures.
- Run `npm run typecheck` locally before pushing — common CI failure is missing `import type` fixes.
- Avoid changing `window.api` shape without a coordinated update; CI will flag mismatches between `app.d.ts` and `preload.ts`.

## Where to look when debugging issues

- Type errors about `verbatimModuleSyntax`: check imports in `src/main.ts`, `src/preload.ts`, and `src/util.ts` for `import type` usage.
- IPC mismatches: inspect `src/app.d.ts` (renderer global typings) and `src/preload.ts` surface.
- Persistence bugs: inspect `src/db.ts` and `scripts/*` used for packaging/migrations.

## If unsure

- Ask for a small reproducible change (e.g., add a single field to a card) rather than broad refactors. I will then update main, preload, types, and callers together.

## Feedback

If any section is unclear or you'd like examples expanded (e.g., sample IPC handler + preload wrapper), say which area and I will add a minimal, tsc-checked snippet.
