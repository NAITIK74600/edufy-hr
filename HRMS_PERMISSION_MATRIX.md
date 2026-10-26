# HRMS Role-Based Access Control (RBAC) & Permission Matrix

**System**: Edufyi HR Management System (HRMS)  
**Security Standard**: Principle of Least Privilege (PoLP), Deny-by-Default Authorization  
**Enforcement Level**: Server-Enforced (Node.js/Express Middleware)  
**Date**: October 26, 2026  

---

## 1. Architectural Distinction: Roles vs Departments

In the Edufyi HRMS, **Roles** and **Departments** are strictly decoupled concepts:

- **Department (`deptId` / `department`)**: Describes organizational placement and reporting boundaries (e.g., Technology, Human Resources, Sales). A department does **not** grant system privileges.
- **Role (`role`)**: Determines what system actions the user is authorized to perform (e.g., approve leave, record attendance, review onboarding documents).

### Organizational Audit on Managing Director and Co-Founder
- **Department**: Both "Managing Director" (`dept-managing-director`) and "Co-Founder" (`dept-co-founder`) exist as official executive organizational units (Office of the Managing Director / Founder's Office).
- **Role**: Both `managing_director` and `co_founder` exist as high-privilege corporate leadership roles with `LEADERSHIP_PERMISSIONS`.
- **Policy**: Both classifications are intentionally preserved in active database records without silent reclassification.

---

## 2. Permission Key Inventory

| Permission Constant | String Identifier | Description |
|---|---|---|
| `DASHBOARD_READ` | `dashboard.read` | View personal employee dashboard metrics |
| `HR_DASHBOARD_READ` | `hr.dashboard.read` | View company-wide executive / HR dashboard metrics |
| `EMPLOYEES_READ` | `employees.read` | View organizational employee directory |
| `EMPLOYEES_WRITE` | `employees.write` | Create, invite, activate, or update employee records |
| `EMPLOYEES_MANAGER_ASSIGN` | `employees.manager.assign` | Update reporting manager hierarchy |
| `ATTENDANCE_SELF_READ` | `attendance.self.read` | View personal daily punch records and monthly attendance history |
| `ATTENDANCE_SELF_WRITE` | `attendance.self.write` | Record personal punch in, punch out, and break events |
| `ATTENDANCE_TEAM_READ` | `attendance.team.read` | View attendance records of direct and indirect reports |
| `ATTENDANCE_READ` | `attendance.read` | View organization-wide attendance roster and summaries |
| `ATTENDANCE_WRITE` | `attendance.write` | Perform manual attendance corrections, overrides, and delete records |
| `LEAVE_SELF_READ` | `leave.self.read` | View personal leave balances, history, and status |
| `LEAVE_SELF_WRITE` | `leave.self.write` | Submit personal leave requests and cancel unapproved applications |
| `LEAVE_TEAM_READ` | `leave.team.read` | View pending leave requests from direct and indirect reports |
| `LEAVE_TEAM_APPROVE` | `leave.team.approve` | Approve or reject leave applications submitted by reporting staff |
| `LEAVE_HR_READ` | `leave.hr.read` | View all company leave requests and leave balances |
| `LEAVE_HR_REVIEW` | `leave.hr.review` | Perform final HR approval, rejection, or policy override on leave requests |
| `LEAVE_POLICY_ADMIN` | `leave.policy.admin` | Configure company leave policies, allowances, quotas, and rules |
| `PAYROLL_SELF_READ` | `payroll.self.read` | View and download personal payslips |
| `PAYROLL_READ` | `payroll.read` | View company-wide payroll registers and salary structures |
| `PAYROLL_WRITE` | `payroll.write` | Generate, finalize, edit, and disburse payroll and company payslips |
| `PERFORMANCE_READ` | `performance.read` | View performance KPIs, goal progression, and review cycles |
| `RECRUITMENT_READ` | `recruitment.read` | View job postings, applicant pipelines, and interview stages |
| `REPORTS_READ` | `reports.read` | Access analytics, attendance trends, and compliance reports |
| `TASKS_READ` | `tasks.read` | View assigned workspace tasks and milestones |
| `TRAINING_READ` | `training.read` | View assigned courses, LMS materials, and certifications |
| `HELPDESK_READ` | `helpdesk.read` | Create and view internal support and IT helpdesk tickets |
| `ANNOUNCEMENTS_READ` | `announcements.read` | View company-wide notices, policy circulars, and updates |
| `HOLIDAYS_READ` | `holidays.read` | View official company holiday calendar |
| `DOCUMENTS_READ` | `documents.read` | Access assigned company documents, NDA, and handbook |
| `HR_SETTINGS_READ` | `settings.hr.read` | Access HR operational configurations and branch parameters |

---

## 3. Role-to-Permission Mapping Matrix

| Category | Canonical Role Identifier | Assigned Permissions |
|---|---|---|
| **Super Admin** | `admin` | Full wildcard `['*']` access to all resources and settings |
| **Executive Leadership** | `managing_director`, `director`, `co_founder`, `vertical_head` | `DASHBOARD_READ`, `HR_DASHBOARD_READ`, `EMPLOYEES_READ`, `EMPLOYEES_WRITE`, `EMPLOYEES_MANAGER_ASSIGN`, `ATTENDANCE_SELF_READ`, `ATTENDANCE_SELF_WRITE`, `ATTENDANCE_TEAM_READ`, `ATTENDANCE_READ`, `ATTENDANCE_WRITE`, `LEAVE_SELF_READ`, `LEAVE_SELF_WRITE`, `LEAVE_TEAM_READ`, `LEAVE_TEAM_APPROVE`, `LEAVE_HR_READ`, `PAYROLL_SELF_READ`, `PAYROLL_READ`, `PAYROLL_WRITE`, `PERFORMANCE_READ`, `REPORTS_READ`, `TASKS_READ`, `TRAINING_READ`, `HELPDESK_READ`, `ANNOUNCEMENTS_READ`, `HOLIDAYS_READ`, `DOCUMENTS_READ` |
| **People Operations (HR)** | `hr`, `hr_executive` | `DASHBOARD_READ`, `HR_DASHBOARD_READ`, `EMPLOYEES_READ`, `EMPLOYEES_WRITE`, `EMPLOYEES_MANAGER_ASSIGN`, `ATTENDANCE_SELF_READ`, `ATTENDANCE_SELF_WRITE`, `ATTENDANCE_TEAM_READ`, `ATTENDANCE_READ`, `ATTENDANCE_WRITE`, `LEAVE_SELF_READ`, `LEAVE_SELF_WRITE`, `LEAVE_TEAM_READ`, `LEAVE_HR_READ`, `LEAVE_HR_REVIEW`, `LEAVE_POLICY_ADMIN`, `PAYROLL_SELF_READ`, `PAYROLL_READ`, `PAYROLL_WRITE`, `PERFORMANCE_READ`, `RECRUITMENT_READ`, `REPORTS_READ`, `TASKS_READ`, `TRAINING_READ`, `HELPDESK_READ`, `ANNOUNCEMENTS_READ`, `HOLIDAYS_READ`, `DOCUMENTS_READ`, `HR_SETTINGS_READ` |
| **Department Managers** | `manager`, `revenue_growth_manager` | `DASHBOARD_READ`, `EMPLOYEES_READ`, `ATTENDANCE_SELF_READ`, `ATTENDANCE_SELF_WRITE`, `ATTENDANCE_TEAM_READ`, `LEAVE_SELF_READ`, `LEAVE_SELF_WRITE`, `LEAVE_TEAM_READ`, `LEAVE_TEAM_APPROVE`, `PAYROLL_SELF_READ`, `PERFORMANCE_READ`, `REPORTS_READ`, `TASKS_READ`, `TRAINING_READ`, `HELPDESK_READ`, `ANNOUNCEMENTS_READ`, `HOLIDAYS_READ`, `DOCUMENTS_READ` |
| **Team Leads** | `team_lead`, `team_leader` | `DASHBOARD_READ`, `EMPLOYEES_READ`, `ATTENDANCE_SELF_READ`, `ATTENDANCE_SELF_WRITE`, `ATTENDANCE_TEAM_READ`, `LEAVE_SELF_READ`, `LEAVE_SELF_WRITE`, `LEAVE_TEAM_READ`, `LEAVE_TEAM_APPROVE`, `PAYROLL_SELF_READ`, `PERFORMANCE_READ`, `TASKS_READ`, `TRAINING_READ`, `HELPDESK_READ`, `ANNOUNCEMENTS_READ`, `HOLIDAYS_READ`, `DOCUMENTS_READ` |
| **Staff & Executives** | `operations_executive`, `business_development_executive`, `marketing_executive`, `sde`, `seo_executive`, `post_sales_executive`, `employee` | `DASHBOARD_READ`, `ATTENDANCE_SELF_READ`, `ATTENDANCE_SELF_WRITE`, `LEAVE_SELF_READ`, `LEAVE_SELF_WRITE`, `PAYROLL_SELF_READ`, `TASKS_READ`, `TRAINING_READ`, `HELPDESK_READ`, `ANNOUNCEMENTS_READ`, `HOLIDAYS_READ`, `DOCUMENTS_READ` |
| **Interns** | `business_development_intern`, `marketing_intern`, `sde_intern`, `seo_intern`, `post_sales_intern` | `DASHBOARD_READ`, `ATTENDANCE_SELF_READ`, `ATTENDANCE_SELF_WRITE`, `LEAVE_SELF_READ`, `LEAVE_SELF_WRITE`, `PAYROLL_SELF_READ`, `TASKS_READ`, `TRAINING_READ`, `HELPDESK_READ`, `ANNOUNCEMENTS_READ`, `HOLIDAYS_READ`, `DOCUMENTS_READ` |

---

## 4. Protected Endpoints & Security Boundaries

### 4.1 Denial of Self-Verification & Self-Approval
1. **Document Verification**:
   - `POST /api/v1/employees/:id/documents/:docKey/approve` -> Rejects with `FORBIDDEN_SELF_VERIFICATION` (403) if `actor.id === employee.id`.
   - `POST /api/v1/employees/:id/onboarding/approve` -> Rejects with `FORBIDDEN_SELF_VERIFICATION` (403) if `actor.id === employee.id`.
2. **Leave Decision**:
   - `POST /api/v1/leave/team/:id/approve` and `POST /api/v1/leave/hr/:id/approve` -> Rejects with `FORBIDDEN_SELF_APPROVAL` (403) if `actor.id === request.employeeId`.

### 4.2 Document Upload Boundary
- `POST /api/v1/employees/:id/documents/:docKey` -> Only the employee who owns the account may upload verification files. HR and Admin users attempting to upload verification files on another employee's behalf receive HTTP 403 Forbidden.

### 4.3 Field-Level Mass Assignment Protection
- `PATCH /api/v1/employees/:id`:
  - When called by an employee updating their own profile (without `EMPLOYEES_WRITE`), fields are strictly whitelisted to personal contact, emergency contact, bank details, and identity documents.
  - Role, department, salary, manager ID, account status, and verification statuses are strictly blocked from modification.
  - Any submitted `onboardingStatus` is forced to `'submitted'`.
  - Any submitted document objects have their `status` forced to `'submitted'` with nullified `verifiedAt` and `verifiedBy`.

### 4.4 Data Ownership & Horizontal Isolation
- **Attendance**: Standard employees querying `/attendance` or `/attendance/self` can only view their own punch records. Managers querying `/attendance` are scoped by direct and indirect reports (`managerId`).
- **Leave**: Employees can only retrieve their own applications (`/leave/requests?scope=self`). Managers only see requests where `request.managerId === actor.id`.
- **Payroll**: Employees querying `/payroll` only receive records where `employeeRef === actor.id` or matching their employee code. Unprivileged users cannot query other employees' records.
