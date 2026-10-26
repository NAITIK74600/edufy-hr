# HRMS Defect & Bug Tracker

**System**: Edufyi HR Management System (HRMS)  
**Report Type**: Quality Assurance & Defect Remediation Log  
**Date**: October 26, 2026  

---

## 1. Summary of Defects

| Defect ID | Severity | Module | Summary | Status |
|---|---|---|---|---|
| **BUG-001** | High | UI / Styling | Leave Policy Quota Modal (`AllInOneQuotaModal`) cutoff at bottom of viewport | **Fixed & Verified** |
| **BUG-002** | Critical | Security / Onboarding | HR/Admin could upload verification documents for employees | **Fixed & Verified** |
| **BUG-003** | Critical | Security / RBAC | Frontend `src/auth/permissions.js` missing 18 canonical role mappings | **Fixed & Verified** |
| **BUG-004** | High | Security / Employee | Privilege escalation risk in `PATCH /api/v1/employees/:id` self-update | **Fixed & Verified** |
| **BUG-005** | High | Security / Leave | Absence of explicit self-approval rejection in leave decision service | **Fixed & Verified** |
| **BUG-006** | Medium | Attendance / RBAC | Hardcoded `['admin', 'hr']` checks in attendance punch routes bypassing HR Executive | **Fixed & Verified** |
| **BUG-007** | Medium | Payroll / RBAC | `isManagementRole` in `payroll.routes.js` omitted `vertical_head` | **Fixed & Verified** |
| **BUG-008** | Low | Architecture | Duplicate export syntax in `leave.repository.js` | **Fixed & Verified** |

---

## 2. Detailed Bug Reports

### BUG-001: Leave Policy Quota Modal Viewport Cutoff
- **Severity**: High (UI/UX Blocker)
- **Affected Module**: `src/pages/LeavePolicySettings.jsx`, `src/styles.css`
- **Root Cause**: The modal was rendered inside a relative DOM hierarchy with restrictive `overflow-hidden` containers and absolute positioning (`top-1/2 -translate-y-1/2`) without dynamic flex centering. On laptops and standard resolutions, the bottom action buttons ("Save Allowances", "Cancel") were pushed off-screen.
- **Reproduction Steps**:
  1. Login as HR or Admin.
  2. Navigate to **Leave Policy Settings**.
  3. Click "Edit All Quotas" or "Company Defaults".
  4. Notice the bottom portion of the modal container was cut off below viewport edge.
- **Remediation**:
  - Implemented React `createPortal(modalNode, document.body)` to escape parent container constraints.
  - Added modern flexbox overlay styles (`min-h-full flex items-center justify-center p-4`) in `src/styles.css` with a scrollable `max-h-[90vh]` modal body.
- **Verification**: Verified across mobile, tablet, and desktop viewports; modal scrolls smoothly with fixed header and footer.

---

### BUG-002: HR/Admin Upload Option for Employee Verification Documents
- **Severity**: Critical (Identity & Document Integrity Violation)
- **Affected Module**: `src/pages/EmployeesPage.jsx`, `src/components/OnboardingDossierView.jsx`, `server/src/modules/employees/employee.service.js`
- **Root Cause**: The employee drawer passed `canEdit={hasPermission(user, 'employees.write')}` to `OnboardingDossierView`. Because HR/Admin users possess `employees.write`, the file input cards were rendered with active "Upload File" buttons for other employees' dossiers, allowing third parties to upload identity credentials.
- **Reproduction Steps**:
  1. Login as HR or Admin.
  2. Open the Employee Directory.
  3. Click on any employee record to open their dossier drawer.
  4. Navigate to the Verification Documents tab.
  5. The file upload button was clickable and allowed uploading documents on behalf of the employee.
- **Remediation**:
  - Updated `src/pages/EmployeesPage.jsx` to pass `canEdit={false}` in the staff view drawer.
  - In `src/components/OnboardingDossierView.jsx`, computed `canUpload = Boolean(canEdit) && !isHRorAdmin && (isOwnRecord || !isStaffRole)`, gating all file input buttons.
  - In `server/src/modules/employees/employee.service.js`, added server-side guard `if (!isSelf) throw error('Employees must upload their own verification documents', 403)`.
- **Verification**: HR and Admin users only see "Pending Employee Upload" or "Review Document" (Approve / Reject with remarks). Employees can upload their own documents via the Employee Portal.

---

### BUG-003: Frontend Default Permissions Missing Granular Enterprise Roles
- **Severity**: Critical (Authorization Breakage)
- **Affected Module**: `src/auth/permissions.js`
- **Root Cause**: `server/src/auth/permissions.js` mapped 18 canonical roles (`managing_director`, `vertical_head`, `operations_executive`, `business_development_executive`, etc.) to specific permission sets. However, `src/auth/permissions.js` on the client only defined `admin`, `hr`, `director`, `manager`, `team_lead`, `employee`. Logging in with any non-legacy role caused `ROLE_DEFAULT_PERMISSIONS[user.role]` to return `undefined`, resulting in empty client permissions and broken navigation.
- **Reproduction Steps**:
  1. Create or login as a user with role `operations_executive` or `managing_director`.
  2. Frontend `hasPermission()` evaluates against `ROLE_DEFAULT_PERMISSIONS`.
  3. Role lookup yielded `[]` (empty array); pages rendered unauthorized states.
- **Remediation**:
  - Updated `src/auth/permissions.js` with full mappings matching the server:
    - `managing_director`, `director`, `co_founder`, `vertical_head` -> `LEADERSHIP_PERMISSIONS`
    - `revenue_growth_manager`, `manager` -> `MANAGER_PERMISSIONS`
    - `team_leader`, `team_lead` -> `TEAM_LEAD_PERMISSIONS`
    - `hr_executive`, `hr` -> `HR_DEFAULT_PERMISSIONS`
    - All executive and intern roles -> `ESS_PERMISSIONS`
- **Verification**: Verified with `npm run build` and authentication test runs.

---

### BUG-004: Potential Privilege Escalation in Employee Self-Update API
- **Severity**: High (Integrity Vulnerability)
- **Affected Module**: `server/src/modules/employees/employee.routes.js`
- **Root Cause**: When an employee updated their record via `PATCH /api/v1/employees/:id`, the filter for allowed self fields allowed `onboardingStatus` directly through without sanitization, permitting a malicious client to send `{ onboardingStatus: 'verified' }` or document status as `verified`.
- **Reproduction Steps**:
  1. Authenticate as an employee.
  2. Issue a `PATCH /api/v1/employees/<selfId>` with body `{"onboardingStatus": "verified"}`.
  3. The service assigned the raw status directly to the employee record.
- **Remediation**:
  - In `employee.routes.js`, removed `onboardingStatus` from direct assignment on self-updates. If submitted, forced to `'submitted'` with timestamp `onboardingSubmittedAt = new Date()`.
  - Sanitized `onboardingDocs` to force `status: 'submitted'` and null out `verifiedAt` and `verifiedBy`.
- **Verification**: Self-updates cannot elevate document or onboarding verification states.

---

### BUG-005: Absence of Explicit Self-Approval Rejection in Leave Service
- **Severity**: High (Business Logic Flaw)
- **Affected Module**: `server/src/modules/leave/leave.service.js`
- **Root Cause**: In `decide(id, decision, payload, actor, scope)`, the service verified role permissions (`LEAVE_HR_REVIEW`, `LEAVE_TEAM_APPROVE`) but did not assert that `actor.id !== request.employeeId`. An HR user or Manager applying for leave could potentially approve their own application.
- **Reproduction Steps**:
  1. An HR manager submits a personal leave request.
  2. In the HR review queue, the HR manager calls `/leave/hr/:id/approve`.
  3. Decision succeeds without conflict.
- **Remediation**:
  - In `server/src/modules/leave/leave.service.js`, added:
    ```javascript
    const isSelf = idOf(request.employeeId) === idOf(actor.id) ||
      (actor.employeeId && idOf(request.employeeId) === idOf(actor.employeeId))
    if (isSelf) {
      throw error('Self-approval of leave requests is strictly prohibited. You cannot decide your own leave request.', 403, 'FORBIDDEN_SELF_APPROVAL')
    }
    ```
- **Verification**: Automated test suite confirms that self-approval attempts yield HTTP 403 `FORBIDDEN_SELF_APPROVAL`.

---

### BUG-006: Hardcoded Role Checks Bypassing HR Executive in Attendance Routes
- **Severity**: Medium (RBAC Inconsistency)
- **Affected Module**: `server/src/modules/attendance/attendance.routes.js`
- **Root Cause**: Routes `/config`, `/check-in`, `/break/start`, `/break/end`, and `/check-out` checked `['admin', 'hr'].includes(user.role)` instead of checking the permission `hasPermission(user, PERMISSIONS.ATTENDANCE_WRITE)`. Users with role `hr_executive` were treated as unprivileged employees in these endpoints.
- **Reproduction Steps**:
  1. Authenticate with role `hr_executive`.
  2. Request `GET /api/v1/attendance/config`.
  3. Config returned sanitized IP addresses instead of administrative configuration data.
- **Remediation**:
  - Replaced hardcoded role checks with `hasPermission(user, PERMISSIONS.ATTENDANCE_WRITE)`.
- **Verification**: Verified that all users with `ATTENDANCE_WRITE` receive full administrative context and privileged punch correction capabilities.

---

### BUG-007: Omission of Vertical Head in Payroll Routes Management Check
- **Severity**: Medium (RBAC Inconsistency)
- **Affected Module**: `server/src/modules/payroll/payroll.routes.js`
- **Root Cause**: `isManagementRole` in `payroll.routes.js` listed `['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder']`, leaving out `vertical_head`. Vertical Heads with leadership permissions were denied access to payroll management tools.
- **Remediation**:
  - Added `'vertical_head'` to `isManagementRole` in `payroll.routes.js`.
  - Updated `verifyPayslipAccess` to use `isManagementRole(authUser) && hasPermission(authUser, 'payroll.read')`.
- **Verification**: Verified syntax and test coverage; payroll management access conforms to the permission matrix.

---

### BUG-008: Duplicate Export in Leave Repository
- **Severity**: Low (Syntax Defect)
- **Affected Module**: `server/src/modules/leave/leave.repository.js`
- **Root Cause**: `export function ensureConnected` was declared on line 8 and re-exported in `export { ensureConnected }` at line 194.
- **Remediation**:
  - Removed redundant export statement.
- **Verification**: Module imports cleanly across the entire server suite.
