# HRM File and Folder Structure

This document is the placement standard and structural audit for the HRM
frontend in `app/hrm`. It describes the current checkout, the approved target
architecture, and the migration work that must be completed separately.

Unless a path starts with `app/hrm/`, paths in this document are relative to
the `app/hrm` project root.

The target is a hybrid route-based and feature-based architecture:

- Next.js route files stay in `app/` and remain focused on routing,
  authorization composition, route parameters, metadata, and page composition.
- HRM business capabilities live in `features/<capability>/`.
- HRM-wide composed UI lives in `components/hrm/`.
- generic design-system primitives live in `components/ui/`.
- application infrastructure lives in `lib/`.

Do not perform broad moves while implementing an unrelated feature. Existing
legacy paths remain valid until their migration phase is approved and executed.

## Validated Baseline

This document was validated against the checkout on 2026-07-17:

- the active Next.js project root is `app/hrm`, not the repository root;
- the project uses `app/` directly and has no `src/` directory;
- protected browser requests use MSAL-aware helpers in `lib/api/`;
- API contracts are generated into `lib/api/schema.ts`;
- two Next.js Route Handlers proxy API traffic;
- there is no local backend, database client, ORM, migration, Server Action,
  feature service layer, declared runtime validation dependency used by active
  HRM flows, or test runner;
- there is no root `README.md`, root `package.json`, root `tsconfig.json`,
  or `AGENTS.override.md` in the current checkout;
- the only implemented frontend module is `app/hrm`; `app/template` is empty
  and provides no architecture pattern to copy.

The repository root `AGENTS.md`, `app/hrm/AGENTS.md`, the installed Next.js
16 project-structure and Server/Client Component guides, current source files,
`app/hrm/package.json`, `app/hrm/tsconfig.json`, and
`app/hrm/next.config.ts` are the implementation evidence. Supporting docs and
examples are not authoritative when they disagree with those sources.

## Executive Summary

The HRM app already has useful horizontal boundaries: route files are under
`app/`, application chrome is under `components/layout/`, auth UI is under
`components/auth/`, generic primitives are under `components/ui/`, and API
infrastructure is under `lib/api/`. The generic UI layer has no imports from
HRM feature, auth, layout, or API code. No static local import cycle was found.

The main scalability problem is that most administrative capabilities have no
feature implementation boundary. Ten route pages over 200 lines are Client
Components, and nine of them range from 355 to 849 lines while combining API
queries or mutations, permissions, state, workflows, dialogs, tables, and
presentation. The current `components/hrm/` directory mixes reusable
HRM-wide data primitives with feature-owned applicants, portfolio, careers, and
experimental careers code.

No Critical structural violation was found. The highest findings are High
severity because they increase correctness risk, client-bundle scope, merge
conflicts, and the cost of adding more HRM capabilities.

## Current Strengths

- `app/hrm/app/hrm/layout.tsx` composes authentication and the application
  shell without duplicating the shell across protected routes.
- `app/hrm/components/ui/` is domain-independent and remains the correct home
  for shadcn/Radix-style primitives.
- `app/hrm/components/layout/` has a clear shell/navigation responsibility.
- `app/hrm/components/auth/` and `app/hrm/lib/hrmAccess.ts` centralize the
  current client-side identity and permission experience.
- `app/hrm/lib/api/` centralizes token acquisition, request behavior, API
  hooks, errors, and generated OpenAPI types.
- `app/hrm/app/api/[...path]/route.ts` is cohesive despite its size: its
  helpers all support the same proxy responsibility.
- `app/hrm/components/hrm/data-*.tsx` and
  `app/hrm/components/hrm/status-badge.tsx` are narrow, composable
  HRM-level primitives rather than feature workflows.
- `app/hrm/app/hrm/loading.tsx`, `error.tsx`, and `not-found.tsx` provide
  protected-segment fallbacks.
- Static inspection found no local import cycles.

## Architecture Audit

| Severity | Current path or pattern | Expected path or pattern | Concern | Recommended action |
| --- | --- | --- | --- | --- |
| High | `app/hrm/app/hrm/roles-permissions/page.tsx` (849 lines), `app/hrm/app/hrm/employees/page.tsx` (572), `app/hrm/app/hrm/applicants/page.tsx` (514), `app/hrm/app/hrm/profiles/[id]/page.tsx` (429), `app/hrm/app/careers/page.tsx` (380), `app/hrm/app/hrm/positions/page.tsx` (370), `app/hrm/app/hrm/dashboard/page.tsx` (366), `app/hrm/app/hrm/azure-users/page.tsx` (366), `app/hrm/app/hrm/departments/page.tsx` (355), and `app/hrm/app/(auth)/login/page.tsx` (212) are full Client Components. | Thin Server Component route pages composing feature-owned or route-private Client Components. | Route files combine data access, mutations, permission decisions, state, workflows, tables, forms, dialogs, and JSX. They create broad client boundaries and frequent merge-conflict surfaces. | Migrate each capability to `features/<capability>/` and route-only login behavior to `_components/`; leave `page.tsx` as composition. Protected data may remain in an MSAL-aware feature Client Component until a server session exists. |
| High | Most capabilities exist only as code inside `app/hrm/app/hrm/<route>/page.tsx`. | A named owner under `app/hrm/features/<capability>/`. | Hooks, types, permissions, constants, and workflows have no durable ownership boundary, so reuse tends to flow through route files or catch-all folders. | Introduce feature roots incrementally during approved refactors; do not create empty folders. |
| High | `app/hrm/app/hrm/leave-settings/page.tsx` declares an inline server fetch, derives a base URL from an undocumented variable, converts any failure to an empty list, and then renders a Client Component that performs its own authenticated queries. | One explicit data-loading strategy owned by the leave feature, with failures preserved. | The route mixes infrastructure and composition, duplicates retrieval, and can make an authorization or connectivity failure look like valid empty data. | Decide whether the feature remains client-loaded or gains a supported server-authenticated query. Remove the duplicate path only in the migration task and validate loading/error behavior. |
| High | Careers code is split across `components/hrm/careers/`, unused `components/hrm/landing/`, `components/hrm/test-careers/`, `app/careers/`, and the public `app/test-careers/` route. | One canonical `features/careers/` owner plus a thin `app/careers/page.tsx`. | Multiple implementations can diverge in UI, data, validation, and public behavior; the test route is a deployed route, not a private experiment. | Obtain approval for the canonical implementation, migrate it, and remove the alternatives in a separate task. |
| Low | The portfolio screen, section configuration, scroll spy, and table composition now live under `features/portfolio/`; the existing add and row-action dialogs remain under `components/hrm/portfolio/modals/`. | All portfolio-owned workflows eventually live under `features/portfolio/`. | The route-to-feature dependency direction is corrected, but the legacy modal location still splits feature ownership. | Move individual dialogs only when their forms/actions are meaningfully reworked; keep their current API contracts intact meanwhile. |
| Medium | Confirmed unreferenced candidates include `components/custom/dashboard/`, `components/hrm/landing/`, `app/hrm/app/hrm/employees/modal.tsx`, and `app/hrm/app/hrm/dashboard/data.json`. | Every retained source directory has a current owner and importer. | Vague or dead alternatives make future agents copy the wrong pattern and increase dependency/maintenance surface. | Confirm no runtime or planned consumer, then remove or migrate the files in the cleanup phase. |
| Medium | `components/hrm/types.ts` contains only careers types plus a large in-memory job catalog. | Careers-owned contracts and fixtures, using specific filenames. | The vague global name hides ownership and becomes a centralized merge-conflict point. | Move contracts to `features/careers/types/` and temporary demo data to `features/careers/fixtures/`; replace fixtures with generated API types when the endpoint is integrated. |
| Medium | Applicants and applicant profile routes declare endpoint contracts, payload wrappers, status maps, date helpers, and permission strings inside pages. | Generated types first; narrow feature adapter types, constants, permissions, and utilities when the OpenAPI response is generic. | Local route contracts are hard to reuse and drift silently. The current employee-applicant OpenAPI endpoint exposes dictionary-shaped data, so blind casting to an unrelated generated model is also unsafe. | Put explicit adapter/view-model types in `features/applicants/types/`, document the generic upstream contract, and keep mappings beside the feature. |
| Medium | `leave-settings-client.tsx` and `employees/modal.tsx` are colocated route implementation files without a private directory. | `app/<route>/_components/` for truly route-only code, or `features/<capability>/components/` for reusable capability UI. | Ownership is unclear, and non-private names are easy to mistake for route conventions. | Classify each file by actual consumers during migration; do not move a reusable feature component into a route-private folder. |
| Medium | `components/custom/table-template.tsx` is the approved project-owned composition for active HRM tables; `components/custom/dashboard/` remains unreferenced legacy code. | `components/custom/` contains deliberate cross-capability templates, while domain UI stays in features and generic primitives stay in `components/ui`. | A broad custom directory can still become a catch-all if feature-specific code is placed there. | Keep only explicitly approved templates here and remove or migrate the legacy dashboard implementation separately. |
| Medium | Route-specific `loading.tsx` and `error.tsx` files are mostly absent; client pages implement ad hoc loading/error branches. | Segment boundaries where route-level work can suspend or throw, plus feature-level async states for client requests. | As server composition grows, the shared `app/hrm/app/hrm/loading.tsx` fallback may be too broad and feature error handling may remain inconsistent. | Add boundaries when a route gains server loading or a distinct recovery experience; do not add empty boilerplate to every segment. |
| Medium | There is no unit, integration, or end-to-end test harness. | Co-located feature tests and route/API integration tests once a runner is approved. | Large structural migrations currently depend on lint, types, build, and manual checks, raising regression risk. | Choose a test strategy before the broad migration; do not invent commands or folders before tooling is approved. |
| Low | Careers component filenames use PascalCase while most project files are kebab-case; auth infrastructure uses names such as `authConfig.ts`, `hrmAccess.ts`, and `msalInstance.ts`. | Kebab-case filenames, PascalCase component/type symbols, camelCase functions. | Inconsistent names slow discovery and make future placement less predictable. | Rename only in a dedicated consistency phase with import and route validation. |
| Low | The former `components/hrm/data-*.tsx` fragments duplicated ownership across toolbar, state, header, and pagination files. | One deliberate cross-capability table composition with feature-supplied rows and controls. | Separate wrappers made page composition noisy and encouraged partially adopted table patterns. | Keep the consolidated `components/custom/table-template.tsx` contract small and adapt each table through optional props instead of creating parallel shells. |

## Inconsistencies in the Previous Document

The previous version was a generic refactoring prompt and was not safe as an
implementation standard:

- it documented a `src/` tree that does not exist;
- it presented `features/`, `components/shared/`, database access, Server
  Actions, services, schemas, and tests as though they already existed;
- it prescribed Zod even though Zod is not a declared project dependency (the
  only current source import is inside the unreferenced custom dashboard tree);
- it described database queries even though this checkout is frontend-only and
  the shared SIMS API is external;
- it did not account for browser-side MSAL token acquisition, which currently
  prevents a mechanical conversion of protected reads to Server Components;
- it did not identify existing feature code, legacy candidates, generated API
  contracts, or the proxy Route Handlers;
- it used paths relative to an imagined project instead of actual
  `app/hrm/...` paths;
- it required formatter and test commands that are not declared by the project.

## Target Directory Tree

Legend:

- **[EC] Existing and correct**
- **[ESC] Existing but should change**
- **[RN] Recommended new directory**
- **[LC] Legacy or candidate for removal**

```text
app/hrm/
├── app/                                           [EC]
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx                           [ESC]
│   │       └── _components/                       [RN]
│   ├── api/
│   │   ├── [...path]/route.ts                     [EC]
│   │   └── me/route.ts                            [EC]
│   ├── careers/
│   │   └── page.tsx                               [ESC]
│   ├── hrm/
│   │   ├── layout.tsx                             [EC]
│   │   ├── loading.tsx                            [EC]
│   │   ├── error.tsx                              [EC]
│   │   ├── not-found.tsx                          [EC]
│   │   ├── applicants/page.tsx                    [ESC]
│   │   ├── azure-users/page.tsx                   [ESC]
│   │   ├── dashboard/page.tsx                     [ESC]
│   │   ├── departments/page.tsx                   [ESC]
│   │   ├── employees/page.tsx                     [ESC]
│   │   ├── leave-settings/page.tsx                [ESC]
│   │   ├── portfolio/page.tsx                     [ESC]
│   │   ├── portfolio/[id]/page.tsx                [ESC]
│   │   ├── positions/page.tsx                     [ESC]
│   │   ├── profiles/[id]/page.tsx                 [ESC]
│   │   ├── roles-permissions/page.tsx             [ESC]
│   │   └── <route>/_components/                   [RN, route-only only]
│   └── test-careers/                              [LC]
├── features/                                      [EC, incremental]
│   ├── applicants/
│   │   ├── components/                            [RN]
│   │   ├── hooks/                                 [RN, when needed]
│   │   ├── types/                                 [RN, when needed]
│   │   ├── utils/                                 [RN, when needed]
│   │   ├── constants/                             [RN, when needed]
│   │   └── permissions.ts                         [RN, when needed]
│   ├── azure-users/                               [RN]
│   ├── careers/                                   [RN]
│   ├── dashboard/                                 [RN]
│   ├── employees/                                 [RN]
│   ├── leave-settings/                            [RN]
│   ├── organization/                              [RN]
│   ├── portfolio/                                 [EC]
│   └── access-control/                            [RN]
├── components/
│   ├── auth/                                      [EC]
│   ├── layout/                                    [EC]
│   ├── hrm/                                       [ESC, target HRM-wide UI only]
│   │   ├── status-badge.tsx                       [EC]
│   │   ├── applicants/                            [ESC]
│   │   ├── careers/                               [ESC]
│   │   ├── portfolio/                             [ESC]
│   │   ├── landing/                               [LC]
│   │   └── test-careers/                          [LC]
│   ├── custom/                                    [EC, approved templates only]
│   │   ├── table-template.tsx                     [EC]
│   │   └── dashboard/                              [LC]
│   └── ui/                                        [EC]
├── hooks/
│   └── use-mobile.ts                              [EC]
├── lib/
│   ├── api/                                       [EC]
│   │   ├── client.ts                              [EC]
│   │   ├── hooks.ts                               [EC]
│   │   ├── index.ts                               [EC]
│   │   └── schema.ts                              [EC, generated]
│   ├── auth/                                      [RN, optional consolidation]
│   ├── authConfig.ts and msal*.ts                 [ESC]
│   ├── hrmAccess.ts                               [ESC]
│   ├── notifications.ts                           [EC]
│   └── utils.ts                                   [EC, narrowly scoped cn helper]
├── docs/                                          [EC]
├── public/                                        [EC]
└── tests/                                         [RN, only after a harness exists]
```

Do not create every optional subdirectory shown above. Create a directory when
the feature has at least one file with that responsibility. A small feature can
start with `features/<capability>/components/<capability>-screen.tsx` and add
other folders only when real responsibilities emerge.

## Placement Rules

### Next.js Route Files

`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`,
`not-found.tsx`, and `route.ts` remain under `app/`.

A route page may:

- await and validate Next.js 16 `params` or `searchParams`;
- compose page-level auth or permission UI supported by the current auth model;
- initiate supported page-level data loading;
- compose feature components;
- select route-level loading, empty, not-found, and error behavior;
- export metadata when appropriate.

A route page should not contain:

- a complete large form, table, dashboard, or multi-tab interface;
- reusable endpoint contracts, validation schemas, permissions, or constants;
- API mutation workflows or extensive event handling;
- direct database implementation details;
- hundreds of lines of interactive JSX.

Protected HRM pages do not currently have a server-readable session. Do not
pretend browser MSAL tokens are available in a Server Component. The near-term
pattern is a Server Component `page.tsx` that composes a narrowly owned feature
Client Component; the shared backend remains the authoritative authorization
boundary.

### Route-Only Components

Use `app/<route>/_components/` only when a component:

- has one route consumer;
- primarily composes that route;
- has no meaningful HRM business identity outside the segment.

Use `_lib/` for route-private parsing or composition helpers only. A feature
workflow does not become route-only merely because it has one current page.

### Feature-Owned Code

Use `features/<capability>/` when code represents one HRM business capability.
Examples include applicants, employees, portfolio, organization, leave
settings, careers, dashboard, Azure import, and access control.

Within a feature:

- `components/`: feature presentation and interactive screens;
- `hooks/`: reusable client state and MSAL-aware API query/mutation
  orchestration; hook names start with `use`;
- `types/`: feature view models or explicit adapter types not adequately
  represented by the generated OpenAPI contract;
- `schemas/`: runtime or form validation shared by more than one component;
- `permissions.ts`: stable permission identifiers and feature access helpers;
- `constants/`: stable domain constants and configuration;
- `utils/`: pure, specifically named feature functions;
- `fixtures/`: clearly temporary demo/test data, never production authority;
- `services/`: non-React workflow orchestration when a real workflow warrants
  it;
- `server/`: server-only queries or actions only after a supported server auth
  and runtime design exists.

Do not create `actions.ts`, `queries.ts`, `service.ts`, or a folder merely
to match a template. The current mutation convention is
`useApiMutation`/`request` through `lib/api/`, not Next.js Server Actions.

Features may import `components/ui`, `components/hrm`, `components/auth`,
`lib/api`, and application infrastructure. They must not import another
feature's private files or any route implementation under `app/`.

### Shared UI

- `components/ui/` contains reusable design-system primitives with no HRM
  business rules, permission codes, API calls, or feature imports.
- `components/hrm/` contains composed UI genuinely shared by multiple HRM
  capabilities. It may know HRM interaction patterns but must not own one
  feature's workflow.
- `components/layout/` contains shell, navigation, breadcrumbs, sidebar, and
  top-bar code.
- `components/auth/` contains the current app-wide auth and permission UI.

This checkout has no cross-application frontend package. Do not create
`components/shared/` based on possible reuse by future SIMS apps. Cross-app
sharing requires an approved workspace/package boundary first.

### API, Queries, Actions, and Services

- Browser reads and mutations reuse `lib/api` so MSAL token acquisition,
  no-store behavior, envelope handling, and `ApiError` behavior stay
  consistent.
- Feature hooks may compose those primitives but must not duplicate the shared
  request client.
- `app/api/**/route.ts` is reserved for HTTP boundaries such as the existing
  proxy and `/api/me`; it is not a general feature service folder.
- Server queries belong in `features/<capability>/server/` only when they run
  on the server and have a supported authentication path.
- Server Actions belong in that same server boundary only for genuine
  Next.js-exposed mutations. Do not use them as a second API architecture.
- Services contain business workflow orchestration, not JSX, React state, or
  raw design-system composition.
- There is no local database layer. Do not add `lib/db`, database queries,
  schemas, or migrations from this frontend audit.

### Contracts, Schemas, and Validation

- Prefer `components` and `paths` types from `lib/api/schema.ts`.
- Never hand-edit `lib/api/schema.ts`.
- When the OpenAPI contract is generic, such as a dictionary response, define a
  narrow adapter type in the owning feature and document the assumption.
- Do not copy the same request/response shape into multiple pages.
- Continue using native constraint validation and generated request
  nullability unless a separate task approves a runtime validation library.
- Put an approved reusable validation schema in the feature's `schemas/`
  directory, not inside a page or large form component.

### Permissions

- The shared permission UI remains in `components/auth/`; identity/access
  infrastructure remains in `lib/`.
- Feature permission identifiers belong in
  `features/<capability>/permissions.ts` when a capability has several checks.
- Navigation-only metadata remains in
  `components/layout/hrm-navigation.ts`.
- Client guards improve UX but never replace authorization in the shared API.

### Types, Constants, Utilities, and Hooks

- Use specific filenames such as `format-application-date.ts`,
  `applicant-status.ts`, or `employee-form.types.ts`.
- Do not create catch-all `helpers.ts`, `common.ts`, `data.ts`, or a broad
  `types.ts`.
- `lib/utils.ts` remains acceptable because it contains only the established
  `cn` styling helper.
- Top-level `hooks/` is for application-wide client behavior. Feature hooks
  stay with their feature.
- Constants are immutable domain/configuration values. Mock records belong in
  fixtures and must be clearly identified as non-authoritative.

### Tests

No test runner is currently declared. After a runner is approved:

- co-locate unit tests as `*.test.ts` or `*.test.tsx` beside the feature
  behavior they verify;
- use a top-level test directory only for integration or end-to-end suites that
  cross feature boundaries;
- test API Route Handlers at their HTTP boundary;
- do not add empty `__tests__` directories or invent test commands.

### Naming and Imports

- File and folder names use kebab-case; dynamic route folders retain `[id]`.
- React components and types use PascalCase.
- Functions and hooks use camelCase; hooks start with `use`.
- Constants use uppercase snake case when they are module-level constants.
- Use `@/` for cross-directory imports and relative imports within one small
  feature or route-private folder.
- Prefer direct imports. Keep barrel files small and intentional; the existing
  `lib/api/index.ts` is the only current barrel.
- Dependencies flow from routes to features to shared UI/infrastructure. A
  feature must never import a route, and generic UI must never import a feature.

## Practical Placement Examples

Feature and route-private paths below that do not yet exist are proposed
placements, not claims about current files.

| New code | Correct placement |
| --- | --- |
| Applicants route entry | `app/hrm/app/hrm/applicants/page.tsx` |
| Applicants interactive screen | `app/hrm/features/applicants/components/applicants-screen.tsx` |
| Applicants query/filter state shared by its screens | `app/hrm/features/applicants/hooks/use-applicants.ts` |
| Applicant permission identifiers | `app/hrm/features/applicants/permissions.ts` |
| Applicant status mapping | `app/hrm/features/applicants/constants/applicant-status.ts` |
| Pure applicant date formatter | `app/hrm/features/applicants/utils/format-application-date.ts` |
| Component used only by the login route | `app/hrm/app/(auth)/login/_components/login-client.tsx` |
| Table composition used by several HRM capabilities | `app/hrm/components/custom/table-template.tsx` |
| Generic button or dialog primitive | `app/hrm/components/ui/` |
| Shell navigation metadata | `app/hrm/components/layout/hrm-navigation.ts` |
| Shared authenticated request behavior | `app/hrm/lib/api/` |
| Generated endpoint contract | `app/hrm/lib/api/schema.ts` |
| Public careers fixture pending API integration | `app/hrm/features/careers/fixtures/job-openings.ts` |
| Future server-only feature query | `app/hrm/features/<capability>/server/queries.ts`, only after server auth is approved |

## File Placement Checklist

Before creating a file:

- Which business capability owns this code?
- Is it route-only, feature-owned, HRM-wide, or application infrastructure?
- Does an existing route, feature, primitive, hook, or API helper already own
  this responsibility?
- Does the file genuinely require a Client Component boundary?
- Is it presentation, validation, data access, authorization, business logic,
  configuration, or a contract?
- Does protected data require the current browser MSAL client, or is there an
  approved server authentication path?
- Can the generated OpenAPI contract be used directly?
- Would placing it in a shared folder introduce feature-specific dependencies?
- Is the proposed name specific enough to reveal responsibility?
- Is a new folder justified by a real file, rather than an imagined future
  abstraction?
- Does the dependency direction remain route -> feature -> shared
  UI/infrastructure?
- If the placement differs from this document, has the architectural change
  been approved and documented?

## Prioritized Migration Plan

Do not execute this plan as part of the documentation audit.

### Phase 1 — Critical Boundary and Correctness Fixes

| Affected files | Intended destination or outcome | Expected benefit | Dependencies | Regression risk | Validation required |
| --- | --- | --- | --- | --- | --- |
| `app/hrm/app/hrm/leave-settings/page.tsx`, `leave-settings-client.tsx` | One supported loading path under `features/leave-settings/`; thin route page | Removes duplicate fetch and prevents failures from appearing as empty success | Decision on browser-only versus server-authenticated loading | High | Authenticated load, empty data, 401/403, API failure/retry, lint, types, build |
| `app/hrm/app/careers/`, `app/hrm/app/test-careers/`, three careers component trees | Select one canonical public careers implementation; mark alternatives for removal | Prevents public-route and business-rule divergence | Team approval of canonical design and whether `/test-careers` is disposable | High | Public route content, responsive layout, application flow, accessibility, build |
| Permission strings embedded in large pages | Feature `permissions.ts` files as each feature migrates | Makes access rules discoverable and reviewable | Feature boundary must exist first | Medium | Super-admin and allowed/denied permission cases; API remains authoritative |

### Phase 2 — Large-File and Responsibility Separation

| Affected files | Intended destination | Expected benefit | Dependencies | Regression risk | Validation required |
| --- | --- | --- | --- | --- | --- |
| `roles-permissions/page.tsx` | `features/access-control/components/`, hooks, types, permissions | Separates four tab workflows, API mutations, and dialogs from routing | Phase 1 permission convention | High | Every tab, role assignment/removal, permission create/delete, denied states |
| `employees/page.tsx` | `features/employees/` | Separates table, filters, form/dialog, invite/delete workflows, and mapping helpers | Agree employee feature public surface | High | CRUD, invite, department/position options, portfolio navigation, responsive table |
| `applicants/page.tsx`, `profiles/[id]/page.tsx`, existing applicant components | `features/applicants/` | Consolidates list/detail contracts, status rules, filters, create/process actions | Document generic OpenAPI adapter types | High | Search/date filters, pagination, create/process/delete, detail parallel requests |
| `departments/page.tsx`, `positions/page.tsx` | `features/organization/` with separate department and position screens | Removes duplicated CRUD page patterns while preserving distinct contracts | Identify reusable form/table behavior without over-generalizing | High | Both CRUD flows, dependencies, permissions, empty/error/loading states |
| `dashboard/page.tsx` | `features/dashboard/` | Separates metric queries, chart transforms, cards, and permission wrapper | Confirm card endpoints and error policy | Medium | All cards, partial failures, chart, loading skeletons, responsive layout |
| `azure-users/page.tsx` | `features/azure-users/` | Separates selection/import workflow from route composition | Preserve request headers and permission checks | High | Search, selection, import success/partial failure, duplicate prevention |
| `leave-settings-client.tsx` | `features/leave-settings/components/` plus hooks/types | Splits leave type, allocation, balance, and dialog responsibilities | Phase 1 data-loading decision | High | All settings mutations and year/employee filters |
| `app/careers/page.tsx`, login page | Canonical `features/careers/`; login route-private `_components/` | Narrows public/auth route client boundaries | Canonical careers decision; stable login storage behavior | Medium | Careers application flow; login redirect, pending state, hydration |

### Phase 3 — Shared-Code Cleanup

| Affected files | Intended destination or outcome | Expected benefit | Dependencies | Regression risk | Validation required |
| --- | --- | --- | --- | --- | --- |
| `components/custom/dashboard/` | Remove if still unreferenced, or move retained code to dashboard/layout owner | Eliminates misleading catch-all pattern | Confirm no runtime/dynamic consumer | Low | Static import search, lint, types, build |
| `components/hrm/landing/`, `components/hrm/test-careers/`, `app/test-careers/doc.md` | Remove after canonical careers migration; move any durable design rationale to `docs/` | Removes duplicate and route-embedded documentation | Careers approval and migration complete | Medium | Careers route comparison and build |
| `app/hrm/app/hrm/employees/modal.tsx`, `app/hrm/app/hrm/dashboard/data.json` | Remove if still unreferenced | Reduces dead-code ambiguity | Confirm no dynamic consumer | Low | Static search, lint, types, build |
| `components/custom/table-template.tsx` | Keep as the canonical active-table composition; domain filters and row actions remain with their owners | Prevents fragmented command, state, and pagination wrappers | Active consumers across HRM data screens | Medium | Applicants, Employees, Azure Users, organization, leave, access-control, dashboard, and portfolio tables |
| Repetitive portfolio add/row-action dialogs | Extract stable portfolio form/action primitives only where contracts match | Reduces duplicated form and mutation behavior | Portfolio migration and contract comparison | High | Every portfolio section CRUD workflow |

### Phase 4 — Naming and Consistency Cleanup

| Affected files | Intended destination or outcome | Expected benefit | Dependencies | Regression risk | Validation required |
| --- | --- | --- | --- | --- | --- |
| PascalCase careers filenames | Kebab-case feature filenames | Consistent discovery | Careers migration | Low | Import search, lint, types, build |
| `components/hrm/types.ts` | Specific careers type/fixture files | Clear ownership and smaller conflict surface | Canonical careers model | Medium | Careers compile and application flow |
| `authConfig.ts`, `hrmAccess.ts`, `msalInstance.ts`, `msalLogout.ts` | Optional `lib/auth/` consolidation with kebab-case filenames | Clear infrastructure boundary | Team approval; coordinate all imports | High | Login, redirect, logout, account switch, permission cache, hydration |
| Vague route/local filenames | Specific feature or route-private names | Predictable ownership | Relevant feature migration | Low | Import search and focused route verification |

### Phase 5 — Optional Architectural Improvements

| Affected area | Intended outcome | Expected benefit | Dependencies | Regression risk | Validation required |
| --- | --- | --- | --- | --- | --- |
| High-value routes | Route-specific loading/error boundaries where server work or recovery differs | Better streaming and fault isolation | Feature migration establishes server/route behavior | Medium | Suspense/error/reset/not-found behavior |
| Feature import boundaries | ESLint or another existing-tool-compatible boundary rule | Prevents route imports and cross-feature internals | Stable target tree first | Medium | Lint false-positive review and full lint |
| Tests | Approved unit/integration/e2e harness and first critical workflow coverage | Makes later migrations safer | Team chooses tools and commands | Medium | New test command plus existing lint/types/build |
| Protected Server Component loading or Server Actions | Server-readable session/token design | Enables genuine server data loading without inventing auth | Security and backend architecture approval | High | Threat review, auth/permission tests, no token leakage, build |
| Cross-SIMS shared frontend code | Approved workspace/package rather than `app/hrm/components/shared` | Safe reuse across future apps | Another real frontend consumer and workspace design | High | Package boundaries, builds for every consuming app |

## Validation for Documentation Changes

For documentation-only edits:

1. inspect the final diff;
2. confirm no application source file was modified by this task;
3. verify every unmarked current path exists;
4. verify every absent path is marked **[RN]** or **[LC]**;
5. compare this document with root and nested `AGENTS.md`;
6. run `git diff --check`;
7. run a documentation linter only if the project declares one.

The project currently declares no Markdown formatter or documentation lint
script. Do not substitute an invented command.

## Decisions Requiring Team Approval

- Which careers implementation is canonical, and may `/test-careers` and its
  supporting code be removed?
- Should the `features/` migration be capability-by-capability or one
  coordinated structural change?
- Should protected data remain browser-loaded through MSAL, or will the team
  design a server-readable session for Server Component queries and Server
  Actions?
- Which test runner and first critical workflows should be adopted before the
  broad migration?
- Should auth infrastructure be consolidated into `lib/auth/`, or should the
  current flat `lib/` layout remain?
- If future SIMS frontends need shared UI, what workspace/package boundary will
  own it?

## Documentation Drift Rule

Update this document only when an approved architecture, public route, feature
boundary, shared layer, API contract workflow, or verified command materially
changes. Source code and generated contracts remain authoritative evidence.
When implementation conflicts with this standard, stop and explain the
conflict before introducing a parallel pattern.
