# How to use `lib/api/schema.ts`

`schema.ts` is an **auto-generated** type file (produced by `openapi-typescript` from the
SIMS OpenAPI spec). It describes every endpoint, request body, and response shape in the
backend API. **Do not edit it by hand** — regenerate it from the spec instead.

Its job: let you stop hand-writing API types in every page. The types already exist here.

---

## The shape of the file

The file exports four things (lines 6–12955):

```ts
export interface paths { ... }      // every URL endpoint + its methods + responses
export type webhooks = Record<string, never>;
export interface components {       // every named schema (request + response bodies)
    schemas: { ... }
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
```

The two you'll actually use are **`paths`** and **`components`**.

---

## 1. `components["schemas"]` — the type dictionary

All named types live under `components["schemas"]["TypeName"]`. There are **636** of them.
They fall into four families:

### a) Response types — the data you read
```ts
// A single resource
type Department = components["schemas"]["DepartmentResponse"]
// { id: number | string; name: string; code: string; isActive: boolean }

// A paged list
type PagedDepartments = components["schemas"]["PagedResponseOfDepartmentResponse"]
// { data: DepartmentResponse[]; page: number | string; pageSize: ...;
//   totalRecords: ...; totalPages: ...; success?: boolean; message?: string }
```

### b) Request types — the data you send
```ts
type CreateDepartmentRequest = components["schemas"]["CreateDepartmentRequest"]
// { name: string; code: string; isActive?: boolean }

type UpdateDepartmentRequest = components["schemas"]["UpdateDepartmentRequest"]
// { name: string; code: string; isActive?: boolean }
```

### c) The `ApiResponseOf…` envelope — what the wire actually returns
Every endpoint wraps its payload in a standard envelope. You rarely need to name this
yourself (the `request()` client unwraps it for you), but it's useful to know it exists:

```ts
// ApiResponseOf<SingleThing>
components["schemas"]["ApiResponseOfDepartmentResponse"]
// { success: boolean; message: string;
//   data: DepartmentResponse | null; errors?: string[] | null;
//   traceId?: string | null; responseTimestamp?: string | null; timestamp?: string }

// ApiResponseOf<PagedThing>
components["schemas"]["ApiResponseOfPagedResponseOfDepartmentResponse"]
// { success: boolean; message: string;
//   data: PagedResponseOfDepartmentResponse | null; ... }
```

The rule: an endpoint returning `Thing` has response type
`ApiResponseOfThingResponse` (single) or `ApiResponseOfPagedResponseOfThingResponse` (list).
The client's `request<T>()` returns the unwrapped `data` typed as `T` — so you request
`DepartmentResponse` or `PagedResponseOfDepartmentResponse`, **not** the envelope.

### d) Enum-like types — usually `number`
Some fields are numeric enums, e.g. `EmploymentStatus: number`. The spec doesn't ship the
numeric constants in the schema, so treat these as `number` unless you have a separate enum
mapping.

---

## 2. `paths` — the endpoint map

`paths` is keyed by URL. Each key maps to the HTTP methods it supports, and each method
documents its **query params**, **path params**, **request body**, and **responses**.

```ts
paths["/api/v1/hrms/employees"]["get"]["parameters"]["query"]
// { Page?: number | string; PageSize?: number | string; Search?: string;
//   SortBy?: string; Descending?: boolean; DepartmentId?: ...; ... }

paths["/api/v1/hrms/employees"]["get"]["responses"]["200"]["content"]["application/json"]
// => components["schemas"]["ApiResponseOfPagedResponseOfEmployeeResponse"]
```

This is the source of truth for:
- which params an endpoint accepts (and whether they're required),
- which methods a URL supports (`get`/`post`/`put`/`delete` — absent means not allowed),
- the response type for a given status code.

You generally won't reference `paths` directly in page code — the hooks do — but it's what
you read to **find the right `components["schemas"]` type** for an endpoint.

---

## 3. How to find the type for any endpoint

1. Open `lib/api/schema.ts`.
2. Search for the URL path (e.g. `"/api/v1/organization/departments"`).
3. Find the method you need (`get`, `post`, `put`, `delete`).
4. Read `responses → 200 → content → "application/json"` → that's the `ApiResponseOf…` type.
5. Strip the `ApiResponseOf…` / `PagedResponseOf…` wrapper to get the `data` type you pass
   to the hook.

Example — `GET /api/v1/organization/departments`:
```
ApiResponseOfPagedResponseOfDepartmentResponse   (wire envelope)
  → PagedResponseOfDepartmentResponse            (what you type the query as)
      → .data: DepartmentResponse[]              (the actual records)
```

---

## 4. Using the types (with the hooks)

The barrel `@/lib/api` re-exports `components` and `paths`, plus the hooks:

```ts
import { useApiQuery, useApiMutation, type components } from "@/lib/api"

type Department = components["schemas"]["DepartmentResponse"]
type PagedDepartments = components["schemas"]["PagedResponseOfDepartmentResponse"]
type DepartmentForm = components["schemas"]["CreateDepartmentRequest"]
```

### Reading data — `useApiQuery<T>`
`T` is the **unwrapped** `data` shape (the `Paged…` or single resource type):

```ts
const { data, loading, error, refresh } = useApiQuery<PagedDepartments>(
  "/api/organization/departments",
  { Page: 1, PageSize: 50, SortBy: "id" },
  { onError: (err) => setError(err.message) },
)
// data?.data        -> DepartmentResponse[]
// data?.totalPages  -> number | string
```

### Writing data — `useApiMutation`
Send the request type as `body`:

```ts
const { mutate, loading } = useApiMutation()

await mutate({
  path: "/api/organization/departments",
  method: "POST",
  body: { name: formState.name, code: formState.code },  // CreateDepartmentRequest
})
```

### Ad-hoc / parallel calls — `useApiClient`
For firing several calls at once without per-call state:

```ts
const { query } = useApiClient()
const [profile, docs] = await Promise.all([
  query<Profile>(`/api/v1/core/profiles/${id}`),
  query<Docs>("/api/v1/recruitment/documents"),
])
```

---

## 5. Common schema types cheat sheet

| Resource | Single | Paged | Create request | Update request |
|----------|--------|-------|----------------|----------------|
| Department | `DepartmentResponse` | `PagedResponseOfDepartmentResponse` | `CreateDepartmentRequest` | `UpdateDepartmentRequest` |
| Employee | `EmployeeResponse` | `PagedResponseOfEmployeeResponse` | `CreateEmployeeRequest` | `UpdateEmployeeRequest` |
| User (identity) | `UserResponse` | `PagedResponseOfUserResponse` | `CreateUserRequest` | `UpdateUserRequest` |
| Role | `RoleResponse` | `PagedResponseOfRoleResponse` | `CreateRoleRequest` | `UpdateRoleRequest` |
| Permission | `PermissionResponse` | `PagedResponseOfPermissionResponse` | `CreatePermissionRequest` | `UpdatePermissionRequest` |
| Designation | `DesignationResponse` | `PagedResponseOfDesignationResponse` | `CreateDesignationRequest` | `UpdateDesignationRequest` |
| Dashboard card | `DashboardMetricResponse` | — | — | — |
| User's roles | `UserRolesResponse` (`data.roles`) | — | — | — |
| Role's permissions | `RolePermissionsResponse` (`data.permissions`) | — | — | — |

---

## 6. Rules of thumb

- **Never edit `schema.ts`.** Regenerate it from the OpenAPI spec.
- **Type queries/unwrapped data, not the envelope.** Use `PagedResponseOf…` or the single
  resource type, not `ApiResponseOf…`.
- **Request bodies use the `Create…Request` / `Update…Request` types** — they're already
  shaped to what the backend expects (including which fields are optional).
- **Numbers may arrive as `number | string`.** The schema marks many int fields as
  `number | string` because of JSON serialization — coerce/compare defensively.
- **Enum fields are `number`** (e.g. `EmploymentStatus`). The named constants aren't in the
  schema; keep a local mapping if you need to display them.
- **Prefer the schema type over a hand-rolled one.** If you're tempted to write an
  `interface` for an API shape, check `components["schemas"]` first — it almost certainly
  already exists.
