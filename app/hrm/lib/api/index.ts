import type { components } from "./schema"

export {
  request,
  useAuthorizedHeaders,
  ApiError,
} from "./client"
export {
  useApiQuery,
  useApiMutation,
  useApiClient,
} from "./hooks"

export type { components, paths } from "./schema"

type Schemas = components["schemas"]

export type DepartmentResponse = Schemas["DepartmentResponse"]
export type CreateDepartmentRequest = Schemas["CreateDepartmentRequest"]
export type UpdateDepartmentRequest = Schemas["UpdateDepartmentRequest"]
export type PositionResponse = Schemas["PositionResponse"]
export type CreatePositionRequest = Schemas["CreatePositionRequest"]
export type UpdatePositionRequest = Schemas["UpdatePositionRequest"]
export type EmployeeResponse = Schemas["EmployeeResponse"]
export type CreateEmployeeRequest = Schemas["CreateEmployeeRequest"]
export type RoleResponse = Schemas["RoleResponse"]
export type CurrentUserResponse = Schemas["CurrentUserResponse"]
export type PagedResponseOfDepartmentResponse = Schemas["PagedResponseOfDepartmentResponse"]
export type PagedResponseOfPositionResponse = Schemas["PagedResponseOfPositionResponse"]
export type PagedResponseOfEmployeeResponse = Schemas["PagedResponseOfEmployeeResponse"]
export type PagedResponseOfRoleResponse = Schemas["PagedResponseOfRoleResponse"]
export type ApiResponseOfDepartmentResponse = Schemas["ApiResponseOfDepartmentResponse"]
export type ApiResponseOfPagedResponseOfDepartmentResponse = Schemas["ApiResponseOfPagedResponseOfDepartmentResponse"]
export type ApiResponseOfPositionResponse = Schemas["ApiResponseOfPositionResponse"]
export type ApiResponseOfPagedResponseOfPositionResponse = Schemas["ApiResponseOfPagedResponseOfPositionResponse"]
export type ApiResponseOfEmployeeResponse = Schemas["ApiResponseOfEmployeeResponse"]
export type ApiResponseOfPagedResponseOfEmployeeResponse = Schemas["ApiResponseOfPagedResponseOfEmployeeResponse"]
export type ApiResponseOfRoleResponse = Schemas["ApiResponseOfRoleResponse"]
export type ApiResponseOfPagedResponseOfRoleResponse = Schemas["ApiResponseOfPagedResponseOfRoleResponse"]
export type ApiResponseOfCurrentUserResponse = Schemas["ApiResponseOfCurrentUserResponse"]
