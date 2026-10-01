# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`base-ds` is a private React/TypeScript component library (design system), published as `@indianous/base-ds` to GitHub Packages. Built for distribution with tsup, developed with Vite + Storybook, styled with Tailwind CSS driven entirely by CSS custom property design tokens.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — tsup build to `dist/` (empties it first); `npm run check:dist` checks the output afterwards
- `npm run pack:local` — build + `npm pack` into `.pack/indianous-base-ds-<version>.tgz`, for testing unpublished changes in a consumer app (see README)
- `npm run lint` — ESLint, `--max-warnings 0` (any warning fails)
- `npm run typecheck` — `tsc -b` over `tsconfig.app.json` (all of `src/`, including tests and stories) and `tsconfig.node.json` (`vite.config.ts`). The build's `tsconfig.build.json` excludes tests/stories and Vitest doesn't type-check, so this is the only thing that catches type errors there.
- `npm run lint:fix` / `npm run format` / `npm run format:check` — ESLint autofix / Prettier write / Prettier check. The Prettier scripts cover the whole repo (`.`), honoring `.gitignore` and `.prettierignore` — not just `src/`.
- `npm test` — Vitest `unit` project only (jsdom). Does **not** run Storybook interaction tests.
- `npm run test:stories` — Vitest `storybook` and `storybook-dark` projects (Playwright/Chromium browser mode; every story on the light and on the dark theme) — required to exercise Storybook interaction tests
- `npm run test:all` — all three Vitest projects
- `npm run storybook` — Storybook dev server

`.oxlintrc.json` exists but isn't wired into any script — ESLint is the only linter that actually gates code; ignore oxlint.

## Code style

- Prettier-enforced (`npm run format:check` gates publishing): no semicolons, single quotes, trailing commas, 2-space indent, 100-char width. This includes `src/tokens/*.json` — don't hand-align values in columns. Formatting-only commits go in `.git-blame-ignore-revs` (enable locally with `git config blame.ignoreRevsFile .git-blame-ignore-revs`).
- Functional components with named exports — no default exports, no `React.FC`.
- Type-only imports use `import type { ... }`.
- `@typescript-eslint/no-explicit-any` is an error under `src/**` (relaxed in test files).
- Polymorphic components (e.g. `Button`) use a discriminated union keyed on an `as` prop (`ButtonAsButton | ButtonAsLink`), each variant `Omit<NativeAttrs, keyof CommonProps>`.
- Variant/size styling goes through `Record<Variant, string>` class-lookup tables composed with `cn()` (`src/utils/cn.ts`, clsx + tailwind-merge) — don't build conditional class strings inline.

## Design tokens

Never hardcode colors, spacing, shadows, radii, or typography values in a component. Tokens live in `src/tokens/*.json`, are exposed as CSS custom properties in `src/styles/theme.css`, and are mapped to Tailwind utilities in `tailwind.config.js` (e.g. `bg-primary` → `var(--...)`). Use the Tailwind utility classes, not literal values.

Semantic color values exist twice — hex in `src/tokens/colors.json` and `var(--primitive)` in `src/styles/theme.css` — and must stay in sync. There are two themes: light in `:root` / `semantic`, dark in `.dark` / `semantic-dark` (only theme-dependent colors; `overlay` and `chart-*` are shared). A new semantic color needs a value in both. `src/tokens/contrast.test.ts` (unit project) enforces the sync, that every theme-dependent color has a dark value, and WCAG AA (4.5:1) for every foreground/background token pair in both themes; changing a semantic color means that test must keep passing.

## Accessibility labels

Apps using the design system aren't all in English (e.g. `pt-BR` sites), so every text a component renders by itself for assistive tech must be overridable (WCAG 3.1.2):

- Covers `aria-label`s, `aria-roledescription`, visually hidden text (including the hidden data tables of charts) and titles of drawers/dialogs the component opens internally — anything the consumer can't pass as content. Visible text the component shows on its own (an empty state, a dropzone hint, a fallback name like `Other`) follows the same rule.
- One optional, flat prop per text — no `labels` object. Names: `label` for the component's own landmark/region/group (or a chart's image), `<thing>Label` for a control (`previousLabel`, `closeLabel`, `menuButtonLabel`), `<thing>Title` for an internal title or header (`tableTitle`, `openColumnTitle`), `<thing>Message` for visible status text (`emptyMessage`, `dropzoneMessage`), `<thing>RoleDescription` for `aria-roledescription`. (`PinInput` predates this and uses `groupLabel` for its group; keep it.) Text that depends on a value is a function (`slideLabel: (n: number, total: number) => string`, `dotLabel: (n: number) => string`).
- The current English text stays as the default, set in the destructuring (`closeLabel = 'Close drawer'`), so adding the props is non-breaking (patch bump). Each prop gets a one-line English JSDoc saying which element it labels (see `Carousel`, `PasswordInput`).
- When a component renders another one that has its own label props (e.g. `Navbar` → `Drawer`), expose them prefixed with the inner component's name (`drawerCloseLabel`) and forward them — otherwise the English text leaks through.
- Tests: one test per label prop with a Portuguese value; the existing tests that query the English text stay as the guard for the defaults. Stories: a `CustomLabels` story with every label in Portuguese, so the a11y addon checks it.
- Defaults are always English. `FilterDropdown` and `MultiSelect` predate this and still have hardcoded Portuguese; they're switched to English props in issue #58's last batch (a minor bump).
- New components follow this from the start. Still pending (issue #58, `plans/issue-58-a11y-labels.md`): `MultiSelect`, `TagsInput`, `QrCode`, `KanbanBoard`, `TransferList`, `FilterDropdown`.

## Project structure

- `src/components/{atoms,molecules,organisms}/<Component>/` — each component folder holds `Component.tsx`, `Component.stories.tsx`, and `Component.test.tsx` together.
- Every new component (plus its prop types) must be re-exported from `src/index.ts`.
- `src/tokens/` — design token JSON source of truth.
- `src/styles/` — `globals.css` (Tailwind directives) and `theme.css` (CSS custom properties).

## Testing

- Three Vitest projects: `unit` (jsdom, default `npm test`), `storybook` and `storybook-dark` (Playwright/Chromium, both run by `npm run test:stories`) — `npm test` alone doesn't cover Storybook interaction tests. `storybook-dark` runs the same stories on the dark theme through `.storybook-dark/` (its `preview.tsx` only overrides `initialGlobals.theme`); don't switch it with `define`/env vars, which leak into the `storybook` project.
- Interactive components should include an accessibility assertion via `jest-axe` (`toHaveNoViolations`, wired in `src/setupTests.ts`).
- `jest-axe` in jsdom can't measure color contrast. Contrast (and every other axe rule) is checked per story by the Storybook a11y addon (`a11y: { test: 'error' }` in `.storybook/preview.tsx`), so `npm run test:stories` must pass with zero failures before work is done — it also gates publishing.
- Form controls must forward `aria-label`/`aria-labelledby`/`aria-describedby`/`aria-invalid` to the actual input: `FormField` injects the last two via `cloneElement`. Stories rendering a control on its own give it an `aria-label`.
- Write `it`/`describe` descriptions in English, even though commit messages are in Portuguese.

## Workflow

- Follow TDD: write a failing test before writing the implementation code that makes it pass.
- Before implementing any change, write a plan to a file under `/plans` (create the directory if it doesn't exist) so it can be reviewed.
- Always wait for explicit confirmation of the plan before starting implementation — never start writing code right after presenting the plan.

## Build gotchas

- `tsup.config.ts` sets `platform: 'browser'` deliberately — without it, esbuild pulls in Node-targeted code from dependencies (e.g. `qrcode`'s `fs`/`pngjs` path) and breaks SSR for consumers like Next.js.
- The ESM build is split per component (issue #53): every `src/components/**/*.tsx` is a tsup entry with `splitting: true`, so `dist/index.js` is a barrel that only re-exports from per-component chunks. `'use client'` is prepended (post-build string step) to every `.js` in `dist` **except** `dist/index.js`, plus `dist/index.cjs` (CJS stays one file — esbuild can't split it). The barrel must stay directive-free: Next.js then ships only the client files of the components a page uses (a minimal page went from +951 KB to +34 KB). `package.json` `"sideEffects": ["**/*.css"]` is part of this — nothing in `src/` may rely on import side effects. `npm run check:dist` (run by `prepublishOnly`) guards the structure, and `src/bundle.test.ts` guards what a single import pulls in.
- Inside components, render icons with `IconBase` and a named import (`import { SearchIcon } from 'lucide-react'`, `<IconBase icon={SearchIcon} />`), never `<Icon name="…">`: `Icon`'s lookup by name keeps all ~650 KB of lucide icons in the bundle. `Icon` stays exported for apps that accept that cost.
- `react`/`react-dom` must stay **only** in `peerDependencies` (+ `devDependencies` for local dev), never in `dependencies` — `src/package.test.ts` guards this. Consumers must install from the registry (or a packed tarball), never `file:../base-ds`: a symlink makes the bundle (and `lucide-react`) resolve React from this repo's `node_modules`, giving two React instances (`Invalid hook call`, issue #38).
- The package has two entry points: `.` (JS/TS) and `./styles` (→ `dist/styles/theme.css`) — consumers import the CSS separately.

## Other conventions

- Commit messages are written in Portuguese, matching existing history — keep doing so.
- Every delivery that changes public behavior bumps `version` in `package.json` (SemVer; while `0.x`, a change requiring consumer adjustments bumps the minor, anything else the patch) and adds a `CHANGELOG.md` entry (Portuguese, Keep a Changelog, with an "Ajustes necessários nos apps" section when relevant) in the same commit, then gets a `v<version>` git tag.
- `README.md` (Portuguese) is the consumer-facing usage guide and ships inside the tarball — keep install/usage instructions there, not here.
- Publishing: pushing a `v*` tag triggers `.github/workflows/publish.yml`, which checks the tag matches `package.json`'s version, runs lint, `format:check`, typecheck, unit tests and `test:stories`, builds (`prepublishOnly`) and publishes to GitHub Packages (`publishConfig` pins the registry). A published version can't be republished — the tag is the release.
- That publish workflow is the only CI; nothing runs on push/PR, so run lint, `format:check`, typecheck, `npm test`, `npm run test:stories` and build locally before considering work done.
