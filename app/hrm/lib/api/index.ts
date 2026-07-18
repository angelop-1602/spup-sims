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
export type UpdateEmployeeRequest = Schemas["UpdateEmployeeRequest"]
export type EmployeeTypeResponse = Schemas["EmployeeTypeResponse"]
export type PagedResponseOfEmployeeTypeResponse = Schemas["PagedResponseOfEmployeeTypeResponse"]
export type RoleResponse = Schemas["RoleResponse"]
export type CurrentUserResponse = Schemas["CurrentUserResponse"]
export type JobPostingResponse = Schemas["JobPostingResponse"]
export type JobPostingStatus = Schemas["JobPostingStatus"]
export type CreateJobPostingRequest = Schemas["CreateJobPostingRequest"]
export type UpdateJobPostingRequest = Schemas["UpdateJobPostingRequest"]
export type PagedResponseOfDepartmentResponse = Schemas["PagedResponseOfDepartmentResponse"]
export type PagedResponseOfPositionResponse = Schemas["PagedResponseOfPositionResponse"]
export type PagedResponseOfEmployeeResponse = Schemas["PagedResponseOfEmployeeResponse"]
export type PagedResponseOfRoleResponse = Schemas["PagedResponseOfRoleResponse"]
export type PagedResponseOfJobPostingResponse = Schemas["PagedResponseOfJobPostingResponse"]
export type ApiResponseOfDepartmentResponse = Schemas["ApiResponseOfDepartmentResponse"]
export type ApiResponseOfPagedResponseOfDepartmentResponse = Schemas["ApiResponseOfPagedResponseOfDepartmentResponse"]
export type ApiResponseOfPositionResponse = Schemas["ApiResponseOfPositionResponse"]
export type ApiResponseOfPagedResponseOfPositionResponse = Schemas["ApiResponseOfPagedResponseOfPositionResponse"]
export type ApiResponseOfEmployeeResponse = Schemas["ApiResponseOfEmployeeResponse"]
export type ApiResponseOfPagedResponseOfEmployeeResponse = Schemas["ApiResponseOfPagedResponseOfEmployeeResponse"]
export type ApiResponseOfRoleResponse = Schemas["ApiResponseOfRoleResponse"]
export type ApiResponseOfPagedResponseOfRoleResponse = Schemas["ApiResponseOfPagedResponseOfRoleResponse"]
export type ApiResponseOfCurrentUserResponse = Schemas["ApiResponseOfCurrentUserResponse"]
export type ApiResponseOfJobPostingResponse = Schemas["ApiResponseOfJobPostingResponse"]
export type ApiResponseOfPagedResponseOfJobPostingResponse = Schemas["ApiResponseOfPagedResponseOfJobPostingResponse"]
export type SchoolYearResponse = Schemas["SchoolYearResponse"]
export type EmployeeSchoolYearAssignmentResponse = Schemas["EmployeeSchoolYearAssignmentResponse"]
export type PagedResponseOfEmployeeSchoolYearAssignmentResponse = Schemas["PagedResponseOfEmployeeSchoolYearAssignmentResponse"]
export type CreateEmployeeSchoolYearAssignmentRequest = Schemas["CreateEmployeeSchoolYearAssignmentRequest"]
export type UpdateEmployeeSchoolYearAssignmentRequest = Schemas["UpdateEmployeeSchoolYearAssignmentRequest"]
