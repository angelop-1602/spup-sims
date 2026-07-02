# API Request/Response Examples

This document shows the architectural differences between the **Recruitment** and **HRMS** modules.

---

## 🎯 KEY ARCHITECTURAL DIFFERENCES

| Aspect | **Recruitment Module** | **HRMS Module** |
|--------|----------------------|-----------------|
| **Purpose** | Track job applicants (prospects) | Manage hired employees |
| **Entity** | `EmployeeApplicant` | `Employee` |
| **Profile Handling** | **Creates Profile automatically** | **Requires existing Profile** |
| **Request Structure** | Special composite request | Standard entity request |
| **Typical Flow** | Apply → Screen → Interview → Hire | Already hired → Manage employment |

---

## 📋 RECRUITMENT MODULE - Employee Applicants

### **Create Employee Applicant** (Special Handler)

**Endpoint:** `POST /api/v1/recruitment/employee-applicants`

**Key Feature:** Creates both `Profile` AND `EmployeeApplicant` in one transaction.

#### Request Example 1: Nested Profile Object

```json
{
  "profile": {
    "firstName": "Maria",
    "middleName": "Santos",
    "lastName": "Cruz",
    "suffix": null,
    "gender": "Female",
    "birthDate": "1995-03-15",
    "civilStatus": "Single",
    "personalEmail": "maria.cruz@example.com",
    "phoneNumber": "+639171234567",
    "mobileNumber": "+639171234567",
    "age": 31,
    "religion": "Catholic",
    "address": "123 Main St, Manila",
    "qualifier": "CPA",
    "profilePicture": null
  },
  "applicationNumber": null,
  "status": "Submitted"
}
```

**What happens:**
1. ✅ Creates new `Profile` record with ID (e.g., 456)
2. ✅ Generates application number: `EMP-APP-20260701104530-a1b2c3`
3. ✅ Creates `EmployeeApplicant` linked to the new profile
4. ✅ Sets status to `Submitted`

#### Request Example 2: Flat Structure (Backward Compatible)

```json
{
  "firstName": "Juan",
  "middleName": "Dela",
  "lastName": "Cruz",
  "gender": "Male",
  "birthDate": "1990-08-20",
  "personalEmail": "juan.delacruz@example.com",
  "mobileNumber": "+639181234567",
  "address": "456 Rizal Ave, Quezon City",
  "applicationNumber": "EMP-APP-2026-001",
  "status": "Submitted"
}
```

**Note:** Profile fields can be provided at the root level OR nested in `profile` object.

#### Response

```json
{
  "entity": "employee-applicants",
  "id": 123,
  "values": {
    "id": 123,
    "profileId": 456,
    "applicationNumber": "EMP-APP-20260701104530-a1b2c3",
    "status": "Submitted",
    "createdAt": "2026-07-01T02:45:30Z",
    "updatedAt": null,
    "deletedAt": null,
    "createdBy": null,
    "updatedBy": null,
    "deletedBy": null
  }
}
```

**Notice:**
- ⚠️ Only scalar values returned (no nested `profile` object)
- ⚠️ Only `profileId` foreign key is included
- ⚠️ To get profile details, make a second call: `GET /api/v1/core/profiles/456`

---

### **Get Employee Applicant**

**Endpoint:** `GET /api/v1/recruitment/employee-applicants/123`

#### Response

```json
{
  "entity": "employee-applicants",
  "id": 123,
  "values": {
    "id": 123,
    "profileId": 456,
    "applicationNumber": "EMP-APP-20260701104530-a1b2c3",
    "status": "Interview",
    "createdAt": "2026-07-01T02:45:30Z",
    "updatedAt": "2026-07-01T08:30:15Z",
    "deletedAt": null,
    "createdBy": null,
    "updatedBy": 5,
    "deletedBy": null
  }
}
```

---

### **Update Employee Applicant** (Generic Handler)

**Endpoint:** `PUT /api/v1/recruitment/employee-applicants/123`

**Key Feature:** Only updates the applicant record, NOT the profile.

```json
{
  "status": "Approved",
  "applicationNumber": "EMP-APP-2026-001-REVISED"
}
```

**Note:** To update profile info (name, email, etc.), use: `PUT /api/v1/core/profiles/456`

---

### **List Employee Applicants with Filters**

**Endpoint:** `GET /api/v1/recruitment/employee-applicants`

**Query Parameters:**
- `page=1`
- `pageSize=20`
- `status=Interview` (filter by status)
- `search=maria` (search in ApplicationNumber - the searchable field)
- `sortBy=createdAt`
- `descending=true`

#### Response

```json
{
  "items": [
    {
      "entity": "employee-applicants",
      "id": 123,
      "values": {
        "id": 123,
        "profileId": 456,
        "applicationNumber": "EMP-APP-20260701104530-a1b2c3",
        "status": "Interview",
        "createdAt": "2026-07-01T02:45:30Z",
        "updatedAt": "2026-07-01T08:30:15Z",
        "deletedAt": null,
        "createdBy": null,
        "updatedBy": 5,
        "deletedBy": null
      }
    },
    {
      "entity": "employee-applicants",
      "id": 124,
      "values": {
        "id": 124,
        "profileId": 457,
        "applicationNumber": "EMP-APP-20260701110022-b2c3d4",
        "status": "Interview",
        "createdAt": "2026-07-01T03:00:22Z",
        "updatedAt": null,
        "deletedAt": null,
        "createdBy": null,
        "updatedBy": null,
        "deletedBy": null
      }
    }
  ],
  "totalCount": 2,
  "page": 1,
  "pageSize": 20
}
```

---

### **Complete Applicant Flow Example**

#### Step 1: Create Applicant
```http
POST /api/v1/recruitment/employee-applicants
{
  "firstName": "Ana",
  "lastName": "Garcia",
  "personalEmail": "ana.garcia@example.com",
  "mobileNumber": "+639191234567"
}
```

Response: `{ "id": 200, "profileId": 500, "applicationNumber": "EMP-APP-...", "status": "Submitted" }`

#### Step 2: Upload Documents
```http
POST /api/v1/recruitment/employee-applicant-documents
{
  "employeeApplicantId": 200,
  "requirementName": "Resume",
  "fileName": "ana-garcia-resume.pdf",
  "storagePath": "/uploads/applicants/200/resume.pdf"
}
```

#### Step 3: Track Status Changes
```http
POST /api/v1/recruitment/employee-applicant-status-history
{
  "employeeApplicantId": 200,
  "status": "Screening",
  "remarks": "Initial document review passed"
}

POST /api/v1/recruitment/employee-applicant-status-history
{
  "employeeApplicantId": 200,
  "status": "Interview",
  "remarks": "Scheduled for technical interview on July 5"
}
```

#### Step 4: Schedule Interview
```http
POST /api/v1/recruitment/interview-schedules
{
  "employeeApplicantId": 200,
  "scheduledAt": "2026-07-05T14:00:00Z",
  "venue": "HR Conference Room A",
  "notes": "Technical and behavioral interview with IT Head"
}
```

#### Step 5: Update Applicant Status
```http
PUT /api/v1/recruitment/employee-applicants/200
{
  "status": "Approved"
}
```

#### Step 6: Mark as Hired
```http
PUT /api/v1/recruitment/employee-applicants/200
{
  "status": "Hired"
}
```

**Note:** At this point, the applicant should be manually converted to an `Employee` record in the HRMS module.

---

## 💼 HRMS MODULE - Employees

### **Create Employee** (Generic Handler)

**Endpoint:** `POST /api/v1/hrms/employees`

**Key Difference:** Profile MUST already exist. You provide `profileId`.

#### Request Example

```json
{
  "profileId": 500,
  "employeeNumber": "EMP-2026-001",
  "dateHired": "2026-07-10",
  "dateRegularized": null,
  "dateSeparated": null,
  "employmentType": "Full-Time",
  "employeeTypeId": 1,
  "departmentId": 3,
  "designationId": 5,
  "supervisorId": null,
  "status": "Probationary",
  "employmentCategory": "Probationary",
  "shared": false,
  "isActive": true
}
```

**What happens:**
1. ✅ Links to existing profile (ID 500)
2. ✅ Creates `Employee` record with employment details
3. ✅ Sets organizational assignment (department, designation)
4. ⚠️ If `profileId` doesn't exist → ERROR

#### Response

```json
{
  "entity": "employees",
  "id": 50,
  "values": {
    "id": 50,
    "profileId": 500,
    "employeeNumber": "EMP-2026-001",
    "dateHired": "2026-07-10",
    "dateRegularized": null,
    "dateSeparated": null,
    "employmentType": "Full-Time",
    "employeeTypeId": 1,
    "departmentId": 3,
    "designationId": 5,
    "supervisorId": null,
    "status": "Probationary",
    "employmentCategory": "Probationary",
    "shared": false,
    "isActive": true,
    "createdAt": "2026-07-01T03:00:00Z",
    "updatedAt": null,
    "deletedAt": null,
    "createdBy": 5,
    "updatedBy": null,
    "deletedBy": null
  }
}
```

---

### **Get Employee**

**Endpoint:** `GET /api/v1/hrms/employees/50`

#### Response

```json
{
  "entity": "employees",
  "id": 50,
  "values": {
    "id": 50,
    "profileId": 500,
    "employeeNumber": "EMP-2026-001",
    "dateHired": "2026-07-10",
    "dateRegularized": "2026-12-10",
    "dateSeparated": null,
    "employmentType": "Full-Time",
    "employeeTypeId": 1,
    "departmentId": 3,
    "designationId": 5,
    "supervisorId": 48,
    "status": "Active",
    "employmentCategory": "Regular",
    "shared": false,
    "isActive": true,
    "createdAt": "2026-07-01T03:00:00Z",
    "updatedAt": "2026-12-10T10:00:00Z",
    "deletedAt": null,
    "createdBy": 5,
    "updatedBy": 5,
    "deletedBy": null
  }
}
```

---

### **Update Employee**

**Endpoint:** `PUT /api/v1/hrms/employees/50`

```json
{
  "status": "Active",
  "employmentCategory": "Regular",
  "dateRegularized": "2026-12-10",
  "designationId": 7
}
```

---

### **List Employees with Filters**

**Endpoint:** `GET /api/v1/hrms/employees`

**Query Parameters:**
- `page=1`
- `pageSize=50`
- `status=Active` (filter by employment status)
- `search=EMP-2026` (search in EmployeeNumber, EmploymentType)
- `sortBy=employeeNumber`
- `descending=false`

#### Response

```json
{
  "items": [
    {
      "entity": "employees",
      "id": 50,
      "values": {
        "id": 50,
        "profileId": 500,
        "employeeNumber": "EMP-2026-001",
        "status": "Active",
        "employmentCategory": "Regular",
        "departmentId": 3,
        "designationId": 7,
        "isActive": true
      }
    },
    {
      "entity": "employees",
      "id": 51,
      "values": {
        "id": 51,
        "profileId": 501,
        "employeeNumber": "EMP-2026-002",
        "status": "Active",
        "employmentCategory": "Regular",
        "departmentId": 3,
        "designationId": 5,
        "isActive": true
      }
    }
  ],
  "totalCount": 2,
  "page": 1,
  "pageSize": 50
}
```

---

### **Employee School Year Assignment** (School-Year Scoped)

**Endpoint:** `POST /api/v1/hrms/employee-school-years`

**Purpose:** Assign employee to a specific school year (for faculty/academic staff).

```json
{
  "employeeId": 50,
  "schoolYearId": 1,
  "departmentId": 3,
  "designationId": 7,
  "employmentStatus": "Active",
  "isFaculty": true
}
```

**Note:** If `schoolYearId` is omitted, it automatically uses the "current" school year.

---

## 🔄 CONVERSION FLOW: Applicant → Employee

**Manual Process:**

### Step 1: Get Applicant
```http
GET /api/v1/recruitment/employee-applicants/200
```
Response: `{ "id": 200, "profileId": 500, "status": "Hired" }`

### Step 2: Create Employee
```http
POST /api/v1/hrms/employees
{
  "profileId": 500,
  "employeeNumber": "EMP-2026-001",
  "dateHired": "2026-07-10",
  "employmentType": "Full-Time",
  "employeeTypeId": 1,
  "departmentId": 3,
  "designationId": 5,
  "status": "Probationary",
  "employmentCategory": "Probationary",
  "isActive": true
}
```

### Step 3: (Optional) Update Applicant Status
```http
PUT /api/v1/recruitment/employee-applicants/200
{
  "status": "Hired"
}
```

**Future Enhancement:** Create an endpoint like `POST /api/v1/recruitment/employee-applicants/200/convert-to-employee` that does this automatically.

---

## 📊 COMPARISON SUMMARY

### Recruitment: EmployeeApplicant

```json
POST /api/v1/recruitment/employee-applicants
{
  // ✅ Profile fields included directly (creates Profile automatically)
  "firstName": "Maria",
  "lastName": "Cruz",
  "personalEmail": "maria@example.com",
  
  // Applicant-specific fields
  "applicationNumber": null,  // Auto-generated
  "status": "Submitted"
}
```

**Response:** Only scalar fields, no nested objects
**Profile:** Created automatically
**Use Case:** Job application submission

---

### HRMS: Employee

```json
POST /api/v1/hrms/employees
{
  // ⚠️ Profile must already exist
  "profileId": 500,
  
  // Employee-specific fields (more complex)
  "employeeNumber": "EMP-2026-001",
  "dateHired": "2026-07-10",
  "employmentType": "Full-Time",
  "employeeTypeId": 1,
  "departmentId": 3,
  "designationId": 5,
  "status": "Active",
  "employmentCategory": "Regular"
}
```

**Response:** Only scalar fields, no nested objects
**Profile:** Must reference existing profile
**Use Case:** Hiring/onboarding an employee

---

## 🎯 KEY TAKEAWAYS

1. **Recruitment is prospect-focused:** Creates profile + applicant in one go
2. **HRMS is employment-focused:** Requires existing profile, manages employment lifecycle
3. **Both return flat scalar data:** No nested objects in responses
4. **Profile is shared:** Same profile can be referenced by applicant → employee → user
5. **Status progression:**
   - Applicant: `Submitted` → `Screening` → `Evaluation` → `Interview` → `Approved` → `Hired`
   - Employee: `Active`, `Probationary`, `Resigned`, `Terminated`, etc.

