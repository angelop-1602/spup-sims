# Custom Components

Project-owned cross-capability templates live here. These components compose
and customize primitives from `components/ui`, but they are not generated
shadcn files.

`table-template.tsx` is the canonical HRM table composition. It owns the
optional command area, shared loading/error/empty boundary, sortable/filterable
column controls, and integrated pagination. Feature and route code supplies its
own rows, domain filters, actions, and API-backed state.

Use the template's `loadingSkeleton` option, or render feature-specific
skeleton rows as its children, for table loading. Reserve animated spinners for
buttons that are actively submitting a mutation.

Keep `components/ui` focused on shadcn primitives so CLI updates and future
component installs have a clear boundary.

The unreferenced `custom/dashboard/` directory remains a legacy cleanup
candidate and is not a pattern for new components.
