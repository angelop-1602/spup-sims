# SPUP SIMS Repository Guide

## Project Overview

This repository currently contains the SPUP Human Resource Management (HRM) web application, one module of the broader SIMS platform. The implemented application is `app/hrm`, a Next.js 16 App Router frontend using React 19, TypeScript, Tailwind CSS 4, shadcn/Radix-based UI components, Microsoft Entra ID authentication through MSAL, and types generated from the shared SIMS API's OpenAPI document.

The shared backend is not implemented in this checkout. HRM reaches an external SIMS API through Next.js rewrites and server route handlers. Do not invent backend projects, database models, migrations, or workspace packages based on planned architecture.

## Repository Structure

- `app/hrm/app/`: Next.js routes, layouts, providers, loading/error boundaries, and server-side API proxy handlers. Protected administrative screens live under `app/hrm/app/hrm/`; public/auth routes include `/`, `/careers`, `/login`, and `/redirect`.
- `app/hrm/components/hrm/`: HRM feature components and shared data-screen primitives.
- `app/hrm/components/layout/`: authenticated application shell, navigation, breadcrumbs, sidebar, and top bar.
- `app/hrm/components/ui/`: shared shadcn/Radix-style primitives and common loading, empty, and error states. Search here before adding a UI primitive.
- `app/hrm/lib/api/`: generated API types, the authenticated request client, and query/mutation hooks.
- `app/hrm/lib/`: MSAL configuration, HRM access checks, notifications, and shared utilities.
- `app/hrm/docs/`: API/schema guidance and the frontend UI/UX audit. Treat API examples as supporting documentation; generated types and current code remain the implementation evidence.
- `app/hrm/public/`: static branding and error-page assets.
- `app/hrm/Dockerfile` and `app/hrm/docker-compose.yml`: production container build and connection to the external `hrm-network`/SIMS API service.

There is no root npm workspace configuration. Run frontend commands from `app/hrm`. The nested `app/hrm/AGENTS.md` adds version-specific Next.js rules and applies to every file under that module.

## Environment and Setup

- Use npm; `app/hrm/package-lock.json` is lockfile version 3 and the Docker build installs with `npm ci`.
- The Docker build pins Node.js 22. The installed Next.js package declares Node.js `>=20.9.0`; use Node 22 to match production unless the team documents another local standard.
- From `app/hrm`, install the locked dependencies with `npm ci`.
- Local variables belong in ignored `.env.local` files. No committed `.env.example` exists, so confirm required values with a maintainer or deployment configuration rather than guessing them.
- Client-visible authentication configuration uses `NEXT_PUBLIC_APP_NAME`, tenant/client ID variables, a redirect URI, and API scopes. Anything prefixed `NEXT_PUBLIC_` is bundled into the browser and must never contain a secret.
- Server-only routing uses `API_BASE_URL` for `next.config.ts` rewrites and `SIMS_API_BASE_URL` for `app/api` route handlers. `NEXT_PUBLIC_API_BASE_URL` does not configure those server-side paths.
- The application expects the shared SIMS API to provide authentication/user context and HRM/recruitment/core/public endpoints. The schema-generation command specifically expects OpenAPI at `http://localhost:5106/openapi/v1.json`.
- For the committed compose setup, create the external network once if necessary with `docker network create hrm-network`, then run `docker compose -f app/hrm/docker-compose.yml up --build` from the repository root. The compose file expects a reachable API container named `sis-api-1` on that network. Use `docker compose -f app/hrm/docker-compose.yml down` to stop HRM without deleting unrelated services or data.

Never commit `.env.local` or copy real tenant configuration, access tokens, or user data into documentation, fixtures, logs, or source.

## Verified Commands

Run these from `app/hrm` unless a command says otherwise:

```powershell
npm ci
npm run dev
npm run build
npm start
npm run lint
npm exec -- tsc -- --noEmit
npm run generate:schema
```

- `npm run dev`, `build`, `start`, `lint`, and `generate:schema` are declared in `package.json`; `build` intentionally uses `next build --webpack`.
- `npm exec -- tsc -- --noEmit` uses the installed TypeScript compiler and the strict, no-emit project configuration.
- `generate:schema` requires the local OpenAPI endpoint to be running and overwrites `lib/api/schema.ts`. Review the generated diff; never hand-edit that file.
- From the repository root, the container equivalents are `docker compose -f app/hrm/docker-compose.yml up --build`, `docker compose -f app/hrm/docker-compose.yml logs -f`, and `docker compose -f app/hrm/docker-compose.yml down`.

There is currently no verified formatting script, unit/integration/end-to-end test runner, database migration/generation/seed command, or root-level build command. Confirm and document such tooling before relying on it; do not substitute an invented command.

## Architecture and Module Boundaries

- Keep route composition in `app/`, application chrome in `components/layout`, generic UI in `components/ui`, and API/auth concerns in `lib`. Existing feature code remains under `components/hrm` until an approved migration; new or meaningfully reworked capability code follows `app/hrm/docs/file-structure.md` and the nested `app/hrm/AGENTS.md`.
- Follow App Router server/client boundaries. Pages and layouts are Server Components by default. Add `"use client"` only when a component needs state, effects, event handlers, MSAL, or browser APIs, and keep the client boundary as narrow as practical.
- Browser HRM requests should reuse `request`, `useApiQuery`, `useApiMutation`, or `useApiClient` from `lib/api`. These acquire MSAL bearer tokens, use `cache: "no-store"`, unwrap the API's `{ success, data, message }` envelope, and surface `ApiError` on failures.
- API contracts come from `lib/api/schema.ts`. Import generated `components`/endpoint types instead of recreating response and request shapes. Regenerate only from the authoritative OpenAPI document.
- `next.config.ts` forwards `/api/v1/recruitment`, `/core`, `/hrms`, and `/public` paths. `app/api/[...path]/route.ts` and `app/api/me/route.ts` provide server-side proxies. Preserve authorization forwarding, path encoding, hop-by-hop header removal, and safe 401/502 responses when modifying them.
- MSAL establishes identity, while `HrmAuthGuard` verifies the account against `/api/me`; `HrmAuthGate` protects the administrative shell. `PermissionGuard` controls permission-specific UI. UI guards improve experience but do not replace server-side authorization in the shared API.
- Access metadata is cached per account in `sessionStorage`. Do not treat that cache as authoritative authorization data or move tokens/identity records into persistent client storage without a security review.
- Async screens should preserve explicit loading, empty, error, and retry states using existing boundaries and primitives such as `DataTableState`, `ApiErrorView`, `ErrorPage`, skeletons, and Sonner notifications.

## Coding Conventions

- Use TypeScript with strict checking and the `@/*` path alias. Prefer generated API types and explicit domain types; do not add unnecessary `any`, `@ts-ignore`, or unchecked assertions.
- Existing route, component, and utility files are generally kebab-case; dynamic route folders use `[id]`. Components/types use PascalCase, functions/hooks use camelCase, hooks start with `use`, and constants use uppercase snake case where appropriate.
- Preserve the style of the file being edited. The codebase contains both semicolon and semicolon-free files; avoid formatting unrelated lines. No Prettier configuration is committed.
- Keep imports focused and use `@/` for cross-directory application imports. Use relative imports for tightly related files in the same package when that is the established local pattern.
- Do not calculate browser-only or time/random-dependent values differently during server and initial client render. Use stable server snapshots/effects for `window`, `sessionStorage`, and `localStorage` state to avoid hydration mismatches.
- Use semantic HTML, associated labels, keyboard-accessible controls, visible focus states, `aria-busy`/status announcements for asynchronous content, and descriptive accessible names for icon-only controls.
- Forms currently use controlled React state, native constraint validation, generated request types, and shared UI controls. Preserve API-required nullability and file-upload `FormData` behavior. Do not add a second form/validation library casually.
- Report user-facing failures through existing error primitives or notifications. Server proxy logs must be generic and must not include bearer tokens, sensitive payloads, or personal records.

## UI and Component Rules

- Reuse `components/ui` primitives and `components/hrm` data controls before creating new components. Check `components.json` aliases and the UI/UX audit before adding or restyling a primitive.
- Build with the existing Tailwind 4 CSS-variable theme, shadcn/Radix conventions, Lucide icons, and `cn` utility. Do not introduce a competing design system or hard-code colors that bypass semantic theme tokens without an approved design reason.
- Preserve responsive behavior in the application shell, tables, dialogs, and public careers pages. Verify narrow and desktop layouts for visible UI changes.
- Every data-driven page must provide appropriate loading, empty, error/retry, success, disabled, and in-progress states. Prevent duplicate submissions and preserve useful drafts where the existing interaction calls for it.
- Do not duplicate public careers components across `components/hrm/careers`, `components/hrm/landing`, and `components/hrm/test-careers` without first determining which route owns the active implementation.

## API, Data, and Migration Safety

This checkout has no local database schema, ORM, migrations, seeds, or backend data-access layer. Do not fabricate database instructions or edit the external SIMS schema from this frontend repository.

When backend/database code is added or brought into scope, first inspect its own schema and nested instructions. Do not delete or rename tables, columns, migrations, or production data without explicit authorization; prefer backward-compatible changes and new migrations over editing deployed migrations. Regenerate and validate API clients/types after contract changes, and never expose credentials or sensitive records.

## Security Rules

- Never commit secrets, bearer tokens, credentials, private keys, or sensitive HR/personnel records.
- Do not weaken MSAL configuration, `/api/me` verification, route authorization forwarding, `HrmAuthGuard`, or permission checks to make a feature work.
- Validate untrusted input at the UI boundary for feedback and at the authoritative server boundary for security. Encode forwarded path segments and constrain headers as the existing proxy does.
- Preserve role/permission behavior and require the shared API to authorize every protected read and mutation. Hiding a control with `PermissionGuard` is not sufficient authorization.
- Keep operational errors useful but sanitized. Never log access tokens, authentication responses, uploaded documents, or raw employee/applicant data.
- Review necessity, maintenance, license, client-bundle impact, and security before adding a dependency.

## Git and Team Workflow

- Inspect `git status` before editing. Preserve all unrelated staged, unstaged, and untracked work; never discard another developer's changes.
- Keep changes limited to the requested module and smallest safe set of files. Mention unrelated pre-existing issues instead of fixing them unless they block the task.
- Do not use `git add .` by default. Stage explicit files or directories only after reviewing their diffs.
- Do not commit, push, fetch-and-merge, rebase, reset, merge, amend, or force-push unless explicitly requested. Never rewrite shared history.
- Use the repository's observed Conventional Commit-style subjects when a commit is requested, normally with an HRM scope such as `feat(hrm): ...` or `fix(hrm): ...`.
- Review `git diff --check`, the focused diff, and final `git status` before handoff. Do not include `.next`, `node_modules`, ignored environment files, debug output, or temporary artifacts.

## Dependency Policy

- Prefer existing packages and platform capabilities. Confirm a new dependency solves a real gap and cannot be reasonably handled by current React, Next.js, browser, or component-library APIs.
- Use npm and update `package.json` plus `package-lock.json` through npm commands. Never hand-edit the lockfile.
- Do not replace MSAL, the API client/hooks, shadcn/Radix primitives, Tailwind, or another established library without explicit architectural approval.
- Explain every added production dependency and its bundle/runtime/security impact in the handoff.

## Standard Task Workflow

1. Read this file and every applicable nested `AGENTS.md`.
2. Inspect the target route/component, related API types, shared primitives, and current `git status` before editing.
3. Search for an existing implementation that can be reused.
4. Identify the smallest safe change; write a short plan for cross-route or otherwise complex work.
5. Make focused changes without touching unrelated developer work.
6. Add or update tests when behavior changes. If the repository still has no suitable test harness, do not invent one silently; perform focused lint/type/build/browser verification and disclose the gap.
7. Run the most relevant verified commands, including targeted ESLint during iteration.
8. Review the final diff for generated churn, secrets, debug code, accidental public behavior changes, and accessibility/security regressions.
9. Report changed files, commands actually run and their outcomes, anything not verified, and remaining risks.

## Definition of Done

A task is complete only when the requested behavior works, existing architecture and contracts are preserved, relevant tests are updated where a harness exists, and the relevant lint/type-check/build/browser checks pass or their blockers are clearly reported. Review authentication, authorization, privacy, responsive behavior, and accessibility when affected. Leave no unrelated changes, debug logs, temporary files, commented-out code, exposed secrets, or unexplained generated diffs. Update documentation when public behavior, API contracts, setup, or commands change. Never claim a command passed unless it was executed successfully.

## Prohibited Actions

- Inventing APIs, environment variables, backend/database fields, directories, or commands.
- Making unrelated refactors or silently changing public behavior.
- Replacing the established architecture or libraries without authorization.
- Disabling or weakening lint rules, type safety, validation, tests, authentication, authorization, or accessibility to make a change pass.
- Hand-editing `lib/api/schema.ts`, dependency lockfiles, or generated/build output.
- Using unnecessary `any`, `@ts-ignore`, unchecked assertions, or hydration-warning suppression to hide root causes.
- Performing destructive database, filesystem, or Git operations without explicit authorization and verified targets.
- Committing ignored/generated artifacts that the repository intentionally excludes.

## Instruction Maintenance

Update the applicable `AGENTS.md` when a recurring repository-specific mistake or review comment reveals a missing rule. Keep instructions concise and practical, place genuinely module-specific overrides in the nearest nested file, and link to existing detailed documentation instead of copying it wholesale.
