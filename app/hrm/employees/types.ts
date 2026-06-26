export interface Employee {
  id: number
  employeeNumber: string
  firstName: string
  middleName: string | null
  lastName: string
  suffix: string | null
  fullName: string
  email: string
  mobileNumber: string | null
  phoneNumber: string | null
  age: number | null          
  religion: string | null     
  qualifier: string | null    
  profilePicture: string | null
  employeeTypeId: number
  employeeType: string | null
  departmentId: number
  department: string | null
  designationId: number | null
  designation: string | null
  supervisorId: number | null
  supervisor: string | null
  employmentStatus: string | null 
  employmentCategory: string | null 
  shared: boolean
  dateHired: string
  dateRegularized: string | null
  dateSeparated: string | null
  isActive: boolean
}

export interface EmployeesResponse {
  success: boolean
  message: string
  data: {
    data: Employee[]
    page: number
    pageSize: number
    totalRecords: number
    totalPages: number
  }
}

export interface Department {
  id: number
  name: string
}

export interface DepartmentsResponse {
  success: boolean
  data: {
    data: Department[]
  }
}

export interface Designation {
  id: number
  name: string
}

export interface DesignationsResponse {
  success: boolean
  data: {
    data: Designation[]
  }
}