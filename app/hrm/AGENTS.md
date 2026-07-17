# HRM Module Instructions

Before working anywhere under `app/hrm`, read and follow the repository-wide instructions in [`../../AGENTS.md`](../../AGENTS.md). This file contains only HRM-specific additions or overrides; the root instructions continue to apply unless this file explicitly says otherwise.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## HRM File and Folder Structure

Before adding or moving files under this module, read
[`docs/file-structure.md`](docs/file-structure.md).

- Keep Next.js special files in `app/` focused on routing, route parameters,
  metadata, supported authorization composition, and page composition.
- Put route-only implementation in the route segment's private `_components/`
  or `_lib/` directory.
- Put new or meaningfully reworked HRM capability code in
  `features/<capability>/`; do not move legacy files during an unrelated task.
- Reserve `components/hrm/` for UI genuinely shared by multiple HRM
  capabilities and `components/ui/` for domain-independent primitives.
- Reuse `lib/api/` and generated OpenAPI types. When an endpoint contract is
  generic, keep the documented adapter type inside the owning feature.
- Keep Client Component boundaries narrow. Protected browser requests continue
  through the MSAL-aware API client unless a server authentication design is
  explicitly approved.
- Do not invent database code, Server Actions, services, schemas, shared
  packages, or tests that the current project does not require or support.
- Use specific kebab-case filenames; avoid catch-all `helpers.ts`, `common.ts`,
  broad `types.ts`, or unrelated `utils.ts` files.
- Dependencies flow from routes to features to shared UI/infrastructure.
  Features must not import route implementation files or another feature's
  private internals.
- If a requested implementation conflicts with the documented structure, stop
  and explain the conflict before introducing a new pattern. Update the
  structure document after an approved architecture change.

## Table Row Actions

- Count only the row actions currently visible after permission checks and
  row-specific conditions. Render one to three actions directly as icon-only
  buttons; use an overflow dropdown only when four or more actions are visible.
- Give every icon-only action a descriptive accessible name and a tooltip when
  using the shared `TableRowActions` component. Keep destructive actions visually
  distinct and require `AlertDialog` confirmation where the action is not easily
  reversible.
