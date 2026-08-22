# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`base-ds` is a private React/TypeScript component library (design system). Built for distribution with tsup, developed with Vite + Storybook, styled with Tailwind CSS driven entirely by CSS custom property design tokens.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — tsup build to `dist/`
- `npm run lint` — ESLint, `--max-warnings 0` (any warning fails)
- `npm run lint:fix` / `npm run format` / `npm run format:check` — ESLint autofix / Prettier write / Prettier check
- `npm test` — Vitest `unit` project only (jsdom). Does **not** run Storybook interaction tests.
- `npm run test:stories` — Vitest `storybook` project (Playwright/Chromium browser mode) — required to exercise Storybook interaction tests
- `npm run test:all` — both Vitest projects
- `npm run storybook` — Storybook dev server

`.oxlintrc.json` exists but isn't wired into any script — ESLint is the only linter that actually gates code; ignore oxlint.

## Code style

- Prettier-enforced: no semicolons, single quotes, trailing commas, 2-space indent, 100-char width.
- Functional components with named exports — no default exports, no `React.FC`.
- Type-only imports use `import type { ... }`.
- `@typescript-eslint/no-explicit-any` is an error under `src/**` (relaxed in test files).
- Polymorphic components (e.g. `Button`) use a discriminated union keyed on an `as` prop (`ButtonAsButton | ButtonAsLink`), each variant `Omit<NativeAttrs, keyof CommonProps>`.
- Variant/size styling goes through `Record<Variant, string>` class-lookup tables composed with `cn()` (`src/utils/cn.ts`, clsx + tailwind-merge) — don't build conditional class strings inline.

## Design tokens

Never hardcode colors, spacing, shadows, radii, or typography values in a component. Tokens live in `src/tokens/*.json`, are exposed as CSS custom properties in `src/styles/theme.css`, and are mapped to Tailwind utilities in `tailwind.config.js` (e.g. `bg-primary` → `var(--...)`). Use the Tailwind utility classes, not literal values.

## Project structure

- `src/components/{atoms,molecules,organisms}/<Component>/` — each component folder holds `Component.tsx`, `Component.stories.tsx`, and `Component.test.tsx` together.
- Every new component (plus its prop types) must be re-exported from `src/index.ts`.
- `src/tokens/` — design token JSON source of truth.
- `src/styles/` — `globals.css` (Tailwind directives) and `theme.css` (CSS custom properties).

## Testing

- Two Vitest projects: `unit` (jsdom, default `npm test`) and `storybook` (Playwright/Chromium, `npm run test:stories`) — `npm test` alone doesn't cover Storybook interaction tests.
- Interactive components should include an accessibility assertion via `jest-axe` (`toHaveNoViolations`, wired in `src/setupTests.ts`).
- Write `it`/`describe` descriptions in English, even though commit messages are in Portuguese.

## Workflow

- Follow TDD: write a failing test before writing the implementation code that makes it pass.
- Before implementing any change, write a plan to a file under `/plans` (create the directory if it doesn't exist) so it can be reviewed.
- Always wait for explicit confirmation of the plan before starting implementation — never start writing code right after presenting the plan.

## Build gotchas

- `tsup.config.ts` sets `platform: 'browser'` deliberately — without it, esbuild pulls in Node-targeted code from dependencies (e.g. `qrcode`'s `fs`/`pngjs` path) and breaks SSR for consumers like Next.js.
- `'use client'` is prepended to `dist/index.js`/`dist/index.cjs` via a post-build string step, not an esbuild banner — esbuild drops directives when bundling to a single file without code-splitting. Every component is client-only.
- The package has two entry points: `.` (JS/TS) and `./styles` (→ `dist/styles/theme.css`) — consumers import the CSS separately.

## Other conventions

- Commit messages are written in Portuguese, matching existing history — keep doing so.
- No CI is configured; lint/test/build aren't automatically enforced anywhere — run them locally before considering work done.
