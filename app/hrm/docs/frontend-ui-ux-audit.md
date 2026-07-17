# SPUP HRM Frontend UI/UX Audit

**Audit date:** 2026-07-16  
**Scope:** `app/hrm`  
**Method:** Static implementation audit of 123 TSX files, shared CSS/theme primitives, representative authenticated workflows, public careers screens, and application states. Existing local working-tree changes were treated as the current implementation. No application code was changed. Runtime checks that require a valid Microsoft session and live API were not used as evidence; responsive conclusions are therefore implementation-based and should be confirmed in Phase 6 with authenticated browser testing.

## A. Executive Summary

The HRM frontend has a solid technical base: current shadcn primitives, semantic CSS variables, permission-aware navigation, reusable dialogs, and explicit loading, empty, error, and destructive-confirmation states in several core workflows. The authenticated admin screens are generally restrained and appropriate for data-heavy university work.

The overall quality is **functional but visually fragmented**. The main theme issue is not the green brand color itself; it is incomplete governance. The authenticated shell mostly uses semantic tokens, while status badges, dashboard highlights, profile surfaces, login/error imagery, and especially the public careers experience introduce hardcoded emerald, amber, neutral, white, and black values. The audit found 392 hard-color class occurrences across 16 TSX files. Those choices do not automatically adapt to dark mode and form a second visual language.

The most consequential usability problems are missing or inconsistent page headings, non-functional navigation/command items, dense tables that only scroll on mobile, and unlabeled native filter controls. The most consequential accessibility problem is control sizing: the shared button system defaults to 28 px height and permits 20–32 px icon buttons, below the 24 px WCAG 2.2 minimum in one variant and below the more comfortable 44 px target throughout. Focus styling exists in shared primitives, but raw buttons and links do not consistently inherit it.

The three most important improvements are:

1. Establish a tested semantic color/state layer, including success, warning, info, and chart tokens in light and dark mode.
2. Standardize the authenticated page frame, data toolbar, table, empty/loading/error states, and control sizes.
3. Repair workflow clarity: real active navigation, real command actions, semantic page identity, associated filter labels, responsive table alternatives, and non-color status cues.

## B. Current Design-System Inventory

| System | Current implementation | Defined/used in |
| --- | --- | --- |
| Color model | OKLCH CSS variables mapped into Tailwind semantic utilities. Core roles include background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, sidebar, and five charts. | `app/globals.css` |
| Light theme | White background/card; near-black cool foreground; medium SPUP-like green primary; cool gray secondary/muted/borders; warm yellow-brown chart ramp. | `app/globals.css:44-75` |
| Dark theme | Cool near-black background; elevated dark card/sidebar; darker green primary; translucent white borders/inputs; same chart ramp as light mode. | `app/globals.css:77-108` |
| Typography | Inter is assigned to `--font-sans`; Noto Sans to `--font-heading`; Geist Mono to mono. Geist Sans is loaded but not selected by the theme. Most pages use sans; only selected shared elements explicitly use `font-heading`. | `app/layout.tsx`, `app/globals.css`, `components/ui/empty.tsx` |
| Radius | Base `0.45rem`; generated scales from 0.6× through 2.6× (`sm` to `4xl`). Feature code also adds `rounded-lg`, `rounded-xl`, `rounded-2xl`, and arbitrary 10 px radii. | `app/globals.css:35-41`; feature components |
| Spacing/density | Admin shell uses 16 px mobile and 24 px desktop page padding, 16–24 px section gaps, and compact tables/forms. Shared buttons are unusually dense: 20–32 px high, default 28 px. | `components/layout/app-shell.tsx`; `components/ui/button.tsx` |
| Shadows | Admin surfaces rely mainly on borders and default component shadows. Careers uses custom offset shadows, `shadow-2xl`, and arbitrary colored shadows. No semantic elevation scale exists. | UI primitives; `components/hrm/careers/*` |
| Buttons | CVA variants: default, outline, secondary, ghost, destructive, link; six sizes. Semantic colors and focus rings are present. Destructive is a tinted treatment rather than solid danger. | `components/ui/button.tsx` |
| Badges/status | Shared badge variants are semantic but only generic. Applicants bypass them with blue/green/red/yellow/purple maps. Other screens use secondary/outline badges without domain meaning. | `components/ui/badge.tsx`; `app/hrm/applicants/page.tsx` |
| Forms | Shared Input, Label, Field, Select, Checkbox, Switch, validation primitives exist. Feature pages frequently use native `input`, `select`, and `button` with repeated class strings. | `components/ui/*`; applicants/employees/azure-users/leave-settings |
| Tables | A shared shadcn Table exists, but applicants, employees, and Azure users build separate raw table/toolbar/pagination structures. Horizontal overflow is the main small-screen strategy. | `components/ui/table.tsx`; relevant pages |
| Navigation | Collapsible permission-filtered sidebar and sticky topbar. Sidebar tokens exist. Active-route state is not supplied; several entries point to `#`. | `components/layout/app-sidebar.tsx`, `app-topbar.tsx`, `components/ui/sidebar.tsx` |
| Application states | Loading, empty, API error, pagination, dialogs, and destructive confirmations exist on many CRUD pages. A shared Empty primitive exists but is rarely used. Error pages are image-led full-screen overlays. | `components/ui/empty.tsx`, `error-page.tsx`; feature pages |
| Charts | Five yellow-to-brown sequential tokens are identical in both themes. The dashboard currently uses progress bars/tables more than the chart primitives. | `app/globals.css`; `components/ui/chart.tsx` |
| Theme switching | Dark variables exist, but the provider only installs MSAL. No theme provider or visible user control was found in the audited implementation. | `app/provider.tsx`, `app/globals.css` |
| Public careers style | Editorial/promotional emerald-and-amber system with Epilogue, large rounded cards, custom shadows, white/neutral fixed surfaces, and duplicated feature components. | `app/careers/page.tsx`, `components/hrm/careers/*`, `components/hrm/landing/*` |

## C. Findings Table

Confirmed issues are labeled **Confirmed**. Items labeled **Recommendation** are design-direction judgments rather than defects.

| ID | Area | Severity | File or Component | Problem | User Impact | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | Accessibility | High | `components/ui/button.tsx` | **Confirmed:** button heights range from 20 px to 32 px; `icon-xs` is 20 px. This misses WCAG 2.2's 24×24 CSS px target minimum and all sizes miss the preferred 44 px touch target unless spacing exceptions apply. | Small click/tap targets increase errors and fatigue in dense workflows. | Make 36 px the compact admin default, 40 px standard, and at least 24 px for every icon control; ensure 44 px effective mobile targets through size or spacing. |
| F-02 | Navigation | High | `components/layout/app-sidebar.tsx:77-130,145-153` | **Confirmed:** Leave Applications, Designations, User Management, and System Settings are rendered as actions but point to `#` or have no navigation behavior. | Users cannot distinguish available features from placeholders and may think the app is broken. | Hide unavailable destinations, mark them explicitly “Coming soon,” or wire real routes; never expose inert primary navigation. |
| F-03 | Navigation | High | `components/layout/app-sidebar.tsx` | **Confirmed:** `SidebarMenuButton` never receives `isActive`; current location is not communicated visually or through `aria-current`. | Users lose orientation, especially after deep links or when the sidebar is collapsed. | Derive active state from `usePathname`, set `isActive`, and emit `aria-current="page"`. |
| F-04 | Information hierarchy | High | `app/hrm/dashboard/page.tsx`, `app/hrm/applicants/page.tsx` | **Confirmed:** dashboard has no semantic page heading; applicants contains an empty left header container. | Screen-reader users lack consistent page identity and actions are not consistently located near the content they affect. | Give each route a direct semantic `h1`, visually hidden when a visible title would be redundant, keep breadcrumbs in the topbar, and place actions in the nearest relevant toolbar or section. |
| F-05 | Forms/accessibility | High | `app/hrm/applicants/page.tsx:156-190`; similar filters in employees/Azure users | **Confirmed:** date and search inputs rely on placeholder/proximity and have no programmatic labels. The clear control is a raw text button. | Screen-reader users cannot reliably identify fields; placeholders disappear after entry. | Add visible or `sr-only` labels, use shared Input/Button, and group the date range with a fieldset/legend. |
| F-06 | Responsive tables | High | applicants, employees, Azure users pages | **Confirmed:** desktop tables are preserved at small widths with `overflow-x-auto`; six-column action tables have no mobile prioritization. | At 360 px, comparison and row actions require repeated horizontal scrolling and headers lose context. | Keep scroll at 768 px where appropriate; at 360 px use priority columns plus a row detail/action sheet or stacked record cards. |
| F-07 | Theme | High | `app/globals.css:77-108` | **Confirmed:** chart colors are identical in light/dark mode and form one yellow-brown sequence rather than categorical, status-safe colors. | Series can be hard to distinguish and bright yellows may glare on dark surfaces; meaning is unclear. | Define theme-specific categorical chart tokens with contrast-tested labels/lines and patterns/tooltips beyond color. |
| F-08 | Theme/status | High | `app/hrm/applicants/page.tsx:42-48` | **Confirmed:** statuses hardcode five Tailwind hues and rely primarily on color. They bypass semantic Badge variants. | Theme drift, uncertain dark-mode contrast, and reduced comprehension for color-vision deficiencies. | Add semantic `info`, `success`, `warning`, `danger`, and `neutral` tokens/Badge variants; pair each status with text and optional icon. |
| F-09 | Theme consistency | High | `components/hrm/careers/*`, `components/hrm/landing/*` | **Confirmed:** public careers components contain fixed white/neutral/emerald/amber colors, arbitrary gradients/radii/shadows, and do not follow dark semantic tokens. | Careers and admin feel like unrelated products; dark mode cannot be consistently supported. | Keep careers more expressive but map it to a documented brand palette and semantic surface/text/action tokens. |
| F-10 | Component architecture | High | `components/hrm/careers` and `components/hrm/landing` | **Confirmed:** at least `JobCard.tsx` and `JobDetailsModal.tsx` are byte-identical duplicates; adjacent careers/landing implementations also overlap. | Fixes and accessibility improvements can diverge or be applied twice. | Consolidate into one careers feature package and render variants via props/slots. |
| F-11 | Command/search | High | `components/layout/app-topbar.tsx:137-154` | **Confirmed:** command items have labels but no selection handlers or links; the topbar describes them as commands. | A prominent global control appears functional but does nothing. | Implement navigation/actions, or label the surface as unavailable and remove it until results work. |
| F-12 | Notifications/accessibility | Medium | `components/layout/app-topbar.tsx:78-81` | **Confirmed:** bell icon button has no accessible name; unread state is conveyed by a green dot alone. | Screen-reader users cannot identify the control or unread status. | Add `aria-label`, screen-reader unread count/status, and a text/count-based indicator. |
| F-13 | Dark mode | Medium | `app/provider.tsx` | **Confirmed:** dark tokens exist, but no theme provider/control is present. Theme behavior therefore depends on an external/manual `.dark` class. | Dark mode is not discoverable or reliably persisted. | Add an explicit theme provider and user preference only after token contrast is validated. |
| F-14 | Typography | Medium | `app/layout.tsx`; page headings | **Confirmed:** Geist Sans and Inter are both loaded, but Inter wins `--font-sans`; Noto Sans heading is sparsely applied. H1 sizes range from 20 to 30 px and weights vary. | Extra font payload and inconsistent hierarchy reduce coherence. | Use one UI family plus mono; define page-title, section-title, body, label, and metadata recipes. |
| F-15 | Density | Medium | `components/ui/button.tsx`, `badge.tsx`, sidebar | **Confirmed:** 10 px labels, 12 px body controls, and 20–28 px controls are common. | Long sessions may feel cramped; small text is harder to scan on typical office displays. | Adopt a compact-but-readable scale: 14 px controls/body, 12 px metadata, 36–40 px controls. |
| F-16 | Error recovery | Medium | `components/ui/error-page.tsx` | **Confirmed:** the `description` prop is accepted but never rendered; full-screen errors cover the shell and use large raster images with action buttons overlaid. | Specific recovery information is lost; context/navigation disappears; images may crop unpredictably. | Render title and description as text, preserve shell for recoverable page errors, reserve full-screen for auth/fatal states, and avoid overlaid actions. |
| F-17 | Error handling | Medium | dashboard and feature pages using `ApiErrorView fullScreen` | **Confirmed:** a single dashboard metric failure replaces the entire application view with a fixed overlay. | Partial data failures block otherwise usable modules and navigation. | Use section-level error states and allow healthy dashboard cards to remain usable. |
| F-18 | Loading | Medium | dashboard, applicants, employees, Azure users | **Confirmed:** loading patterns vary between literal `...`, spinners, text, and route skeleton. Dashboard numbers changing from ellipsis can shift content. | Inconsistent feedback makes perceived performance uneven and causes minor layout instability. | Standardize `PageSkeleton`, `TableSkeleton`, and fixed-width metric skeletons with `aria-busy`. |
| F-19 | Empty states | Medium | list pages vs `components/ui/empty.tsx` | **Confirmed:** feature pages hand-roll empty states even though a shared primitive exists. | Copy, spacing, icons, and recovery actions differ by page. | Create domain-ready empty variants: first-use CTA, filtered-zero-results with clear filters, and no-permission/failed state. |
| F-20 | Form semantics | Medium | leave settings toggles; positions radio/status groups | **Confirmed:** related boolean controls are visually grouped but not consistently expressed with `fieldset`/`legend`; some labels are not tied to a single control. | Group purpose may be unclear to assistive technology. | Use FieldSet/FieldLegend and shared Checkbox/Switch/RadioGroup components. |
| F-21 | Responsive profile | Medium | `app/hrm/profiles/[id]/page.tsx:142` | **Confirmed:** the base layout starts as `grid-cols-[1fr_1.5fr]`; the more stable 160 px label column only begins at `sm`. | At 360 px, labels and values are both squeezed instead of stacking. | Stack label/value at base and introduce the two-column definition layout at 640–768 px. |
| F-22 | Feedback | Medium | CRUD pages using `useApiMutation` | **Confirmed:** many dialogs show inline failure, but success acknowledgment is usually only dialog closure/table refresh. | Users may wonder whether a change persisted, especially on slow connections. | Standardize success toasts/live-region announcements and preserve inline field/API errors. |
| F-23 | Brand identity | Medium | `components/layout/app-sidebar.tsx:165-173`; `app/layout.tsx` | **Confirmed:** sidebar says “SPUP SIMS / HRM Module,” while layout metadata is generic “HRIS.” | Product identity is inconsistent in navigation, browser chrome, and shared-platform context. | Choose a stable hierarchy such as “SPUP HRM” with “Part of SIMS” secondary copy and align metadata. |
| F-24 | Motion/accessibility | Medium | careers components and global CSS | **Confirmed:** multiple transitions/transforms are used; no global `prefers-reduced-motion` accommodation was found. | Motion-sensitive users cannot reduce nonessential animation. | Add reduced-motion fallbacks and avoid movement as the only hover/active feedback. |
| F-25 | Destructive actions | Medium | row action dialogs and shared destructive button | **Confirmed:** confirmations exist in representative row actions, which is good, but icon controls can be only 24 px and the tinted destructive style can resemble a status chip. | Risky actions are easy to mis-click and hierarchy is weaker than intended. | Increase targets, keep explicit confirmation/copy, and define separate destructive button and danger badge treatments. |
| F-26 | Sidebar | Medium | `components/ui/sidebar.tsx`, `components/layout/app-sidebar.tsx` | **Confirmed:** collapsed mode has tooltips, but the brand block uses a plain “HR” tile and no university mark; sidebar typography is extra compact. | Collapsed navigation is functional but less recognizable and harder to scan. | Use a simplified SPUP/HRM mark, 14 px menu labels, clear selected treatment, and visible group separation. |
| F-27 | Visual consistency | Low | cards/pages across admin | **Confirmed:** repeated `rounded-lg` overrides coexist with primitive radius defaults and careers uses 10 px/16 px/24 px radii. | Surfaces feel subtly inconsistent. | Limit application radii to control, card, dialog, and pill roles tied to tokens. |
| F-28 | Performance architecture | Low | 93 of 123 audited TSX files | **Confirmed:** most files are client components, including large page workflows. This is not automatically wrong because of auth/API hooks, but it expands hydration and bundle cost. | Slower startup can amplify perceived UI friction on low-powered office hardware. | During refactors, keep interactive islands client-side and move static shells/configuration server-side where the current Next.js version permits. |

## D. Theme Assessment

### Brand suitability

The green primary is appropriate for SPUP and for an institutional HR product. It communicates stability and aligns with the university identity without overwhelming the admin shell. The current public careers emerald/amber pairing is recognizable but too independently styled. **Recommendation:** retain green as the brand/action anchor, use gold sparingly for brand emphasis rather than generic warning, and let neutral surfaces carry most of the data density.

### Light mode

Light mode is the stronger theme. Background, card, foreground, border, and muted roles are coherent and restrained. The medium green primary with near-white text should be measured in the browser before approval; its OKLCH lightness is near the range where small-text contrast can become marginal. Border and input separation is subtle but reasonable on high-quality displays and may weaken on low-contrast office monitors.

### Dark mode

Dark surfaces form a sensible cool hierarchy, but the primary becomes darker while retaining very light text, and sidebar primary foreground is a dark green against a brighter green background. Both combinations need automated contrast measurement. Ten-percent borders and muted text at `L=0.723` may work visually, but disabled opacity compounds contrast loss. Fixed white surfaces in careers and profile-specific colors break adaptation.

### Semantic structure

The base semantic roles are good. Missing roles are the issue: success, warning, info, neutral status, interactive/visited link, focus surface, and semantic data-visualization roles. Feature code currently fills that gap with raw colors.

Proposed structure (names, not final values):

```css
/* Brand and actions */
--brand; --brand-foreground;
--primary; --primary-hover; --primary-active; --primary-foreground;
--link; --link-hover; --focus-ring;

/* Surfaces and text */
--background; --surface; --surface-raised; --surface-sunken;
--foreground; --foreground-secondary; --foreground-muted;
--border; --border-strong; --input; --disabled;

/* Feedback */
--info; --info-surface; --info-foreground;
--success; --success-surface; --success-foreground;
--warning; --warning-surface; --warning-foreground;
--danger; --danger-surface; --danger-foreground;

/* Navigation and data */
--sidebar; --sidebar-hover; --sidebar-selected; --sidebar-selected-foreground;
--chart-categorical-1 ... --chart-categorical-6;
--chart-sequential-low; --chart-sequential-mid; --chart-sequential-high;
```

Each feedback role should expose icon/text/border/surface combinations and pass 4.5:1 for normal text, 3:1 for large text and meaningful UI boundaries, and 3:1 for focus indicators against adjacent colors. Do not encode HR status meaning in hue alone.

### Forms, sidebar, status, and charts

- Form primitives have good focus/invalid foundations, but raw native controls fragment sizing and semantics.
- Sidebar-specific tokens are complete, but selected state is not actually wired by the application sidebar.
- Status colors are feature-local. A semantic status API should replace class maps.
- Charts need separate categorical and sequential palettes, dark-mode values, readable axes/grid lines, and tooltip/pattern support.
- Hardcoded colors should be allowed only inside documented brand illustrations or media, not general controls and content surfaces.

## E. Page and Component Priority List

### P0 — usability/accessibility blockers

1. **Shared Button and icon controls** — resolve sub-24 px targets and create usable desktop/mobile density.
2. **AppSidebar and AppTopbar** — remove/inform inert items, implement active state, label notifications, and make command results functional.
3. **Applicants, Employees, Azure Users** — label filters, standardize toolbars, and provide workable 360 px record interaction.
4. **Theme feedback/status tokens** — prevent untested contrast and color-only status communication across core workflows.
5. **ErrorPage/ApiErrorView** — restore meaningful error text and avoid full-screen takeover for partial failures.

### P1 — major consistency improvements

1. **PageHeader and authenticated layout** — dashboard/applicants currently lack the hierarchy shown elsewhere.
2. **DataTable/DataToolbar/Pagination** — remove three parallel list implementations and normalize states.
3. **FormField/FieldSet/dialog forms** — consolidate repeated native inputs and validation/feedback.
4. **Dashboard** — standardize skeletons, isolate card failures, and replace direct emerald highlights.
5. **Portfolio/profile pages** — improve mobile definition layouts and consolidate repeated modal patterns.
6. **Public careers package** — reconcile brand tokens, dark-mode policy, accessibility, and duplicated components.

### P2 — polish and optimization

1. Typography/font loading and named type recipes.
2. Radius/elevation token cleanup.
3. Reduced-motion behavior and transition consistency.
4. Server/client boundary review for bundle and hydration cost.
5. Illustration and icon style review.

## F. Recommended Implementation Plan

| Phase | Files likely to change | Intended result | Risks | Testing requirements |
| --- | --- | --- | --- | --- |
| 1. Theme foundation and design tokens | `app/globals.css`, `components/ui/button.tsx`, `badge.tsx`, `alert.tsx`, `chart.tsx` | Tested light/dark brand, surface, state, focus, and chart roles; accessible control sizes. | Broad visual regression; brand green may shift after contrast correction. | Token contrast matrix; Storybook/test route for every state; light/dark screenshot diff; keyboard focus audit. |
| 2. Shared layout and navigation | `components/layout/app-shell.tsx`, `app-sidebar.tsx`, `app-topbar.tsx`, `app/hrm/layout.tsx` | Clear identity, active location, working commands, responsive sidebar/topbar, standard page width/padding. | Permission-filtered routes and MSAL state can hide test paths. | Role-based navigation matrix; keyboard/collapsed/mobile checks at 360/768/1024/1440. |
| 3. Shared components | New `PageHeader`, `StatusBadge`, `DataToolbar`, `DataTableState`, plus existing Empty/Error/Skeleton primitives | One consistent vocabulary for headings, status, loading, empty, error, and actions. | Over-general APIs can make domain screens harder to maintain. | Component-state harness; axe scan; visual variants in both themes. |
| 4. Forms and tables | applicants/employees/Azure/positions/departments/leave settings; shared Input/Field/Table | Labeled controls, predictable validation, consistent toolbars/pagination, responsive row detail/action patterns. | CRUD behavior or query parameters could regress during structural changes. | Existing API behavior tests; keyboard-only create/edit/delete; validation association; narrow-width overflow checks. |
| 5. Page-level improvements | dashboard, portfolio/profile, roles-permissions, careers | Coherent hierarchy and domain-specific refinements without workflow removal. | Page refactors may collide with active API/schema work; careers branding can be over-normalized. | Task-based tests per role; loading/empty/error/success/unauthorized snapshots; content review. |
| 6. Accessibility and responsive testing | Test configuration plus affected components | WCAG 2.2 AA practical baseline at four target widths. | Automated tools miss focus order, comprehension, and color-only meaning. | axe + manual keyboard/screen-reader pass; 200% zoom; reduced motion; touch-target checks; real authenticated browser session. |
| 7. Final visual consistency review | All changed frontend surfaces | Remove one-off regressions and document stable usage guidance. | Late polish can cause scope creep. | Route screenshot matrix, theme/state checklist, targeted ESLint, typecheck/build with unrelated baseline failures reported separately. |

Performance guardrails from the React/Next guidance should be applied during implementation: avoid adding broad barrel imports, dynamically load genuinely heavy optional UI, keep stable constants outside render, and split static page shells from interactive islands where practical. Performance changes should support the UX plan, not replace usability evidence.

## G. Quick Wins

These are low-risk only after a small screenshot/keyboard baseline is captured:

- Add a real `PageHeader` to dashboard and applicants using the typography already present on employees.
- Add `aria-label="Notifications"` and a screen-reader unread status to the bell.
- Wire sidebar active state and `aria-current` without changing route behavior.
- Replace raw search/date inputs with labeled shared Input/Field wrappers.
- Replace applicant status class strings with semantic Badge variants after tokens are introduced.
- Render the existing ErrorPage title and description instead of image-only messaging.
- Replace metric `...` with fixed-size Skeleton components.
- Use the existing Empty primitive for first-use and filtered-empty states.
- Increase icon control hit areas without enlarging icons.
- Remove or explicitly label `#` navigation entries and non-functional command items.
- Consolidate byte-identical JobCard and JobDetailsModal files.
- Add a reduced-motion base rule for nonessential transforms and animations.

## H. Proposed Visual Direction

**Direction: “Quiet Academic Operations.”** The interface should feel like a dependable institutional workspace rather than a generic SaaS dashboard or a promotional microsite.

- **Color:** warm-neutral or very lightly cool surfaces; SPUP green for primary actions, selected navigation, and restrained highlights; gold only as a small brand accent; dedicated accessible blue/info, green/success, amber/warning, and red/danger roles.
- **Typography:** one highly legible sans family; 24–28 px page titles, 16–18 px section titles, 14 px body/control text, and 12 px metadata. Use weight and spacing before adding more color.
- **Density:** compact, not miniature. Default controls 36–40 px; tables 40–44 px rows with an optional documented compact mode for expert users.
- **Radius:** approximately 6 px controls, 8–10 px cards, 12 px dialogs, full pills only for badges/avatars.
- **Shadows:** borders for routine grouping; one subtle shadow for floating popovers/dialogs; no decorative offset shadows inside admin workflows.
- **Cards:** use only for genuinely grouped content or metrics. Avoid nesting bordered cards where section spacing and headings suffice.
- **Tables:** sticky or persistent header where useful, clear numeric alignment, calm row hover/selection, visible bulk-action state, and responsive priority-column/detail patterns.
- **Forms:** visible labels, concise help, errors beside fields and summarized when submission fails, consistent required/optional markers, and logical fieldsets for long workflows.
- **Sidebar:** stable university/HRM identity, strong selected state, restrained group labels, clear collapsed tooltips, and no inert destinations.
- **Dashboard:** operational summary first—exceptions, deadlines, workload, and direct next actions. Use visualizations only when they make comparison faster than a table.
- **Status:** text plus icon/shape where helpful; never hue alone. Keep status colors consistent across applicants, employees, leave, documents, and permissions.
- **Light/dark behavior:** preserve the same hierarchy and meaning, but tune every surface, border, status, and chart value independently. Avoid merely reusing light-mode chart colors or fixed white feature surfaces.

## Approval Gate

No redesign or implementation should begin from this audit alone. Please approve the priorities and proposed visual direction—or identify which P0/P1 items should change—before Phase 1 implementation starts.

# Frontend Redesign Proposal

## 1. Redesign Decision

**Selected level: Level 2 — Partial Redesign.**

The application does not require a full frontend redesign. Its route structure, permission-aware navigation model, core CRUD workflows, API contracts, authentication, and shadcn foundation are usable and should remain. It needs more than visual refinement because the problems cross shared foundations: incomplete semantic tokens, undersized controls, absent active navigation, inconsistent page hierarchy, duplicated table/form/state patterns, non-functional command/navigation affordances, and weak mobile table behavior.

The redesign addresses F-01 through F-28, with first emphasis on control accessibility, navigation, breadcrumbs, theme/status semantics, list workflows, and recoverable states. Business rules, route permissions, API payloads, authentication, and proven task sequences remain unchanged. Expected benefits are faster scanning, fewer interaction errors, consistent feedback, better keyboard/mobile use, lower UI duplication, and safer future development. Main risks are broad visual regression, collision with active feature work, accidental workflow changes during component extraction, and incomplete dark-mode validation. These risks require incremental delivery and state-based testing.

## 2. Redesign Goals

Success is measured by the following outcomes:

- All maintained feature UI uses approved semantic color tokens; undocumented hardcoded feature colors are eliminated.
- All core text/control combinations meet WCAG 2.2 AA contrast and every interactive target is at least 24×24 CSS px, with 36–44 px controls used by default.
- Every authenticated route has one direct semantic `h1`, a correct topbar breadcrumb where applicable, and no shared page-context or title/subtitle banner.
- Current sidebar state is visible and programmatically exposed with `aria-current`.
- Every shared interactive component documents default, hover, focus-visible, active, selected/current, disabled, loading, error, and relevant success states.
- Applicants, Employees, and Azure Users share toolbar, table-state, pagination, and narrow-screen patterns.
- Loading, empty, failure, and success behavior is specified for every P0/P1 route.
- Duplicate careers/landing components are consolidated without changing public workflows.
- Core workflows remain usable at 360, 768, 1024, and 1440 px without page-level horizontal overflow.
- No refactor changes APIs, permissions, authentication, or business behavior without separate approval.
- New pages can be built from documented shared patterns without inventing new visual conventions.

## 3. Proposed Visual Direction

The approved candidate direction remains **Quiet Academic Operations**: professional, calm, compact, and institutional. It uses SPUP green as a controlled brand/action signal, neutral surfaces for long work sessions, and gold only as restrained brand emphasis—not as a generic warning color.

| Element | Direction |
| --- | --- |
| Primary/supporting colors | Deep institutional green for primary actions/current navigation; lighter green surfaces for selection; accessible blue, green, amber, and red for info/success/warning/danger. |
| Neutrals | Cool-neutral near-white and charcoal surfaces with readable muted text and visible, quiet borders. Avoid low-contrast gray-on-gray. |
| Typography | Inter for UI and Geist Mono for identifiers/code. Remove unused Geist Sans and Noto Sans unless a verified brand requirement exists. |
| Spacing | Four-pixel base scale; compact administrative density with consistent 16/24 px page padding and 16/24/32 px section rhythm. |
| Radius | 6 px controls, 8 px cards, 12 px dialogs/sheets, pill only for badges and avatars. |
| Shadows | Borders for routine hierarchy; one subtle floating elevation for menus/popovers and one stronger elevation for modal surfaces. |
| Cards | Use for grouped metrics or bounded concepts, not every section. No oversized decorative card padding. |
| Forms | Visible labels, 36–40 px controls, persistent helper/error text, logical sections, stable action placement. |
| Buttons | One clear primary action per section; semantic secondary/ghost/destructive hierarchy; stable loading width. |
| Tables | 40–44 px rows, readable headers, aligned numbers, predictable row actions, visible selection, sticky headers only when beneficial. |
| Sidebar | Strong but quiet current state, aligned icon/label, clear groups, accessible collapsed labels, no inert destinations. |
| Breadcrumbs | Default page locator in authenticated screens; compact, semantic, collapsible, and never a history trail. |
| Dialogs | Short focused tasks only; alert dialogs for consequential actions; sheets for contextual vertical workflows; full pages for long forms. |
| Notifications | Sonner for transient feedback; inline alerts for persistent context; field/form errors for validation. |
| Status | Text plus semantic color and optional icon; identical meaning across HR domains; never color alone. |
| Charts | Theme-specific categorical palette, semantic legends/tooltips, readable axes, and patterns/labels when color distinction is insufficient. |
| Light mode | Quiet white/near-white workspace, strong text, visible borders, green action/current emphasis. |
| Dark mode | Independently tuned dark surfaces and statuses; no fixed white feature surfaces or reused light chart colors. |

Avoid gradients except approved brand artwork, glassmorphism, oversized title banners, decorative offset shadows, excessive card nesting, low-contrast gray interfaces, and nonessential motion.

## 4. Page Hierarchy and Breadcrumb Strategy

Authenticated pages use a breadcrumb in the topbar. Example: `Human Resources / Employee Management / Employee Profile`. The current item is plain text, not a link. Breadcrumbs represent information architecture, not browser history.

- **Desktop:** show the full path when it fits; use one line and `aria-label="Breadcrumb"` on `nav`.
- **Mobile:** keep the current item and nearest parent visible. Collapse older ancestors into an accessible ellipsis menu.
- **Long paths:** truncate labels visually while retaining the full accessible name and tooltip where useful.
- **Overflow:** use a menu containing real links in hierarchy order; do not horizontal-scroll the whole page.
- **Current page:** use `aria-current="page"`, readable foreground, and no click behavior.
- **Links:** muted default, foreground/underline on hover, and a visible focus ring.
- **Keyboard/screen readers:** use `nav > ol > li`, hidden separator glyphs, logical tab order, and descriptive link text.

Do not add a shared page-context, title, or subtitle block below the topbar. Every page owns one direct logical `h1`, visually hidden when the breadcrumb and content already provide sufficient visual orientation. A visible page-local title is reserved for entity identity or instructions that materially help the task. Place primary actions in the nearest relevant toolbar or section and move secondary actions into a menu. Do not use breadcrumbs on login, redirect, modal-only flows, or isolated public landing screens.

## 5. Proposed Theme System

The following palette is a **proposal for contrast validation and approval, not implementation**. Interaction-specific hover/active colors should be derived as separate tokens during Phase 1 rather than through arbitrary opacity.

```css
:root {
  --background: oklch(0.985 0.003 170);
  --foreground: oklch(0.205 0.018 168);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.205 0.018 168);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.205 0.018 168);

  --primary: oklch(0.405 0.105 164);
  --primary-foreground: oklch(0.985 0.006 165);
  --secondary: oklch(0.948 0.010 170);
  --secondary-foreground: oklch(0.285 0.025 168);
  --muted: oklch(0.955 0.006 180);
  --muted-foreground: oklch(0.455 0.020 180);
  --accent: oklch(0.925 0.028 163);
  --accent-foreground: oklch(0.285 0.060 164);

  --destructive: oklch(0.505 0.205 27);
  --destructive-foreground: oklch(0.985 0.010 25);
  --success: oklch(0.430 0.115 150);
  --success-foreground: oklch(0.985 0.008 150);
  --warning: oklch(0.620 0.130 75);
  --warning-foreground: oklch(0.205 0.025 70);
  --info: oklch(0.485 0.135 245);
  --info-foreground: oklch(0.985 0.008 245);

  --border: oklch(0.865 0.012 180);
  --input: oklch(0.825 0.016 180);
  --ring: oklch(0.520 0.120 164);

  --sidebar: oklch(0.965 0.012 167);
  --sidebar-foreground: oklch(0.235 0.025 168);
  --sidebar-primary: oklch(0.405 0.105 164);
  --sidebar-primary-foreground: oklch(0.985 0.006 165);
  --sidebar-accent: oklch(0.900 0.040 163);
  --sidebar-accent-foreground: oklch(0.275 0.065 164);
  --sidebar-border: oklch(0.845 0.018 170);

  --chart-1: oklch(0.455 0.125 164);
  --chart-2: oklch(0.550 0.135 245);
  --chart-3: oklch(0.650 0.135 75);
  --chart-4: oklch(0.555 0.155 25);
  --chart-5: oklch(0.535 0.125 305);
}

.dark {
  --background: oklch(0.165 0.014 180);
  --foreground: oklch(0.940 0.008 170);
  --card: oklch(0.205 0.018 178);
  --card-foreground: oklch(0.940 0.008 170);
  --popover: oklch(0.225 0.020 178);
  --popover-foreground: oklch(0.950 0.006 170);

  --primary: oklch(0.705 0.125 158);
  --primary-foreground: oklch(0.175 0.030 165);
  --secondary: oklch(0.270 0.018 180);
  --secondary-foreground: oklch(0.925 0.008 170);
  --muted: oklch(0.255 0.016 180);
  --muted-foreground: oklch(0.735 0.018 180);
  --accent: oklch(0.315 0.040 165);
  --accent-foreground: oklch(0.940 0.010 160);

  --destructive: oklch(0.690 0.170 25);
  --destructive-foreground: oklch(0.175 0.025 25);
  --success: oklch(0.700 0.135 150);
  --success-foreground: oklch(0.170 0.025 150);
  --warning: oklch(0.775 0.135 80);
  --warning-foreground: oklch(0.205 0.030 70);
  --info: oklch(0.720 0.125 245);
  --info-foreground: oklch(0.170 0.025 245);

  --border: oklch(0.355 0.018 180);
  --input: oklch(0.405 0.022 180);
  --ring: oklch(0.720 0.125 158);

  --sidebar: oklch(0.190 0.018 178);
  --sidebar-foreground: oklch(0.925 0.008 170);
  --sidebar-primary: oklch(0.705 0.125 158);
  --sidebar-primary-foreground: oklch(0.175 0.030 165);
  --sidebar-accent: oklch(0.295 0.038 165);
  --sidebar-accent-foreground: oklch(0.935 0.010 160);
  --sidebar-border: oklch(0.335 0.020 175);

  --chart-1: oklch(0.705 0.125 158);
  --chart-2: oklch(0.720 0.125 245);
  --chart-3: oklch(0.775 0.135 80);
  --chart-4: oklch(0.700 0.155 25);
  --chart-5: oklch(0.700 0.125 305);
}
```

Status components also require surface and border derivatives such as `--success-muted` and `--success-border`. Status meaning must include text and, when scan speed benefits, an icon. Proposed values must pass automated contrast calculations and browser visual review before replacement of the current palette.

## 6. Typography System

| Role | Family | Size / line height | Weight | Tracking |
| --- | --- | --- | --- | --- |
| Application title | Inter | 16/24 px | 650 | -0.01em |
| Breadcrumb | Inter | 13/20 px | 450; current 550 | normal |
| Optional page title / H1 | Inter | 24/32 px desktop; 20/28 px mobile | 650 | -0.015em |
| Section heading / H2 | Inter | 18/26 px | 600 | -0.01em |
| Card title / H3 | Inter | 15/22 px | 600 | normal |
| Body | Inter | 14/22 px | 400 | normal |
| Label | Inter | 13/20 px | 550 | normal |
| Helper / caption | Inter | 12/18 px | 400 | normal |
| Table header | Inter | 12/18 px | 600 | 0.01em; avoid forced uppercase by default |
| Table cell | Inter | 13/20 px | 400; key cell 550 | normal |
| Button | Inter | 13/20 px | 550 | normal |
| Empty-state title | Inter | 15/22 px | 600 | normal |
| Dialog title | Inter | 18/26 px | 650 | -0.01em |
| Dialog description | Inter | 14/22 px | 400 | normal |
| Identifiers/numeric technical data | Geist Mono | 12–13/20 px | 450 | normal |

Do not use 10 px text for essential content. Maintain one semantic heading hierarchy independent of visual size.

## 7. Layout and Spacing System

Use the existing Tailwind spacing scale with approved steps `1, 2, 3, 4, 5, 6, 8, 10, 12` (4–48 px); arbitrary spacing requires a documented exception.

- Authenticated HRM content uses the full available shell width with responsive page gutters; individual forms or reading-heavy blocks may set local readable widths when necessary.
- Page padding: 16 px at 360; 20 px at 768; 24 px at 1024+.
- Breadcrumb: inside the topbar, between the sidebar trigger and right-aligned controls; collapse progressively on narrow screens.
- Sections: 24 px within related groups, 32 px between major groups.
- Grids: 16 px compact; 24 px standard.
- Cards: 16 px compact or 20–24 px standard; no per-page arbitrary padding.
- Forms: 16 px between fields; 24–32 px between sections; 8 px label-to-control/help relationship.
- Tables: 40 px compact or 44 px standard rows; 12–16 px horizontal cell padding.
- Sidebar: 256 px expanded, 48–56 px collapsed; topbar 56 px compact or 64 px standard.
- Sticky elements: topbar may remain sticky; table headers only within bounded scroll regions; sticky action bars must not obscure content.
- Actions: one/two primary actions in the nearest relevant toolbar or section; on mobile stack full-width only when labels cannot fit safely.

## 8. Interaction State System

Every shared interactive component must explicitly support relevant states. Default establishes affordance; hover adds a subtle surface/border change; focus-visible uses a 2–3 px `--ring`; active/pressed changes surface plus slight inset/position only when motion-safe; selected/current persists without hover; expanded uses `aria-expanded`; disabled removes interaction and retains readable text; read-only remains selectable but visually distinct; loading preserves dimensions and announces progress; success/warning/error/destructive use semantic tokens.

Active-state standards:

- Sidebar: tinted accent surface plus leading indicator or stronger icon treatment; `aria-current="page"`.
- Breadcrumb: linked ancestors use hover underline; current item is non-link, stronger text, `aria-current`.
- Tabs/pagination: persistent indicator/border plus semantic surface; `aria-selected` or `aria-current`.
- Buttons: pressed state differs from hover; toggle buttons expose `aria-pressed`.
- Filters/cards/table rows: selected state uses surface plus border/checkmark; rows use `aria-selected` when interactive.
- Dropdown/command/date picker: highlighted hover/focus differs from selected value; semantic Radix state attributes remain authoritative.

Focus rings must remain visible on background, card, popover, dialog, table, and sidebar surfaces in both themes. Never remove outline without an equivalent focus-visible treatment.

## 9. Loading-State Decision System

| Context | Pattern | Priority-page use |
| --- | --- | --- |
| Known first-load layout | Shape-matched skeleton | Dashboard metrics/table, applicants/employees/Azure tables, profiles, portfolio sections, roles/permissions cards, leave settings. |
| Brief local action | Spinner plus stable label | Save/create/update/delete buttons, retry, compact refresh, command results. |
| Measurable multi-step work | Determinate progress | File upload/download, bulk import, report generation when real progress exists. |
| Unknown page-wide transition | Thin indeterminate progress | Authenticated route transition only if the framework integration is reliable. |
| Background refresh | Keep content; subtle refresh status | Data tables and dashboard cards. Do not blank healthy content. |
| Immediate/optimistic action | No indicator or subtle pending state | Safe reversible toggles where rollback is implemented. |

Skeletons must resemble final structure and reserve dimensions. Buttons retain width, prevent repeat submission, and use `aria-busy` plus accessible processing text. Loading must not block unrelated content. Slow requests transition to helpful status; failures preserve existing content/input and expose retry where safe. Never show fake percentages.

## 10. Feedback and Notification Decision System

| Pattern | Use | Do not use for |
| --- | --- | --- |
| Sonner toast | Short, transient save/copy/background/noncritical feedback; optional safe undo | Field validation, destructive confirmation, information that must remain visible |
| Standard dialog | Short focused form, selection, record preview, export options | Long/multi-section forms |
| Alert dialog | Destructive, irreversible, bulk, access/permission consequences | Routine information or success |
| Inline alert | Persistent page/section limitation, permission note, unavailable dependency | Brief save confirmation |
| Field validation | One correctable input error | General server outage |
| Form summary | Multiple invalid fields or related submission problems; link/focus fields | Single-field problem only |
| Banner | System-wide or cross-page persistent incident/maintenance information | Local form errors |
| Sheet/drawer | Contextual filters/details or vertically longer task that should preserve page context | Critical destructive confirmation by itself |
| Empty state | Absence/setup/filter outcome with relevant next action | Request failure |
| Status badge | Persistent record state | Transient operation result |

| Situation | Recommended Pattern | Reason |
| --- | --- | --- |
| Successful save | Sonner toast | Temporary, non-blocking confirmation |
| Invalid input | Field-level error | Error belongs to a specific control |
| Several invalid fields | Form summary and field errors | Helps users locate all problems |
| Delete record | Alert dialog | Destructive confirmation is required |
| Edit a small record | Dialog | Focused task without navigation |
| Edit a large multi-section record | Full page | Dialog would be cramped |
| Missing permission | Inline alert or access-denied state | Persistent contextual information |
| Background refresh | Subtle status or toast | Existing content can remain visible |
| File upload | Progress indicator | Progress is meaningful |
| Failed page load | Error state with retry | User cannot continue normally |

Toast copy names the outcome: “Employee record updated.” not “Success.” Deduplicate messages and announce them through the accessible Sonner region. Alert dialogs name the affected record and consequence, focus the safest initial action, use labels such as “Delete employee,” and restore focus after closing.

## 11. Empty, Error, and Success States

- **No records:** explain first-use state and offer create/import action when permitted.
- **No search/filter results:** preserve query/filter context and offer Clear filters; never imply the database is empty.
- **No permission:** name the unavailable capability and escalation path; do not masquerade as empty data.
- **Not available/setup incomplete:** state the prerequisite and link to permitted setup.
- **Field/form error:** place correction beside fields, summarize multiple errors, focus summary on submit, preserve all entered data.
- **Component failure:** keep surrounding page operational and provide local retry.
- **Page/auth/network/server failure:** plain-language cause where known, safe recovery, retained navigation when possible, and technical reference only when useful.
- **Success:** toast/inline update for ordinary actions; persistent success only when users must reference the result. No full success screen for routine saves.

Illustrations are optional and must not displace explanation or recovery actions.

## 12. Shared Component Redesign

All components below require semantic APIs, visible focus, accessible names/roles, light/dark states, and no business-rule ownership.

| Component | Current problem | Proposed behavior and variants | States / accessibility / responsive behavior | Likely files |
| --- | --- | --- | --- | --- |
| ApplicationShell | Shell lacks breadcrumb contract and consistent content spacing. | Own container, topbar/sidebar slots, topbar breadcrumb region; standard/full-width variants. | Shell skeleton/error boundaries; mobile overlay sidebar; skip link/main landmark. | `components/layout/app-shell.tsx`, `app/hrm/layout.tsx` |
| Sidebar | No active state; inert items; compact targets. | Permission-filtered real links, current state, collapsed tooltips, unavailable state only when explicit. | current/hover/focus/expanded/disabled; `aria-current`; mobile sheet. | `components/layout/app-sidebar.tsx`, `components/ui/sidebar.tsx` |
| Top navigation | Fake command items; unlabeled notification. | Working command navigation/actions, labeled notification/account controls. | search loading/empty/error; keyboard shortcut; 36–40 px targets; compact mobile search trigger. | `components/layout/app-topbar.tsx` |
| Breadcrumbs | Primitive exists but no app strategy. | Hierarchy API with current item and overflow menu. | loading optional; semantic `nav/ol`; mobile collapse/truncation. | `components/ui/breadcrumb.tsx`, new layout component |
| SectionHeader | Repeated local title/action rows. | Title, optional essential description, actions; default/compact. | semantic heading level; wraps actions on mobile. | new shared component; dashboard/forms |
| DataTable | Three raw implementations. | Column model, sorting/selection/action slots, density variants. | skeleton/empty/no-results/error/refresh; keyboard semantics; scroll/priority-column options. | `components/ui/table.tsx`, new HRM data components; list pages |
| TableToolbar | Filters/actions repeat. | Search, filter chips, bulk actions, clear state; default/compact. | active filters, loading counts, errors; mobile filter sheet. | new component; applicants/employees/Azure |
| SearchInput | Raw repeated inputs. | Labeled search with clear action and optional debounce status. | focus/loading/empty not embedded; accessible name; full-width mobile. | new component; list pages/topbar |
| FilterControls | Raw date/select groups. | FieldSet-based date range/select filters and active chip summary. | invalid/loading/disabled; mobile sheet; keyboard-native controls. | new component; list pages |
| Pagination | Hand-built repeated buttons. | Page count/range, previous/next, optional page-size. | current/disabled/loading; `aria-current`; compact mobile previous/next. | `components/ui/pagination.tsx`; list pages |
| FormField | Shared Field underused. | Label, control, help, error, required/optional API. | read-only/disabled/loading/invalid/success; described-by wiring; full-width mobile. | `components/ui/field.tsx`, Input/Select/etc.; forms |
| FormSection | Related fields lack semantics. | Fieldset/legend or section heading, description, optional actions. | section-level alert/loading; one column mobile. | new component; leave/roles/portfolio dialogs |
| Buttons / LoadingButton | Undersized; inconsistent raw buttons. | 36 px compact, 40 px default, 44 px mobile/large; semantic variants. | all interaction states; loading width stable; icon labels mandatory. | `components/ui/button.tsx`, new loading wrapper |
| StatusBadge | Generic variants and hardcoded maps. | neutral/info/success/warning/danger variants with optional icon. | no loading; accessible text always; wraps/truncates safely. | `components/ui/badge.tsx`; domain pages |
| EmptyState | Shared primitive rarely used. | no-records/no-results/setup/permission variants with action slot. | distinct from loading/error; no irrelevant illustration; responsive centered/inline. | `components/ui/empty.tsx`; list/pages |
| Skeleton patterns | Generic/inconsistent indicators. | Metric, table, list, profile, form patterns matching final layout. | `aria-busy`; hide decorative skeletons from AT; responsive shapes. | `components/ui/skeleton.tsx`, `table-skeleton-rows.tsx`, `components/layout/app-shell-skeleton.tsx`, loading routes |
| Spinner | Available but usage varies. | xs/sm/md sizes; inline and button contexts. | accessible label at region level; never sole page loader. | `components/ui/spinner.tsx`; mutations |
| Progress indicator | Progress used as data and loading without policy. | determinate/indeterminate operation variants; data visualization remains separate. | value text and ARIA progress semantics; mobile full width. | `components/ui/progress.tsx` |
| ErrorState | Image-first/full-screen takeover. | compact/inline/page variants with title, description, retry/reference; HTTP and API adapters remain separate. | live announcement; preserve shell/context; mobile-safe copy/actions. | `components/ui/error-state.tsx`, `error-page.tsx`, `api-error-view.tsx`; error boundaries |
| ConfirmationDialog | Repeated row confirmations. | Record name, consequence, cancel, descriptive destructive action. | pending/failure states; safe initial focus; focus restoration. | `components/ui/alert-dialog.tsx`; row actions |
| StandardDialog | Many feature-specific forms. | sm/md/lg sizes for short tasks, consistent header/body/footer. | validation/loading/error; focus trap/restore; near-full-screen mobile. | `components/ui/dialog.tsx`; form dialogs |
| Drawer/Sheet | Underused for filters/details. | side/bottom variants for contextual workflows. | expanded/loading/error; accessible title; mobile-first filter use. | `components/ui/sheet.tsx`, `drawer.tsx` |
| Toast helpers | Sonner installed without domain policy. | `notifySaved`, `notifyUpdated`, `notifyFailed` helpers with dedupe IDs. | success/info/warning/error; accessible announcement; short copy. | `components/ui/sonner.tsx`, new helper module |
| InlineAlert | Generic alert not standardized by use case. | info/success/warning/error and permission/system variants. | persistent, focusable only when necessary; stacks on mobile. | `components/ui/alert.tsx`; forms/pages |
| StatisticCard | Dashboard uses local map/styles. | Label, value, trend/context, icon, action; default/attention. | shape skeleton, local error, stale/refresh state; 1/2/4-column grid. | dashboard page, new HRM component |

## 13. Page Refactoring Decision Checklist

Before editing a page, record answers in the issue/PR description:

### Page structure

- What is the primary user goal and is the workflow understandable?
- Is the breadcrumb correct? Is a visible H1 necessary and non-redundant?
- Are one/two primary actions easy to find and secondary actions appropriately reduced?
- Is content divided by meaningful headings/whitespace rather than excess cards?

### Navigation

- Does the sidebar expose the correct active section and `aria-current`?
- Are breadcrumb links hierarchical and correct?
- Does back navigation preserve filters, page, and entity context?

### States and feedback

- Define first load, refresh, no records, no results, success, component/page failure, and no-permission states.
- Select Sonner, inline alert, field/form validation, dialog, alert dialog, sheet, or full page using Section 10.
- Determine whether progress is measurable and whether unsaved input is preserved.

### Responsiveness

- At 360/768/1024/1440, where do actions, filters, breadcrumbs, dialogs, and tables move?
- Is horizontal overflow limited to an intentional bounded region?
- Does a filter sheet or row detail view preserve the task on mobile?

### Accessibility

- Verify heading order, connected labels/descriptions, visible focus, announced errors/loading/results, labeled icon controls, non-color status, and keyboard completion.

Do not start refactoring until these answers are explicit.

## 14. Page-Level Redesign Plan

| Priority | Page or Route | Current Problem | Proposed Redesign | Breadcrumb | Loading Pattern | Feedback Pattern | Shared Components Needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Authenticated shell (`/hrm/*`) | No active state; inert nav; no breadcrumb contract; fake commands. | Redesign shell/navigation while preserving permission filtering. | Route-derived hierarchy | Shell/route skeleton only on first load | Inline auth/access state; command errors inline/toast | ApplicationShell, Sidebar, TopNav, Breadcrumb |
| P0 | `/hrm/applicants` | Missing semantic H1, unlabeled filters, hardcoded status, mobile-wide table. | Topbar-breadcrumb list, direct semantic H1, shared toolbar/status/table, mobile priority columns/detail sheet. | HR / Recruitment / Applicants | Table skeleton; keep rows on refresh | Field errors; create dialog; alert delete; save/delete toast | TableToolbar, DataTable, StatusBadge, Pagination, dialogs |
| P0 | `/hrm/employees` | Repeated raw toolbar/table/pagination; dense row actions. | Shared data pattern, two visible actions maximum, overflow menu, responsive detail. | HR / Employee Management / Employees | Table skeleton/background refresh | Dialog for short edit; alert delete; toasts; inline page error | Same data/form set |
| P0 | `/hrm/azure-users` | Raw checkboxes/search/pagination; bulk state needs stronger semantics. | Accessible selection/bulk bar and import workflow; filter sheet on mobile. | Settings / Identity / Azure Users | Table skeleton; determinate progress if import API supports it | Alert for consequential bulk action; progress/toast; inline failure | DataTable, BulkBar, Progress, AlertDialog |
| P0 | `ErrorPage` and dashboard errors | Full-screen image hides text/shell and partial data. | Text-first component/page/auth variants; per-widget dashboard failure. | Retain current context | Local skeletons | Inline retry; page retry only when page unusable | ErrorState, StatisticCard |
| P1 | `/hrm/dashboard` | No semantic heading; literal ellipses; hardcoded emerald icon; one failure blocks page. | Direct semantic H1, operational metric grid, independent loading/error. | HR / Dashboard | Metric/table skeletons | Local retry and refresh status | StatisticCard, DataTableState |
| P1 | `/hrm/departments`, `/hrm/positions` | Similar CRUD pages repeat structure and form patterns. | Shared list toolbars/forms with preserved APIs. | HR / Organization / Current page | Table/list skeleton | Dialog small edit; alert delete; toast success | DataTable, FormField, dialogs |
| P1 | `/hrm/leave-settings` | Dense multi-panel forms; inconsistent native toggles and loading. | Semantic form sections and local states; keep large configuration on page. | Settings / Leave / Leave Settings | Form/list skeleton by panel | Field/form errors; toast save; alert destructive reset | FormSection, FormField, InlineAlert, LoadingButton |
| P1 | `/hrm/roles-permissions` | Large client workflow and card-heavy sections; consequential access changes. | Compact sections/tables, strong selection and access-change confirmation. | Settings / Identity / Roles & Permissions | Section/table skeletons | Inline permission warnings; alert access changes; toast confirmation | DataTable, AlertDialog, StatusBadge |
| P1 | `/hrm/portfolio`, `/hrm/portfolio/[id]`, `/hrm/profiles/[id]` | Repeated dialogs/tables and squeezed mobile definition layout. | Entity identity heading where necessary, section navigation, stacked mobile details, standardized record dialogs. | HR / Employee Management / Employee / Portfolio | Profile and section skeletons | Dialog short records; full page for long sections; toast/inline errors | FormSection, DataTable, dialogs |
| P1 | `/careers` and careers components | Separate hardcoded visual language and duplicates. | Preserve expressive public layout but map to approved brand tokens and consolidate components. | None on landing | Content/card skeleton only if remote | Inline application errors; dialog details; clear CTA feedback | Consolidated JobCard/Details, public tokens |
| P2 | `/hrm/profiles/[id]` secondary panels | Fixed local colors and compact metadata. | Tokenize status/profile accents and improve responsive details. | As above | Section skeleton | Inline component errors | DefinitionList, StatusBadge |
| P2 | `/login`, auth/error imagery | Branding and fixed media require consistency review. | Align product identity; keep isolated auth hierarchy without breadcrumb. | None | Button spinner for sign-in | Inline auth error; no success toast before redirect | SignInPage, InlineAlert, LoadingButton |

## 15. Forms Redesign Standards

- Every control has a persistent programmatic label; placeholder is example/hint only.
- Mark required fields consistently in label text and expose `aria-required`; explain the convention once per form.
- Helper text precedes errors in reading order and is connected with `aria-describedby`.
- Field errors remain until corrected, use icon/text in addition to color, and set `aria-invalid`.
- Controls are 36 px compact or 40 px standard; 44 px on touch-heavy mobile contexts.
- Use 16 px field spacing and 24–32 px semantic form sections with fieldset/legend for related choices.
- Date fields use shared controls, explicit format/context, valid min/max, and accessible date-range grouping.
- Selects use native select for simple/mobile-friendly lists and shadcn Select/Combobox for searchable/complex choices.
- Checkbox/radio groups have a legend and group-level error; do not use switches for non-immediate submission choices.
- File upload exposes allowed type/size, chosen file, real progress, cancel/retry, and error; never fake progress.
- Save/cancel locations are stable. Loading preserves button width, disables repeat submit, and names the operation.
- Warn before discarding meaningful unsaved changes; do not warn for untouched/default forms.
- Failed submission preserves input and focuses a form summary or first invalid field. Successful routine submission uses a specific toast.
- Long or multi-section forms use a full page; destructive actions are visually and spatially separated.

## 16. Tables and Data-Heavy Screens

- Use semantic table markup and concise headers; headers expose sort state with `aria-sort`.
- Use 40 px compact or 44 px standard rows; align numeric/currency/count values right and identifiers consistently.
- Search has a label and clear action. Filters show active state and one Clear filters action.
- Pagination reports visible range and total; current page uses `aria-current`; preserve query/filter state.
- Show no more than two high-frequency row actions; place secondary actions in a labeled overflow menu.
- Bulk actions appear only after selection and clearly state count; consequential actions require alert confirmation.
- Status columns use StatusBadge text plus semantic styling.
- Selected rows use surface plus border/checkmark, not color alone. Keyboard interaction follows native table/control semantics.
- Initial load uses a header-preserving row skeleton. Background refresh keeps rows visible and reports refreshing subtly.
- Distinguish no records, no results, permission, and error states inside the table region.
- Use bounded horizontal scrolling where comparison requires a table. At 360 px, prioritize essential columns and expose details/actions in a sheet; do not convert every table to cards automatically.
- Sticky headers/columns are allowed only when they materially improve long-table comparison and do not obscure focus or create overlapping layers.

## 17. Accessibility Requirements

- Target WCAG 2.2 AA: 4.5:1 normal text, 3:1 large text and meaningful component boundaries/focus indicators.
- All workflows complete by keyboard with logical order, no trap outside modal primitives, and visible focus.
- Use semantic landmarks, one `h1`, ordered headings, real buttons/links, and table/form semantics.
- Every input has label/description; every icon button has an accessible name; disabled/read-only meaning is exposed.
- Breadcrumbs use labeled `nav`, ordered list, hidden separators, and `aria-current`.
- Dialog/alert dialog has accessible title/description, initial focus, trap, Escape/cancel behavior where safe, and focus restoration.
- Toasts use the Sonner live region, do not interrupt excessively, and are not the only validation output.
- Minimum target is 24×24 CSS px with sufficient spacing; default/touch targets should be 36–44 px.
- Respect `prefers-reduced-motion`; essential state changes must not rely on animation.
- Error/status/loading communication uses text, ARIA state/live announcements where appropriate, and more than color/icon/position.
- Skeletons are decorative to assistive technology; the containing region exposes `aria-busy` and useful loading text.

## 18. Responsive Strategy

| Width | Required behavior |
| --- | --- |
| 360 px | Sidebar becomes modal sheet; topbar uses icon search trigger; breadcrumb shows parent/current plus overflow; 16 px padding; actions wrap or use full-width/overflow; filters use sheet; tables use essential columns plus detail sheet/bounded scroll; dialogs become near-full-screen; single-column forms/dashboard; compact shape-matched states. |
| 768 px | Sidebar may remain collapsible/overlay based on available content; breadcrumb commonly full with truncation; 20 px padding; two-column simple forms/cards; tables remain scrollable with more columns; filters may be inline or sheet; dialogs use bounded widths. |
| 1024 px | Persistent expanded/collapsible sidebar; full breadcrumb; 24 px padding; multi-column forms/dashboard where content supports it; inline filters/action groups; standard dialogs and tables. |
| 1440 px | Use the full available HRM workspace with 24 px page gutters; four-column metrics and wider data layouts should use the added space without stretching reading-heavy text blocks. |

At every width, preserve the same task and permissions, prevent page-level horizontal overflow, keep primary actions reachable, retain loading/empty/error context, and do not depend on hover.

## 19. Implementation Phases

| Phase | Scope / target files | Dependencies | Risks | Acceptance criteria and testing |
| --- | --- | --- | --- | --- |
| 1. Theme Foundation | `app/globals.css`, layout fonts, Button/Badge/Alert/Chart; tokens, typography, spacing, radius, shadows, statuses, focus, light/dark. | Palette and typography approval. | Global regressions and marginal contrast. | Contrast matrix passes; state gallery verified in both modes; no sub-24 px targets; targeted lint/typecheck. |
| 2. Application Shell | AppShell, AppSidebar, AppTopbar, topbar Breadcrumb, HRM layout. | Phase 1 tokens; route hierarchy map. | Permission/nav regressions. | Active state and `aria-current`; no inert links; keyboard/collapsed/mobile matrix at four widths; authenticated role checks. |
| 3. Shared Feedback and State Components | Skeleton/Spinner/Progress/Empty/Error/Alert/Sonner helpers/Dialog/AlertDialog. | Phase 1 semantics. | Overusing toasts or blocking dialogs. | Component-state harness; focus restore; live announcements; local failures preserve page; screenshot/axe/manual keyboard checks. |
| 4. Shared Data and Form Components | Button, Field/FormSection, DataTable/Toolbar/Filters/Pagination/Card/StatusBadge. | Phases 1–3. | Generic abstractions alter feature behavior. | Representative fixtures cover load/refresh/empty/no-result/error/selection/validation; responsive and keyboard tests; no API changes. |
| 5. Priority Pages | Shell then P0 applicants/employees/Azure/errors; P1 dashboard, organization, leave, roles, portfolio, careers. | Shared components stable. | Collision with active local/API changes. | Per-route task tests by permission role; query/mutation parity; state screenshots; targeted ESLint/typecheck. |
| 6. Responsive and Accessibility | All changed routes; mobile/table/filter behavior, contrast, keyboard, screen reader, reduced motion. | Live authenticated environment and representative data. | Automated scans miss usability. | 360/768/1024/1440 route matrix; axe; keyboard-only completion; screen-reader spot checks; 200% zoom; reduced-motion verification. |
| 7. Cleanup and Standardization | Remove replaced hardcoded styles/duplicates/deprecated components; document/enforce rules. | All earlier phases accepted. | Premature deletion of still-used paths. | `rg` inventories show approved exceptions only; duplicate imports removed; lint/type/build gates run with unrelated baseline separated; documentation updated. |

# Frontend Design and Refactoring Rules

These rules are normative for maintained code under `app/hrm`. “Must” indicates a requirement; deviations follow Rule Exceptions.

## 1. General Design Principles

- Prioritize task completion, comprehension, and accessibility over decoration.
- Use approved design-system tokens/components before adding styles or components.
- Use semantic theme tokens, shared variants, and meaningful whitespace/headings.
- Preserve business logic, API/data contracts, authentication, authorization, permission visibility, and working workflows.
- Keep administrative screens compact but readable. Do not wrap every section in a card.
- Make loading, empty, error, success, disabled, and permission states intentional.
- Design and test light/dark modes together.
- Add no dependency without a documented unmet need and approval.

## 2. Page Structure Rules

- Breadcrumbs are the default authenticated hierarchy; large title/subtitle banners are not.
- Breadcrumbs live in the topbar, not in page content.
- Every page owns one direct semantic `h1`; hide it visually when a visible title would be redundant.
- Do not create or use a shared page-context, page-header, or title-banner component.
- Place one or two primary actions in the nearest relevant toolbar or section. Move lower-priority actions into menus where appropriate.
- Use the standard container, padding, width, and spacing scale.
- Keep filters next to the content they affect and do not repeat navigation information.

## 3. Navigation Rules

- Every navigable section has a persistent current state distinct from hover and `aria-current="page"` where applicable.
- Sidebar icons/labels align; collapsed items retain tooltips and accessible labels.
- Breadcrumbs reflect hierarchy, not history, and their current item is not clickable.
- Never render an inert link/action as available navigation. Hide it or mark an approved unavailable state.

## 4. Theme Rules

- Use semantic tokens; direct hex/RGB/arbitrary Tailwind colors in features require a documented exception.
- Never communicate meaning by color alone. Status colors require matching foreground/surface/border roles.
- Validate every new token in light/dark modes and against contrast requirements.
- Muted text and disabled content remain readable; borders remain visible but quiet.
- Reserve primary for primary action/current emphasis and destructive for dangerous/irreversible actions.

## 5. Component Rules

- Do not manually recreate an available shadcn/shared component.
- Add a semantic variant before copying markup/class combinations.
- Keep visual styling separate from business logic where practical.
- Shared components support relevant interaction/state/accessibility requirements.
- APIs use semantic names (`success`, `warning`, `destructive`, `compact`), never visual names (`green`, `red`, `roundedLarge`).

## 6. Button Rules

- Use one primary action per section unless the workflow proves two are necessary.
- Use secondary/outline for lower priority, ghost for tertiary/compact, and destructive only for destructive actions.
- Icon-only buttons require accessible labels and compliant targets.
- Loading preserves width, prevents duplicate action, and exposes processing text.
- Disabled labels remain readable; labels name the result (“Delete employee”), not “Submit,” “Proceed,” or “OK” when specificity is possible.

## 7. Active, Hover, Focus, and Disabled Rules

- Hover is supplementary, never the only affordance.
- Active/selected/current states persist without hover and differ from it.
- Never remove focus-visible rings without an accessible replacement.
- Disabled elements cannot look active or receive unintended interaction.
- Selected rows/tabs use color plus border/indicator/checkmark as appropriate.
- Verify every state in light and dark modes.

## 8. Loading Rules

- Use shape-matched skeletons for known first-load layouts, spinners for short/local actions, and real progress for measurable work.
- Do not replace known page structure with a page spinner and never show fake progress.
- Preserve existing content during background refresh, prevent duplicate submissions, reserve layout dimensions, and announce meaningful loading state.

## 9. Sonner and Notification Rules

- Sonner is for short, temporary, non-blocking feedback only.
- Never use it for field validation, destructive confirmation, or information that must remain visible.
- Messages are specific, deduplicated, accessible, and offer Undo only for safely reversible operations.

## 10. Dialog Rules

- Dialog: short focused task. Alert dialog: destructive/irreversible/consequential task. Full page: long/multi-section form. Sheet: contextual vertical task/filter that should preserve page context.
- Titles describe the task; descriptions explain required action/consequence; actions use descriptive labels.
- Focus is trapped/restored correctly. Do not nest dialogs unless no viable pattern exists.

## 11. Form Rules

- Every field has a persistent label; placeholder never replaces it.
- Required indication, helper text, described-by links, and errors are consistent.
- Errors remain until corrected, do not depend on color, and failed submissions preserve input.
- Group related fields semantically; keep Save/Cancel stable; warn before discarding meaningful changes.
- Do not place long forms in narrow dialogs; separate destructive actions from routine actions.

## 12. Table Rules

- Use standard density/alignment, predictable actions, semantic headers, and accessible sorting/selection.
- Show at most two permanent row actions; place secondary actions in an overflow menu.
- Preserve headers during skeleton loading where practical and distinguish no-data from no-results/error/permission.
- Provide bounded horizontal scroll when necessary and a responsive alternative for hidden essential columns.

## 13. Empty and Error State Rules

- Never use generic “No data.” Explain the state and offer a relevant permitted action.
- Recoverable failures provide retry and preserve context/input.
- Full-page errors are only for a wholly unusable page; partial failures remain inline.

## 14. Responsive Rules

- Intentionally define desktop, tablet, and mobile behavior; do not rely on hover or shrink targets below accessible size.
- Move complex filters into a mobile sheet where appropriate, collapse breadcrumbs without hiding current page, keep primary actions reachable, and prevent page-level horizontal overflow.

## 15. Accessibility Rules

- Target practical WCAG 2.2 AA with semantic HTML, logical headings, complete keyboard access, visible focus, connected labels/descriptions, accessible icon labels, live announcements, reduced motion, and non-color communication.

## 16. Refactoring Rules

Before modifying a page:

1. Identify the main user goal and review the existing workflow.
2. Inventory available shared components and approved tokens.
3. Define breadcrumb/current navigation and whether a visible H1 is necessary.
4. Define loading, refresh, empty, no-result, permission, error, and success states.
5. Select Sonner, inline messaging, dialog, alert dialog, sheet, or full page using the decision system.
6. Define 360/768/1024/1440 behavior and accessibility requirements.
7. Preserve business logic and plan small, testable changes.

After modifying a page:

1. Test all interaction, loading, empty, error, success, and permission states.
2. Test keyboard navigation and four responsive widths.
3. Verify light/dark modes, contrast, labels, focus, and announcements.
4. Search for hardcoded styles and duplicated components.
5. Run targeted lint/type tests, then applicable build/browser gates; separate unrelated baseline failures.
6. Update this document only when a new pattern has been explicitly approved.

## 17. Rule Exceptions

Every exception must be documented in the issue/PR and, if permanent, in this document with the affected route/component, overridden rule, reason, approved alternative, approver, and temporary/permanent status. Temporary exceptions require a removal condition. Developers and agents must not invent an undocumented pattern because a shared component is imperfect.

## Acceptance Criteria

- Topbar breadcrumbs replace oversized title/subtitle headers; each page retains a direct semantic H1 without a shared page-context component.
- Current navigation and all selected/hover/focus/active/disabled/loading states are clear and accessible.
- Loading follows the skeleton/spinner/progress decision system; Sonner and dialogs follow their distinct policies.
- Consequential actions use alert dialogs; long forms do not use cramped dialogs.
- Approved semantic tokens cover light/dark surfaces, actions, status, sidebar, form, and charts with no critical contrast failure.
- Forms expose labels, validation, preserved input, and specific feedback.
- Tables preserve administrative comparison, selection, actions, and responsive usability.
- Core pages work at 360/768/1024/1440 without loss of functionality.
- APIs, authentication, authorization, permissions, data contracts, and working workflows remain unchanged.
- Another developer can implement a page using these rules without inventing a new visual pattern.

## Approval Before Implementation

- [ ] Redesign level approved
- [ ] Visual direction approved
- [ ] Theme palette approved
- [ ] Breadcrumb strategy approved
- [ ] Navigation active states approved
- [ ] Loading-state rules approved
- [ ] Sonner and dialog rules approved
- [ ] Typography approved
- [ ] Priority pages approved
- [ ] Shared component plan approved
- [ ] Frontend design rules approved
- [ ] Implementation phases approved
