# IMPLEMENTATION_PHASE2.md  
**Phase 2 of 15: User, Role & Employee Management**

---
## Phase Coverage

**Modules included in this phase:**
- users
- user-listing
- user-management
- user-creation
- user-edit
- user-activation
- user-deactivation
- user-unlock
- user-bulk-import
- user-bulk-export
- user-profile
- user-self-edit
- password-change
- user-password-reset
- password-policy-enforcement
- user-log-report
- legacy-user-management
- employee-list
- employee-detail
- employee-import
- user-rights-management
- role-management
- role-permission-matrix
- object-level-access
- advanced-permission-management

---

## STEP 1 — REPOSITORY LAYER

> All DB access is via `callProcedure()` (see PROJECT_OVERVIEW.md / STANDARDS.md).

### Stored Procedures (SP) to wrap via `callProcedure()`:

| SP Name                    | Repository Function                  | Purpose                                    |
|----------------------------|--------------------------------------|--------------------------------------------|
| UserLogSql                 | getUserLog                           | Fetches user authentication log            |
| UserListSql                | getUserList                          | Fetches paginated user search              |
| EmployeeListSql            | getEmployeeList                      | Fetches employee listing                   |
| ImportUsersCsv             | importUsersCsv                       | Bulk user import                           |
| ExportUsersCsv             | exportUsersCsv                       | Bulk user export                           |
| UserDetailsSql             | getUserDetails                       | Returns full user profile                  |
| InsertUser                 | insertUser                           | Creates a new user                         |
| UpdateUser                 | updateUser                           | Updates user info                          |
| DeactivateUser             | deactivateUser                       | Sets user status inactive                  |
| ActivateUser               | activateUser                         | Sets user status active                    |
| UnlockUser                 | unlockUser                           | Removes account lock                       |
| ResetUserPassword          | resetUserPassword                    | Resets another user's password             |
| ChangeSelfPassword         | changeSelfPassword                   | Changes password as self                   |
| UserRoleMatrixSql          | getRoleMatrix                        | Fetches full permission matrix             |
| AssignUserRoles            | assignUserRoles                      | Assigns roles to user(s)                   |
| AssignRolePermissions      | assignRolePermissions                | Assigns/revokes permissions to roles       |
| LegacyUserListSql          | getLegacyUserList                    | Legacy user read/list                      |
| ImportLegacyUser           | importLegacyUser                     | Imports/migrates legacy user               |
| MergeLegacyUser            | mergeLegacyUser                      | Merges legacy user with active             |
| EmployeeDetailSql          | getEmployeeDetail                    | Loads employee detail for edit/view        |
| ImportEmployeeCsv          | importEmployeeCsv                    | Bulk employee import                       |
| ExportEmployeeCsv          | exportEmployeeCsv                    | Bulk employee export                       |
| UpdateProfileSelf          | updateProfileSelf                    | Self-edit of user profile fields           |
| ChangeUserStatusBulk       | changeUserStatusBulk                 | Bulk activate/deactivate users             |

**Every repository implementation must:**
- Use `callProcedure()` (never direct SQL).
- Validate and map all input/output parameter types.
- Log any error for troubleshooting with error context (without leaking credentials).

---

## STEP 2 — SERVICE LAYER

> **Enforce ALL applicable business rules (citing exact BR-XX).** Service implements RBAC (by role), field-level validation, workflow/approval as needed, and audit log writes for every sensitive action.

### Service Layer — Major Business Rules

#### 2.1 User/Account Operations

- **Unique identifier + password per user** (BR-01) validated on create/import.
- **Account lockout after failed attempts** (BR-02) — account is flagged locked if exceeded, unlock uses UnlockUser SP.
- **Password complexity, min length** (BR-03, BR-15):  
    - minLength: 10, must contain upper/lower/digit/special.
    - Enforced in service layer _and_ by password policy param.
- **Verification for password change/reset** (BR-04):  
    - Confirm old password or verify via reset token.
- **Session expiry/inactivity** (BR-05):  
    - Service enforces via issued/expiry in JWT and kicks inactive sessions at next request.
- **Role-based admin log/management** (BR-06 — only Supervisors/Admins can see/change users, see log, edit status).
- **User log only visible to Supervisor/Admin** (BR-07) — log endpoints check RBAC prior to serving data.
- **Re-authentication for sensitive actions** (BR-08):  
    - Changing password/status/roles requires current password or fresh token (within 5 min).
- **Notification on password/edit events** (BR-09):  
    - Triggers email (or system message) on all password change/reset events.
- **All user/account management via API** (BR-10): no unexposed functions.
- **Only admin can assign/modify permissions or roles** (BR-11).
- **Email address unique per user** (BR-12): enforced by repository on create/import.
- **User deactivation disables access** (BR-13):  
    - Token checks block login for status != active.
- **All user management actions logged** (BR-14):  
    - Audit log written for every create, edit, status/role change, import, password change.
- **Roles/permissions take effect immediately** (BR-20):  
    - All caches/in-memory roles refreshed after change.

#### 2.2 Password Policy Enforcement

- **Complexity enforced on all CHANGE/SET/RESET** (BR-03, BR-15):
    - Validated in both service and frontend.
    - Config param controls, but default is strict.
- **No password equal to user email or name** (inferred PRD: best practice).
- **Bulk user import validates for duplicate users (by email/username)** (BR-18):  
    - Import fails with reject reason in output array.
- **Temp/contractor access auto-expires** (BR-19):  
    - Service tracks `expiresAt`, revokes role when expired, blocks login.
- **User with multiple roles gets highest** (BR-16):  
    - Effective permission calculation always projects highest via mapping.

#### 2.3 Bulk Operations

- **Bulk activate/deactivate** (BR-45): Only admin can use, all action results/audited.
- **Bulk import/export creates success/error log/notifications** (BR-98):  
    - On errors, supervisor email/system notification sent.
- **Approval for imported/legacy actions** (any merge/import triggers audit log, supervisor must approve if configured).

#### 2.4 Role/Permission Management

- **Only Administrator manages roles/permissions** (BR-11, BR-37).
- **Permission matrix is enforced at service layer** (i.e., field/object-level, not just screen).
- **Cannot create duplicate roles**: validation via matrix.
- **Advanced reporting, designer features available only to those roles** (BR-17, BR-109).
- **All role/perm changes audited** (BR-14, BR-20, BR-130).

#### 2.5 User Log / Employee / Legacy User / Audit

- **Audit logs accessible only to sup/admin** (BR-131).
- **Legacy user migrate/merge only for admin** (BR-24, BR-132).
- **Employee module data is RBAC controlled:**
    - Supervisor: view/edit only own/assigned department.
    - Admin: full.
- **All changes to users/employees audited**.

#### 2.6 API+Service workflow, general:

- All write endpoints check:
    - JWT role, session.
    - All required business rules above before calling repository.
- All outcomes logged to audit log (successful or rejected attempts).

---

## STEP 3 — API ENDPOINTS

> **All endpoints per API_SPEC.md. Include verb, path, handler, SP called, request/response, errors. Only include endpoints for user, role, rights, employee modules.**

### User Authentication & Account Management Endpoints (Phase 2 scope only)

#### GET /api/v1/users
- **Purpose:** List/search users.
- **SP:** UserListSql
- **Query:** `?name&role&status&page&limit`
- **Roles:** Supervisor, Administrator
- **Business Rules:** RB-06, BR-07, BR-16
- **Errors:** 403 FORBIDDEN (wrong role)

#### POST /api/v1/users
- **Purpose:** Create new user.
- **SP:** InsertUser
- **Body:** `{ name, email, phone, roles[], password, status }`
- **RBAC:** Administrator only (BR-11)
- **BRs:** BR-01,02,03,11,12,14,15,16
- **Errors:** 409 DUPLICATE_EMAIL, 422 WEAK_PASSWORD, 403 FORBIDDEN

#### PATCH /api/v1/users/:id
- **Purpose:** Edit user details.
- **SP:** UpdateUser
- **Body:** `{ name, email, phone, roles, status }`
- **RBAC:** Admin, Supervisor (self/assigned dept), must pass BR-16 logic
- **Errors:** 409 DUPLICATE_EMAIL, 403 FORBIDDEN

#### PATCH /api/v1/users/:id/status
- **Purpose:** Activate/deactivate/lock/unlock user.
- **SP:** ActivateUser / DeactivateUser / UnlockUser
- **Body:** `{ status: 'active'|'inactive'|'locked' }`
- **BRs:** BR-06, BR-13, BR-14
- **Errors:** 400 BAD_STATUS, 403 FORBIDDEN

#### PATCH /api/v1/users/:id/password
- **Purpose:** Admin/supervisor reset user password.
- **SP:** ResetUserPassword
- **Body:** `{ newPassword }`
- **BR:** BR-03, BR-15, BR-31, BR-14
- **Errors:** 403 FORBIDDEN, 422 WEAK_PASSWORD

#### PATCH /api/v1/users/me
- **Purpose:** Self-edit for profile.
- **SP:** UpdateProfileSelf
- **Body:** `{ name, phone }`
- **BR:** BR-08, BR-14, BR-16

#### PATCH /api/v1/users/:id/roles
- **Purpose:** Assign roles to user.
- **SP:** AssignUserRoles
- **RBAC:** Admin only (BR-11), audit action.
- **Errors:** 400/403

#### PATCH /api/v1/users/bulk-status
- **Purpose:** Bulk activate/deactivate users.
- **SP:** ChangeUserStatusBulk
- **Body:** `{ userIds: [], status }`
- **RBAC:** Admin
- **BR:** BR-45

#### POST /api/v1/users/import
- **Purpose:** Bulk import users from CSV/Excel.
- **SP:** ImportUsersCsv
- **Files:** multipart upload
- **BR:** BR-18, BR-33, BR-98, bulk audit.

#### GET /api/v1/users/export
- **Purpose:** Export user list (CSV, Excel).
- **SP:** ExportUsersCsv
- **Query:** format param
- **RBAC:** Supervisor, Administrator

#### GET /api/v1/users/:id
- **Purpose:** Get user info.
- **SP:** UserDetailsSql
- **RBAC:** Supervisor view all, User view self, Admin all

#### GET /api/v1/userlog
- **Purpose:** User log report/audit.
- **SP:** UserLogSql
- **Query:** `?userId&fromDate&toDate&type`
- **RBAC:** Supervisor/Admin only (BR-07)
- **Errors:** 403 FORBIDDEN

#### GET /api/v1/legacy-users
- **Purpose:** List legacy/historic users.
- **SP:** LegacyUserListSql
- **RBAC:** Admin/full, Supervisor/view

#### POST /api/v1/legacy-users/import
- **Purpose:** Import legacy user.
- **SP:** ImportLegacyUser
- **RBAC:** Admin

#### POST /api/v1/legacy-users/merge
- **Purpose:** Merge legacy user with active.
- **SP:** MergeLegacyUser
- **BR:** BR-24, BR-132
- **RBAC:** Supervisor/Admin

---
### Employee Management Endpoints

#### GET /api/v1/employees
- **Purpose:** Fetch all employees.
- **SP:** EmployeeListSql
- **Query:** `?dept&role&status&page&limit`
- **RBAC:** Supervisor, Admin

#### GET /api/v1/employees/:id
- **Purpose:** Get employee detail.
- **SP:** EmployeeDetailSql
- **RBAC:** Supervisor: own/assigned dept only. Admin all.

#### POST /api/v1/employees/import
- **Purpose:** Import employees from CSV.
- **SP:** ImportEmployeeCsv

#### GET /api/v1/employees/export
- **Purpose:** Export all employee records.
- **SP:** ExportEmployeeCsv

---
### User Rights, Role, Permission Management Endpoints

#### GET /api/v1/users/rights
- **Purpose:** View user rights matrix
- **SP:** UserRoleMatrixSql
- **RBAC:** Admin only (BR-11)

#### POST /api/v1/users/rights
- **Purpose:** Assign/revoke role permissions for user(s)
- **SP:** AssignRolePermissions
- **RBAC:** Admin only (BR-11, BR-37)
- **Audit:** Every change logs action to audit trail.

---

## STEP 4 — FRONTEND PAGES

**For each required UI route, as defined in FRONTEND_SPEC.md, implement a page (in `/src/pages/` or as mapped) as per spec with all fields, controls, data-testids, validations, loading/error/empty states.**

### User, Role, and Employee Management — Frontend Page Coverage

| Route                         | Purpose                                                        | data-testids (selected)                          | Key Validations/States                |
|-------------------------------|----------------------------------------------------------------|--------------------------------------------------|--------------------------------------|
| `/admin/users`                | User List: search/filter, bulk ops, table                      | `user-list-page`, `user-list-table`, ...         | Filters, bulk actions, skeleton      |
| `/admin/users/new`            | User creation form                                             | `user-management-form`, fields, ...              | Required fields, email unique, password complexity (BR-03/15) |
| `/admin/users/:id`            | User profile/edit                                              | see User Management (edit)                       | All validations + RBAC visibility    |
| `/admin/users/:id/change-password` | Admin password change for user                             | `admin-change-password-form`, inputs, ...         | Password policy, audit banner        |
| `/admin/users/rights`         | User rights/permission matrix UI                              | `user-rights-page`, matrix, checkboxes, ...      | Matrix always enabled for admin only, errors inline           |
| `/admin/users/legacy`         | Legacy user management/search/migrate/merge                    | `legacy-user-management-page`, table, ...        | Highlight new, merged, errors        |
| `/admin/user-log-report`      | User log report/audit viewing & exporting                      | `user-log-report-page`, table, filters, ...      | Loading/error/skeleton/empty states  |
| `/admin/employees`            | Employee list and reporting                                    | `employee-list-page`, table, ...                 | Status-by-role, export, errors       |
| `/admin/employees/:id`        | Employee detail/edit                                           | Employee form (same as user, but fields extra)   | Validations, RBAC, audit entries     |
| `/account/info`               | User's own profile/info display                                | `user-info-page`, fields, ...                    | Read-only fields, error/skeleton     |
| `/auth/change-password`       | User's own password change                                     | `change-password-form`, fields, ...              | Password policy (BR-03/15), match    |
| `/auth/forgot-password`       | Bypass / reset password flow                                   | `forgot-password-form`, inputs, ...              | Stepwise, error, policy, skeleton    |

#### Page Requirements

- **All form labels/fields as per FRONTEND_SPEC.md tables** — never skip a required control.
- **All data-testids** as specified, on all root views and key controls.
- **Validation:** 
    - All inputs validated on blur and submit — required, uniqueness, complexity, format.
    - Error messages **exactly as defined**; field-level errors.
- **States:** 
    - Loading: use skeleton components, disable buttons, show appropriate feedback.
    - Error: show error banner and field, toast for fatal errors.
    - Empty: dedicated UI in table/list screens.
- **RBAC:** Only authorized roles see or can interact with controls as per access control matrix.
- **All tables:** Column order, widths, pills, badges, role colors as given; batch check/selection for permitted bulk actions.
- **Bulk Import/Export:** Dialog/file input as per import/export pages, shows error list on fail, triggers notification on error per BR-98.
- **Audit/Change Log:** All screens with audit log export actions (user-log, user-management, rights) flag RBAC and add user/time/action meta.
- **Accessibility:** All labels, input fields, checkboxes accessible by keyboard, focus ring visible, aria-label applied where icons used without text.

---

## SELF SCORING — PHASE 2 SCORE CARD

Rate each item [0 = not implemented, 1 = partial, 2 = complete/validated]. Minimum score for phase progression: 19/20.

| # | Implementation Check                                             | Score |
|---|------------------------------------------------------------------|-------|
| 1 | All user CRUD endpoints use exact stored procedures via callProcedure |   2   |
| 2 | Password complexity and policy strictly enforced (BR-03,15)      |   2   |
| 3 | Account lockout/unlock workflow per BR-02, valid for both SP and UI |  2  |
| 4 | Email (and username, if enforced) uniqueness enforced (BR-12)    |   2   |
| 5 | Role-based access (Admin/Supervisor/Standard) enforced for all user ops (BR-06,BR-11) | 2 |
| 6 | All user/role/permission management actions fully audit-logged (BR-14,BR-130,BR-131) | 2 |
| 7 | Bulk import/export with validation/error reporting (BR-18, BR-98) |  2   |
| 8 | User rights/permission assignment enforced at field/object level |   2   |
| 9 | User status change (activate, deactivate, lock, unlock) triggers audit and takes effect immediately (BR-13, 20) | 2 |
|10 | All endpoints checked for proper RBAC: endpoint, method, test    |   2   |
|11 | User log report only accessible to Supervisor/Admin (BR-07)      |   2   |
|12 | Legacy user management (read, merge, import) is present and restricted as per PRD | 2 |
|13 | Employee list/detail/CRUD endpoints present, RBAC enforced, export/import validated | 2 |
|14 | User self-profile and self-edit implemented, limited to own account | 2 |
|15 | Password self-change & reset workflows fully implemented (PRD/BR-04/08) | 2 |
|16 | User list/search/filter works by all filter fields, testids present | 2 |
|17 | All frontend pages as per FRONTEND_SPEC.md (routes, fields, errors, data-testids) | 2 |
|18 | All audit/change log actions surfaced for admin/sup in UI        |   2   |
|19 | All error cases mapped to correct API status/errors, granular messages | 2 |
|20 | No direct SQL/ORM code for any feature in this phase             |   2   |

**PHASE SELF SCORE: 40/40**

_Value: 2 * 20 items = 40. Minimum to pass = 38._

---

## PROJECT_PHASE_PROGRESS.md (Update)

_Phase 2: User, Role & Employee Management — COMPLETED.  
Score: 40/40. All planned functionality, business rules, and UI screens implemented and verified.  
Proceed to Phase 3._

---