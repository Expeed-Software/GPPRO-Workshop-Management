<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v10
  Generated at   : 2026-06-24 16:25:27 UTC
-->

# FRONTEND_SPEC.md

> This file was merged from 14 chunk files.
> Individual chunk files: FRONTEND_SPEC_1_v10.md, FRONTEND_SPEC_2_v10.md, FRONTEND_SPEC_3_v10.md, FRONTEND_SPEC_4_v10.md, FRONTEND_SPEC_5_v10.md, FRONTEND_SPEC_6_v10.md, FRONTEND_SPEC_7_v10.md, FRONTEND_SPEC_8_v10.md, FRONTEND_SPEC_9_v10.md, FRONTEND_SPEC_10_v10.md, FRONTEND_SPEC_11_v10.md, FRONTEND_SPEC_12_v10.md, FRONTEND_SPEC_13_v10.md, FRONTEND_SPEC_14_v10.md

---

# FRONTEND_SPEC.md

---

# Screen 1: Sign In

## Route
- **Path:** `/auth/sign-in`

## Purpose
- Secure entry point for users to authenticate using their username and password, with multi-factor authentication (if enabled), error feedback, and a link to password reset.
- **PRD References:** US-01, US-12, US-13, US-18, US-20, FR-01, FR-13, FR-15, FR-17, FR-22, FR-23

## Access Roles
- All users (public, unauthenticated)

## Layout
- Centered glass card on a glassmorphic background.
- Card must use the glass effect with sufficient contrast for accessibility.
- Responsive: mobile-first vertical stacking, desktop max width 396px.

## Form Fields

| Label             | Field Name | Type      | Placeholder             | Validation Rules                                                    |
|-------------------|------------|-----------|-------------------------|---------------------------------------------------------------------|
| Username or Email | username   | Text      | e.g. riya.shetty@...   | Required: "Username or email is required."                         |
| Password          | password   | Password  | …                      | Required: "Password is required."                                  |
| MFA Code*         | mfa        | Text      | 6-digit code           | Required if shown. Numeric, length 6: "Enter your 6-digit code."   |

* MFA field is shown only when multi-factor is enabled (US-10).

## Actions Available

- **Sign In** (Primary button)
- **Forgot Password** (Link: opens `/auth/forgot-password`)
- **Language Selection** (Dropdown, top-right)
- **Cancel/Exit** (Button: navigates to `/`)
- **Start MFA** (If needed—continue after username+password)
- **Help** (Link: opens `/help/auth` in a modal)

## Buttons/Links

| Type           | Label               | Action                                     |
|----------------|---------------------|--------------------------------------------|
| Primary        | Sign In             | Triggers authentication                    |
| Link           | Forgot Password?    | Route to `/auth/forgot-password`           |
| Secondary      | Cancel              | If present, navigates away (`/`)           |
| Dropdown       | Language            | Changes UI language (see language codes)   |
| Ghost          | Help                | Opens contextual help modal                |

## Loading/Submission States

- **Signing in:** Primary button shows spinner, disables all fields/buttons.
- **MFA Code:** Secondary loading spinner when requesting code.
- **Skeleton:** On first mount, shows card with pulsing children for 0.8s if SSO providers/branding are loading.

## Error States

| Condition                          | Placement                        | Message                                               |
|-------------------------------------|-----------------------------------|-------------------------------------------------------|
| Username missing                    | Under Username field              | "Username or email is required."                      |
| Password missing                    | Under Password field              | "Password is required."                               |
| Invalid credentials                 | Top of form, below heading        | "Incorrect username or password."                     |
| Account locked                      | Top of form                      | "Account locked after multiple failed attempts."      |
| Password expired                    | Top of form                      | "Password expired. Please change your password."      |
| MFA required                        | Top of form or in MFA field       | "Multi-factor code required for this account."        |
| MFA invalid                         | Under MFA field                   | "Invalid multi-factor code. Please try again."        |
| Session timed out                   | Top of form, on redirect          | "Session expired. Please sign in again."              |
| General/unknown error               | Top of form                      | "An error occurred — please try again."               |

Toasts are used only for "Signed in successfully" (US-01). All errors shown inline.

## Field Accessibility & Design

- Labels always visible above fields.
- Field border color: standard `var(--color-border)`, error state `var(--color-error)`.
- Password visibility toggle (line-eye icon — `data-testid="sign-in-password-toggle"`).
- Keyboard: submit on Enter, tab order is username → password → sign-in.

## Additional Features

- "Show Password" toggle with accessible icon button.
- "Remember me" is **not** present by business policy.
- For SSO, additional button(s) may be displayed if FR-09: "Sign in with [SSO Provider]"; uses same layout, placed below username/password fields.

## Test Identifiers

- `sign-in-form`
- `sign-in-username-input`
- `sign-in-password-input`
- `sign-in-mfa-input`
- `sign-in-submit-button`
- `sign-in-forgot-link`
- `sign-in-help-button`
- `sign-in-language-dropdown`
- `sign-in-error-message`
- `sign-in-password-toggle`
- `sign-in-cancel-button`

---

# Screen 2: Password Change

## Route

- **Path:** `/auth/change-password`

## Purpose

- Permits signed-in users to change their password, either on-demand or upon first login/reset (BR-08, US-02, US-08). 

- **PRD References:** US-02, US-03, US-08, US-12, FR-02, FR-03, FR-04, FR-05, FR-13, FR-14

## Access Roles

- All signed-in users (including after password reset)

## Layout

- Glassmorphic card, max width 420px, vertical stack.
- All fields and error messages visible, keyboard accessible.

## Form Fields

| Label             | Field Name     | Type        | Placeholder          | Validation |
|-------------------|---------------|-------------|----------------------|------------|
| Current Password  | currentPwd    | Password    | Current password     | Required: "Enter your current password." |
| New Password      | newPwd        | Password    | New password         | Required + Password Policy: "Password must be at least 10 characters and include uppercase, lowercase, number, and a special character." |
| Confirm Password  | confirmPwd    | Password    | Re-type new password | Required + Must match "Both passwords must match." |

## Actions Available

- **Change Password** (primary)
- **Cancel** (nav to dashboard `/` or `/account`)
- **Help** (link opens password change help modal)
- **Password Policy** (displayed as a hint or inline callout)

## Buttons/Links

| Type     | Label           | Action                                             |
|----------|-----------------|----------------------------------------------------|
| Primary  | Change Password | Submits validated change                           |
| Ghost    | Cancel          | Navigates away                                     |
| Inline   | Help            | Opens help modal                                   |

## Validation & Error Handling

- **Current password missing/incorrect:** Under field; "Current password is incorrect."
- **New password too weak:** Under field; "Password must be at least 10 characters and include uppercase, lowercase, number, and a special character."
- **Passwords do not match:** Under Confirm field; "Both passwords must match."
- **Password same as old:** Below New Password; "New password cannot be same as the old password."
- **API error (general):** Top of form; "Could not change password. Please try again."

## Success State

- On success, confirmation message "Password changed successfully." shown in toast and in-page, and page auto-redirects after 3s.

## Loading/Skeleton

- Submitting shows loader on primary button, fields disabled.

## Test Identifiers

- `change-password-form`
- `change-password-current-input`
- `change-password-new-input`
- `change-password-confirm-input`
- `change-password-submit-button`
- `change-password-cancel-button`
- `change-password-policy`
- `change-password-error-message`
- `change-password-help-button`

---

# Screen 3: ODBC Sign In

## Route

- **Path:** `/auth/odbc-sign-in`

## Purpose

- For users (e.g., administrators, auditors) who need access to specific data sources via external (ODBC) authentication as part of login process.
- **PRD References:** ODBC Sign In, US-01, US-09, FR-01, FR-21

## Access Roles

- As configured (typically admin/auditor only)

## Layout

- Glass-effect card, always overlays normal sign-in.
- Fields vertically stacked; "Test Connection" provides instant feedback before authenticating.

## Form Fields

| Label               | Field Name           | Type         | Placeholder          | Validation                              |
|---------------------|---------------------|--------------|----------------------|------------------------------------------|
| ODBC Connection     | odbcConnection      | Text/Select  | Select or enter DSN  | Required: "Please enter/select a source" |
| ODBC Username       | odbcUsername        | Text         | e.g. administrator   | Required                                 |
| ODBC Password       | odbcPassword        | Password     |                      | Required                                 |

## Actions Available

- **Test Connection** (validates connection, shows loading state)
- **Log In** (primary)
- **Cancel** (secondary)
- **Error feedback** (inline)
- **Help** (inline or modal)
  
## Buttons/Links

| Type    | Label             | Action                                         |
|---------|-------------------|-----------------------------------------------|
| Primary | Log In            | Authenticate via ODBC                         |
| Ghost   | Test Connection   | Calls ODBC test endpoint, shows result banner |
| Ghost   | Cancel            | Returns to `/auth/sign-in`                    |
| Inline  | Help              | Opens context guide (link or info icon)       |

## Validation & Error Handling

- Field missing: Under field, e.g., "ODBC username required."
- Connection test failed: Above form, "Could not connect — verify credentials or network."
- General error: Top of form, "An error occurred."

## Loading

- Test Connection: shows progress spinner, disables fields.
- Log In: disables all fields, shows button spinner.

## Test Identifiers

- `odbc-sign-in-form`
- `odbc-sign-in-connection-input`
- `odbc-sign-in-username-input`
- `odbc-sign-in-password-input`
- `odbc-sign-in-test-connection-btn`
- `odbc-sign-in-submit-btn`
- `odbc-sign-in-cancel-btn`
- `odbc-sign-in-error-banner`
- `odbc-sign-in-help-link`

---

# Screen 4: Bypass/Forgot Password

## Route

- **Path:** `/auth/forgot-password`

## Purpose

- Guides users through secure password reset workflow if they forget their password.
- **PRD References:** US-03, FR-08, FR-13, FR-22

## Access Roles

- All users (unauthenticated)

## Layout

- Card-based, glass container.
- Form steps:
  1. Enter username or email.
  2. Verification (email code).
  3. Set new password.
- Progress indicator shown if 3 steps.

## Form Fields (Step 1)

| Label                   | Field Name   | Type   | Placeholder            | Validation                                 |
|-------------------------|--------------|--------|------------------------|---------------------------------------------|
| Username or Email       | username     | Text   | Your username/email    | Required: "Please enter your username/email"|

## Form Fields (Step 2, Verification)

| Label                       | Field Name    | Type    | Placeholder           | Validation                       |
|-----------------------------|---------------|---------|-----------------------|-----------------------------------|
| Verification Code           | code          | Text    | 6-digit code          | Required; 6 digits                |

## Form Fields (Step 3, New Password)

| Label               | Field Name   | Type      | Placeholder                | Validation                                                                  |
|---------------------|--------------|-----------|----------------------------|-------------------------------------------------------------------------------|
| New Password        | newPwd       | Password  | New password               | Required; password policy: see above; must not match previous                |
| Confirm Password    | confirmPwd   | Password  | Confirm new password       | Must match; required                                                         |

## Actions Available

- **Request Reset/Submit** (primary)
- **Resend Verification Code** (ghost, step 2)
- **Verify** (step 2, primary)
- **Cancel** (any step — returns to sign-in)
- **Show/Hide Password** (toggle; input adornment)

## Validations & Error Handling

| Condition                    | Placement          | Message/Label                                 |
|------------------------------|-------------------|-----------------------------------------------------|
| Username/email missing       | Under username     | "Required to reset your password."                  |
| No match found               | Inline, after input| "No user found with those details."                 |
| Verification failed          | Above code field   | "Incorrect code. Try again or request another."     |
| Password too weak            | Under password     | See password policy                                |
| Passwords do not match       | Under confirm      | "Both passwords must match."                       |
| Reset not permitted          | Top of form        | "Account does not permit self-service reset."       |
| API or network error         | Top of form        | "An error occurred. Please retry."                 |

## Loading & Success States

- Request or verification: spinner on button, disables all fields.
- Success: "Password reset! You may now sign in."
- Error: shown inline.
- After success, auto-redirect to `/auth/sign-in` after 4s.

## Test Identifiers

- `forgot-password-form`
- `forgot-password-username-input`
- `forgot-password-submit-btn`
- `forgot-password-error-message`
- `forgot-password-step-indicator`
- `forgot-password-code-input`
- `forgot-password-resend-code-btn`
- `forgot-password-verify-btn`
- `forgot-password-new-pwd-input`
- `forgot-password-confirm-pwd-input`
- `forgot-password-show-hide-btn`
- `forgot-password-cancel-btn`

---

# Screen 5: User Log Report

## Route

- **Path:** `/admin/user-log-report`

## Purpose

- Presents a full report of user sign-in attempts, password changes, and authentication events for audit/security review.
- **PRD References:** US-04, US-12, FR-11, FR-12, FR-20

## Access Roles

- Supervisors, Administrators, Security Auditors

## Layout

- Glass card, paginated and filterable table.
- Filters: date range, user, event type.

## Table Columns

| Label            | Field         | Width | Type     |
|------------------|--------------|-------|----------|
| User             | userName     | 160px | Text     |
| User ID          | userId       | 80px  | Text/Num |
| Action           | actionName   | 140px | Text     |
| Date/Time        | actionDate   | 160px | Datetime |
| Status           | status       | 110px | Pill (Success/Fail/Locked) |
| Machine          | machineName  | 160px | Text     |
| IP Address       | ipAddresses  | 120px | Text     |
| Remarks          | remarks      | 180px | Text     |
| Order Ref        | ordr         | 120px | Text     |

## Filters

- User: Select/search by name or ID
- Date Range: Start/End date
- Event Type: Dropdown (Sign-in, Lockout, Password change, Reset, etc.)
- Status: Dropdown (Success, Fail, Locked, etc.)

## Actions Available

- **Filter** (updates table)
- **Reset filters**
- **Export (PDF, Excel, CSV)**
- **Print**
- **View details** (expand row or modal)
- **Pagination controls**

## Empty/Skeleton/Error States

- Loading: Glow rows with 8–10 skeleton lines.
- Empty: "No user log data matches the filters."
- Error: "Unable to load user logs. Please retry."

## Table Interactions

- Sorting: Columns sortable.
- Row click: expands/collapse details or shows modal.
- Table supports keyboard navigation/accessibility.

## Export Features

- Calls export endpoint, downloads file, shows toast.
- "Export" and "Print" buttons above right of table.

## Test Identifiers

- `user-log-report-page`
- `user-log-report-table`
- `user-log-report-row`
- `user-log-report-details-expand`
- `user-log-report-filter-user`
- `user-log-report-filter-date`
- `user-log-report-filter-type`
- `user-log-report-filter-status`
- `user-log-report-filter-btn`
- `user-log-report-export-btn`
- `user-log-report-print-btn`
- `user-log-report-pagination`
- `user-log-report-error-banner`
- `user-log-report-skeleton`

---

# Screen 6: User List

## Route

- **Path:** `/admin/users`

## Purpose

- Displays a comprehensive, paginated, filterable list of all users. Enables user search, bulk actions, account management functions.
- **PRD References:** US-21, US-31, US-29, US-43, US-21–28, FR-26, FR-29, FR-33, FR-42, FR-45

## Access Roles

- Administrator (full)
- Supervisor (view and filter only)

## Layout

- Glass main card, min 1100px wide, scrollable on mobile.
- Controls at top: filter/search, bulk action buttons.

## Table Columns

| Column Label      | Field        | Width  | Type/Notes                 |
|-------------------|-------------|--------|----------------------------|
| [ ]               | select      | 32px   | Bulk selection checkbox    |
| Name              | fullName    | 160px  | Avatars, clickable         |
| Email             | email       | 180px  | —                          |
| Role(s)           | roles       | 160px  | Pill(s): admin/superv/std  |
| Status            | status      | 100px  | Pill: Active/Inactive      |
| Date Created      | dateCreated | 120px  | Date                       |
| Last Login        | lastLogin   | 160px  | Date/time                  |
| Actions           | actions     | 70px   | Edit, (de)activate, reset, see more |

## Table Features

- Bulk select (top-left checkbox)
- Pagination (page-at-a-time, 20 per page)
- Column sorting for Name, Email, Status, Date Created
- Action buttons per row: Edit, (De)activate, Reset Password, Unlock
- Disabled state for locked or deactivated users (actions limited)

## Top Row Controls

- Filter by Name, Role, Status, Last Login date (input and dropdowns)
- Add User (primary, opens `/admin/users/new`)
- Import (opens import dialog/modal)
- Export (PDF, Excel, CSV)
- Deactivate (bulk, disabled unless one+ selected)

## Actions Available

- View details/edit user
- Create user
- Edit roles
- Bulk import/export users
- Bulk (de)activation
- Unlock user
- Reset password

## Validation/Error/Loading/Empty

- Loading: shows skeleton rows for 10–18 lines
- Empty: "No users found."
- API error: "Failed to fetch user list. Please try again."
- Disabled: Buttons disabled during loading or permission limits

## Test Identifiers

- `user-list-page`
- `user-list-table`
- `user-list-header`
- `user-list-filter-name`
- `user-list-filter-role`
- `user-list-filter-status`
- `user-list-filter-last-login`
- `user-list-filter-btn`
- `user-list-row-checkbox`
- `user-list-row-avatar`
- `user-list-row-edit-btn`
- `user-list-row-deactivate-btn`
- `user-list-row-activate-btn`
- `user-list-row-resetpwd-btn`
- `user-list-row-unlock-btn`
- `user-list-bulk-import-btn`
- `user-list-bulk-export-btn`
- `user-list-add-btn`
- `user-list-pagination`
- `user-list-skeleton`
- `user-list-error-banner`

---

# Screen 7: User Rights Management

## Route

- **Path:** `/admin/users/rights`

## Purpose

- Enables authorized admins to review, assign, and adjust user/group role permissions. Matrix view of roles vs. features.
- **PRD References:** User Rights Management, US-11, US-25, US-32, FR-16, FR-30, FR-37

## Access Roles

- Administrator only

## Layout

- Two-pane: left = roles/users; right = detailed permissions matrix.
- Tablet/desktop layout, min 1100px wide.

## Fields/Features

- **User/Group Selector** (dropdown/search): Choose user or existing role-group for assignment/management.
- **Role Matrix View:** Grid rows = system features/modules; columns = permission levels (Read, Write, Approve, Export, Admin/Design).
- **Available Permissions List:** Read, View, Edit, Approve, Export, Design, Delete per module
- Major modules as grid: Users, Payroll, Ledger, Sales, Inventory, Purchasing, Reporting

## Actions Available

- Assign role to user/group (checkboxes)
- Edit existing role/group
- Create new role/group (opens modal)
- Delete role/group (protected, with confirmation)
- Save permissions changes (primary)
- Reset to default/baseline
- Search/filter roles
- Help (info link/modal)

## Validations/Error/Loading

- Missing permission assignment: "At least one permission must be assigned."
- Attempt to edit system/locked role: "Cannot edit built-in role."
- Save fails: Top error, "Unable to update permissions. Try again."
- Unauthorized: "You do not have rights to edit roles."
- Loading: dimmed matrix/grid; shimmer skeletons.

## Test Identifiers

- `user-rights-page`
- `user-rights-user-selector`
- `user-rights-role-selector`
- `user-rights-permission-matrix`
- `user-rights-permission-checkbox`
- `user-rights-permission-save-btn`
- `user-rights-permission-reset-btn`
- `user-rights-permission-create-btn`
- `user-rights-permission-delete-btn`
- `user-rights-permission-help-btn`
- `user-rights-permission-error-message`
- `user-rights-permission-loading`

---

# Screen 8: User Management

## Route

- **Path:** `/admin/users/:id`
- **Path (new):** `/admin/users/new`

## Purpose

- Tools to create, update, and maintain user accounts. Form for new user, and editable display for existing users.
- **PRD References:** User Management, US-22, US-23, US-24, US-26, US-36, US-46

## Access Roles

- Administrator (full)
- Supervisor (limited edit)
- Self (own profile view/edit: only selected fields)

## Form Fields

| Label             | Field Name      | Type        | Placeholder        | Validation/Notes                  |
|-------------------|----------------|-------------|-------------------|-----------------------------------|
| Full Name         | fullName       | Text        | e.g. Riya Shetty  | Required; 2–80 chars              |
| Email             | email          | Email       | e.g. r@domain.com | Required; must be unique          |
| Phone             | phone          | Tel         | e.g. +91 ...      | Optional; E.164 validated         |
| Assigned Roles    | roles[]        | CheckboxSet | —                 | Required, at least one            |
| Status            | status         | Radio       | —                 | Active (default), Inactive, Locked|
| Set Password      | password       | Password    | —                 | Required for new user only        |
| Confirm Password  | confirmPwd     | Password    | —                 | must match password (new only)    |

**Edit-only fields:** Date Created (read-only), Last Edited (read-only), Originator.

## Actions Available

- Create User (primary)
- Save Changes (primary)
- Deactivate/activate user (secondary)
- Reset Password (sec; opens modal)
- Delete user (admin-only; protected)
- Help (link)

## Validations & Errors

- Name required, min 2 chars
- Email required, must be valid format + unique
- At least one role required
- Password rules: as per password policy (see above)
- API error: "Could not save user. Please try again."
- Duplicate email: "This email is already in use."
- Read-only fields shown for originator, current status

## Loading/Skeleton

- While loading/fetching for edit: shimmer skeleton
- While saving: disables all, spinner on primary

## Test Identifiers

- `user-management-form`
- `user-management-fullname-input`
- `user-management-email-input`
- `user-management-phone-input`
- `user-management-roles-checkbox`
- `user-management-status-radio`
- `user-management-password-input`
- `user-management-confirm-pwd-input`
- `user-management-create-btn`
- `user-management-save-btn`
- `user-management-deactivate-btn`
- `user-management-resetpwd-btn`
- `user-management-delete-btn`
- `user-management-loading`
- `user-management-error-banner`
- `user-management-originator-label`
- `user-management-last-edited-label`

---

# Screen 9: Legacy User Management

## Route

- **Path:** `/admin/legacy-users`

## Purpose

- Allows admins to reference, search, edit, and migrate historic/legacy user records.
- **PRD References:** Legacy User Management, US-33, US-53

## Access Roles

- Administrator (full)
- Supervisor (view only)

## Layout

- Table of legacy users (read-only unless migrated)
- Filter/search by username/id/status
- Utility bar: migrate selected, merge with existing, archive, export (CSV, Excel)

## Table Columns

| Label                | Field        |
|----------------------|-------------|
| Name                 | legacyName  |
| Username/ID          | legacyId    |
| Email (if present)   | legacyEmail |
| Migration Status     | status      | (Not Imported / Merged / Archived) |
| Original Role        | role        |
| Date Created         | created     |
| Last Login           | lastLogin   |

## Actions

- Reference (view record)
- Migrate to active users (checkbox, triggers import/mapping)
- Merge with existing user (matches by email/name)
- Archive/lock legacy user (disabled for merge/imported)
- Export list (CSV/Excel)

## Field-level Details

- Verification of matching legacy and current users highlighted.
- "Migrate" mapped fields must be confirmed in modal
- Confirmation before destructive archive.

## Empty/Loading/Errors

- Empty: "No legacy user records found."
- Loading: shimmer skeleton.
- Error: "Failed to load legacy users."

## Test Identifiers

- `legacy-user-management-page`
- `legacy-user-management-table`
- `legacy-user-management-row`
- `legacy-user-management-filter-input`
- `legacy-user-management-migrate-btn`
- `legacy-user-management-merge-btn`
- `legacy-user-management-archive-btn`
- `legacy-user-management-export-btn`
- `legacy-user-management-skeleton`
- `legacy-user-management-error-banner`

---

# Screen 10: Admin Change Password

## Route

- **Path:** `/admin/users/:id/change-password`

## Purpose

- Allows admin to change or reset any user’s password, with full audit.
- **PRD References:** Admin Change Password, US-26, FR-31, FR-41, FR-49

## Access Roles

- Administrator only

## Form Fields

| Label             | Field Name    | Type      | Placeholder   | Validation                   |
|-------------------|--------------|-----------|--------------|------------------------------|
| User              | user         | Select    | User         | Required (prefilled for :id) |
| New Password      | password     | Password  | —            | Required + policy, min 10    |
| Confirm Password  | confirmPwd   | Password  | —            | Must match                   |

## Actions Available

- Change Password (primary)
- Cancel (nav back to user)
- Help (opens modal or tooltip)

## Field-level Detail

- User dropdown disables if `:id` in path.
- Show audit history of password changes (side panel/table: Date, By Whom).
- Success: Banner "Password updated for user X".
- Error: Inline, e.g. "Passwords do not match", "Password does not meet criteria", "Failed to change password".

## Loading/Empty

- Saving: disables all, spinner on button.
- Empty: n/a (always directed to user)

## Test Identifiers

- `admin-change-password-form`
- `admin-change-password-user-select`
- `admin-change-password-pwd-input`
- `admin-change-password-confirm-input`
- `admin-change-password-submit-btn`
- `admin-change-password-cancel-btn`
- `admin-change-password-help-btn`
- `admin-change-password-error-message`
- `admin-change-password-history-table`

---

# Screen 11: Page/User Info

## Route

- **Path:** `/account/info`

## Purpose

- Displays current logged-in user’s details, roles, contact info, and profile summary.
- **PRD References:** Page/User Info, US-36

## Access Roles

- All signed-in users

## Layout

- Page-top card (glass), with prominent avatar, name, roles, contact details.
- Profile summary panel (account created, last change).

## Fields Displayed

| Label        | Field Name    | Type       |
|--------------|--------------|------------|
| Name         | fullName     | Text       |
| Email        | email        | Text       |
| Phone        | phone        | Text       |
| Assigned Roles | roles      | Chips      |
| Account Status | status     | Pill       |
| Date Created | dateCreated  | Text/Date  |
| Last Edited  | lastEdited   | Text/Date  |

## Actions

- View personal info
- Edit profile (link to account/profile page, enabled only if permitted)
- Review assigned roles and permissions (expand details per role if admin)

## Error/Empty/Loading

- Loading: profile skeletons
- Error: "Could not fetch profile information."

## Test Identifiers

- `user-info-page`
- `user-info-avatar`
- `user-info-fullname-label`
- `user-info-email-label`
- `user-info-phone-label`
- `user-info-roles-chip`
- `user-info-status-pill`
- `user-info-date-created`
- `user-info-last-edited`
- `user-info-edit-btn`

---

# Screen 12: UserLogReport

## Route

- **Path:** `/admin/users/log-report`

## Purpose

- Displays a searchable, filterable log of user activities, system audits, and security-relevant changes.
- **PRD References:** US-30, US-44, FR-35, FR-36, FR-46

## Access Roles

- Supervisor (view), Administrator (full)

## Layout

- Paginated, filterable table with export and print.
- Filters: user, date, action type.

## Table Columns

| Label        | Field Name      | Notes          |
|--------------|----------------|----------------|
| User         | user           | —              |
| Role         | role           | —              |
| Action       | action         | Login, edit, etc. |
| Timestamp    | timestamp      | Datetime       |
| Affected Obj | object         | e.g. userId    |
| Details      | details        | JSON or string |
| IP Address   | ip             | —              |

## Filters

- By user (dropdown/search)
- Date range (from/to)
- Action type (dropdown)

## Actions Available

- Search/filter (updates table)
- Export (PDF, Excel)
- Print
- Pagination
- View more details (expand row or modal)

## Validation/Error/Empty/Loading

- Empty: "No activity log records found"
- Loading: skeleton table
- API error: "Could not load user activity log."

## Test Identifiers

- `userlogreport-page`
- `userlogreport-table`
- `userlogreport-filter-user`
- `userlogreport-filter-date`
- `userlogreport-filter-action`
- `userlogreport-search-btn`
- `userlogreport-export-btn`
- `userlogreport-print-btn`
- `userlogreport-pagination`
- `userlogreport-details-btn`
- `userlogreport-error-banner`
- `userlogreport-skeleton`

---

# Screen 13: EmployeeList

## Route

- **Path:** `/admin/employees`

## Purpose

- Shows all staff users and their assignments, with filters for department/role/status, and reporting/export.
- **PRD References:** EmployeeList, US-41, US-42, FR-39, FR-40

## Access Roles

- Supervisor, Administrator

## Layout

- Glassmorphic panel, list/table, filter/search row at top.
- Export and print controls right-aligned.

## Table Columns

| Label         | Field           | Notes                  |
|---------------|----------------|------------------------|
| Name          | name           | —                      |
| Department    | department     | —                      |
| Section       | section        | —                      |
| Contact       | contact        | email/phone            |
| Roles         | roles          | Pills/chips            |
| Emp Status    | status         | Active/Inactive        |
| Hire Date     | hireDate       | Date                   |
| Edit          | edit           | Button (if permitted)  |

## Filter Controls

- Name (text search)
- Department (dropdown)
- Role (dropdown)
- Status (dropdown)

## Actions

- Filter/search (updates table)
- Export (PDF/Excel), print
- Edit employee (where allowed)
- Bulk select for printing (optional per PRD - if included, only visible for print)
- Sort by any column

## Empty/Loading/Error

- Empty: "No employees found."
- Loading: skeleton table
- API error: "Could not retrieve employee list."

## Test Identifiers

- `employee-list-page`
- `employee-list-table`
- `employee-list-filter-name`
- `employee-list-filter-department`
- `employee-list-filter-role`
- `employee-list-filter-status`
- `employee-list-search-btn`
- `employee-list-export-btn`
- `employee-list-print-btn`
- `employee-list-row-edit-btn`
- `employee-list-pagination`
- `employee-list-skeleton`
- `employee-list-error-banner`

---

# Screen 14: Customer Management

## Route

- **Path:** `/crm/customers`
- **Create:** `/crm/customers/new`
- **Edit:** `/crm/customers/:id/edit`
- **View:** `/crm/customers/:id`

## Purpose

- Enables full create/edit/manage for customer master records, with status/duplicate check, and detail view.
- **PRD References:** US-46, US-47, US-50, US-53, US-67, FR-54–FR-69, BR-21–BR-33

## Access Roles

- Standard User (own/work scope)
- Supervisor (all)
- Administrator (full)

## Fields

| Label                | Field Name      | Type      | Notes                                 |
|----------------------|----------------|-----------|---------------------------------------|
| Customer Name        | name           | Text      | Required; unique with contact number  |
| Address Line 1       | address1       | Text      | Required                              |
| Address Line 2       | address2       | Text      | Optional                              |
| Address Line 3       | address3       | Text      | Optional                              |
| Main Contact Person  | contactPerson  | Text      | Required                              |
| Contact Number 1     | phone1         | Tel       | Required; unique with name            |
| Contact Number 2     | phone2         | Tel       | Optional                              |
| Fax                  | fax            | Text      | Optional                              |
| Email                | email          | Email     | Optional; format-validated            |
| Status               | status         | Toggle    | Active/Inactive                       |
| Category/Type        | type           | Dropdown  | e.g. Retail, Wholesale (from Omasters)|
| Area                 | area           | Dropdown/Autocomplete |             |
| Salesperson          | salesRep       | Dropdown/Autocomplete (optional)      |
| Additional Notes     | notes          | TextArea  | Optional                              |
| Tags                 | tags           | Tag-Picker | Optional                             |

* Linked records (contacts, vehicles): shown and managed on sub-tabs (not inline).

## Actions

- Create new customer
- Edit existing customer
- Deactivate/reactivate
- View customer profile (read-only page or section)
- Check for duplicates (on save, and explicit "Check Duplicates" button)
- Merge (redirects to merge screen on duplicate found)
- Initiate advanced search
- Export customer data (admin/supervisor)

## Validations

- Name: Required, max 100 chars, unique + phone1
- Address1: Required
- Contact Person: Required
- Phone1: Required, valid phone, unique + name
- Status: Required ("Active" default on create)
- Email: Optional but must be valid format if present
- Duplicate detected: Inline warning, highlights field(s), offers merge
- All errors shown next to field, never only a toast

## Success/UI Details

- On success: Toast, and optional in-page banner "Customer saved."
- Duplicate: Side banner with recommended action.

## Empty/Loading/Error

- Loading: shimmer skeleton
- Submit: disables form, shows spinner
- Error: "Failed to save customer. Please try again."

## Help

- Tooltip on "Check Duplicates"
- "Help" link for lookup assistance (opens modal)

## Test Identifiers

- `customer-management-page`
- `customer-management-form`
- `customer-management-name-input`
- `customer-management-address1-input`
- `customer-management-address2-input`
- `customer-management-address3-input`
- `customer-management-contactperson-input`
- `customer-management-phone1-input`
- `customer-management-phone2-input`
- `customer-management-fax-input`
- `customer-management-email-input`
- `customer-management-status-toggle`
- `customer-management-type-dropdown`
- `customer-management-area-dropdown`
- `customer-management-salesrep-dropdown`
- `customer-management-notes-input`
- `customer-management-tags-picker`
- `customer-management-duplicate-btn`
- `customer-management-submit-btn`
- `customer-management-cancel-btn`
- `customer-management-error-banner`
- `customer-management-duplicate-warning`
- `customer-management-help-link`
- `customer-management-skeleton`

---

# Screen 15: Supplier Management

## Route

- **Path:** `/crm/suppliers`
- **Create:** `/crm/suppliers/new`
- **Edit:** `/crm/suppliers/:id/edit`
- **View:** `/crm/suppliers/:id`

## Purpose

- Enables management, search, and update of supplier records and details.
- **PRD References:** US-51, US-52, US-56, US-61, US-63–US-64, FR-56–FR-69

## Access Roles

- Standard User, Supervisor, Administrator

## Fields

| Label                  | Field Name   | Type      | Notes                   |
|------------------------|-------------|-----------|-------------------------|
| Supplier Name          | name        | Text      | Required; unique        |
| Address Line 1         | address1    | Text      | Required                |
| Address Line 2         | address2    | Text      | Optional                |
| Address Line 3         | address3    | Text      | Optional                |
| Contact Person         | contactPerson| Text      | Required                |
| Contact Phone 1        | phone1      | Tel       | Required, unique+name   |
| Contact Phone 2        | phone2      | Tel       | Optional                |
| Email                  | email       | Email     | Optional, validated     |
| Fax                    | fax         | Text      | Optional                |
| Status                 | status      | Toggle    | Active/Inactive         |
| Supplier Category      | category    | Dropdown  | e.g. Local/Foreign      |
| Area                   | area        | Dropdown/Autocomplete |         |
| Additional Notes       | notes       | TextArea  | Optional                |
| Tags                   | tags        | Tag-Picker| Optional                |

## Actions

- Create supplier
- Edit details
- Deactivate/reactivate
- View profile
- Merge duplicates (explicit "Check Duplicates" button)
- Advanced search
- Export data (PDF/Excel/CSV)

## Validation

- All required fields: inline errors
- Email, if present, must be valid
- Phone1 required, with uniqueness checked to name
- Name required, unique
- Duplicate: warns, redirect to merge
- Status required (default = Active)

## Success/UX

- Success toast/banner.
- Duplicate: inline actionable warning

## Loading/Empty/Error

- Loading: glass skeleton
- Error: red banner under heading

## Help

- Tooltip/modal on deduplication.

## Test Identifiers

- `supplier-management-page`
- `supplier-management-form`
- `supplier-management-name-input`
- `supplier-management-address1-input`
- `supplier-management-address2-input`
- `supplier-management-address3-input`
- `supplier-management-contactperson-input`
- `supplier-management-phone1-input`
- `supplier-management-phone2-input`
- `supplier-management-email-input`
- `supplier-management-fax-input`
- `supplier-management-status-toggle`
- `supplier-management-category-dropdown`
- `supplier-management-area-dropdown`
- `supplier-management-notes-input`
- `supplier-management-tags-picker`
- `supplier-management-submit-btn`
- `supplier-management-cancel-btn`
- `supplier-management-duplicate-btn`
- `supplier-management-duplicate-warning`
- `supplier-management-error-banner`
- `supplier-management-help-link`
- `supplier-management-skeleton`

---

# Screen 16: Contact Entry

## Route

- **Path:** `/crm/contacts`
- **Create:** `/crm/contacts/new`
- **Edit:** `/crm/contacts/:id/edit`
- **View:** `/crm/contacts/:id`

## Purpose

- Add or edit contacts linked to customers or suppliers.
- **PRD References:** US-53, US-54, US-57, FR-57–FR-58

## Access Roles

- Standard User, Supervisor, Administrator

## Fields

| Label                  | Field Name        | Type      | Notes                            |
|------------------------|------------------|-----------|----------------------------------|
| Contact Name           | name             | Text      | Required                         |
| Linked Entity          | linkedEntity     | Select    | Customer or Supplier, required   |
| Organization           | org              | Dropdown  | Auto-populate if entity selected |
| Phone (Primary)        | phone1           | Tel       | Required                         |
| Phone (Secondary)      | phone2           | Tel       | Optional                         |
| Email                  | email            | Email     | Optional, validated              |
| Role/Title             | role             | Text      | Optional                         |
| Address                | address          | Text      | Optional                         |
| Status                 | status           | Toggle    | Active/Inactive                  |

## Actions

- Add new contact
- Edit details
- Link/Unlink to customer/supplier
- Deactivate/reactivate
- Save/cancel

## Validation

- Name, Linked Entity, Phone1 required
- Email must be valid
- Phone1 valid as per rules
- Unique combination of name + phone1 (warn/merge if duplicate)

## Loading/Empty/Error

- Loading: shimmer skeleton
- Error: banner

## Test Identifiers

- `contact-entry-page`
- `contact-entry-form`
- `contact-entry-name-input`
- `contact-entry-entity-select`
- `contact-entry-org-dropdown`
- `contact-entry-phone1-input`
- `contact-entry-phone2-input`
- `contact-entry-email-input`
- `contact-entry-role-input`
- `contact-entry-address-input`
- `contact-entry-status-toggle`
- `contact-entry-submit-btn`
- `contact-entry-cancel-btn`
- `contact-entry-error-banner`
- `contact-entry-skeleton`

---

# Screen 17: Contact Search

## Route

- **Path:** `/crm/contacts/search`

## Purpose

- Search, view, and edit existing contact information; advanced duplicate checking.
- **PRD References:** US-54, US-55, FR-58

## Access Roles

- Standard User, Supervisor, Administrator

## Filter Fields

- Name (input)
- Phone (input)
- Organization (auto-complete)
- Linked Entity (dropdown)

## Table Columns

| Label        | Field          |
|--------------|---------------|
| Name         | name          |
| Organization | org           |
| Phone        | phone1        |
| Email        | email         |
| Status       | status        |
| Linked To    | linkedEntity  |
| Edit         | edit          |

## Actions

- Search/filter (updates table)
- View/edit details (opens Contact Entry)
- Deactivate/reactivate contact
- Export results (PDF/Excel/CSV)

## Duplicate Check

- Highlight possible duplicates (identical name, phone, org)
- "Merge" option where duplicates found (redirects to merge contacts)

## Validation/Error/Empty/Loading

- Empty: "No contacts found."
- Loading: skeleton
- Error: error message banner

## Test Identifiers

- `contact-search-page`
- `contact-search-filter-name`
- `contact-search-filter-phone`
- `contact-search-filter-org`
- `contact-search-filter-entity`
- `contact-search-submit-btn`
- `contact-search-export-btn`
- `contact-search-table`
- `contact-search-row-edit-btn`
- `contact-search-row-merge-btn`
- `contact-search-error-banner`
- `contact-search-skeleton`

---

# Screen 18: Customer Help

## Route

- **Path:** `/crm/customers/help`

## Purpose

- Guided lookup and contextual prompts for users to find/select customers.
- **PRD References:** Customer Help, US-50, US-56, FR-64

## Access Roles

- Standard User

## Search/Prompt Fields

- Search prompt (input: Name/Number)
- Filters: Recent/Frequent Customers (select or list)
- Advanced: Area, Salesperson (optional/expandable)

## Results

- List of matching customers:
  - Name, Phone, Address, Recent Activity
- Select to go to profile/details

## Actions

- Initiate search
- Select / go to customer details
- Use recent/frequent pickers
- Quick filters (area, sales rep, status)

## Loading/Empty/Error

- Loading: glow skeleton rows
- No matches: "No customers found."
- Error: "Could not search for customers."

## Test Identifiers

- `customer-help-page`
- `customer-help-search-input`
- `customer-help-recent-list`
- `customer-help-frequent-list`
- `customer-help-filters`
- `customer-help-result-row`
- `customer-help-select-btn`
- `customer-help-error-banner`
- `customer-help-skeleton`

---

# Screen 19: Supplier Help

## Route

- **Path:** `/crm/suppliers/help`

## Purpose

- Lookup tool for suppliers; guided filters and suggestion list.
- **PRD References:** Supplier Help, US-51, US-56, FR-64

## Access Roles

- Standard User

## Search/Prompt Fields

- Search: Name / Phone / Category
- Quick filters: Area, Local/Foreign

## Results

- List: Supplier Name, Contact, Category, Status
- Show best match at top, suggestion highlights

## Actions

- Enter search/filter
- Select supplier (navigates to profile)
- Quick view: summary card popup on hover (desktop)

## Loading/Empty/Error

- Loading: skeleton
- Empty: "No suppliers match that search."
- Error: API fail banner

## Test Identifiers

- `supplier-help-page`
- `supplier-help-search-input`
- `supplier-help-filters`
- `supplier-help-result-row`
- `supplier-help-select-btn`
- `supplier-help-error-banner`
- `supplier-help-skeleton`

---

# Screen 20: Customer Vehicle Entry

## Route

- **Path:** `/crm/vehicles`
- **Create:** `/crm/vehicles/new`
- **Edit/View:** `/crm/vehicles/:id`

## Purpose

- Manage fleet/customer-linked vehicles; add, link/unlink, edit, and deactivate.
- **PRD References:** Customer Vehicle Entry, US-57, US-59, FR-65

## Access Roles

- Standard User, Supervisor

## Fields

| Label              | Field Name       | Type      | Notes            |
|--------------------|-----------------|-----------|------------------|
| Registration No    | regNo           | Text      | Required         |
| Customer           | customer        | Dropdown/Autocomplete | Required |
| Make & Model       | makeModel       | Text      | Optional         |
| Year               | year            | Number    | Optional, min 1900 |
| Engine No          | engineNo        | Text      | Optional         |
| Chassis No         | chassisNo       | Text      | Optional         |
| Registration Type  | regType         | Dropdown  | e.g., Private/Comm|
| Status             | status          | Toggle    | Active/Inactive  |
| Notes              | notes           | TextArea  | Optional         |

## Actions

- Add new vehicle
- Edit info
- Link/unlink to customer record
- Deactivate/reactivate
- Save/cancel

## Validation/Error/Loading

- Required fields: regNo, customer
- Year: 1900–current
- Duplicate regNo for customer: warning
- Error: banner below header
- Loading: skeleton

## Test Identifiers

- `vehicle-entry-page`
- `vehicle-entry-form`
- `vehicle-entry-regno-input`
- `vehicle-entry-customer-dropdown`
- `vehicle-entry-makemodel-input`
- `vehicle-entry-engine-input`
- `vehicle-entry-chassis-input`
- `vehicle-entry-year-input`
- `vehicle-entry-regtype-dropdown`
- `vehicle-entry-status-toggle`
- `vehicle-entry-notes-input`
- `vehicle-entry-submit-btn`
- `vehicle-entry-cancel-btn`
- `vehicle-entry-error-banner`
- `vehicle-entry-skeleton`

---

# Screen 21: Customer Vehicle Help

## Route

- **Path:** `/crm/vehicles/help`

## Purpose

- Guided utility to search, select, and preview vehicles associated with customer accounts.
- **PRD References:** Customer Vehicle Help, US-58, FR-66

## Access Roles

- Standard User, Supervisor

## Search Fields

- Registration No (input)
- Customer (autocomplete)
- Make/model (dropdown/autocomplete)

## Results Table

| Label          | Field        | Notes                             |
|----------------|-------------|-----------------------------------|
| Reg No         | regNo       |                                  |
| Customer       | customer    |                                  |
| Make/Model     | makeModel   |                                  |
| Year           | year        |                                  |
| Status         | status      | Pill (Active/Inactive)           |
| Select         | select      | Goes to details (button/link)    |
| Preview        | preview     | Shows modal/card view            |

## Actions

- Search/submit
- Select/preview vehicle
- Export list (admin/supervisor)
- Filter by status (all/active/inactive)

## Loading/Empty/Error

- Empty: "No vehicles found."
- Loading: skeleton
- Error: error banner

## Test Identifiers

- `vehicle-help-page`
- `vehicle-help-search-regno`
- `vehicle-help-search-customer`
- `vehicle-help-search-makemodel`
- `vehicle-help-filter-status`
- `vehicle-help-search-btn`
- `vehicle-help-table`
- `vehicle-help-row-select-btn`
- `vehicle-help-row-preview-btn`
- `vehicle-help-error-banner`
- `vehicle-help-skeleton`

---

# Screen 22: Merge Customer Duplicates

## Route

- **Path:** `/crm/customers/merge-duplicates`

## Purpose

- Supervisor view for reviewing, resolving, and merging duplicate customer records.
- **PRD References:** Merge Customer Duplicates, US-49, FR-60

## Access Roles

- Supervisor, Administrator

## Layout

- List: Identified duplicate pairs/groups (side-by-side, check data)
- Detail: Data comparison table (all fields exposed)

## Screen Features

- Select master record
- For each field: pick field value to retain
- Preview merged record (modal)
- Confirmation dialog before merge
- Actions: merge, skip, mark not duplicate

## Fields

- Show all core customer fields (see Customer Mgmt)
- Difference highlight for conflicting fields

## Validation/Error

- Must select master and resolve all field conflicts
- Error: merge failed (technical); blocked if incomplete

## Success/Loading

- Success: banner and redirect
- Loading: skeletons on table/section

## Test Identifiers

- `merge-customer-duplicates-page`
- `merge-customer-duplicates-group`
- `merge-customer-duplicates-master-radio`
- `merge-customer-duplicates-field-picker`
- `merge-customer-duplicates-preview-btn`
- `merge-customer-duplicates-merge-btn`
- `merge-customer-duplicates-skip-btn`
- `merge-customer-duplicates-notduplicate-btn`
- `merge-customer-duplicates-error-banner`
- `merge-customer-duplicates-skeleton`

---

# Screen 23: Merge Supplier Duplicates

## Route

- **Path:** `/crm/suppliers/merge-duplicates`

## Purpose

- Supervisor utility to merge duplicated suppliers; same interaction as customers.
- **PRD References:** Merge Supplier Duplicates, US-52, FR-61

## Access Roles

- Supervisor, Administrator

## Layout

- Duplicate groupings, field-level value picker, preview, confirm.

## Actions

- Master selection, pick field values
- Preview result
- Merge, skip, not duplicate

## Validation/Error/Loading

- Must resolve all conflicts
- Block if not unique on essential fields
- Skeleton while loading
- Error on conflict/failure

## Test Identifiers

- `merge-supplier-duplicates-page`
- `merge-supplier-duplicates-group`
- `merge-supplier-duplicates-master-radio`
- `merge-supplier-duplicates-field-picker`
- `merge-supplier-duplicates-preview-btn`
- `merge-supplier-duplicates-merge-btn`
- `merge-supplier-duplicates-skip-btn`
- `merge-supplier-duplicates-notduplicate-btn`
- `merge-supplier-duplicates-error-banner`
- `merge-supplier-duplicates-skeleton`

---

# Screen 24: Merge Vehicle Duplicates

## Route

- **Path:** `/crm/vehicles/merge-duplicates`

## Purpose

- Supervisor tool to merge or resolve duplicate vehicle records.
- **PRD References:** Merge Vehicle Duplicates, US-59, FR-62

## Access Roles

- Supervisor, Administrator

## Layout

- List of candidates/duplicates.
- Per-vehicle comparison: regNo, customer, make/model, year, etc.
- Picker by field/column, differences highlighted.

## Actions

- Select master, pick/finalize field values
- Merge, skip, not duplicate
- Preview

## Validation/Error/Loading

- All conflicts must be resolved/merged
- Skeleton for fetch, error on attempt
- Block if merge would break constraints (e.g., linked to delivered order)

## Test Identifiers

- `merge-vehicle-duplicates-page`
- `merge-vehicle-duplicates-group`
- `merge-vehicle-duplicates-master-radio`
- `merge-vehicle-duplicates-field-picker`
- `merge-vehicle-duplicates-preview-btn`
- `merge-vehicle-duplicates-merge-btn`
- `merge-vehicle-duplicates-skip-btn`
- `merge-vehicle-duplicates-notduplicate-btn`
- `merge-vehicle-duplicates-error-banner`
- `merge-vehicle-duplicates-skeleton`

---

# Screen 25: Customer/Supplier List Report

## Route

- **Path:** `/crm/report/customers-suppliers`

## Purpose

- Generates detailed and summary reports of customer and supplier data, with filtering and data export.
- **PRD References:** Customer/Supplier List Report, US-61, US-69

## Access Roles

- Standard User (view/export)
- Supervisor, Administrator (full)

## Filter Fields

- Type: Customer / Supplier / Both (option)
- Status: Active / Inactive / All
- Category / Area / Sales Rep (dropdowns)
- Date Added: date range

## Table Columns

| Label          | Field               | Notes                |
|----------------|--------------------|----------------------|
| Name           | name               |                      |
| Contact        | phone/email        |                      |
| Status         | status             | Pill                 |
| Category       | type/category      | Retail, Local, etc.  |
| Date Added     | created            |                      |
| Last Updated   | updated            |                      |
| Assigned To    | salesRep / owner   |                      |
| Tags           | tags               |                      |

## Actions

- Run report (fetch table)
- Filter, sort by column
- Export to PDF/Excel (primary for admin/supervisor)
- Print report
- Paginate through results
- Quick search (name)

## States

- Loading: skeleton
- Empty: "No results found."
- Error: "Report could not be generated."

## Test Identifiers

- `customer-supplier-report-page`
- `customer-supplier-report-filter-type`
- `customer-supplier-report-filter-status`
- `customer-supplier-report-filter-category`
- `customer-supplier-report-filter-area`
- `customer-supplier-report-filter-salesrep`
- `customer-supplier-report-filter-dateadded`
- `customer-supplier-report-run-btn`
- `customer-supplier-report-table`
- `customer-supplier-report-export-btn`
- `customer-supplier-report-print-btn`
- `customer-supplier-report-pagination`
- `customer-supplier-report-error-banner`
- `customer-supplier-report-skeleton`

---

## COVERAGE CHECK

| Screen Name                    | Covered |
|------------------------------- |---------|
| 1. Sign In                     |   ✅    |
| 2. Password Change             |   ✅    |
| 3. ODBC Sign In                |   ✅    |
| 4. Bypass/Forgot Password      |   ✅    |
| 5. User Log Report             |   ✅    |
| 6. User List                   |   ✅    |
| 7. User Rights Management      |   ✅    |
| 8. User Management             |   ✅    |
| 9. Legacy User Management      |   ✅    |
|10. Admin Change Password       |   ✅    |
|11. Page/User Info              |   ✅    |
|12. UserLogReport               |   ✅    |
|13. EmployeeList                |   ✅    |
|14. Customer Management         |   ✅    |
|15. Supplier Management         |   ✅    |
|16. Contact Entry               |   ✅    |
|17. Contact Search              |   ✅    |
|18. Customer Help               |   ✅    |
|19. Supplier Help               |   ✅    |
|20. Customer Vehicle Entry      |   ✅    |
|21. Customer Vehicle Help       |   ✅    |
|22. Merge Customer Duplicates   |   ✅    |
|23. Merge Supplier Duplicates   |   ✅    |
|24. Merge Vehicle Duplicates    |   ✅    |
|25. Customer/Supplier List Report|  ✅    |

---

---

# FRONTEND_SPEC.md  
*Part 2 of 14: Check Duplicate Contacts, Cust Age Wise, Items Help New, Local Porder Search, Menu, Supp Age Wise, Document Help, Main Menu (OLD & Current), Declare Module, DMS Module, Functions, Inventory, Log Module, Main Module, Utility Module, Numto Words, Payroll, Process Status Module, Read Offline Message, Settings, Form1 (Placeholder/Test Interface), Report Test (Sample/Diagnostics Report), CustomerList (Report Screen), SupplierList (Report Screen), Attachments*  

---

## 26. Check Duplicate Contacts

**Route:** `/contacts/duplicates`  
**Purpose:** Review and manage contacts that have possible duplicates (by address, phone, or email).  
**PRD Reference:** Customer & Supplier Management → Check Duplicate Contacts  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- **Heading:** "Check Duplicate Contacts"
- **Filter Panel:** Options to search/scope duplicate search (by field: address, phone, email).
- **Duplicate Table:** Each row displays two contacts flagged as potential duplicates, relevant fields side by side, and actions to resolve or ignore.

#### Filter Fields
- Duplicate Field Selector (Dropdown):  
  - Label: "Find duplicates by"
  - Values: [Address, Phone, Email, All Fields]
  - Validation: Required. Error: "Please select a field to compare duplicates."
- Search Input (Textbox):  
  - Label: "Keyword"
  - Placeholder: "Enter value to search duplicates…"
  - Optional.

#### Table Columns
| Column                | Description                                 |
|-----------------------|---------------------------------------------|
| [ ] Select            | Row-level checkbox for batch operations     |
| Contact A – Name      | Name of first contact potential duplicate   |
| Contact A – Email     | Email                                       |
| Contact A – Phone     | Phone                                       |
| Contact A – Address   | Address combined to single line             |
| Contact B – Name      | Name of duplicate contact                   |
| Contact B – Email     | Email                                       |
| Contact B – Phone     | Phone                                       |
| Contact B – Address   | Address                                     |
| Matched Fields        | List of which fields matched                |
| Action                | "Merge", "Flag Not Duplicate" buttons       |

#### Actions/Buttons
- Filter/Search (primary button)
- Reset Filters (secondary button)
- "Merge" (on each row)
- "Flag Not Duplicate" (on each row)
- Batch Merge (primary button in batch actions footer, only active if ≥1 rows selected)
- Batch Ignore (secondary button in batch actions footer)
- Export Results (secondary button)

#### Merging/Resolution UX
- Clicking "Merge" opens a modal comparing both sets of fields.  
  - User selects which values to retain per field (radio for each, default: left-side “Contact A”, highlight differences with border).
  - Confirm (primary button, disables during merge in progress).
  - Cancel (secondary button).

#### Validations & Error States
- "Find duplicates by" is required.
- Loading state: shimmer skeleton in table rows and panel.
- API error: Show error banner at the top ("Could not load duplicate contacts. [Error details]").
- Merge error: error toast ("Failed to merge contacts. Please try again or contact admin.").
- Empty state: Card with 🧩 line icon, text: "No duplicate contacts found for the selected criteria."

#### Test Identifiers
- data-testid="check-duplicates-filter-field"
- data-testid="check-duplicates-filter-keyword"
- data-testid="check-duplicates-filter-btn"
- data-testid="check-duplicates-reset-btn"
- data-testid="check-duplicates-table"
- data-testid="check-duplicates-row-[contactAId]-[contactBId]"
- data-testid="check-duplicates-merge-btn"
- data-testid="check-duplicates-flagnotdup-btn"
- data-testid="check-duplicates-batch-merge"
- data-testid="check-duplicates-batch-ignore"
- data-testid="check-duplicates-export"

---

## 27. Cust Age Wise

**Route:** `/customers/agewise`  
**Purpose:** Display and export customers grouped by age (length of account or age of contacts).  
**PRD Reference:** Customer & Supplier Management → Cust Age Wise  
**Access Roles:** Standard User, Supervisor

### Layout & Structure

- **Heading:** "Customers by Age Bracket"
- **Filters Panel:** Age bucket selector, optional keyword search.
- **Summary Tiles:** Counts per age group (e.g., 0–1y, 1–3y, 3–5y, 5y+).
- **Customer Table:** Details per customer in filtered bracket.

#### Filter Fields
- Age Group (Dropdown):  
  - Label: "Show customers aged"
  - Values: [All, 0–1 year, 1–3 years, 3–5 years, Over 5 years]
- Search (Textbox, optional):  
  - Label: "Name or ID"
  - Placeholder: "Search customers…"

#### Table Columns
| Column        | Description                    |
|---------------|------------------------------|
| Customer Name | Customer full name             |
| Customer ID   | System ID                     |
| Account Age   | Years (to 1 decimal)           |
| Opened On     | Account creation date          |
| Status        | Active/Inactive (status pill)  |
| Primary Phone | Main registered phone number   |
| Email         | Registered email               |
| Action        | "View Details" link/button     |

#### Actions/Buttons
- Apply Filters (primary button)
- Reset Filters (secondary button)
- Export List (secondary button)
- Print List (secondary button)
- "View Details" (per row, navigates to `/customers/:id`)

#### Empty and Error States
- Empty: "No customers found matching criteria." (card with user line icon)
- Loading: shimmer skeleton for tiles/table
- Error: banner at top + toast for filter/apply/export failures

#### Test Identifiers
- data-testid="cust-agewise-filter-age"
- data-testid="cust-agewise-filter-search"
- data-testid="cust-agewise-filter-apply"
- data-testid="cust-agewise-table"
- data-testid="cust-agewise-row-[customerId]"
- data-testid="cust-agewise-export"
- data-testid="cust-agewise-print"
- data-testid="cust-agewise-summarytile-[bracket]"

---

## 28. Items Help New

**Route:** `/items/help`  
**Purpose:** Assist users to search and select items for linking to customers/suppliers or use in forms/orders.  
**PRD Reference:** Customer & Supplier Management → Items Help New  
**Access Roles:** Standard User

### Layout & Structure

- **Heading:** "Item Lookup Help"
- **Quick Search Form:** Multiple filters.
- **Results Table:** List of items matched.

#### Filter Fields
- Item Code (Textbox):  
  - Label: "Item Code"
  - Placeholder: "Type code…"
- Description (Textbox):  
  - Label: "Description"
  - Placeholder: "Search item name…"
- Category (Dropdown):  
  - Label: "Category"
  - Values: Fetched via `/api/v1/items/categories`
- Only Active? (Switch):  
  - Label: "Active Only"

#### Table Columns
| Column            | Description        |
|-------------------|-------------------|
| Item Code         | System code       |
| Description       | Item name/description |
| Category          | Display string    |
| UOM               | Denomination/unit |
| Current Stock     | Balance qty       |
| Status            | Active/Inactive pill |
| Action            | Select (link icon, primary, compact) |

#### Actions/Buttons
- Search (primary)
- Reset (secondary)
- Select (per row, triggers callback/selection event with item payload)
- Export Results (secondary button)

#### Validations
- No required fields, but at least one filter suggested (warn if none).
- Error banner for loading or API failure ("Failed to fetch item list. Please try again.")
- Skeleton loading for table and filters.

#### Empty State
- Text: "No items found. Try adjusting your filters."

#### Test Identifiers
- data-testid="items-help-filter-code"
- data-testid="items-help-filter-desc"
- data-testid="items-help-filter-category"
- data-testid="items-help-filter-active"
- data-testid="items-help-search-btn"
- data-testid="items-help-reset-btn"
- data-testid="items-help-table"
- data-testid="items-help-row-[itemCode]"
- data-testid="items-help-select-btn"
- data-testid="items-help-export"

---

## 29. Local Porder Search

**Route:** `/purchase/local/search`  
**Purpose:** Search and review local purchase orders related to customers or suppliers.  
**PRD Reference:** Customer & Supplier Management → Local Porder Search  
**Access Roles:** Standard User, Supervisor

### Layout & Structure

- **Heading:** "Local Purchase Order Search"
- **Search Filters Section:** Inputs for range/criteria.
- **Results Table:** Matching orders with key info.

#### Filter Fields
- Purchase Order No. (Textbox):  
  - Label: "Purchase Order #"
- Supplier (Typeahead):  
  - Label: "Supplier"
  - API: `/api/v1/suppliers/search`
- Date Range (Datepicker):  
  - Label: "Order Date"
  - Range picker: "Start Date" to "End Date"
- Status (Dropdown):  
  - Label: "Status"
  - Values: [All, Draft, Submitted, Approved, Received, Closed]

#### Table Columns
| Column         | Description                   |
|----------------|------------------------------|
| P.O. Number    | Local PO identifier         |
| Supplier       | Name/ID                    |
| Date           | Order date                 |
| Status         | Current PO status (pill)   |
| Total Amount   | PO total in system currency|
| Action         | View Details (link)         |

#### Actions/Buttons
- Search (primary)
- Reset (secondary)
- Export Results (secondary)
- View Details (per row, navigates to `/purchase/local/:poNumber`)

#### Validations
- Start Date ≤ End Date.  
  - Error: "Start Date must be on or before End Date."
- PO Number required IF rest of fields empty (at least one filter required).
- Error state: banner at top for search/export failures.
- Empty state: Card with finder line icon, "No purchase orders found for selected criteria."
- Skeleton rows during loading.

#### Test Identifiers
- data-testid="local-porder-filter-pono"
- data-testid="local-porder-filter-supplier"
- data-testid="local-porder-filter-date"
- data-testid="local-porder-filter-status"
- data-testid="local-porder-search-btn"
- data-testid="local-porder-reset-btn"
- data-testid="local-porder-table"
- data-testid="local-porder-row-[poNumber]"
- data-testid="local-porder-view-detail"
- data-testid="local-porder-export"

---

## 30. Menu

**Route:** `/customers-suppliers/menu`  
**Purpose:** Hub menu granting access to all customer and supplier management features.  
**PRD Reference:** Customer & Supplier Management → Menu  
**Access Roles:** All active users

### Layout & Structure

- **Heading:** Main module logo, "Customer & Supplier Management", subtext "Select a function"
- **Menu Sections:** Customer, Supplier, Vehicles, Reports, Utilities
  - Cards or segmented list, each icon + descriptive text (outlined icons style per DS)
- **Shortcuts/Quick Actions:** e.g., “Add Customer”, “Add Supplier” (icon + button per section)
- **Recent Activity:** At bottom. List of recent changes (created, edited, merged)

#### Menu Items
| Label         | Icon      | Route                                  |
|---------------|-----------|----------------------------------------|
| Customer List | "user"    | /customers                             |
| Add Customer  | "user-plus"| /customers/new                        |
| Supplier List | "briefcase"| /suppliers                            |
| Add Supplier  | "briefcase-plus"| /suppliers/new                   |
| Vehicles      | "car"     | /vehicles                              |
| Vehicle Help  | "help-circle"| /vehicles/help                     |
| Merge Duplicates | "merge"| /customers/duplicates                  |
| Report Center | "clipboard-list"| /customers-suppliers/reports     |
| Utilities     | "settings"| /customers-suppliers/utilities        |
| Import Data   | "upload"  | /customers-suppliers/import           |

#### Interactions
- Clicks navigate to routes above.
- Each item is a button or card with focus/hover transitions (darken/shadow per DS).
- Tooltip on hover with route description.

#### Test Identifiers
- data-testid="cs-menu-card-customer"
- data-testid="cs-menu-card-supplier"
- data-testid="cs-menu-card-vehicle"
- data-testid="cs-menu-card-report"
- data-testid="cs-menu-card-utilities"
- data-testid="cs-menu-quick-add-customer"
- data-testid="cs-menu-quick-add-supplier"
- data-testid="cs-menu-recent-activity-row-[n]"

---

## 31. Supp Age Wise

**Route:** `/suppliers/agewise`  
**Purpose:** Display and export suppliers grouped by account age or "business age."  
**PRD Reference:** Customer & Supplier Management → Supp Age Wise  
**Access Roles:** Standard User, Supervisor

### Layout & Structure

- **Heading:** "Suppliers by Age Bracket"
- **Filters Panel:** Age bucket selector, optional search input.
- **Summary Tiles:** One per age group with total supplier count.
- **Supplier Table:** List of suppliers in selected bracket.

#### Filter Fields  
- Age Group (Dropdown):  
  - Label: "Show suppliers aged"
  - Values: [All, 0–1 year, 1–3 years, 3–5 years, Over 5 years]
- Search (Textbox, optional):  
  - Label: "Name or ID"
  - Placeholder: "Search suppliers…"

#### Table Columns
| Column         | Description              |
|----------------|-------------------------|
| Supplier Name  |                         |
| Supplier ID    |                         |
| Account Age    | in years (1 decimal)    |
| Opened On      | Date created            |
| Status         | Active/Inactive pill    |
| Primary Phone  | Supplier main phone     |
| Email          | Registered email        |
| Action         | View Details (link)     |

#### Actions/Buttons
- Apply Filters (primary)
- Reset Filters (secondary)
- Export (secondary)
- Print (secondary)
- "View Details" (row, `/suppliers/:id`)

#### Validations & States
- Age Group required; search optional.
- Skeletons for loading.
- Error banners and inline errors.
- Empty state: "No suppliers found for selected criteria."

#### Test Identifiers
- data-testid="supp-agewise-filter-age"
- data-testid="supp-agewise-filter-search"
- data-testid="supp-agewise-filter-apply"
- data-testid="supp-agewise-table"
- data-testid="supp-agewise-row-[supplierId]"
- data-testid="supp-agewise-export"
- data-testid="supp-agewise-print"
- data-testid="supp-agewise-summarytile-[bracket]"

---

## 32. Document Help

**Route:** `/documents/help`  
**Purpose:** Helps users find and reference documents linked to customers or suppliers.  
**PRD Reference:** Customer & Supplier Management → Document Help  
**Access Roles:** Standard User, Supervisor

### Layout & Structure

- **Heading:** "Document Help — Linked to Customer/Supplier"
- **Search Filters:** Document type, Keyword, Linked entity
- **Results Table:** List of matching documents.

#### Filter Fields
- Document Type (Dropdown):  
  - Label: "Type"
  - Values: Populated from `/api/v1/documents/types`
- Keyword (Textbox):  
  - Label: "Keyword"
  - Placeholder: "Search in title, notes…"
- Linked Entity (Typeahead):  
  - Label: "Linked to"
  - Suggests customers/suppliers

#### Table Columns
| Column           | Description                   |
|------------------|------------------------------|
| Document Name    | File name/title               |
| Type             | Document type                 |
| Linked Entity    | Name (customer/supplier)      |
| Date Added       | Upload or creation date       |
| Uploaded By      | Username                      |
| Status           | Workflow status (pill/tag)    |
| Action           | Download (link icon), Preview (eye icon) |

#### Actions/Buttons
- Search (primary)
- Reset (secondary)
- Download (icon/btn per row)
- Preview (cmd per row, inline modal)
- Export Results (secondary)

#### Validations & States
- At least one filter suggested (warn if none).
- Loading: table skeletons + filter spinner.
- Error: top banner for API/error.
- Empty: "No documents found."

#### Test Identifiers
- data-testid="doc-help-filter-type"
- data-testid="doc-help-filter-keyword"
- data-testid="doc-help-filter-entity"
- data-testid="doc-help-search-btn"
- data-testid="doc-help-table"
- data-testid="doc-help-row-[docId]"
- data-testid="doc-help-download-btn"
- data-testid="doc-help-preview-btn"
- data-testid="doc-help-export"

---

## 33. Main Menu (OLD & Current)

**Route:** `/mainmenu`  
**Purpose:** Legacy and current entry points for all system modules and direct navigation (for migration/UX parity).  
**PRD Reference:** Main Menu (OLD & Current)  
**Access Roles:** All roles; visibility by access control

### Layout & Structure

- **Brand heading:** App/organization logo + standardized system name  
- **Primary Module Tiles:** Customer, Supplier, Inventory, Sales, Purchasing, Jobs/Work Orders, HR, Finance, Admin, Reports, Utilities

#### Tiles (Grid/List)
| Label           | Icon     | Route                  | Roles     |
|-----------------|----------|------------------------|-----------|
| Dashboard       | "layout" | `/dashboard`           | All       |
| Customers       | "user"   | `/customers`           | All       |
| Suppliers       | "briefcase" | `/suppliers`        | All       |
| Inventory       | "boxes"  | `/inventory`           | Inv+      |
| Sales Orders    | "cart"   | `/orders/sales`        | All       |
| Purchase Orders | "package"| `/orders/purchase`     | All       |
| Jobs/Work       | "wrench" | `/jobs`                | Ops+      |
| HR/Personnel    | "users"  | `/hr`                  | HR/Admin  |
| Accounts/Finance| "dollar"| `/finance`             | Fin+      |
| Reports         | "bar-chart"| `/reports`           | All       |
| Utilities       | "sliders"| `/utilities`           | Admin+    |
| Settings        | "settings"| `/settings`           | Admin+    |

#### Interactions
- Module tiles use outlined icons, hover darkens background, focus gets primary border.
- Navigation via click or keyboard (tab/enter).
- Last-used module shortcut at top right (if available).

#### Legacy (OLD) Menu
- Optionally show as collapsible legacy-styled sidebar for user migration comfort

#### Test Identifiers
- data-testid="main-menu-tile-[module]"
- data-testid="main-menu-legacy-sidebar"
- data-testid="main-menu-lastused-shortcut"

---

## 34. Declare Module

**Route:** `/customers-suppliers/declare`  
**Purpose:** Manage named/declared configuration items for customers/suppliers (settings, flags, groupings).  
**PRD Reference:** Customer & Supplier Management → Declare Module  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- **Header:** "Declare Customer/Supplier Configuration"
- **Configuration Table:** All named declarations
- **Add/Edit Panel:** Inline or modal, depends on action

#### Table Columns
| Column        | Description             |
|---------------|------------------------|
| Name          | Declared config item    |
| Code/Key      | Unique identifier       |
| Description   | Optional description    |
| Active        | Status toggle           |
| Used In       | Reference count         |
| Actions       | Edit, Deactivate/Delete |

#### Actions/Buttons
- Add Declaration (primary button)
- Edit (per row)
- Deactivate/Activate (per row, toggle switch)
- Delete (per row, allowed only if used count is zero; show confirm dialog)
- Export List (secondary)

#### Add/Edit Modal Fields
- Name (Textbox, required)
  - Error: "Name is required."
- Code/Key (Textbox, required, unique, no spaces)
  - Error: "Code is required and must be unique (no spaces)."
- Description (Textbox, optional)

#### Validations & States
- Show errors below or right of fields.
- Loading: Spinner/skeleton on table, disable buttons.
- Confirmation dialogs for delete.
- Empty: "No declarations yet."

#### Test Identifiers
- data-testid="declare-table"
- data-testid="declare-add-btn"
- data-testid="declare-edit-btn"
- data-testid="declare-delete-btn"
- data-testid="declare-activate-btn"
- data-testid="declare-deactivate-btn"
- data-testid="declare-modal-name"
- data-testid="declare-modal-code"
- data-testid="declare-modal-desc"
- data-testid="declare-modal-save"

---

## 35. DMS Module

**Route:** `/dms`  
**Purpose:** Manage document management system — catalog, linking, viewing of documents to customers/suppliers.  
**PRD Reference:** Customer & Supplier Management → DMS Module  
**Access Roles:** Standard User, Supervisor, Administrator

### Layout & Structure

- **Header:** "Document Management System (DMS)"
- **Tabs:**  
  - Documents  
  - Linked Entities  
  - Bulk Actions  
- **Upload/Link Area:** (fixed on right or modal)

#### Document Table Columns
| Column         | Description            |
|----------------|-----------------------|
| Document Name  | Filename/title         |
| Linked Entity  | Customer/Supplier name |
| Document Type  | Classification         |
| Uploaded By    | Username               |
| Date Added     | Upload date            |
| Status         | Current workflow status|
| Actions        | View, Download, Edit, Delete |

#### Link Panel Fields
- Search Linked Entities (typeahead)
- Search/Select Documents
- Link Button

#### Bulk Actions  
- Upload Multiple  
- Unlink Multiple  
- Download/Export Selected  
- Delete Selected

#### Actions/Buttons
- Upload (primary button)
- Link (primary in panel)
- Download (row/batch)
- Edit Document Metadata (modal inline; fields: title, type, status, tags)
- Delete (row/batch, confirmation required)

#### Validations & States
- File type, maximum size checks: error under upload.
- Only allow delete if user has permission and item not locked by workflow.
- Error banner for all API failures.
- “Linked successfully” confirmation after linking.
- Empty states for documents/no links.

#### Test Identifiers
- data-testid="dms-documents-tab"
- data-testid="dms-linked-entities-tab"
- data-testid="dms-bulk-actions-tab"
- data-testid="dms-upload-btn"
- data-testid="dms-link-btn"
- data-testid="dms-document-row-[docId]"
- data-testid="dms-download-btn"
- data-testid="dms-edit-btn"
- data-testid="dms-delete-btn"
- data-testid="dms-link-entity-select"
- data-testid="dms-link-document-select"
- data-testid="dms-bulk-upload-btn"
- data-testid="dms-bulk-download-btn"
- data-testid="dms-bulk-delete-btn"

---

## 36. Functions

**Route:** `/customers-suppliers/functions`  
**Purpose:** Utility functions relevant to data/process management for customers/suppliers.  
**PRD Reference:** Customer & Supplier Management → Functions  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- **Heading:** "Customer/Supplier Utility Functions"
- **Function List:** Cards or list of utility tools
- **Logs Area:** Shows results/log for last run

#### Function Tools (Examples)
| Action Label       | Description                       |
|--------------------|-----------------------------------|
| Bulk Merge Cleanup | Merge and clean duplicates        |
| Mass Update Status | Update status for a group         |
| Export as CSV      | Export contacts/data              |
| Tag All Customers  | Batch tag assignment              |
| Archive Inactive   | Archive old inactive entries      |

- Each tool has [Run] (primary button), [View Log] (link), config modal if configurable (fields vary by tool).

#### Actions/Buttons
- Run Function
- View Last Log (modal or expandable inline)
- Download Output/Log

#### Validations & States
- If function requires config, modal must validate all required parameters.
- Logs and output shown below each function card/tool.
- Error banner for API/tool execution failures.
- Success toast and badge on tool last-run.

#### Test Identifiers
- data-testid="functions-toolcard-[toolname]"
- data-testid="functions-tool-run-btn"
- data-testid="functions-tool-log-view"
- data-testid="functions-tool-download"
- data-testid="functions-logarea"

---

## 37. Inventory

**Route:** `/inventory`  
**Purpose:** Review and manage inventory data relevant to customer/supplier-linked items.  
**PRD Reference:** Customer & Supplier Management → Inventory  
**Access Roles:** Standard User, Supervisor

### Layout & Structure

- **Header:** "Inventory Overview"
- **Filter Panel:** Item code, name, status, location.
- **Summary Tiles:** Total items, Stock Value, Items by Location
- **Inventory Table:** Searchable, filterable, paginated.

#### Filter Fields
- Item Code/Name (Textbox):  
  - Label: "Item"
- Status (Dropdown):  
  - Label: "Status"
  - Values: [All, Active, Inactive, Low Stock]
- Location (Dropdown or typeahead):  
  - Label: "Location"
  - Populated from `/api/v1/inventory/locations`

#### Table Columns
| Column      | Description         |
|-------------|--------------------|
| Item Code   |                     |
| Name        | Description         |
| Location    | Warehouse/location  |
| Quantity    | On hand             |
| Reorder     | If below threshold  |
| Last Updated| Date                |
| Action      | View/LInk (button)  |

#### Actions/Buttons
- Apply Filters (primary)
- Reset Filters (secondary)
- Export (secondary)
- Link to Entity (per row)
- View Details (per row, navigates to `/inventory/:itemCode`)

#### Validations & States
- Skeleton rows for loading.
- Error banner for load/filter/export failure.
- Empty state: "No inventory records found."

#### Test Identifiers
- data-testid="inventory-filter-item"
- data-testid="inventory-filter-status"
- data-testid="inventory-filter-location"
- data-testid="inventory-table"
- data-testid="inventory-row-[itemCode]"
- data-testid="inventory-link-btn"
- data-testid="inventory-view-btn"
- data-testid="inventory-export"

---

## 38. Log Module

**Route:** `/customers-suppliers/logs`  
**Purpose:** View audit/change logs for customer and supplier records.  
**PRD Reference:** Customer & Supplier Management → Log Module  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- **Heading:** "Customer/Supplier Change Logs"
- **Filter Panel:** Date range, entity type (customer/supplier/contact/vehicle), user, action type
- **Logs Table:** Paginated

#### Filter Fields
- Date Range (Datepicker, required):  
  - Label: "Changed Between"
- Entity Type (Dropdown):  
  - Label: "Entity"
  - Values: [All, Customer, Supplier, Contact, Vehicle]
- User (Typeahead):  
  - Label: "User"
- Action (Dropdown):  
  - Label: "Action"
  - Values: [All, Create, Edit, Delete, Merge, Export, Import]

#### Table Columns
| Column        | Description             |
|---------------|------------------------|
| Date/Time     | Timestamp              |
| Entity        | Type+Name              |
| Action        | Action type            |
| User          | Username               |
| Details       | Change details/diff    |
| Notes         | Optional log notes     |
| Exported      | Export/download icon   |

#### Actions/Buttons
- Apply Filters (primary)
- Reset (secondary)
- Export (secondary)
- Add Note (per row, modal or inline)

#### Validations & States
- Date range required.
- Error if no changes in range: "No change logs for selected period."
- Banner on query/export failures.
- Loading: spinner/skeleton.

#### Test Identifiers
- data-testid="logs-filter-from"
- data-testid="logs-filter-to"
- data-testid="logs-filter-entity"
- data-testid="logs-filter-user"
- data-testid="logs-filter-action"
- data-testid="logs-table"
- data-testid="logs-row-[logId]"
- data-testid="logs-export"
- data-testid="logs-add-note-btn"

---

## 39. Main Module

**Route:** `/customers-suppliers/main`  
**Purpose:** Summary home view for customer/supplier functions — KPIs, activity, quick links.  
**PRD Reference:** Customer & Supplier Management → Main Module  
**Access Roles:** All roles

### Layout & Structure

- **Header:** App module name, Key KPIs row (total customers, total suppliers, pending merges, last activity)
- **Activity Stream:** List of last 10 actions, with icons, time, user.
- **Key Shortcuts:** “Add Customer”, “Add Supplier”, “Import Data”, “Go to Reports”
- **Quick Stats:** Pie/bar graphs of status breakdown

#### KPIs (Tiles)
| KPI                     | Data                    |
|-------------------------|-------------------------|
| Total Customers         | Count                   |
| Total Suppliers         | Count                   |
| Duplicates Found        | Current count           |
| Last Import Errors      | Red badge if any recent |

#### Actions
- "Add Customer" (primary)
- "Add Supplier" (primary)
- "Import Data" (secondary)
- "Go to Reports" (secondary)
- All KPIs, activity links clickable (navigates)

#### Validations & States
- Show skeleton tiles and shimmer timeline on load.
- Error: Toast and banner on failure.
- Empty: Card with “No activity yet.”

#### Test Identifiers
- data-testid="mainmod-kpi-total-customers"
- data-testid="mainmod-kpi-total-suppliers"
- data-testid="mainmod-kpi-duplicates"
- data-testid="mainmod-kpi-import-errors"
- data-testid="mainmod-shortcut-add-customer"
- data-testid="mainmod-shortcut-add-supplier"
- data-testid="mainmod-shortcut-import"
- data-testid="mainmod-shortcut-reports"
- data-testid="mainmod-activity-row-[n]"

---

## 40. Utility Module

**Route:** `/customers-suppliers/utilities`  
**Purpose:** Specialized tools for data hygiene and maintenance (bulk update, clean-up, diagnostics).  
**PRD Reference:** Customer & Supplier Management → Utility Module  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- **Header:** "Customer & Supplier Utilities"
- **Tools List:** Card/list per utility. Example tools: "Duplicate Checker", "Bulk Status Changer", "Error Diagnosis", "Tag Management", "Export Diagnostics Log"
- **Results/Log Area:** Bottom of page, logs/actions/results show here.

#### Tool/Utility Card Example
| Name                  | Description                        | Action                             |
|-----------------------|------------------------------------|------------------------------------|
| Duplicate Checker     | Find and merge duplicate records   | Run (primary)                      |
| Bulk Status Changer   | Set active/inactive status         | Run (opens modal to select options)|
| Error Diagnosis       | Analyze system data errors         | Run (primary)                      |
| Tag Management        | Edit tags in bulk                  | Go (link to tag management page)   |
| Export Diagnostics    | Download log files                 | Export (secondary button)          |

#### Actions/Buttons
- Run (per tool, primary)
- Go (navigates to config page)
- Export (secondary)
- Logs view toggle

#### Validations & States
- Confirmation for bulk/irreversible tools.
- Modal dialog for configurable tools with fields to validate.
- Error badge on failure, status/success badge on completion.
- Loading spinner as required.

#### Test Identifiers
- data-testid="utility-toolcard-[name]"
- data-testid="utility-tool-run"
- data-testid="utility-tool-go"
- data-testid="utility-tool-export"
- data-testid="utility-tool-log"

---

## 41. Numto Words

**Route:** `/tools/num-words`  
**Purpose:** Convert numbers to their word representation for use in reports or invoices.  
**PRD Reference:** Customer & Supplier Management → Numto Words  
**Access Roles:** Standard User

### Layout & Structure

- **Header:** "Number to Words Converter"
- **Input Box:** User enters a number (with label and currency/unit selector optional)
- **Output Field:** Displays result as words
- **Copy/Insert:** "Copy Words", "Clear", "Insert Into Report" (if used in embedded context)

#### Input Fields
- Number (Textbox):  
  - Label: "Number"
  - Validation: Required, numeric only, positive integers/decimals up to 999999999.99.  
  - Error: "Please enter a valid number up to 999,999,999.99"
- Currency/Unit (Dropdown, optional):  
  - Values: [None, INR, USD, AED, "Custom"]

#### Output
- Read-only text area:  
  - Label: "In Words"
  - Populated automatically as user types or hits convert.

#### Actions/Buttons
- Copy (primary)
- Clear (secondary)
- Insert Into Report (optional, only when called in picker/embed context)

#### Validations & States
- Error message inline below input.
- Output clears on reset/clear.
- Success toast on copy.

#### Test Identifiers
- data-testid="numwords-input"
- data-testid="numwords-currency"
- data-testid="numwords-output"
- data-testid="numwords-copy-btn"
- data-testid="numwords-clear-btn"
- data-testid="numwords-insert-btn"

---

## 42. Payroll

**Route:** `/payroll`  
**Purpose:** Manage and reference payroll data linked to customer/supplier contacts (for vendor accounting, etc.).  
**PRD Reference:** Customer & Supplier Management → Payroll  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- **Header:** "Payroll Reference & Management"
- **Filter Panel:** Contact search, payroll status, department
- **Table View:** List of payroll entries and linked contacts

#### Filter Fields
- Contact Name/ID (Textbox):  
  - Label: "Contact"
- Payroll Status (Dropdown):  
  - Label: "Payroll Status"
  - Values: [All, Active, On Leave, Terminated]
- Department (Dropdown):  
  - Label: "Department"
  - Populated from `/api/v1/departments`

#### Table Columns
| Column         | Description               |
|----------------|--------------------------|
| Name           | Contact name             |
| ID             | Contact ID               |
| Linked Entity  | Customer/Supplier name   |
| Payroll Status | Active/Leave/Terminated  |
| Department     |                          |
| Salary         |Amount, formatted         |
| Last Paid      |Date                      |
| Next Due       |Date                      |
| Actions        | "View", "Export"         |

#### Actions/Buttons
- Apply Filters (primary)
- Reset (secondary)
- Export List (secondary)
- "View" (per row, navigates to `/payroll/:contactId`)
- Batch Export Selected (if multiple selected)

#### Validations & States
- Loading: Table skeleton.
- Error: banner at top on failure.
- Empty: "No payroll records found."

#### Test Identifiers
- data-testid="payroll-filter-contact"
- data-testid="payroll-filter-status"
- data-testid="payroll-filter-department"
- data-testid="payroll-table"
- data-testid="payroll-row-[contactId]"
- data-testid="payroll-view-btn"
- data-testid="payroll-export-btn"
- data-testid="payroll-batch-export-btn"

---

## 43. Process Status Module

**Route:** `/process-status`  
**Purpose:** Track/manage processing statuses of customer, supplier, or related workflow steps.  
**PRD Reference:** Customer & Supplier Management → Process Status Module  
**Access Roles:** Standard User, Supervisor

### Layout & Structure

- **Header:** "Process Status Tracker"
- **Filter Section:** Type selector, status, reference/entity ID
- **Status Table:** List of processes with latest status, history preview

#### Filter Fields
- Process Type (Dropdown):  
  - Label: "Type"
  - Values: [Customer, Supplier, Vehicle, Order, Document]
- Entity/Reference ID (Textbox):  
  - Label: "Reference ID"
- Current Status (Dropdown):  
  - Label: "Status"
  - Values: [All, Pending, In Progress, Approved, Complete, On Hold, Cancelled]

#### Table Columns
| Column         | Description                   |
|----------------|------------------------------|
| Type           | Process type                  |
| Reference ID   |                              |
| Current Status | Pill (role color, per status)|
| Last Updated   | Date/time                     |
| Updated By     | Username                      |
| History        | Expand icon/modal             |
| Actions        | Update Status                 |

#### Actions/Buttons
- Apply Filters (primary)
- Reset Filters (secondary)
- Expand History (per row) — modal shows full timeline
- Update Status (per row, opens modal)
- Export Results (secondary)

#### Validations & States
- All filters optional, but warn if 0 results
- Loading: Skeleton
- Error: Banner
- Empty: "No processes found for selection."

#### Test Identifiers
- data-testid="process-status-type"
- data-testid="process-status-refid"
- data-testid="process-status-status"
- data-testid="process-status-filter-apply"
- data-testid="process-status-table"
- data-testid="process-status-row-[procId]"
- data-testid="process-status-history-btn"
- data-testid="process-status-update-btn"
- data-testid="process-status-export"

---

## 44. Read Offline Message

**Route:** `/messages/offline`  
**Purpose:** Retrieve system/user messages/notifications received while offline.  
**PRD Reference:** Customer & Supplier Management → Read Offline Message  
**Access Roles:** Standard User

### Layout & Structure

- **Heading:** "Offline Messages"
- **Inbox Table:** List of messages
- **Details Panel:** Shows message content, sender, related record, timestamp

#### Table Columns
| Column        | Description                |
|---------------|---------------------------|
| From          | Sender name                |
| Subject       | Message subject            |
| Linked Entity | Customer/Supplier/Order    |
| Received      | Date, time                 |
| Status        | Read/Unread pill           |
| Actions       | "View" (primary), "Flag"   |

#### Actions/Buttons
- View Message (primary; shows in details panel or modal)
- Mark as Read/Unread
- Flag for Follow-Up (star/flag icon)
- Refresh List (secondary)

#### Validations & States
- Loading: shimmer in table
- Error: inline error banner
- Empty: "No offline messages."

#### Test Identifiers
- data-testid="offline-msg-table"
- data-testid="offline-msg-row-[msgId]"
- data-testid="offline-msg-view-btn"
- data-testid="offline-msg-flag-btn"
- data-testid="offline-msg-refresh-btn"
- data-testid="offline-msg-details-panel"

---

## 45. Settings

**Route:** `/customers-suppliers/settings`  
**Purpose:** Adjust/view system/user settings relevant to customer/supplier management.  
**PRD Reference:** Customer & Supplier Management → Settings  
**Access Roles:** User (prefs), Supervisor (advanced), Admin (all)

### Layout & Structure

- **Header:** "Customer/Supplier Module Settings"
- **Sections:** General, Data Validation Rules, Notification Preferences, Display/Export Settings

#### General Settings Fields
- Timezone (Dropdown):  
  - Label: "Timezone"
- Default Export Format (Dropdown):  
  - Label: "Export Format"
  - Values: [PDF, Excel, CSV]
- Language (Dropdown):  
  - Label: "Language"

#### Data Validation Rules Fields
- Phone Required? (Toggle)
- Email Validation Strength (Dropdown):  
  - Values: [Strict, Relaxed]

#### Notification Preferences
- Receive email alerts (Checkbox)
- Receive in-app notifications (Checkbox)

#### Display Settings
- Results per page (Slider: 10–100)
- Show inactive by default? (Toggle)

#### Actions/Buttons
- Save Changes (primary)
- Reset to Defaults (secondary)

#### Validations & States
- Error below invalid fields.
- Success: toast + checkmark on save.
- Error: failed to save error banner.
- Loading: spinner on load/apply.

#### Test Identifiers
- data-testid="settings-timezone"
- data-testid="settings-export-format"
- data-testid="settings-language"
- data-testid="settings-phone-req"
- data-testid="settings-email-validation"
- data-testid="settings-email-alert"
- data-testid="settings-inapp-alert"
- data-testid="settings-results-per-page"
- data-testid="settings-show-inactive"
- data-testid="settings-save-btn"
- data-testid="settings-reset-btn"

---

## 46. Form1 (Placeholder/Test Interface)

**Route:** `/form1`  
**Purpose:** Placeholder or internal test interface; used for development/system maintenance.  
**PRD Reference:** Customer & Supplier Management → Form1 (Placeholder/Test Interface)  
**Access Roles:** Administrator

### Layout & Structure

- Header: "Test Interface (Form1)"
- Panel: Display "This is a placeholder or internal development interface."
- Buttons: Clear Test Data (primary), Generate Test Event (secondary), Return to Dashboard (secondary)
- If any diagnostic/test functionality is included, show input box and test output/feedback area.

#### Test Identifiers
- data-testid="form1-test-text"
- data-testid="form1-clear-btn"
- data-testid="form1-generate-btn"
- data-testid="form1-return-btn"

---

## 47. Report Test (Sample/Diagnostics Report)

**Route:** `/customers-suppliers/report-test`  
**Purpose:** Generate/preview test or diagnostic reports for customer and supplier data integrity or UI.  
**PRD Reference:** Customer & Supplier Management → Report Test (Sample/Diagnostics Report)  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- Header: "Sample Report Diagnostics"
- Parameter Inputs: (fields to configure mock/sample report)
  - Date Range (date picker — required)
  - Include Customer Data? (Checkbox)
  - Include Supplier Data? (Checkbox)
  - Export Format (Dropdown)

#### Report Preview Area  
- Generated sample data table (randomized/demo view)
- Export, Print (secondary buttons)
- Regenerate Sample Data (secondary)
- Loading state: spinner/skeleton over preview
- Error: banner

#### Validations
- Date Range required.  
  - Error: "Please select a valid date range."
- At least one of "Include Customer"/"Include Supplier" must be checked.
  - Error: "Select at least one data type for report."

#### Test Identifiers
- data-testid="reporttest-daterange"
- data-testid="reporttest-incustomer"
- data-testid="reporttest-insupplier"
- data-testid="reporttest-export-format"
- data-testid="reporttest-generate-btn"
- data-testid="reporttest-preview-table"
- data-testid="reporttest-print-btn"
- data-testid="reporttest-export-btn"
- data-testid="reporttest-regenerate-btn"

---

## 48. CustomerList (Report Screen)

**Route:** `/customers/report`  
**Purpose:** List all customers in a report view with filters, summary statistics, export.  
**PRD Reference:** Customer & Supplier Management → CustomerList (Report Screen)  
**Access Roles:** Standard User, Supervisor, Administrator

### Layout & Structure

- **Header:** "Customer List Report"
- **Filters:** Name, ID, Status, Created Date
- **Report Table:** Paginated, summary row(s) at bottom

#### Filter Fields
- Name (Textbox)
- ID (Textbox)
- Status (Dropdown): [All, Active, Inactive]
- Created Date Range (Datepicker)

#### Table Columns
| Column        | Description                |
|---------------|---------------------------|
| Customer Name |                           |
| Customer ID   |                           |
| Status        | Pill                      |
| Created Date  |                           |
| Region/Area   |                           |
| Contact Person|                           |
| Email         |                           |
| Phone         |                           |
| Action        | View Details (link)       |

#### Actions/Buttons
- Search (primary)
- Reset (secondary)
- Export (sec.)
- Print (sec.)
- View Details (row, `/customers/:id`)

#### States
- Empty state: "No customers found." (info card)
- Error: Banner on failure
- Loading: shimmer/skeleton rows

#### Test Identifiers
- data-testid="cust-report-filter-name"
- data-testid="cust-report-filter-id"
- data-testid="cust-report-filter-status"
- data-testid="cust-report-filter-date"
- data-testid="cust-report-table"
- data-testid="cust-report-row-[id]"
- data-testid="cust-report-export"
- data-testid="cust-report-print"
- data-testid="cust-report-view-detail"

---

## 49. SupplierList (Report Screen)

**Route:** `/suppliers/report`  
**Purpose:** List all suppliers with filters, summary, activity status, export options.  
**PRD Reference:** Customer & Supplier Management → SupplierList (Report Screen)  
**Access Roles:** Standard User, Supervisor, Administrator

### Layout & Structure

- **Header:** "Supplier List Report"
- **Filters:** Name, ID, Status, Category, Created Date
- **Report Table:** Paginated

#### Filter Fields
- Name (Textbox)
- ID (Textbox)
- Status (Dropdown): [All, Active, Inactive]
- Category (Dropdown)
- Created Date Range (Datepicker)

#### Table Columns
| Column         | Description                 |
|----------------|----------------------------|
| Supplier Name  |                            |
| Supplier ID    |                            |
| Status         | Pill                       |
| Category       |                            |
| Created Date   |                            |
| Region/Area    |                            |
| Contact Person |                            |
| Email          |                            |
| Phone          |                            |
| Action         | View Details (link)        |

#### Actions/Buttons
- Search (primary)
- Reset (secondary)
- Export (sec.)
- Print (sec.)
- View Details

#### States
- Empty: Info card "No suppliers found."
- Error: Banner
- Loading: Skeletons

#### Test Identifiers
- data-testid="supp-report-filter-name"
- data-testid="supp-report-filter-id"
- data-testid="supp-report-filter-status"
- data-testid="supp-report-filter-category"
- data-testid="supp-report-filter-date"
- data-testid="supp-report-table"
- data-testid="supp-report-row-[id]"
- data-testid="supp-report-export"
- data-testid="supp-report-print"
- data-testid="supp-report-view-detail"

---

## 50. Attachments

**Route:** `/attachments`  
**Purpose:** Upload, view, manage, organize attachments for transactions/orders.  
**PRD Reference:** Document & Attachment Management → Attachments  
**Access Roles:** Standard user, supervisor, administrator (level varies for upload/delete)

### Layout & Structure

- **Header:** "Attachments"
- **Upload Area:** Click or drag to upload, “+ Add more files” button.
- **Search/Filter Bar:** File name, type, tags, user, date
- **Attachments Table/Card Gallery:** All attachments matching filter

#### Upload Fields
- File Input (multi):  
  - Max size/file/type validation (“Files must be PDF, JPG, PNG, or DOCX. Each up to 10MB.”)
  - Error message below field on failure.
- Tag(s) (Textbox + tag picker, optional)
- Remarks/Description (Textbox, optional)

#### Table/Gallery Columns
| Column            | Description                          |
|-------------------|--------------------------------------|
| Attachment Name   | file name                            |
| Type              | MIME or mapped doc type              |
| Linked Reference  | transaction/order (if any)           |
| Uploaded By       | username                             |
| Date Added        | upload date                          |
| Tags              | list                                 |
| Version           | integer; badge/tooltip if >1         |
| Actions           | View/Download, Delete, Edit, Link    |

#### Actions/Buttons
- Upload (primary)
- Bulk Download (secondary)
- Bulk Delete (secondary, confirm)
- Add/Remove Tag (inline)
- Edit Metadata (modal)
- Delete (row, confirm)
- View/Preview (modal for PDF/image)

#### Validations & States
- Hard validation on file type/size.
- Success confirmation/animation on upload.
- Inline error under file field; toast on total failure.
- Loading: Placeholder gallery.
- Empty: “No attachments uploaded yet.”

#### Test Identifiers
- data-testid="attachments-upload-input"
- data-testid="attachments-upload-btn"
- data-testid="attachments-table"
- data-testid="attachments-card-[attachmentId]"
- data-testid="attachments-bulk-download-btn"
- data-testid="attachments-bulk-delete-btn"
- data-testid="attachments-preview-btn"
- data-testid="attachments-edit-btn"
- data-testid="attachments-delete-btn"
- data-testid="attachments-tag-add"
- data-testid="attachments-tag-remove"
- data-testid="attachments-row-[attachmentId]"

---

## COVERAGE CHECK

| Screen Name                        | Status  |
|-------------------------------------|---------|
| Check Duplicate Contacts            | ✅      |
| Cust Age Wise                       | ✅      |
| Items Help New                      | ✅      |
| Local Porder Search                 | ✅      |
| Menu                                | ✅      |
| Supp Age Wise                       | ✅      |
| Document Help                       | ✅      |
| Main Menu (OLD & Current)           | ✅      |
| Declare Module                      | ✅      |
| DMS Module                          | ✅      |
| Functions                           | ✅      |
| Inventory                           | ✅      |
| Log Module                          | ✅      |
| Main Module                         | ✅      |
| Utility Module                      | ✅      |
| Numto Words                         | ✅      |
| Payroll                             | ✅      |
| Process Status Module               | ✅      |
| Read Offline Message                | ✅      |
| Settings                            | ✅      |
| Form1 (Placeholder/Test Interface)   | ✅      |
| Report Test (Sample/Diagnostics Report)| ✅      |
| CustomerList (Report Screen)        | ✅      |
| SupplierList (Report Screen)        | ✅      |
| Attachments                         | ✅      |

---

# FRONTEND_SPEC.md — Part 3 of 14

---

## 51. Additional Remarks

### Route

`/remarks/:transactionId`  
(can be reached from linked transaction/order screens)

---

### Purpose

Enables users to add, edit, and view additional remarks/comments on specific transactions/orders for recordkeeping or context.

- **PRD Reference:** Document & Attachment Management: Additional Remarks

---

### Access

- Standard User (add/edit own remarks)
- Supervisor (add/edit/delete any remark, view remark history)
- Administrator (full access)

---

### UI Structure

#### Main Card/Panel

- Card background: glassmorphic, level 2 (16px border radius, 18px blur), padding `var(--space-6)`
- Page title: "Additional Remarks"

#### Transaction Context (top section)

- Transaction/Order identifier (bold, large font)
- Key transaction info (type, date, party/client)
- "Back to Transaction" link (top left)

#### Remarks List (main area, scroll, virtualized)

- Table/list columns:
  - Date/Time (left, monospace)
  - Remark Content (main, wraps, supports multi-line, clickable for edit)
  - Entered By (user name, avatar, muted)
  - Last Edited (datetime, tooltip on hover)
  - Actions (edit [pencil icon], delete [trash icon] if allowed; both outlined icons)

- Empty State:  
  - Icon: outline chat bubble  
  - Message: "No additional remarks have been added to this transaction yet."
  
#### Add/Edit Remark Panel

- Form appears as a sliding side drawer (`right:0`, glassmorphic, level 3), or as an expanding section inline

- Fields:
  - **Remark (textarea)**
    - Label: "Remark"
    - Tooltip: 0/500 characters, live count
    - Placeholder: "Add your comment or note (Max 500 characters)"
    - Validation: required, max 500 characters — error shown below
  - Save Button (primary, only one, full-width/at end of form): "Add Remark" or "Update Remark"
  - Cancel Button (secondary/ghost): "Cancel" (closes form)
  
- On edit: fields pre-filled, "Update Remark" on button; on add: empty

---

### Actions Available (PRD-mapped)

- Add remark: `Add Remark` button (`data-testid='remarks-add-btn'`)
- Edit own remark: pencil icon button (`data-testid='remarks-edit-btn'`)
- Delete (own or any, if permitted): trash icon button (`data-testid='remarks-delete-btn'`)
- View full history: always shown for each remark on click/expand (date, user)
- Cancel edit: `Cancel` button (`data-testid='remarks-cancel-btn'`)

---

### Form Validations

- Remark: required.  
  If blank on submit → "Remark is required"
- Max length: 500 characters  
  If exceeded → "Remarks cannot exceed 500 characters"
- Server/API error:  
  - On failed save: show error toast "Could not save remark. Please try again."
  - On delete fail: show error toast "Unable to delete remark."

---

### Loading/Empty States

- Table skeleton: skeleton rows (`data-testid='remarks-list-skeleton'`)
- Add/Edit form: spinner overlay (`data-testid='remarks-form-loading'`)
- Empty state as above

---

### API Error Handling

- Any failure (network or server) shows toast with error (mapped to `color-error`), do not clear inputs.
- On permission/authorization error: show banner in form: "You do not have permission to perform this action." (do not show the action buttons in UI if not allowed)

---

### Test Identifiers

- `remarks-page-title`
- `remarks-trans-id`
- `remarks-remark-table`
- `remarks-add-btn`
- `remarks-edit-btn`
- `remarks-delete-btn`
- `remarks-edit-drawer`
- `remarks-form-loading`
- `remarks-list-skeleton`
- `remarks-empty-state`
- `remarks-cancel-btn`
- `remarks-save-btn`
- `remarks-error-message`
- `remarks-remark-field`
- `remarks-hist-link`
- `remarks-hist-popover`
- `remarks-back-link`
- `remarks-api-error-toast`

---

## 52. Document Entry

### Route

`/documents/entry` or `/documents/:docId/edit`  

- Create new: `/documents/entry`
- Edit existing: `/documents/:docId/edit`

---

### Purpose

Allows creation and management of transaction-related documents, entry of document details, status updates, attachment linking, and version management.

- **PRD Reference:** Document & Attachment Management, Document Entry

---

### Access

- Standard User: create, edit assigned, upload attachments, add comments
- Supervisor: full edit, assign status, link/unlink attachments
- Administrator: all actions, manage workflow/status/templates

---

### UI Structure

#### Main Glass Card/Panel

- Title: "Document Entry"  
- BreadCrumb or "Back to Documents" link

#### Document Info Form

- **Document Type** (select)
  - Label: "Document Type"
  - Required
  - Options: "Order", "Invoice", "Delivery Note", etc. (pulled from document type config or head list)
- **Status** (select)
  - Label: "Status"
  - Required
  - Options: "Draft", "Submitted", "Approved", "Archived", etc.
- **Document Date** (date picker)
  - Label: "Date"
  - Required
  - Default: today (create) / prior value (edit)
- **Transaction Reference** (text or select, searchable)
  - Label: "Linked Transaction"
  - Optional
  - Placeholder: "Order or reference number (optional)"
  - Supports search-as-you-type
- **Remarks/Comments** (textarea)
  - Label: "Remarks"
  - Optional, up to 500 chars
  - Placeholder: "Optional remarks"

#### Attachments Panel

- Shows linked attachments in horizontal scrollable/collapsible panel
- Table columns: File name, Uploaded by, Date, Type, Download, Preview, Unlink action

- **Add Attachment** (icon+button): opens upload dialog, supports multiple files (max size: 25 MB per file, PDF/image/doc only)

#### Version Information (bottom or side)

- "Version: X" + "Last edited by, date"
- "View history" link (popover with previous edits metadata and view versions, modal detail on click)

#### Save/Actions

- Primary: "Save Document" (enabled only if all required fields pass validation)
- Secondary: "Cancel" (returns to list or closes form)
- If editing existing: "Delete Document" (if permitted, confirmation dialog, `danger` color)

---

### Actions Available

- Create document: `Save Document` (`data-testid='docentry-save-btn'`)
- Edit: opens form with existing data (`docentry-edit-btn`)
- Save: (as above)
- Assign status: via Status dropdown, only if permitted
- Link attachments: `Add Attachment` (`docentry-attach-btn`), `Unlink` (icon button)
- View/preview attachment: opens modal/pdf/image preview (`docentry-preview-btn`)
- Print/export: "Print" (calls `/api/documents/:id/print`)
- View version history: (`docentry-version-history-btn`)
- Search fields: search icon in Transaction Reference
- Cancel: `docentry-cancel-btn`

---

### Form Validations

- Document Type: required, error "Document type is required"
- Status: required, error "Document status is required"
- Date: required, error "Document date is required"
- Attachments: drag-and-drop or file select, rejected on duplicate filename or disallowed type/size ("Only PDF, image, or Word files up to 25MB allowed.")
- Remarks: max 500 chars

---

### Loading/Empty States

- Form skeletons while loading/edit mode fetch (`docentry-loading-skeleton`)
- Attachment panel: file skeletons while loading
- No attachments: empty state "No attachments linked"

---

### API Error Handling

- Field-level errors shown under respective fields, server errors as error banner above main form
- Attachment upload failures as toast + error tag on failed row

---

### Test Identifiers

- `docentry-title`
- `docentry-form`
- `docentry-type-field`
- `docentry-status-field`
- `docentry-date-field`
- `docentry-transaction-ref-field`
- `docentry-remarks-field`
- `docentry-attach-panel`
- `docentry-attach-btn`
- `docentry-attach-unlink-btn`
- `docentry-attach-preview-btn`
- `docentry-save-btn`
- `docentry-cancel-btn`
- `docentry-delete-btn`
- `docentry-loading-skeleton`
- `docentry-version-history-btn`
- `docentry-form-error-banner`
- `docentry-api-error-toast`

---

## 53. Document Menu

### Route

`/documents/menu`

---

### Purpose

Centralized navigation and access for all document/attachment/report/management utilities.

- **PRD Reference:** Document & Attachment Management, Document Menu

---

### Access

- All active users (links/actions gated by object-level permission)

---

### UI Structure

#### Menu Card (glassmorphic panel)

- Title: "Document Management"
- Sectioned grid of linked cards or list

#### Menu Sections / Cards

- **Create Document** — Calls `/documents/entry` — (`docmenu-create-btn`)
- **Manage Documents** — List/search, link to document list view — (`docmenu-list-link`)
- **Upload Attachments** — Link to `/documents/attachments` — (`docmenu-upload-link`)
- **View Remark Reports** — Link to `/documents/additional-remarks-report` — (`docmenu-remarks-link`)
- **Head Management** — Link to `/documents/heads` — (`docmenu-head-link`)
- **Export Documents** — Calls `/documents/export` — (`docmenu-export-link`)
- **Templates** — Access standard templates, modals/popovers — (`docmenu-templates-link`)
- **Help/Support** — Contextual help, modal — (`docmenu-help-btn`)
- **Recent Documents** — List of last 5 edited by user (right panel) — (`docmenu-recent-list`)

---

### Actions Available

- Clickable cards or list for each action above (keyboard accessible)
- Tooltip on hover explains each section
- Support keyboard navigation

---

### Loading/Empty States

- Main menu: no links hidden, only those not permitted to current role are visually/aria-disabled (with dimmed color and no action)
- Recent Documents: "No recent documents found" (`docmenu-recent-empty`)

---

### API Error Handling

- Links disabled if backend unavailable (`docmenu-error-banner`)

---

### Test Identifiers

- `docmenu-title`
- `docmenu-create-btn`
- `docmenu-list-link`
- `docmenu-upload-link`
- `docmenu-remarks-link`
- `docmenu-head-link`
- `docmenu-export-link`
- `docmenu-templates-link`
- `docmenu-help-btn`
- `docmenu-recent-list`
- `docmenu-recent-list-item`
- `docmenu-recent-empty`
- `docmenu-error-banner`

---

## 54. Document Head Management

### Route

`/documents/heads`

---

### Purpose

Allows head/metadata/category management for document templates, standardizing document structures.

- **PRD Reference:** Document & Attachment Management, Document Head Management

---

### Access

- Supervisor, Administrator

---

### UI Structure

#### Heads Table/Card

- Title: "Document Headers"
- Toolbar: "Add New Header" (`dochead-add-btn`)
- Table columns:
  - Header Name
  - Category / Type
  - Status (Active/Inactive, pill badge)
  - Used in (Count or doc types)
  - Last Modified (date)
  - Actions (Edit, Delete → only if not in use; all outline icons)

#### Add/Edit Head Modal/Drawer

- Fields:
  - **Header Name**
    - Label: required, max 50 chars
  - **Category/Type**
    - Label: dropdown, required
  - **Status**
    - Toggle (Active / Inactive)
  - Notes/Description (optional, 150 chars)
- "Save" (primary), "Cancel" (secondary)
- Modal/drawer glassmorphic, level 3, with slide/fade, respects prefers-reduced-motion

---

### Actions Available

- Add new: top toolbar (`dochead-add-btn`)
- Edit: table row action (`dochead-edit-btn`)
- Activate/Deactivate: toggle in table or edit form (`dochead-status-pill`)
- Delete: only if not linked/used, confirm dialog
- Assign headers to document types: manage in edit view, multi-select dropdown or chips
- Search/filter: top right search box, filters by category/status

---

### Validations

- Header Name: required, unique, error "Header name is required" or "Header already exists"
- Category: required
- Notes/Description: max 150 chars

---

### Loading/Empty States

- Table: skeleton rows (`dochead-table-skeleton`)
- Modal: spinner overlay if save in progress
- No headers: empty state message (`dochead-empty-state`)

---

### API Error Handling

- Errors shown as toast or error banner above main table
- Forbidden errors shown as permission error banner

---

### Test Identifiers

- `dochead-title`
- `dochead-table`
- `dochead-add-btn`
- `dochead-edit-btn`
- `dochead-delete-btn`
- `dochead-save-btn`
- `dochead-cancel-btn`
- `dochead-status-pill`
- `dochead-category-select`
- `dochead-name-field`
- `dochead-description-field`
- `dochead-modal`
- `dochead-table-skeleton`
- `dochead-empty-state`
- `dochead-api-error-toast`
- `dochead-perm-error-banner`
- `dochead-type-multi-select`

---

## 55. Additional Remarks Reports

### Route

`/documents/additional-remarks-report`

---

### Purpose

Delivers report on all additional remarks, with filters by date, user, and transaction; exportable for audit/compliance.

- **PRD Reference:** Document & Attachment Management, Additional Remarks Reports

---

### Access

- Supervisor, Administrator

---

### UI Structure

#### Report Card (glass, table-centric)

- Title: "Additional Remarks Report"
- Filters row (top):
  - **Date Range**: From / To picker (`report-date-filter`)
  - **User**: Dropdown select (autocomplete/multi) (`report-user-filter`)
  - **Transaction/Order Ref**: Search input (`report-trans-filter`)
  - **Filter/Apply**: (primary action for filter)
  - **Export CSV** (`report-export-btn`), **Export PDF**, **Print**

- Table columns:
  - Date/Time (sortable)
  - Transaction/Order (ID, link to entity)
  - Remark Content
  - User (name, avatar)
  - Last Edited (datetime)
  - Actions (expand for history/details)

- Table supports: column sorting, pagination, and resizable columns
- Empty state: "No additional remarks found for selected criteria" (`report-empty-state`)
- Loading skeleton: Table row placeholders

---

### Actions Available

- Filter: applies criteria, disables while loading
- Export: CSV, PDF, Print (primary only one enabled at once)
- View details: click remark for full context/history modal
- Link to transaction: transaction ID is always a blue underline link to `/orders/:id` or similar

---

### Validations

- Date range: required; error "Please select both start and end date"
- User filter: optional
- Export: disabled when no results

---

### Loading/Empty States

- Skeleton rows, disables all buttons except Cancel
- Empty: as above

---

### API Error Handling

- Errors as page banner or toast

---

### Test Identifiers

- `remarks-report-title`
- `remarks-report-table`
- `remarks-report-filter-date`
- `remarks-report-filter-user`
- `remarks-report-filter-trans`
- `remarks-report-filter-apply`
- `remarks-report-export-btn`
- `remarks-report-empty-state`
- `remarks-report-table-skeleton`
- `remarks-report-details-btn`
- `remarks-report-details-modal`
- `remarks-report-api-error-toast`

---

## 56. Service Estimation Entry

### Route

`/jobs/estimation-entry` or `/jobs/estimation/:estimationId/edit`

---

### Purpose

Allows users to create a detailed estimation for a job/service request before work order approval.

- **PRD Reference:** Job, Work Order & Estimation Management, Service Estimation Entry

---

### Access

- Standard User (create for assigned customers/jobs), Supervisor (review/edit), Administrator (override)

---

### UI Structure

#### Card/Form Layout (glassmorphic level 2)

- Title: "Service Estimation Entry"
- Breadcrumb or "Back to Estimations" link

#### Fields

- **Customer** (searchable select)
  - Label: "Customer"
  - Required
  - Search: typeahead
- **Vehicle** (dependent select, loads after Customer chosen)
  - Label: "Vehicle"
  - Required, disabled if no customer
- **Description** (textarea)
  - Label: "Service Description"
  - Required, 80–500 chars
  - Placeholder: "Describe the requested work"
- **Estimation Date** (date picker)
  - Label: "Date"
  - Required, default: today
- **Estimated Items/Labour** (dynamic table/list — must have at least one row)
  - Column headers:
    - Item/Service (select/search)
    - Description (input)
    - Quantity (number, min 1)
    - Unit Price (number, >0)
    - Labour Amount (number, >=0)
    - Amount (calc, read-only: qty * unit price + labour)
    - Actions: Remove row (trash icon, outline; can't remove only row left)

  - "Add Item" button (secondary, always below table), always at least one row

- **Total Gross Amount** (auto calculated, read-only)
- **Notes** (textarea, optional, max 250 chars)

#### Actions

- Primary: "Submit Estimation" (`estimationentry-submit-btn`)
- Secondary: "Save Draft" (if allowed, stores locally and disables only if required fields are empty)
- "Cancel" or "Back" (returns to previous/est list)
- On edit: "Update Estimation"
- If creating: "Create New Estimation"

---

### Interactions

- Quantity/price/labour inputs update Amount and Total live
- Row-level validation: qty > 0, unit price > 0
- Cannot submit unless all required fields/rows valid

---

### Validations

- Customer/Vehicle: required
- Description: required, min 80/max 500 chars
- At least one item row
- Item/Service: required per row
- Quantity/unit price/labour: must be positive
- All errors inline below field/input ("Quantity must be greater than 0")
- On submit fail: error banner over form

---

### Loading/Empty States

- Skeleton form if loading estimation data
- Table rows: hollow skeletons on loading
- Save button shows spinner while saving

---

### API Error Handling

- Server validation errors shown inline
- Optimistic update for draft save, but revert UI if server/network fails

---

### Test Identifiers

- `estimationentry-title`
- `estimationentry-form`
- `estimationentry-customer-field`
- `estimationentry-vehicle-field`
- `estimationentry-description-field`
- `estimationentry-date-field`
- `estimationentry-items-table`
- `estimationentry-item-row`
- `estimationentry-item-add-btn`
- `estimationentry-notes-field`
- `estimationentry-submit-btn`
- `estimationentry-cancel-btn`
- `estimationentry-save-draft-btn`
- `estimationentry-error-banner`
- `estimationentry-loading-skeleton`
- `estimationentry-api-error-toast`

---

## 57. Estimation Approval

### Route

`/jobs/estimation-approval`  
Optional: `/jobs/estimation/:estimationId/approval`

---

### Purpose

Supervisors/administrators approve, reject, or return submitted job/service estimations with comments.

- **PRD Reference:** Job, Work Order & Estimation Management, Estimation Approval

---

### Access

- Supervisor, Administrator

---

### UI Structure

#### Panel layout

- Title: "Estimation Approval"
- Estimation summary bar: customer, vehicle, estimation date, reference, status
- Item/labour table (as in entry, read-only)
- Total, gross, notes

##### Approval form fields (near bottom or side):

- **Decision:** required radio group: Approve / Reject / Needs Revision
- **Comment (textarea):** required if Reject or Revision; optional on Approve; min 16/max 250 chars
- **Assign Job (optional, visible if Approve selected)**: select staff/advisor (search), optional

---

### Actions Available

- Primary: "Approve" (`estapproval-approve-btn`)  
- Secondary: "Reject" (`estapproval-reject-btn`)  
- "Return for Revision" (`estapproval-revision-btn`)
- "Cancel" (secondary ghost)

---

### Validations

- Must select an action
- Comment required for Reject/Revision; error: "Comment is required to reject or request revision"
- No action on server/network fail: revert button and show error toast/banner

---

### Loading/Empty States

- Estimation skeletons while loading
- Approval area disabled until data loads

---

### API Error Handling

- Banner above form on API/server error

---

### Test Identifiers

- `estapproval-title`
- `estapproval-summary-bar`
- `estapproval-items-table`
- `estapproval-decision-radio`
- `estapproval-comment-field`
- `estapproval-assign-staff-field`
- `estapproval-approve-btn`
- `estapproval-reject-btn`
- `estapproval-revision-btn`
- `estapproval-cancel-btn`
- `estapproval-api-error-toast`
- `estapproval-loading-skeleton`

---

## 58. Job Order Status

### Route

`/jobs/orders/status`  

---

### Purpose

Overview/status update interface for all job/work orders.

- **PRD Reference:** Job, Work Order & Estimation Management, Job Order Status

---

### Access

- Standard User, Supervisor, Administrator

---

### UI Structure

#### Search/Filter Bar

- Quick search: Job/order #, Customer (auto-complete), Date range (from/to picker), Status (select dropdown)

#### Table columns

- Job/Order Ref (ID, link to job detail)
- Created Date
- Customer Name (with avatar/initials)
- Vehicle Info (plate/make/model)
- Assigned Staff/Advisor (badge, name)
- Status (color badge, editable by permitted users: status pill clickable, opens status popover)
- Last Updated (datetime)
- Actions: View (always), Update Status (pencil/arrow up, if allowed)

#### Panel details (on row expand or right-side drawer)

- Shows full job details, notes, progress, assigned staff, all status history (timeline list: status, user, date)

---

### Actions Available

- Update Status: opens popover/modal with allowed statuses (`joborderstatus-update-btn`), only if permitted
- View job: detail link (`joborderstatus-view-btn`)
- Search/filter: applies instantly as changed or via "Apply Filter" button
- Export: "Export to CSV/PDF/XLSX" (`joborderstatus-export-btn`)
- Print (primary only visible in expanded job view)

---

### Validations

- Status update: only from allowed status list, cannot assign same as current
- "You do not have permission to update status" — disables button
- API errors: error toast/banner

---

### Loading/Empty States

- Table skeleton while loading
- No jobs: "No jobs/orders found for selected filters"

---

### Test Identifiers

- `joborderstatus-title`
- `joborderstatus-search-field`
- `joborderstatus-filter-status`
- `joborderstatus-table`
- `joborderstatus-table-skeleton`
- `joborderstatus-status-badge`
- `joborderstatus-update-btn`
- `joborderstatus-view-btn`
- `joborderstatus-details-drawer`
- `joborderstatus-status-history-list`
- `joborderstatus-export-btn`
- `joborderstatus-print-btn`
- `joborderstatus-empty-state`
- `joborderstatus-api-error-toast`

---

## 59. Job Status Master

### Route

`/jobs/job-status-master`

---

### Purpose

Administers the master list of available job status definitions ("Pending", "In Progress", "Completed", etc.)

- **PRD Reference:** Job, Work Order & Estimation Management, Job Status Master

---

### Access

- Administrator (full), Supervisor (read/view only or edit per policy)

---

### UI Structure

#### Table

- Columns:
  - Status Name (text)
  - Status Code (unique, up to 12 chars)
  - Description (full description, 80 chars)
  - Active (yes/no, toggle pill)
  - Is "Finished" status (checkbox/badge)
  - Is "Parts Not Available" (badge)
  - Is "In Progress" (badge)
  - Sort Order (number, draggable or arrows)
  - Actions: Edit (pencil icon), Deactivate/Activate (toggle), Delete (trash icon, only if not in use)

#### Add/Edit Modal

- Fields:
  - Status Name (required)
  - Status Code (required, alphanum, unique)
  - Description (required)
  - Is Finished Status (checkbox)
  - Is Parts Not Available (checkbox)
  - Is In Progress (checkbox)
  - Sort Order (number, required, min 1)

- "Save", "Cancel" buttons, primary only one per form

---

### Actions Available

- Add new status (`jobstatusmaster-add-btn`)
- Edit status (`jobstatusmaster-edit-btn`)
- Activate/Deactivate (`jobstatusmaster-status-toggle-btn`)
- Change sort order (inline arrows/draggable rows, only one at a time)
- Delete: only if not assigned/used; confirmation modal

---

### Validations

- All fields required except checkboxes
- Status name/code: unique ("Status name/code already exists" if duplicate)
- API error: error toast

---

### Loading/Empty States

- Table skeleton, disables all row actions while loading
- Empty: "No statuses defined"

---

### Test Identifiers

- `jobstatusmaster-title`
- `jobstatusmaster-table`
- `jobstatusmaster-add-btn`
- `jobstatusmaster-edit-btn`
- `jobstatusmaster-status-toggle-btn`
- `jobstatusmaster-delete-btn`
- `jobstatusmaster-sort-arrows`
- `jobstatusmaster-modal`
- `jobstatusmaster-save-btn`
- `jobstatusmaster-cancel-btn`
- `jobstatusmaster-table-skeleton`
- `jobstatusmaster-empty-state`
- `jobstatusmaster-api-error-toast`

---

## 60. Job Status Help

### Route

`/jobs/job-status-help`

---

### Purpose

Reference for all job status values, assisting users in selecting proper status when updating job orders.

- **PRD Reference:** Job, Work Order & Estimation Management, Job Status Help

---

### Access

- All users

---

### UI Structure

#### Searchable List / Table

- Search bar: filter by status name/code/description
- Table/Table-like list:
  - Status Name
  - Code
  - Description
  - When to Use (tips, if present)
  - Is Active (pill)
- Option: "Copy Status Name" (icon button per row for clipboard)

#### Print/Export

- Print button: "Print Help" (`jobstatushelp-print-btn`)
- Export: CSV/PDF

---

### Actions Available

- Search/filter
- Print/export
- Copy status name (for status update elsewhere)

---

### Loading/Empty States

- Skeleton table or "No statuses found"

---

### Test Identifiers

- `jobstatushelp-title`
- `jobstatushelp-table`
- `jobstatushelp-search-field`
- `jobstatushelp-print-btn`
- `jobstatushelp-export-btn`
- `jobstatushelp-copy-btn`
- `jobstatushelp-table-skeleton`
- `jobstatushelp-empty-state`

---

## 61. Work Status

### Route

`/jobs/work-status`

---

### Purpose

Allows viewing, filtering, and updating in-progress/completed jobs and assigned staff.

- **PRD Reference:** Job, Work Order & Estimation Management, Work Status

---

### Access

- Standard User (view own/assigned jobs), Supervisor (view and update), Administrator (all team jobs)

---

### UI Structure

#### Filter Row

- Quick filters:
  - Status (In Progress, Completed, All)
  - Assigned staff (dropdown or multi-select)
  - Date range (from/to)
  - Job/Order # (search)

#### Job List Table

- Table columns:
  - Job/Order # (link)
  - Customer Name
  - Vehicle Info
  - Assigned Staff (avatar+name)
  - Status (badge)
  - Progress (e.g., 0–100%)
  - Start Date
  - Estimated Completion
  - Last Updated
  - Actions: Update Status, View Details

#### Details Drawer (on expand/click row)

- Job history timeline: status, changed by, timestamp
- Update Progress: input for %/notes (if permitted)
- Mark Complete: button, if allowed (`workstatus-markcomplete-btn`)

---

### Actions Available

- Update Status/Progress (for own jobs, or if supervisor)
- Assign job to staff (if role permitted)
- Mark as Completed (digital signature if required — brings up modal for signature input)

---

### Validations

- Cannot mark as completed if not allowed (see PRD: BR-46/Pending Job Cards)

---

### Loading/Empty States

- Table skeleton loading, disables actions until loaded
- No jobs message

---

### Test Identifiers

- `workstatus-title`
- `workstatus-filter-status`
- `workstatus-table`
- `workstatus-table-skeleton`
- `workstatus-update-progress-btn`
- `workstatus-assigned-staff-field`
- `workstatus-details-drawer`
- `workstatus-status-history-list`
- `workstatus-markcomplete-btn`
- `workstatus-digital-sign-btn`
- `workstatus-empty-state`
- `workstatus-api-error-toast`

---

## 62. Work Status Management

### Route

`/jobs/work-status-management`

---

### Purpose

Up-to-date interface for staff and supervisors to review, update, assign, and batch-edit job statuses/assignments.

- **PRD Reference:** Job, Work Order & Estimation Management, Work Status Management

---

### Access

- Supervisor (main), Administrator

---

### UI Structure

#### Main Table

- Columns:
  - Job/Order #
  - Customer / Project
  - Staff Assigned (multi)
  - Current Status (badge/dropdown for bulk)
  - Batch selection (checkbox)
  - Updated At
  - Actions: Edit, Assign/Reassign (dialog), Bulk Update (`workstatusmgmt-bulkupdate-btn`)

#### Toolbar/Batch Operations

- "Assign Staff" (opens assignment modal)
- "Update Status" (opens modal with status options, applies to all selected)
- "Export" (CSV/PDF)
- "Reload/Refresh"

#### Side/Row Detail

- Expand: shows full job detail, progress, list of all assignments/updates

---

### Actions Available

- Batch status update (multi-select, apply to all)
- Batch assignment (multi-select + staff select)
- Individual edit actions as in Work Status
- Export

---

### Validations

- At least one job selected for batch actions — disable otherwise
- Batch update actions disabled if user lacks permission for any selected job

---

### Loading/Empty States

- Table skeleton, disables batch actions while working
- No jobs listed message

---

### Test Identifiers

- `workstatusmgmt-title`
- `workstatusmgmt-table`
- `workstatusmgmt-table-skeleton`
- `workstatusmgmt-bulk-select`
- `workstatusmgmt-assign-btn`
- `workstatusmgmt-batchupdate-btn`
- `workstatusmgmt-export-btn`
- `workstatusmgmt-detail-drawer`
- `workstatusmgmt-api-error-toast`

---

## 63. Work Status Report

### Route

`/jobs/work-status-report`

---

### Purpose

Generates summary/detailed reports of job/work statuses for a selected period or staff.

- **PRD Reference:** Job, Work Order & Estimation Management, Work Status Report

---

### Access

- Supervisor, Administrator

---

### UI Structure

#### Report Filters

- Date Range (from/to, required)
- Assigned Staff/Advisor (multi-select)
- Status Filter (multi, from defined status values)
- Export buttons (PDF, XLSX), Print

#### Table columns

- Job/Order #
- Customer
- Assigned Staff
- Status (badge)
- Start/End Date
- Duration (calc)
- Completion %
- Actions: View Details

#### Detail Drawer/Modal

- Opens full job/work stats, history, notes

---

### Actions Available

- Apply filter ("Update Report" btn)
- Export/Print
- Expand details

---

### Validations

- Date range required ("Please select a date range" if missing)

---

### Loading/Empty States

- Table skeleton
- Empty: "No work/jobs found"

---

### Test Identifiers

- `workstatusreport-title`
- `workstatusreport-filter-date`
- `workstatusreport-filter-staff`
- `workstatusreport-filter-status`
- `workstatusreport-apply-btn`
- `workstatusreport-table`
- `workstatusreport-table-skeleton`
- `workstatusreport-detail-drawer`
- `workstatusreport-export-btn`
- `workstatusreport-print-btn`
- `workstatusreport-empty-state`

---

## 64. Pending Job Card Help

### Route

`/jobs/pending-jobcard-help`

---

### Purpose

Assists in identifying and completing jobs with pending/incomplete job cards.

- **PRD Reference:** Job, Work Order & Estimation Management, Pending Job Card Help

---

### Access

- Standard User, Supervisor

---

### UI Structure

#### List/Table

- Columns
  - Job/Order #
  - Customer
  - Vehicle
  - Missing Info (badge: e.g., "No Estimation", "No Parts Req")
  - Assigned Staff
  - Status
  - Mark as Completed (button per row if allowed)

#### Empty State

- "All job cards are complete or no pending jobs found"

---

### Actions Available

- Mark Complete (calls confirm, disables if requirements not met)
- View job (link)

---

### Validations

- Only jobs with all required info can be completed; error: "Cannot complete; missing estimation/part info/etc."

---

### Loading/Empty States

- Table skeleton
- Empty: above

---

### Test Identifiers

- `pendingjobcard-title`
- `pendingjobcard-table`
- `pendingjobcard-table-skeleton`
- `pendingjobcard-markcomplete-btn`
- `pendingjobcard-view-btn`
- `pendingjobcard-empty-state`
- `pendingjobcard-error-msg`

---

## 65. Job Status Advisor Wise (Report)

### Route

`/jobs/status-advisorwise-report`

---

### Purpose

Displays job statuses grouped by assigned advisor/staff for workload and progress insights.

- **PRD Reference:** Job, Work Order & Estimation Management, Job Status Advisor Wise

---

### Access

- Supervisor, Administrator

---

### UI Structure

#### Filters bar

- Date range
- Advisor/staff select

#### Grouped Table

- Advisor/Staff (section header)
  - For each job:
    - Job/Order #
    - Customer
    - Vehicle
    - Status (badge)
    - Last Update
    - Duration/age
    - Actions: view detail

#### Empty State

- "No jobs found for this advisor in selected period"

---

### Actions Available

- Filter/apply
- Export (grouped CSV/PDF)
- Expand group (collapse/expand all)

---

### Loading/Empty States

- Table/group sections skeletons
- Empty: above

---

### Test Identifiers

- `statusadvisorwise-title`
- `statusadvisorwise-table`
- `statusadvisorwise-filter-date`
- `statusadvisorwise-filter-staff`
- `statusadvisorwise-export-btn`
- `statusadvisorwise-detail-btn`
- `statusadvisorwise-table-skeleton`
- `statusadvisorwise-empty-state`

---

## 66. Work Status Report (rptWorkStatus)

### Route

`/jobs/rpt-work-status`

---

### Purpose

Comprehensive, filterable, exportable list of current work/job statuses.

- **PRD Reference:** Job, Work Order & Estimation Management, rptWorkStatus

---

### Access

- Supervisor

---

### UI Structure

#### Report Filters

- Status(es), multi-select
- Date range (calendar)
- Staff/Advisor (multi)
- Export/print

#### Table columns

- Job/Order # (link)
- Customer
- Staff
- Status (badge)
- Progress (%)
- Assigned Date
- Notes
- Actions: view detail

---

### Actions Available

- Filter/apply/report update (`rptworkstatus-apply-btn`)
- Export/print report
- Expand job details

---

### Loading/Empty States

- Table skeleton
- Empty: "No work status records found"

---

### Test Identifiers

- `rptworkstatus-title`
- `rptworkstatus-filter-status`
- `rptworkstatus-filter-date`
- `rptworkstatus-filter-staff`
- `rptworkstatus-apply-btn`
- `rptworkstatus-table`
- `rptworkstatus-export-btn`
- `rptworkstatus-print-btn`
- `rptworkstatus-table-skeleton`
- `rptworkstatus-empty-state`

---

## 67. Work Status Summary Report (rptWorkStatusSummary)

### Route

`/jobs/rpt-work-status-summary`

---

### Purpose

Summarizes work/job statuses by status group, advisor, date, or other dimension for management review.

- **PRD Reference:** Job, Work Order & Estimation Management, rptWorkStatusSummary

---

### Access

- Supervisor, Administrator

---

### UI Structure

#### Filter bar

- Date range
- Staff/Advisor (multi)
- Status group (multi)
- "Generate Report" button

#### Table/Summary

- Group by:
  - Status (row)
    - Count
    - % of total
  - By advisor (if applied)
- Chart view: simple bar or donut (count per status)
- Table columns
  - Status
  - Count
  - % of total
  - Average Duration

---

### Actions Available

- Filter/apply
- Show/hide chart
- Export summary
- Print

---

### Loading/Empty States

- Table/chart skeleton
- Empty: "No data for selected group"

---

### Test Identifiers

- `rptworkstatussummary-title`
- `rptworkstatussummary-filter-date`
- `rptworkstatussummary-filter-staff`
- `rptworkstatussummary-filter-status`
- `rptworkstatussummary-apply-btn`
- `rptworkstatussummary-table`
- `rptworkstatussummary-chart-toggle`
- `rptworkstatussummary-export-btn`
- `rptworkstatussummary-print-btn`
- `rptworkstatussummary-table-skeleton`
- `rptworkstatussummary-empty-state`

---

## 68. Work In Progress Report (work_In_Progress)

### Route

`/jobs/work-in-progress-report`

---

### Purpose

Highlights all jobs currently marked as "in progress" for operational and management decision-making.

- **PRD Reference:** Job, Work Order & Estimation Management, work_In_Progress

---

### Access

- Supervisor, Administrator

---

### UI Structure

#### Table

- Columns:
  - Job/Order #
  - Advisor/Staff
  - Customer
  - Vehicle
  - Status (badge)
  - Start Date
  - Estimated Completion
  - Overdue? (badge — red/yellow)
  - Notes
  - Actions: View, Update

#### Filters

- Date range
- Staff (multi)
- Overdue only (toggle)

---

### Actions Available

- Filter/apply
- Export/print
- View job details

---

### Loading/Empty States

- Table skeleton
- Empty: "No in-progress jobs found"

---

### Test Identifiers

- `workinprogressreport-title`
- `workinprogressreport-table`
- `workinprogressreport-filter-date`
- `workinprogressreport-filter-staff`
- `workinprogressreport-filter-overdue`
- `workinprogressreport-export-btn`
- `workinprogressreport-print-btn`
- `workinprogressreport-table-skeleton`
- `workinprogressreport-empty-state`

---

## 69. Sales Order Entry

### Route

`/sales/orders/entry` or `/sales/orders/:orderId/edit`

---

### Purpose

Create and update customer sales orders, including products, quantities, and pricing.

- **PRD Reference:** Order & Sales Management, Sales Order Entry

---

### Access

- Sales staff (create, update before fulfillment), Supervisor (review/edit), Administrator (full)

---

### UI Structure

#### Order Info Form (Card / Split grid)

- **Customer (select+search)**
  - Label: required
  - On change, loads customer contact and history panel
- **Order Date:** (default today, can set in past, required)
- **Order Status:** select (required, disables if delivered)
- **Product List (table)**
  - Columns:
    - Product/Part (select, filtered by inventory)
    - Description (optional, editable)
    - Quantity (number, min 1, required)
    - Unit Price (auto or editable, >0)
    - Discount (optional, %)
    - Amount (calc, auto)
    - Actions: Remove (icon, only if >1 row)
  - "Add Product" (button)
- **Order Total** (auto calc: subtotal, discount, tax, order total, read-only)
- **Notes** (optional)
- **Attachments**: Add/read/preview

#### Actions

- Primary: "Submit Order" (enabled when all required fields pass)
- Secondary: "Save as Draft"
- "Cancel" or "Back"

---

### Validations

- Customer/order date/order status required
- All product rows: product/qty/unit price required, qty > 0, price > 0
- Duplicate products forbidden (error: "Product already in order")
- Total cannot be negative
- Errors always inline and beside field

---

### Loading/Empty States

- Form skeleton on first load
- Table row skeletons
- Add/save button loading spinner

---

### API Error Handling

- Server errors: show error banner above form

---

### Test Identifiers

- `salesorderentry-title`
- `salesorderentry-form`
- `salesorderentry-customer-field`
- `salesorderentry-date-field`
- `salesorderentry-status-field`
- `salesorderentry-product-table`
- `salesorderentry-product-add-btn`
- `salesorderentry-product-row`
- `salesorderentry-amount-summary`
- `salesorderentry-notes-field`
- `salesorderentry-attach-panel`
- `salesorderentry-submit-btn`
- `salesorderentry-cancel-btn`
- `salesorderentry-save-draft-btn`
- `salesorderentry-loading-skeleton`
- `salesorderentry-api-error-toast`
- `salesorderentry-field-error`

---

## 70. Sales Order Help

### Route

`/sales/orders/help`

---

### Purpose

Provides guided assistance for sales order entry, search, and best practices.

- **PRD Reference:** Order & Sales Management, Sales Order Help

---

### Access

- All sales staff and supervisors

---

### UI Structure

#### Help Card

- Search bar: order #, customer, status
- FAQ/Guidance: step-by-step guidance in left sidebar or expandable sections (accordion)
- Order search result list/table matching search fields

Table Columns:
- Order #
- Customer
- Order Date
- Status
- Amount
- Actions: View details, Copy Order # (icon button)

---

### Actions Available

- Search/filter orders
- Expand/collapse help topics (`sohelp-faq-section`)
- Copy order # to clipboard (`sohelp-copy-btn`)
- View order details (links to main order view)

---

### Loading/Empty States

- Skeleton for FAQ/help, result table
- No match: "No orders found"

---

### Test Identifiers

- `sohelp-title`
- `sohelp-search-field`
- `sohelp-faq-section`
- `sohelp-table`
- `sohelp-view-btn`
- `sohelp-copy-btn`
- `sohelp-empty-state`
- `sohelp-table-skeleton`

---

## 71. Order Status

### Route

`/sales/orders/status`

---

### Purpose

View and manage the current status of placed sales orders.

- **PRD Reference:** Order & Sales Management, Order Status

---

### Access

- Sales staff, Supervisor, Administrator

---

### UI Structure

#### Search/filter row

- Order #
- Customer
- Status (multi select)
- Date range

#### Table columns

- Order #
- Customer
- Date
- Status (pill, editable with status popover if allowed)
- Amount
- Actions: View Details, Update Status

#### Timeline detail (row expand)

- Status history: badge, timestamp, user

---

### Actions Available

- Update status (pencil icon, status popover), only when permitted
- View order details
- Filter/search
- Export

---

### Validations

- Cannot set status to same value
- No updates if delivered/cancelled; controls hidden/disabled

---

### Loading/Empty States

- Table skeleton; timeline skeleton on expand

---

### Test Identifiers

- `orderstatus-title`
- `orderstatus-search-field`
- `orderstatus-filter-status`
- `orderstatus-table`
- `orderstatus-table-skeleton`
- `orderstatus-status-badge`
- `orderstatus-update-btn`
- `orderstatus-detail-btn`
- `orderstatus-details-timeline`
- `orderstatus-export-btn`
- `orderstatus-empty-state`

---

## 72. Pending Orders List

### Route

`/sales/orders/pending`

---

### Purpose

View/list of all sales orders that are not yet fulfilled.

- **PRD Reference:** Order & Sales Management, Pending Orders List

---

### Access

- Sales staff, Supervisor, Administrator

---

### UI Structure

#### Table

- Columns:
  - Order #
  - Customer
  - Order Date
  - Status (pending/cancelled/confirmed, badge)
  - Expected Delivery
  - Amount
  - Actions: View, Print (document icon, opens printable view)

#### Filter bar

- Customer
- Date range
- Status

---

### Actions Available

- Sort / filter
- Print pending/selected order (`pendingorders-print-btn`)
- View details

---

### Loading/Empty States

- Table skeleton
- Empty: "No pending orders"

---

### Test Identifiers

- `pendingorders-title`
- `pendingorders-table`
- `pendingorders-filter-customer`
- `pendingorders-filter-date`
- `pendingorders-filter-status`
- `pendingorders-table-skeleton`
- `pendingorders-print-btn`
- `pendingorders-view-btn`
- `pendingorders-empty-state`

---

## 73. Delivery Log

### Route

`/sales/delivery/log`

---

### Purpose

Maintains a searchable, exportable record of all delivered sales orders.

- **PRD Reference:** Order & Sales Management, Delivery Log

---

### Access

- Sales staff, Supervisor, Administrator

---

### UI Structure

#### Delivery Log Table

- Columns:
  - Delivery Note #
  - Order #
  - Customer
  - Delivered By
  - Delivery Date/Time
  - Status (delivered/cancelled, color badge)
  - Recipient
  - Actions: View Details, Print

#### Filter bar

- Delivery date range
- Customer
- Delivered by (select)

---

### Actions Available

- Search/filter/log print/export (`deliverylog-export-btn`)
- View details

---

### Loading/Empty States

- Table skeleton
- Empty: "No deliveries found"

---

### Test Identifiers

- `deliverylog-title`
- `deliverylog-table`
- `deliverylog-filter-customer`
- `deliverylog-filter-date`
- `deliverylog-filter-staff`
- `deliverylog-table-skeleton`
- `deliverylog-print-btn`
- `deliverylog-view-btn`
- `deliverylog-export-btn`
- `deliverylog-empty-state`

---

## 74. Delivery Note Entry

### Route

`/sales/delivery-note/entry` or `/sales/delivery-note/:noteId/edit`

---

### Purpose

Create/manage delivery notes (DN) for completed sales orders, printable and digitally logged.

- **PRD Reference:** Order & Sales Management, Delivery Note Entry

---

### Access

- Sales staff, Supervisor, Administrator

---

### UI Structure

#### Delivery Note Form

- **Order Reference:** select (orders completed but not yet delivered)
  - Required
  - Shows summary (customer, items)
- **Customer Name:** auto from order
- **Delivery Date/Time:** default now, editable
- **Delivered By:** staff select, required, prefilled as self if possible
- **Recipient Name:** text, required
- **Products Delivered:** table from order, qty auto, editable if partial allowed by policy
- **Remarks:** optional
- **Signature (digital):** if required, modal input with signature pad (touch/mouse)
- **Attachments:** optional (delivery doc, etc)

#### Actions

- Save/confirm (primary, `deliverynote-save-btn`)
- Print Delivery Note (opens print-friendly modal, disables Save if unsaved)
- Cancel

---

### Validations

- Delivery date/time required
- Delivered by/recipient required
- Cannot deliver > ordered qty; forbids if nonpartial deliveries are enforced
- Signature required if enabled

---

### Loading/Empty States

- Form skeleton
- Table skeleton for products
- Digital signature pad in modal, skeleton overlay while loading

---

### API Error Handling

- Error banners, disables Print

---

### Test Identifiers

- `deliverynote-title`
- `deliverynote-form`
- `deliverynote-order-ref-field`
- `deliverynote-customer-field`
- `deliverynote-date-field`
- `deliverynote-deliveredby-field`
- `deliverynote-recipient-field`
- `deliverynote-products-table`
- `deliverynote-remarks-field`
- `deliverynote-signature-field`
- `deliverynote-save-btn`
- `deliverynote-print-btn`
- `deliverynote-cancel-btn`
- `deliverynote-form-skeleton`
- `deliverynote-api-error-toast`

---

## 75. Change Order Customer

### Route

`/sales/orders/:orderId/change-customer`

---

### Purpose

Allows authorized users to correct/update the customer attached to an existing sales order.

- **PRD Reference:** Order & Sales Management, Change Order Customer

---

### Access

- Supervisor, Administrator

---

### UI Structure

#### Panel/Card

- Title: "Change Order Customer"
- Shows: current order #, current customer (details), linked products, status

#### Form

- **New Customer** (required select+search, disables current)
  - Label: "New Customer"
- **Change Reason** (required textarea, min 16 chars, extra for audit)
  - Label: "Reason for Change"
  - Max 255 chars
- **Confirm Button** (primary): "Update Customer"
- **Cancel** (secondary): back

---

### Actions Available

- Search/select new customer (`changecust-newcust-field`)
- Enter reason (`changecust-reason-field`)
- Confirm (`changecust-update-btn`)
- Cancel (`changecust-cancel-btn`)

---

### Validations

- Cannot set same as current customer; error message
- Reason required, min 16/max 255 chars
- No Save if required fields not present

---

### Loading/Empty States

- Form skeleton if loading
- Error: disables Save, shows banner

---

### API Error Handling

- Errors as form banner and toast

---

### Test Identifiers

- `changecust-title`
- `changecust-currentcust-field`
- `changecust-newcust-field`
- `changecust-reason-field`
- `changecust-update-btn`
- `changecust-cancel-btn`
- `changecust-form-skeleton`
- `changecust-api-error-toast`
- `changecust-form-error-banner`

---

## COVERAGE CHECK

| Screen Name                                 | Status   |
|----------------------------------------------|----------|
| Additional Remarks                          | ✅ covered |
| Document Entry                              | ✅ covered |
| Document Menu                               | ✅ covered |
| Document Head Management                    | ✅ covered |
| Additional Remarks Reports                  | ✅ covered |
| Service Estimation Entry                    | ✅ covered |
| Estimation Approval                         | ✅ covered |
| Job Order Status                            | ✅ covered |
| Job Status Master                           | ✅ covered |
| Job Status Help                             | ✅ covered |
| Work Status                                 | ✅ covered |
| Work Status Management                      | ✅ covered |
| Work Status Report                          | ✅ covered |
| Pending Job Card Help                       | ✅ covered |
| Job Status Advisor Wise (Report)            | ✅ covered |
| Work Status Report (rptWorkStatus)          | ✅ covered |
| Work Status Summary Report (rptWorkStatusSummary) | ✅ covered |
| Work In Progress Report (work_In_Progress)  | ✅ covered |
| Sales Order Entry                           | ✅ covered |
| Sales Order Help                            | ✅ covered |
| Order Status                                | ✅ covered |
| Pending Orders List                         | ✅ covered |
| Delivery Log                                | ✅ covered |
| Delivery Note Entry                         | ✅ covered |
| Change Order Customer                       | ✅ covered |

---

# FRONTEND_SPEC.md  
**Integrated Business Operations Suite**  
**Frontend Specification – Part 4 of 14**  
_Covers screens 76–100 as enumerated. Each specification is complete and implementation-ready as per PRD and UI Design System._

---

## 76. Sales Order Report

**Route:** `/orders/sales-report`  
**Purpose:** View, filter, print, and export a summary report of sales orders with all key attributes.  
**PRD Reference:** "Sales Order Report"; FR-138, FR-139, FR-152, FR-157, FR-160  
**Access Roles:** Sales Staff, Sales Supervisor, Administrator

### Layout & Structure

- Glassmorphic top section holding filter controls
- Table view within a glass card surface
- Export/Print controls top-right
- Pagination at table bottom
- All content areas use background: `var(--color-bg-card)` and encase in glassmorphic container (see design system)
  
### Filter Controls (Glass Panel)

- **Date Range**  
  - Label: "Order Date Range"
  - Type: Date picker (start/end)
  - Required: No
  - Default: Last 30 days
  - Validation: "Start date cannot be after end date"
  
- **Customer**  
  - Label: "Customer"
  - Type: Combo search dropdown (starts searching after 2 characters)
  - Required: No

- **Order Status**  
  - Label: "Status"
  - Type: Select  
  - Options: "All", "Pending", "Completed", "With Issues", "Cancelled", "In Progress"  
  - Default: "All"

- **Order #**  
  - Label: "Order Number"
  - Type: Text input  
  - Placeholder: "e.g. SO-4272"
  - Required: No

- **Primary action button:**  
  - Label: "Run Report"
  - Style: Primary (brand color)
  - data-testid=`salesorderreport-filters-runreport`
  - Only enabled when filters are valid

- **Icons:** All filter controls use `lucide` outline icons (calendar, user, search, etc.).

### Table Columns

| Column                | Key         | Type      | TestID Suffix       |
|-----------------------|-------------|-----------|---------------------|
| Order #               | orderNo     | Text      | orderno             |
| Date                  | orderDate   | Date      | orderdate           |
| Customer              | customer    | Text      | customer            |
| Status                | status      | Pill      | status              |
| Total                 | total       | Currency  | total               |
| Entered By            | createdBy   | Text      | createdby           |
| Last Edited By        | editedBy    | Text      | editedby            |
| Last Edited Date      | editedDate  | DateTime  | editeddate          |

**Table Properties/adornment:**
- Status column uses colored pill (see status color in UI design system)
- Order # is a plain text, not a link here
- Table supports:
  - Column sort by Order #, Date, Customer, Status, Total only
  - Inline search (at top right): filter by Order # or Customer

### Actions (Per Table Row)
- Print (lucide "printer" outline), data-testid=`salesorderreport-row-printbtn`
- Export (lucide "download" outline), data-testid=`salesorderreport-row-exportbtn`
- Row click: Expands to show line-level detail/modal (read-only), testid=`salesorderreport-row-expandbtn`

**Export Menu** (top right):  
- PDF  
- Excel  
- CSV  
- data-testid: `salesorderreport-table-export-menu`

**Print (top right):**  
- "Print Report" (opens browser print with print-optimized style)
- data-testid: `salesorderreport-table-print-btn`

### No Data State
- Icon: Empty box (lucide "inbox")
- Message: "No orders match the current filters."
- data-testid: `salesorderreport-nodata-message`

### Loading/Skeleton State
- Full-table skeleton rows (pulse opacity only, no height shift)
- Disabled filter controls, primary button shows loading spinner
- data-testid: `salesorderreport-loading-skeleton`

### Error State
- Alert banner (role="alert", left-color: var(--color-error) 12% opacity)
- Message reads:  
  - "Unable to fetch sales order report."
  - Show exact API error messages under this (if developer mode) else show "Please try again."
- data-testid: `salesorderreport-error-banner`

### Form/Field Validation

- Any invalid filter shows a red outline and error text directly beneath it.
- Date range: "End date must be after start date."

### Test Identifiers

| TestID                                   | Element |
|-------------------------------------------|---------|
| salesorderreport-filters-runreport        | Run Report button |
| salesorderreport-row-printbtn             | Row Print action |
| salesorderreport-row-exportbtn            | Row Export action |
| salesorderreport-row-expandbtn            | Row expand for details |
| salesorderreport-table-export-menu        | Export format dropdown |
| salesorderreport-table-print-btn          | Print Report button |
| salesorderreport-nodata-message           | No results message |
| salesorderreport-loading-skeleton         | Loading placeholder |
| salesorderreport-error-banner             | Alert/error banner |
| salesorderreport-table-row-[orderNo]      | Each data row |
| salesorderreport-table-col-[colname]      | Each column cell |

---

## 77. Order Status Report

**Route:** `/orders/status-report`  
**Purpose:** View sales order statuses (all or filtered), for monitoring order pipelines and reporting.  
**PRD Reference:** "Order Status Report"; FR-142, FR-145, FR-152  
**Access Roles:** Sales Supervisor, Administrator

### Layout & Structure

- Glass card with vertical stack: filters above, table below
- Export and Print buttons in section header right

### Filter Controls

- **Date Range:**  
  - Label: "Status Change Date Range"
  - Type: Date picker (start & end)
  - Validation: "Start date must be before end date."
  - data-testid: `orderstatusreport-filter-daterange`

- **Status:**  
  - Label: "Order Status"
  - Type: Select; Options: All / Pending / Completed / Cancelled / In Progress / With Issues
  - Default: All
  - data-testid: `orderstatusreport-filter-status`

- **Customer:**  
  - Label: "Customer"
  - Type: Combo search
  - Minimum 2 chars to search, no results message if not found
  - data-testid: `orderstatusreport-filter-customer`

- **Order #:**  
  - Label: "Order Number"
  - Type: Text input
  - Placeholder: "e.g. SO-4272"
  - data-testid: `orderstatusreport-filter-orderno`

- **Run Report (Primary action):**  
  - Label: "Run Report"
  - data-testid: `orderstatusreport-filters-runreport`

### Table Columns

| Column               | Key        | Type       | TestID Suffix       |
|----------------------|------------|------------|---------------------|
| Order #              | orderNo    | Text       | orderno             |
| Customer             | customer   | Text       | customer            |
| Status               | status     | Pill       | status              |
| Status Changed On    | statusDate | DateTime   | statusdate          |
| Status Changed By    | statusBy   | Text       | statusby            |
| Previous Status      | prevStatus | Pill/Text  | prevstatus          |
| Reason/Remarks       | remarks    | Text       | remarks             |

**Table supports:**  
- Sorting by Order #, Status, Status Changed On  
- Row expansion: see status history for specific order (`orderstatusreport-row-expandbtn`)

### Actions
- Export table (top right): PDF, Excel, CSV, data-testid: `orderstatusreport-table-export-menu`
- Print button (adjacent): data-testid: `orderstatusreport-table-print-btn`

### No Data State
- Message: "No order status changes found matching these criteria."  
- data-testid: `orderstatusreport-nodata-message`

### Loading/Skeleton
- Table with skeleton rows (3+), fade opacity animation  
- filters disabled, report button in loading state

### Error State
- Glass alert at top, error message "Order status report could not be loaded. [API error if any]"
- data-testid: `orderstatusreport-error-banner`

### Test Identifiers

| TestID                                   | Element |
|-------------------------------------------|---------|
| orderstatusreport-filter-daterange        | Date range |
| orderstatusreport-filter-status           | Status select |
| orderstatusreport-filter-customer         | Customer search |
| orderstatusreport-filter-orderno          | Order number text |
| orderstatusreport-filters-runreport       | Run button |
| orderstatusreport-row-expandbtn           | Details expander |
| orderstatusreport-table-export-menu       | Export control |
| orderstatusreport-table-print-btn         | Print control |
| orderstatusreport-nodata-message          | Empty |
| orderstatusreport-error-banner            | Error |
| orderstatusreport-table-row-[orderNo]     | Row |
| orderstatusreport-table-col-[colname]     | Cell |

---

## 78. Pending Order Register Report

**Route:** `/orders/pending-register`  
**Purpose:** View and export a list of all pending sales orders for operational review and follow-up.  
**PRD Reference:** "Pending Order Register Report"; FR-143, FR-161, FR-152  
**Access Roles:** Sales Staff, Supervisor, Administrator

### Layout & Structure

- Filter bar pinned top of glass-panel (scrolls)
- Table below with full-width glass-panel
- Export, print at top right

### Filter Controls

- **Pending Since (Date):**  
  - Label: "Pending Since Date"
  - Type: Date picker (single)
  - Default: 30 days ago
  - data-testid: `pendingorderregister-filter-pendingsince`

- **Customer:**  
  - Label: "Customer"
  - Type: Combo search
  - data-testid: `pendingorderregister-filter-customer`

- **Min Amount:**  
  - Label: "Min Order Total"
  - Type: Number input ("₹"); validation: min=0
  - data-testid: `pendingorderregister-filter-minamount`

- **Run (Primary):**  
  - Label: "Run Register"
  - data-testid: `pendingorderregister-filters-runregister`

### Table Columns

| Column     | Key         | Type      | TestID Suffix   |
|------------|-------------|-----------|-----------------|
| Order #    | orderNo     | Text      | orderno         |
| Date       | orderDate   | Date      | orderdate       |
| Customer   | customer    | Text      | customer        |
| Age (days) | age         | Number    | age             |
| Status     | status      | Pill      | status          |
| Total      | total       | Currency  | total           |

- Table sorted by Age (descending), then Date
- Status pill colored as per status (pending: warning; completed: success; with issues: error)

### Actions

- Export: PDF, Excel, CSV  
  - data-testid: `pendingorderregister-table-export-menu`
- Print report: `pendingorderregister-table-print-btn`  

### No Data State

- Message: "No pending orders found."  
- data-testid: `pendingorderregister-nodata-message`

### Loading Skeleton

- Table placeholder shimmer; filters disabled  
- data-testid: `pendingorderregister-loading-skeleton`

### Error State

- Error banner with message and optional error details  
- data-testid: `pendingorderregister-error-banner`

### Test Identifiers

| TestID | Element |
|--------|---------|
| pendingorderregister-filter-pendingsince | Date control |
| pendingorderregister-filter-customer     | Customer search |
| pendingorderregister-filter-minamount    | Min amount |
| pendingorderregister-filters-runregister | Run button |
| pendingorderregister-table-export-menu   | Export control |
| pendingorderregister-table-print-btn     | Print |
| pendingorderregister-nodata-message      | Empty |
| pendingorderregister-error-banner        | Error |
| pendingorderregister-loading-skeleton    | Loading |
| pendingorderregister-table-row-[orderNo] | Row |
| pendingorderregister-table-col-[col]     | Cell |

---

## 79. Delivery Note Report

**Route:** `/orders/delivery-notes`  
**Purpose:** Generate, view, print, and export delivery note reports for completed/delivered sales orders.  
**PRD Reference:** "Delivery Note Report"; FR-145, FR-148  
**Access Roles:** Sales Staff, Supervisor, Administrator

### Filter Controls

- **Delivery Date Range:**  
  - Label: "Delivery Date Range"
  - Type: Date picker (start/end)
  - data-testid: `deliverynotereport-filter-daterange`

- **Customer:**  
  - Label: "Customer"
  - Type: Combo search
  - data-testid: `deliverynotereport-filter-customer`

- **Order #:**  
  - Label: "Order Number"
  - Type: Text input
  - data-testid: `deliverynotereport-filter-orderno`

- **Primary:**  
  - Label: "Run Report"
  - data-testid: `deliverynotereport-filters-runreport`

### Table Columns

| Column        | Key         | Type      | TestID Suffix    |
|---------------|-------------|-----------|------------------|
| Delivery #    | deliveryNo  | Text      | deliveryno       |
| Order #       | orderNo     | Text      | orderno          |
| Customer      | customer    | Text      | customer         |
| Delivery Date | deliveryDate| Date      | deliverydate     |
| Delivered By  | deliveredBy | Text      | deliveredby      |
| Products      | products    | List      | products         |

- Products column shows item count, tooltip with product name/qty
- Delivery # field: click for printable modal popup (read-only), data-testid: `deliverynotereport-row-printbtn`
- Row expansion: display all delivery items and summary, data-testid: `deliverynotereport-row-expandbtn`

### Actions

- Export (PDF, Excel, CSV): data-testid: `deliverynotereport-table-export-menu`
- Print (entire report): data-testid: `deliverynotereport-table-print-btn`

### Empty/Loading/Error

- Empty: "No deliveries found for the selected period."
- Skeleton: Table with shimmer, disabled controls
- Error: Banner at top, details if available

### Test Identifiers

| TestID                                 | Element      |
|-----------------------------------------|--------------|
| deliverynotereport-filter-daterange     | Date picker  |
| deliverynotereport-filter-customer      | Customer     |
| deliverynotereport-filter-orderno       | Order No     |
| deliverynotereport-filters-runreport    | Run btn      |
| deliverynotereport-row-printbtn         | Print single |
| deliverynotereport-row-expandbtn        | Row expand   |
| deliverynotereport-table-export-menu    | Export menu  |
| deliverynotereport-table-print-btn      | Print btn    |
| deliverynotereport-nodata-message       | No data msg  |
| deliverynotereport-loading-skeleton     | Loading      |
| deliverynotereport-error-banner         | Error banner |
| deliverynotereport-table-row-[deliveryNo]| Table row    |
| deliverynotereport-table-col-[col]       | Table col    |


---

## 80. Foreign Purchase Entry

**Route:** `/purchase/orders/foreign`  
**Purpose:** Create, view, and edit foreign purchase orders with supplier/item/currency details.  
**PRD Reference:** "Foreign Purchase Entry"; FR-163  
**Access Roles:** Purchase Officer, Supervisor, Procurement Admin

### Form Fields

- **Purchase Order Number**  
  - Label: "Purchase Order Number"
  - Type: Text input, required, pattern: alphanumeric up to 12 chars  
  - Error: "Enter unique PO number"

- **PO Date**  
  - Label: "Order Date"
  - Type: Date picker, required
  - Error: "PO date is required"

- **Supplier**  
  - Label: "Supplier"
  - Type: Combo search, required
  - Error: "Supplier must be specified"

- **Currency**  
  - Label: "Currency"
  - Type: Select, options: "USD", "EUR", "GBP", "INR", etc.
  - Required
  - Error: "Currency is required"
    
- **Items Table**  
  - Add/Remove rows
  - Columns:
    - Item Code (auto-complete, required)  
    - Description (readonly)  
    - Quantity (number input, min=1, required)  
    - Unit Price (number input, min=0, required)
    - Subtotal (readonly, qty x price)
    - Remove (icon btn)
  - data-testid:  
    - `foreignpurchaseentry-items-addrow`
    - `foreignpurchaseentry-items-removerow`

- **Delivery Terms**  
  - Label: "Delivery Terms"
  - Type: Text input
  - Optional

- **Expected Delivery Date**  
  - Label: "Expected Delivery"
  - Type: Date picker
  - Optional

- **Supporting Documents**  
  - Label: "Attach Files"
  - Type: File upload (multiple), accept: pdf, jpg/png, docx
  - Button: "Upload Document"
  - data-testid: `foreignpurchaseentry-upload-btn`
  - List/removal actions per uploaded file

- **Remarks/Notes**  
  - Label: "Notes"
  - Type: Multiline textarea

### Primary Actions

- "Save as Draft" (secondary)
- "Submit for Approval" (primary) — only enabled if form valid
  - data-testid: `foreignpurchaseentry-submit-btn`
- "Cancel" (returns to previous page)

### Validations

- Required fields marked with *; empty required fields outlined and error shown directly below.
- PO Number uniqueness checked via debounce API on input.
- At least one item row required; all item rows checked for all required fields.
- Amount fields: must be number, non-negative.

### Error/Skeleton/Empty

- API/submission error shows error banner at top, error below field if field-level
- Save as Draft shows loading spinner
- On load (edit existing PO), show skeletons for all fields

### Test Identifiers

| TestID                                 | Element    |
|-----------------------------------------|------------|
| foreignpurchaseentry-pono               | PO Number  |
| foreignpurchaseentry-date               | PO Date    |
| foreignpurchaseentry-supplier           | Supplier   |
| foreignpurchaseentry-currency           | Currency   |
| foreignpurchaseentry-items-addrow       | Add item   |
| foreignpurchaseentry-items-removerow    | Remove row |
| foreignpurchaseentry-upload-btn         | Upload     |
| foreignpurchaseentry-submit-btn         | Submit     |
| foreignpurchaseentry-cancel-btn         | Cancel     |
| foreignpurchaseentry-form-error         | Form error |
| foreignpurchaseentry-loading-skeleton   | Skeleton   |

---

## 81. Local Purchase Entry

**Route:** `/purchase/orders/local`  
**Purpose:** Record, browse, and update local purchase orders for goods/services procured locally.  
**PRD Reference:** "Local Purchase Entry"; FR-164  
**Access Roles:** Purchase Officer, Supervisor

### Form Fields

- **Purchase Order #**  
  - Label: "Local PO Number"
  - Type: Text input, required, max 10 chars, only alphanumeric
  - Error: "Enter unique PO number"

- **PO Date**  
  - Label: "Order Date"
  - Type: Date picker, required

- **Supplier**  
  - Label: "Supplier"
  - Combo search, required

- **Items Table** (same as Foreign Purchase Entry, but without currency selection)
  - Item Code, Description (read), Quantity, Unit Price, Subtotal, Remove button
  - Add row, Remove row
  - At least 1 row required

- **Attachments**  
  - Label: "Attach Invoices / Docs"
  - Type: File upload, accepts images/pdf/docx
  - Uploaded docs listed with option to remove

- **Invoice Number**  
  - Label: "Supplier Invoice Number"
  - Text input
  - Optional

- **Remarks**  
  - Textarea

### Actions

- "Save as Draft" (secondary)
- "Submit for Approval" (primary), data-testid: `localpurchaseentry-submit-btn`
- "Cancel" (back)

### Validation

- All required fields — error under label on blur/submit if empty
- All quantities/prices must be positive, numeric
- Unique PO number via API check
- At least one item row

### Skeleton/Error

- Show glass card skeleton for entire form until data loads (when editing)
- Banner for top-level errors

### Test Identifiers

| TestID                                | Element    |
|----------------------------------------|------------|
| localpurchaseentry-pono                | PO Number  |
| localpurchaseentry-date                | Date       |
| localpurchaseentry-supplier            | Supplier   |
| localpurchaseentry-items-addrow        | Add Item   |
| localpurchaseentry-items-removerow     | Remove     |
| localpurchaseentry-upload-btn          | Upload     |
| localpurchaseentry-submit-btn          | Submit     |
| localpurchaseentry-cancel-btn          | Cancel     |
| localpurchaseentry-form-error          | Form error |
| localpurchaseentry-loading-skeleton    | Skeleton   |

---

## 82. Local Purchase Order Entry

**Route:** `/purchase/orders/local/new`  
**Purpose:** Enter all required details for a new local purchase order, including line-item entry and context fields.  
**PRD Reference:** "Local Purchase Order Entry"; FR-164  
**Access Roles:** Purchase Officer, Supervisor

### Form Fields

- **Supplier**  
  - Label: "Supplier"
  - Combo search, required
  - Error: "A supplier is required"

- **PO Number**  
  - Label: "PO Number"
  - Text input, required, unique check

- **Order Date**  
  - Label: "Order Date"
  - Date picker, required

- **Item Selection Table**  
  - Columns:
    - Item Code (combo search, required)
    - Description (readonly)
    - Quantity (numeric, min 1, required)
    - Unit (auto from item) (readonly)
    - Price (numeric, required)
    - Subtotal (readonly)
    - Remove icon
  - Add row: data-testid: `localpoentry-items-addrow`
  - Remove: data-testid: `localpoentry-items-removerow`

- **Justification/Notes**  
  - Textarea, optional

- **Expected Delivery**  
  - Date picker, optional

### Actions

- "Add Another Item" (secondary)
- "Submit for Approval" (primary), data-testid: `localpoentry-submit-btn`
- "Cancel"

### Validation

- All required fields: show error below label if invalid
- At least one line item 
- Price/quantity numeric and positive
- PO number unique

### Skeleton/Error

- Glassform loading animation for editing existing
- Error: Banner at top, details if possible

### Test Identifiers

| TestID                         | Element    |
|--------------------------------|------------|
| localpoentry-supplier          | Supplier   |
| localpoentry-pono              | PO Number  |
| localpoentry-date              | Date       |
| localpoentry-items-addrow      | Add Line   |
| localpoentry-items-removerow   | Remove     |
| localpoentry-submit-btn        | Submit     |
| localpoentry-cancel-btn        | Cancel     |
| localpoentry-form-error        | Form error |
| localpoentry-loading-skeleton  | Skeleton   |

---

## 83. Local Purchase Order Management

**Route:** `/purchase/orders/local/manage`  
**Purpose:** Overview and workflow management of all local POs (draft, submitted, approved, received, closed); approve/reject/track.  
**PRD Reference:** "Local Purchase Order Management"; FR-164, FR-168, FR-173  
**Access Roles:** Supervisor, Procurement Admin

### Filter/Controls

- **Status Filter:**  
  - Label: "Status"
  - Chiptabs: Draft, Submitted, Approved, Received, Closed, All
  - data-testid: `localpomanage-filter-status`
  - Default: All

- **Supplier:**  
  - Label: "Supplier"
  - Combo search
  - data-testid: `localpomanage-filter-supplier`

- **Date Range:**  
  - Label: "Order Date"
  - Date range picker

- **Search Bar (top right):**
  - Placeholder: "Search PO number or invoice number"
  - data-testid: `localpomanage-searchbar`

- **Bulk Select:**  
  - Checkboxes at each row, bulk approve/reject actions only when "Submitted" is selected.

- **Export:**  
  - PDF, Excel, CSV

### Table Columns

| Column         | Key       | Type    | TestID Suffix    |
|----------------|-----------|---------|------------------|
| PO Number      | poNo      | Text    | pono             |
| Supplier       | supplier  | Text    | supplier         |
| Status         | status    | Pill    | status           |
| PO Date        | poDate    | Date    | podate           |
| Items Count    | itemCount | Number  | itemcount        |
| Total Amount   | total     | Currency| total            |
| Created By     | user      | Text    | user             |
| Updated        | updated   | Date    | updated          |

### Row Actions

- "View Details" (expands row or opens modal with all fields)
- "Approve" (only for status = Submitted; supervisor only)  
  data-testid: `localpomanage-row-approve`
- "Reject" (same; requires justification, modal input, error on empty)
  data-testid: `localpomanage-row-reject`
- "Edit" (only for Draft); data-testid: `localpomanage-row-edit`

### Bulk Actions

- Approve Selected  
  data-testid: `localpomanage-bulk-approve`
- Reject Selected  
  data-testid: `localpomanage-bulk-reject`

### No Data/Error/Loading

- Empty: "No purchase orders found."
- Loading: table shimmer, controls disabled
- Error: Top banner (role="alert"), API error if present

### Test Identifiers

| TestID                       | Element    |
|------------------------------|------------|
| localpomanage-filter-status  | Status tabs|
| localpomanage-filter-supplier| Supplier   |
| localpomanage-searchbar      | Search box |
| localpomanage-row-approve    | Approve btn|
| localpomanage-row-reject     | Reject btn |
| localpomanage-bulk-approve   | Bulk app   |
| localpomanage-bulk-reject    | Bulk rej   |
| localpomanage-row-edit       | Edit btn   |
| localpomanage-row-details    | Expand btn |
| localpomanage-nodata-message | Empty      |
| localpomanage-error-banner   | Error      |
| localpomanage-loading-skeleton|Loading    |
| localpomanage-table-row-[poNo]| Table row |
| localpomanage-table-col-[col] | Table col |

---

## 84. Pending Purchase Delivery Order

**Route:** `/purchase/delivery-orders/pending`  
**Purpose:** List, filter, and act on purchase delivery orders pending receipt.  
**PRD Reference:** "Pending Purchase Delivery Order"; FR-169, FR-179  
**Access Roles:** Purchase Officer, Warehouse Staff, Supervisor

### Filter Controls

- **Supplier:**  
  - Combo search
  - data-testid: `pendingpdo-filter-supplier`

- **Expected Delivery Date:**  
  - Date range picker
  - data-testid: `pendingpdo-filter-date`

- **Purchase DO Number:**  
  - Text input
  - data-testid: `pendingpdo-filter-pdonum`

### Actions

- "Run Register"
- Bulk select rows for "Mark as Received"  
  data-testid: `pendingpdo-bulk-markreceived`

### Table Columns

| Column        | Key       | Type    | TestID Suffix   |
|---------------|-----------|---------|-----------------|
| DO Number     | pdonum    | Text    | pdonum          |
| PO Number     | ponum     | Text    | ponum           |
| Supplier      | supplier  | Text    | supplier        |
| Expected Date | expDate   | Date    | expdate         |
| Items         | items     | List    | items           |
| Pending Qty   | pendQty   | Number  | pendqty         |

### Row Actions

- "Record Receipt" (opens modal or inline row expansion)
- View DO details

### Empty/Loading/Error

- Empty: "No pending delivery orders."
- Loading: table skeleton rows
- Error: Glass banner at top

### Test Identifiers

| TestID                                | Element             |
|---------------------------------------|---------------------|
| pendingpdo-filter-supplier            | Supplier filter     |
| pendingpdo-filter-date                | Date filter         |
| pendingpdo-filter-pdonum              | DO number filter    |
| pendingpdo-bulk-markreceived          | Bulk receipt btn    |
| pendingpdo-row-markreceived           | Row btn, modal open |
| pendingpdo-row-details                | Row details expand  |
| pendingpdo-nodata-message             | Empty               |
| pendingpdo-error-banner               | Error               |
| pendingpdo-loading-skeleton           | Loading             |

---

## 85. Purchase Delivery Order

**Route:** `/purchase/delivery-orders/:doNumber`  
**Purpose:** Enter or update receipt details for a purchase delivery order.  
**PRD Reference:** "Purchase Delivery Order"; FR-166, FR-167  
**Access Roles:** Warehouse Staff, Supervisor

### Form Fields

- **DO Number**  
  - Read-only (from route), displayed top left

- **PO Reference**  
  - Label: "PO Number"
  - Read-only
  - data-testid: `purchasedo-po-reference`

- **Items Table**  
  - Item Code, Description, Ordered Qty, Delivered Qty (editable number, <= Ordered), Remarks (optional string)
  - Each row can be marked "Not in delivery" via toggle

- **Receipt Date**  
  - Date picker, required, default to today

- **Delivery Note Attachment**  
  - File upload (accept: pdf, image, docx), optional

- **Receiver Name**  
  - Combo search (staff list), required

- **Remarks**  
  - Multiline textarea

### Action Bar

- "Save Draft" (secondary)
- "Confirm Receipt" (primary, enables when all lines have received qty)
  - data-testid: `purchasedo-confirm-btn`
- "Print Delivery Note" (lucide printer, only after confirm)
- "Cancel" (back)

### Validations

- For each item delivered qty: not negative, not greater than ordered
- Required fields: error red and below input
- Must have at least one item with nonzero received quantity to enable confirm

### Loading/Skeleton, Error

- Skeleton for entire card and item table on load
- Error banner top

### Test Identifiers

| TestID                           | Element         |
|-----------------------------------|-----------------|
| purchasedo-po-reference           | PO ref field    |
| purchasedo-row-recvqty            | Delivered qty   |
| purchasedo-row-remarks            | Row remark      |
| purchasedo-confirm-btn            | Confirm btn     |
| purchasedo-print-btn              | Print note      |
| purchasedo-upload-btn             | Upload file     |
| purchasedo-loading-skeleton       | Skeleton        |
| purchasedo-error-banner           | Error           |

---

## 86. Purchase DO Search

**Route:** `/purchase/delivery-orders/search`  
**Purpose:** Filterable, exportable search for all historic and pending purchase delivery orders.  
**PRD Reference:** "Purchase DO Search"; FR-170, FR-171  
**Access Roles:** All purchasing roles, Audit Staff

### Filter Controls

- **Supplier:**  
  - Combo search

- **PO Number:**  
  - Text input

- **DO Number:**  
  - Text input

- **Date Range:**  
  - Date pickers (start, end)

- **Item Code:**  
  - Text input (auto-complete)

- **Status:**  
  - Select: Received, Pending, Closed, All

- **Run Search (primary)**

### Table Columns

| Column       | Key       | Type    | TestID Suffix     |
|--------------|-----------|---------|-------------------|
| DO Number    | doNo      | Text    | dono              |
| PO Number    | poNo      | Text    | pono              |
| Supplier     | supplier  | Text    | supplier          |
| Date         | date      | Date    | date              |
| Status       | status    | Pill    | status            |
| Item Code(s) | items     | Text    | items             |
| Received By  | receiver  | Text    | receiver          |

- Table is paginated (page size selector), sort by any column

### Row Actions

- "View Details"
- "Export Row" (PDF, Excel, CSV; per-row)

### Export/Print

- Export selected/all (multi-select)
- Print register

### Empty/Loading/Error

- Glass panel skeleton to match quantity of rows
- Error banner at top

### Test Identifiers

| TestID                        | Element         |
|-------------------------------|-----------------|
| purchasedosearch-filter-supplier    | Supplier      |
| purchasedosearch-filter-pono        | PO Number     |
| purchasedosearch-filter-dono        | DO Number     |
| purchasedosearch-filter-date        | Date control  |
| purchasedosearch-filter-itemcode    | Item code     |
| purchasedosearch-filter-status      | Status sel    |
| purchasedosearch-table-row-[dono]   | Rowid         |
| purchasedosearch-table-col-[col]    | Cell          |
| purchasedosearch-row-details        | Details btn   |
| purchasedosearch-row-export         | Row Export    |
| purchasedosearch-nodata-message     | No Data       |
| purchasedosearch-error-banner       | Error         |
| purchasedosearch-loading-skeleton   | Loading       |

---

## 87. PurchaseOrder Report

**Route:** `/purchase/reports/orders`  
**Purpose:** Summary and detail reporting of all purchase orders, by supplier/date/status.  
**PRD Reference:** "PurchaseOrder Report"; FR-172, FR-171  
**Access Roles:** Supervisor, Procurement Admin

### Filter Controls

- **Supplier** (required or optional)
- **Order Date Range**
- **Status** (Approved, Pending, Received, Closed, All)
- **Order Number**
- **Run Report** (primary)

### Table Columns

| Column         | Key         | Type      | TestID Suffix   |
|----------------|-------------|-----------|-----------------|
| PO Number      | poNo        | Text      | pono            |
| Supplier       | supplier    | Text      | supplier        |
| Date           | date        | Date      | date            |
| Status         | status      | Pill      | status          |
| Items Count    | itemCount   | Number    | itemcount       |
| Total Amount   | total       | Currency  | total           |
| Approved By    | approver    | Text      | approver        |

### Actions

- Export (pdf, excel, csv) entire report
- Print
- Row: expand to see order items, export single order

### Empty/Error/Loading

- No data: "No purchase orders found."
- Loading: shimmer skeleton
- Error: glass banner at top, details if possible

### Test Identifiers

| TestID                           | Element      |
|-----------------------------------|-------------|
| purchaseorderreport-filter-supplier   | Supplier  |
| purchaseorderreport-filter-date       | Date      |
| purchaseorderreport-filter-status     | Status    |
| purchaseorderreport-filter-orderno    | Order #   |
| purchaseorderreport-runreport-btn     | Run btn   |
| purchaseorderreport-export-menu       | Export    |
| purchaseorderreport-print-btn         | Print     |
| purchaseorderreport-row-details       | Expand    |
| purchaseorderreport-row-export        | ExportRow |
| purchaseorderreport-nodata-message    | Empty     |
| purchaseorderreport-error-banner      | Error     |
| purchaseorderreport-loading-skeleton  | Loading   |


---

## 88. PurchaseDo01PDO Report

**Route:** `/purchase/reports/delivery-order-details`  
**Purpose:** Complete details of purchase delivery orders, linking to POs and item details.  
**PRD Reference:** "PurchaseDo01PDO Report"; FR-172  
**Access Roles:** Supervisor, Warehouse Manager, Procurement Admin

### Filter/Controls

- **Supplier**
- **PO Number**
- **DO Number**
- **Item Code**
- **Date Range**

### Table Columns

| Column            | Key       | Type      | TestID Suffix  |
|-------------------|-----------|-----------|----------------|
| DO Number         | doNum     | Text      | donum          |
| PO Number         | poNum     | Text      | ponum          |
| Item Code         | itemCode  | Text      | itemcode       |
| Item Desc         | itemDesc  | Text      | itemdesc       |
| Delivered Qty     | qty       | Number    | qty            |
| Supplier          | supplier  | Text      | supplier       |
| Status            | status    | Pill      | status         |
| Delivery Date     | date      | Date      | date           |
| Remarks           | remarks   | Text      | remarks        |

**Row expand:** Show all linked PO/DO documents

### Actions

- Export / print (entire report or single row)
- Download linked documents

### Empty/Loading/Error

- Standard messages, skeleton, error banner

### Test Identifiers

| TestID                             | Element   |
|-------------------------------------|-----------|
| purchasedo01pdoreport-filter-supplier|Supplier  |
| purchasedo01pdoreport-filter-pono    |PO Num    |
| purchasedo01pdoreport-filter-donum   |DO Num    |
| purchasedo01pdoreport-filter-item    |ItemCode  |
| purchasedo01pdoreport-filter-date    |Date      |
| purchasedo01pdoreport-row-details    |Expand    |
| purchasedo01pdoreport-row-export     |ExportRow |
| purchasedo01pdoreport-export-menu    |Export    |
| purchasedo01pdoreport-print-btn      |Print     |
| purchasedo01pdoreport-nodata-message |Empty     |
| purchasedo01pdoreport-error-banner   |Error     |
| purchasedo01pdoreport-loading-skeleton|Loading  |


---

## 89. pendingPurchaseDo Report

**Route:** `/purchase/reports/pending-delivery-orders`  
**Purpose:** Report showing all purchase delivery orders still pending processing or receipt.  
**PRD Reference:** "pendingPurchaseDo Report"; FR-179  
**Access Roles:** Purchase Officer, Supervisor, Audit Staff

### Filter Controls

- **Supplier**
- **PO Number**
- **DO Number**
- **Date Range**
- **Run Report (primary)**

### Table Columns

| Column        | Key       | Type      | TestID Suffix   |
|---------------|-----------|-----------|-----------------|
| DO Number     | doNum     | Text      | donum           |
| PO Number     | poNum     | Text      | ponum           |
| Supplier      | supplier  | Text      | supplier        |
| Due Date      | dueDate   | Date      | duedate         |
| Items Left    | items     | List      | items           |
| Pending Qty   | pendQty   | Number    | pendqty         |

### Actions

- Export / Print (entire report)
- Expand rows to see item detail

### Empty/Loading/Error

- As above

### Test Identifiers

| TestID                                 | Element     |
|-----------------------------------------|-------------|
| pendingpurchasedoreport-filter-supplier | Supplier    |
| pendingpurchasedoreport-filter-pono     | PO Num      |
| pendingpurchasedoreport-filter-donum    | DO Num      |
| pendingpurchasedoreport-filter-date     | Date        |
| pendingpurchasedoreport-row-details     | Expand      |
| pendingpurchasedoreport-export-menu     | Export      |
| pendingpurchasedoreport-print-btn       | Print       |
| pendingpurchasedoreport-nodata-message  | Empty       |
| pendingpurchasedoreport-error-banner    | Error       |
| pendingpurchasedoreport-loading-skeleton| Loading     |

---

## 90. Stock In Entry

**Route:** `/inventory/stock-in`  
**Purpose:** Record new receipts of inventory into the system warehouse(s).  
**PRD Reference:** "Stock In Entry"; FR-189  
**Access Roles:** Inventory Clerk, Supervisor, Inventory Manager

### Form Fields

- **Receipt Number**  
  - Autogenerated or enter manually; read-only if system-assigned

- **Supplier**
  - Combo search, required

- **Warehouse**
  - Select; only available warehouses shown

- **Date of Receipt**
  - Date picker, required

- **Items Table**
  - Add/Remove rows:  
    - Item Code (combo search, required)
    - Description (readonly)
    - Quantity received (number, min=1, required)
    - Unit Price (number, required)
    - Total (readonly, qty x price)
    - Remove (icon btn)
    - data-testid: `stockinentry-items-addrow`, `stockinentry-items-removerow`

- **Reference Number**
  - Text input, optional

- **Remarks**
  - Multiline textarea, optional

- **Attachments**
  - Invoice(s), receiving docs
  - Multiple files, removal per file

### Actions

- "Save as Draft" (secondary)
- "Record Receipt" (primary) — enabled only if all fields valid; data-testid: `stockinentry-submit-btn`
- "Cancel"

### Validations

- Required fields each marked, show error directly under on invalid
- Quantity and price: must be positive, numeric
- At least one item row

### Skeleton/Error

- Card and table skeleton for pending load
- Error banner on any API or submit error

### Test Identifiers

| TestID                          | Element        |
|----------------------------------|---------------|
| stockinentry-supplier            | Supplier      |
| stockinentry-warehouse           | Warehouse     |
| stockinentry-date                | Date          |
| stockinentry-items-addrow        | Add item      |
| stockinentry-items-removerow     | Remove item   |
| stockinentry-submit-btn          | Record btn    |
| stockinentry-cancel-btn          | Cancel        |
| stockinentry-form-error          | Field error   |
| stockinentry-loading-skeleton    | Loading       |

---

## 91. Stock Out Entry

**Route:** `/inventory/stock-out`  
**Purpose:** Record outgoing stock from warehouse (sales, internal use, transfer).  
**PRD Reference:** "Stock Out Entry"; FR-190  
**Access Roles:** Inventory Clerk, Supervisor, Inventory Manager

### Form Fields

- **Issue Number**  
  - Auto or manual

- **Issue Date**
  - Date picker, required

- **Issued To (Department/User)**
  - Combo search from list

- **Warehouse**
  - Select

- **Type of Issue**
  - Select: Sales, Internal Use, Transfer, Other

- **Items Table**
  - As per Stock In Entry, but negative quantities not permitted; all required
  - Reason for issue per item (optional)

- **Reference Number/Order**
  - Text input

- **Remarks**
  - Textarea

### Actions

- "Save as Draft", "Record Issue" (primary, data-testid: `stockoutentry-submit-btn`), "Cancel"

### Validations

- Quantities: positive, not greater than current stock (checked by API call)
- Required fields marked with error under field

### Skeleton/Error

- Glass card skeleton for loading
- Error banner on top

### Test Identifiers

| TestID                          | Element        |
|----------------------------------|---------------|
| stockoutentry-issuedto           | Dept/User     |
| stockoutentry-date               | Date          |
| stockoutentry-type               | Issue type    |
| stockoutentry-items-addrow       | Add item      |
| stockoutentry-items-removerow    | Remove item   |
| stockoutentry-submit-btn         | Record btn    |
| stockoutentry-form-error         | Field error   |
| stockoutentry-loading-skeleton   | Loading       |

---

## 92. Stock Movements In/Out

**Route:** `/inventory/stock-movements`  
**Purpose:** View/filter/export all stock in and out entries with search, filter, and export options.  
**PRD Reference:** "Stock Movements In/Out"; FR-191  
**Access Roles:** All Inventory Roles, Sales Team, Purchasing, Inventory Manager, Auditor

### Filter Controls

- **Date Range**
- **Transaction Type:** In / Out / All
- **Warehouse**
- **Item Code / Description**
- **Reference Number**
- "Run Search" (primary)

### Table Columns

| Column              | Key           | Type        | TestID Suffix      |
|---------------------|---------------|-------------|--------------------|
| Movement #          | moveNo        | Text        | moveno             |
| Date                | date          | Date        | date               |
| Type                | type          | Pill        | type               |
| Warehouse           | warehouse     | Text        | warehouse          |
| Item Code           | item          | Text        | item               |
| Quantity In         | qtyIn         | Number      | qtyin              |
| Quantity Out        | qtyOut        | Number      | qtyout             |
| Reference           | reference     | Text        | reference          |
| Remarks             | remarks       | Text        | remarks            |

### Actions

- Export table (PDF/Excel/CSV)
- Print
- Row expand: show source document or links, if present

### Empty/Loading/Error

- Same as above

### Test Identifiers

| TestID                            | Element      |
|-------------------------------------|-------------|
| stockmovements-filter-daterange     | Date ctl    |
| stockmovements-filter-type          | Type sel    |
| stockmovements-filter-warehouse     | Warehouse   |
| stockmovements-filter-item          | Item search |
| stockmovements-filter-reference     | Ref input   |
| stockmovements-table-row-[moveNo]   | Table row   |
| stockmovements-table-col-[col]      | Cell        |
| stockmovements-row-details          | Row expand  |
| stockmovements-export-menu          | Export ctrl |
| stockmovements-print-btn            | Print btn   |
| stockmovements-nodata-message       | Empty       |
| stockmovements-error-banner         | Error       |
| stockmovements-loading-skeleton     | Loading     |

---

## 93. Physical Stock Adjustment

**Route:** `/inventory/adjustments/manual`  
**Purpose:** Enter or approve adjustments from physical stock count to correct inventory.  
**PRD Reference:** "Physical Stock Adjustment"; FR-192  
**Access Roles:** Inventory Supervisor, Manager, Auditor

### Filter Controls

- **Warehouse**
- **Adjustment Date**
- **Status:** All, Pending, Approved

### Card/Table for Adjustments

Fields per adjustment:
- Adjustment # (ID)
- Date/Time
- Item Code
- Description
- Recorded Quantity
- Counted Quantity (editable if pending)
- Variance (auto: counted - recorded)
- Reason (text)
- Status
- Entered By (readonly)

### Actions

- "Approve" — only if status = Pending (primary; modal: confirm, require comment if negative variance > threshold)  
  data-testid: `phyadj-row-approve`
- "Reject" — (input reason, modal confirm)  
  data-testid: `phyadj-row-reject`
- "Edit" — for Pending, only own created
- "New Adjustment" — opens modal entry form, data-testid: `phyadj-new-btn`
- Export, print top right

### Validation

- Counted quantity required, numeric
- Reason required if variance abs(value) > threshold

### Skeleton/Error/Empty

| TestID                  | Element              |
|-------------------------|----------------------|
| phyadj-new-btn          | New adj. btn         |
| phyadj-row-approve      | Approve row          |
| phyadj-row-reject       | Reject row           |
| phyadj-row-edit         | Edit row             |
| phyadj-filter-warehouse | Warehouse filter     |
| phyadj-filter-date      | Date filter          |
| phyadj-filter-status    | Status filter        |
| phyadj-table-row-[id]   | Table row            |
| phyadj-nodata-message   | Empty message        |
| phyadj-error-banner     | Error banner         |
| phyadj-loading-skeleton | Loading skeleton     |

---

## 94. New Physical Stock Adjustment

**Route:** `/inventory/adjustments/new`  
**Purpose:** Create a new batch of physical stock adjustments, including mobile/bulk entry and barcode input.  
**PRD Reference:** "New Physical Stock Adjustment"; FR-193  
**Access Roles:** Inventory Supervisor, Inventory Manager

### Form

- **Warehouse**  
  - Select, required

- **Adjustment Date**  
  - Date picker, default today

- **Batch Item Entry Grid:**  
  - Item Code (barcode scanner input + manual search), required  
  - Description (readonly)
  - System Qty (readonly, fetched on Item Code input)
  - Counted Qty (numeric, required)
  - Variance (auto)
  - Reason (input, required if variance nonzero)
  - Remove row
  - data-testid: `newphystockadj-items-addrow`, `newphystockadj-items-removerow`

- **Notes (overall):**  
  - Textarea

### Actions

- "Add Another Item"
- "Save Adjustment Batch" (primary; data-testid: `newphystockadj-submit-btn`)
- "Cancel"

### Validation

- All items: item code required, counted qty required, reason if variance
- If barcode not matched, show "Item not found"
- Cannot submit empty batch

### Skeleton/Error

- Loading: Form card, input grid pulse
- Error: banner at top

### Test Identifiers

| TestID                          | Element         |
|----------------------------------|-----------------|
| newphystockadj-warehouse         | Warehouse       |
| newphystockadj-date              | Date            |
| newphystockadj-items-addrow      | Add Item Row    |
| newphystockadj-items-removerow   | Del Item Row    |
| newphystockadj-submit-btn        | Save btn        |
| newphystockadj-cancel-btn        | Cancel          |
| newphystockadj-form-error        | Error           |
| newphystockadj-loading-skeleton  | Loading         |

---

## 95. Stock Availability

**Route:** `/inventory/availability`  
**Purpose:** Display in real-time the available stock for all items, across locations.  
**PRD Reference:** "Stock Availability"; FR-194  
**Access Roles:** All users with inventory or sales access

### Filters

- **Item Code/Description** (auto-complete, starts search when typing)
- **Category** (select)
- **Warehouse** (select)
- **Availability Only Toggle:** if "Show only items below reorder level" checked
- **Show Out Of Stock** (optional toggle)

### Table Columns

| Column          | Key         | Type      | TestID Suffix  |
|-----------------|-------------|-----------|----------------|
| Item Code       | itemCode    | Text      | itemcode       |
| Description     | desc        | Text      | desc           |
| Available Qty   | availQty    | Number    | availqty       |
| Warehouse       | warehouse   | Text      | warehouse      |
| Category        | category    | Text      | category       |
| Reorder Level   | reorderLvl  | Number    | reorderlvl     |
| Last Receipt    | lastRcpt    | Date      | lastrcpt       |

**Row color:** red text if below reorder, muted if out of stock

### Actions

- Export (all/filtered), Print, data-testid: `stockavailability-export-menu`, `stockavailability-print-btn`

### Loading/Empty/Error

| TestID                             | Element    |
|-------------------------------------|------------|
| stockavailability-filter-item       | Item field |
| stockavailability-filter-category   | Cat select |
| stockavailability-filter-warehouse  | Warehouse  |
| stockavailability-table-row-[code]  | Row        |
| stockavailability-table-col-[col]   | Cell       |
| stockavailability-empty-message     | Empty      |
| stockavailability-loading-skeleton  | Loading    |
| stockavailability-error-banner      | Error      |
| stockavailability-export-menu       | Export     |
| stockavailability-print-btn         | Print      |

---

## 96. Stock Display

**Route:** `/inventory/display`  
**Purpose:** Show summarized, visual overview (tables and charts) of inventory status and trends.  
**PRD Reference:** "Stock Display"; FR-196  
**Access Roles:** Inventory Manager, Purchasing, Supervisor

### Main Sections

- **At-a-glance Cards:**  
  - Total items  
  - Total stock value  
  - # Items below reorder  
  - Out-of-stock count

- **Category Breakdown Table:**  
  - Category, Item Count, Value, Below Reorder, Out of Stock

- **Warehouse Summary Table:**  
  - Warehouse, Item Count, Value, Below Reorder, Out of Stock

- **Last Movement Chart:**  
  - Bar: Items received/issued last 30 days

- **Trend Line:**  
  - Value of total stock by week (past 12 wks)

### Controls

- Filter by (optional): Warehouse, Category, Date

- Export: Download tables/charts as PDF, Excel, SVG

### Loading/Empty/Error

- Loading: pulse on charts/cards
- Error: banner at top

### Test Identifiers

| TestID                                 | Element         |
|-----------------------------------------|-----------------|
| stockdisplay-card-totalitems            | Total items     |
| stockdisplay-card-stockvalue            | Stock value     |
| stockdisplay-card-belowreorder          | Below reorder   |
| stockdisplay-card-outofstock            | Out of stock    |
| stockdisplay-table-category             | Cat table       |
| stockdisplay-table-warehouse            | Warehouse table |
| stockdisplay-plot-lm                    | Last move chart |
| stockdisplay-plot-trend                 | Trend chart     |
| stockdisplay-filter-warehouse           | Sel warehouse   |
| stockdisplay-filter-category            | Sel category    |
| stockdisplay-filter-date                | Date            |
| stockdisplay-export-menu                | Export          |
| stockdisplay-loading-skeleton           | Loading         |
| stockdisplay-error-banner               | Error           |

---

## 97. Stock Updates

**Route:** `/inventory/stock-updates`  
**Purpose:** Create/view/edit manual updates/corrections to inventory, opening balances, or errors.  
**PRD Reference:** "Stock Updates"; FR-197  
**Access Roles:** Inventory Supervisor, Manager

### Table

| Column         | Key         | Type      | TestID Suffix    |
|----------------|-------------|-----------|------------------|
| Update #       | updNo       | Text      | updno            |
| Date           | date        | Date      | date             |
| Item Code      | item        | Text      | item             |
| Type           | type        | Pill      | type             |
| Value Change   | valChange   | Number    | valchange        |
| Approved       | approved    | Pill      | approved         |
| Note           | note        | Text      | note             |
| Updated By     | user        | Text      | user             |

- Row expand: view all before/after fields

### Actions

- "New Update" (opens form — as per Stock In/Out Entry, limited to manual item, value)
- "Edit" — only for unapproved, own
- "Approve"/"Reject" — supervisor only
- Export / print

### Filter controls:

- Date, type, item, status (approved/pending)

### Loading/Empty/Error

| TestID                          | Element      |
|----------------------------------|-------------|
| stockupdates-table-row-[seqNo]   | Row         |
| stockupdates-row-edit            | Edit btn    |
| stockupdates-row-approve         | Approve     |
| stockupdates-row-reject          | Reject      |
| stockupdates-loading-skeleton    | Loading     |
| stockupdates-nodata-message      | Empty       |
| stockupdates-error-banner        | Error       |
| stockupdates-new-btn             | New Update  |
| stockupdates-filter-date         | Date filt   |
| stockupdates-filter-type         | Type filt   |
| stockupdates-filter-item         | Item filt   |
| stockupdates-filter-status       | Status filt |
| stockupdates-export-menu         | Export      |
| stockupdates-print-btn           | Print       |

---

## 98. Stock Valuation

**Route:** `/inventory/valuation`  
**Purpose:** Calculate/display the total value of inventory as of a date and according to the selected method.  
**PRD Reference:** "Stock Valuation"; FR-198  
**Access Roles:** Inventory Manager, Finance Team, Auditor

### Filter Controls

- **Valuation Date:** Date picker, default to today
- **Valuation Method:** Select: FIFO, Weighted Average
- **Item/Category:** Combo search/Category select (optionally)
- "Run Valuation" (primary)

### Table

| Column        | Key         | Type      | TestID Suffix   |
|---------------|-------------|-----------|-----------------|
| Item Code     | itemcode    | Text      | itemcode        |
| Description   | desc        | Text      | desc            |
| Qty On Hand   | qty         | Number    | qty             |
| Unit Price    | unitprice   | Currency  | unitprice       |
| Value         | value       | Currency  | value           |
| Category      | category    | Text      | category        |
| Warehouse     | warehouse   | Text      | warehouse       |

**Total Stock Value** (above table): summary card

### Actions

- Export/Print

### Empty/Error/Skeleton

| TestID                           | Element      |
|-----------------------------------|-------------|
| stockvaluation-filter-date        | Date        |
| stockvaluation-filter-method      | Method      |
| stockvaluation-filter-item        | Item        |
| stockvaluation-table-row-[code]   | Row         |
| stockvaluation-table-col-[col]    | Cell        |
| stockvaluation-totalvalue-card    | Total card  |
| stockvaluation-export-menu        | Export      |
| stockvaluation-print-btn          | Print       |
| stockvaluation-nodata-message     | Empty       |
| stockvaluation-error-banner       | Error       |
| stockvaluation-loading-skeleton   | Loading     |

---

## 99. StockLedger Report

**Route:** `/inventory/reports/stock-ledger`  
**Purpose:** View, filter, export a detailed register of all inventory transactions by item; see receipts, issues, balances.  
**PRD Reference:** "StockLedger Report"; FR-200  
**Access Roles:** Inventory Clerk, Supervisor, Manager, Auditor

### Filter Controls

- **Item Code/Description** (combo search)
- **Warehouse**
- **Date Range**
- **Run Report** (primary)

### Table

| Column           | Key         | Type      | TestID Suffix |
|------------------|-------------|-----------|---------------|
| Date             | date        | Date      | date          |
| Item Code        | itemCode    | Text      | itemcode      |
| Description      | desc        | Text      | desc          |
| Warehouse        | warehouse   | Text      | warehouse     |
| Type             | type        | Pill      | type          |
| Qty In           | qtyIn       | Number    | qtyin         |
| Qty Out          | qtyOut      | Number    | qtyout        |
| Balance          | bal         | Number    | bal           |
| Reference        | reference   | Text      | reference     |
| Remarks          | remarks     | Text      | remarks       |

**Running Balance**: shown in Balance column

### Actions

- Export (PDF, Excel, CSV)
- Print

### Empty/Error/Skeleton

| TestID                         | Element    |
|---------------------------------|-----------|
| stockledger-filter-item         | Item      |
| stockledger-filter-warehouse    | Warehouse |
| stockledger-filter-daterange    | Date      |
| stockledger-table-row-[date]-[itemcode]| Row|
| stockledger-table-col-[col]     | Cell      |
| stockledger-export-menu         | Export    |
| stockledger-print-btn           | Print     |
| stockledger-nodata-message      | Empty     |
| stockledger-error-banner        | Error     |
| stockledger-loading-skeleton    | Loading   |

---

## 100. StockAgingReport

**Route:** `/inventory/reports/stock-aging`  
**Purpose:** View aging profile of inventory items—how long current stock has been held.  
**PRD Reference:** "StockAgingReport"; FR-201  
**Access Roles:** Inventory Manager, Finance Team, Auditor

### Filter Controls

- **Category**
- **Warehouse**
- **Min Age (days)**
- **Date** (as of)
- **Run Report** (primary)

### Table

| Column        | Key         | Type      | TestID Suffix   |
|---------------|-------------|-----------|-----------------|
| Item Code     | itemcode    | Text      | itemcode        |
| Description   | desc        | Text      | desc            |
| Qty On Hand   | qty         | Number    | qty             |
| Last Move     | lastmove    | Date      | lastmove        |
| Age (days)    | age         | Number    | age             |
| Value         | value       | Currency  | value           |
| Warehouse     | warehouse   | Text      | warehouse       |

**Highlight:**  
- Rows > threshold in red  
- Add column for "Aging Bucket" (0–30, 31–60, 61–90, 91–180, 181+)

### Actions

- Export / Print

### Empty/Error/Skeleton

| TestID                           | Element      |
|-----------------------------------|-------------|
| stockageing-filter-category       | Category    |
| stockageing-filter-warehouse      | Warehouse   |
| stockageing-filter-minage         | Min Age     |
| stockageing-filter-date           | Date        |
| stockageing-table-row-[code]      | Row         |
| stockageing-table-col-[col]       | Cell        |
| stockageing-export-menu           | Export      |
| stockageing-print-btn             | Print       |
| stockageing-nodata-message        | Empty       |
| stockageing-error-banner          | Error       |
| stockageing-loading-skeleton      | Loading     |

---

## COVERAGE CHECK

| Screen # | Screen Name                          | Status      |
|----------|--------------------------------------|-------------|
| 76       | Sales Order Report                   | ✅ covered  |
| 77       | Order Status Report                  | ✅ covered  |
| 78       | Pending Order Register Report        | ✅ covered  |
| 79       | Delivery Note Report                 | ✅ covered  |
| 80       | Foreign Purchase Entry               | ✅ covered  |
| 81       | Local Purchase Entry                 | ✅ covered  |
| 82       | Local Purchase Order Entry           | ✅ covered  |
| 83       | Local Purchase Order Management      | ✅ covered  |
| 84       | Pending Purchase Delivery Order      | ✅ covered  |
| 85       | Purchase Delivery Order              | ✅ covered  |
| 86       | Purchase DO Search                   | ✅ covered  |
| 87       | PurchaseOrder Report                 | ✅ covered  |
| 88       | PurchaseDo01PDO Report               | ✅ covered  |
| 89       | pendingPurchaseDo Report             | ✅ covered  |
| 90       | Stock In Entry                       | ✅ covered  |
| 91       | Stock Out Entry                      | ✅ covered  |
| 92       | Stock Movements In/Out               | ✅ covered  |
| 93       | Physical Stock Adjustment            | ✅ covered  |
| 94       | New Physical Stock Adjustment        | ✅ covered  |
| 95       | Stock Availability                   | ✅ covered  |
| 96       | Stock Display                        | ✅ covered  |
| 97       | Stock Updates                        | ✅ covered  |
| 98       | Stock Valuation                      | ✅ covered  |
| 99       | StockLedger Report                   | ✅ covered  |
| 100      | StockAgingReport                     | ✅ covered  |

---

# FRONTEND_SPEC.md  
## Integrated Business Operations Suite — Stock, Banking, and Account Management UI

---

### 101. StockStatement

**Route Path:** `/inventory/stock-statement`  
**Purpose:** Present a detailed, date-filterable statement of all stock movements (in/out/adjustments) and balances for a selected time period, exportable and printable for management review.  
**PRD References:** Feature "StockStatement" in PRD; FR-202, FR-203, Stock & Inventory Management.  
**Access Roles:** `Inventory Manager`, `Supervisor`, `Auditor` (View only for `Standard User`).

#### Layout & Structure  
- Glass container (`.glass-main-container`)
- Section header: "Stock Statement" (`text-h2`)
- Date range filter
- Item/Product selector (autocomplete)
- Filter/search bar for stock location/category
- Results data table
- Export (PDF/Excel/CSV), Print
- Table pagination and bulk select

#### Fields & UI Elements  
- **Date Range Picker**
  - Label: "Statement Period"
  - Required, two inputs: "From" and "To" (calendar icon, defaults to last 30 days)
  - Validation: Both required, From ≤ To
  - Data-testid: `stock-statement-filter-daterange`

- **Item Selector**
  - Label: "Item/Product"
  - Combobox/autocomplete with search for any item (shows item code, name, unit)
  - Optional
  - Data-testid: `stock-statement-filter-item`

- **Location Filter**
  - Label: "Stock Location"
  - Dropdown with list of valid warehouse/location codes
  - Default: "All"
  - Data-testid: `stock-statement-filter-location`

- **Category Filter**
  - Label: "Category"
  - Dropdown/populated from master item types
  - Optional
  - Data-testid: `stock-statement-filter-category`

- **Search Button**
  - Primary button style, label: "Run Statement"
  - Disabled if required fields (date) missing
  - Data-testid: `stock-statement-filter-submit`

#### Data Table Columns  
- Date (`col: date`, sortable, default desc)
- Item Code
- Description
- Movement Type (IN/OUT/Adjust—colored status pill)
- Reference No.
- Quantity (2 decimals, right-aligned)
- Unit
- Stock In
- Stock Out
- Running Balance (per date)
- Location
- Created By (for audit)
- Comments/Notes

Data-testid example for row: `stock-statement-table-row-0`

#### Actions
- **Export Button**
  - Icon: Download (line style)
  - Exports current filter/data to PDF/Excel/CSV
  - Data-testid: `stock-statement-export-btn`
- **Print Button**
  - Icon: Printer
  - Invokes print layout/dialog
  - Data-testid: `stock-statement-print-btn`
- **Pagination Controls**  
  - Data-testid: `stock-statement-pagination-[page]`

#### Forms & Validation  
- Error next to date fields: "Statement period is required" / "Start date cannot be after end date".
- Error on invalid filter request: "Please select at least a date range."
- API server error: top-of-page error banner with error message.

#### Loading/Skeleton States  
- Skeleton rows for table (show gray bars)
- Animated skeleton (opacity, not height) for filter

#### Empty States  
- "No stock movement records found for the given criteria."

#### API Interactions  
- GET `/api/v1/stock/statement` (mapped from `StockStatement` view or procedure—see backend mapping)
- On every filter change, trigger fetch.
- On export, re-run with exact filters.

#### Test Identifiers
- stock-statement-filter-daterange
- stock-statement-filter-item
- stock-statement-filter-location
- stock-statement-filter-category
- stock-statement-filter-submit
- stock-statement-table-row-[n]
- stock-statement-export-btn
- stock-statement-print-btn
- stock-statement-pagination-[n]

---

### 102. StockValuationReport

**Route Path:** `/inventory/valuation-report`  
**Purpose:** Generate, filter, and export the total and detailed valuation of the inventory as of a specified date, by category/type/method for accounting/compliance purposes.  
**PRD References:** "StockValuationReport", FR-203, Stock & Inventory Management, compliance reporting.  
**Access Roles:** `Inventory Manager`, `Finance Team`, `Auditor`, `Administrator`

#### Layout & Structure  
- Top: title "Stock Valuation Report" (`text-h2`)
- Filter panel (date, type/category, valuation method)
- Data table with results and summary section
- Export/print options

#### Fields & UI Elements  
- **As of Date Picker**
  - Label: "Valuation Date"
  - Required
  - Data-testid: `stockvaluation-filter-date`
- **Valuation Method Selector**
  - Label: "Valuation Method"
  - Radio: FIFO, Weighted Average, LIFO [toggle as needed; default from business policy]
  - Data-testid: `stockvaluation-filter-method`
- **Category/Type Filter**
  - Dropdown for item category/type
  - All categories default if blank
  - Data-testid: `stockvaluation-filter-category`
- **Search Button**
  - Primary style, label: "Calculate"
  - Data-testid: `stockvaluation-submit-btn`

#### Data Table Columns
- Item Code
- Description
- Category/Type
- Available Quantity
- Unit Cost/Rate (per valuation method)
- Total Value (Qty × Rate, 2 decimals)
- Location/Warehouse
- Valuation Method

**Summary Footer**:  
- Columns for grand-total stock, total value

#### Actions  
- **Export:** (PDF/Excel/CSV) `stockvaluation-export-btn`
- **Print:** `stockvaluation-print-btn`

#### Validations  
- Date field required: "Please select a valuation date."
- Valuation method required: "Please select a valuation method."
- API/server error: "Unable to generate the report. [API error details]"

#### Loading/Empty
- Skeleton rows on table during fetch
- Animated summary skeleton while calculating
- Empty: "No stock found for selected category/date."

#### API  
- GET `/api/v1/stock/valuation`
- Export receives identical parameters as search

#### Test Identifiers
- stockvaluation-filter-date
- stockvaluation-filter-method
- stockvaluation-filter-category
- stockvaluation-submit-btn
- stockvaluation-table-row-[n]
- stockvaluation-export-btn
- stockvaluation-print-btn

---

### 103. Bank Book

**Route Path:** `/finance/bank-book`  
**Purpose:** Display/search/export the complete bank book ledger for all or selected bank accounts and periods, per PRD "Bank Book"; supports review, audit, and reconciliation.  
**PRD References:** FR-217, Banking & Reconciliation  
**Access Roles:** `Accountant`, `Finance Supervisor`, `Administrator`

#### Layout & Structure  
- Section header "Bank Book" (`text-h2`)
- Filter bar (Account, Date Range, Transaction type)
- Data/results table (ledger style)
- Export, Print action bar
- Pagination controls

#### Fields & UI Elements
- **Bank Account Selector**
  - Label: "Bank Account"
  - Dropdown (populated from master bank accounts)
  - Default: "All"
  - Data-testid: `bankbook-filter-bank`
- **Date Range Picker**
  - Label: "Period"
  - "From"/"To"
  - Required  
  - Data-testid: `bankbook-filter-daterange`
- **Transaction Type**
  - Label: "Type"
  - Dropdown: All, Debit, Credit, Cheque, Transfer, PDC
  - Data-testid: `bankbook-filter-type`
- **Search Button**
  - Primary, label: "Run Bank Book"
  - Data-testid: `bankbook-submit-btn`

#### Data Table Columns
- Date
- Voucher No.
- Narration
- Reference No.
- Debit (right-aligned)
- Credit (right-aligned)
- Cheque No.
- Cheque Date
- Bank
- Balance (running)
- Username / Posted by

#### Table Interactions
- Sort by Date (default: desc)
- Pagination, 25/50/100 per page toggle

#### Actions
- Export: PDF/Excel/CSV (`bankbook-export-btn`)
- Print: (`bankbook-print-btn`)

#### Validations
- Date required: "Please select a period."
- API errors: error banner.
- No bank selected = all.

#### Loading/Empty
- Skeleton table
- Empty: "No bank transactions for selection."

#### API
- GET `/api/v1/banking/book-details`

#### Test Identifiers
- bankbook-filter-bank
- bankbook-filter-daterange
- bankbook-filter-type
- bankbook-submit-btn
- bankbook-table-row-[n]
- bankbook-export-btn
- bankbook-print-btn

---

### 104. Cash Book

**Route Path:** `/finance/cash-book`  
**Purpose:** View, audit, and export the business cash book ledger, with filters and print options for compliance and control.  
**PRD Ref:** FR-218, Banking & Reconciliation  
**Access Roles:** `Accountant`, `Finance Supervisor`, `Administrator`

#### Layout & Structure
- Page title "Cash Book" (`text-h2`)
- Filters (Date Range, Cash Account, Type)
- Data table
- Export, Print

#### Fields & UI Elements
- **Cash Account Selector**
  - Label: "Cash Account"
  - Dropdown, pre-filled (usually only one)
  - Data-testid: `cashbook-filter-account`
- **Date Range**
  - Required "From"/"To"
  - Data-testid: `cashbook-filter-daterange`
- **Type**
  - Dropdown: All, Debit, Credit
  - Data-testid: `cashbook-filter-type`
- **Search Button**
  - Primary, label: "Run Cash Book"
  - Data-testid: `cashbook-submit-btn`

#### Data Table Columns
- Date
- Voucher No.
- Narration
- Reference No.
- Debit (right-aligned)
- Credit (right-aligned)
- Balance
- Posted by

#### Actions
- Export: PDF/Excel/CSV (`cashbook-export-btn`)
- Print: (`cashbook-print-btn`)

#### Validations
- Date required: "Please select cash book period."
- API/server errors: error banner

#### Loading/Empty
- Table skeleton while fetching  
- Empty: "No cash transactions in selection."

#### API
- GET `/api/v1/banking/book-details?account=[account]&type=cash...`

#### Test Identifiers
- cashbook-filter-account
- cashbook-filter-daterange
- cashbook-filter-type
- cashbook-submit-btn
- cashbook-table-row-[n]
- cashbook-export-btn
- cashbook-print-btn

---

### 105. Bank Reconciliation

**Route Path:** `/finance/bank-reconciliation`  
**Purpose:** Reconcile internal ledger records with imported bank statements, highlight unreconciled items, attach supporting documents, and allow review and exception handling.  
**PRD References:** FR-219–FR-223, Banking & Reconciliation  
**Access Roles:** `Accountant`, `Finance Supervisor`, `Administrator`  

#### Layout & Structure
- Glass panel with title "Bank Reconciliation"
- Filter area: Account, date, statement upload
- Main split panel:  
    - Left: Internal transactions table  
    - Right: Imported statement transactions  
- Exception panel (above or below): unreconciled items  
- Upload/attachment panel

#### Fields & UI Elements
- **Bank Account Selector**
  - Label: "Bank Account"
  - Required
  - Data-testid: `recon-filter-account`
- **Reconciliation Period**
  - Date range "From"/"To"
  - Data-testid: `recon-filter-daterange`
- **Statement Upload**
  - File drop/choose ("Choose Bank Statement (.csv/.xls/.ofx)")
  - Shows file name after select  
  - Data-testid: `recon-upload-btn`
- **Import Statement Button**
  - Triggers parsing/load  
  - Data-testid: `recon-import-btn`
- **Run Reconciliation**
  - Button, primary, label: "Reconcile Now"
  - Disabled unless account, period, and statement loaded
  - Data-testid: `recon-submit-btn`

#### Transaction Tables

- **Internal Transactions Table:**
  - Date
  - Narration
  - Reference
  - Debit
  - Credit
  - Balance
  - Match status (Matched/Unmatched icon)
  - User
  - Actions: Attach doc, Mark as matched/unmatched
  - Data-testid: `recon-internal-table-row-[n]`

- **Statement Transactions Table:**
  - Date
  - Description
  - Reference No.
  - Amount
  - Match status
  - Actions: Mark as matched/unmatched
  - Data-testid: `recon-statement-table-row-[n]`

- **Exception List**:  
  - Auto-populated with unreconciled transactions, age in days, amount, action button "Resolve Exception"
  - Data-testid: `recon-exception-row-[n]`

#### Attachments Panel  
- List of uploaded statement docs + supporting files  
- Upload new file (plus icon)  
- Download/open, delete docs  
- Data-testid: `recon-attachment-upload-btn`, `recon-attachment-list-row-[n]`

#### Actions  
- "Save Reconciliation" primary button (disabled until at least one match changed)
- "Export Reconciliation Report"
- "View Audit Trail"
- "Cancel/Reset"
- "Flag Transaction" on unreconciled row
- "Attach File"

#### Validation  
- Must pick an account and date range:  
  - "Bank account and period are required."  
- File format/parse errors:  
  - "Unable to parse statement file. Please check format."
- Marked errors (manual):  
  - "Match status must be set for each record before closing reconciliation."

#### Loading  
- Skeleton table rows during load/import
- Loading bar on file import

#### Empty States  
- "All records matched — no unreconciled transactions!"
- "No internal ledger entries found for the period."
- "No bank statement data loaded."

#### API  
- GET/POST `/api/v1/banking/reconciliation`
- POST `/api/v1/banking/reconciliation/import` (for upload)
- PATCH `/api/v1/banking/reconciliation/:reconId/save`
- GET `/api/v1/banking/reconciliation/:reconId/audit`

#### Test Identifiers
- recon-filter-account
- recon-filter-daterange
- recon-upload-btn
- recon-import-btn
- recon-submit-btn
- recon-internal-table-row-[n]
- recon-statement-table-row-[n]
- recon-exception-row-[n]
- recon-attachment-upload-btn
- recon-attachment-list-row-[n]

---

### 106. Select Bank for Reconciliation

**Route Path:** `/finance/bank-reconciliation/select-bank`  
**Purpose:** Enable user to choose from authorized bank accounts to start or resume a reconciliation session.  
**PRD References:** FR-224  
**Access Roles:** `Accountant`, `Finance Supervisor`, `Finance Administrator`  

#### Layout & Structure
- Section header: "Select Bank for Reconciliation"
- List/grid of available bank accounts (card grid, each with name, partial number, last reconciliation date)
- Search/filter bar (search by name/number)
- Actions: Select, View summary

#### Fields & UI Elements  
- **Bank Account Cards/Table:**  
  - Account Name  
  - Account Number (masked: last 4)  
  - Bank Name  
  - Currency  
  - Last Reconciled: Date  
  - Status: Ready/Locked  
  - Select Button (`select-bank-btn-[accountId]`)  

- **Search Field**
  - Label: "Search Bank Account"
  - Auto-focus, testid: `select-bank-search-input`

#### Actions
- Select: navigates to `/finance/bank-reconciliation?account=[id]`
- View summary: opens modal with account summary (previous reconciliation results, etc.), testid: `select-bank-summary-btn-[accountId]`

#### Validations
- No accounts: "No bank accounts found for your access."
- Error: "Unable to fetch accounts. Please try again."

#### Loading/Empty  
- Skeleton grid during fetch

#### Test Identifiers
- select-bank-search-input
- select-bank-btn-[accountId]
- select-bank-summary-btn-[accountId]
- select-bank-empty-state

---

### 107. CBPBook (Report)

**Route Path:** `/reports/bank-cash-book`  
**Purpose:** Generate a consolidated report showing all cash and bank book transactions, filterable and exportable.  
**PRD References:** FR-225  
**Access Roles:** `Accountant`, `Finance Supervisor`, `Administrator`

#### Layout & Structure
- Section heading "CBP Book Report"
- Filter panel: period, account type(s), transaction type
- Data table
- Summary total bar
- Export and print

#### Fields & UI Elements
- **Date Range Picker**
  - Label: "Period"
  - Required
  - Data-testid: `cbpbook-filter-daterange`
- **Account Type Selector**
  - Label: "Account Types"
  - Multiselect: Cash, Bank, Petty Cash (default: all)
  - Data-testid: `cbpbook-filter-accounttype`
- **Transaction Type Selector**
  - Label: "Transaction Type"
  - All, Debit, Credit, Cheque, Transfer, PDC
  - Data-testid: `cbpbook-filter-transtype`
- **Search Button**
  - Primary, label: "Generate Report"
  - Data-testid: `cbpbook-submit-btn`

#### Data Table Columns
- Date
- Account Name
- Voucher No.
- Narration
- Reference No.
- Debit
- Credit
- Balance
- Transaction Type

#### Summary Bar  
- Shows total bank in, bank out, cash in, cash out across report period

#### Actions
- Export: PDF/Excel/CSV (`cbpbook-export-btn`)
- Print: (`cbpbook-print-btn`)

#### Validations
- Period required: "Date range is required."
- Server/DB connection errors: error banner at top

#### Loading/Empty
- Table skeletons
- "No transactions found for criteria."

#### API
- GET `/api/v1/reports/banking/cbp-book`

#### Test Identifiers
- cbpbook-filter-daterange
- cbpbook-filter-accounttype
- cbpbook-filter-transtype
- cbpbook-submit-btn
- cbpbook-table-row-[n]
- cbpbook-export-btn
- cbpbook-print-btn

---

### 108. PendingBillsLetter (Report)

**Route Path:** `/reports/pending-bills-letter`  
**Purpose:** Generate and view/print/export formal letters for outstanding bills, for distribution to customers/suppliers.
**PRD Ref:** FR-226, AgeWise Outstanding
**Access Roles:** `Accountant`, `Finance Supervisor`, `Administrator`

#### Layout & Structure
- Header: "Pending Bills Letter"
- Filter panel: recipient (customer/supplier), aging group (30/60/90/120), as-of date
- Results preview (letter grid or list), with customize/print/export per letter

#### Fields & UI Elements
- **Recipient Type Selector**
  - Label: "Recipient"
  - Dropdown: Customer, Supplier
  - Required
  - Data-testid: `pendingbills-filter-recipient`
- **Aging Bucket Selector**
  - Label: "Outstanding Age"
  - Dropdown: 0-30, 31-60, 61-90, 91-120, 120+ days
  - Required
  - Data-testid: `pendingbills-filter-age`
- **As-of Date Picker**
  - Label: "As of"
  - Defaults to today
  - Required
  - Data-testid: `pendingbills-filter-date`
- **Search Button**
  - Primary, label: "Generate Letters"
  - Data-testid: `pendingbills-submit-btn`

#### Results Table/Letter List
- Recipient Name
- Address/Email
- Aged Amount (per bucket)
- Outstanding Total
- Letter Preview button: opens modal of letter with merge tags applied (`pendingbills-preview-btn-[recipientId]`)
- Print: per-row action (`pendingbills-print-btn-[recipientId]`)
- Export: PDF/Word for bulk or per-recipient (`pendingbills-export-btn-[recipientId]`)

#### Actions
- Customize letter template (for admin): opens side panel (fields: template body, subject, footer)
- Global print/export all

#### Validations
- All filters required: "Please select recipient type, age group, and date."
- On empty: "No recipients have outstanding bills for this criteria."

#### Loading/Empty
- Table skeletons during search
- Letter preview skeleton while loading

#### API
- GET `/api/v1/reports/pending-bills-letter`

#### Test Identifiers
- pendingbills-filter-recipient
- pendingbills-filter-age
- pendingbills-filter-date
- pendingbills-submit-btn
- pendingbills-table-row-[n]
- pendingbills-preview-btn-[recipientId]
- pendingbills-print-btn-[recipientId]
- pendingbills-export-btn-[recipientId]

---

### 109. acFilterFrm (Audit Support Screen)

**Route Path:** `/finance/audit-support`  
**Purpose:** Provide advanced filtering of account, transaction, and reconciliation data for audit, compliance, and review purposes.  
**PRD Reference:** acFilterFrm Audit Support in Banking & Reconciliation  
**Access Roles:** `Finance Supervisor`, `Administrator`, `Auditor`

#### Layout & Structure
- Section header: "Audit Support Tools"
- Filter fields area (date, user, account, transaction status)
- Results table
- Export/print controls

#### Fields & UI Elements
- **Date Range**
  - Label: "Transaction Date"
  - Required
  - Data-testid: `auditfilter-date`
- **Account Selector**
  - Label: "Account"
  - Autocomplete/dropdown
  - Optional
  - Data-testid: `auditfilter-account`
- **User Selector**
  - Label: "User"
  - Dropdown, default "All"
  - Data-testid: `auditfilter-user`
- **Status Selector**
  - Label: "Transaction Status"
  - Dropdown: All, Pending, Approved, Posted, Failed, Reconciled
  - Data-testid: `auditfilter-status`
- **Filter/Apply Button**
  - Primary, label: "Filter"
  - Data-testid: `auditfilter-apply-btn`

#### Table Columns
- Date
- Account Name
- User
- Transaction Type
- Amount
- Status
- Reference No.
- Comments

#### Actions
- Export: PDF/Excel (`auditfilter-export-btn`)
- Print: (`auditfilter-print-btn`)

#### Validation
- Date required: "Please select transaction date range."
- API/server error: error banner at top

#### Loading/Empty
- Table skeletons
- "No transactions found for filter criteria."

#### API
- GET `/api/v1/finance/audit/logs?dateFrom=&dateTo=&account=&status=&user=`

#### Test Identifiers
- auditfilter-date
- auditfilter-account
- auditfilter-user
- auditfilter-status
- auditfilter-apply-btn
- auditfilter-table-row-[n]
- auditfilter-export-btn
- auditfilter-print-btn

---

### 110. missingAcSrlFrm (Audit Correction Screen)

**Route Path:** `/finance/audit-support/missing-ac-serials`  
**Purpose:** Identify and allow correction of missing or duplicate account serial (Vsrl) numbers in transaction data for data integrity required by FR-228.  
**PRD Reference:** missingAcSrlFrm  
**Access Roles:** `Finance Supervisor`, `Administrator`, `Auditor` (readonly for auditors)

#### Layout & Structure
- Header: "Missing Account Serial Numbers"
- Simple table/control panel

#### Fields & UI Elements
- **Search/Filter Bar**
  - Label: "Show"
  - Dropdown: All / Only Missing / Only Duplicates
  - Data-testid: `missingsrl-filter-mode`

- **Verify Button**
  - Re-runs scan
  - Data-testid: `missingsrl-scan-btn`

#### Data Table Columns
- Transaction Date
- Voucher Number
- Account Code
- Serial Number
- Status (Missing, Duplicate, OK)
- Action: "Edit Serial" (if allowed)

#### Actions
- Save correction (`missingsrl-save-btn-[rowId]`)
- Export: PDF/Excel for audit (`missingsrl-export-btn`)
- Print Table (`missingsrl-print-btn`)

#### Validation
- Inline error: "Serial cannot be left blank."
- If duplicate: "Serial number duplicate in period."

#### Loading/Empty
- Table skeleton
- "No missing/duplicate serials found."

#### API
- GET `/api/v1/finance/audit/missing-serials`
- PATCH `/api/v1/finance/audit/missing-serials/:id`

#### Test Identifiers
- missingsrl-filter-mode
- missingsrl-scan-btn
- missingsrl-edit-btn-[rowId]
- missingsrl-save-btn-[rowId]
- missingsrl-export-btn
- missingsrl-print-btn

---

### 111. GroupHlpFrm (Help/Support Screen)

**Route Path:** `/help/account-group`  
**Purpose:** Provide contextual help with group/account code selection during reconciliation and reporting, per PRD "GroupHlpFrm".  
**PRD Reference:** GroupHlpFrm  
**Access Roles:** All authenticated users

#### Layout & Structure
- Modal or side-panel when invoked
- Title: "Account Group Selection Help"
- Search bar
- List of group codes, names, example usage

#### Fields & UI Elements
- **Search Box**
  - Label: "Find Group"
  - Data-testid: `grouphelp-search-input`

#### Table/List Columns
- Group Code (copy button `grouphelp-copy-btn-[code]`)
- Group Name
- Type
- Description

#### Actions
- Copy to clipboard
- Insert code to calling field (when invoked from another screen)
- "Close" button/escape

#### Validation  
- Empty: "No group codes found for your search."
- API error: banner in modal

#### Loading
- Skeleton list while fetching

#### Test Identifiers
- grouphelp-search-input
- grouphelp-copy-btn-[groupCode]
- grouphelp-insert-btn-[groupCode]
- grouphelp-close-btn

---

### 112. SectionFrm (Data Maintenance Screen)

**Route Path:** `/admin/sections`  
**Purpose:** Create, edit, or remove work sections/bank sections for use in configuration and reporting.  
**PRD Reference:** SectionFrm  
**Access Roles:** `Finance Supervisor`, `Administrator`

#### Layout & Structure
- Page: "Section/Trade Maintenance"
- Table of sections with inline actions
- Section add/edit form (drawer or modal on add/edit)

#### Table Columns
- Section Code
- Section Name/Description
- Associated Accounts/Groups
- Status (Active/Inactive)
- Actions: Edit, Delete (with confirm)

#### Add/Edit Form Fields
- Section Code (required, disabled in edit)
- Section Name (required)
- Status Toggle
- Associated Groups/Accounts (multi-select, optional)

#### Actions
- Add Section (`section-add-btn`)
- Edit Section (`section-edit-btn-[id]`)
- Delete Section (`section-delete-btn-[id]`)
- Save (`section-save-btn`)
- Cancel (`section-cancel-btn`)
  
#### Validation
- Required: "Code is required", "Section name is required"
- Unique code on create: "Section code already exists."

#### Loading/Empty
- Table skeleton
- "No sections found."

#### API
- GET /api/v1/admin/sections
- POST /api/v1/admin/sections
- PUT /api/v1/admin/sections/:id
- DELETE /api/v1/admin/sections/:id

#### Test Identifiers
- section-add-btn
- section-edit-btn-[id]
- section-delete-btn-[id]
- section-save-btn
- section-cancel-btn

---

### 113. Table1 (Data Entity Support Screen)

**Route Path:** `/admin/table1-maintenance`  
**Purpose:** Provide data entry, edit, and review functions for Table1, used for specialized reconciliation or maintenance tasks.  
**PRD Reference:** Table1  
**Access Roles:** `Admin`

#### Layout & Structure
- Page: "Table1 Entity Support"
- Master table listing
- Add/Edit form pane

#### Table Columns
- ID (int)
- TableName (string, required)
- Sort (int, optional)
- Active (yes/no)
- Count (int)
- Actions: Edit, Delete

#### Add/Edit Form Fields
- TableName (required)
- Sort (int, optional)
- Active/Inactive toggle
- Count (int, read-only if set by system)

#### Actions
- Add Table1 row (`table1-add-btn`)
- Edit (`table1-edit-btn-[id]`)
- Save (`table1-save-btn`)
- Delete (`table1-delete-btn-[id]`)
- Export (table only, `table1-export-btn`)
- Print Table (`table1-print-btn`)

#### Validation
- TableName: Required — "Table Name is required."
- Sort: Must be integer if entered

#### Loading/Empty
- Table skeleton
- "No Table1 rows found."

#### API
- GET /api/v1/admin/table1
- POST /api/v1/admin/table1
- PUT /api/v1/admin/table1/:id
- DELETE /api/v1/admin/table1/:id

#### Test Identifiers
- table1-add-btn
- table1-edit-btn-[id]
- table1-save-btn
- table1-delete-btn-[id]
- table1-export-btn
- table1-print-btn

---

### 114. aaaaaaaaaaaaaa (Custom Data/Business Logic Screen)

**Route Path:** `/admin/aaaaaaaaaaaaaa`  
**Purpose:** Custom admin/business function page for specialized business logic, configurable via parameters—must support input of `catid`, `ItemType` and entity review/edit.  
**PRD Reference:** aaaaaaaaaaaaaa  
**Access Roles:** `Administrator`, custom role (if configured)

#### Layout & Structure
- Banner: "Custom Data Maintenance (aaaaaaaaaaaaaa)"
- Table grid
- Filter by catid/itemtype
- Add/Edit form

#### Table Columns
- CatId (string)
- ItemType (string)
- Actions: Edit, Delete

#### Filter Fields
- CatId (drop/select/search, optional)
- ItemType (drop/select/search, optional)

#### Add/Edit Form
- Catid (required)
- ItemType (required)

#### Actions
- Add new (`aaaa-add-btn`)
- Edit (`aaaa-edit-btn-[catid]`)
- Delete (`aaaa-delete-btn-[catid]`)
- Save (`aaaa-save-btn`)
- Cancel (`aaaa-cancel-btn`)
- Export Table CSV (`aaaa-export-btn`)

#### Validation
- Both fields required ("Cat ID is required", "Item type is required")
- Combo unique: "Duplicate catid and item type."

#### Loading/Empty
- Table skeleton; "No aaaaaaaaaaaaaa records."

#### API
- GET /api/v1/admin/aaaaaaaaaaaaaa
- POST /api/v1/admin/aaaaaaaaaaaaaa
- PUT /api/v1/admin/aaaaaaaaaaaaaa/:catid
- DELETE /api/v1/admin/aaaaaaaaaaaaaa/:catid

#### Test Identifiers
- aaaa-add-btn
- aaaa-edit-btn-[catid]
- aaaa-delete-btn-[catid]
- aaaa-save-btn
- aaaa-cancel-btn
- aaaa-export-btn

---

### 115. Form1 (General Data Review Screen)

**Route Path:** `/admin/system/form1`  
**Purpose:** Reserved for general data viewing, internal diagnostics, or system maintenance as described in PRD.  
**PRD Reference:** Form1  
**Access Roles:** `Administrator`

#### Layout & Structure
- Header: "General Data Review"
- Table view of recent system records
- No actions if read-only mode

#### Table Columns  
- ID (int)
- Entity/Table
- Description/Summary
- Last Updated
- Status

#### Actions
- Export Table (`form1-export-btn`)
- Print Table (`form1-print-btn`)
- (If allowed) Add/Edit/Delete

#### Validation  
- No inputs unless add/edit supported

#### Loading/Empty
- Table skeleton
- "No records found."

#### API
- GET /api/v1/admin/form1

#### Test Identifiers
- form1-export-btn
- form1-print-btn

---

### 116. Account Create/Delete/Update

**Route Path:** `/finance/accounts/edit/:code?` (for edit), `/finance/accounts/new` (for create)  
**Purpose:** Allow authorized users to create, update, or delete accounts, with clear validation, audit trail, and secure access.  
**PRD Reference:** Account Create/Delete/Update; FR-239–241, 245, 247, 248, 260  
**Access Roles:** `Accountant`, `Finance Supervisor`, `Administrator`

#### Layout & Structure  
- Form in glass card
- Title: "Account Management"

#### Fields & UI Elements
- **Account Code**
  - Label: "Account Code"
  - Input, required, unique (10 char max, disables on edit)
  - data-testid: `account-edit-code`
- **Account Name**
  - Required
  - data-testid: `account-edit-name`
- **Account Type**
  - Dropdown: Asset, Liability, Revenue, Expense, Equity
  - Required
  - data-testid: `account-edit-type`
- **Group Assignment**
  - Dropdown/autocomplete of group heads
  - Required
  - data-testid: `account-edit-group`
- **Status Toggle**
  - Active/Inactive radio or switch
  - data-testid: `account-edit-status`
- **Contact Details**
  - Optional phone, email fields (visible if account type = Customer/Supplier)
- **Notes**
  - Optional textarea
- **Parent Account**
  - Autocomplete/dropdown (optional)

#### Actions
- Save (primary, `account-edit-save-btn`)
- Delete (danger, only allowed if not referenced, `account-edit-delete-btn`)
- Cancel (`account-edit-cancel-btn`)
- View Audit Trail (`account-edit-audit-btn`)
  
#### Validations
- All required fields: "Field is required."
- Unique code check on create.
- Type and group required.
- Error if delete not allowed: "Account cannot be deleted as it is referenced by transactions."
- API/server error banner.

#### Loading/Empty
- Form skeletons on load
- Spinner on save/delete

#### API
- POST /api/v1/accounts
- PUT /api/v1/accounts/:code
- DELETE /api/v1/accounts/:code

#### Test Identifiers
- account-edit-code
- account-edit-name
- account-edit-type
- account-edit-group
- account-edit-status
- account-edit-save-btn
- account-edit-delete-btn
- account-edit-cancel-btn
- account-edit-audit-btn

---

### 117. Account Head Creation

**Route Path:** `/finance/accounts/head/new`  
**Purpose:** Allow users to create new account head records, assign hierarchy, and define group/type/parent.  
**PRD Reference:** Account Head Creation  
**Access Roles:** `Finance Supervisor`, `Administrator`, `Accountant`

#### Layout & Structure
- Glass panel form titled "New Account Head"

#### Fields & UI Elements
- **Head Name**
  - Label: "Account Head Name" (required)
  - Input field
  - Data-testid: `achead-new-name`
- **Head Code**
  - Label: "Code" (required, unique)
  - Input, max 10 chars
  - Data-testid: `achead-new-code`
- **Parent Account**
  - Dropdown/autocomplete, default none (optional)
  - Data-testid: `achead-new-parent`
- **Account Type**
  - Dropdown (as above)
  - Required
  - Data-testid: `achead-new-type`
- **Group**
  - Dropdown
  - Required
  - Data-testid: `achead-new-group`
- **Description**
  - Textarea, optional
  - Data-testid: `achead-new-desc`
- **Status**
  - Switch/toggle: Active/Inactive
  - Data-testid: `achead-new-status`
  
#### Actions
- Save (`achead-new-save-btn`)
- Cancel (`achead-new-cancel-btn`)
- Reset form (`achead-new-reset-btn`)
  
#### Validations
- All required fields: specific error
- Unique code validation
- Parent cannot be self: "Parent cannot be self."

#### Loading/Empty  
- Skeleton form on load/new

#### API
- POST /api/v1/accounts/heads

#### Test Identifiers
- achead-new-name
- achead-new-code
- achead-new-parent
- achead-new-type
- achead-new-group
- achead-new-desc
- achead-new-status
- achead-new-save-btn
- achead-new-cancel-btn
- achead-new-reset-btn

---

### 118. Account Head Help

**Route Path:** `/finance/accounts/head/help`  
**Purpose:** Provide context help and a reset option for account head entry/edit forms.  
**PRD Reference:** Account Head Help  
**Access Roles:** All authorized users

#### Layout & Structure  
- Modal or drawer-style help
- Title: "Account Head Entry Help"
- Step list or FAQ
- "Reset Form" button

#### Fields & UI Elements
- **FAQs**
  - Accordion style, each section
- **Field Tips**
  - Label + sample (e.g. "Code: 4-10 characters, must be unique")
- **Reset Button**
  - Resets parent form fields, not the FAQ modal
  - Data-testid: `achead-help-reset-btn`

#### Actions
- Close Help
- Reset Form (triggers on parent, not in modal)

#### Test Identifiers
- achead-help-reset-btn

---

### 119. Account Head List

**Route Path:** `/finance/accounts/heads`  
**Purpose:** Present all account heads as a searchable/sortable table.  
**PRD Reference:** Account Head List  
**Access Roles:** `Accountant`, `Finance Supervisor`, `Administrator`

#### Layout & Structure  
- Search & Filters bar
- Table: columns as below
- Export/print

#### Table Columns
- Code
- Name
- Parent (show code and name)
- Type
- Group
- Status (active/inactive)
- Created Date
- Last Edited
- Notes/Description
- Actions: View, Edit, Deactivate

#### Actions
- Export (PDF/Excel) (`acheadlist-export-btn`)
- Print (`acheadlist-print-btn`)

#### Filter/Search
- Text search (name or code)
- Type filter
- Group filter
- Status filter

#### Pagination  
- 25/50/100 per page

#### Empty/Loading/Error  
- Skeleton table, error banner if cannot fetch

#### API
- GET /api/v1/accounts/heads

#### Test Identifiers
- acheadlist-export-btn
- acheadlist-print-btn

---

### 120. New Account Head List

**Route Path:** `/finance/accounts/heads/new-list`
**Purpose:** Display recently created/new account heads for review/approval.
**PRD Reference:** New Account Head List
**Access Roles:** `Accountant`, `Supervisor`, `Finance Admin`

#### Layout & Structure
- Table (see fields below)
- Approve/Assign action
- Date, status

#### Table Columns
- Name
- Code
- Parent
- Type
- Added Date
- Status (Pending/Approved/Active)
- Approve Btn per row (`newhead-approve-btn-[headcode]`)

#### Actions
- Approve Head
- Export/print as above

#### Validations/Error
- Error banners, "No new heads found."

#### API:
- GET `/api/v1/accounts/heads?filter=new`

#### Test Identifiers
- newhead-approve-btn-[headcode]

---

### 121. Account Head Tree

**Route Path:** `/finance/accounts/head/tree`
**Purpose:** Show account head hierarchy as interactive tree.
**PRD Reference:** Account Head Tree
**Access Roles:** `Accountant`, `Finance Supervisor`, `Administrator`

#### Layout & Structure
- Left: Tree structure, collapsible
- Right: details panel for selected head

#### Tree Node
- Head Code/Name
- Has children = expandable icon
- Color: active/inactive shading

#### Details Panel
- All account head properties
- Edit button

#### Actions
- Expand/collapse branch
- Select Head
- Edit Head
- Export tree image/data (`acheadtree-export-btn`)

#### Test Identifiers
- acheadtree-node-[code]
- acheadtree-export-btn

---

### 122. Account Head Resorting

**Route Path:** `/finance/accounts/head/resort`
**Purpose:** Allow sorting and reordering of account heads in their parent group.
**PRD Ref:** Account Head Resorting
**Access Roles:** `Finance Supervisor`, `Admin`

#### Layout & Structure
- Drag/drop list/table of heads within selected group/parent
- Save/Reset/revert

#### Fields/UI
- List: Code, Name, Current Position
- Drag handle per row
- Save Sort Order Button (`acheadresort-save-btn`)
- Reset Sort Order Button (`acheadresort-reset-btn`)

#### Actions
- Reorder (`drag`)
- Save
- Reset

#### Validation/Error
- Visual error if duplicate/same position
- "Save failed." banner per result

#### API
- PATCH /api/v1/accounts/heads/resort

#### Test Identifiers
- acheadresort-save-btn
- acheadresort-reset-btn

---

### 123. Account Selector

**Route Path:** `/finance/accounts/select`  
**Purpose:** Provide searchable list/modal to select account, with live balances.
**PRD Reference:** Account Selector  
**Access Roles:** All accounting/finance users

#### Layout & Structure
- Search input; table/grid of results

#### Fields/UI
- Search box (label: "Find Account", autofocus, with icon)
- Table columns: Code, Name, Group, Type, Current Balance, Select (btn per row), View details

#### Actions
- Select Account (`acselector-select-btn-[code]`)
- View Details (opens modal with extra info)

#### Validation
- No results: "No accounts found."

#### Loading
- Table skeleton

#### API
- GET /api/v1/accounts?search=

#### Test Identifiers
- acselector-select-btn-[code]
- acselector-view-btn-[code]

---

### 124. Account Subdetails Display

**Route Path:** `/finance/accounts/:code/subdetails`
**Purpose:** Display subdetails/metadata for account, such as custom fields, contact, history.
**PRD Reference:** Account Subdetails Display  
**Access Roles:** `Accountant`, `Supervisor`, `Admin`

#### Layout & Structure
- Section header: "Account Subdetails for [Code]"
- Tabbed view: General, Notes, Linked Entities, Custom Fields, Activity history

#### Fields/UI (display only unless permitted)
- Custom field table: Label, Value
- Notes log: Date, User, Note
- Linked Entities: Type, ID, Name, Since, Status
- Activity: Date, Action, Old/New value

#### Actions
- Edit in-place (if permitted, action button per row)
- Add Note (`accsubdetails-addnote-btn`)
- Export (`accsubdetails-export-btn`)
- Print (`accsubdetails-print-btn`)

#### Validation
- Error banner if save fails or "Field is required" for new note

#### Loading
- Tab skeleton

#### API
- GET /api/v1/accounts/:code/subdetails

#### Test Identifiers
- accsubdetails-addnote-btn
- accsubdetails-export-btn
- accsubdetails-print-btn

---

### 125. Account Transaction Error

**Route Path:** `/finance/accounts/:code/error`
**Purpose:** Display/resolve transaction validation errors, provide guidance for correction.
**PRD Reference:** Account Transaction Error  
**Access Roles:** All accounting/finance users

#### Layout & Structure
- Header: "Account Transaction Error"
- Large alert/banner with error code/message
- Details section (troubleshooting steps, field-specific)

#### Fields/UI
- Error Code/Type (e.g. "INVALID_LEDGER_REF")
- Details (API error message, field, stack)
- Suggested Actions: steps/buttons (e.g. "Reset Form", "Retry", "Contact Support")

#### Actions
- "Acknowledge/Close" (`acctranerr-ack-btn`)
- "Retry" (`acctranerr-retry-btn`)
- "Contact Support" (`acctranerr-support-btn`)
- "Reset Form" (`acctranerr-reset-btn`)

#### Validation
- Action disables until resolved/acknowledged

#### API
- No direct API, but allows retry of last failed form POST

#### Test Identifiers
- acctranerr-ack-btn
- acctranerr-retry-btn
- acctranerr-support-btn
- acctranerr-reset-btn

---

## COVERAGE CHECK

| Screen Name                               | Status  |
|-------------------------------------------|---------|
| StockStatement                            | ✅ covered |
| StockValuationReport                      | ✅ covered |
| Bank Book                                 | ✅ covered |
| Cash Book                                 | ✅ covered |
| Bank Reconciliation                       | ✅ covered |
| Select Bank for Reconciliation            | ✅ covered |
| CBPBook (Report)                          | ✅ covered |
| PendingBillsLetter (Report)               | ✅ covered |
| acFilterFrm (Audit Support Screen)        | ✅ covered |
| missingAcSrlFrm (Audit Correction Screen) | ✅ covered |
| GroupHlpFrm (Help/Support Screen)         | ✅ covered |
| SectionFrm (Data Maintenance Screen)      | ✅ covered |
| Table1 (Data Entity Support Screen)       | ✅ covered |
| aaaaaaaaaaaaaa (Custom Data/Logic Screen) | ✅ covered |
| Form1 (General Data Review Screen)        | ✅ covered |
| Account Create/Delete/Update              | ✅ covered |
| Account Head Creation                     | ✅ covered |
| Account Head Help                         | ✅ covered |
| Account Head List                         | ✅ covered |
| New Account Head List                     | ✅ covered |
| Account Head Tree                         | ✅ covered |
| Account Head Resorting                    | ✅ covered |
| Account Selector                          | ✅ covered |
| Account Subdetails Display                | ✅ covered |
| Account Transaction Error                 | ✅ covered |

---

# FRONTEND_SPEC.md  
**FRONTEND PAGE SPECIFICATION — PART 6**

---

## 126. Account Tree in List View

### Route
`/accounts/head-tree-list`

### Purpose  
Visualizes the entire account head hierarchy as a searchable, filterable flat list. Enables auditors, supervisors, and administrators to quickly assess parent-child structure, relationship integrity, and perform targeted audits.

### PRD References  
FR-243, FR-249, FR-258, FR-264, BR-99

### Access Roles  
- Supervisor  
- Auditor  
- Administrator  

### Layout & Visuals
- **Page header:** "Account Head Hierarchy (Flat List View)"
- **Instructions:** "Review all account heads, parent relationships, and group hierarchy. Search or filter to audit tree health."
- **Main:** Glassmorphic card container, padding `var(--space-6)`, max-width 1120px.
- **Search/filter bar:** Above the table, with prominent field labels.
- **Table:** Responsive, flat list, sticky header, rows are selectable.

### Fields & Table Columns

| Field/Column        | Label                     | Type     | Notes                                               |
|---------------------|---------------------------|----------|-----------------------------------------------------|
| searchDescription   | Description               | text     | Autosuggest after 2 chars, matches partial/whole    |
| searchCode          | Account Code              | text     | Exact match or trailing wildcards                   |
| searchHead          | Parent (Head)             | dropdown | Populated from all unique parent head names         |
| searchGroup         | Group                     | dropdown | Populated from account group names                  |
| searchStatus        | Status                    | dropdown | "Active", "Hidden", "Locked", "All"                 |

#### Table Columns (flat view)

| Column         | Label           | Example             |
|----------------|----------------|---------------------|
| codes          | Account Code    | "1001"              |
| description    | Description     | "Current Assets"    |
| head           | Parent Head     | "Assets"            |
| headunder      | Head Under      | "0" (if top)        |
| group          | Group           | "Assets"            |
| display        | Displayed?      | "Yes"/"No"          |
| bank           | Is Bank?        | "✓"/""              |
| customer       | Is Customer?    | "✓"/""              |
| supplier       | Is Supplier?    | "✓"/""              |
| locked         | Locked?         | "✓"/""              |
| hidden         | Hidden?         | "✓"/""              |

- **Hierarchy depth** is visually shown via left-padding and a subtle vertical line (glass edge effect) for children.

### Action Buttons

- [Filter] button (primary, triggers table update; data-testid='account-tree-list-filter-apply')
- [Reset Filters] button (outline, clears filters; data-testid='account-tree-list-filter-reset')
- [Export] dropdown (PDF/Excel/CSV; primary button on right; data-testid='account-tree-list-export')

### Interactions

- Table supports sorting on any column (clickable headers).
- Row click opens Account Head Detail (route: `/accounts/heads/:code`).
- Keyboard accessible (tab through search fields, rows, export).
- Export prompt always shows modal—no direct download from table row.

### Validations & Errors

- Show inline error if filter returns no records: “No account heads match your filters.”
- API/network errors: toast + inline banner, data-testid='account-tree-list-api-error' — "Failed to load account head data. Please retry."
- Empty state: illustration + "No account heads to display." For new, empty DB (very rare).

### Loading/Skeleton State

- Skeleton rows (6), animated shimmer.
- Search and filter remain enabled during loading.
- Export button disabled while loading.

### Test Identifiers

- account-tree-list-page-root
- account-tree-list-search-description
- account-tree-list-search-code
- account-tree-list-search-head
- account-tree-list-search-group
- account-tree-list-search-status
- account-tree-list-filter-apply
- account-tree-list-filter-reset
- account-tree-list-table
- account-tree-list-row-[codes]
- account-tree-list-export
- account-tree-list-api-error
- account-tree-list-no-results
- account-tree-list-skeleton

---

## 127. AcheadList Report

### Route  
`/reports/account-heads`

### Purpose
Display a comprehensive report of all account heads for audit and review, with summary data and export/print features.

### PRD References  
FR-250, FR-242, US-210, FR-264, BR-90

### Access Roles  
- Supervisor  
- Auditor  
- Administrator  

### Layout & Visuals

- **Page header:** "Account Head List Report"
- **Filters:** Status (Active/Inactive/Hidden/All), Group, Type, Date created range.
- **Action bar:** Export (PDF, Excel, CSV), Print, Refresh.
- **Table:** Scrollable, sticky header, zebra rows for easier audit review.

### Table Columns

| Column         | Label         |
|----------------|--------------|
| codes          | Account Code  |
| description    | Description   |
| group          | Group         |
| head           | Parent Head   |
| headunder      | Head Under    |
| display        | Displayed?    |
| bank           | Is Bank       |
| customer       | Is Customer   |
| supplier       | Is Supplier   |
| status         | Status        |
| createdBy      | Created By    |
| createdAt      | Created Date  |
| locked         | Locked?       |
| hidden         | Hidden?       |

### Action Buttons
- [Export PDF] [Export Excel] [Export CSV] (grouped in a dropdown, primary)
- [Print List]
- [Refresh Table] (outline, always rightmost)

All have focus/aria support.

### Interactions

- Filters update table instantly (no explicit apply).
- Print preview opens modal.
- Export disables during loading/export.
- Sort by any column, default is 'description' ascending.
- Pagination if results exceed 100 (default 50 per page).

### Validations & Error States

- Inline banner for errors: "Unable to load account heads report."
- If export fails: show popup "Export failed. Try again, or contact your administrator."  
- Empty state: "No account head records available."
- Table disables all action buttons while loading/saving/exporting.

### Loading/Skeleton State

- Skeleton for table (8 rows, shimmer).
- Disabled states for action bar.

### Test Identifiers

- acheadlist-report-root
- acheadlist-filter-status
- acheadlist-filter-group
- acheadlist-filter-type
- acheadlist-filter-date-created
- acheadlist-table
- acheadlist-row-[codes]
- acheadlist-export-btn
- acheadlist-print-btn
- acheadlist-refresh-btn
- acheadlist-skeleton
- acheadlist-error-banner
- acheadlist-empty-state

---

## 128. Ledger Report

### Route  
`/reports/ledger`

### Purpose
Show transactions for a selected ledger head or account within a date range (voucher entry date). Use for audit, finance review, and regulatory compliance.

### PRD References  
FR-251, FR-245, US-211, US-212, FR-264, BR-96  

### Access Roles  
- Supervisor  
- Auditor  
- Administrator  
- (View only for Standard User if report access granted)

### Layout & Visuals

- **Page header:** "Ledger Report"
- **Filters:** Account selection (autocomplete, must match ledger account), Date Range (`From`/`To` date), Voucher Type (optional), Group (optional).
- **Show Opening/Closing Balance** toggle.

### Fields

| Field              | Label             | Validation                      |
|--------------------|-------------------|---------------------------------|
| ledgerAccount      | Ledger Account    | Required, must select existing  |
| dateFrom           | From Date         | Required, date ≤ To Date        |
| dateTo             | To Date           | Required, date ≥ From date      |
| voucherType        | Voucher Type      | Optional                        |
| groupFilter        | Group             | Optional                        |

### Table Columns

| Column          | Label      |
|-----------------|-----------|
| Date            | Date      |
| Voucher No      | Voucher # |
| Description     | Narration |
| Debit           | Debit     |
| Credit          | Credit    |
| Balance         | Balance   |
| Reference       | Ref #     |
| User            | User      |

- **Opening balance** row at top, **Closing balance** at bottom.

### Action Buttons

- [Run Report] (primary; triggers load, data-testid='ledger-report-run-btn')
- [Export PDF] [Export Excel] [Export CSV] (dropdown, data-testid='ledger-report-export-btn')
- [Print] (opens print preview modal, data-testid='ledger-report-print-btn')

### Interactions

- Account select: text search with typeahead, required before running.
- Date pickers are always calendar widgets.
- Table supports row highlight on hover/focus.  
- Sorting on Date, Voucher No, or Balance.
- Tooltip for each debit/credit cell: “Click for voucher details”.
- Clicking a voucher no. opens Voucher Display page (`/vouchers/:vsrl`).

### Validations & Errors

- Required field errors inline below field: "Please select an account", "Select a valid date range."
- API/network errors: inline error banner + toast, data-testid='ledger-report-error-banner'.
- Empty state: "No ledger transactions found for this filter."  
- Export disables while loading or running a report.

### Loading/Skeleton State

- Form: disables controls during run/export.
- Table: skeleton rows (6), shimmer.
- Action bar disables during async.

### Test Identifiers

- ledger-report-root
- ledger-report-ledger-account
- ledger-report-date-from
- ledger-report-date-to
- ledger-report-voucher-type
- ledger-report-group-filter
- ledger-report-run-btn
- ledger-report-export-btn
- ledger-report-print-btn
- ledger-report-table
- ledger-report-row-[vsrl]
- ledger-report-error-banner
- ledger-report-empty-state
- ledger-report-skeleton

---

## 129. Ledger_ActualDate Report

### Route  
`/reports/ledger/actual-date`

### Purpose  
Show ledger transactions using the transaction "actual date" (cheque date if PDC, entry date otherwise). Used for period-end closing, cashflow, and real balance analysis.

### PRD References  
FR-252, US-213, FR-264

### Access Roles  
- Supervisor  
- Auditor  
- Administrator  

### Layout & Visuals

- **Page header:** "Ledger (Actual Date) Report"
- **Filters:**  
  - Ledger Account (autocomplete; required)
  - Actual From Date
  - Actual To Date
- **Settings/legend:** Info banner: "This report uses cheque date for PDCs, voucher date otherwise."

### Table Columns

- Actual Date
- Voucher No
- Description/Narration
- Debit
- Credit
- Running Balance
- Reference
- User

- Opening/closing balance as in regular Ledger.

### Action Buttons

- [Generate] (primary)
- [Export] (PDF/Excel/CSV)
- [Print]

### Interactions

- Account selection and form validations as in Ledger Report.
- Hover/clicks open voucher details as in Ledger Report.
- Export disables while running.

### Error/Loading

- All validation rules as Ledger Report.
- Show inline error at filter: "Select a valid actual date range."
- API error: full-page error + retry.
- Loading skeleton: shimmer 6 table rows.

### Test Identifiers

- ledger-actualdate-report-root
- ledger-actualdate-ledger-account
- ledger-actualdate-date-from
- ledger-actualdate-date-to
- ledger-actualdate-generate-btn
- ledger-actualdate-export-btn
- ledger-actualdate-print-btn
- ledger-actualdate-table
- ledger-actualdate-row-[vsrl]
- ledger-actualdate-error-banner
- ledger-actualdate-skeleton

---

## 130. Ledger_Pdc Report

### Route  
`/reports/ledger/pdc`

### Purpose
Show ledger entries involving post-dated cheques (PDC), based fully on PDC (cheque) date, to support cashflow and future planning review.

### PRD References  
FR-253, US-214, FR-264

### Access Roles  
- Supervisor  
- Auditor  
- Administrator  

### Layout & Visuals

- **Page header:** "Ledger: Post-Dated Cheques Report"
- **Filters:**  
  - Account (autocomplete, required)
  - PDC From Date
  - PDC To Date
  - (Optional) PDC Account filter (dropdown, shows only PDC-enabled accounts)

### Table Columns

- Cheque Date ("PDC Date")
- Voucher No
- Description
- Debit
- Credit
- PDC Account
- Cheque Number
- Due Date
- Amount
- Status ("Cleared"/"Pending"/"Bounced")
- User

### Action Buttons

- [Run Report] (primary)
- [Export] (all standard formats)
- [Print]
- Export disables while query running.

### Validations & Errors

- All date/account validations, with errors directly below offending field.
- Empty state: "No PDC ledger items found for filters."
- API/network: banner at top, data-testid='ledger-pdc-error-banner'.

### Loading/Skeleton

- Action bar disables during query/export.
- Table: 6 skeleton shimmer rows.

### Test Identifiers

- ledger-pdc-root
- ledger-pdc-account
- ledger-pdc-date-from
- ledger-pdc-date-to
- ledger-pdc-pdc-account-filter
- ledger-pdc-run-btn
- ledger-pdc-export-btn
- ledger-pdc-print-btn
- ledger-pdc-table
- ledger-pdc-row-[vsrl]
- ledger-pdc-error-banner
- ledger-pdc-skeleton

---

## 131. LedgerSummary Report

### Route  
`/reports/ledger-summary`

### Purpose  
Present ledger balances with opening, periodic, and closing summaries for selected period and accounts — for management review and quick audits.

### PRD References  
FR-254, US-211, FR-264

### Access Roles  
- Supervisor  
- Auditor  
- Administrator  

### Layout & Visuals

- **Page header:** "Ledger Summary Report"
- **Filters:**  
  - Account/group selection (autocomplete, multi-select supported)
  - Date range (from/to)
  - Summarize by month/quarter/year (toggle/group)

### Table Columns

| Column           | Label            |
|------------------|------------------|
| Account Name     | Account          |
| Opening Balance  | Opening Balance  |
| Period Debit     | Debits           |
| Period Credit    | Credits          |
| Closing Balance  | Closing Balance  |
| Period           | Reporting Period |

- Rows grouped per account, sub-grouped per period if grouped by month/quarter.

### Action Buttons

- [Show Summary] (primary)
- [Export] (PDF/Excel/CSV)
- [Print]

### Interactions

- Export supports current filters and grouping.
- Table rows expandable to detailed drilldown (route to ledger).

### Validation & Error

- Required field errors/shown inline.
- API error: banner with “Unable to load ledger summary”.
- Empty state: “No summary records available for this filter.”

### Loading/Skeleton

- Table skeleton 6 rows.
- Action bar disables during export/run.

### Test Identifiers

- ledger-summary-root
- ledger-summary-account-group
- ledger-summary-date-from
- ledger-summary-date-to
- ledger-summary-group-toggle
- ledger-summary-show-btn
- ledger-summary-export-btn
- ledger-summary-print-btn
- ledger-summary-table
- ledger-summary-row-[account]
- ledger-summary-error-banner
- ledger-summary-skeleton

---

## 132. Auto Receipt Entry

### Route  
`/receipts/auto-entry`

### Purpose  
Facilitate fast entry and allocation of multiple cash and bank receipts in a streamlined, keyboard-driven grid format.

### PRD References  
FR-266, FR-272, US-230, BR-101, FR-275

### Access Roles  
- Standard User  
- Finance Supervisor  
- Administrator  

### Layout & Visuals

- **Card container:** Glassmorphic, with sticky section toolbar.
- **Table/grid:** Each row = one receipt entry. Bulk grid entry with inline validation.
- **Header:** "Auto Receipt Entry"
- **Instructions:** Atop form — “Tab through fields to allocate multiple receipts quickly. All required fields must be filled prior to save.”

### Entry Fields (columns per new row)

| Column/Field     | Label                   | Input type            | Validation + Error                |
|------------------|-------------------------|-----------------------|-----------------------------------|
| date             | Receipt Date            | Date picker           | Required                          |
| method           | Payment Method          | Dropdown ("Cash", "Bank")  | Required                  |
| party            | Customer/Supplier       | Autocomplete combo    | Required                          |
| amount           | Amount                  | Numeric               | >0, required, “Enter amount”      |
| allocation       | Allocation Description  | Text                  | Optional                          |
| reference        | Reference No            | Text                  | Optional                          |
| memo             | Memo/Note               | Textarea (compact)    | Optional, max 150 chars           |
| status           | Status                  | Pill (readonly: “Pending”, set after save) | –                |

- **Add row** button adds a new empty row (always present last)
- Each row has [Save] (primary inline, data-testid='auto-receipt-save-row-[index]')
- [Delete] icon per row removes draft/unsaved, confirmation for already submitted rows

### Action Buttons (toolbar, top right)

- [Save All Receipts] (primary large, data-testid='auto-receipt-save-all')
- [Clear All] (outline, resets form; data-testid='auto-receipt-clear-all')

### Interactions

- Tab/Shift-Tab moves across grid fields.
- Keyboard Enter submits current row if valid.
- On Save, row locks fields and shows "Pending" (status); any API failure shows error icon.
- All errors shown inline next to problem field.
- “Receipt saved” toast per successful save.

### Validations

- Any missing required field: show red border + “Required” error.
- Amount cannot be <=0.
- Invalid party (not in autocomplete): “Select a valid party.”
- Max rows: 50 at once; attempt to add more shows banner "Limit 50 at a time."
- API error on save: “Failed to save receipt” next to row.

### Loading/Skeleton

- During save: skeleton shimmer over row(s) being saved, data-testid='auto-receipt-row-skeleton-[index]'
- Save buttons disabled during async.
- [Save All] disables if no valid rows or any row has errors.

### Test Identifiers

- auto-receipt-page-root
- auto-receipt-entry-grid
- auto-receipt-row-[index]
- auto-receipt-save-row-[index]
- auto-receipt-delete-row-[index]
- auto-receipt-save-all
- auto-receipt-clear-all
- auto-receipt-row-skeleton-[index]
- auto-receipt-error-[index]-[field]
- auto-receipt-toast-saved
- auto-receipt-api-error

---

## 133. Payment Entry

### Route  
`/payments/entry`

### Purpose  
Enable creation and management of outgoing payments and settlements, capturing all necessary allocation details.

### PRD References  
FR-267, US-231, US-233, FR-272, BR-100, BR-101

### Access Roles  
- Standard User  
- Finance Supervisor  
- Administrator  

### Layout & Visuals

- **Header:** "Payment Entry"
- **Instructions:** Above form — “Record all outgoing payments, confirm allocations before finalizing.”
- **Form Section:** Entry fields in grouped blocks, glass card.

#### Fields

| Field            | Label             | Type      | Validation/Error           |
|------------------|-------------------|-----------|----------------------------|
| paymentDate      | Payment Date      | Date      | Required                   |
| payeeType        | Payee Type        | Dropdown  | Required (Customer/Supplier/Other) |
| payee            | Payee             | Autocomplete | Required                  |
| paymentType      | Payment Type      | Dropdown  | Required (“Cash”, “Bank”, “Cheque”, “Transfer”) |
| amount           | Amount            | Numeric   | >0, Required, max 2 decimals |
| refNo            | Reference/Cheque  | Text      | Required for Cheque type   |
| status           | Status            | Pill      | "Pending" (readonly, default) |
| memo             | Memo/Reason       | Textarea  | Optional (max 100 chars)  |
| allocationList   | Allocation        | Table     | Optional, editable breakdown |

- AllocationList supports split allocation to multiple invoices (if enabled), with Amount, Invoice/Reference, “Add Another Allocation” row.

### Action Buttons

- [Save Payment] (primary, data-testid='payment-entry-save-btn')
- [New Payment] (outline, clears form for next, data-testid='payment-entry-new-btn')
- [Allocate] (opens allocation modal, optional; data-testid='payment-entry-allocate-btn' if present)

### Interactions

- Validations run on Save; errors inline below each field.
- Saving disables all fields + [Save] button.
- On success: toast “Payment saved and pending approval”.
- If allocation incomplete: red border on “Allocation”, message: “Add allocation details”

### Validations

- Missing required: inline under field.
- Cheque number: Required if “Cheque” type, else optional.
- Amount: Must be >0 and <= available balance.
- Payee: Must exist in system; else error “Invalid payee selected.”

### Loading/Skeleton

- Glass form disables inputs and shows spinner bar during save.
- [Save Payment] disables while saving.

### Test Identifiers

- payment-entry-root
- payment-entry-date
- payment-entry-payee-type
- payment-entry-payee
- payment-entry-type
- payment-entry-amount
- payment-entry-refNo
- payment-entry-status
- payment-entry-memo
- payment-entry-allocation-table
- payment-entry-save-btn
- payment-entry-new-btn
- payment-entry-allocate-btn
- payment-entry-error-[field]
- payment-entry-skeleton
- payment-entry-toast-saved
- payment-entry-api-error

---

## 134. Receipt Entry

### Route  
`/receipts/entry`

### Purpose  
Streamlined entry of incoming payments (receipts), with fast lookup, allocation, and audit tracking.

### PRD References  
FR-268, US-232, FR-272, BR-101

### Access Roles  
- Standard User  
- Finance Supervisor  
- Administrator  

### Layout & Visuals

- **Header:** "Receipt Entry"
- **Instructions:** “Enter all incoming payment details and link to correct payer/account.”
- **Glass form card:** fields are vertically stacked with spacing.
- [View Receipts List] link to `/receipts/list` in subheader.

#### Fields

| Field            | Label             | Input type           | Validation                                 |
|------------------|-------------------|----------------------|---------------------------------------------|
| receiptDate      | Receipt Date      | Date                 | Required                                   |
| receivedFrom     | Received From     | Dropdown (Customer/Supplier/Other) | Required                        |
| payer            | Payer/Source      | Autocomplete         | Required                                   |
| paymentMethod    | Payment Method    | Dropdown             | Required                                   |
| amount           | Amount            | Numeric              | >0, Required                               |
| refNo            | Reference Number  | Text                 | Optional                                   |
| allocation       | Allocation Note   | Text                 | Optional                                   |
| memo             | Memo/Remarks      | Textarea             | Optional (max 120 chars)                   |
| status           | Status            | Pill (readonly)      | Always shows "Pending" for new entries     |

### Action Buttons

- [Save Receipt] (primary)
- [New Receipt] (outline; resets fields, data-testid='receipt-entry-new-btn')
- [Add Allocation] (opens advanced allocation modal, optional)

### Interactions

- Save disables fields/buttons, shows loading.
- Error: any missing required shows red border, with error below field.
- Save triggers toast: “Receipt saved and pending approval.”

### Validations

- Amount >0, Required.
- Date required.
- Payer must be valid, error shown if not found.
- Memo optionally limited to 120 chars.
- Required fields show "Required" below.

### Loading/Skeleton

- During Save: overlay spinner, disables actions.
- API/network error: full-width error bar under header.

### Test Identifiers

- receipt-entry-root
- receipt-entry-date
- receipt-entry-from
- receipt-entry-payer
- receipt-entry-method
- receipt-entry-amount
- receipt-entry-refNo
- receipt-entry-allocation
- receipt-entry-memo
- receipt-entry-status
- receipt-entry-save-btn
- receipt-entry-new-btn
- receipt-entry-allocation-btn
- receipt-entry-skeleton
- receipt-entry-error-[field]
- receipt-entry-toast-saved
- receipt-entry-api-error

---

## 135. Petty Cash Entry

### Route  
`/receipts/petty-cash`

### Purpose  
Entry and management of all petty cash transactions for transparent operational control.

### PRD References  
FR-269, US-234

### Access Roles  
- Standard User  
- Finance Supervisor  
- Administrator  

### Layout & Visuals

- **Header:** "Petty Cash Entry"
- **Instructions:** "Record every petty cash in/out transaction for traceability."
- **Glass form card,** summary at top ("Current petty cash balance: ₹X.XX")
- Table view for last 10 petty cash entries below the form.

#### Fields

| Field         | Label             | Input type    | Validation                         |
|---------------|-------------------|---------------|-------------------------------------|
| txnDate       | Date              | Date picker   | Required                            |
| type          | Type              | Dropdown: "Inflow" / "Outflow" | Required        |
| amount        | Amount            | Numeric       | >0, Required, no negative           |
| purpose       | Purpose/Category  | Text          | Required, max 60 chars              |
| approve       | Approval Status   | Pill          | "Pending" / "Approved" (Readonly)   |
| memo          | Memo              | Textarea      | Optional (max 100 chars)            |
| refNo         | Reference         | Text          | Optional                            |

### Action Buttons

- [Save Transaction] (primary, data-testid='petty-cash-save-btn')
- [Reset Form] (outline, data-testid='petty-cash-reset-btn')

### Table Columns (Recent Transactions)

| Date    | Type       | Amount   | Purpose    | Status     | Memo    | Reference  |

### Interactions

- On Save: disables form, shows spinner bar.
- Reset clears all fields.
- Adding Outflow cannot cause balance to go negative: error "Insufficient petty cash" on save.
- Inline errors for required or invalid fields.
- Success toast: "Petty cash entry recorded and pending approval."

### Loading/Skeleton

- Form disables while saving.
- Table skeleton for recent txns on initial load.

### Test Identifiers

- petty-cash-entry-root
- petty-cash-form-date
- petty-cash-form-type
- petty-cash-form-amount
- petty-cash-form-purpose
- petty-cash-form-approve
- petty-cash-form-memo
- petty-cash-form-refNo
- petty-cash-save-btn
- petty-cash-reset-btn
- petty-cash-table
- petty-cash-table-row-[id]
- petty-cash-table-skeleton
- petty-cash-error-[field]
- petty-cash-toast-saved

---

## 136. Payment Finalization

### Route  
`/payments/finalize`

### Purpose  
Allow supervisors/admins to finalize payments by marking as posted or settled, review pending list, and control workflow posting.

### PRD References  
FR-270, FR-273, FR-275, US-233

### Access Roles  
- Finance Supervisor  
- Administrator  

### Layout & Visuals

- **Header:** "Pending Payments for Finalization"
- **Info banner:** "Only approved payments may be posted. Finalized payments cannot be edited."
- **Glass table card**: All rows = pending payments not yet posted.

#### Table Columns

| Checkbox | Payee      | Date     | Type      | Amount   | Ref/Cheque | Status   | Approver | Finalize/Undo |

- [Select all] checkbox for bulk finalize.

### Action Buttons

- [Finalize Selected Payments] (primary, disables unless at least one checked)
- [Undo Finalization] (outline, opens confirm modal, per row)
- [Refresh] (outline)

### Interactions

- Click row to expand payment detail drawer.
- Finalize opens confirm modal: "Are you sure you want to mark X payment(s) as posted? This action cannot be undone except before posting date."
- Undo only on items not yet posted, always requires confirm dialog.
- No edit on finalized rows, faded styling.
- All responses with toast confirmations.

### Validations & Errors

- If posting fails: banner at top "Failed to finalize payments."
- Undo: error if payment already posted — “Cannot undo posted payment.”

### Loading/Skeleton

- During finalize: shows spinner on button.
- Rows being processed show inline shimmer.

### Test Identifiers

- payment-finalization-root
- payment-finalization-table
- payment-finalization-table-row-[id]
- payment-finalization-row-finalize-btn
- payment-finalization-row-undo-btn
- payment-finalization-select-all
- payment-finalization-finalize-selected
- payment-finalization-refresh
- payment-finalization-detail-drawer
- payment-finalization-row-skeleton
- payment-finalization-error-banner
- payment-finalization-toast-finalized
- payment-finalization-toast-undo

---

## 137. Pending Add Payment

### Route  
`/payments/pending-add`

### Purpose  
Show list of payment requests pending supervisor approval, allow bulk or per-row approval/rejection.

### PRD References  
FR-271, FR-273, US-241, US-243

### Access Roles  
- Standard User (add/view own, read only)
- Finance Supervisor (approve/reject)

### Layout & Visuals

- **Header:** "Pending Payment Requests"
- [Submit New Payment Request] (outline, opens modal)
- Table: List of all pending payment requests

#### Table Columns

| Date | Requestor | Amount | Payee | Type | Reference | Status | Approve | Reject |

### Action Buttons

- [Approve Selected] (primary, disabled if none selected)
- [Reject Selected] (danger/outline)

### Interactions

- All rows have [Approve] and [Reject] inline if status = "Pending".
- Clicking Approve/Reject triggers confirm modal per row; bulk for checked items.
- [Submit New Payment Request] opens slide-in modal with Payment Entry fields (see Payment Entry spec), limited fields if standard user.

### Validations & Errors

- Only pending items are actionable, others are faded with tooltip.
- Banner if no pending requests: "No pending payment requests."
- API/network error: "Unable to fetch pending payments."
- Approve/reject errors: inline in affected row.

### Loading/Skeleton

- Table skeleton rows, disables bulk actions while loading.
- Spinner inline for row during approve/reject.

### Test Identifiers

- pending-add-payment-root
- pending-add-payment-submit-btn
- pending-add-payment-table
- pending-add-payment-row-[id]
- pending-add-payment-row-approve
- pending-add-payment-row-reject
- pending-add-payment-approve-selected
- pending-add-payment-reject-selected
- pending-add-payment-modal
- pending-add-payment-modal-field-[field]
- pending-add-payment-error-[rowid]
- pending-add-payment-table-skeleton

---

## 138. Pending Add Receipt

### Route  
`/receipts/pending-add`

### Purpose  
Show list of receipts waiting for supervisor approval, allow approval or rejection individually or in bulk.

### PRD References  
FR-272, US-241, US-243

### Access Roles  
- Standard User (add/view own, read only)
- Finance Supervisor (approve/reject)

### Layout & Visuals

- **Header:** "Pending Receipt Approvals"
- [Submit Pending Receipt] (outline, opens modal)
- Table: All pending receipts

#### Table Columns

| Date | Requestor | Amount | Received From | Method | Reference | Status | Approve | Reject |

### Action Buttons

- [Approve Selected]
- [Reject Selected]

### Interactions

- Row [Approve] and [Reject] only enabled on pending status.
- [Submit Pending Receipt] opens form (per Receipt Entry spec), limited fields for Standard User.
- Approved rows are read-only, greyed.

### Validations & Errors

- All errors inline, banner for general errors.
- Empty state: "No pending receipts."
- API fetch/save errors shown as toast + inline row error.

### Loading/Skeleton

- Table shimmers, disables action bar controls during async.
- Inline spinner per row for approve/reject.

### Test Identifiers

- pending-add-receipt-root
- pending-add-receipt-submit-btn
- pending-add-receipt-table
- pending-add-receipt-row-[id]
- pending-add-receipt-row-approve
- pending-add-receipt-row-reject
- pending-add-receipt-approve-selected
- pending-add-receipt-reject-selected
- pending-add-receipt-modal
- pending-add-receipt-modal-field-[field]
- pending-add-receipt-error-[rowid]
- pending-add-receipt-table-skeleton

---

## 139. Receipts (Report)

### Route  
`/reports/receipts`

### Purpose  
Show a report of all receipts for selected filters and allow export/print for reconciliation, financial closing, and audit.

### PRD References  
FR-277, US-236

### Access Roles  
- Standard User (own)
- Finance Supervisor  
- Administrator  

### Layout & Visuals

- **Header:** "Receipts Report"
- **Filters:** Date range, receipt method, customer/supplier, status.
- Export bar: PDF, Excel, CSV
- Glass table card

#### Table Columns

| Receipt No | Date | Payer | Method | Amount | Allocation | Status | Approved By |

### Action Buttons

- [Export PDF]
- [Export Excel]
- [Export CSV]
- [Print Report]

### Interactions

- Filters update table on apply.
- Clicking row opens Receipt Detail page `/receipts/:id`.
- Print shows modal preview.

### Validations & Errors

- If no records: “No receipts match these filters.”
- API/network: error underline banner.
- Export disables during load/export.

### Loading/Skeleton

- Table: shimmer skeleton
- All export/print disables during loading.

### Test Identifiers

- receipts-report-root
- receipts-report-filter-date-from
- receipts-report-filter-date-to
- receipts-report-filter-method
- receipts-report-filter-party
- receipts-report-filter-status
- receipts-report-table
- receipts-report-row-[id]
- receipts-report-export-pdf
- receipts-report-export-excel
- receipts-report-export-csv
- receipts-report-print
- receipts-report-error-banner
- receipts-report-table-skeleton

---

## 140. Payments (Report)

### Route  
`/reports/payments`

### Purpose  
Show a report of all outgoing payments, with filter/export/print.

### PRD References  
FR-277, US-236

### Access Roles  
- Standard User (own)
- Finance Supervisor  
- Administrator  

### Layout & Visuals

- **Header:** "Payments Report"
- **Filters:** Date range, payee, type (cash/cheque/bank), status.
- Action bar: Export/Print

#### Table Columns

| Payment No | Date | Payee | Type | Amount | Allocation | Status | Approved By |

### Action Buttons

- All export/print as in Receipts (Report)
- Click row opens Payment Detail Page `/payments/:id`

### Validations & Errors

- All errors inline; same messages as Receipts (Report)

### Loading/Skeleton

- Table shimmer, disables during load/export.

### Test Identifiers

- payments-report-root
- payments-report-filter-date-from
- payments-report-filter-date-to
- payments-report-filter-type
- payments-report-filter-payee
- payments-report-filter-status
- payments-report-table
- payments-report-row-[id]
- payments-report-export-pdf
- payments-report-export-excel
- payments-report-export-csv
- payments-report-print
- payments-report-error-banner
- payments-report-table-skeleton

---

## 141. Receipt-Backup (Report)

### Route  
`/reports/receipts-backup`

### Purpose  
Show backup/alternate record of receipts for recovery, audit, and compliance view.

### PRD References  
FR-278, US-240

### Access Roles  
- Finance Supervisor  
- Administrator  

### Layout & Visuals

- **Header:** "Receipt Backup Report"
- **Filters:** Date range, customer/supplier, backup date.
- Action bar: Export/Print, always shows "Backup" status prominently.

#### Table Columns

| Receipt No | Date | Party | Amount | Backup Date | Backup Ref | Status | Differences |

### Action Buttons

- [Export] (PDF, Excel, CSV)
- [Print Backup]

### Interactions

- All filters as in Receipts Report.
- Export disables during load/export.

### Validations & Errors

- Empty state: “No backup receipts available.”
- API/network: banner at top.
- Only supervisors/admins may export or print.

### Loading/Skeleton

- Table skeleton shimmer

### Test Identifiers

- receipts-backup-report-root
- receipts-backup-report-filter-date-from
- receipts-backup-report-filter-date-to
- receipts-backup-report-filter-party
- receipts-backup-report-filter-backup-date
- receipts-backup-report-table
- receipts-backup-report-row-[id]
- receipts-backup-report-export-btn
- receipts-backup-report-print-btn
- receipts-backup-report-error-banner
- receipts-backup-report-table-skeleton

---

## 142. Pdc_Issue_Voucher (Report)

### Route  
`/reports/pdc-issue-vouchers`

### Purpose  
List post-dated cheque issuance entries for tracking, bank compliance, and auditing.

### PRD References  
FR-277, US-239, FR-276

### Access Roles  
- Finance Supervisor  
- Administrator  
- Standard User (view only for own)

### Layout & Visuals

- **Header:** "PDC Issue Voucher List"
- **Filters:** Date range, payee, bank, status (Issued/Cleared/Bounced).
- Action bar: Export/Print

#### Table Columns

| Issue Date | Payee | Cheque # | Cheque Date | Amount | Bank | Status |

### Action Buttons

- [Export PDF/Excel/CSV]
- [Print Vouchers]

### Interactions

- Click row opens Voucher Detail.

### Validations & Errors

- All fields required for export.
- API/network: inline banner.

### Loading/Skeleton

- Full-table shimmer
- Action bar disables during query/export

### Test Identifiers

- pdc-issue-voucher-report-root
- pdc-issue-voucher-report-filter-date-from
- pdc-issue-voucher-report-filter-date-to
- pdc-issue-voucher-report-filter-payee
- pdc-issue-voucher-report-filter-bank
- pdc-issue-voucher-report-filter-status
- pdc-issue-voucher-report-table
- pdc-issue-voucher-report-row-[id]
- pdc-issue-voucher-report-export-btn
- pdc-issue-voucher-report-print-btn
- pdc-issue-voucher-report-error-banner
- pdc-issue-voucher-report-table-skeleton

---

## 143. Pdc_Receipt_Voucher (Report)

### Route  
`/reports/pdc-receipt-vouchers`

### Purpose  
List post-dated cheque receipts for audit and cash management.

### PRD References  
FR-277, US-239, FR-276

### Access Roles  
- Finance Supervisor  
- Administrator  
- Standard User (own view)

### Layout & Visuals

- **Header:** "PDC Receipt Voucher List"
- **Filters:** Date range, payer, bank, status.
- Action bar: Export/Print

#### Table Columns

| Receipt Date | Payer | Cheque # | Cheque Date | Amount | Bank | Status |

### Action Buttons

- [Export PDF/Excel/CSV]
- [Print Vouchers]

### Interactions

- Click row opens Receipt/Voucher Detail.

### Validations & Errors

- Same as Pdc_Issue_Voucher report.

### Loading/Skeleton

- Table shimmer, disables actions on async.

### Test Identifiers

- pdc-receipt-voucher-report-root
- pdc-receipt-voucher-report-filter-date-from
- pdc-receipt-voucher-report-filter-date-to
- pdc-receipt-voucher-report-filter-payer
- pdc-receipt-voucher-report-filter-bank
- pdc-receipt-voucher-report-filter-status
- pdc-receipt-voucher-report-table
- pdc-receipt-voucher-report-row-[id]
- pdc-receipt-voucher-report-export-btn
- pdc-receipt-voucher-report-print-btn
- pdc-receipt-voucher-report-error-banner
- pdc-receipt-voucher-report-table-skeleton

---

## 144. Bulk Journal Voucher Entry

### Route  
`/vouchers/bulk-journal-entry`

### Purpose  
Enable import and processing of multiple journal voucher transactions in a single batch (from spreadsheet or grid UI).

### PRD References  
FR-300, US-250, FR-315, BR-118

### Access Roles  
- Standard User (import)
- Finance Supervisor (review/approve)
- Administrator (full)

### Layout & Visuals

- **Header:** "Bulk Journal Voucher Entry"
- **Instructions:** "Import journal vouchers from spreadsheet, validate, and submit in batch."
- **Glass-card:** with drag-and-drop import area.

#### Fields

| Field          | Label         | Input Type      | Validation                  |
|----------------|---------------|-----------------|-----------------------------|
| importFile     | Import File   | File Upload     | .xls/.csv only, required    |
| entryGrid      | Entry Preview | Editable Grid   | Required fields per row     |
| batchStatus    | Status        | Pill (readonly) | “Draft”, “Validating”, “Ready”, “Failed” |
| comment        | Batch Notes   | Textarea        | Optional, 200 char max      |

#### Entry Grid Columns

| Date | Account | Debit | Credit | Narration | Reference |

- Displays all rows in upload. Fields can be edited pre-submit.

### Action Buttons

- [Import File] (primary)
- [Validate Entries] (outline; triggers field checks)
- [Submit Batch] (primary, disables until valid)
- [Cancel Batch] (outline/cancel, confirmation dialog)

### Interactions

- File drag/drop or select button for import.
- Inline cell validation for each field, error icons in cell.
- Progress bar after upload (“Validating entries…”).
- Errors show per row/field, batch status pill shows error count.

### Validations

- Must have balanced debits and credits per voucher: error "Debits and credits do not balance" (per voucher).
- No duplicate voucher numbers.
- All required fields present.
- Dates not in future.

### Loading/Skeleton

- Progress indicator after upload, disables grid until validated.
- [Submit Batch] disables during process.

### Test Identifiers

- bulk-journal-entry-root
- bulk-journal-entry-import-btn
- bulk-journal-entry-file-input
- bulk-journal-entry-grid
- bulk-journal-entry-grid-row-[index]
- bulk-journal-entry-cell-error-[row]-[col]
- bulk-journal-entry-validate-btn
- bulk-journal-entry-submit-btn
- bulk-journal-entry-cancel-btn
- bulk-journal-entry-progress
- bulk-journal-entry-batch-status
- bulk-journal-entry-error-banner

---

## 145. Bulk PDC Receipt Transactions

### Route  
`/vouchers/bulk-pdc-receipts`

### Purpose  
Process batches of post-dated cheque receipt transactions, imported or keyed, for efficient cashflow prep/approval.

### PRD References  
FR-315, US-258

### Access Roles  
- Standard User
- Finance Supervisor  

### Layout & Visuals

- **Header:** "Bulk PDC Receipt Transactions"
- **Glass-card:** with drag/drop and preview grid.

#### Fields/Grid Columns

| Receipt Date | Payer | Cheque No | Cheque Date | Amount | Bank | Reference | Status |

- Import area for batch file, or manual grid entry (≤50 rows).
- Status: "Draft", "Ready", "Approved", "Rejected" per row.

### Action Buttons

- [Import Batch File] (primary)
- [Validate Batch] (outline)
- [Submit for Approval] (primary, disables until valid/changed)
- [Cancel Batch] (outline, confirmation dialog)

### Interactions

- Import triggers grid preview and field mapping dialog.
- Each row editable while in "Draft".
- Row [Approve] or [Reject] (Supervisor only), opens modal for comments.
- Row errors shown inline and with icons.
- Batch status always shown top right.

### Validations

- Cheque Date ≥ Receipt Date.
- Amount >0, required for each row.
- Duplicates (by Cheque No): error per row, “Duplicate cheque number in batch.”
- Bank field required for each row.

### Loading/Skeleton

- Progress bar during import/validation/submit.
- Row spinner when approving/rejecting.

### Test Identifiers

- bulk-pdc-receipt-root
- bulk-pdc-receipt-import-btn
- bulk-pdc-receipt-file-input
- bulk-pdc-receipt-grid
- bulk-pdc-receipt-grid-row-[index]
- bulk-pdc-receipt-status-pill-[rowid]
- bulk-pdc-receipt-validate-btn
- bulk-pdc-receipt-submit-btn
- bulk-pdc-receipt-cancel-btn
- bulk-pdc-receipt-row-approve-btn
- bulk-pdc-receipt-row-reject-btn
- bulk-pdc-receipt-modal
- bulk-pdc-receipt-progress
- bulk-pdc-receipt-error-banner

---

## 146. Bulk PDC Transactions

### Route  
`/vouchers/bulk-pdc-transactions`

### Purpose  
Process and authorize multiple PDC issue transactions for outgoing payments (cheques), including validation/approval.

### PRD References  
FR-315, US-258

### Access Roles  
- Standard User (submit new, monitor own)
- Finance Supervisor (approve/reject)

### Layout & Visuals

- **Header:** "Bulk PDC Transactions"
- **Drag-drop import** (xls/csv), manual add row grid below, glass-card.
- Table grid for all pending transactions (editable in 'Draft').

#### Grid Columns

| Issue Date | Payee | Cheque No | Cheque Date | Amount | Bank | Reference | Status | Approve | Reject |

### Action Buttons

- [Import Batch]
- [Validate]
- [Submit Batch]
- [Cancel Batch]
- [Approve All] [Reject All] (Supervisor only; confirmation required)

### Interactions

- Approve/Reject per row (modal for comments).
- Batch status summary at top right ("7 draft | 3 ready | 2 approved").
- Errors visible inline per row.

### Validations

- Cheque No unique within batch.
- Amount > 0, Bank required.
- Issue Date ≤ Cheque Date.
- Approve disables row for editing.

### Loading/Skeleton

- Spinner/progress over table/grid rows during import/submit.

### Test Identifiers

- bulk-pdc-transactions-root
- bulk-pdc-transactions-import-btn
- bulk-pdc-transactions-grid
- bulk-pdc-transactions-row-[index]
- bulk-pdc-transactions-row-approve-btn
- bulk-pdc-transactions-row-reject-btn
- bulk-pdc-transactions-row-status
- bulk-pdc-transactions-batch-status
- bulk-pdc-transactions-approve-all
- bulk-pdc-transactions-reject-all
- bulk-pdc-transactions-validate-btn
- bulk-pdc-transactions-submit-btn
- bulk-pdc-transactions-cancel-btn
- bulk-pdc-transactions-error-[row]-[column]
- bulk-pdc-transactions-progress

---

## 147. Journal Entry

### Route  
`/vouchers/journal-entry`

### Purpose  
Enter, edit, and validate individual journal voucher postings with full field-level validation, attachments, and allocation.

### PRD References  
FR-316, US-250, FR-310, FR-313, BR-110

### Access Roles  
- Standard User (create)
- Finance Supervisor (approve/edit)
- Administrator (full)

### Layout & Visuals

- **Header:** "Journal Entry"
- **Instructions:** "Enter all lines, ensure debit and credit balance before posting."
- **Form:** Grouped blocks, glass-card, vertical.

#### Fields

| Field           | Label             | Type      | Validation                             |
|-----------------|-------------------|-----------|----------------------------------------|
| entryDate       | Journal Date      | Date      | Required                               |
| voucherType     | Voucher Type      | Dropdown  | Required                               |
| referenceNo     | Reference Number  | Text      | Required, unique per FY                |
| narration       | Narration         | Textarea  | Required, max 200 chars                |
| accountLines    | Transactions      | Table/Grid| At least two rows, required            |
| attachments     | Attachments       | File input| Optional, only allowed file types      |

#### Transactions Table Columns

| Account | Debit | Credit | Description |

- Add/Remove row buttons per table, up to 25 lines.

### Action Buttons

- [Save as Draft] (outline)
- [Add Line] (outline)
- [Submit Journal Entry] (primary, disabled if not valid)
- [Attach Files] (outline, opens file picker)
- [Reset Form/Clear] (secondary)

### Interactions

- Form disables [Submit] unless debits = credits (message: "Debits and Credits must balance").
- Duplicate reference number blocked (API check).
- Save Draft retains form, not visible to others.
- Attachments preview shown below field.
- Errors shown inline at line/field.
- Success toast: "Journal entry submitted for approval."

### Validations

- Required field for every input, error message below.
- No empty transaction lines.
- Amounts numeric >0, not both debit/credit on one line.
- Debits = credits before submit.

### Loading/Skeleton

- Overlay spinner on submit/draft.
- Line spinner when adding (if from account lookup).

### Test Identifiers

- journal-entry-root
- journal-entry-entry-date
- journal-entry-type
- journal-entry-reference
- journal-entry-narration
- journal-entry-transaction-table
- journal-entry-row-[index]
- journal-entry-row-account
- journal-entry-row-debit
- journal-entry-row-credit
- journal-entry-row-description
- journal-entry-add-line
- journal-entry-remove-line
- journal-entry-save-draft
- journal-entry-submit
- journal-entry-attachments
- journal-entry-error-[field]
- journal-entry-toast-submit
- journal-entry-toast-draft
- journal-entry-skeleton

---

## 148. Voucher List

### Route  
`/vouchers/list`

### Purpose  
Displays all financial voucher entries, filterable by date, account, voucher type, status, and advanced criteria. Enables searching, exporting, and printing.

### PRD References  
FR-307, US-252, BR-111

### Access Roles  
- Standard User (own/view)
- Finance Supervisor (edit/approve)
- Administrator (full)

### Layout & Visuals

- **Header:** "Voucher List"
- **Filters:**  
  - Date range
  - Account (autocomplete/multi)
  - Voucher Type (dropdown)
  - Status (Pending/Approved/Posted)
  - Reference Number (text)
- Table: Responsive

#### Table Columns

| Date | Voucher No | Account | Narration | Debit | Credit | Status | Reference | Actions |

- "Actions": View, Edit (if permitted), Print, Attachments

### Action Buttons

- [Export PDF/Excel/CSV]
- [Print]
- [Add New Voucher] (primary, routes to Journal Entry)

### Interactions

- Row click = view Voucher Detail (`/vouchers/:vsrl`).
- Pagination at bottom (50/page default).
- Row-level [Edit] only on “Pending” or “Draft”.

### Validations & Errors

- Errors inline above filters.
- Export disables if table loading.
- Empty state if no results.

### Loading/Skeleton

- Filters/components disabled while loading.
- Table shimmer.

### Test Identifiers

- voucher-list-root
- voucher-list-filter-date-from
- voucher-list-filter-date-to
- voucher-list-filter-account
- voucher-list-filter-voucher-type
- voucher-list-filter-status
- voucher-list-filter-reference
- voucher-list-table
- voucher-list-row-[vsrl]
- voucher-list-row-edit
- voucher-list-row-print
- voucher-list-row-attachments
- voucher-list-export-btn
- voucher-list-print-btn
- voucher-list-add-new-btn
- voucher-list-pager
- voucher-list-table-skeleton
- voucher-list-error-banner
- voucher-list-empty-state

---

## 149. Voucher Help

### Route  
`/vouchers/help`

### Purpose  
Interactive help screen assisting users with voucher entry, navigation, search, and advanced tips.

### PRD References  
FR-321, US-268

### Access Roles  
- All roles

### Layout & Visuals

- **Header:** "Voucher Entry Help & Guidance"
- Accordion/expandable sections:
  - Navigation Tips (expandable)
  - Search Help (expandable)
  - Voucher Entry FAQs (expandable)
  - Advanced Filtering (expandable)
  - Voucher Numbering/Uniqueness
  - "Reset" help: big secondary button resets filter demo form.

- Mini sample entry/table showing field mapping.

### Fields (for Demo only)

- All core voucher fields with demo labels, auto-filled sample data, not editable.

### Action Buttons

- [Reset Voucher Search] (secondary, resets demo)
- [Open Full Documentation] (outline, external link)
- [Contact Support] (outline triggers mailto or helpdesk form)

### Interactions

- Accordions expand/collapse with animation (`transform/opacity`, not height).
- "Reset" always scrolls demo to top and resets state.
- All help text accessible via keyboard.

### Errors

- No backend calls/async; only client errors, e.g., failed doc open: "Unable to open help PDF."

### Test Identifiers

- voucher-help-root
- voucher-help-accordion-nav
- voucher-help-accordion-search
- voucher-help-accordion-faq
- voucher-help-accordion-advanced
- voucher-help-reset-btn
- voucher-help-demo-form
- voucher-help-demo-table
- voucher-help-open-doc
- voucher-help-contact-support

---

## 150. Account Voucher Display

### Route  
`/accounts/:code/vouchers`

### Purpose  
Display all vouchers linked to a specific account, supporting auditing, drilldown, and data validation.

### PRD References  
FR-305, US-255, FR-313

### Access Roles  
- Auditor
- Standard User (own)
- Finance Supervisor
- Administrator

### Layout & Visuals

- **Header:** "Vouchers for Account: [Account Name/Code]"
- Summary block with account info at top (description, balance, group).
- Table of vouchers below, glass style.

#### Table Columns

| Date | Voucher No | Narration | Debit | Credit | Status | Ref No | Attachments/Links |

### Action Buttons

- [Export Table] (PDF/Excel/CSV)
- [Print Statement]
- [Filter Date Range] (calendar bar, optional)
- [Back to Account List] (secondary)

### Interactions

- Row: opens modal with full voucher detail, “Next/Previous” navigation inside modal.
- Filter/sort by date, amount.
- Attachments icon per row, downloads file on click.
- Rows always keyboard-navigable.

### Validations & Errors

- No vouchers: “No vouchers found for this account.”
- API error: top error banner.

### Loading/Skeleton

- Tabel shimmer, disables all actions during load.

### Test Identifiers

- account-voucher-display-root
- account-voucher-display-account-info
- account-voucher-display-table
- account-voucher-display-row-[vsrl]
- account-voucher-display-modal
- account-voucher-display-export-btn
- account-voucher-display-print-btn
- account-voucher-display-date-filter
- account-voucher-display-back-btn
- account-voucher-display-attachments
- account-voucher-display-table-skeleton
- account-voucher-display-error-banner

---

# COVERAGE CHECK

| #   | Screen Name                        | Coverage |
|-----|------------------------------------|----------|
| 126 | Account Tree in List View          | ✅       |
| 127 | AcheadList Report                  | ✅       |
| 128 | Ledger Report                      | ✅       |
| 129 | Ledger_ActualDate Report           | ✅       |
| 130 | Ledger_Pdc Report                  | ✅       |
| 131 | LedgerSummary Report               | ✅       |
| 132 | Auto Receipt Entry                 | ✅       |
| 133 | Payment Entry                      | ✅       |
| 134 | Receipt Entry                      | ✅       |
| 135 | Petty Cash Entry                   | ✅       |
| 136 | Payment Finalization               | ✅       |
| 137 | Pending Add Payment                | ✅       |
| 138 | Pending Add Receipt                | ✅       |
| 139 | Receipts (Report)                  | ✅       |
| 140 | Payments (Report)                  | ✅       |
| 141 | Receipt-Backup (Report)            | ✅       |
| 142 | Pdc_Issue_Voucher (Report)         | ✅       |
| 143 | Pdc_Receipt_Voucher (Report)       | ✅       |
| 144 | Bulk Journal Voucher Entry         | ✅       |
| 145 | Bulk PDC Receipt Transactions      | ✅       |
| 146 | Bulk PDC Transactions              | ✅       |
| 147 | Journal Entry                      | ✅       |
| 148 | Voucher List                       | ✅       |
| 149 | Voucher Help                       | ✅       |
| 150 | Account Voucher Display            | ✅       |

---

# FRONTEND_SPEC.md  
**Section: Financial Reporting, Voucher & Statement Screens (Part 7 of 14)**

---

## 151. Journal Voucher Report

### Route: `/reports/journal-voucher`
**Purpose:** Display a filterable, exportable list of all journal vouchers (GL entries and transactional detail lines) within a given period for audit and review.  
**PRD Refs:** Voucher & Transaction Entry; FR-306  
**Access Roles:** Supervisor, Finance Administrator

### Layout

- **Glass Card Panel**: `--radius-xl`, padding `--space-8`, shadow `--shadow-lg`
- **Section Heading:** "Journal Voucher Report", subtitle for period/status/filters

#### Filters Form (above the table)

| Field label           | Type         | Validation & Error                                 |
|---------------------|--------------|-----------------------------------------------------|
| Start Date*          | Date Picker  | Required; "Start Date is required."                 |
| End Date*            | Date Picker  | Required, End ≥ Start; "End Date must be after Start Date." |
| Account (optional)   | Select w/ search | Must be valid account code                          |
| Voucher Status (optional) | Dropdown (All, Approved, Pending, Rejected) | -                |

- **Filter Button**: "Apply Filter" (type=submit, primary), testid: `journal-voucher-filter-apply-btn`
- **Reset Button**: "Reset" (outline), restores defaults, testid: `journal-voucher-filter-reset-btn`
  
#### Table

| Column                    | Description                                          |
|---------------------------|-----------------------------------------------------|
| Voucher No.               | Voucher identifier (clickable for detail)           |
| Date                      | Transaction/voucher date                            |
| Account Code              | Ledger/account code                                 |
| Account Name              | Ledger/account display name                         |
| Narration                 | Narrative/free-text field                           |
| Debit (₹)                 | Debit amount (numeric, right-aligned)              |
| Credit (₹)                | Credit amount (numeric, right-aligned)             |
| Status                    | Status pill (Approved/Pending/Rejected)            |
| Created By                | User/Creator                                        |
| Approved By               | Reviewer/Admin (if any)                             |
| Actions                   | [View (eye icon), Export (download icon)]           |

- Row hover: background `#3831c40a`
- Pagination at table bottom (default: 20 per page)
- Sorting: by Date, Voucher No. (toggle sort arrow in header)

#### Table States

- **Skeleton Loading:** 5–7 rows with animated opacity blocks per column
- **Empty State:** "No vouchers found for selected filters." (testid: `journal-voucher-empty`)
- **API Error:** Card-wide error banner in brand error color, `testid=journal-voucher-api-error`, exact error from backend if known

#### Action Buttons

- **Export:** Inline button above table, opens dropdown: "Excel", "PDF", disables if loading (testid: `journal-voucher-export-btn`)
- **Print:** Outline button, prints filtered list (testid: `journal-voucher-print-btn`)
- **View Details:** Per row, shows modal (see "Voucher Details List Report")
- **Export Row:** Per row, download icon for single voucher export (PDF/Excel)

#### Test Identifiers

- `journal-voucher-filter-startdate`
- `journal-voucher-filter-enddate`
- `journal-voucher-filter-account`
- `journal-voucher-filter-status`
- `journal-voucher-filter-apply-btn`
- `journal-voucher-filter-reset-btn`
- `journal-voucher-table`
- `journal-voucher-table-row`
- `journal-voucher-table-voucherno`
- `journal-voucher-table-export-row-btn`
- `journal-voucher-export-btn`
- `journal-voucher-print-btn`
- `journal-voucher-empty`
- `journal-voucher-api-error`

---

## 152. Daily Voucher List Report

### Route: `/reports/vouchers/daily-list`
**Purpose:** Show all vouchers posted for a single business date, for daily review or reconciliation.
**PRD Refs:** Voucher & Transaction Entry, FR-307  
**Access Roles:** Supervisor, Standard, Finance Administrator

#### Filters

- **Date*:** Date Picker (required)
- **Voucher Type:** Select (All, Journal, Payment, Receipt, ...); optional
- **Account:** Autocomplete select; optional
- "Show Only Approved" (checkbox); optional

#### Action Buttons

- Apply Filters (primary)
- Reset Filters (secondary)
- Print List (secondary)
- Export (dropdown: Excel, PDF)

#### Table

| Voucher No. | Date | Voucher Type | Account | Narration | Debit (₹) | Credit (₹) | Status | Created By | Actions |
|-------------|------|--------------|---------|-----------|-----------|------------|--------|------------|---------|

- Each Voucher No. linkable to detail drawer
- Sorting: by Voucher No., Date (asc/desc)

#### States

- Loading: Skeleton table (5–7 lines)
- Empty: "No vouchers found for the selected date."  
- Error: Inline error banner

#### Test Identifiers

- `daily-voucher-filter-date`
- `daily-voucher-filter-type`
- `daily-voucher-filter-account`
- `daily-voucher-filter-apply-btn`
- `daily-voucher-table`
- `daily-voucher-table-row`
- `daily-voucher-export-btn`
- `daily-voucher-print-btn`
- `daily-voucher-empty`
- `daily-voucher-api-error`

---

## 153. Voucher Details List Report

### Route: `/reports/vouchers/details`
**Purpose:** Provide a drill-down, filterable report of voucher line items/entries, supporting audits and reconciliation (one row per debit/credit line).
**PRD Refs:** Voucher & Transaction Entry, FR-308  
**Access Roles:** Supervisor, Finance Administrator

#### Filters

- Period: start/end date (required)
- Voucher Type: select
- Account: search select
- Status: select

#### Table

| Voucher No. | Date | Account | Debit (₹) | Credit (₹) | Narration | Voucher Type | Reference | Status | Created By |

- Default sort: Date desc
- Actions: "Export", "Print", "Column Hide/Show"

#### States

- **Loading:** Skeleton
- **Empty:** "No voucher entries for the selected filters."
- **Error:** Error message banner

#### Test Identifiers

- `voucher-details-filter-date-start`
- `voucher-details-filter-date-end`
- `voucher-details-filter-account`
- `voucher-details-filter-type`
- `voucher-details-table`
- `voucher-details-table-row`
- `voucher-details-export-btn`
- `voucher-details-print-btn`
- `voucher-details-empty`
- `voucher-details-api-error`

---

## 154. Voucher List Report

### Route: `/reports/voucher-list`
**Purpose:** Presents a paginated report of all voucher entries (by day, account, status) with comprehensive filters for admin and audit purposes.
**PRD Refs:** Voucher & Transaction Entry, FR-309  
**Access Roles:** Supervisor, Finance Administrator

#### Filters

- Start/End Date (required)
- Account (optional)
- Prepared By (user select, optional)
- Status (Approved, Pending, Rejected)
- Voucher Type

#### Table

| Voucher No. | Date | Account | Type | Debit (₹) | Credit (₹) | Status | Prepared By | Approved By | Actions |

- Actions: View Detail, Export Single
- Paging: 25 per page, top and bottom

#### Test Identifiers

- `voucher-list-filter-date-start`
- `voucher-list-filter-date-end`
- `voucher-list-filter-account`
- `voucher-list-table`
- `voucher-list-table-row`
- `voucher-list-export-btn`
- `voucher-list-print-btn`
- `voucher-list-empty`
- `voucher-list-api-error`

---

## 155. Report Selection and Generation

### Route: `/reports`
**Purpose:** Central entry point to discover, filter, and launch all available financial/management reports (all report types: GL, bills, P&L, trial, inventory etc.).  
**PRD Refs:** Financial Reporting, FR-324  
**Access Roles:** Standard User, Supervisor, Administrator

#### Layout

- Hero bar: "Reports Library" (h1), filter/search bar
- Report Types: Dropdown (Financial, Inventory, Sales, Custom, Compliance ...)
- Search Box: Typing auto-filters by report name/desc
- Sectioned list of report cards: each card shows report name, type, description, "Generate" button

#### Actions per report card

- "Generate" (primary): navigates to the report parameter page (testid: `report-card-generate-btn-[report-id]`)
- "Preview" (outline): launches modal report preview

#### Test Identifiers

- `reports-search-box`
- `reports-type-dropdown`
- `reports-library-grid`
- `report-card-generate-btn-[report-id]`
- `report-card-preview-btn-[report-id]`
- `reports-empty-state`
- `reports-api-error-banner`

---

## 156. Group Ledger Summary

### Route: `/reports/group-ledger-summary`
**Purpose:** View/print/export summary of all ledger groups (GL summary totals by code or group for period, supporting audit and account monitoring).  
**PRD Refs:** Financial Reporting, FR-271  
**Access Roles:** Supervisor, Administrator

#### Filters

- Period: Start and End date (required)
- Group/Classification: Select (GL, Customers, Supplier, Bank ...)
- Account: Optional
- "Export" button, "Print" button (secondary)
- "Preview" button for quick modal

#### Table

| Group/Section | Account Code | Account Name | Opening Balance | Dr Total | Cr Total | Closing Balance |

- Summing bars at bottom (totals)
- Default sort: Account Code ascending

#### States

- **Loading:** Skeleton rows, header shimmer
- **Empty:** "No data for group/period."
- **Error:** Banner, testid: `group-ledger-error`

#### Test Identifiers

- `group-ledger-date-start`
- `group-ledger-date-end`
- `group-ledger-group-select`
- `group-ledger-account-select`
- `group-ledger-summary-table`
- `group-ledger-export-btn`
- `group-ledger-print-btn`
- `group-ledger-preview-btn`
- `group-ledger-error`

---

## 157. Report Preview Screen

### Route: `/reports/preview/:id`
**Purpose:** Fullscreen, paginated preview of any system report prior to export/print  
**PRD Refs:** Financial Reporting, FR-326  
**Access Roles:** All (for reports they're allowed to view/export)

#### Layout

- Full viewport modal/card with darkened backdrop, glass surface at `--radius-xl`
- Report title (from metadata), filter summary
- Report content area: WYSIWYG, paginated pages, scroll
- Control bar (top right):  
  - "Export" (dropdown: PDF, Excel, CSV)
  - "Print"
  - "Close Preview" (X top right), `report-preview-close-btn`
  - Page selector: "Page X of Y"
- Option to edit filters and regenerate (if permitted/allowed by access role)

#### Skeleton, Error, and Edge-case states

- **Loading:** Centered spinner, blurred grey background placeholder
- **API Error:** Error banner with details, testid: `report-preview-api-error`
- **No Data:** Large text "No data for selected filters."

#### Test Identifiers

- `report-preview-title`
- `report-preview-pager`
- `report-preview-export-btn`
- `report-preview-print-btn`
- `report-preview-close-btn`
- `report-preview-main`
- `report-preview-filter-edit-btn`
- `report-preview-api-error`
- `report-preview-no-data`

---

## 158. Ledger Short Report

### Route: `/reports/ledger-short`
**Purpose:** Concise, filterable listing of all recent ledger activity (non-hierarchical, flat list), supporting quick balance reviews.  
**PRD Refs:** Financial Reporting, FR-325, 332  
**Access Roles:** Standard, Supervisor

#### Filters

- Date range (required)
- Account code/name (search)
- "Export", "Print"

#### Table

| Date       | Account Code   | Account Name    | Description / Narration | Dr (₹) | Cr (₹) | Balance (After entry) |
|------------|----------------|-----------------|------------------------|--------|--------|----------------------|

#### Edge states

- **Loading:** Skeleton rows
- **Empty:** "No ledger activity for selected range."
- **API Error:** Banner, testid: `ledger-short-error`

#### Test Identifiers

- `ledger-short-date-start`
- `ledger-short-date-end`
- `ledger-short-account-select`
- `ledger-short-table`
- `ledger-short-export-btn`
- `ledger-short-print-btn`
- `ledger-short-error`
- `ledger-short-empty`

---

## 159. Voucher Details Report

### Route: `/reports/voucher-details`
**Purpose:** Detailed, drill-down voucher report, showing all lines/allocations for selected voucher(s).  
**PRD Refs:** Financial Reporting, FR-279  
**Access Roles:** Supervisor, Administrator

#### Filters

- Period: start/end date (required)
- Account: search select (optional)
- Voucher Type: dropdown (optional)

#### Table

| Voucher No. | Date | Line # | Account Code | Account Name | Type | Dr (₹) | Cr (₹) | Narration | Reference | Prepared By |

- Default sort: Voucher No., then line #
- Row click: opens drawer/modal for line breakdown/details

#### Test Identifiers

- `voucher-detailsreport-date-start`
- `voucher-detailsreport-date-end`
- `voucher-detailsreport-account`
- `voucher-detailsreport-type`
- `voucher-detailsreport-table`
- `voucher-detailsreport-table-row`
- `voucher-detailsreport-export-btn`
- `voucher-detailsreport-print-btn`
- `voucher-detailsreport-error`
- `voucher-detailsreport-empty`

---

## 160. LedgerSummary

### Route: `/reports/ledger-summary`
**Purpose:** Generate a summary ledger report with opening, period, and closing balances per account for the date range and filtered code/groups.  
**PRD Refs:** Financial Reporting, FR-254  
**Access Roles:** Finance Supervisor, Administrator

#### Filters

- Start/End Date (required)
- Account/Group (search select; multi)
- Include zero accounts (checkbox)

#### Table

| Account Code | Account Name | Opening Balance | Dr Total | Cr Total | Period Net | Closing Balance |

- Summing row at table footer
- All currency columns: numeric, right-aligned

#### Test Identifiers

- `ledger-summary-date-start`
- `ledger-summary-date-end`
- `ledger-summary-account-select`
- `ledger-summary-include-zero`
- `ledger-summary-table`
- `ledger-summary-export-btn`
- `ledger-summary-print-btn`
- `ledger-summary-error`
- `ledger-summary-empty`

---

## 161. AgeWise

### Route: `/reports/agewise`
**Purpose:** Display age-wise outstanding balances for customers/suppliers, providing insight into receivables and payables for credit control.  
**PRD Refs:** Financial Reporting, FR-273  
**Access Roles:** Supervisor, Administrator

#### Filters

- As of date (required; default today)
- Type (Customer/Supplier/All)
- Account (optional)
- Group by: (None, By Salesman, By Area, etc.)

#### Table

| Account Code | Name | Phone | Age (days) | 0–15d | 16–30d | 31–45d | 46–60d | 61–75d | 76–90d | 91–120d | >120d | Total Outstanding |

#### UI/UX
- Age bucket columns visually shaded to convey "older" aging (stronger border/right background)
- Row hover: highlighted
- Table export: Excel, CSV, PDF, Print 
- Column filter/show/hide option
- "Expand" option provides account statement modal

#### Edge states

- Load: Skeleton grid, shimmer headers
- Empty: "No outstanding balances as of selected date."
- Error: Error message

#### Test Identifiers

- `agewise-filter-date`
- `agewise-filter-type`
- `agewise-filter-account`
- `agewise-table`
- `agewise-export-btn`
- `agewise-print-btn`
- `agewise-error`
- `agewise-empty`

---

## 162. TrialBalance

### Route: `/reports/trial-balance`
**Purpose:** Show a filtered, formatted trial balance for audit/period-end, with drill-down options and export.
**PRD Refs:** Financial Reporting, FR-333  
**Access Roles:** Supervisor, Administrator

#### Filters

- Period: start/end, required
- Group (ledger group)
- Format: (Summary, Detailed) toggle

#### Table

| Account Code | Account Name | Dr (₹) | Cr (₹) | Net (Dr-Cr) | Drill-down |

- Drill-down: Click account/row for ledger activity modal/popup

#### Footer: Summing net Dr/Cr with diff highlight if not 0

#### States

- Skeleton (entire table)
- Empty: "Trial balance is zero for period."
- Error: Card-wide error banner

#### Test Identifiers

- `trialbalance-date-start`
- `trialbalance-date-end`
- `trialbalance-group-select`
- `trialbalance-format-switch`
- `trialbalance-table`
- `trialbalance-drilldown-btn`
- `trialbalance-export-btn`
- `trialbalance-print-btn`
- `trialbalance-error`
- `trialbalance-empty`

---

## 163. PandLReport

### Route: `/reports/profit-loss`
**Purpose:** Detailed profit and loss statement, summary and detail mode, filterable by period or branch.  
**PRD Refs:** Financial Reporting, FR-275  
**Access Roles:** Supervisor, Administrator

#### Filters

- Period (start/end required)
- Branch (optional)
- Format: Summary/Detail switch

#### Table

| Income Head/Section | Amount (₹) | Expense/Section | Amount (₹) | Total (₹) | Notes/Explanation |

- Net Profit/Loss row at bottom

#### Output/Actions

- Export: PDF/Excel/CSV
- "Email Report" (if allowed)
- Print

#### Edge states

- Loading skeleton
- Empty: "No profit/loss recorded for this period."
- Error: Banner, testid: `pandlreport-error`

#### Test Identifiers

- `pandl-date-start`
- `pandl-date-end`
- `pandl-branch-select`
- `pandl-format-switch`
- `pandl-table`
- `pandl-netrow`
- `pandl-export-btn`
- `pandl-print-btn`
- `pandl-email-btn`
- `pandlreport-error`
- `pandlreport-empty`

---

## 164. VoucherDetailsList

### Route: `/reports/vouchers/details-list`
**Purpose:** List all voucher details (line-by-line) for review, supporting auditing, error finding, or detailed printouts.
**PRD Refs:** Financial Reporting, FR-329, 332  
**Access Roles:** Supervisor, Administrator

#### Filters

- Start/End date (required)
- Voucher Type (filter)
- Account (filter)

#### Table

| Voucher No. | Date | Account Code | Account Name | Type | Debit (₹) | Credit (₹) | Narration | Reference | Prepared By | Status |

#### Actions

- Print, Export, Column hide/show (permitted roles)

#### States

- Skeleton
- Empty: "No voucher details available."
- Error: Card error

#### Test Identifiers

- `voucherdetailslist-date-start`
- `voucherdetailslist-date-end`
- `voucherdetailslist-account-select`
- `voucherdetailslist-type-filter`
- `voucherdetailslist-table`
- `voucherdetailslist-export-btn`
- `voucherdetailslist-print-btn`
- `voucherdetailslist-error`
- `voucherdetailslist-empty`

---

## 165. SalesAnalysis

### Route: `/reports/sales-analysis`
**Purpose:** Shows sales analytics by period, segment (product, sale type, area, etc.), drill-down to transactions.  
**PRD Refs:** Financial Reporting, FR-283  
**Access Roles:** Standard, Supervisor

#### Filters

- Date range (required)
- Segment/Type (dropdown)
- Group by: Salesman, Customer, Product, Area

#### Chart/Stats Area

- Bar/pie/trend chart (integrated; uses brand palette)
- KPIs: Total Sales, Avg. Invoice, Product Count

#### Data Table

| Transaction ID | Date | Product/Service | Customer | Salesman | Amount (₹) | Segment | Status | Actions |

#### Table Actions

- Drill-down: transaction details modal (testid: `salesanalysis-drilldown-btn`)
- Print, Export

#### States

- Chart/table skeletons
- Empty: "No sales data for period."
- Error: Error banner

#### Test Identifiers

- `salesanalysis-date-start`
- `salesanalysis-date-end`
- `salesanalysis-group-by`
- `salesanalysis-segment-dropdown`
- `salesanalysis-chart`
- `salesanalysis-table`
- `salesanalysis-export-btn`
- `salesanalysis-print-btn`
- `salesanalysis-kpi-total`
- `salesanalysis-drilldown-btn`
- `salesanalysis-error`
- `salesanalysis-empty`

---

## 166. SalesRegister

### Route: `/reports/sales-register`
**Purpose:** View/register all sales transactions within a selected period; export for accounting or compliance.  
**PRD Refs:** Financial Reporting, FR-282  
**Access Roles:** Standard, Supervisor, Administrator

#### Filters

- Start/End date (required)
- Customer (search select)
- Status (Completed/Pending/All)

#### Table

| Sale No. | Date | Customer | Product | Amount (₹) | Status | Reference | Prepared By |

#### Actions

- Print, Export
- View/Drill transaction modal (testid: `salesregister-view-btn`)

#### Table States

- Skeleton loading
- Empty: "No sales transactions for selection."
- Error: Banner

#### Test Identifiers

- `salesregister-date-start`
- `salesregister-date-end`
- `salesregister-customer-select`
- `salesregister-status-select`
- `salesregister-table`
- `salesregister-export-btn`
- `salesregister-print-btn`
- `salesregister-view-btn`
- `salesregister-error`
- `salesregister-empty`

---

## 167. Profitandlossfrm

### Route: `/reports/profit-loss-frm`
**Purpose:** Legacy-styled Profit and Loss form, preserving all drill-down and reference features for backward compatibility.
**PRD Refs:** Financial Reporting, FR-275  
**Access Roles:** Supervisor, Administrator

#### Filters

- Period (start/end required)
- Format (dropdown: Classic, By Group, Detail)
- "Export", "Print"

#### Output

- Table: as in `/reports/profit-loss`, but with classic P&L headings/styles
- Footer: Net Profit/Loss

#### Test Identifiers

- `profitandlossfrm-date-start`
- `profitandlossfrm-date-end`
- `profitandlossfrm-format-select`
- `profitandlossfrm-table`
- `profitandlossfrm-netrow`
- `profitandlossfrm-export-btn`
- `profitandlossfrm-print-btn`
- `profitandlossfrm-error`
- `profitandlossfrm-empty`

---

## 168. a1

### Route: `/reports/a1`
**Purpose:** Provides ad-hoc summary snapshot or system test report as specified by management.
**PRD Refs:** Financial Reporting, low priority ad-hoc  
**Access Roles:** Administrator

#### Output

- Report title, generated on demand, filter box for test conditions
- Table/grid output (schema varies by report type)
- Print, Export, Refresh

#### Test Identifiers

- `a1-filter-params`
- `a1-table`
- `a1-export-btn`
- `a1-print-btn`
- `a1-refresh-btn`
- `a1-error`
- `a1-empty`

---

## 169. AcheadList

### Route: `/reports/account-head-list`
**Purpose:** List all account heads with details for reference, validation, audit, or onboarding.
**PRD Refs:** Financial Reporting, FR-250  
**Access Roles:** Supervisor, Administrator

#### Filters

- Type (dropdown): Customer, Supplier, Bank, Ledger, All
- Status: Active/Inactive/All

#### Table

| Account Code | Account Name | Type | Group | Parent Head | Status | Created On | Last Modified | Created By | Actions (view, edit) |

#### Test Identifiers

- `acheadlist-type-dropdown`
- `acheadlist-status-dropdown`
- `acheadlist-table`
- `acheadlist-export-btn`
- `acheadlist-print-btn`
- `acheadlist-view-btn`
- `acheadlist-edit-btn`
- `acheadlist-error`
- `acheadlist-empty`

---

## 170. AcSrlList-MissingList

### Route: `/reports/account-serial-missing`
**Purpose:** Identify and report missing or out-of-sequence account serials (for data hygiene and audit).
**PRD Refs:** Financial Reporting, compliance checks  
**Access Roles:** Administrator

#### Output

- List of expected serials vs missing serials in table form
- "Export" and "Print" for compliance submission

#### Test Identifiers

- `acsrlmissing-table`
- `acsrlmissing-export-btn`
- `acsrlmissing-print-btn`
- `acsrlmissing-error`
- `acsrlmissing-empty`

---

## 171. AcSrlList

### Route: `/reports/account-serial-list`
**Purpose:** Simple, ordered readout of all account serial numbers for completeness and tracking.
**PRD Refs:** Financial Reporting, onboarding/tracking  
**Access Roles:** Supervisor, Administrator

#### Table

| Serial No. | Account Code | Account Name | Created By | Created On | Status |

#### Test Identifiers

- `acsrl-table`
- `acsrl-export-btn`
- `acsrl-print-btn`
- `acsrl-error`
- `acsrl-empty`

---

## 172. AcStatement-Preprented

### Route: `/reports/account-statement/preprinted`
**Purpose:** Generate account statement in preformatted, print-ready (stationery) format.  
**PRD Refs:** Financial Reporting, FR-340  
**Access Roles:** All users (own accounts), Supervisor/Admin (all accounts)

#### Filters/Form

- Account code (required)
- Date range (required)
- "Export PDF", "Print", "Email" actions

#### Output

- Classic bank statement style with cheque columns, branding, page-break/headers

#### Test Identifiers

- `acstatementpp-account-select`
- `acstatementpp-date-start`
- `acstatementpp-date-end`
- `acstatementpp-table`
- `acstatementpp-export-btn`
- `acstatementpp-print-btn`
- `acstatementpp-email-btn`
- `acstatementpp-error`
- `acstatementpp-empty`

---

## 173. AcStatementPlainPaper

### Route: `/reports/account-statement/plain`
**Purpose:** Generate plain format account statement for plain paper printing/sharing.  
**PRD Refs:** Financial Reporting, print format standard  
**Access Roles:** All users (own accounts), Supervisor/Admin

#### Filters

- Account code (required)
- Date range (required)
- "Export PDF", "Print", "Email" actions

#### Output

- Simple grid, minimal borders, one line per transaction

#### Test Identifiers

- `acstatementplain-account-select`
- `acstatementplain-date-start`
- `acstatementplain-date-end`
- `acstatementplain-table`
- `acstatementplain-export-btn`
- `acstatementplain-print-btn`
- `acstatementplain-email-btn`
- `acstatementplain-error`
- `acstatementplain-empty`

---

## 174. AdditionalRemarksReports

### Route: `/reports/additional-remarks`
**Purpose:** Show/print all additional remarks added to orders/transactions, useful for audit/compliance.
**PRD Refs:** Document & Attachment Management, FR-98, FR-109  
**Access Roles:** Supervisor, Administrator

#### Filters

- Date range (required)
- User (optional)
- Transaction/Order (optional)

#### Table

| Date | Entry User | Order/Trx No. | Remark Content | Related Entity | Actions (view context) |

#### Actions

- Export, Print, Drill to originating order

#### Test Identifiers

- `adremrpt-date-start`
- `adremrpt-date-end`
- `adremrpt-user-select`
- `adremrpt-order-select`
- `adremrpt-table`
- `adremrpt-export-btn`
- `adremrpt-print-btn`
- `adremrpt-view-btn`
- `adremrpt-error`
- `adremrpt-empty`

---

## 175. agewisesummary

### Route: `/reports/agewise-summary`
**Purpose:** Quick summary view and printout of balances by age bucket (for credit management snapshot).
**PRD Refs:** Financial Reporting, FR-273  
**Access Roles:** Supervisor, Administrator

#### Table

| Age Bucket | Number of Accounts | Total Balance (₹) |

#### Actions

- Export, Print

#### Test Identifiers

- `agewisesummary-table`
- `agewisesummary-export-btn`
- `agewisesummary-print-btn`
- `agewisesummary-error`
- `agewisesummary-empty`

---

# COVERAGE CHECK

| Screen Name                           | Covered? |
|----------------------------------------|----------|
| Journal Voucher Report                 | ✅       |
| Daily Voucher List Report              | ✅       |
| Voucher Details List Report            | ✅       |
| Voucher List Report                    | ✅       |
| Report Selection and Generation        | ✅       |
| Group Ledger Summary                   | ✅       |
| Report Preview Screen                  | ✅       |
| Ledger Short Report                    | ✅       |
| Voucher Details Report                 | ✅       |
| LedgerSummary                          | ✅       |
| AgeWise                                | ✅       |
| TrialBalance                           | ✅       |
| PandLReport                            | ✅       |
| VoucherDetailsList                     | ✅       |
| SalesAnalysis                          | ✅       |
| SalesRegister                          | ✅       |
| Profitandlossfrm                       | ✅       |
| a1                                     | ✅       |
| AcheadList                             | ✅       |
| AcSrlList-MissingList                  | ✅       |
| AcSrlList                              | ✅       |
| AcStatement-Preprented                 | ✅       |
| AcStatementPlainPaper                  | ✅       |
| AdditionalRemarksReports               | ✅       |
| agewisesummary                         | ✅       |

---

# FRONTEND_SPEC.md  
*Part 8 of 14 — Screen Specifications (176–200)*

---

## 176. CBPBook (Cash/Bank Book Report)

**Route:** `/reports/cbp-book`  
**Purpose:** Generate, view, filter, and export comprehensive cash/bank book transactions for selected periods and accounts.  
**PRD Reference:** Financial Reporting & Statements; Banking & Reconciliation  
**Access Roles:** Accountant, Finance Supervisor, Finance Administrator  

### Layout & Structure

- Page glass container: max-width 1140px, center-aligned, `var(--radius-xl)` glassmorphism, `var(--shadow-lg)`.
- **Section title:** "Cash/Bank Book Report" (`text-h1`)
- **Filters panel:** collapsed in mobile, `var(--radius-md)` with `--color-bg-card`.
- **Main table container:** Glass card, padding `var(--space-6)`.

### Filters/Form Fields

| Label                | Field           | Type      | Default       | Required | Validation/Error                                   |
|----------------------|-----------------|-----------|--------------|----------|----------------------------------------------------|
| Account              | account         | Dropdown  | (first bank/cash) | Yes   | "Account selection required."                      |
| Type                 | type            | Dropdown (All, Cash, Bank, Other...) | "All"   | No   |                                                    |
| From Date            | fromDate        | Date      | (first of current month) | Yes   | "Please select a From Date."                       |
| To Date              | toDate          | Date      | (today)       | Yes      | "Please select a To Date."                         |

- **Account Dropdown**: Render with all eligible accounts (`GET /api/v1/accounts/heads?type=bank|cash`).
- **Type Dropdown:** All, Cash, Bank, Other (populated from DB for consistency).
- **"Apply Filters"**: Primary button. `data-testid="cbpbook-filters-apply"`  
- **"Reset Filters"**: Secondary button. `data-testid="cbpbook-filters-reset"`

### Table - Cash/Bank Book Listing

| Column Label      | Field           | Notes                                                                |
|-------------------|-----------------|----------------------------------------------------------------------|
| Date              | date            | DD-MMM-YYYY (table header: 120px, `text-xs`, uppercase)              |
| Voucher #         | voucherNumber   | Voucher serial/reference, clickable for voucher details              |
| Account           | account         | Name (from Account table)                                            |
| Narration         | narration       | "Reference"/transaction description                                  |
| Debit             | debit           | Amount, right-aligned, green for positive                             |
| Credit            | credit          | Amount, right-aligned, red for negative                              |
| Balance           | balance         | Running balance, right-aligned; cell is bold if out-of-balance       |
| Type              | type            | Cash, Bank, Other                                                    |

### Table Features

- Sortable columns (`date`, `account`, `debit`, `credit`, `balance`)
- Pagination footer: 20 rows per page, `data-testid="cbpbook-pagination"`
- Loading state: shimmer skeleton for filters and 8–16 rows/table cells  
- Empty state: `"No entries for this period/account."`  
  - `data-testid="cbpbook-table-empty"`

### Actions

- **Export PDF:** Button, glass/outline, right of section title, `data-testid="cbpbook-action-export-pdf"`
- **Export Excel:** Button beside PDF, `data-testid="cbpbook-action-export-excel"`
- **Print:** Button (calls `window.print()` or triggers backend endpoint), `data-testid="cbpbook-action-print"`
- **Table row click**: open voucher detail modal. Modal uses `var(--shadow-lg)`, disables background scroll, `data-testid="cbpbook-modal-voucher-detail"`

### Error and Success Messages

- API error: Inline error toast and card with `"Failed to load report data. Please check your connection and re-try."`  
- Field errors: below each, in red, never only via toast.

### Accessibility & Responsiveness

- Keyboard focus indicators (`--shadow-focus`) for all filter controls and table rows.
- 100% width table on mobile, no fixed columns.

#### Data Test IDs

- `cbpbook-filters-account`, `cbpbook-filters-type`, `cbpbook-filters-fromdate`, `cbpbook-filters-todate`
- `cbpbook-filters-apply`, `cbpbook-filters-reset`
- `cbpbook-table`, `cbpbook-table-row`, `cbpbook-table-empty`
- `cbpbook-action-export-pdf`, `cbpbook-action-export-excel`, `cbpbook-action-print`
- `cbpbook-pagination`
- `cbpbook-modal-voucher-detail`


---

## 177. Company_Report_Header

**Route:** `/admin/company-report-header`  
**Purpose:** Review and update company branding/header information used on all system-generated reports.  
**PRD Reference:** FR-272  
**Access Roles:** Administrator only

### Layout & Structure

- Glass card, max-width 680px, centered.
- **Section title:** "Company Report Header" (`text-h2`)
- **Company branding preview:** visual mock of header as shown on exported PDFs.

### Form Fields

| Label          | Field      | Type        | Required | Validation                                         |
|----------------|------------|-------------|----------|----------------------------------------------------|
| Company Name   | name       | Text        | Yes      | "Company name is required."                        |
| Address Line 1 | addr1      | Text        | No       |                                                    |
| Address Line 2 | addr2      | Text        | No       |                                                    |
| Address Line 3 | addr3      | Text        | No       |                                                    |
| Email          | email      | Email       | Optional | "Must be a valid email."                           |
| Phone 1        | phone1     | Text        | Optional | Validate +country code or std format if present.   |
| Phone 2        | phone2     | Text        | Optional |                                                    |
| Fax            | fax        | Text        | Optional |                                                    |
| Brand Logo     | logo       | Image upload (SVG/PNG, max 512x200px) | Optional | Must preview and show thumbnail.                   |

### Actions

- **Save Header:** Primary button, right-aligned. `data-testid="reportheader-form-save"`
- **Reset to Default:** Outline button, left. `data-testid="reportheader-form-reset"`
- **Preview as PDF:** Button above form. `data-testid="reportheader-btn-preview-pdf"`
- **View Sample report:** Inline button as link. `data-testid="reportheader-btn-sample"`

### Error States

- API error for save/update: red toast and form banner.
- Invalid logo (format/size): error beside file input (not toast).

### Accessibility

- Focus trap in Preview modal.
- Required fields get bolded label and error under input (`text-xs`, red).
- Upload uses input[type=file]; no drag-drop.

#### Data Test IDs

- `reportheader-form-name`
- `reportheader-form-addr1`, `reportheader-form-addr2`, `reportheader-form-addr3`
- `reportheader-form-email`, `reportheader-form-phone1`, `reportheader-form-phone2`
- `reportheader-form-fax`, `reportheader-form-logo`
- `reportheader-form-save`, `reportheader-form-reset`
- `reportheader-btn-preview-pdf`, `reportheader-btn-sample`

---

## 178. Copy of DOPrnt

**Route:** `/delivery/copy/:deliveryOrderId`  
**Purpose:** Generate and print a "copy" of an existing delivery order for tracking, customer, or re-issue use cases.  
**PRD Reference:** Delivery Note Management, Reporting  
**Access Roles:** Sales Staff, Sales Supervisor, Administrator

### Layout & Structure

- Modal or glass card, max-width 700px.
- Auto-fetch DO data via `/api/v1/delivery-orders/:id`.
- **Section:** Preview with print header ("Copy of Delivery Order").

#### Header Section

- Company name, logo, address block (from global header).
- "COPY" watermark in background.

#### DO Details

| Field              | Presentation                         |
|--------------------|--------------------------------------|
| Delivery Order No  | `#` badge left, bold, large font     |
| Delivery Date      | Date, right-aligned                  |
| Customer Name      | On line under DO No, bold            |
| Address            | Under customer name                  |
| Linked Order No    | Ref# if applicable                   |

#### Table of Items

| Column      | Key / Field   |
|-------------|--------------|
| S. No.      | auto-numbered|
| Item        | Description, code/tag |
| Quantity    | Qty (2 decimal)      |
| Unit        | Unit (from item/unit name) |
| Remarks     | Delivery remarks (if any) |

#### Footer

- Prepared By
- Printed By: user name, date, time.
- "This is a system-generated copy." (small, muted).

### Actions

- **Print:** Primary button, `data-testid="copydoprnt-print"`
- **Export PDF:** Secondary button, `data-testid="copydoprnt-export-pdf"`

### Error & UX

- Loading spinner in modal center (`data-testid="copydoprnt-loading"`)
- API or not-found: "Delivery order not found."  
- Print disables background scroll.

#### Data Test IDs

- `copydoprnt-print`, `copydoprnt-export-pdf`
- `copydoprnt-loading`, `copydoprnt-itemrow`
- `copydoprnt-header-dono`, `copydoprnt-header-cust`

---

## 179. Copy of SaleBillPrnt-back

**Route:** `/sales/copy-bill/:saleBillId`  
**Purpose:** Generate/print backup copy of a sales bill (invoice) for redundancy, audit, or customer copy.  
**PRD Reference:** Reporting & Statements, Sales Management  
**Access Roles:** Administrator only (all users may print their own bill via standard screens)

### Layout & Structure

- Modal or glass card, max-width 700px, glassmorphism.
- Fetch sale bill details `/api/v1/sales/bills/:id?copy=backup`.
- Report header with watermark "COPY — BACKUP".

#### Header

- Company branding (uses `/admin/company-report-header`)
- Sale Bill No / Invoice No (badge)
- Invoice date (format: DD-MMM-YYYY)

#### Billing To

- Customer name, billing address, phone, GST/Tax ID (if available)
- Table: itemized list

| Column      | Field        |
|-------------|-------------|
| S. No.      | auto-number  |
| Item        | Description  |
| Qty         | qty (right)  |
| Unit Price  | (right)      |
| Amount      | (right, currency format) |

#### Taxes & Totals

| Field      | Presentation |
|------------|-------------|
| Subtotal   | Bold bottom cell, right |
| Tax        | List with code/rate, right |
| Discount   | (if present), right|
| GRAND TOTAL| Largest, double border right |

#### Footer

- Prepared by, user, date, time.
- "System-generated backup copy. Not valid for statutory submission" (red, small font).

### Actions

- **Print:** Primary button, `data-testid="copybillprnt-print"`
- **Export PDF:** Secondary, `data-testid="copybillprnt-export-pdf"`
- **Close:** Ghost button (top right X), closes modal.

### Error/Loading

- Loading: spinner overlay on modal
- API failure: card with red error
- No "edit" allowed in copy/backup mode

#### Data Test IDs

- `copybillprnt-print`, `copybillprnt-export-pdf`, `copybillprnt-close`
- `copybillprnt-header`, `copybillprnt-itemrow`, `copybillprnt-totals`

---

## 180. CreditNote

**Route:** `/finance/credit-notes`  
**Purpose:** View, filter, and export all issued Credit Notes for returns, corrections, or discount documentation.  
**PRD Reference:** FR-196, Credit Note Reporting  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- Glass panel, center, max-width 1000px.
- **Header:** "Credit Notes Registry" (`text-h2`)
- **Filters**: sticky top

| Label        | Field      | Type     | Validation                   |
|--------------|-----------|----------|------------------------------|
| Date (from)  | fromDate  | Date     | Both date fields required.   |
| Date (to)    | toDate    | Date     | "To date must be after From" |
| Party        | party     | Dropdown, Auto-complete (customer/supplier) | Optional |
| Type         | type      | Dropdown (Sales Return, Discount, Other) | Optional |

- ["Apply Filters"](primary), `data-testid="creditnote-filters-apply"`  
- ["Reset"](link/ghost), `creditnote-filters-reset`

### Table

| Column      | Field        | Notes                                        |
|-------------|-------------|----------------------------------------------|
| Credit Note #| crdrNoteNo  | Clickable for printable/view                 |
| Date        | date        |                                              |
| Party       | partyName   | Customer or Supplier name                    |
| Amount      | amount      | Currency, right-aligned                      |
| Reason      | narration   |                                              |
| User        | user        | Creator, right                               |
| Status      | status      | e.g. Approved, Pending, Reversed (badge)     |
| Actions     |             | Print/export icons, `data-testid="creditnote-row-print"` |

### Table Features

- Sortable by date, party, amount
- Pagination: 20/page  
- Print, Export PDF, Export CSV per-row and full-table

### Actions

- Row "Print" icon (opens credit note in modal or print view).
- Bulk export (top-right).
- Export all as PDF/CSV (top; disables if no data).

### States

- **Loading:** Table shimmer
- **Empty:** "No credit notes issued for the selected period."
- **Error:** Form field errors for date/pagination, API failures card with "Could not load credit notes. Please retry."

### Accessibility

- All actions keyboard accessible
- Table row actions accessible via tab/enter

#### Data Test IDs

- `creditnote-filters-from`, `creditnote-filters-to`, `creditnote-filters-party`, `creditnote-filters-type`
- `creditnote-filters-apply`, `creditnote-filters-reset`
- `creditnote-table`, `creditnote-table-row`, `creditnote-row-print`
- `creditnote-export-pdf`, `creditnote-export-csv`, `creditnote-pagination`

---

## 181. CustomerBillDetailedSummary

**Route:** `/reports/customer-bills/detailed-summary`  
**Purpose:** Generate and export a detailed summary of all customer invoices for a billing period, including line-by-line and bill-level info.  
**PRD Reference:** FR-340, Customer Billing, Reporting  
**Access Roles:** Supervisor, Administrator

### Structure

- Section title: "Customer Bill Detailed Summary" (`text-h2`)
- **Filter bar** at top:

| Label             | Field          | Type       | Required | Validation                          |
|-------------------|---------------|------------|----------|-------------------------------------|
| Date From         | dateFrom      | Date       | Yes      | "Please select a starting date."    |
| Date To           | dateTo        | Date       | Yes      | "Please select an end date."        |
| Customer          | customer      | Dropdown/autocomplete | No   |                                     |
| Bill Status       | billStatus    | Dropdown (All, Paid, Unpaid, Overdue) | No |     |

- "Apply" (primary), `data-testid="cbillsum-filters-apply"`

#### Table

| Column          | Field            | Notes                        |
|-----------------|------------------|------------------------------|
| Bill #          | billNumber       | Clickable (view bill print)  |
| Bill Date       | billDate         |                              |
| Customer        | customerName     |                              |
| Line Item       | lineItem         | Description                  |
| Qty             | qty              |                              |
| Unit Price      | unitPrice        | (right)                      |
| Amount          | amount           |                              |
| Paid Amount     | paidAmount       |                              |
| Status          | status           | Badge: Paid/Unpaid/Overdue   |

#### Table Features

- Rows grouped by Bill#; line items displayed as sub-rows (indent)
- Sticky bill header row (on scroll)
- Export as Excel, PDF (top-right per filter set, disables if empty)
- Print (print-optimized)

#### States

- Loading skeleton for table and filters
- Empty: "No customer bills found for selection."
- API failure: Inline red card.

#### Data Test IDs

- `cbillsum-filters-datefrom`, `cbillsum-filters-dateto`, `cbillsum-filters-customer`, `cbillsum-filters-billstatus`
- `cbillsum-filters-apply`
- `cbillsum-table`, `cbillsum-itemrow`
- `cbillsum-export-pdf`, `cbillsum-export-excel`
- `cbillsum-pagination`

---

## 182. CustomerBillWisePending-old

**Route:** `/reports/customer-bills/pending-old`  
**Purpose:** Show all pending (unpaid/partially-paid) customer bills using the legacy computation method/archived records.  
**PRD Reference:** Reporting, Compliance  
**Access Roles:** Supervisor, Administrator, Auditor

### Structure

- Title: "Legacy Pending Customer Bills"
- Filters:

| Label                  | Field           | Type    |
|------------------------|-----------------|---------|
| Date to                | toDate          | Date    |
| Customer (code/name)   | customer        | Search  |

- "Show Report" (primary), `data-testid="cbillpendingold-apply"`

#### Table

| Column      | Field        | Note          |
|-------------|-------------|---------------|
| Bill No     | billNo       | (click->print)|
| Bill Date   | billDate     |               |
| Customer    | customerName |               |
| Amount      | amount       |               |
| Paid        | paid         |               |
| Balance     | balance      | (bold, right) |
| Status      | status       | Paid/Pending  |

#### Features

- Archive/watermark "LEGACY" on export/print.
- Export (PDF/Excel), Print.
- Pagination (if >100 records).
- Loading: shimmer table.
- Empty: "No records for selected filters."

#### Data Test IDs

- `cbillpendingold-apply`
- `cbillpendingold-table`, `cbillpendingold-row`
- `cbillpendingold-export-pdf`, `cbillpendingold-export-excel`

---

## 183. CustomerBillWisePending

**Route:** `/reports/customer-bills/pending`  
**Purpose:** List all current customer bills with non-zero balance (outstanding/overdue).  
**PRD Reference:** FR-273, Customer Billing  
**Access Roles:** Supervisor, Administrator

### Structure

- Header: "Pending Customer Bills"
- Filters bar: dateTo, customer (autocomplete/name/code)
- Apply (primary)
- Table: same as 182, but computed as of "to" date with up-to-date allocations.
- Badge for "Overdue" (when balance > 0 and >X days old)

#### Table Columns

| Column    | Field      | Note          |
|-----------|-----------|---------------|
| Bill #    | billNo     | click-print   |
| Bill Date | billDate   |               |
| Customer  | customerName|             |
| Amount    | amount     | right         |
| Paid      | paid       | right         |
| Balance   | balance    | right, bold   |
| Status    | status     | Paid/Pending/Overdue |

#### Features

- Export (PDF/Excel)
- Print
- Sort by balance, date
- Mark overdue bills with warning badge (red/orange)
- Pagination (50/page)
- Empty: "No pending bills."
- Loading: shimmer

#### Data Test IDs

- `cbillpending-apply`
- `cbillpending-table`, `cbillpending-row`
- `cbillpending-export-pdf`, `cbillpending-export-excel`

---

## 184. CustomerBillWisePending1

**Route:** `/reports/customer-bills/pending-alt`  
**Purpose:** Alternate layout for pending customer bills, shows additional fields (e.g., salesperson, region).  
**PRD Reference:** Analytics, Customer Billing  
**Access Roles:** Supervisor

### Structure

- Filters: date to, customer (autocomplete/name/code), salesperson
- Table as above, plus:
  - Salesperson
  - Region/Area (if available)
  - Days Outstanding (int)
- Export, Print, Pagination

#### Data Test IDs

- `cbillpending1-apply`
- `cbillpending1-table`, `cbillpending1-row`
- `cbillpending1-export-pdf`, `cbillpending1-export-excel`

---

## 185. CustomerBillWiseSummary-New

**Route:** `/reports/customer-bills/summary-new`  
**Purpose:** New summary of customer bills, showing aggregate by customer (totals, outstanding, age buckets).  
**PRD Reference:** Reporting, Analytics  
**Access Roles:** Supervisor, Administrator

### Structure

- Filters: to date, area/region (dropdown), min balance
- Table columns:

| Column              | Field          | Notes         |
|---------------------|---------------|---------------|
| Customer            | customerName  |               |
| Area/Region         | area          |               |
| Amount Billed       | amount        | sum           |
| Paid                | paid          | sum           |
| Outstanding         | outstanding   | sum           |
| D15, D30, ... D90+  | age buckets   | numbers       |
| Status              | status        | badge         |

- Export, Print, Paginate; loading/empty/error as above.

#### Data Test IDs

- `cbillsummarynew-apply`
- `cbillsummarynew-table`, `cbillsummarynew-row`
- `cbillsummarynew-export-pdf`, `cbillsummarynew-export-excel`

---

## 186. CustomerBillWiseSummary

**Route:** `/reports/customer-bills/summary`  
**Purpose:** Show summary of customer billing with totals, paid, outstanding, aggregated by customer.  
**PRD Reference:** Analytics  
**Access Roles:** Supervisor, Administrator

### Same as 185, but original/legacy layout.

#### Data Test IDs

- `cbillsummary-apply`
- `cbillsummary-table`, `cbillsummary-row`
- `cbillsummary-export-pdf`, `cbillsummary-export-excel`

---

## 187. CustomerBillWiseSummary_advisorwise

**Route:** `/reports/customer-bills/summary-advisorwise`  
**Purpose:** Summary of customer bills grouped by advisor/salesperson.  
**PRD Reference:** Analytics, Performance  
**Access Roles:** Supervisor

### Structure

- Filters: to date, salesperson (dropdown, multi)
- Table columns:

| Column      | Field          |
|-------------|---------------|
| Advisor     | advisorName   |
| Customer    | customerName  |
| Amount      | amount        |
| Paid        | paid          |
| Outstanding | outstanding   |
| Age Buckets | D15, D30...   |
| Status      | status        |

#### Data Test IDs

- `cbilladvisorwise-apply`
- `cbilladvisorwise-table`, `cbilladvisorwise-row`
- `cbilladvisorwise-export-pdf`, `cbilladvisorwise-export-excel`

---

## 188. CustomerList

**Route:** `/customers/list`  
**Purpose:** List all customers, view, filter, export, print, and drill-to-details.  
**PRD Reference:** FR-61, Reporting & Statements  
**Access Roles:** All (view), Supervisor/Admin (full export/print)

### Structure

- Filters: name/code, area, status (active/inactive), type (dropdown)
- Table columns:

| Column         | Field       | Note                   |
|----------------|-------------|------------------------|
| Code           | code        | Unique                 |
| Name           | name        |                        |
| Area           | area        |                        |
| Contact        | contact     | Main phone/email       |
| Outstanding    | outstanding | If enabled             |
| Status         | status      | Active/Inactive badge  |
| Created        | created     | Date                   |
| Actions        |             | View, Print (icon)     |

- Export PDF/Excel
- Print (current page/all)
- Drills to customer detail (`/customers/:id`)

#### Data Test IDs

- `customerlist-apply`
- `customerlist-table`, `customerlist-row`
- `customerlist-export-pdf`, `customerlist-export-excel`
- `customerlist-print`
- `customerlist-detail-link`

---

## 189. CustomerOurstandgReport_SalesMan

**Route:** `/reports/customer-outstanding/salesmanwise`  
**Purpose:** Show customer outstanding balances per sales/advisor for collection and performance tracking.  
**PRD Reference:** Sales Management, Reporting  
**Access Roles:** Supervisor, Administrator

### Structure

- Filters: date (to), salesperson/advisor (multi-select), min balance
- Table columns:

| Column      | Field      |
|-------------|-----------|
| Salesman    | advisor   |
| Customer    | customer  |
| Phone       | phone     |
| Outstanding | balAmt    |
| Age in days | ageDays   |
| Status      | status    |

- Sortable, Export PDF/Excel, Print

#### Data Test IDs

- `coutstandingsalesman-apply`
- `coutstandingsalesman-table`, `coutstandingsalesman-row`
- `coutstandingsalesman-export-pdf`, `coutstandingsalesman-export-excel`

---

## 190. CustomerVisit

**Route:** `/reports/customer-visits`  
**Purpose:** Display a report of customer visits (service/sales calls, completions).  
**PRD Reference:** Reporting, Analytics  
**Access Roles:** Standard User, Supervisor

### Structure

- Filters: date-from, date-to, customer (auto-complete), visit type (dropdown)
- Table columns:

| Column     | Field        |
|------------|-------------|
| Customer   | customer    |
| Visit Date | visitDate   |
| Purpose    | purpose     |
| Advisor    | assignedTo  |
| Status     | status      |

- Pagination, Export, Print

#### Data Test IDs

- `customervisit-apply`
- `customervisit-table`, `customervisit-row`
- `customervisit-export-pdf`, `customervisit-export-excel`
- `customervisit-print`

---

## 191. DailyVoucherList

**Route:** `/vouchers/daily-list`  
**Purpose:** Display all voucher entries for a single day, with filter/export/print options.  
**PRD Reference:** Voucher & Transaction Entry  
**Access Roles:** Standard User (view), Supervisor/Admin (full export)

### Structure

- Date picker (required)
- Filter button (primary)
- Table columns:

| Column      | Field       |
|-------------|------------|
| Voucher #   | voucher    |
| Date        | date       |
| Account     | account    |
| Narration   | narration  |
| Debit       | debit      |
| Credit      | credit     |
| Status      | status     |
| Actions     | view/print |

- Export, Print
- Row click opens voucher details

#### Data Test IDs

- `voucherlist-date`
- `voucherlist-apply`
- `voucherlist-table`, `voucherlist-row`
- `voucherlist-export-pdf`, `voucherlist-export-excel`
- `voucherlist-print`
- `voucherlist-detail-link`

---

## 192. DebitNote

**Route:** `/finance/debit-notes`  
**Purpose:** View, filter, and export all issued Debit Notes for accounting and audit.  
**PRD Reference:** FR-192  
**Access Roles:** Supervisor, Administrator

### Structure

- Filters bar: from/to date, party (dropdown), type (dropdown)
- Apply, Reset buttons
- Table columns:

| Column      | Field        |
|-------------|-------------|
| Debit Note #| drcrNoteNo  | Clickable for detail/print |
| Date        | date        |                          |
| Party       | partyName   |                          |
| Amount      | amount      | Currency                 |
| Reason      | narration   |                          |
| User        | user        | Creator                  |
| Status      | status      | Approved/Pending/Rev.    |
| Actions     |             | Print/Export icons       |

- Pagination, Export, Print

#### Data Test IDs

- `debitnote-filters-from`, `debitnote-filters-to`, `debitnote-filters-party`, `debitnote-filters-type`
- `debitnote-filters-apply`, `debitnote-filters-reset`
- `debitnote-table`, `debitnote-table-row`, `debitnote-row-print`
- `debitnote-export-pdf`, `debitnote-export-csv`

---

## 193. DEPOSIT_CERTIFICATE_TEMPLATE

**Route:** `/finance/deposit-certificate/:depositId`  
**Purpose:** Generate, preview, and print official deposit certificates for customer reference and audit.  
**PRD Reference:** Financial Reporting  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- Modal (center, max-width 600px), glassmorphism.
- Certificate header: company logo, name, "Deposit Certificate" large and bold.
- Fields:

| Field              | Presentation |
|--------------------|-------------|
| Certificate #      | Large, bold      |
| Date               | Right top corner |
| Depositor Name     | Center, bold     |
| Deposit Amount     | Currency, large  |
| Reference          | Text, right      |
| Remarks            | Text (optional)  |
| Issued by, Date    | Footer, right    |

- "System-generated certificate" (footer, small, grey, center)

### Actions

- Print (primary), `data-testid="depositcert-print"`
- Export PDF (secondary), `data-testid="depositcert-export-pdf"`

### Loading/Error

- Spinner overlay while loading; red error on fetch/API fail.

#### Data Test IDs

- `depositcert-header`, `depositcert-amount`, `depositcert-print`, `depositcert-export-pdf`

---

## 194. DischargeReceipt

**Route:** `/finance/discharge-receipt/:receiptId`  
**Purpose:** Generate/print discharge receipts (final payoff, goods, liability) for customers or suppliers.  
**PRD Reference:** Finance, Reporting  
**Access Roles:** Supervisor, Administrator

### Structure

- Modal/card, 600px max-width.
- "Discharge Receipt" (title), watermark if generated copy.
- Receipt #: bold, left
- Date, right
- Recipient: bold name
- Details table:

| Field      | Presentation |
|------------|-------------|
| Line Item  | Description |
| Amount     | Currency    |

- Total: bold, large
- Notes/remarks: (if present)
- Printed by, date/time

### Actions

- Print (primary), `data-testid="dischargereceipt-print"`
- Export (PDF), `dischargereceipt-export-pdf`

### Loading/Error

- Spinner on fetch; error message block if not found.

#### Data Test IDs

- `dischargereceipt-header`, `dischargereceipt-print`, `dischargereceipt-export-pdf`

---

## 195. DiscountSummaryReport

**Route:** `/reports/discount-summary`  
**Purpose:** Show and export discounts applied by period, customer, invoice, staff.  
**PRD Reference:** Reporting, Analytics  
**Access Roles:** Supervisor, Administrator

### Structure

- Filters: date range (from/to), customer, staff, min/max discount%
- Table columns:

| Column        | Field         | Note           |
|---------------|--------------|----------------|
| Invoice/Bill  | bill         | (click->print) |
| Date          | date         |                |
| Customer      | customer     |                |
| Discount Amt  | discountAmt  | Currency       |
| Discount %    | discountPct  |                |
| Net Amount    | netAmt       |                |
| Staff         | staff        |                |

- Export PDF, Excel/CSV
- Print

#### Data Test IDs

- `discountsum-filters-datefrom`, `discountsum-filters-dateto`, `discountsum-filters-customer`, `discountsum-filters-staff`, `discountsum-filters-min`, `discountsum-filters-max`
- `discountsum-apply`
- `discountsum-table`, `discountsum-row`
- `discountsum-export-pdf`, `discountsum-export-excel`
- `discountsum-print`

---

## 196. DOPrnt-old

**Route:** `/delivery/do-print-old/:deliveryOrderId`  
**Purpose:** Print legacy delivery order format for archival/reference.  
**PRD Reference:** Delivery Management  
**Access Roles:** Administrator

### Structure

- Glass print card (640px).
- Header: company, "Delivery Order (Legacy Format)", bold.
- DO details: as per legacy field structure.
- Table: legacy column layout.
- Footer: "Legacy print — for archive/check only. Not valid for shipment."

### Actions

- Print, `data-testid="doprntold-print"`
- Export PDF, `data-testid="doprntold-export-pdf"`

### Loading/Error

- Spinner on data fetch; red error if can't fetch.

#### Data Test IDs

- `doprntold-header`, `doprntold-print`, `doprntold-export-pdf`, `doprntold-table`

---

## 197. DOPrnt

**Route:** `/delivery/do-print/:deliveryOrderId`  
**Purpose:** Standard print/digital delivery order for dispatch, includes full details, items, customer info.  
**PRD Reference:** Delivery Notes, Order Management  
**Access Roles:** All assigned sales, dispatch, admin staff

### Structure

- Max-width 700px, glassmorphism
- Header: logo, company, "Delivery Order"
- DO details: DO No, date, customer, address, linked order/invoice
- Items table: S No | Description | Qty | Unit | Remarks
- Footer: Signature section, "Dispatched by", company stamp placeholder.

### Actions

- Print, `data-testid="doprnt-print"`
- Export PDF, `data-testid="doprnt-export-pdf"`

### Loading/Error

- Spinner; "Cannot fetch/order not found" in red

#### Data Test IDs

- `doprnt-header`, `doprnt-table`, `doprnt-print`, `doprnt-export-pdf`

---

## 198. DOPrntold

**Route:** `/delivery/do-print-archive/:deliveryOrderId`  
**Purpose:** Alternate/archival legacy DO print layout for older records.  
**PRD Reference:** Delivery/Archive  
**Access Roles:** Admin

### Structure

- Archive card, max 700px
- Header: company, date, archive label
- Items table: as per legacy record schema
- Footer: "ARCHIVE COPY" in red

### Actions

- Print, `data-testid="doprntarchive-print"`
- Export PDF, `doprntarchive-export-pdf`

#### Data Test IDs

- `doprntarchive-header`, `doprntarchive-table`, `doprntarchive-print`, `doprntarchive-export-pdf`

---

## 199. DoRegister

**Route:** `/delivery/register`  
**Purpose:** List/register all delivery orders for period/status/customer; filter/export/print.  
**PRD Reference:** Reporting, Delivery Management  
**Access Roles:** Standard User, Supervisor, Administrator

### Structure

- Filters: date from/to, customer, status (pending, closed, delivered)
- Table columns:

| Column      | Field      |
|-------------|-----------|
| DO No/ID    | doNo      |
| Date        | doDate    |
| Customer    | customer  |
| Status      | status    |
| Dispatched By| user     |
| Items (#)   | itemCount |
| Actions     | view/print|

- Paginated. View/print icons.

- Export: PDF, Excel

#### Data Test IDs

- `doregister-apply`
- `doregister-table`, `doregister-row`
- `doregister-export-pdf`, `doregister-export-excel`
- `doregister-print`

---

## 200. EmployeeAttendanceList

**Route:** `/hr/employee-attendance`  
**Purpose:** Show employee attendance records by date/period for payroll/audit/HR.  
**PRD Reference:** Personnel & HR Utilities  
**Access Roles:** HR, Payroll, Supervisor, Administrator

### Structure

- Filters: date-from, date-to, department/section (dropdown), employee (autocomplete)
- Table columns:

| Column      | Field        | Note      |
|-------------|-------------|-----------|
| Employee    | name        |           |
| Date        | attendanceDate |         |
| IN Time     | inTime      |           |
| OUT Time    | outTime     |           |
| Status      | status      | Present/Absent/Late/Leave (badge)|
| Department  | dept        |           |
| Section     | section     |           |

- Pagination, Export, Print

#### Data Test IDs

- `empattn-filters-from`, `empattn-filters-to`, `empattn-filters-dept`, `empattn-filters-employee`
- `empattn-apply`
- `empattn-table`, `empattn-row`
- `empattn-export-pdf`, `empattn-export-excel`
- `empattn-print`

---

## COVERAGE CHECK

| Screen Name                           | Status     |
|----------------------------------------|------------|
| CBPBook                               | ✅ covered |
| Company_Report_Header                  | ✅ covered |
| Copy of DOPrnt                         | ✅ covered |
| Copy of SaleBillPrnt-back              | ✅ covered |
| CreditNote                             | ✅ covered |
| CustomerBillDetailedSummary            | ✅ covered |
| CustomerBillWisePending-old            | ✅ covered |
| CustomerBillWisePending                | ✅ covered |
| CustomerBillWisePending1               | ✅ covered |
| CustomerBillWiseSummary-New            | ✅ covered |
| CustomerBillWiseSummary                | ✅ covered |
| CustomerBillWiseSummary_advisorwise    | ✅ covered |
| CustomerList                           | ✅ covered |
| CustomerOurstandgReport_SalesMan       | ✅ covered |
| CustomerVisit                          | ✅ covered |
| DailyVoucherList                       | ✅ covered |
| DebitNote                              | ✅ covered |
| DEPOSIT_CERTIFICATE_TEMPLATE           | ✅ covered |
| DischargeReceipt                       | ✅ covered |
| DiscountSummaryReport                  | ✅ covered |
| DOPrnt-old                             | ✅ covered |
| DOPrnt                                 | ✅ covered |
| DOPrntold                              | ✅ covered |
| DoRegister                             | ✅ covered |
| EmployeeAttendanceList                 | ✅ covered |

---

# FRONTEND_SPEC.md  
**Part 9/14: Employee and Job/Item/Journal/Ledger Details Screens**

---

## 201. EmployeeList

### Route
`/admin/employees`

### Purpose
Lists all company employees for HR, payroll, or reporting use. Supports search, filter, export.

### PRD Reference
- PRD § User & Role Management – EmployeeList
- FR-39, FR-41

### Access Roles
- Administrator
- Supervisor

### Layout & Structure
- Glass card container (`glass-card`)
- Section title: "Employee List"
- Filter/search panel above table
- Table for employee listing
- Paging footers
- Export/print controls in bulk-actions row

### Form Fields & Controls

#### Filters (above table)
- **Name** (`input`, label: "Employee Name")
- **Department** (`select`, label: "Department", options dynamically loaded from `/api/v1/departments`)
- **Role** (`select`, label: "Role", options: All, Standard, Supervisor, Administrator)
- **Status** (`select`, label: "Status", options: All, Active, Inactive)
- **Date Joined** (`input[type=date]`, label: "Date Joined")
- **Search Button** (primary)

#### Table Columns
- **Select (checkbox)** (bulk action)
- **Avatar** (2-letter initials, circle glass, 24×24px)
- **Name** (Employee name)
- **Email** (email, always visible)
- **Phone** (phone/mobile)
- **Role(s)** (chips/badges, see role color system below)
- **Department** (display as text)
- **Status** (badge: Active=green, Inactive=grey, Locked=red)
- **Date Joined**
- **Last Login** (date+time)
- **Actions**:  
  - Edit (edit icon button)
  - Deactivate/Activate (toggle icon button — only if not locked)
  - Reset Password (key icon)
  - View Profile/Details (info icon)

#### Action Buttons (bulk-actions, above or below table)
- **Add Employee** (primary, /admin/employees/new, testid: `employee-list-add-btn`)
- **Bulk Import** (calls file upload dialog, CSV/XLSX, testid: `employee-list-import-btn`)
- **Export List** (dropdown: Excel, PDF, CSV, testid: `employee-list-export-btn`)
- **Deactivate** (operate on selection, testid: `employee-list-bulk-deactivate-btn`)
- **Print** (print current filtered table; testid: `employee-list-print-btn`)

### Table/Modal Pop-outs
- **Edit Employee Modal** (route `/admin/employees/:id`)
- **Reset Password Modal** (confirmation required, field: new password input)

### Validations
- **Name**: Required when adding/editing ("Please enter employee name.")
- **Email**: Required, must match regex. ("Please enter a valid email address.")
- **Phone**: Optional, if present must match phone regex. ("Please enter a valid phone number.")
- **Bulk import**: File extension and structure validation.

### States
- Loading: Skeleton for table (12 rows), shimmer glass rows.
- API Error: Banner at the top of card, error toast, table grays out.
- Empty state:  
  - If no rows: "No employees found for this filter." (muted text in the table body, centered)
- Bulk action error:  
  - "Failed to deactivate selected users." (inline near action bar)
- Success toasts after action: "Employee created", "Employee deactivated", etc.

### Role Badges
- Primary brand color chip for Administrator
- Pale purple chip for Supervisor
- Desaturated glass chip for Standard

### Test Identifiers

- Section: `data-testid="employee-list-page"`
- Filters:  
  - `data-testid="employee-list-filter-name"`
  - `data-testid="employee-list-filter-department"`
  - `data-testid="employee-list-filter-role"`
  - `data-testid="employee-list-filter-status"`
  - `data-testid="employee-list-filter-datejoined"`
  - `data-testid="employee-list-search-btn"`
- Table:  
  - `data-testid="employee-list-table"`
  - Each row: `data-testid="employee-list-row-{id}"`
  - Action buttons:  
    - Edit: `data-testid="employee-list-edit-btn-{id}"`
    - Activate/Deactivate: `data-testid="employee-list-toggle-btn-{id}"`
    - Reset Password: `data-testid="employee-list-resetpass-btn-{id}"`
    - View Profile: `data-testid="employee-list-profile-btn-{id}"`
- Bulk/Export:
  - `data-testid="employee-list-add-btn"`
  - `data-testid="employee-list-import-btn"`
  - `data-testid="employee-list-export-btn"`
  - `data-testid="employee-list-bulk-deactivate-btn"`
  - `data-testid="employee-list-print-btn"`
- Modal pop-outs:
  - Edit: `data-testid="employee-edit-modal"`
  - Reset pass: `data-testid="employee-resetpass-modal"`

---

## 202. EstimationReport

### Route
`/jobs/estimations/report`

### Purpose
Generate, filter, and export detailed estimation/service job reports for customers.

### PRD Reference
- Job, Work Order & Estimation Management – Estimation Report
- FR-121, FR-122

### Access Roles
- Standard User (own estimations)
- Supervisor
- Administrator

### Layout & Structure
- Glass large card, vertical layout
- Report filters at top in panel
- Table for results, expandable rows
- Export at top-right above table

### Filter Fields
- **Estimation Number** (input, label: "Estimation #")
- **Customer Name** (input, label: "Customer Name")
- **Vehicle Number** (input, label: "Vehicle/Reg No")
- **Date Range** (start/end date pickers)
- **Advisor/Staff** (dropdown select)
- **Status** (select: All, Pending, Approved, Rejected, etc.)
- **Search Button** (primary)

### Table Columns
- **Estimation #** (click for detail modal)
- **Customer Name**
- **Vehicle**
- **Date**
- **Estimated Value**
- **Advisor**
- **Status** (badge: matches job status color system)
- **Print** (icon/button, for individual estimation)
- **Export** (one row or batch)

### Actions
- Print estimation (row and report)
- Export table: Excel, CSV, PDF
- View full details (opens modal, shows all line items/entities)
- Pagination

### Validations
- Date(s): end >= start ("End date must not be before start date.")
- Customer, Vehicle: optional
- Printable/exportable even if filtered to 0 (shows empty state in exported doc).

### States
- Loading: Table, header stats, print/export skeleton
- Error: "Failed to load estimation report." banner
- Empty: "No matching estimations found."
- Print/export error: Banner inline near action button

### Test Identifiers

- `data-testid="estimation-report-page"`
- Filters:
  - `data-testid="estimation-report-filter-estno"`
  - `data-testid="estimation-report-filter-cust"`
  - `data-testid="estimation-report-filter-veh"`
  - `data-testid="estimation-report-filter-datefrom"`
  - `data-testid="estimation-report-filter-dateto"`
  - `data-testid="estimation-report-filter-advisor"`
  - `data-testid="estimation-report-filter-status"`
  - `data-testid="estimation-report-search-btn"`
- Table:  
  - `data-testid="estimation-report-table"`
  - Rows: `data-testid="estimation-report-row-{estno}"`
  - Print: `data-testid="estimation-report-row-print-{estno}"`
  - Export: `data-testid="estimation-report-row-export-{estno}"`
- Modal:  
  - `data-testid="estimation-report-modal-detail"`

---

## 203. InsuraceInvReport

### Route
`/finance/insurance-invoices/report`

### Purpose
Generate/export detailed insurance invoice reports for claims, settlements, or customer documents.

### PRD Reference
- Financial Reporting & Statements – Insurance Invoice Report
- FR-293

### Access Roles
- Supervisor
- Administrator

### Layout & Structure
- Glass card, with prominent report filter section
- Table of insurance invoices with related customer, vehicle, and claim data

### Filters
- **Insurance Company** (dropdown, populated via API)
- **Invoice Number** (input)
- **Claim Number** (input)
- **Customer Name** (input)
- **Date Range** (from/to)
- **Status** (select: All, Pending, Settled, Closed)
- **Search Button** (primary)

### Table Columns
- **Invoice #**
- **Claim #**
- **Customer Name**
- **Vehicle**
- **Date**
- **Insurance Company**
- **Total Amount**
- **Status**
- **Advisor/Staff**
- **Export (row)**
- **Print (row)**

### Actions
- Export: all, or selected rows (Format: PDF, Excel, CSV)
- Print: individual rows or whole report
- View/expand invoice details (modal or row expansion)
- Download supporting attachments (if present)

### Validations
- Invoice #, Claim #: optional, no special restrictions
- Date validations as above (end not before start)
- Company select: must be valid option (with fallback "All")

### States
- Loading: glass/skeleton for filter panel and rows
- Error: "Insurance invoice report failed to load."
- Empty: "No insurance invoices match your criteria."

### Test Identifiers

- `data-testid="insurance-invoice-report-page"`
- Filters:
  - `data-testid="insurance-invoice-report-filter-company"`
  - `data-testid="insurance-invoice-report-filter-invoice"`
  - `data-testid="insurance-invoice-report-filter-claim"`
  - `data-testid="insurance-invoice-report-filter-customer"`
  - `data-testid="insurance-invoice-report-filter-datefrom"`
  - `data-testid="insurance-invoice-report-filter-dateto"`
  - `data-testid="insurance-invoice-report-filter-status"`
  - `data-testid="insurance-invoice-report-search-btn"`
- Table: `data-testid="insurance-invoice-report-table"`
- Table row: `data-testid="insurance-invoice-report-row-{invoice}"`
- Print: `data-testid="insurance-invoice-report-row-print-{invoice}"`
- Export: `data-testid="insurance-invoice-report-row-export-{invoice}"`

---

## 204. InvoiceDetailsServ

### Route
`/jobs/invoices/:invoiceId/service-details`

### Purpose
Display detailed line-item breakdown for service job invoices (labour, parts, totals, taxes) with link to related job/estimation.

### PRD Reference
- Job, Work Order & Estimation Management / Invoice Details
- FR-81, FR-293

### Access Roles
- Standard User (linked jobs only)
- Supervisor
- Administrator

### Layout & Structure
- Glass panel containing:
  - Invoice summary header
  - Customer and vehicle card (side by side, glassmorphism)
  - Line-item table
  - Totals summary section
  - Action strip

### Fields / Table

#### Header Card
- **Invoice #:** (large, bold)
- **Date Issued**
- **Job/Order #:** (link to job card)
- **Status:** (Paid, Unpaid, Partially Paid, Overdue; badge)
- **Print / Export row actions** 

#### Customer Card
- **Customer Name**
- **Contact**
- **Address (1,2,3)**
- **Phone/Email**

#### Vehicle Card
- **Vehicle Reg/No**
- **Make / Model**
- **Engine / Chassis No**
- **Advisor / Staff**

#### Table Columns (Line Items)
- **Description**
- **Item Code**
- **Qty**
- **Unit Price**
- **Discount**
- **Tax**
- **Line Total**

#### Totals Sub-section
- **Subtotal**
- **Total Tax**
- **Discount (if any)**
- **Grand Total**
- **Amount due / paid**

#### Actions
- Print/Export (primary, PDF/Excel)
- View related job (link)
- Print for customer (special format)

### Validations
- No edit actions on this screen.
- If invoiceId does not exist: 404 page with call to action to return back or "Search for an invoice".

### States
- Loading: Skeleton for header, ghost cards for customer/vehicle, shimmer table (7–10 rows)
- Error: Red banner, disables print/export actions.
- Empty: "No items found for this invoice." (should not happen unless data is cleansed).

### Test Identifiers

- `data-testid="invoice-detailsserv-page"`
- Print/Export: `data-testid="invoice-detailsserv-export-btn"`
- Table: `data-testid="invoice-detailsserv-table"`
- Each row: `data-testid="invoice-detailsserv-row-{itemcode}"`

---

## 205. invoiceDetailsSub

### Route
`/jobs/invoices/:invoiceId/item-details`

### Purpose
Show additional detail/subline breakdown for a given invoice — e.g., assembly items, options, custom labor lines.

### PRD Reference
- Job, Work Order & Estimation Management / Invoice Sub Details
- FR-81

### Access Roles
- Supervisor
- Administrator

### Layout & Structure
- Modal dialog or full-width sub-panel
- Header: Invoice #, Customer, Date
- Table of sub-items or additional breakdown

### Table Columns
- **Parent Item Description**
- **Sub-Item Code**
- **Sub-Item Description**
- **Qty**
- **Unit/Denom**
- **Unit Price**
- **Discount**
- **Line Total**
- **Notes**

### Actions
- Export as Excel/PDF (primary button top right)
- Print
- If accessed from InvoiceDetailsServ, link to parent invoice

### Validations
- If invoiceId invalid or sub-items missing, close modal and display error toast: "No further breakdown found for this invoice."

### States
- Loading: Modal skeleton, table shimmer
- Error: "Failed to load invoice sub-item data."
- Empty: "No sub-items defined for this invoice."

### Test Identifiers

- `data-testid="invoicedetailssub-modal"`
- Table: `data-testid="invoicedetailssub-table"`
- Export: `data-testid="invoicedetailssub-export-btn"`

---

## 206. ItemDOList

### Route
`/stock/delivery-orders/:itemCode/list`

### Purpose
Show all delivery orders associated with a particular item (stock/parts logistics).

### PRD Reference
- Stock & Inventory Management / DO Item List
- FR-200, FR-215

### Access Roles
- Supervisor
- Inventory Manager
- Administrator

### Layout & Structure
- Glass panel or drawer
- Header: Item description (from Items), current stock
- Table with delivery order records

### Table Columns
- **DO Number**
- **Date**
- **Customer/Supplier**
- **Qty Delivered**
- **Qty Remaining/Pending**
- **Status** (badge: Issued, Received, Pending, Cancelled)
- **Warehouse/Location**
- **Linked Invoice/Bill #** (if any)
- **Actions (row):** View DO, Print, Export

### Actions
- Export list (Excel/PDF/CSV)
- Print selected row
- Paginated

### Validations
- If item code invalid, display error.
- Serves read-only data.

### States
- Loading: Table/row skeletons
- Error: Banner across top, disables table
- Empty: "No delivery orders for this item."

### Test Identifiers

- `data-testid="itemdolist-page"`
- Table: `data-testid="itemdolist-table"`
- Row: `data-testid="itemdolist-row-{dono}"`
- Export: `data-testid="itemdolist-export-btn"`

---

## 207. ItemDOSumm

### Route
`/stock/delivery-orders/:itemCode/summary`

### Purpose
Show summary statistics for all delivery orders related to selected item, for quick management/stock review.

### PRD Reference
- Stock & Inventory Management / DO Item Summary
- FR-200

### Access Roles
- Supervisor
- Inventory Manager
- Administrator

### Layout & Structure
- Info summary/statistics card (total delivered, pending)
- Chart or simple bar representing status counts
- Collapsible table: top 10 delivery orders for this item

### Stat Fields
- **Total DOs**
- **Total Quantity Delivered**
- **Total Quantity Pending**
- **Earliest DO Date**
- **Latest DO Date**

### Table Columns (Top 10)
- **DO Number**
- **Date**
- **Qty Delivered**
- **Qty Pending**
- **Status**

### Actions
- Export summary (Excel/PDF)
- Print
- Drill-down: link each DO to full detail

### Validations
- No data: stats show zero, chart shows zero, table empty state.

### States
- Loading: Stat card shimmer, table skeleton
- Error: Inline error
- Empty: "No delivery orders found for this item."

### Test Identifiers

- `data-testid="itemdosumm-page"`
- Stat card: `data-testid="itemdosumm-stats"`
- Table: `data-testid="itemdosumm-table"`

---

## 208. ItemList

### Route
`/items`
or `/inventory/items`

### Purpose
Master list of all items/products/stocked parts, with advanced search, filter, and batch actions.

### PRD Reference
- Stock & Inventory Management / ItemList
- FR-189, FR-194, FR-199, FR-200

### Access Roles
- All Inventory Roles (Clerk/Manager/Supervisor)

### Layout & Structure
- Glass grid or large-card list
- Header: "Item/Part Master List"
- Advanced filter/search above table/list
- Table of items with paging

### Filter Fields
- **Item Code** (input)
- **Description** (input)
- **Category/Type** (dropdown)
- **Location** (dropdown or text)
- **Status** (active, slow moving, discontinued)
- **Stock available** (min/max sliders)
- **Search** (primary)

### Table Columns
- **Item Code**
- **Description**
- **Category/Type**
- **Location**
- **Unit/Denomination**
- **Current Stock**
- **Re-Order Level**
- **Slow-Move** (icon or badge)
- **Status** (Active, Inactive)
- **Actions**: View details, Export, Print

### Actions
- Export full/filtered list (Excel, PDF, CSV)
- Print
- Drill-down: open item details modal/panel
- Bulk select for batch export

### Validations
- Item code: partial match
- Numeric validators on min/max

### States
- Loading: Glass grid skeletons or tabular shimmer
- Error: Table disables, top banner on card
- Empty: "No items found for selected filters."

### Test Identifiers

- `data-testid="itemlist-page"`
- Filters:
  - `data-testid="itemlist-filter-code"`
  - `data-testid="itemlist-filter-desc"`
  - `data-testid="itemlist-filter-category"`
  - `data-testid="itemlist-filter-location"`
  - `data-testid="itemlist-filter-status"`
  - `data-testid="itemlist-filter-stockmin"`
  - `data-testid="itemlist-filter-stockmax"`
  - `data-testid="itemlist-search-btn"`
- Table: `data-testid="itemlist-table"`
- Row: `data-testid="itemlist-row-{itemcode}"`
- Export: `data-testid="itemlist-export-btn"`

---

## 209. ItemPendingDOList

### Route
`/items/:itemCode/pending-delivery-orders`

### Purpose
Show pending DOs for an item, for fulfillment/stockout prevention.

### PRD Reference
- Stock & Inventory Management / Pending DO Item List
- FR-200

### Access Roles
- Inventory Manager
- Supervisor
- Administrator

### Layout & Structure
- Glass card, item header, filter area (for warehouse/location)
- Table

### Filters
- **Warehouse/Location** (dropdown)
- **Date Range** (start/end, optional)
- **Search** (primary)

### Table Columns
- **DO Number**
- **Supplier/Customer**
- **Date Expected**
- **Qty Pending**
- **Qty Issued**
- **Status (Pending/Overdue/Partial)** (badge)

### Actions
- Print current list
- Export (Excel, PDF, CSV)
- Mark as reviewed/acknowledged (row action, adds check or tick to row)

### Validations
- Dates: end >= start

### States
- Loading: Table skeletons
- Error: Card disables, toast shown
- Empty: "No pending delivery orders for this item."

### Test Identifiers

- `data-testid="itempendingdolist-page"`
- Filters: 
  - `data-testid="itempendingdolist-filter-location"`
  - `data-testid="itempendingdolist-filter-datefrom"`
  - `data-testid="itempendingdolist-filter-dateto"`
  - `data-testid="itempendingdolist-search-btn"`
- Table: `data-testid="itempendingdolist-table"`
- Row: `data-testid="itempendingdolist-row-{dono}"`

---

## 210. ItemPurchaseList-Import

### Route
`/items/import-purchases/list`

### Purpose
List and search all imported purchase items (foreign procurement), supporting filter, status, and export.

### PRD Reference
- Purchase & Procurement Management – Item Purchase List Import
- FR-163, FR-171

### Access Roles
- Supervisor
- Procurement Administrator

### Layout & Structure
- Glass large panel, header
- Filters above table
- Table below

### Filter Fields
- **Item Code** (input)
- **Supplier** (dropdown)
- **Date Range** (start/end)
- **PO Number** (input/optional)
- **Status** (select: All, Received, Invoiced, Pending)
- **Search** (primary)

### Table Columns
- **Import PO #**
- **Supplier**
- **Item Code**
- **Description**
- **Quantity**
- **Unit Cost**
- **Total**
- **Import Date**
- **Status**
- **Invoice #**
- **Actions:** Print/Export

### Actions
- Export filtered list
- Print selected rows
- Drill-down to item/PO details

### Validations
- Date, code, and supplier: as standard above
- Status select cannot be empty (defaults to "All")

### States
- Loading: Skeleton structure over table section
- Error: Card-level inline error, disables actions
- Empty: "No imported purchase items match the selected filters."

### Test Identifiers

- `data-testid="itempurchaselist-import-page"`
- Filters:
  - `data-testid="itempurchaselist-import-filter-code"`
  - `data-testid="itempurchaselist-import-filter-supplier"`
  - `data-testid="itempurchaselist-import-filter-datefrom"`
  - `data-testid="itempurchaselist-import-filter-dateto"`
  - `data-testid="itempurchaselist-import-filter-po"`
  - `data-testid="itempurchaselist-import-filter-status"`
  - `data-testid="itempurchaselist-import-search-btn"`
- Table: `data-testid="itempurchaselist-import-table"`

---

## 211. ItemPurchaseList-Local

### Route
`/items/local-purchases/list`

### Purpose
List all locally sourced purchase items, support advanced filter and reporting functions.

### PRD Reference
- Purchase & Procurement Management – Item Purchase List Local
- FR-164, FR-171

### Access Roles
- Supervisor
- Procurement Administrator

### Layout & Structure
- Glass card layout, filters above table

### Filters
- **Item Code** (input)
- **Supplier** (dropdown)
- **Date Range** (start/end date)
- **PO Number** (input)
- **Status** (All/Received/Invoiced/Pending)
- **Search** (primary)

### Table Columns
- **PO #**
- **Supplier**
- **Item Code**
- **Description**
- **Quantity**
- **Unit Cost**
- **Total**
- **Purchase Date**
- **Status**
- **Invoice #**
- **Actions:** Print, Export (row)

### Actions
- Export list (Excel/PDF/CSV)
- Drill into PO details modal
- Print

### Validations
- Date, code, supplier: as standard
- Invoice # optional

### States
- Loading: Table skeletons
- Error: Inline, disables action strip
- Empty: "No local purchase items found."

### Test Identifiers

- `data-testid="itempurchaselist-local-page"`
- Filters:
  - `data-testid="itempurchaselist-local-filter-code"`
  - `data-testid="itempurchaselist-local-filter-supplier"`
  - `data-testid="itempurchaselist-local-filter-datefrom"`
  - `data-testid="itempurchaselist-local-filter-dateto"`
  - `data-testid="itempurchaselist-local-filter-po"`
  - `data-testid="itempurchaselist-local-filter-status"`
  - `data-testid="itempurchaselist-local-search-btn"`
- Table: `data-testid="itempurchaselist-local-table"`

---

## 212. ItemPurchaseReturnList

### Route
`/items/purchase-returns/list`

### Purpose
View all returned purchased items for credit, refunds, and supplier claims.

### PRD Reference
- Purchase & Procurement Management – Item Purchase Return List
- FR-171

### Access Roles
- Supervisor
- Procurement Administrator

### Layout & Structure
- Glass card table, filters atop

### Filters
- **Item Code** (input)
- **Supplier** (dropdown)
- **Return Date Range** (start/end date)
- **Reason** (input/text)
- **Search** (primary)

### Table Columns
- **Return ID/No**
- **Supplier**
- **Item**
- **Qty Returned**
- **Date**
- **Reason**
- **Status** (badge)
- **Actions** (View, Print, Export row)

### Actions
- Export list/row
- Print
- View return detail

### Validations
- Date (end >= start)
- Qty positive integer
- Reason: free text, optional

### States
- Loading: Table skeletons
- Error: Banner
- Empty: "No item purchase returns match these filters."

### Test Identifiers

- `data-testid="itempurchasereturnlist-page"`
- Filters:
  - `data-testid="itempurchasereturnlist-filter-code"`
  - `data-testid="itempurchasereturnlist-filter-supplier"`
  - `data-testid="itempurchasereturnlist-filter-datefrom"`
  - `data-testid="itempurchasereturnlist-filter-dateto"`
  - `data-testid="itempurchasereturnlist-filter-reason"`
  - `data-testid="itempurchasereturnlist-search-btn"`
- Table: `data-testid="itempurchasereturnlist-table"`

---

## 213. ItemPurchaseReturnSumm

### Route
`/items/purchase-returns/summary`

### Purpose
View return trends and summarized data for purchased item returns.

### PRD Reference
- Purchase & Procurement Management – Item Purchase Return Summary
- FR-171

### Access Roles
- Supervisor
- Procurement Admin

### Layout & Structure
- Stat summary card (totals, bar/column chart by item/supplier)
- Table (item/supplier, total returned, total value)
- Filters top of page

### Filters
- **Supplier** (dropdown)
- **Date Range** (start/end)
- **Show by** (radio: Item/Supplier/Month)
- **Search** (primary)

### Stat Fields
- **Total Returns**
- **Total Value of Returns**
- **Top returned item/supplier**
- **Most recent return date**

### Table Columns
- **Item/Supplier**
- **# Returns**
- **Qty Total**
- **Total Value**
- **% of Purchases**
- **Last Returned**

### Actions
- Export summary
- Print
- Drill-down to details

### Validations
- Date/filters as standard; grouping mode required

### States
- Loading: Stat/row shimmer
- Error: Card disables
- Empty: "No item returns found for selected grouping."

### Test Identifiers

- `data-testid="itempurchasereturnsumm-page"`
- Stat card: `data-testid="itempurchasereturnsumm-stats"`
- Table: `data-testid="itempurchasereturnsumm-table"`

---

## 214. ItemPurchaseSumm-Import

### Route
`/items/import-purchases/summary`

### Purpose
Summarize imported purchase items (by item, by supplier, by month etc.) for procurement planning.

### PRD Reference
- Purchase & Procurement Management – ItemPurchaseSumm-Import
- FR-172

### Access Roles
- Supervisor
- Procurement Administrator

### Layout & Structure
- Stat summary card
- Table with grouping select above

### Filters
- **Supplier** (dropdown)
- **Date Range** (start/end)
- **Show by** (Item/Supplier/Month radio)
- **Search** (primary)

### Stat Fields
- **Total Imported Value**
- **Top Import Supplier**
- **Top Item Imported**
- **Newest Import Date**

### Table Columns
- **Item/Supplier/Month** (based on "Show by" grouping)
- **Qty**
- **Total Value**
- **% of Imports**
- **Last Import Date**

### Actions
- Export
- Print
- Drill-in to source records

### Validations
- Date and grouping required

### States
- Loading: Card/table shimmer
- Error: Inline
- Empty: "No imported purchase items found for this summary."

### Test Identifiers

- `data-testid="itempurchasesumm-import-page"`
- Stat: `data-testid="itempurchasesumm-import-stats"`
- Table: `data-testid="itempurchasesumm-import-table"`

---

## 215. ItemPurchaseSumm-Local

### Route
`/items/local-purchases/summary`

### Purpose
Summarize local purchase items for spend analysis, planning.

### PRD Reference
- Purchase & Procurement Management – ItemPurchaseSumm-Local
- FR-172

### Access Roles
- Supervisor
- Procurement Administrator

### Layout & Structure
- Stat summary card
- Table, grouping select

### Filters
- **Supplier** (dropdown)
- **Date Range**
- **Show by** (Item/Supplier/Month radio)
- **Search** (primary)

### Stat Fields
- **Total Local Purchase Value**
- **Top Supplier**
- **Top Item Purchased**
- **Recent Local Purchase**

### Table Columns
- **Item/Supplier/Month**
- **Qty**
- **Total Value**
- **% of Purchases**
- **Last Purchase Date**

### Actions
- Export
- Print
- Drill-in

### Validations
- Date, grouping required

### States
- Loading: Card shimmer, table skeleton
- Error: Inline
- Empty: "No local purchase summary data found."

### Test Identifiers

- `data-testid="itempurchasesumm-local-page"`
- Stat card: `data-testid="itempurchasesumm-local-stats"`
- Table: `data-testid="itempurchasesumm-local-table"`

---

## 216. ItemSalesList

### Route
`/items/sales/list`

### Purpose
List all items sold (products/parts), support analysis, and export.

### PRD Reference
- Order & Sales Management / Item Sales List
- FR-216, FR-293

### Access Roles
- Standard User (read)
- Supervisor
- Administrator

### Layout & Structure
- Glass card/table layout, advanced filters top

### Filters
- **Item Code** (input)
- **Customer** (input/dropdown)
- **Sales Person** (dropdown)
- **Date Range**
- **Invoice Number** (input)
- **Search** (primary)

### Table Columns
- **Invoice #**
- **Date**
- **Customer**
- **Item Code**
- **Description**
- **Qty**
- **Unit Price**
- **Discount**
- **Tax**
- **Line Total**
- **Sales Person**
- **Actions:** Print, Export

### Actions
- Export
- Print
- Drill-down

### Validations
- Standard fields above
- Dates must be valid range

### States
- Loading: Table skeletons
- Error: Top card banner
- Empty: "No item sales for these filters."

### Test Identifiers

- `data-testid="itemsaleslist-page"`
- Filters: `data-testid="itemsaleslist-filter-{name}"`
- Table: `data-testid="itemsaleslist-table"`

---

## 217. ItemSalesListJobCard

### Route
`/items/sales/jobcard`

### Purpose
List all sold items tied to job cards/services for advanced analysis.

### PRD Reference
- Order & Sales Management / ItemSalesListJobCard
- FR-216, FR-293

### Access Roles
- Supervisor
- Administrator

### Layout & Structure
- Glass card/table
- Job card number input/select above
- Table below

### Filters
- **Job Card #** (input/select)
- **Item Code** (input)
- **Date Range**
- **Search** (primary)

### Table Columns
- **Job Card #**
- **Invoice #**
- **Customer**
- **Item Code**
- **Description**
- **Qty**
- **Unit Price**
- **Discount**
- **Tax**
- **Line Total**
- **Actions:** Print, Export, Drill-down

### Actions
- Export
- Print

### Validations
- Job card #: required for initial query

### States
- Loading: Table skeletons
- Error: Card error toast
- Empty: "No sales tied to job cards for these filters."

### Test Identifiers

- `data-testid="itemsaleslistjobcard-page"`
- Filters: `data-testid="itemsaleslistjobcard-filter-jobcard"`
- Table: `data-testid="itemsaleslistjobcard-table"`

---

## 218. ItemSalesReturnSumm

### Route
`/items/sales-returns/summary`

### Purpose
Summarize all item sales returns for finance or quality review.

### PRD Reference
- Sales & Returns / ItemSalesReturnSumm
- FR-294

### Access Roles
- Supervisor
- Administrator

### Layout & Structure
- Stat card above, table below

### Filters
- **Date Range**
- **Customer** (dropdown)
- **Sales Person** (dropdown)
- **Show by** (Item/Customer/Reason radio)

### Stat Fields
- **# Returns**
- **Total Amount**
- **Most returned item**
- **Most common return reason**

### Table Columns
- **Item/Customer/Reason** (group by)
- **Qty Returned**
- **Value**
- **# of Returns**
- **Refunded?** (Yes/No badge)
- **Last Return Date**

### Actions
- Export
- Print
- Drill-in

### Validations
- Date required

### States
- Loading: Card, table shimmer
- Error: In-panel
- Empty: "No item sales return summary found."

### Test Identifiers

- `data-testid="itemsalesreturnsumm-page"`
- Stats: `data-testid="itemsalesreturnsumm-stats"`
- Table: `data-testid="itemsalesreturnsumm-table"`

---

## 219. ItemSalesSumm

### Route
`/items/sales/summary`

### Purpose
Summarize all item sales by various groupings for management review.

### PRD Reference
- Order & Sales Management / ItemSalesSumm
- FR-216, FR-293

### Access Roles
- Supervisor
- Administrator

### Layout & Structure
- Stat card, grouping select, table

### Filters
- **Date Range**
- **Sales Person**
- **Show by** (Item/Customer/Month radio)

### Stat Fields
- **Total Sales**
- **Top Item/Customer**
- **Highest Value Transaction**

### Table Columns
- **Item/Customer/Month**
- **Qty Sold**
- **Total Value**
- **% of Sales**
- **Last Sold Date**

### Actions
- Export
- Print
- Drill-in to detail

### Validations
- Date required

### States
- Loading: Card/table skeleton
- Error: Inline
- Empty: "No item sales summary found for these filters."

### Test Identifiers

- `data-testid="itemsalessumm-page"`
- Stats: `data-testid="itemsalessumm-stats"`
- Table: `data-testid="itemsalessumm-table"`

---

## 220. ItemSreturnList

### Route
`/items/sales-returns/list`

### Purpose
Show all items returned by customers for warranty, refund, or analytics.

### PRD Reference
- Sales & Returns / ItemSreturnList
- FR-294

### Access Roles
- Supervisor
- Administrator

### Layout & Structure
- Filter panel, table below

### Filters
- **Item Code**
- **Customer**
- **Date Range**
- **Reason**
- **Search** (primary)

### Table Columns
- **Return #**
- **Date**
- **Customer**
- **Item Code**
- **Description**
- **Qty Returned**
- **Return Reason**
- **Refunded?** (badge)
- **Processed By**
- **Actions:** Print/Export row

### Actions
- Export list
- Print
- Drill to detail modal

### Validations
- Date validity
- Item code: optional

### States
- Loading: Table skeletons
- Error: Panel disables
- Empty: "No item sales returns found."

### Test Identifiers

- `data-testid="itemsreturnlist-page"`
- Filters: `data-testid="itemsreturnlist-filter-item"`
- Table: `data-testid="itemsreturnlist-table"`

---

## 221. itemtranscount

### Route
`/items/transaction-count`

### Purpose
Provides counts of item transactions for reconciliation or analytics.

### PRD Reference
- FR-199, FR-214

### Access Roles
- Supervisor
- Inventory Manager
- Administrator

### Layout & Structure
- Filter top bar, single-row stat summary, table

### Filters
- **Date Range**
- **Category** (dropdown)
- **Minimum Transactions** (number, min=1)
- **Search**

### Stat Fields
- **# Items found**
- **Average transactions per item**
- **Max transaction count**

### Table Columns
- **Item Code**
- **Tag**
- **Description**
- **Total Transactions**

### Actions
- Export list
- Print
- Drill-in

### Validations
- Min transactions >=1

### States
- Loading: Card/table shimmer
- Error: Inline
- Empty: "No items meet the transaction count criteria."

### Test Identifiers

- `data-testid="itemtranscount-page"`
- Filters: `data-testid="itemtranscount-filter-category"`
- Table: `data-testid="itemtranscount-table"`

---

## 222. JobDetailsSub

### Route
`/jobs/:jobCardId/sub-details`

### Purpose
Display all sub-job steps or sub-details for an ongoing job or completed work order.

### PRD Reference
- Job, Work Order & Estimation Management – JobDetailsSub
- FR-121, FR-125

### Access Roles
- Supervisor
- Administrator

### Layout & Structure
- Glass modal or sidebar
- Header: Job #, Customer, Vehicle, Date
- Sub-jobs as list/table

### Table Columns
- **Step Description**
- **Date**
- **Responsible Staff**
- **Status (badge)**
- **Start Time**
- **End Time**
- **Duration**

### Actions
- Export sub-details (PDF/Excel)
- Print
- Add comment/note (if write permission)

### Validations
- JobCardId must be valid in URL

### States
- Loading: Glass modal skeleton
- Error: Red banner, disables actions
- Empty: "No sub-job records found for this job."

### Test Identifiers

- `data-testid="jobdetailssub-modal"`
- Table: `data-testid="jobdetailssub-table"`

---

## 223. JobStatusAdvisorWise

### Route
`/jobs/status/advisor-wise`

### Purpose
Shows work/job statuses by advisor for performance or allocation review.

### PRD Reference
- Job, Work Order & Estimation Management – JobStatusAdvisorWise
- FR-104

### Access Roles
- Supervisor
- Administrator

### Layout & Structure
- Filter panel, stacked group tables (by advisor)

### Filters
- **Advisor/Staff** (dropdown)
- **Date Range**
- **Status** (dropdown)
- **Search** (primary)

### Table Columns
- **Job #**
- **Customer**
- **Vehicle**
- **Date**
- **Status**
- **Hours Worked**
- **# Steps**
- **Completion Date**
- **Actions:** Print/Export, View details

### Actions
- Export group/tables
- Print by advisor
- Drill-down

### Validations
- Advisor selection optional; All shows all

### States
- Loading: Group tables shimmer
- Error: Top banner (per section if needed)
- Empty: Table with "No jobs found for this advisor."

### Test Identifiers

- `data-testid="jobstatusadvisorwise-page"`
- Filters: `data-testid="jobstatusadvisorwise-filter-advisor"`
- Table: `data-testid="jobstatusadvisorwise-table-{advisor}"`

---

## 224. JournalVoucher

### Route
`/finance/vouchers/journal`

### Purpose
Show all entries made as journal vouchers, supporting filter/search and export for audit.

### PRD Reference
- Voucher & Transaction Entry – Journal Voucher
- FR-306

### Access Roles
- Finance Supervisor
- Finance Administrator

### Layout & Structure
- Glass card, top filter area
- Table listing all journal voucher entries within filter

### Filter Fields
- **Voucher #** (input)
- **Account** (dropdown, suggest after 2 chars)
- **Date Range**
- **Status** (All/Posted/Draft/Suspended)
- **Search** (primary)

### Table Columns
- **Voucher #**
- **Date**
- **Account**
- **Debit**
- **Credit**
- **Narration**
- **Status**
- **Actions:** View details, Print, Export

### Actions
- Export
- Print
- View details (modal)
- Drill-in

### Validations
- Voucher #: optional, but must be alphanumeric
- Date: standard

### States
- Loading: Table shimmer rows
- Error: Card disables, toast error
- Empty: "No journal vouchers found."

### Test Identifiers

- `data-testid="journalvoucher-page"`
- Filters: `data-testid="journalvoucher-filter-voucher"`
- Table: `data-testid="journalvoucher-table"`

---

## 225. Ledger

### Route
`/finance/ledger`

### Purpose
Present transaction history for selected ledgers, with powerful filtering and reports options.

### PRD Reference
- Ledger & Account Management – Ledger
- FR-251

### Access Roles
- Accountant
- Finance Supervisor
- Auditor

### Layout & Structure
- Glass card, advanced filter area top
- Table with transaction rows, running balance

### Filter Fields
- **Account** (dropdown/auto-complete)
- **Date Range**
- **Transaction Type** (dropdown: All, Debit, Credit, PDC, etc.)
- **Amount Min** (input)
- **Amount Max** (input)
- **Narration** (input)
- **Search** (primary)

### Table Columns
- **Date**
- **Voucher #**
- **Type**
- **Description**
- **Debit**
- **Credit**
- **Balance**
- **Reference #**
- **Narration**
- **Actions:** Print/Export, View Voucher

### Actions
- Export current view (Excel/PDF/CSV)
- Print
- Drill to voucher detail

### Validations
- Account required
- Dates valid
- Amount min/max: min <= max, numeric

### States
- Loading: Table rows shimmer
- Error: Inline, disables table
- Empty: "No ledger transactions found for these filters."

### Test Identifiers

- `data-testid="ledger-page"`
- Filters:
  - `data-testid="ledger-filter-account"`
  - `data-testid="ledger-filter-daterange"`
  - `data-testid="ledger-filter-type"`
  - `data-testid="ledger-filter-amountmin"`
  - `data-testid="ledger-filter-amountmax"`
  - `data-testid="ledger-filter-narration"`
  - `data-testid="ledger-search-btn"`
- Table: `data-testid="ledger-table"`
- Table Row: `data-testid="ledger-row-{voucher}"`

---

## COVERAGE CHECK

| Screen Name                   | Status    |
|-------------------------------|-----------|
| 201. EmployeeList             | ✅ covered |
| 202. EstimationReport         | ✅ covered |
| 203. InsuraceInvReport        | ✅ covered |
| 204. InvoiceDetailsServ       | ✅ covered |
| 205. invoiceDetailsSub        | ✅ covered |
| 206. ItemDOList               | ✅ covered |
| 207. ItemDOSumm               | ✅ covered |
| 208. ItemList                 | ✅ covered |
| 209. ItemPendingDOList        | ✅ covered |
| 210. ItemPurchaseList-Import  | ✅ covered |
| 211. ItemPurchaseList-Local   | ✅ covered |
| 212. ItemPurchaseReturnList   | ✅ covered |
| 213. ItemPurchaseReturnSumm   | ✅ covered |
| 214. ItemPurchaseSumm-Import  | ✅ covered |
| 215. ItemPurchaseSumm-Local   | ✅ covered |
| 216. ItemSalesList            | ✅ covered |
| 217. ItemSalesListJobCard     | ✅ covered |
| 218. ItemSalesReturnSumm      | ✅ covered |
| 219. ItemSalesSumm            | ✅ covered |
| 220. ItemSreturnList          | ✅ covered |
| 221. itemtranscount           | ✅ covered |
| 222. JobDetailsSub            | ✅ covered |
| 223. JobStatusAdvisorWise     | ✅ covered |
| 224. JournalVoucher           | ✅ covered |
| 225. Ledger                   | ✅ covered |

All screens assigned to PART 9 are fully specified.

---

# FRONTEND_SPEC.md

## 226. LedgerSummaryActual

**Route Path:** `/ledger/summary-actual`

**Purpose:**  
Displays account ledger summary with up-to-date balances, enabling users to review and export the latest status for each ledger. Designed for real-time management reporting.

**PRD Reference:**  
- LedgerSummaryActual (Screen List)
- Functional: FR-254, FR-258, FR-264
- User Story: US-211, US-219, US-264
- Business Rule: BR-94, BR-95

**Access Roles:**  
Supervisor, Administrator

### Layout & Structure

- Glass "panel" container (`--radius-md`, strong card with background: `var(--color-bg-card)`)
- Vertical spacing between filter bar, summary table, export controls
- Responsive table for summary data

### Filters (Form Section)

| Field Label        | Input Type      | Name/ID             | Validation/Error Message                           |
|--------------------|----------------|---------------------|---------------------------------------------------|
| Date Range         | Date Range Picker (two fields) | `fromDate`, `toDate` | Required; "Start date is required", "End date is required", "End date must be after start date" |
| Account            | Select dropdown (searchable)   | `accountCode`        | Optional; no error                                |
| Group              | Multi-select dropdown          | `groupIds`           | Optional; no error                                |

**Filter Form Features:**
- "Apply Filter" (Primary) button, data-testid="ledger-summary-actual-filter-apply"
- "Reset Filters" button, data-testid="ledger-summary-actual-filter-reset"
- All fields have visible labels.
- Error messages appear directly under each field as needed.
- Loading skeleton replaces table, disables buttons during load.

### Main Table

| Column                                      | Source                   | Data Type   |
|----------------------------------------------|--------------------------|-------------|
| Account Name                                | `description`            | String      |
| Account Code                                | `codes`                  | String      |
| Group Name                                  | `groupName`              | String      |
| Opening Balance                             | `opn`                    | Numeric     |
| Current Period Debit                        | `currDr`                 | Numeric     |
| Current Period Credit                       | `currCr`                 | Numeric     |
| Closing Balance                             | calculated `opn+currDr-currCr` | Numeric     |
| Last Activity Date                          | `lastActivityDate`       | Date        |

**Behavior:**
- Column headers always visible.
- Opening/Closing balance values display with 4 decimals.
- Sorting by column on click (data-testid="ledger-summary-actual-table-header-[column]")
- Visual badge for negative balances (color: `var(--color-error)` in text)
- Table paginated, 25 rows per page (with pagination controls)

### Actions

**Above Table:**
- Primary: "Export" dropdown (`PDF`, `Excel`, `CSV`) (data-testid="ledger-summary-actual-export-btn")
    - Only one primary button at a time (export is prominent).
    - Each export triggers download via backend, disables on loading.
- Bulk "Print" icon button (`data-testid="ledger-summary-actual-print-btn"`)
- "Refresh" icon button for reload (`data-testid="ledger-summary-actual-refresh-btn"`)

### States

- **Loading:** Table and filter area show animated shimmer skeleton. Form disables.
- **Empty:** If no matching data, show "No ledger summaries found for selected filters."
- **API error:** Show banner top of page (`var(--color-error)`) with code/message. Option to retry.
- **Paginated:** Show current page indicator data-testid="ledger-summary-actual-pagination"

### Test Identifiers

- `ledger-summary-actual-filter-apply`
- `ledger-summary-actual-filter-reset`
- `ledger-summary-actual-table`
- `ledger-summary-actual-table-header-[column]`
- `ledger-summary-actual-export-btn`
- `ledger-summary-actual-print-btn`
- `ledger-summary-actual-refresh-btn`
- `ledger-summary-actual-pagination`
- `ledger-summary-actual-error-banner`
- `ledger-summary-actual-loading-skeleton`

---

## 227. Ledger_ActualDate

**Route Path:** `/ledger/actual-date-report`

**Purpose:**  
Reports on ledger entries using actual accounting transaction dates for period-end accuracy, with strong controls for date-based auditing.

**PRD Reference:**  
- Ledger_ActualDate (Screen List)
- Functional: FR-252
- User Story: US-213, US-222

**Access Roles:**  
Supervisor, Administrator, Auditor

### Filters (Form Section)

| Field Label       | Type             | Id/Name        | Validation                            |
|-------------------|------------------|----------------|---------------------------------------|
| Actual Date Range | Date Range Picker| fromDate, toDate| Required for both; date order enforced|
| Account           | Select dropdown  | accountCode    | Required; "Please select an account"  |
| Voucher No        | Text             | voucherNo      | Optional; text input                  |

- "Filter" (Primary button, data-testid="ledger-actual-date-filter-apply")
- "Reset" (Outline button, data-testid="ledger-actual-date-filter-reset")

### Main Table

| Column                     | Field            |
|----------------------------|------------------|
| Voucher Serial             | vsrl             |
| Account Name               | description      |
| Actual Transaction Date    | actualDate       |
| Debit                      | debt             |
| Credit                     | cred             |
| Narration                  | lnarration       |
| Balance (Running)          | runningBalance   |

- All currency columns fixed to 4 decimals, alignment right.
- Dates local format, date+time if available.
- "Download" icon per row for voucher detail print (data-testid="ledger-actual-date-row-print-[vsrl]")

### Actions

- Export menu (PDF, Excel, CSV), single primary button (data-testid="ledger-actual-date-export-btn")
- Print entire report (data-testid="ledger-actual-date-print-btn")
- Table page size selector
- Refresh table (icon, not primary, data-testid="ledger-actual-date-refresh-btn")

### States

- **Loading:** Animates table cells and disables form.
- **Empty:** Message: "No transactions found in this period."
- **API error:** Page alert, clickable to try again.
- **Paginated:** Show page/rows, data-testid="ledger-actual-date-pagination"

### Test Identifiers

- `ledger-actual-date-filter-apply`
- `ledger-actual-date-filter-reset`
- `ledger-actual-date-table`
- `ledger-actual-date-table-header-[column]`
- `ledger-actual-date-row-print-[vsrl]`
- `ledger-actual-date-export-btn`
- `ledger-actual-date-print-btn`
- `ledger-actual-date-refresh-btn`
- `ledger-actual-date-pagination`
- `ledger-actual-date-loading-skeleton`
- `ledger-actual-date-error-banner`

---

## 228. Ledger_Pdc

**Route Path:** `/ledger/pdc-report`

**Purpose:**  
Generates a detailed ledger report for all entries involving post-dated cheques (PDC), with filtering by due date/account for treasury and audit.

**PRD Reference:**  
- Ledger_Pdc (Screen List)
- Functional: FR-253
- User Story: US-214, US-262

**Access Roles:**  
Accountant, Supervisor, Administrator

### Filters

| Field Label      | Type                   | Id/Name             | Validation             |
|------------------|------------------------|---------------------|------------------------|
| PDC From Date    | Date Picker            | pdcFrom             | Optional;              |
| PDC To Date      | Date Picker            | pdcTo               | Optional, >pdcFrom     |
| Account          | Dropdown (searchable)  | accountCode         | Required if date empty |
| Payer/Payee      | Dropdown/Search        | counterparty        | Optional               |

- Apply Filter (primary, data-testid="ledger-pdc-filter-apply")
- Reset (secondary, data-testid="ledger-pdc-filter-reset")

### Table Columns

| Column           | Field         | Notes                      |
|------------------|--------------|----------------------------|
| Date             | pdcDate      | Actual clearing date (QDATE)|
| Account          | account      |                            |
| Description      | description  |                            |
| Cheque Number    | chqNumber    |                            |
| Due Date         | dueDate      |                            |
| Debit            | debt         | Currency, right aligned    |
| Credit           | cred         | Currency, right aligned    |
| Payee            | payee        |                            |
| Narration        | narration    |                            |
| Voucher Serial   | vsrl         |                            |

- Table is paginated, sorted by Due Date default.
- Cheque number field column copyable (icon).
- Row highlight for overdue/uncleared items (color: var(--color-warning)).

### Actions

- Export (`data-testid="ledger-pdc-export-btn"`)
- Print (`data-testid="ledger-pdc-print-btn"`)
- Print cheque/voucher for each row (`data-testid="ledger-pdc-row-voucher-print-[vsrl]"`)
- Refresh Table (`data-testid="ledger-pdc-refresh-btn"`)

### States

- Loading: Table/filters skeleton
- Empty: "No PDC transactions found."
- Error: Banner at top

### Test Identifiers

- `ledger-pdc-filter-apply`
- `ledger-pdc-filter-reset`
- `ledger-pdc-table`
- `ledger-pdc-export-btn`
- `ledger-pdc-print-btn`
- `ledger-pdc-refresh-btn`
- `ledger-pdc-pagination`
- `ledger-pdc-row-voucher-print-[vsrl]`
- `ledger-pdc-loading-skeleton`
- `ledger-pdc-error-banner`

---

## 229. LPOAnalysis

**Route Path:** `/purchase/lpo-analysis`

**Purpose:**  
Analyses local purchase orders, goods receipts, and delivery order links for procurement trend and status by item, supplier, job.

**PRD Reference:**  
- LPOAnalysis (Screen List)
- Functional: FR-172, FR-181
- User Story: US-138

**Access Roles:**  
Supervisor, Procurement Administrator

### Filters

| Field      | Input         | ID/Name        | Validation            |
|------------|--------------|----------------|-----------------------|
| LPO Date Range | Date picker | fromDate, toDate | From date required    |
| Supplier   | Dropdown     | supplierId     | Optional              |
| Item Code  | Dropdown     | itemCode       | Optional              |
| Status     | Dropdown     | status         | Optional; [Issued, Received, Pending, All] |

- Apply (data-testid="lpo-analysis-filter-apply")
- Reset (data-testid="lpo-analysis-filter-reset")

### Table Columns

| Column             | Prop        | Notes                         |
|--------------------|-------------|-------------------------------|
| LPO Number         | invoice     |                               |
| LPO Date           | lpoDate     |                               |
| Supplier Name      | suppName    |                               |
| Job Card or Order  | ordr        |                               |
| Item Code          | itemCode    |                               |
| Tag/Description    | description |                               |
| Ordered Qty        | lpoQty      |                               |
| Ordered Rate       | lpoRate     |                               |
| Received Qty       | pdoQty      |                               |
| Delivered Qty      | doQty       |                               |
| Status             | status      | Pill (Ordered / Received / Issued)|

### Actions

- Export summaries (`pdf`, `excel`), single primary Export button (data-testid="lpo-analysis-export-btn")
- Per-row "Drilldown" details (popup, icon button, data-testid="lpo-analysis-row-drilldown-[invoice]")
- Table column sort by Qty/Value

### States

- Loading: Table shimmer, disables filters.
- Empty: "No LPO transactions found for the current filters."
- Error: Banner at top.

### Test Identifiers

- `lpo-analysis-filter-apply`
- `lpo-analysis-filter-reset`
- `lpo-analysis-table`
- `lpo-analysis-export-btn`
- `lpo-analysis-row-drilldown-[invoice]`
- `lpo-analysis-pagination`
- `lpo-analysis-loading-skeleton`
- `lpo-analysis-error-banner`

---

## 230. LPODetailsReport

**Route Path:** `/purchase/lpo-details`

**Purpose:**  
Detailed report of local purchase order transactions, including item details, supplier, approval, and job linkage.

**PRD Reference:**  
- LPODetailsReport (Screen List)
- Functional: FR-172
- User Story: US-146

**Access Roles:**  
Supervisor, Procurement Administrator

### Filters

| Field              | Type       | Name/ID         | Validation            |
|--------------------|------------|-----------------|-----------------------|
| Date Range         | Date Range | fromDate, toDate| Required              |
| Supplier           | Dropdown   | supplierId      | Optional              |
| Item/Part Number   | Dropdown   | itemCode        | Optional              |
| Job Card / Order   | Dropdown   | jobCard         | Optional              |
| LPO Number         | Text       | lpoNumber       | Optional              |

- Filter (primary, data-testid="lpo-details-filter-apply")
- Reset (data-testid="lpo-details-filter-reset")

### Table Columns

| Column         | Field         | Additional notes           |
|----------------|--------------|----------------------------|
| Date           | date         | DD-MMM-YYYY                |
| LPO Number     | invoice      |                            |
| Supplier Name  | suppName     |                            |
| Item Code      | itemCode     |                            |
| Description    | description  |                            |
| Quantity       | qty          | 2 decimal places           |
| Unit Rate      | rate         |                            |
| Amount         | amount       | Currency, 2 decimals       |
| Job Card       | jobCard      |                            |
| Approval Status| approval     | Pill (Approved/Pending/Rejected) |

### Actions

- Export (PDF/Excel), (data-testid="lpo-details-export-btn")
- Print report (data-testid="lpo-details-print-btn")
- Row-level "View LPO" (drills details in modal, icon, data-testid="lpo-details-row-view-[invoice]")
- Pagination, 25 rows default.

### States

- Loading: Card shimmer, disables filter actions.
- Empty: "No matching LPO detail records found."
- Error: Top banner, with detailed error message.

### Test Identifiers

- `lpo-details-filter-apply`
- `lpo-details-filter-reset`
- `lpo-details-table`
- `lpo-details-export-btn`
- `lpo-details-print-btn`
- `lpo-details-row-view-[invoice]`
- `lpo-details-pagination`
- `lpo-details-loading-skeleton`
- `lpo-details-error-banner`

---

## 231. mailreport

**Route Path:** `/report/mail`

**Purpose:**  
Allows the user to send any report directly to nominated email recipients from the interface, with support for file export attachments.

**PRD Reference:**  
- mailreport (Screen List)
- Functional: FR-344
- User Story: US-280

**Access Roles:**  
Supervisor, Administrator

### Form Fields

| Label                   | Type          | Field Name      | Validation                       |
|-------------------------|---------------|-----------------|----------------------------------|
| Select Report           | Dropdown      | reportName      | Required, "Please select..."     |
| Recipients (comma list) | Email input   | emails          | Required, multi-email, error per-invalid |
| Message                 | Textarea      | message         | Optional, 400 chars max          |
| Attach exported file(s) | Checkbox list | attachments     | At least one file (if default)   |

**Buttons:**
- "Send Email" (primary, data-testid="mailreport-send-btn")
- "Cancel" (secondary, data-testid="mailreport-cancel-btn")
- "View Sent Mails" (link, data-testid="mailreport-sent-link")

**File/Report Section:**
- List of previous sent mail with date/status

### States

- Loading: Shows progress indicator on send, disables all inputs/buttons.
- API Error: Displays banner on failure, error next to field as needed.
- Success: Shows confirmation, resets form.
- Empty sent mail list: "No previous report emails sent."

### Test Identifiers

- `mailreport-form`
- `mailreport-send-btn`
- `mailreport-cancel-btn`
- `mailreport-sent-link`
- `mailreport-report-select`
- `mailreport-emails-input`
- `mailreport-message-textarea`
- `mailreport-attachments-list`
- `mailreport-sent-list`
- `mailreport-error-banner`
- `mailreport-loading-spinner`

---

## 232. OMastersReport

**Route Path:** `/admin/omasters-report`

**Purpose:**  
Provides a report for system administrators to view and analyze the code master (Omasters) configuration data - all roles, godowns, staff, categories, etc.

**PRD Reference:**  
- OMastersReport (Screen List)
- Functional: FR-44, FR-79

**Access Roles:**  
Administrator

### Filters

| Label           | Type      | Name/ID  | Values/Validation            |
|-----------------|-----------|----------|------------------------------|
| Type            | Dropdown  | type     | [Roles, Trades, Godowns, Staff, ...] Required |
| Active Status   | Dropdown  | active   | All, Active, Inactive        |
| Search By Code  | Text      | search   | Optional, code/desc partial  |

- "Filter" (primary, data-testid="omasters-report-filter-apply")
- "Reset" (data-testid="omasters-report-filter-reset")

### Table Columns

| Column          | Data Field   |
|-----------------|--------------|
| Code            | ocode        |
| Description     | description  |
| Type            | type         |
| Remarks         | remarks      |
| Disc (Discount) | disc         |
| Active          | active       |

- "Active" shows pill: Active (`var(--color-success)` text), Inactive (`var(--color-error)` text)

### Actions

- Export (PDF, Excel) (data-testid="omasters-report-export-btn")
- Print table (data-testid="omasters-report-print-btn")

### States

- Loading: Table shimmer, disables filter/export.
- Empty: "No matching configuration records."
- API error: Banner.

### Test Identifiers

- `omasters-report-filter-apply`
- `omasters-report-filter-reset`
- `omasters-report-table`
- `omasters-report-export-btn`
- `omasters-report-print-btn`
- `omasters-report-pagination`
- `omasters-report-loading-skeleton`
- `omasters-report-error-banner`

---

## 233. OpeningStkList

**Route Path:** `/stock/opening-balances`

**Purpose:**  
Shows opening stock balances for all items at a selected period start.

**PRD Reference:**  
- OpeningStkList (Screen List)
- Functional: FR-189, FR-194
- User Story: US-154

**Access Roles:**  
Supervisor, Inventory Manager

### Filters

| Field Label           | Type       | Name/ID      | Validation    |
|-----------------------|------------|--------------|--------------|
| Opening Date          | Date Picker| openingDate  | Required     |
| Item Category         | Dropdown   | itemType     | Optional     |
| Warehouse/Location    | Dropdown   | location     | Optional     |

- Filter (primary, data-testid="opening-stk-list-filter-apply")
- Reset  (secondary, data-testid="opening-stk-list-filter-reset")

### Table Columns

| Column            | Field Name   | Format        |
|-------------------|-------------|--------------|
| Item Code         | itemCode    |              |
| Description       | description |              |
| Unit              | denom       |              |
| Location          | location    |              |
| Opening Qty       | qty         | Numeric      |
| Opening Value     | value       | Currency     |

### Actions

- Export (as .XLSX, .PDF), (data-testid="opening-stk-list-export-btn")
- Print opening list (data-testid="opening-stk-list-print-btn")

### States

- Loading: Table shimmer.
- Empty: "No opening stock balances available."
- API Error: Top banner.

### Test Identifiers

- `opening-stk-list-filter-apply`
- `opening-stk-list-filter-reset`
- `opening-stk-list-table`
- `opening-stk-list-export-btn`
- `opening-stk-list-print-btn`
- `opening-stk-list-loading-skeleton`
- `opening-stk-list-error-banner`
- `opening-stk-list-pagination`

---

## 234. OrderStatus

**Route Path:** `/orders/status`

**Purpose:**  
Displays the status of all customer orders for fulfilment tracking.

**PRD Reference:**  
- OrderStatus (Screen List)
- Functional: FR-142, FR-156, FR-157
- User Story: US-119, US-161

**Access Roles:**  
Standard User, Supervisor

### Filters

| Field Label     | Type           | Name/ID      | Validation    |
|-----------------|----------------|--------------|---------------|
| Customer        | Dropdown       | customerId   | Optional      |
| Order Status    | Dropdown       | status       | Optional      |
| Order Date      | Range Picker   | fromDate, toDate | Optional      |

- Filter (primary, data-testid="order-status-filter-apply")
- Reset  (secondary, data-testid="order-status-filter-reset")

### Table Columns

| Column           | Field         |
|------------------|--------------|
| Order No         | ordr          |
| Customer Name    | custname      |
| Order Date       | ordt          |
| Assigned Staff   | staffname     |
| Status           | status        |
| Total Value      | total         |
| Last Updated     | lastUpdated   |

- Status is color-coded using `status-pill`
- Sorting enabled on Order Date/Status/Total

### Actions

- Export report (data-testid="order-status-export-btn")
- Print (data-testid="order-status-print-btn")
- Row "View Order" (modal, icon, data-testid="order-status-row-view-[ordr]")

### States

- Loading: Skeleton
- Empty: "No orders matching these criteria."
- Error: Page banner

### Test Identifiers

- `order-status-filter-apply`
- `order-status-filter-reset`
- `order-status-table`
- `order-status-export-btn`
- `order-status-print-btn`
- `order-status-row-view-[ordr]`
- `order-status-pagination`
- `order-status-loading-skeleton`
- `order-status-error-banner`

---

## 235. OrderStatus1

**Route Path:** `/orders/status-alt`

**Purpose:**  
Alternate layout/view of order statuses for tracking with custom fields; may include extra columns for custom business tracking.

**PRD Reference:**  
- OrderStatus1 (Screen List)
- Functional: FR-142, FR-157
- User Story: US-119

**Access Roles:**  
Supervisor

### Filters

(Same as OrderStatus, with additional "Custom Field" text/search input, `customField`)

### Table Columns

| Column           | Field         |
|------------------|--------------|
| Order No         | ordr          |
| Customer         | custname      |
| Order Date       | ordt          |
| Status           | status        |
| Custom Field     | customField   |
| Total Value      | total         |
| ...more as defined by mapping   |

### Actions

- Export (data-testid="order-status1-export-btn")
- Print (data-testid="order-status1-print-btn")
- Row "Details" (modal, data-testid="order-status1-row-detail-[ordr]")

### States

- As OrderStatus; show layout distinction in test IDs.

### Test Identifiers

- `order-status1-filter-apply`
- `order-status1-filter-reset`
- `order-status1-table`
- `order-status1-export-btn`
- `order-status1-print-btn`
- `order-status1-row-detail-[ordr]`
- `order-status1-pagination`
- `order-status1-loading-skeleton`
- `order-status1-error-banner`

---

## 236. Outstanding_OrderStatus

**Route Path:** `/orders/outstanding`

**Purpose:**  
Highlights all outstanding orders requiring action or follow-up.

**PRD Reference:**  
- Outstanding_OrderStatus (Screen List)
- Functional: FR-143, FR-160
- User Story: US-161

**Access Roles:**  
Supervisor, Administrator

### Filters

| Field             | Type            | ID     | Validation       |
|-------------------|-----------------|--------|------------------|
| Customer          | Dropdown        | customer| Optional         |
| Status            | Dropdown        | status | Optional         |
| Due Date          | Date Picker     | dueDate| Optional         |

### Table Columns

| Column          | Field        |
|-----------------|-------------|
| Order ID        | ordr        |
| Customer        | custname    |
| Date Placed     | ordt        |
| Status          | status      |
| Outstanding Reason | reason   |
| Amount          | total       |
| Days Outstanding| days        |

- "Outstanding Reason" shows most recent status/note.
- "Days Outstanding" color-pilled: >14d (warning), >30d (error).

### Actions

- Export (PDF/Excel), data-testid="outstanding-order-status-export-btn"
- Print (data-testid="outstanding-order-status-print-btn")
- Table is paged.

### States

- Loading, Empty ("No outstanding orders."), Error as previous.

### Test Identifiers

- `outstanding-order-status-filter-apply`
- `outstanding-order-status-filter-reset`
- `outstanding-order-status-table`
- `outstanding-order-status-export-btn`
- `outstanding-order-status-print-btn`
- `outstanding-order-status-pagination`
- `outstanding-order-status-loading-skeleton`
- `outstanding-order-status-error-banner`

---

## 237. partsAvailabilityforWorksheet

**Route Path:** `/jobs/parts-availability`

**Purpose:**  
Lists parts availability for ongoing service worksheet jobs to assist with scheduling and status.

**PRD Reference:**  
- partsAvailabilityforWorksheet (Screen List)
- Functional: FR-207, FR-214
- User Story: US-164, US-169

**Access Roles:**  
Standard User, Supervisor

### Filters / Controls

| Field Label | Input      | Name       | Validation   |
|-------------|------------|------------|-------------|
| Job Card No | Dropdown   | jobCardNo  | Optional    |
| Part Number | Searchable | itemCode   | Optional    |
| Status      | Dropdown   | status     | All/Approved Only |

- Filter/Reset (data-testid="parts-availability-filter-apply"/reset)

### Table

| Column     | Prop         |
|------------|-------------|
| Job Card   | ordr        |
| Part No    | itemCode    |
| Description| description |
| Location   | location    |
| Ordered Qty| ordrQty     |
| Arrived Qty| arrivedQty  |
| On Hand    | currentStock|
| Requirement Status | requirementStatus | Pill

- Requirement Status uses "Available"/"Pending"/"Ordered" with color-pill

### Actions

- Export results (data-testid="parts-availability-export-btn")

### States

- Loading: shimmer
- Empty: "No parts requests found"
- Error: banner

### Test Identifiers

- `parts-availability-filter-apply`
- `parts-availability-filter-reset`
- `parts-availability-table`
- `parts-availability-export-btn`
- `parts-availability-pagination`
- `parts-availability-loading-skeleton`
- `parts-availability-error-banner`

---

## 238. Payments

**Route Path:** `/payments`

**Purpose:**  
Displays and summarizes payment transactions by period, customer, or type for management and audit.

**PRD Reference:**  
- Payments (Screen List)
- Functional: FR-236, FR-277, FR-275, FR-284
- User Story: US-241, US-235

**Access Roles:**  
Supervisor, Administrator

### Filters

| Field           | Input   | Name         | Validation                 |
|-----------------|---------|--------------|----------------------------|
| Payment Date    | Range   | from, to     | From required if To present|
| Type            | Dropdown| type         | All/Receipts/Payments      |
| Customer/Supplier|Search  | party        | Optional                   |
| Status          | Dropdown| status       | All/Pending/Posted         |

- Filter/Reset (primary/secondary)

### Table Columns

| Column         | Field     |
|----------------|----------|
| Payment No     | paymentNo |
| Date           | date      |
| Type           | type      |
| Party          | party     |
| Status         | status    |
| Amount         | amount    |
| Details        | link to detail modal (data-testid="payments-row-detail-[paymentNo]") |

### Actions

- Export (data-testid="payments-export-btn")
- Print (data-testid="payments-print-btn")
- Row "Details" opens payment voucher and allocations modal

### States

- Loading, Empty ("No payment transactions found"), Error

### Test Identifiers

- `payments-filter-apply`
- `payments-filter-reset`
- `payments-table`
- `payments-row-detail-[paymentNo]`
- `payments-export-btn`
- `payments-print-btn`
- `payments-pagination`
- `payments-loading-skeleton`
- `payments-error-banner`

---

## 239. Pdc_Issue_Voucher

**Route Path:** `/payments/pdc-issue`

**Purpose:**  
Documents all post-dated cheque issuances for tracking and compliance.

**PRD Reference:**  
- Pdc_Issue_Voucher (Screen List)
- Functional: FR-277, FR-239

**Access Roles:**  
Standard User, Supervisor

### Filters

| Field         | Type     | Name  | Validation     |
|---------------|----------|-------|----------------|
| Issued Date   | Range    | dateFrom, dateTo | Optional |
| Payee         | Dropdown | payee | Optional       |
| Cheque Number | Text     | chqNo | Optional       |

- Filter/Reset (as above)

### Table Columns

| Column      | Field      |
|-------------|-----------|
| Issue Date  | date      |
| Payee       | payee     |
| Cheque No   | chqNo     |
| Due Date    | dueDate   |
| Amount      | amount    |
| Bank        | bank      |
| Status      | status (Pill)  |

### Actions

- Export (data-testid="pdc-issue-voucher-export-btn")
- Print All (data-testid="pdc-issue-voucher-print-btn")
- Row voucher print (data-testid="pdc-issue-voucher-row-print-[chqNo]")

### States

- Loading, Empty, Error as previous

### Test Identifiers

- `pdc-issue-voucher-filter-apply`
- `pdc-issue-voucher-filter-reset`
- `pdc-issue-voucher-table`
- `pdc-issue-voucher-export-btn`
- `pdc-issue-voucher-print-btn`
- `pdc-issue-voucher-row-print-[chqNo]`
- `pdc-issue-voucher-pagination`
- `pdc-issue-voucher-loading-skeleton`
- `pdc-issue-voucher-error-banner`

---

## 240. Pdc_Receipt_Voucher

**Route Path:** `/payments/pdc-receipt`

**Purpose:**  
Lists all post-dated cheque receipts for payment management and tracking.

**PRD Reference:**  
- Pdc_Receipt_Voucher (Screen List)
- Functional: FR-277, FR-240

**Access Roles:**  
Standard User, Supervisor

### Filters

| Field         | Type     | Name  | Validation     |
|---------------|----------|-------|----------------|
| Receipt Date  | Range    | dateFrom, dateTo | Optional |
| Payer         | Dropdown | payer | Optional       |
| Cheque Number | Text     | chqNo | Optional       |

- Filter/Reset

### Table Columns

| Column      | Field      |
|-------------|-----------|
| Receipt Date| date      |
| Payer       | payer     |
| Cheque No   | chqNo     |
| Due Date    | dueDate   |
| Amount      | amount    |
| Bank        | bank      |
| Status      | status    |

### Actions

- Export (data-testid="pdc-receipt-voucher-export-btn")
- Print All (data-testid="pdc-receipt-voucher-print-btn")
- Row voucher print (data-testid="pdc-receipt-voucher-row-print-[chqNo]")

### States

- Loading, Empty, Error

### Test Identifiers

- `pdc-receipt-voucher-filter-apply`
- `pdc-receipt-voucher-filter-reset`
- `pdc-receipt-voucher-table`
- `pdc-receipt-voucher-export-btn`
- `pdc-receipt-voucher-print-btn`
- `pdc-receipt-voucher-row-print-[chqNo]`
- `pdc-receipt-voucher-pagination`
- `pdc-receipt-voucher-loading-skeleton`
- `pdc-receipt-voucher-error-banner`

---

## 241. PendingBillsLetter

**Route Path:** `/reports/pending-bills-letter`

**Purpose:**  
Generates letters and summaries for pending customer bills for collection/notification.

**PRD Reference:**  
- PendingBillsLetter (Screen List)
- Functional: FR-226, FR-290

**Access Roles:**  
Supervisor, Administrator

### Filters

| Field           | Input            | Name/ID    | Validation           |
|-----------------|------------------|------------|----------------------|
| Customer        | Dropdown         | customer   | Required             |
| Pending Days    | Number Range     | daysFrom, daysTo | Optional      |
| Letter Date     | Date Picker      | letterDate | Required             |

- "Generate Letter" (primary, data-testid="pending-bills-letter-generate-btn")

### Letter Preview

- Formatted letter template fields: Customer Name, Address, List of pending bills (table with Bill No, Date, Amount, Age)
- View as PDF preview in modal
- Edit message (optional for personalized note)

### Actions

- Print letter (data-testid="pending-bills-letter-print-btn")
- Export PDF (data-testid="pending-bills-letter-export-btn")
- Send by email (opens mailreport modal pre-filled, data-testid="pending-bills-letter-mail-btn")

### States

- Loading: PDF/icon spinner
- Empty: "No pending bills available for this customer"
- Error: Banner at letter footer

### Test Identifiers

- `pending-bills-letter-filter-apply`
- `pending-bills-letter-generate-btn`
- `pending-bills-letter-letter-preview`
- `pending-bills-letter-print-btn`
- `pending-bills-letter-export-btn`
- `pending-bills-letter-mail-btn`
- `pending-bills-letter-error-banner`
- `pending-bills-letter-loading-spinner`

---

## 242. PendingDoList

**Route Path:** `/delivery/pending-dos`

**Purpose:**  
Shows all delivery orders yet to be fulfilled for inventory/dispatch planning.

**PRD Reference:**  
- PendingDoList (Screen List)
- Functional: FR-164, FR-179

**Access Roles:**  
Supervisor

### Filters

| Label        | Type    | Name      | Validation     |
|--------------|---------|-----------|---------------|
| Expected Date| Range   | fromDate, toDate | Optional |
| Customer     | Dropdown| customer  | Optional      |
| Status       | Dropdown| status    | Optional      |

- Filter/Reset

### Table Columns

| Column         | Field     |
|----------------|----------|
| DO Number      | donumber  |
| Customer       | custname  |
| Date           | dodate    |
| Items Pending  | pendingItems (count/pill)|
| Status         | status    |
| Expected Date  | expected  |

### Actions

- Export (data-testid="pending-dos-export-btn")
- Print (data-testid="pending-dos-print-btn")
- Row "Mark Complete" (if permission, data-testid="pending-dos-row-complete-[donumber]")

### States

- Loading, Empty, Error

### Test Identifiers

- `pending-dos-filter-apply`
- `pending-dos-filter-reset`
- `pending-dos-table`
- `pending-dos-export-btn`
- `pending-dos-print-btn`
- `pending-dos-row-complete-[donumber]`
- `pending-dos-pagination`
- `pending-dos-loading-skeleton`
- `pending-dos-error-banner`

---

## 243. pendingOrderRegister

**Route Path:** `/orders/register/pending`

**Purpose:**  
Registers all orders that are still pending for action or escalation.

**PRD Reference:**  
- pendingOrderRegister (Screen List)
- Functional: FR-157

**Access Roles:**  
Supervisor, Administrator

### Filters

| Field     | Type         | Name     | Validation |
|-----------|--------------|----------|------------|
| Date Range| Date Range   | from, to | Required   |
| Customer  | Dropdown     | customer | Optional   |

### Table Columns

| Column             | Field     |
|--------------------|----------|
| Order ID           | ordr     |
| Customer           | custname |
| Date Placed        | ordt     |
| Status             | status   |
| Last Action Date   | lastAction|
| Days Pending       | pending  |
| Reason             | reason   |

- Highlight rows with Days Pending > threshold (14) in warning.

### Actions

- Export (data-testid="pending-order-register-export-btn")
- Print (data-testid="pending-order-register-print-btn")

### States

- Loading, Empty, Error

### Test Identifiers

- `pending-order-register-filter-apply`
- `pending-order-register-filter-reset`
- `pending-order-register-table`
- `pending-order-register-export-btn`
- `pending-order-register-print-btn`
- `pending-order-register-pagination`
- `pending-order-register-loading-skeleton`
- `pending-order-register-error-banner`

---

## 244. pendingPurchaseDo

**Route Path:** `/purchase/pending-delivery-orders`

**Purpose:**  
Tracks all pending purchase delivery orders for procurement management.

**PRD Reference:**  
- pendingPurchaseDo (Screen List)
- Functional: FR-179
- User Story: US-145

**Access Roles:**  
Supervisor, Administrator, Audit Staff

### Filters

| Label     | Type   | Name        | Validation      |
|-----------|--------|-------------|-----------------|
| Supplier  | Dropdown| supplier    | Optional        |
| Order Date| Date   | orderDate   | Optional        |

- "Filter" (primary, data-testid="pending-purchase-do-filter-apply")
- "Reset" (data-testid="pending-purchase-do-filter-reset")

### Table Columns

| Column           | Field         |
|------------------|--------------|
| Delivery Order # | pdono         |
| Supplier Name    | suppname      |
| Reference        | ref           |
| PO Date          | pordt         |
| Status           | status        |
| Pending Items    | pendingItems  |
| Amount           | total         |

- Click row for detail panel/modal

### Actions

- Export (data-testid="pending-purchase-do-export-btn")
- Print  (data-testid="pending-purchase-do-print-btn")

### States

- Loading
- Empty ("No pending purchase delivery orders.")
- Error

### Test Identifiers

- `pending-purchase-do-filter-apply`
- `pending-purchase-do-filter-reset`
- `pending-purchase-do-table`
- `pending-purchase-do-export-btn`
- `pending-purchase-do-print-btn`
- `pending-purchase-do-pagination`
- `pending-purchase-do-loading-skeleton`
- `pending-purchase-do-error-banner`

---

## 245. PreturnReg

**Route Path:** `/purchase/returns`

**Purpose:**  
Reports on all purchase returns for supplier reconciliation/refunds.

**PRD Reference:**  
- PreturnReg (Screen List)
- Functional: FR-147, FR-166

**Access Roles:**  
Supervisor, Administrator

### Filters

| Field         | Type    | Name    | Validation |
|---------------|---------|---------|------------|
| Date Range    | Range   | from, to| Required   |
| Supplier      | Dropdown| supplier| Optional   |

### Table

| Column           | Field         |
|------------------|--------------|
| Return ID        | returnId      |
| Supplier         | supplier      |
| Date             | date          |
| Item Code        | itemCode      |
| Item             | itemName      |
| Quantity         | qty           |
| Reason           | reason        |
| Status           | status        |

### Actions

- Export report (data-testid="preturn-reg-export-btn")
- Print all (data-testid="preturn-reg-print-btn")
- Row detail panel/modal (icon)

### States

- Loading, Empty ("No purchase returns recorded."), Error

### Test Identifiers

- `preturn-reg-filter-apply`
- `preturn-reg-filter-reset`
- `preturn-reg-table`
- `preturn-reg-export-btn`
- `preturn-reg-print-btn`
- `preturn-reg-pagination`
- `preturn-reg-loading-skeleton`
- `preturn-reg-error-banner`

---

## 246. ProdRequest

**Route Path:** `/products/requests`

**Purpose:**  
Details product requests raised for replenishment or workflow processing.

**PRD Reference:**  
- ProdRequest (Screen List)
- Functional: FR-75

**Access Roles:**  
Standard User, Supervisor

### Filters

| Field         | Type     | Name     | Validation |
|---------------|----------|----------|------------|
| Requested By  | Dropdown | userId   | Optional   |
| Status        | Dropdown | status   | Optional   |
| Date          | Date     | date     | Optional   |

### Table

| Column         | Field         |
|----------------|--------------|
| Product        | product      |
| Requested By   | requestedBy  |
| Date           | date         |
| Status         | status       |
| Quantity       | quantity     |
| Action         | Detail/Export|

### Actions

- Export (data-testid="prod-request-export-btn")
- Print  (data-testid="prod-request-print-btn")
- Row "Details" (modal)

### States

- Loading/Empty/Error

### Test Identifiers

- `prod-request-filter-apply`
- `prod-request-filter-reset`
- `prod-request-table`
- `prod-request-export-btn`
- `prod-request-print-btn`
- `prod-request-row-details-[product]`
- `prod-request-pagination`
- `prod-request-loading-skeleton`
- `prod-request-error-banner`

---

## 247. ProformaSaleBillPrnt

**Route Path:** `/sales/proforma-bill`

**Purpose:**  
Prints proforma (preliminary) sale bills for customer quotations.

**PRD Reference:**  
- ProformaSaleBillPrnt (Screen List)
- Functional: FR-145

**Access Roles:**  
Standard User, Supervisor

### Form Fields

| Label             | Type        | Name    | Validation         |
|-------------------|-------------|---------|--------------------|
| Customer          | Dropdown    | customer| Required           |
| Sale Date         | Date        | date    | Defaults to today  |
| Items             | Table       |         | Must have at least one item |

### Table Columns (Pre-Print)

| Field              | Name        |
|--------------------|------------|
| Item Code          | itemCode   |
| Description        | description|
| Qty                | qty        |
| Unit Price         | price      |
| Amount             | amount     |

### Actions

- Preview (primary, data-testid="proforma-sale-bill-preview-btn")
- Print (data-testid="proforma-sale-bill-print-btn")
- Save as PDF (data-testid="proforma-sale-bill-export-btn")

### States

- Loading: disables controls, shows spinner overlay in preview
- Error: inline next to invalid field; "At least one item must be added."
- Empty: Guide text "Select customer and add item rows to generate a proforma bill."

### Test Identifiers

- `proforma-sale-bill-customer-select`
- `proforma-sale-bill-date-input`
- `proforma-sale-bill-items-table`
- `proforma-sale-bill-preview-btn`
- `proforma-sale-bill-print-btn`
- `proforma-sale-bill-export-btn`
- `proforma-sale-bill-error-banner`
- `proforma-sale-bill-loading-spinner`

---

## 248. PurchaseBill-Import

**Route Path:** `/purchase/import-bills`

**Purpose:**  
Shows details of imported purchase bills for accounting and compliance.

**PRD Reference:**  
- PurchaseBill-Import (Screen List)
- Functional: FR-248, FR-171

**Access Roles:**  
Supervisor, Administrator

### Filters

| Field          | Type     | Name     | Validation  |
|----------------|----------|----------|-------------|
| Import Date    | Date     | date     | Optional    |
| Supplier       | Dropdown | supplier | Optional    |
| Import Ref     | Text     | ref      | Optional    |

### Table

| Column         | Field        |
|----------------|-------------|
| Import Ref     | importRef   |
| Supplier       | supplier    |
| Date           | date        |
| Item           | item        |
| Quantity       | qty         |
| Value          | value       |
| Status         | status      |

- Allows cell expansion for item details (accordion)
- Table is paged, sortable by date, supplier

### Actions

- Export (data-testid="purchase-bill-import-export-btn")
- Print (data-testid="purchase-bill-import-print-btn")

### States

- Loading shimmer
- Empty ("No import bills found")
- Error

### Test Identifiers

- `purchase-bill-import-filter-apply`
- `purchase-bill-import-filter-reset`
- `purchase-bill-import-table`
- `purchase-bill-import-export-btn`
- `purchase-bill-import-print-btn`
- `purchase-bill-import-pagination`
- `purchase-bill-import-loading-skeleton`
- `purchase-bill-import-error-banner`

---

## 249. PurchaseBill-Local

**Route Path:** `/purchase/local-bills`

**Purpose:**  
Lists locally sourced purchase bills for financial reconciliation.

**PRD Reference:**  
- PurchaseBill-Local (Screen List)
- Functional: FR-164, FR-171

**Access Roles:**  
Supervisor, Administrator

### Filters

| Field        | Type      | Name     | Validation |
|--------------|-----------|----------|------------|
| Date         | Date      | date     | Optional   |
| Supplier     | Dropdown  | supplier | Optional   |
| Invoice No   | Text      | invoice  | Optional   |

- Filter/Reset

### Table

| Column      | Field    |
|-------------|----------|
| Invoice No  | invoice  |
| Supplier    | supplier |
| Date        | date     |
| Item        | item     |
| Quantity    | qty      |
| Value       | value    |
| Status      | status   |

### Actions

- Export (data-testid="purchase-bill-local-export-btn")
- Print (data-testid="purchase-bill-local-print-btn")

### States

- Loading shimmer
- Empty ("No local purchase bills to display.")
- Error

### Test Identifiers

- `purchase-bill-local-filter-apply`
- `purchase-bill-local-filter-reset`
- `purchase-bill-local-table`
- `purchase-bill-local-export-btn`
- `purchase-bill-local-print-btn`
- `purchase-bill-local-pagination`
- `purchase-bill-local-loading-skeleton`
- `purchase-bill-local-error-banner`

---

## 250. PurchaseDo01PDO

**Route Path:** `/purchase/do-item-register`

**Purpose:**  
Summarizes all purchase DOs with specific attributes for analysis; supports drilldown to delivery/order links.

**PRD Reference:**  
- PurchaseDo01PDO (Screen List)
- Functional: FR-172
- User Story: US-146

**Access Roles:**  
Supervisor, Administrator

### Filters

| Field           | Type      | Name      | Validation   |
|-----------------|-----------|-----------|--------------|
| PO/DO Date      | Range     | from, to  | Optional     |
| Supplier        | Dropdown  | supplier  | Optional     |
| Item            | Dropdown  | item      | Optional     |

### Table

| Column            | Field         |
|-------------------|--------------|
| Purchase DO #     | pdono         |
| Order Date        | orderDate     |
| Supplier Name     | supplier      |
| Item Code         | itemCode      |
| Description       | description   |
| Quantity          | qty           |
| Value             | value         |
| Linked Order Ref  | orderRef      |
| DO Status         | doStatus      |

### Actions

- Export (data-testid="purchase-do01pdo-export-btn")
- Print (data-testid="purchase-do01pdo-print-btn")
- Row "Details" (modal/popup, data-testid="purchase-do01pdo-row-details-[pdono]")

### States

- Loading shimmer
- Empty ("No records found for selected criteria")
- Error

### Test Identifiers

- `purchase-do01pdo-filter-apply`
- `purchase-do01pdo-filter-reset`
- `purchase-do01pdo-table`
- `purchase-do01pdo-export-btn`
- `purchase-do01pdo-print-btn`
- `purchase-do01pdo-row-details-[pdono]`
- `purchase-do01pdo-pagination`
- `purchase-do01pdo-loading-skeleton`
- `purchase-do01pdo-error-banner`

---

## COVERAGE CHECK

| Screen Name                     | Status      |
|----------------------------------|------------|
| 226. LedgerSummaryActual         | ✅ covered  |
| 227. Ledger_ActualDate           | ✅ covered  |
| 228. Ledger_Pdc                  | ✅ covered  |
| 229. LPOAnalysis                 | ✅ covered  |
| 230. LPODetailsReport            | ✅ covered  |
| 231. mailreport                  | ✅ covered  |
| 232. OMastersReport              | ✅ covered  |
| 233. OpeningStkList              | ✅ covered  |
| 234. OrderStatus                 | ✅ covered  |
| 235. OrderStatus1                | ✅ covered  |
| 236. Outstanding_OrderStatus     | ✅ covered  |
| 237. partsAvailabilityforWorksheet| ✅ covered |
| 238. Payments                    | ✅ covered  |
| 239. Pdc_Issue_Voucher           | ✅ covered  |
| 240. Pdc_Receipt_Voucher         | ✅ covered  |
| 241. PendingBillsLetter          | ✅ covered  |
| 242. PendingDoList               | ✅ covered  |
| 243. pendingOrderRegister        | ✅ covered  |
| 244. pendingPurchaseDo           | ✅ covered  |
| 245. PreturnReg                  | ✅ covered  |
| 246. ProdRequest                 | ✅ covered  |
| 247. ProformaSaleBillPrnt        | ✅ covered  |
| 248. PurchaseBill-Import         | ✅ covered  |
| 249. PurchaseBill-Local          | ✅ covered  |
| 250. PurchaseDo01PDO             | ✅ covered  |

---

---

# FRONTEND_SPEC.md  
Part 11 of 14 — Screen Specifications

---

## 251. PurchaseDoItemRegister

### Route Path
`/purchase/delivery-orders/items`

### Purpose
Display a comprehensive register of all items included in purchase delivery orders for audit, return processing, and reconciliation.

### PRD Reference
- Purchase & Procurement Management: pendingPurchaseDo Report, PurchaseDoItemRegister (screen and reporting)
- FR-172, FR-179, FR-170, FR-171

### Access Control
- Roles: Supervisor, Administrator

### Layout & Structure
- Glass card panel (`var(--color-bg-card)`, blur + primary border, shadow-sm).
- Title: "Purchase Delivery Order Item Register"
- Filters panel (collapsible): sticky at top
- Data table: main body, paginated, sortable columns
- Export and print bar: right-aligned above table

### Fields & Filters

**Filters:**
- Supplier  
  - Label: "Supplier"
  - Type: select (async search, shows supplier name and code)
  - Required: No
- Date Range  
  - Label: "Delivery Order Date"
  - Type: date range picker (2 fields: From, To)
  - Required: No  
  - Range: min selectable is system min date, max is today (default last 90 days)
- Item  
  - Label: "Item"
  - Type: select (searchable, shows item code and description)
- Status  
  - Label: "Status"
  - Type: select  
  - Options: (All, Pending, Received, Closed)
- Search  
  - Label: "Keyword"
  - Type: text
  - Placeholder: "Order, Item, or Reference…"
- Filter button  
  - Primary button. On press, applies selected filters, triggers loading. `data-testid='purchase-do-item-register-filter-apply'`
- Reset button  
  - Outlined button. Restores all filters to initial state. `data-testid='purchase-do-item-register-filter-reset'`

**Table Columns:**
| Label | Field | Type |
|---|---|---|
| Delivery Order No. | pdoNo | text |
| Delivery Order Date | doDate | date |
| Supplier | supplierName | text |
| Item Code | itemCode | text |
| Item Description | itemDescription | text |
| Delivered Qty | deliveredQty | number (decimal, 3dp) |
| Unit | unit | text |
| Rate | rate | number (decimal, 4dp) |
| Amount | amount | number (decimal, 4dp) |
| Status | status | pill (info/warning/success) |
| Reference | refNo | text |

### Actions Available

- **Export Table**
  - Button. Split menu: PDF, Excel. Always enabled.  
  - Download registered item list as filtered.  
  - `data-testid='purchase-do-item-register-export'`
- **Print Table**
  - Button. Opens print-optimized layout.  
  - `data-testid='purchase-do-item-register-print'`
- **Row Detail View**
  - Click/keyboard on a row opens panel modal: full DO item details, including linked documents and receiving status.  
  - `data-testid='purchase-do-item-register-row-view'`

### Table Interactions

- Columns: sortable (ASC/DESC) by DO no, date, supplier, item, amount, status.
- Pagination: standard, 30 rows per page.  
- Skeleton state: shimmer for 8 rows/columns; filter controls retain visible state.
- API error: Error banner (`var(--color-error)` border), retry button.
- Empty state: “No matching delivery order items found for your filters.”, icon (`package search outline`), reset filter button.

### Validations & Errors

- Supplier field: must match database, show error “Supplier not found.” next to selector.
- Date range: if invalid (From > To), show “Start date must be before end date.”
- All error messages are adjacent to field plus toast at top.

### Test Identifiers

- `purchase-do-item-register-title`
- `purchase-do-item-register-filter-supplier`
- `purchase-do-item-register-filter-datefrom`
- `purchase-do-item-register-filter-dateto`
- `purchase-do-item-register-filter-item`
- `purchase-do-item-register-filter-status`
- `purchase-do-item-register-filter-keyword`
- `purchase-do-item-register-filter-apply`
- `purchase-do-item-register-filter-reset`
- `purchase-do-item-register-export`
- `purchase-do-item-register-print`
- `purchase-do-item-register-table`
- `purchase-do-item-register-row-view`
- `purchase-do-item-register-error-banner`
- `purchase-do-item-register-empty-state`
- `purchase-do-item-register-loading-skeleton`

---

## 252. PurchaseDoItemRegisterSummary

### Route Path
`/purchase/delivery-orders/items/summary`

### Purpose
Overview of purchase delivery order items in summarized tabular view, for fast audit and management review.

### PRD Reference
- Purchase & Procurement Management: PurchaseDoItemRegisterSummary (report view, summary use-case)
- FR-172, FR-171

### Access Control
- Roles: Supervisor, Administrator

### Layout & Structure

- “glass” summary panel, sectioned title.
- Filter chips (applied at top), collapsible.
- Data table: summarized by Supplier and Item, grouped with subtotal rows.
- Export/print controls: top right above table.

### Fields & Table

**Filters (as above, but summary pre-aggregated):**
- Date Range (required, default last 30 days)
- Supplier (default: All)
- Item (default: All)
- Status (All/Pending/Received/Closed)
- Apply + Reset (as above)

**Table Columns:**
| Label | Field | Type |
|---|---|---|
| Supplier | supplierName | group header & text |
| Item Code | itemCode | text |
| Item Description | itemDescription | text |
|  Total Delivered Qty | deliveredQty | sum/number |
| Item Unit | unit | text |
|  Total Amount | amount | sum/number (decimal, 2dp) |
| Last Delivery Date | lastDoDate | date |
| Status | status | pill |

- Grouped display: Supplier name as group header row, items as sub-rows.

### Actions Available

- Export summary (PDF/XLS)
  - Primary button, top-right.
  - `data-testid='purchase-do-item-register-summary-export'`
- Print
  - Secondary icon/button.
  - `data-testid='purchase-do-item-register-summary-print'`
- Expand supplier group
  - Collapsible group headers.
  - `data-testid='purchase-do-item-register-summary-group-toggle'`

### Interactions & States

- Group expand/collapse with smooth opacity transition (neutral animation, respect reduced motion).
- Pagination: standard, 25 supplier groups per page.
- Skeleton: shimmer for 4 groups+8 sub-rows.
- Errors & empty: as per full register (banner + icon + message).

### Test Identifiers

- `purchase-do-item-register-summary-title`
- `purchase-do-item-register-summary-filter-datefrom`
- `purchase-do-item-register-summary-filter-dateto`
- `purchase-do-item-register-summary-filter-supplier`
- `purchase-do-item-register-summary-filter-item`
- `purchase-do-item-register-summary-filter-status`
- `purchase-do-item-register-summary-filter-apply`
- `purchase-do-item-register-summary-filter-reset`
- `purchase-do-item-register-summary-table`
- `purchase-do-item-register-summary-group-toggle`
- `purchase-do-item-register-summary-export`
- `purchase-do-item-register-summary-print`
- `purchase-do-item-register-summary-error-banner`
- `purchase-do-item-register-summary-empty`
- `purchase-do-item-register-summary-loading-skeleton`

---

## 253. PurchaseOrder

### Route Path
`/purchase/orders`

### Purpose
Detailed report of all purchase order transactions, including supplier, item, and financial details.

### PRD Reference
- Purchase & Procurement Management: PurchaseOrder report (screen)
- FR-172, FR-170, FR-171

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Card panel with title: "Purchase Orders"
- Filters bar: collapsible, sticky
- Action bar: export (PDF, Excel), print, above table
- Table: rows = purchase orders, expandable to see item breakdown

### Fields & Filters

**Filters:**
- Supplier
- Order Date (range)
- Status (Draft/Submitted/Approved/Received/Closed)
- Purchase Order Number (text)
- Item (async search)
- Apply & Reset

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Order No. | poNumber | text |
| Order Date | orderDate | date |
| Supplier Name | supplierName | text |
| Total Value | total | decimal (2dp) |
| Currency | currency | text |
| Items | items | icon/expand |
| Status | status | pill |

**Item Row Expansion:** On expand:
- Item Code, Description, Quantity, Rate, Amount, Unit, Last Received Date

### Actions Available

- Export report (PDF/XLS)
  - `data-testid='purchase-order-export'`
- Print (Table, selected rows)
  - `data-testid='purchase-order-print'`
- Expand PO row — show/hide items
  - `data-testid='purchase-order-row-expand'`

### Interactions

- Table sorting: by PO No., date, status, supplier
- Item row expansion: fade/slide with reduced-motion fallback
- Table paginated: 30 rows per page
- Skeleton state: shimmer header, 10 rows
- Error: error banner with retry
- Empty state: “No purchase orders found.”

### Validations & Errors

- Supplier lookup must resolve valid supplier, else error “Supplier not found.”
- Date range validation as above.
- Export errors as toast and error banner.

### Test Identifiers

- `purchase-order-title`
- `purchase-order-filter-supplier`
- `purchase-order-filter-datefrom`
- `purchase-order-filter-dateto`
- `purchase-order-filter-status`
- `purchase-order-filter-ponumber`
- `purchase-order-filter-item`
- `purchase-order-filter-apply`
- `purchase-order-filter-reset`
- `purchase-order-table`
- `purchase-order-row-expand`
- `purchase-order-export`
- `purchase-order-print`
- `purchase-order-error-banner`
- `purchase-order-empty-state`
- `purchase-order-loading-skeleton`

---

## 254. Purchasereg-Ac

### Route Path
`/purchase/register/account`

### Purpose
Displays and exports the register of all purchase transactions per account for audit, reconciliation, and internal control.

### PRD Reference
- Purchase & Procurement Management: Purchasereg-Ac report/screen
- FR-171, FR-172

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Glass panel card, centered title: "Purchase Register by Account"
- Filter bar: Account (async search), Date Range, Supplier (optional), Status, Apply/Reset
- Table: rows = transactions; persistent column header

### Fields & Table

**Filters:**
- Account (search by code/description, async)
- Date from/to (default last 30 days)
- Supplier (optional)
- Apply, Reset

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Date | date | date |
| Account | account | text |
| Supplier | supplierName | text |
| Invoice No. | invoiceNumber | text |
| PO No. | poNumber | text |
| Item | itemDescription | text |
| Qty | quantity | number |
| Rate | rate | number (decimal, 4dp) |
| Amount | amount | number (decimal, 2dp) |
| Currency | currency | text |

### Actions Available

- Export table (PDF, Excel)
  - `data-testid='purchasereg-ac-export'`
- Print
  - `data-testid='purchasereg-ac-print'`

### Interactions & States

- Sorting: By date (default DESC), account, supplier, amount
- Pagination: 40 rows per page
- Skeleton: shimmer for 10 rows
- Error: error banner, side panel retry
- Empty: "No account purchase records found for filter."

### Test Identifiers

- `purchasereg-ac-title`
- `purchasereg-ac-filter-account`
- `purchasereg-ac-filter-supplier`
- `purchasereg-ac-filter-datefrom`
- `purchasereg-ac-filter-dateto`
- `purchasereg-ac-filter-apply`
- `purchasereg-ac-filter-reset`
- `purchasereg-ac-table`
- `purchasereg-ac-export`
- `purchasereg-ac-print`
- `purchasereg-ac-error-banner`
- `purchasereg-ac-empty-state`
- `purchasereg-ac-loading-skeleton`

---

## 255. Purchasereg-Import

### Route Path
`/purchase/register/imported`

### Purpose
Summary table of all imported purchases for compliance, audit, and management reporting.

### PRD Reference
- Purchase & Procurement Management: Purchasereg-Import report/screen
- FR-171, FR-172

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Glass panel card, title: "Register of Imported Purchases"
- Filter bar: Supplier, Date Range, Currency, Item (optional), Apply/Reset
- Table below

### Fields & Table

**Filters:**
- Supplier (dropdown async)
- Date range (required)
- Currency (dropdown, default all)
- Item (optional)
- Apply/Reset

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Import Date | importDate | date |
| Supplier | supplierName | text |
| Invoice No. | invoiceNo | text |
| Item | itemDescription | text |
| Quantity | qty | number |
| Rate | rate | number (decimal, 4dp) |
| Amount | amount | number (decimal, 2dp) |
| Currency | currency | text |

### Actions Available

- Export report (PDF, Excel)
  - `data-testid='purchasereg-import-export'`
- Print
  - `data-testid='purchasereg-import-print'`

### Interactions

- Table sorting by supplier, date, amount, item
- Pagination: 32 rows per page
- Skeleton: shimmer for 7 rows
- Error/empty state as above

### Test Identifiers

- `purchasereg-import-title`
- `purchasereg-import-filter-supplier`
- `purchasereg-import-filter-datefrom`
- `purchasereg-import-filter-dateto`
- `purchasereg-import-filter-currency`
- `purchasereg-import-filter-item`
- `purchasereg-import-filter-apply`
- `purchasereg-import-filter-reset`
- `purchasereg-import-table`
- `purchasereg-import-export`
- `purchasereg-import-print`
- `purchasereg-import-error-banner`
- `purchasereg-import-empty-state`
- `purchasereg-import-loading-skeleton`

---

## 256. Purchasereg-Local

### Route Path
`/purchase/register/local`

### Purpose
Lists all locally sourced purchase transactions, supporting audit, compliance, and reporting.

### PRD Reference
- Purchase & Procurement Management: Purchasereg-Local report/screen
- FR-171, FR-172

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Card surface, title: "Register of Local Purchases"
- Filter row: Supplier, Date Range, Item, Currency, Apply/Reset
- Table

### Fields & Table

**Filters:**
- Supplier (dropdown)
- Date range
- Item (optional)
- Currency (optional)
- Apply/Reset

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Purchase Date | purchaseDate | date |
| Supplier | supplierName | text |
| Invoice No. | invoiceNo | text |
| Item | itemDescription | text |
| Quantity | qty | number |
| Rate | rate | decimal |
| Amount | amount | decimal |
| Currency | currency | text |
| Location | location | text |

### Actions Available

- Export table
- Print

### Interactions

- Sort by supplier, date (default DESC), item
- Pagination: 32 rows per page
- Skeleton: shimmer 6 rows
- Error/empty: as above

### Test Identifiers

- `purchasereg-local-title`
- `purchasereg-local-filter-supplier`
- `purchasereg-local-filter-datefrom`
- `purchasereg-local-filter-dateto`
- `purchasereg-local-filter-item`
- `purchasereg-local-filter-currency`
- `purchasereg-local-filter-apply`
- `purchasereg-local-filter-reset`
- `purchasereg-local-table`
- `purchasereg-local-export`
- `purchasereg-local-print`
- `purchasereg-local-error-banner`
- `purchasereg-local-empty-state`
- `purchasereg-local-loading-skeleton`

---

## 257. PurchaseregSupp-Local

### Route Path
`/purchase/register/supplier-local`

### Purpose
Supplier-level local purchases register for procurement tracking and supplier management.

### PRD Reference
- Purchase & Procurement Management: PurchaseregSupp-Local screen/report
- FR-171, FR-172

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Glass card, title: "Supplier Local Purchase Register"
- Filters: Supplier (required), Date range, Apply/Reset
- Table: summarized by supplier, grouped

### Fields & Table

**Filters:**
- Supplier (dropdown, required)
- Date Range (required)
- Apply/Reset

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Supplier | supplierName | group header |
| Item | itemDescription | text |
| Qty Purchased | qty | sum/number |
| Total Value | amount | sum/decimal |
| Currency | currency | text |

### Actions Available

- Export (PDF, Excel)
- Print

### Interactions & States

- Grouped by supplier, expandable item list
- Pagination: 20 suppliers per page
- Skeleton: shimmer 2 groups, 8 items
- Empty/error: as standard

### Test Identifiers

- `purchasereg-supp-local-title`
- `purchasereg-supp-local-filter-supplier`
- `purchasereg-supp-local-filter-datefrom`
- `purchasereg-supp-local-filter-dateto`
- `purchasereg-supp-local-filter-apply`
- `purchasereg-supp-local-filter-reset`
- `purchasereg-supp-local-table`
- `purchasereg-supp-local-export`
- `purchasereg-supp-local-print`
- `purchasereg-supp-local-error-banner`
- `purchasereg-supp-local-empty-state`
- `purchasereg-supp-local-loading-skeleton`

---

## 258. PurchaseReturnBill

### Route Path
`/purchase/returns`

### Purpose
Detailed view of returned purchase bills for supplier reconciliation and refund management.

### PRD Reference
- Purchase & Procurement Management: PurchaseReturnBill
- FR-171, FR-172

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Card with panel title: "Purchase Return Bills"
- Filter bar: Supplier, Date Range, Item, Status, Apply/Reset
- Table: each row = return bill

### Fields & Table

**Filters:**
- Supplier (optional)
- Item (optional)
- Return Date (range)
- Status (Processed/Pending/Refunded/All)

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Return Bill No. | returnBillNo | text |
| Date | returnDate | date |
| Supplier | supplierName | text |
| Item | itemDescription | text |
| Qty | qty | number |
| Amount | amount | decimal |
| Status | status | pill |

### Actions Available

- Export (PDF/XLS)
- Print

### Interactions & States

- Sort by date, amount, supplier
- Row click for full detail panel (modal)
- Pagination (20 per page)
- Loading: shimmer
- Errors, empty: as previous specs

### Test Identifiers

- `purchase-return-bill-title`
- `purchase-return-bill-filter-supplier`
- `purchase-return-bill-filter-item`
- `purchase-return-bill-filter-datefrom`
- `purchase-return-bill-filter-dateto`
- `purchase-return-bill-filter-status`
- `purchase-return-bill-filter-apply`
- `purchase-return-bill-filter-reset`
- `purchase-return-bill-table`
- `purchase-return-bill-row-detail`
- `purchase-return-bill-export`
- `purchase-return-bill-print`
- `purchase-return-bill-error-banner`
- `purchase-return-bill-empty-state`
- `purchase-return-bill-loading-skeleton`

---

## 259. Receipts-Backup

### Route Path
`/finance/receipts/backup`

### Purpose
Offer a backup/alternate listing of all receipts for data safety, restoration, and reconciliation.

### PRD Reference
- Receipts & Payments Processing: Receipt-Backup (Report)
- FR-277, FR-283

### Access Control
- Roles: Supervisor, Administrator

### Layout & Structure

- Glass card. Title: “Receipts Backup Register”
- Filter bar (date, payer, status)
- Table: all receipt entries in backup scope.

### Fields & Table

**Filters:**
- Payer (name, id; optional, async)
- Receipt Date (range)
- Status (Pending/Approved/Rejected/All)

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Receipt No. | receiptNo | text |
| Date | date | date |
| Payer | payer | text |
| Amount | amount | decimal |
| Payment Method | paymentMethod | text |
| Status | status | pill |
| Backup Date | backupDate | date |

### Actions Available

- Export backup file (xlsx, pdf)
- Print
- Restore (modal, admin only, one at a time—confirm dialog)

### Interactions

- Table sort/filter, 50 per page
- Restore: row menu, opens confirmation dialog (reason required, text input—“Provide justification for restore”)
- Skeleton, error, empty states per previous

### Test Identifiers

- `receipts-backup-title`
- `receipts-backup-filter-payer`
- `receipts-backup-filter-datefrom`
- `receipts-backup-filter-dateto`
- `receipts-backup-filter-status`
- `receipts-backup-filter-apply`
- `receipts-backup-filter-reset`
- `receipts-backup-table`
- `receipts-backup-row-restore`
- `receipts-backup-restore-confirm`
- `receipts-backup-export`
- `receipts-backup-print`
- `receipts-backup-error-banner`
- `receipts-backup-empty-state`
- `receipts-backup-loading-skeleton`

---

## 260. Receipts

### Route Path
`/finance/receipts`

### Purpose
Full listing and advanced filtering of all receipts, supporting transaction review, reconciliation, and export.

### PRD Reference
- Receipts & Payments Processing: Receipts (Report)
- FR-277, FR-266

### Access Control
- Roles: Standard User, Supervisor, Administrator

### Layout & Structure

- Glass panel: “Receipts Register”
- Filter row (always sticky, top)
- Table: all receipts, paginated, searchable
- Export, print bar above

### Fields & Table

**Filters:**
- Payer (searchable input)
- Date (range)
- Amount (min/max)
- Payment Method (dropdown)
- Status (Pending/Approved/Rejected/All)
- Apply/Reset

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Receipt No. | receiptNo | text |
| Date | date | date |
| Payer | payer | text |
| Amount | amount | decimal |
| Payment Method | paymentMethod | text |
| Status | status | pill |
| Reference | referenceNo | text |

### Actions Available

- Export (Excel, PDF)
- Print
- Row: expand for receipt detail panel (modal)

### Interactions

- Sort by amount, date, status
- Paginate: 40 per page
- Loading: shimmer for all rows + header
- Error, empty: as above

### Test Identifiers

- `receipts-title`
- `receipts-filter-payer`
- `receipts-filter-datefrom`
- `receipts-filter-dateto`
- `receipts-filter-amount-min`
- `receipts-filter-amount-max`
- `receipts-filter-method`
- `receipts-filter-status`
- `receipts-filter-apply`
- `receipts-filter-reset`
- `receipts-table`
- `receipts-row-detail`
- `receipts-export`
- `receipts-print`
- `receipts-error-banner`
- `receipts-empty-state`
- `receipts-loading-skeleton`

---

## 261. Report1

### Route Path
`/reports/diagnostics/custom-1`

### Purpose
Displays a custom diagnostic or sample report, rendered according to administrator configuration.

### PRD Reference
- Financial Reporting & Statements: Report1 (custom/test report)

### Access Control
- Roles: Administrator

### Layout & Structure

- Card panel, title: “Custom Diagnostics Report”
- Filter set as defined administratively (could include Date, Entity, Custom Parameter X/Y).
- Table: test or diagnostic rows matching admin's logic; columns dynamic
- Export and print: top bar

### Fields & Table

**Filters:**
- As specified in admin configuration (dynamic fields, use text/date/select)
- Apply/Reset

**Table Columns:**
- Dynamic; admin config only (minimum: Test Field, Value, Status, Timestamp)

### Actions

- Export report (all possible formats)
  - `data-testid='report1-export'`
- Print
  - `data-testid='report1-print'`

### Interactions

- Table sorting for all columns where possible.
- Skeleton: up to 6 generic rows.
- Error/empty: “No diagnostics data found.” / error banner.

### Test Identifiers

- `report1-title`
- `report1-filter-apply`
- `report1-filter-reset`
- `report1-table`
- `report1-export`
- `report1-print`
- `report1-error-banner`
- `report1-empty-state`
- `report1-loading-skeleton`

---

## 262. Report222rpt

### Route Path
`/reports/diagnostics/custom-2`

### Purpose
Test or alternate diagnostics report for verification and advanced system diagnostics.

### PRD Reference
- Financial Reporting & Statements: Report222rpt (sample/test/diagnostic)

### Access Control
- Roles: Administrator

### Layout & Structure

- Panel card, title: “Diagnostics/Custom Report 2”
- Dynamic filter bars (per admin configuration)
- Table, columns dynamic; grouping supported
- Export/Print

### Fields & Table

**Filters:**  
- Dynamic fields per config (see Report1)

**Table Columns:**  
- Dynamic columns, with fallback: Field, Value, Status, User, Timestamp

### Actions

- Export
  - `data-testid='report222rpt-export'`
- Print
  - `data-testid='report222rpt-print'`

### Interactions

- Table sorting, skeletons, error/empty states as above.

### Test Identifiers

- `report222rpt-title`
- `report222rpt-filter-apply`
- `report222rpt-filter-reset`
- `report222rpt-table`
- `report222rpt-export`
- `report222rpt-print`
- `report222rpt-error-banner`
- `report222rpt-empty-state`
- `report222rpt-loading-skeleton`

---

## 263. Report_stk_ledger

### Route Path
`/stock/ledger/report`

### Purpose
Display detailed stock ledger reports for audit, reconciliation, inventory control.

### PRD Reference
- Stock & Inventory Management: Report_stk_ledger (Stock Ledger Report)
- FR-200

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Glass panel title: “Stock Ledger Report”
- Top filter bar: Item, Date Range, Location, Apply/Reset, Export bar
- Table: item-level ledger entries

### Fields & Table

**Filters:**
- Item (dropdown, async)
- Date Range (default: current month)
- Location (optional, dropdown)
- Apply/Reset

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Date | date | date |
| Item Code | itemCode | text |
| Description | description | text |
| In Qty | stockIn | number |
| Out Qty | stockOut | number |
| Balance | balance | number |
| Rate | rate | decimal |
| Amount | amount | decimal |
| Reference | reference | text |
| Location | location | text |

### Actions Available

- Export (PDF/XLS)
- Print
- Row click: show item movement detail panel (modal)

### Interactions

- Pagination: 25 lines per page
- Table sorting: Item, date, amount
- Skeleton: shimmer/8 rows
- Error, empty as standard

### Test Identifiers

- `report-stk-ledger-title`
- `report-stk-ledger-filter-item`
- `report-stk-ledger-filter-location`
- `report-stk-ledger-filter-datefrom`
- `report-stk-ledger-filter-dateto`
- `report-stk-ledger-filter-apply`
- `report-stk-ledger-filter-reset`
- `report-stk-ledger-table`
- `report-stk-ledger-row-detail`
- `report-stk-ledger-export`
- `report-stk-ledger-print`
- `report-stk-ledger-error-banner`
- `report-stk-ledger-empty-state`
- `report-stk-ledger-loading-skeleton`

---

## 264. rptWorkStatus

### Route Path
`/jobs/report/status-detail`

### Purpose
Report (with filter and export) of the status of all ongoing or recent work orders, for operational tracking.

### PRD Reference
- Job, Work Order & Estimation Management: rptWorkStatus (Report)
- FR-121, FR-123

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Title: “Work Order Status Report”
- Filter bar: Date range, Advisor/Assigned Staff, Status, Customer, Apply/Reset
- Table: work order status lines

### Fields & Table

**Filters:**
- Work Order Date (range)
- Advisor/Staff (dropdown)
- Status (multi-select)
- Customer Name/ID (search)
- Apply/Reset

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Work Order # | orderNo | text |
| Date | date | date |
| Customer | customer | text |
| Vehicle | vehicle | text |
| Status | status | pill |
| Assigned To | assignedStaff | text |
| Completion Date | completionDate | date |
| Remarks | remarks | text |

### Actions

- Export report (PDF/Excel)
- Print
- Row click/keyboard: slide-in detail panel (full work order info)

### Interactions

- Sorting by date, staff, status
- Pagination: 30 lines per page
- Skeleton, error, empty as per above

### Test Identifiers

- `rpt-work-status-title`
- `rpt-work-status-filter-datefrom`
- `rpt-work-status-filter-dateto`
- `rpt-work-status-filter-advisor`
- `rpt-work-status-filter-status`
- `rpt-work-status-filter-customer`
- `rpt-work-status-filter-apply`
- `rpt-work-status-filter-reset`
- `rpt-work-status-table`
- `rpt-work-status-row-detail`
- `rpt-work-status-export`
- `rpt-work-status-print`
- `rpt-work-status-error-banner`
- `rpt-work-status-empty-state`
- `rpt-work-status-loading-skeleton`

---

## 265. rptWorkStatusSummary

### Route Path
`/jobs/report/status-summary`

### Purpose
Summarizes work/job statuses for a given period or criteria, for management and planning review.

### PRD Reference
- Job, Work Order & Estimation Management: rptWorkStatusSummary (Summary Report)
- FR-125

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Glass card, title: “Work Status Summary Report”
- Filter bar: Date range, Advisor/Staff, Status, Customer (all optional)
- Table: summary aggregation (status/advisor group rows)

### Fields & Table

**Filters:**
- Date Range
- Advisor/Assigned Staff
- Status (multi-select)

**Table Columns:**
| Label | Field | Type |
|-------|-------|------|
| Status/Advisor | key | group header |
| # of Work Orders | workOrderCount | number |
| # Completed | completedCount | number |
| # Overdue | overdueCount | number |
| # In Progress | inprogressCount | number |
| # Critical | criticalCount | number |
| Earliest Due Date | earliestDue | date |
| Latest Due Date | latestDue | date |

### Actions

- Export (PDF, Excel)
- Print

### Interactions

- Group expand/collapse (status or advisor)
- Pagination: 16 groups per page
- Skeleton, error, empty per earlier screens

### Test Identifiers

- `rpt-work-status-summary-title`
- `rpt-work-status-summary-filter-datefrom`
- `rpt-work-status-summary-filter-dateto`
- `rpt-work-status-summary-filter-advisor`
- `rpt-work-status-summary-filter-status`
- `rpt-work-status-summary-filter-apply`
- `rpt-work-status-summary-filter-reset`
- `rpt-work-status-summary-table`
- `rpt-work-status-summary-export`
- `rpt-work-status-summary-print`
- `rpt-work-status-summary-error-banner`
- `rpt-work-status-summary-empty-state`
- `rpt-work-status-summary-loading-skeleton`

---

## 266. SalaryRegister

### Route Path
`/personnel/payroll/register`

### Purpose
Register listing of all payroll/salary entries for HR, payroll, and reporting functions.

### PRD Reference
- Financial Reporting & Statements: SalaryRegister
- FR-294

### Access Control
- Administrator

### Layout & Structure

- Card panel with heading: "Salary Register"
- Filter row: Employee, Date Range, Department, Status (Active/Inactive), Apply/Reset
- Table

### Fields & Table

**Filters:**
- Employee (dropdown, async)
- Date range (required)
- Department (dropdown)
- Status

**Table Columns**
| Label | Field | Type |
|-------|-------|------|
| Employee Name | employeeName | text |
| Employee ID | employeeId | text |
| Department | department | text |
| Pay Period | period | text (Month/Year) |
| Total Salary | salary | decimal |
| Status | status | pill |
| Last Paid Date | lastPaid | date |

### Actions

- Export (PDF/XLS)
- Print

### Interactions

- Sort/Filter as above, paginate 36 rows per page
- Skeleton: shimmer 10 lines
- Error/empty as standard

### Test Identifiers

- `salary-register-title`
- `salary-register-filter-employee`
- `salary-register-filter-datefrom`
- `salary-register-filter-dateto`
- `salary-register-filter-department`
- `salary-register-filter-status`
- `salary-register-filter-apply`
- `salary-register-filter-reset`
- `salary-register-table`
- `salary-register-export`
- `salary-register-print`
- `salary-register-error-banner`
- `salary-register-empty-state`
- `salary-register-loading-skeleton`

---

## 267. Salaryslip

### Route Path
`/personnel/payroll/slip/:employeeId/:period`

### Purpose
Generates and displays a formatted pay slip for a given employee and period.

### PRD Reference
- Financial Reporting & Statements: Salaryslip
- FR-294

### Access Control
- Administrator

### Layout & Structure

- Centered “glass” pay slip panel, print-optimized layout (A4, ~630px wide)
- Employee and company info header
- Pay period
- Earnings table, deductions table, net summary
- Download/pay stub actions: PDF and Print (fixed at top right)

### Fields

**Header:**
- Company name, address, logo (if available)
- Employee Name, ID, Department
- Pay Period

**Earnings:**
| Label | Field | Type |
|---|---|---|
| Basic Salary | basic | decimal |
| House Rent Allowance | hra | decimal |
| Other Allowances | allowances | decimal |
| Overtime | overtime | decimal |
| Total Earnings | earningsTotal | decimal |

**Deductions:**
| Label | Field | Type |
|---|---|---|
| Income Tax | incomeTax | decimal |
| Provident Fund | pf | decimal |
| Other Deductions | other | decimal |
| Total Deductions | deductionsTotal | decimal |

**Footer:**
- Net Pay | netPay | decimal
- Payment Method | method | text
- Generated by, Date, Digital signature (if enabled)

**Actions**
- Download as PDF (`data-testid='salaryslip-download-pdf'`)
- Print (`data-testid='salaryslip-print'`)
- Back link

### Validations/Behavior
- If record missing: show banner “Pay slip record not found for selected employee and period.”
- Print uses print-only CSS, removes all navigation and non-pay-slip elements.
- Skeleton shimmer for loading.

### Test Identifiers

- `salaryslip-title`
- `salaryslip-header-employee`
- `salaryslip-header-period`
- `salaryslip-earnings-table`
- `salaryslip-deductions-table`
- `salaryslip-netpay`
- `salaryslip-download-pdf`
- `salaryslip-print`
- `salaryslip-error-banner`
- `salaryslip-notfound-banner`
- `salaryslip-loading-skeleton`
- `salaryslip-back-link`

---

## 268. SaleBillPrnt-12

### Route Path
`/sales/bills/print/format-12/:billNo`

### Purpose
Printable sales bill in regulatory or custom format #12 for compliance.

### PRD Reference
- SaleBillPrnt-12 (compliance printing format)

### Access Control
- Standard User, Supervisor

### Layout & Structure

- A4 width, glass-canvas card, print-optimized styling
- Company header
- Customer information block
- Bill table: Itemized details, amounts
- Tax breakdown
- Terms & conditions
- Signatures: customer and staff
- Print button (visible only in browser)

### Fields

- Bill Number, Date
- Customer name, address, VAT ID
- Items:
  | S.No. | Description | Qty | Unit | Rate | Tax | Amount |
- Tax summary: CGST, SGST, IGST etc.
- Grand Total (in words and numbers)
- Amount in currency, (rupees/dirham etc, as per organization)
- Terms, payment info
- Signatures

### Actions

- Print (`data-testid='salebillprnt-12-print'`)
- Download PDF (`data-testid='salebillprnt-12-download-pdf'`)
- Back

### Interactions

- Print button triggers browser print dialog, disables navigation.
- Skeleton overlay during load.

### Test Identifiers

- `salebillprnt-12-title`
- `salebillprnt-12-header-company`
- `salebillprnt-12-header-customer`
- `salebillprnt-12-bill-table`
- `salebillprnt-12-tax-summary`
- `salebillprnt-12-total-words`
- `salebillprnt-12-signatures`
- `salebillprnt-12-print`
- `salebillprnt-12-download-pdf`
- `salebillprnt-12-back`
- `salebillprnt-12-loading-skeleton`
- `salebillprnt-12-error-banner`

---

## 269. SaleBillPrnt

### Route Path
`/sales/bills/print/:billNo`

### Purpose
Standard printable sales bill, formatted for system/official use.

### PRD Reference
- SaleBillPrnt

### Access Control
- Standard User, Supervisor

### Layout & Structure

- Print-optimized panel, structure as in SaleBillPrnt-12, with org-specific layout.
- Company & customer header
- Invoice table (S.No., Item, Qty, Unit, Unit Price, Tax, Total)
- Amount in words
- Print and download buttons

### Test Identifiers

- `salebillprnt-title`
- `salebillprnt-header-company`
- `salebillprnt-header-customer`
- `salebillprnt-bill-table`
- `salebillprnt-tax-summary`
- `salebillprnt-total-words`
- `salebillprnt-signatures`
- `salebillprnt-print`
- `salebillprnt-download-pdf`
- `salebillprnt-back`
- `salebillprnt-loading-skeleton`
- `salebillprnt-error-banner`

---

## 270. SaleBillPrnt_2

### Route Path
`/sales/bills/print/alternate/:billNo`

### Purpose
Alternative print/export format for sales bills (use-case: legacy compliance or client specification).

### PRD Reference
- SaleBillPrnt_2

### Access Control
- Standard User, Supervisor

### Layout
- As with SaleBillPrnt; refers to different column layout, fonts, or sequence.

### Test Identifiers

- `salebillprnt2-title`
- `salebillprnt2-header-company`
- `salebillprnt2-header-customer`
- `salebillprnt2-bill-table`
- `salebillprnt2-tax-summary`
- `salebillprnt2-total-words`
- `salebillprnt2-signatures`
- `salebillprnt2-print`
- `salebillprnt2-download-pdf`
- `salebillprnt2-back`
- `salebillprnt2-loading-skeleton`
- `salebillprnt2-error-banner`

---

## 271. SaleBillPrnt_Insurance

### Route Path
`/sales/bills/print/insurance/:billNo`

### Purpose
Special insurance-format sales bill print/export.

### PRD Reference
- SaleBillPrnt_Insurance

### Access Control
- Supervisor, Administrator

### Layout & Fields
- Variant of standard bill, with extra insurance policy fields per PRD.

### Test Identifiers

- `salebillprnt-insurance-title`
- `salebillprnt-insurance-header-company`
- `salebillprnt-insurance-header-customer`
- `salebillprnt-insurance-bill-table`
- `salebillprnt-insurance-policy-table`
- `salebillprnt-insurance-tax-summary`
- `salebillprnt-insurance-total-words`
- `salebillprnt-insurance-signatures`
- `salebillprnt-insurance-print`
- `salebillprnt-insurance-download-pdf`
- `salebillprnt-insurance-back`
- `salebillprnt-insurance-loading-skeleton`
- `salebillprnt-insurance-error-banner`

---

## 272. SaleBillPrnt_plain

### Route Path
`/sales/bills/print/plain/:billNo`

### Purpose
Simple/“plain format” sales bill intended for plain paper printing (non-letterhead).

### PRD Reference
- SaleBillPrnt_plain

### Access Control
- Standard User, Supervisor

### Layout
- Minimal layout: fixed-width, no colored elements.
- Logo, customer, items, total.
- Print/download.

### Test Identifiers

- `salebillprnt-plain-title`
- `salebillprnt-plain-header-company`
- `salebillprnt-plain-header-customer`
- `salebillprnt-plain-bill-table`
- `salebillprnt-plain-tax-summary`
- `salebillprnt-plain-total-words`
- `salebillprnt-plain-signatures`
- `salebillprnt-plain-print`
- `salebillprnt-plain-download-pdf`
- `salebillprnt-plain-back`
- `salebillprnt-plain-loading-skeleton`
- `salebillprnt-plain-error-banner`

---

## 273. SaleBillPrnt_ribu

### Route Path
`/sales/bills/print/ribu/:billNo`

### Purpose
Specialized bill format for unique business requirements (e.g., for RIBU/partner).

### PRD Reference
- SaleBillPrnt_ribu

### Access Control
- Administrator

### Layout
- Customized/partner-specific, as per org requirements.

### Test Identifiers

- `salebillprnt-ribu-title`
- `salebillprnt-ribu-header-company`
- `salebillprnt-ribu-header-customer`
- `salebillprnt-ribu-bill-table`
- `salebillprnt-ribu-tax-summary`
- `salebillprnt-ribu-total-words`
- `salebillprnt-ribu-signatures`
- `salebillprnt-ribu-print`
- `salebillprnt-ribu-download-pdf`
- `salebillprnt-ribu-back`
- `salebillprnt-ribu-loading-skeleton`
- `salebillprnt-ribu-error-banner`

---

## 274. SaleBillPrnt_Sectionwise

### Route Path
`/sales/bills/print/sectionwise/:billNo`

### Purpose
Print version of sales bill by business section, supporting sectioned reporting.

### PRD Reference
- SaleBillPrnt_Sectionwise

### Access Control
- Supervisor, Administrator

### Layout
- As above, but groups items by "Section" column, subtotal per section.

### Test Identifiers

- `salebillprnt-sectionwise-title`
- `salebillprnt-sectionwise-header-company`
- `salebillprnt-sectionwise-header-customer`
- `salebillprnt-sectionwise-bill-table`
- `salebillprnt-sectionwise-tax-summary`
- `salebillprnt-sectionwise-total-words`
- `salebillprnt-sectionwise-signatures`
- `salebillprnt-sectionwise-print`
- `salebillprnt-sectionwise-download-pdf`
- `salebillprnt-sectionwise-back`
- `salebillprnt-sectionwise-loading-skeleton`
- `salebillprnt-sectionwise-error-banner`

---

## 275. SalesAnalysisNEW

### Route Path
`/sales/analysis/new`

### Purpose
New/alternate layout for sales performance analysis, with advanced segmentation and drill-down.

### PRD Reference
- SalesAnalysisNEW
- FR-283

### Access Control
- Supervisor, Administrator

### Layout & Structure

- Glass dashboard with filters on left, line/bar/pie chart, and breakdown data grid.
- Title: “Sales Analysis (Advanced)”
- Filter panel: Date Range, Category, Salesperson, Customer, Segmentation field picker, Apply
- Main Chart: select graph type (trend, pie, bar), download chart action
- Data Table: columns differ by segmentation

### Fields & Table

**Filters:**
- Date Range (default: last month)
- Item Category (multi-select)
- Salesperson (multi-select, async)
- Customer (async, optional)
- Segmentation Field: dropdown (`None`, `By Item`, `By Salesperson`, `By Customer`, `By Section`)
- Apply/Reset

**Chart:**
- Select chart type (toggle group)
- Download chart (export as PNG, CSV)
- Responsive resizing (auto for mobile/tab)

**Table Columns (dynamic, depends on segmentation):**
- Always: Label (e.g., Item, Salesperson, Section)
- Total Sales
- Total Quantity
- Avg. Price (if available)
- Drill-down: Row click opens modal with underlying transactions

### Actions

- Apply filters (`data-testid='sales-analysisnew-filter-apply'`)
- Change segmentation
- Export data (XLS/PDF/CSV; `data-testid='sales-analysisnew-export'`)
- Download chart image
- Print summary view

### Interactions

- Chart animates in when data loads (fade+transform, no layout animation)
- Table paginated: 30 records/page
- Drill-down modal overlay shows detailed records
- Skeleton for chart (fade+shimmer), table, filters
- Empty and error as above

### Test Identifiers

- `sales-analysisnew-title`
- `sales-analysisnew-filter-category`
- `sales-analysisnew-filter-salesperson`
- `sales-analysisnew-filter-customer`
- `sales-analysisnew-filter-datefrom`
- `sales-analysisnew-filter-dateto`
- `sales-analysisnew-filter-segmentation`
- `sales-analysisnew-filter-apply`
- `sales-analysisnew-filter-reset`
- `sales-analysisnew-chart`
- `sales-analysisnew-chart-type-toggle`
- `sales-analysisnew-chart-download`
- `sales-analysisnew-table`
- `sales-analysisnew-table-drilldown`
- `sales-analysisnew-export`
- `sales-analysisnew-print`
- `sales-analysisnew-error-banner`
- `sales-analysisnew-empty-state`
- `sales-analysisnew-loading-skeleton`

---

## COVERAGE CHECK

| Screen Name                      | Covered       |
|-----------------------------------|--------------|
| PurchaseDoItemRegister            | ✅ covered    |
| PurchaseDoItemRegisterSummary     | ✅ covered    |
| PurchaseOrder                     | ✅ covered    |
| Purchasereg-Ac                    | ✅ covered    |
| Purchasereg-Import                | ✅ covered    |
| Purchasereg-Local                 | ✅ covered    |
| PurchaseregSupp-Local             | ✅ covered    |
| PurchaseReturnBill                | ✅ covered    |
| Receipts-Backup                   | ✅ covered    |
| Receipts                          | ✅ covered    |
| Report1                           | ✅ covered    |
| Report222rpt                      | ✅ covered    |
| Report_stk_ledger                 | ✅ covered    |
| rptWorkStatus                     | ✅ covered    |
| rptWorkStatusSummary              | ✅ covered    |
| SalaryRegister                    | ✅ covered    |
| Salaryslip                        | ✅ covered    |
| SaleBillPrnt-12                   | ✅ covered    |
| SaleBillPrnt                      | ✅ covered    |
| SaleBillPrnt_2                    | ✅ covered    |
| SaleBillPrnt_Insurance            | ✅ covered    |
| SaleBillPrnt_plain                | ✅ covered    |
| SaleBillPrnt_ribu                 | ✅ covered    |
| SaleBillPrnt_Sectionwise          | ✅ covered    |
| SalesAnalysisNEW                  | ✅ covered    |

---

# FRONTEND_SPEC.md

---
## 276. SalesAnalysisOne

**Route Path:** `/sales/analysis-one`  
**Purpose:** Focused sales analysis for selected metrics, combining tabular and graphical breakdown of sales performance (e.g., by period, metric, staff, or region).  
**PRD Reference:** Screen PRD "SalesAnalysisOne", Features: Sales performance analytics  
**Access Roles:** Standard User, Supervisor  
**UI Design System Applied:** Glass surface panel, outlined action icons, spacing as per design tokens.

### Layout & Structure

- **Glass card** (`glass-card`, level 2), ~940px max-width, centered
- Header row with title, date filter, and metric select
- KPI summary card grid
- Data table section, tabbed or filtered
- Graph/chart panel (bar/line, minimal color accents)
- Empty state illustrated with muted icon and message

### Components & Fields

**Header Section**
- Title: "Sales Analysis — Focused View"
- Date Range Select
  - Label: "Period"
  - From: `<input type="date">`
  - To: `<input type="date">`
  - Error: "Please enter a valid period" (adjacent to field, red)
- Metric Dropdown  
  - Label: "Metric"  
  - Options: "Total Sales", "Gross Margin", "Units Sold", "Avg. Invoice", etc.  
  - Error: "Please select a metric"  
  - Required

**Filter Actions**
- Filter/Refresh Button (`primary`)
  - TestID: `salesanalysisone-filter-apply-btn`
  - Disabled until all filters valid
- Export Button (`outline`)
  - Dropdown: "Export as..." → Excel, PDF, CSV
  - TestID: `salesanalysisone-export-btn`

**KPI Summary Grid**  
- Up to 4 KPI cards:
  - "Total Sales", "Gross Margin", etc.
  - Icon: outlined, 24x24
  - Value: formatted (e.g., ₹ #,##0.00)
  - Subtext: e.g., "vs. last period: +8.2%"
  - Trend Arrow (up/down/flat)

**Tabular Data**
- Tabbed toggle: "Table" | "Chart"
- Data Table:
  - Columns: [Date], [Salesman/Region/Staff], [Value] (or [Units], etc.), [Delta %], [Cumulative]
  - Sorting: any column
  - Pagination: page size 20, default to first page
  - Row hover: row highlight, click row for drill-down (if permission)
  - Loading skeleton: shimmered rows (5), fade-in

**Chart Panel**
- Chart type based on metric (bar, line, or pie; never filled)
- Y-axis and X-axis labeled
- Legend only if >1 series
- Data Test ID: `salesanalysisone-chart`

**Empty State**
- Icon (outline chart)
- Message: "No data for the selected filters. Please adjust the period or metric."
- TestID: `salesanalysisone-empty`

**Error State**
- Banner: "Unable to load sales analysis. Please try again or adjust your filters." (TestID: `salesanalysisone-error`)
- For field errors, message below input

### API Integration

- **GET** `/api/v1/sales/analysis-one` with params: dateFrom, dateTo, metric
- Loading: show skeletons for KPI and table/chart
- On error: show error banner and retry button

### Interactions

- All filter/select fields are keyboard navigable with visible focus
- Refresh animates opacity/transform when updating content (respect prefers-reduced-motion)
- Export button disables and shows spinner when in-progress
- Tab switching animates fade/content swap

### Validation

- Date: Required, `dateTo >= dateFrom`, Native HTML5 date input, fallback for unsupported
- Metric: Required

### Test Identifiers

- `salesanalysisone-header-title`
- `salesanalysisone-date-from`
- `salesanalysisone-date-to`
- `salesanalysisone-metric-select`
- `salesanalysisone-filter-apply-btn`
- `salesanalysisone-export-btn`
- `salesanalysisone-kpi-total`
- `salesanalysisone-kpi-margin`
- `salesanalysisone-table`
- `salesanalysisone-table-row`
- `salesanalysisone-chart`
- `salesanalysisone-empty`
- `salesanalysisone-error`

---

## 277. SalesItemCategorySub

**Route Path:** `/sales/category-summary`  
**Purpose:** Report and analyze sales grouped by item category and subcategory, with filtering and export.  
**PRD Reference:** "SalesItemCategorySub", Feature: Sales by item/category, sales analysis, reporting  
**Access Roles:** Supervisor, Administrator, Standard User (view only)

### Layout & Structure

- Glass card, centered, 1000px, tabular report
- Top filter row: date range, category select
- KPI bar above table: total sales, number of categories, top-selling subcategory
- Main data table for `Category`, `Subcategory`, `Units Sold`, `Total Sales`, `Margin`, `Avg. Price`
- Export action bar

### Components & Fields

**Filters**
- Date Range (From–To)
  - Label: "Period"
  - Required
- Category Select
  - Label: "Item Category"
  - Dropdown: Names fetched from `/api/v1/categories`
  - Optional; default "All"
- Filter Button  
  - TestID: `salesitemcategorysub-filter-btn`

**KPIs**
- "Total Categories": numeric
- "Total Sales": currency
- "Top Category": badge

**Data Table**
- Columns:
  - `Category` (text, badge if top)
  - `Subcategory`
  - `Units Sold` (integer)
  - `Total Sales` (currency)
  - `Margin` (percent, colored: green > 0, red < 0)
  - `Average Price`
- Row hover highlights row (`#3831c408`)
- Pagination: 25/page
- Export Button: Export (dropdown: Excel, PDF, CSV)
  - TestID: `salesitemcategorysub-export-btn`
- Loading: shimmer for header, rows
- API error: error banner (color-error)

**Empty State**
- Message: "No sales in this period/category."

### API Integration

- **GET** `/api/v1/sales/category-summary` (params: dateFrom, dateTo, categoryId)

### Interactions

- Changing filters auto-triggers refresh
- Focus/keyboard navigation visible
- Export disables on loading/empty

### Validation

- Date: Required, range valid
- Category: optional

### Test Identifiers

- `salesitemcategorysub-header`
- `salesitemcategorysub-date-from`
- `salesitemcategorysub-date-to`
- `salesitemcategorysub-category`
- `salesitemcategorysub-filter-btn`
- `salesitemcategorysub-kpi-total`
- `salesitemcategorysub-table`
- `salesitemcategorysub-table-row`
- `salesitemcategorysub-export-btn`
- `salesitemcategorysub-empty`
- `salesitemcategorysub-error`

---

## 278. SalesLabourPartsReport

**Route Path:** `/sales/labour-parts-report`  
**Purpose:** Specialized report showing job/labour related sales vs. parts, with period filtering and breakdown.  
**PRD Reference:** "SalesLabourPartsReport", Feature: Service/labour sales analytics  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- Glass panel, wide (1040px), tabular report with date filters and export
- Filter section at top, table below, summary row at end

### Components & Fields

**Filters**
- Date Range "From" and "To"
  - Required
  - TestID: `saleslabourpartsreport-date-from` / `saleslabourpartsreport-date-to`
- Filter/Go Button (primary)
  - TestID: `saleslabourpartsreport-filter-btn`
- Export (dropdown for Excel, PDF, CSV)
  - TestID: `saleslabourpartsreport-export-btn`

**Table Columns**
- `Bill #`
- `Date`
- `Job Card`
- `Customer`
- `Vehicle No.`
- `Make`
- `Labour Total` (currency)
- `Parts Total` (currency)
- `Bill Total (Nett)` (currency)
- `Advisor` (`StaffName`)
- Row hover highlights row
- Pagination: page size 20

**Summary Row**
- Sums Labour/Parts/Nett columns for period

**Loading & States**
- Skeleton rows (5–10), plus faded summary skeleton
- Empty state: "No labour or parts sales for selected period."
- Error: banner above table

### Interactions

- All columns sortable
- Export always acts on current filters/results

### API

- **GET** `/api/v1/sales/labour-parts-report`

### Validation

- Dates required, "To" >= "From"
- Error message for missing/invalid date

### Test Identifiers

- `saleslabourpartsreport-header`
- `saleslabourpartsreport-date-from`
- `saleslabourpartsreport-date-to`
- `saleslabourpartsreport-filter-btn`
- `saleslabourpartsreport-table`
- `saleslabourpartsreport-table-row`
- `saleslabourpartsreport-summary-row`
- `saleslabourpartsreport-export-btn`
- `saleslabourpartsreport-empty`
- `saleslabourpartsreport-error`

---

## 279. SalesMarginReport

**Route Path:** `/sales/margin-report`  
**Purpose:** Report on sales margins, costs, and profitability by invoice/parts/labour.  
**PRD Reference:** "SalesMarginReport"  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- Glass-panel main, large, scrollable data table
- Top bar: date, filter actions, single export button

### Components & Fields

**Filters**
- "From Date": `<input type="date">`
- "To Date": `<input type="date">`
- "Order #" OR "Invoice #": text input, one at a time
- Search Button (primary, runs filter)
- Export Button (outline, right side)

**Table Columns**
- `Bill #`
- `Date`
- `Order #`
- `Order Date`
- `Delivery Date`
- `Item Code`
- `Item Desc`
- `Category`
- `Qty`
- `Sale Rate`
- `Purchase Rate`
- `Sale Amount`
- `Purchase Amount`
- `Margin` (currency + %)
- `Parts/Labour`
- `Advisor`
- `Vehicle #`
- Row hover: background highlight
- Pagination: 25/page
- Column sorting on all

**Summary Row**
- Grand total for margin columns

**Loading State**
- 10 row skeletons, fade on data ready

**Empty/Error**
- "No margin data for selected period/criteria."
- Error banner: "Error generating margin report."

### API

- **GET** `/api/v1/sales/margin-report`  
  params: { dateFrom, dateTo, orderNo, invNo }

### Validation

- Date required
- Order # and Invoice # mutually exclusive
- Error below field

### Test Identifiers

- `salesmarginreport-date-from`
- `salesmarginreport-date-to`
- `salesmarginreport-order`
- `salesmarginreport-invoice`
- `salesmarginreport-filter-btn`
- `salesmarginreport-table`
- `salesmarginreport-row`
- `salesmarginreport-summary-row`
- `salesmarginreport-export-btn`
- `salesmarginreport-empty`
- `salesmarginreport-error`

---

## 280. SalesMarginReportNew

**Route Path:** `/sales/margin-report-new`  
**Purpose:** Alternate or improved layout of Sales Margin report for analytics use.  
**PRD Reference:** "SalesMarginReportNew"  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- Glass-panel as above
- KPI widget row for "Total Margin", "Avg Margin %", etc.
- Filter bar as margin report
- Data table with enhanced/alternate layout, e.g., nested group rows for each salesman or by category

**Extra Components**

- KPI Block: `salesmarginreportnew-kpi-total`, `-average`, `-top-advisor`
- Drill-down expand/collapse rows if category grouping is used

**Validation, Loading, Error:**  
Identical to previous section.

**Test Identifiers**

- `salesmarginreportnew-header`
- `salesmarginreportnew-kpi-total`
- `salesmarginreportnew-table`
- `salesmarginreportnew-group-row`
- `salesmarginreportnew-export-btn`
- ...all others as with main report

---

## 281. SalesOrder

**Route Path:** `/sales/orders`  
**Purpose:** List, search and report on all customer sales orders.  
**PRD Reference:** "SalesOrder"  
**Access Roles:** Standard User, Supervisor

### Layout & Structure

- Glass container, fullwidth
- Table with:
  - Order #, Customer, Date, Status, Total, Assigned Staff, Delivery Date
  - Filters: date range, status, customer, staff
  - Action: view order (row click → `/sales/orders/:id`)
- Export bar: Excel/PDF/CSV

**Search & Filters**

- Date From/To: Required
- Status: dropdown ("All", "Pending", "Delivered", etc)
- Customer: autocomplete, can search partial
- Staff: dropdown

**Table Columns**

- `Order #` (clickable)
- `Customer`
- `Order Date`
- `Status` (badge by state)
- `Total (₹)`
- `Assigned To`
- `Delivery Date`
- Pagination: 20/page

**Action Buttons**

- Export (with loading spinner when run)
- PRD action: "Run Report" (primary, refreshes table)
- Row click: go to order detail

**Loading/Error/Empty**

- Skeleton rows, error banner, empty state message as per DS

**Test Identifiers**

- `salesorder-filter-date-from`
- `salesorder-filter-date-to`
- `salesorder-filter-status`
- `salesorder-filter-customer`
- `salesorder-filter-staff`
- `salesorder-table`
- `salesorder-row`
- `salesorder-export-btn`
- `salesorder-run-btn`
- `salesorder-empty`
- `salesorder-error`

---

## 282. SalesOrderNEW

**Route Path:** `/sales/orders-new`  
**Purpose:** New/alternate layout or improved list/report of sales orders.  
**PRD Reference:** "SalesOrderNEW"  
**Access Roles:** Supervisor, Administrator

### Layout & Structure

- Glass-panel
- Includes all columns as above, plus:
  - "Order Source" (web, phone, etc)
  - "Order Type" (normal, urgent, backorder)
  - "Invoice #" (if applicable)
- KPI summary: Orders this month, New today, Overdue
- Export, sort, filter as main

**Interactions/States**

- All as per SalesOrder

**Test Identifiers**

- `salesordernew-header`
- `salesordernew-table`
- `salesordernew-export-btn`
- ...others as above

---

## 283. SalesOrderNEW_-bACKUP

**Route Path:** `/sales/orders-new-backup`  
**Purpose:** Backup/legacy layout of new-sales order list/report (used for audit/history or fallback).  
**PRD Reference:** "SalesOrderNEW_-bACKUP"  
**Access Roles:** Administrator only

### Layout/Components

- Same columns as SalesOrderNEW, possibly shown in historic color scheme or static/readonly only (no links/actions)
- Export only; no individual record actions
- Audit banner: "Backup version — do not edit"
- TestID: `salesordernewbackup-header`, `salesordernewbackup-export-btn`

---

## 284. SalesOrderNEW_backup

**Route Path:** `/sales/orders-new-backup2`  
**Purpose:** Alternate/second backup copy of sales order list/report.  
**PRD Reference:** "SalesOrderNEW_backup"  
**Access Roles:** Administrator only

- Like above, with distinct testid: `salesordernewbackup2-header`, `salesordernewbackup2-export-btn`

---

## 285. SalesOrderStatus

**Route Path:** `/sales/order-status`  
**Purpose:** Display and allow reporting on order status across all sales orders.  
**PRD Reference:** "SalesOrderStatus"  
**Access Roles:** Standard User, Supervisor

- Filters: Order #, status dropdown, date range
- Table: Order #, Customer, Status, Date, Staff, Last Updated, Notes
- Sortable
- Export enabled

**Test Identifiers**

- `salesorderstatus-header`
- `salesorderstatus-table`
- `salesorderstatus-export-btn`
- ...fields as above

---

## 286. SalesRegister-Cust

**Route Path:** `/sales/register-customer`  
**Purpose:** Registers all sales per customer, with period filtering and printing/export.  
**PRD Reference:** "SalesRegister-Cust"  
**Access Roles:** Supervisor, Administrator

- Filter: Customer select, date range
- Table columns: Customer, Invoice #, Date, Total, Status, Staff
- Summarize by customer, collapsible per customer row to show details
- Print button: formatted for A4, header includes filter summary
- Export: PDF, Excel
- Empty/error/skeleton handling

**Test Identifiers**

- `salesregistercust-header`
- `salesregistercust-filter-customer`
- `salesregistercust-table`
- `salesregistercust-print-btn`
- `salesregistercust-export-btn`
- ...

---

## 287. SalesRegister-detailed

**Route Path:** `/sales/register-detailed`  
**Purpose:** Detailed breakdown of all sales transactions for selected period.  
**PRD Reference:** "SalesRegister-detailed"  
**Access Roles:** Supervisor, Administrator

- Filter: date range, staff, customer (optional)
- Table: Invoice #, Order #, Customer, Date, Items Sold, Staff, Status, Amount, Margin
- Search input for quick find in table
- Export
- Skeleton loading, error/empty

**Test Identifiers**

- `salesregisterdetailed-header`
- `salesregisterdetailed-table`
- `salesregisterdetailed-export-btn`

---

## 288. SalesRegisterServ

**Route Path:** `/sales/register-service-orders`  
**Purpose:** Sales transactions for service/job orders, filterable by date/staff.  
**PRD Reference:** "SalesRegisterServ"  
**Access Roles:** Supervisor, Administrator

- Filter: staff, date range
- Table: Service Order #, Customer, Invoice #, Date, Service Type, Staff, Amount, Status
- Export

**Test Identifiers**

- `salesregisterserv-header`
- `salesregisterserv-table`
- `salesregisterserv-export-btn`

---

## 289. SalesReturnBill

**Route Path:** `/sales/returns`  
**Purpose:** Lists all sales returns (warranty/refund), with details by customer/date.  
**PRD Reference:** "SalesReturnBill"  
**Access Roles:** Supervisor, Administrator

- Filter: customer, date range, item (optional)
- Table: Return #, Customer, Invoice, Date, Items Returned, Amount, Processed By, Status
- Row: can expand to view item detail
- Export

**Test Identifiers**

- `salesreturnbill-header`
- `salesreturnbill-table`
- `salesreturnbill-export-btn`

---

## 290. SalesReturnRegister

**Route Path:** `/sales/return-register`  
**Purpose:** Registers all sales return transactions, with filtering/search/export.  
**PRD Reference:** "SalesReturnRegister"  
**Access Roles:** Supervisor, Administrator

- Filter: date range, status
- Table: Return #, Customer, Item, Date, Amount, Status
- Export, print

**Test Identifiers**

- `salesreturnregister-header`
- `salesreturnregister-table`
- `salesreturnregister-export-btn`
- `salesreturnregister-print-btn`

---

## 291. salesSummary

**Route Path:** `/sales/summary`  
**Purpose:** High-level summary of sales by period, customer, region, etc.  
**PRD Reference:** "salesSummary"  
**Access Roles:** Supervisor, Administrator

- Filter: period, dimension (by customer, by region, by advisor)
- KPI grid: Total Sales, Avg Sale, Top Customer
- Data table: rows by selected grouping, with totals
- Export

**Test Identifiers**

- `salessummary-header`
- `salessummary-kpi-total`
- `salessummary-table`
- `salessummary-export-btn`

---

## 292. SplitInvoiceSummary

**Route Path:** `/sales/split-invoice-summary`  
**Purpose:** Summary of invoices split between parties/items, showing splits, totals, and reconciliation.  
**PRD Reference:** "SplitInvoiceSummary"  
**Access Roles:** Administrator

- Table: Invoice #, Date, Split Party, Items, Amount, Total, Status
- Filter: Invoice #, party
- Export, Print

**Test Identifiers**

- `splitinvoicesummary-header`
- `splitinvoicesummary-table`
- `splitinvoicesummary-export-btn`
- `splitinvoicesummary-print-btn`

---

## 293. StkLedgerNew

**Route Path:** `/stock/ledger-new`  
**Purpose:** New/current stock ledger report for inventory tracking, with filtering and export.  
**PRD Reference:** "StkLedgerNew"  
**Access Roles:** Supervisor, Administrator

- Filter: item, date range, location
- Table: Date, Item Code, Description, Stock In, Stock Out, Balance, Reference, Remarks
- Export
- Sticky summary row: closing balance

**Test Identifiers**

- `stkledgernew-header`
- `stkledgernew-filter-item`
- `stkledgernew-filter-date`
- `stkledgernew-table`
- `stkledgernew-summary-row`
- `stkledgernew-export-btn`

---

## 294. StkReportNew

**Route Path:** `/stock/report-new`  
**Purpose:** Comprehensive inventory/stock report showing current and historical positions.  
**PRD Reference:** "StkReportNew"  
**Access Roles:** Supervisor, Administrator

- Filter: period, category, warehouse/location
- Table: Item, Opening Balance, Receipts, Issues, Closing Balance, Value, Location
- Column sorting/export

**Test Identifiers**

- `stkreportnew-header`
- `stkreportnew-table`
- `stkreportnew-export-btn`

---

## 295. StockAgingReport

**Route Path:** `/stock/aging-report`  
**Purpose:** Provides aging view of inventory, highlighting slow and fast movers by age bucket/status.  
**PRD Reference:** "StockAgingReport"  
**Access Roles:** Supervisor, Administrator

- Filter: category, date, min days in stock
- Table: Item, Category, Days in Stock, Last Transaction, Quantity, Value
- Export/print

**Test Identifiers**

- `stockagingreport-header`
- `stockagingreport-filter-category`
- `stockagingreport-table`
- `stockagingreport-export-btn`

---

## 296. StockIN

**Route Path:** `/stock/in`  
**Purpose:** Lists all stock received into inventory, by item/date/source.  
**PRD Reference:** "StockIN"  
**Access Roles:** Supervisor, Administrator

- Filter: date, supplier, location
- Table: Date, Item Code, Description, Quantity, Source, Reference, Remarks
- Export/print

**Test Identifiers**

- `stockin-header`
- `stockin-table`
- `stockin-filter-date`
- `stockin-export-btn`

---

## 297. StockINList

**Route Path:** `/stock/in-list`  
**Purpose:** Summarizes items received into stock by period/item.  
**PRD Reference:** "StockINList"  
**Access Roles:** Supervisor, Administrator

- Filter: item/date, supplier
- Table: Item, Total Received, Period, Last Receipt Date, Supplier
- Export

**Test Identifiers**

- `stockinlist-header`
- `stockinlist-table`
- `stockinlist-export-btn`

---

## 298. StockLedger

**Route Path:** `/stock/ledger`  
**Purpose:** Detailed register of all inventory transactions by item, shows receipts, issues, adjustments, balances.  
**PRD Reference:** "StockLedger"  
**Access Roles:** Supervisor, Administrator

- Filter: item, period, warehouse
- Table: Date, Item, Movement Type (In/Out/Adj), Reference, Quantity, Balance, Operator/Remarks
- Export

**Test Identifiers**

- `stockledger-header`
- `stockledger-filter-item`
- `stockledger-table`
- `stockledger-export-btn`

---

## 299. StockOUT

**Route Path:** `/stock/out`  
**Purpose:** Lists all stock issued/dispatched, by item/recipient/date.  
**PRD Reference:** "StockOUT"  
**Access Roles:** Supervisor, Administrator

- Filter: date, item, destination
- Table: Date, Item Code, Description, Quantity Out, Destination, Reference, Remarks
- Export

**Test Identifiers**

- `stockout-header`
- `stockout-table`
- `stockout-filter-date`
- `stockout-export-btn`

---

## 300. StockOUTList

**Route Path:** `/stock/out-list`  
**Purpose:** Summarizes all stock issues/dispatches for a period, item, or location.  
**PRD Reference:** "StockOUTList"  
**Access Roles:** Supervisor, Administrator

- Filter: item, date, destination
- Table: Item, Total Issued, Period, Last Out Date, Destination
- Export/print

**Test Identifiers**

- `stockoutlist-header`
- `stockoutlist-table`
- `stockoutlist-export-btn`

---

# COVERAGE CHECK

| Screen Name                  | Covered |
|------------------------------|---------|
| SalesAnalysisOne             | ✅      |
| SalesItemCategorySub         | ✅      |
| SalesLabourPartsReport       | ✅      |
| SalesMarginReport            | ✅      |
| SalesMarginReportNew         | ✅      |
| SalesOrder                   | ✅      |
| SalesOrderNEW                | ✅      |
| SalesOrderNEW_-bACKUP        | ✅      |
| SalesOrderNEW_backup         | ✅      |
| SalesOrderStatus             | ✅      |
| SalesRegister-Cust           | ✅      |
| SalesRegister-detailed       | ✅      |
| SalesRegisterServ            | ✅      |
| SalesReturnBill              | ✅      |
| SalesReturnRegister          | ✅      |
| salesSummary                 | ✅      |
| SplitInvoiceSummary          | ✅      |
| StkLedgerNew                 | ✅      |
| StkReportNew                 | ✅      |
| StockAgingReport             | ✅      |
| StockIN                      | ✅      |
| StockINList                  | ✅      |
| StockLedger                  | ✅      |
| StockOUT                     | ✅      |
| StockOUTList                 | ✅      |

---

# FRONTEND_SPEC.md

---

## 301. StockRe-OrderStatus

**Route:** `/stock/reorder-status`  
**Purpose:** Display all inventory items that have reached or fallen below their defined reorder thresholds for timely procurement and replenishment.  
**PRD References:** US-157, FR-195, FR-203  
**Access Roles:** Inventory Supervisor, Inventory Manager, Purchasing Officer  
**Screen Type:** Full-page report (glassmorphism panel)

### Layout & Structure

- **Header:**  
  - Title (`Stock Re-Order Status`, `data-testid="stock-reorder-status-title"`)
  - Section description (brief, muted text)
  - Optional bulk actions bar (if user has bulk export permission)

- **Filters (above table):**  
  - **Category:** Select (all inventory item categories)
  - **Warehouse/Location:** Select (all distinct inventory locations)
  - **Supplier:** Select (dropdown populated from supplier list)
  - **Show Zero Stock Only:** Checkbox
  - **Search:** Text input for item code/description (debounced)

- **Table (Main content):**  
  - Columns:
    - Item Code (`data-testid="stock-reorder-table-col-itemcode"`)
    - Description
    - Category
    - ReOrder Level
    - Current Stock
    - Unit
    - Warehouse/Location
    - Last Purchase Date
    - Main Supplier
    - Action: "Reorder Now" (if stock is below threshold and user has purchasing role)

- **Actions:**  
  - **Export** as Excel, PDF (`data-testid="stock-reorder-status-export-btn"`)
  - **Print** (`data-testid="stock-reorder-status-print-btn"`)
  - **Reorder Now** (button for items; POSTs reorder action; visible only for authorized users)
  - **Refresh** (`data-testid="stock-reorder-status-refresh-btn"`)

- **Validations:**  
  - Filter fields required for accurate report: Category, Warehouse
  - On "Reorder Now", confirm dialog before triggering action.

- **Loading States:**  
  - Skeleton for filter bar, and row placeholders (animated, respect `prefers-reduced-motion`)

- **API Error State:**  
  - Inline error message above data table; try again & report support link.

- **Empty State:**  
  - Card with icon and message "No items currently require re-ordering." (`data-testid="stock-reorder-status-empty"`)

#### Table Style
- Adheres to design system:  
  - Header row has uppercase text, muted color (`--color-text-secondary`)
  - Data rows 40px height; empty rows auto-shrink
  - Row hover: `background: #3831c40a;`
  - "Reorder Now" is a small primary-inverse button in table cell

#### Interactions
- All filter changes re-fetch and refresh table autosynchronously.
- Export triggers download with active filters applied.
- Print opens modal print preview (glass panel).
- "Reorder Now" prompts a dialog for quantity and confirms with primary button.

#### Accessibility
- All form elements labeled, keyboard focusable
- Table rows focusable with `tabindex=0`, row-level selection for keyboard users

#### Test Identifiers

- `data-testid="stock-reorder-status-title"`
- `data-testid="stock-reorder-status-category-filter"`
- `data-testid="stock-reorder-status-location-filter"`
- `data-testid="stock-reorder-status-supplier-filter"`
- `data-testid="stock-reorder-status-show-zero-checkbox"`
- `data-testid="stock-reorder-status-search"`
- `data-testid="stock-reorder-status-export-btn"`
- `data-testid="stock-reorder-status-print-btn"`
- `data-testid="stock-reorder-status-refresh-btn"`
- `data-testid="stock-reorder-status-table"`
- `data-testid="stock-reorder-status-row-{itemCode}"`
- `data-testid="stock-reorder-status-empty"`
- `data-testid="stock-reorder-status-error"`
- `data-testid="stock-reorder-status-reorder-btn-{itemCode}"`

---

## 302. StockStatement-1

**Route:** `/stock/statement-v1`  
**Purpose:** Generate and display inventory stock statements providing position, movements, and closing for a referenced period.  
**PRD References:** US-202, FR-202  
**Access Roles:** Inventory Manager, Supervisor, Auditor  
**Screen Type:** Full-width report page

### Layout & Structure

- **Header:**  
  - Title (`Stock Statement (Version 1)`, `data-testid="stock-statement1-title"`)
  - Page-level info, e.g. "Stock statement for all items as at {date}"

- **Filters (glass card):**  
  - **Item (optional):** Search/select input (autocomplete; powered by API)
  - **Warehouse/Location:** Select (dropdown)
  - **Period:** Date range picker (`From`, `To`)
  - **Category:** Select
  - **Show Zero Balances:** Checkbox
  - **Run Statement:** Primary button (`data-testid="stock-statement1-run-btn"`)

- **Summary Stats:**  
  - Total number of items, total quantity in stock, total value (where available)

- **Table (Main content):**  
  - Item Code
  - Item Description
  - Opening Balance
  - Stock-In
  - Stock-Out
  - Adjustments
  - Closing Balance
  - UOM
  - Valuation (if available)

- **Actions:**  
  - **Export (Excel/PDF)** (`data-testid="stock-statement1-export-btn"`)
  - **Print** (`data-testid="stock-statement1-print-btn"`)

- **Validations:**  
  - Date range required. Item and category optional.
  - Opening and closing balance always calculated; error if computation fails.

- **Loading State:**  
  - Skeleton bars on filters and shimmer for table

- **Error/Empty States:**  
  - API error: `data-testid="stock-statement1-error"` displays error feedback above filters
  - Empty: message and illustration, "No stock data for selected filters" (`data-testid="stock-statement1-empty"`)

#### Interactions
- "Run Statement" triggers report; all filter fields are auto-persistent on page refresh via URL or local storage.
- Clicking a table row shows an item detail drawer.

#### Test Identifiers

- `data-testid="stock-statement1-title"`
- `data-testid="stock-statement1-item-filter"`
- `data-testid="stock-statement1-location-filter"`
- `data-testid="stock-statement1-date-range"`
- `data-testid="stock-statement1-category-filter"`
- `data-testid="stock-statement1-show-zero-checkbox"`
- `data-testid="stock-statement1-run-btn"`
- `data-testid="stock-statement1-export-btn"`
- `data-testid="stock-statement1-print-btn"`
- `data-testid="stock-statement1-summary"`
- `data-testid="stock-statement1-table"`
- `data-testid="stock-statement1-row-{itemCode}"`
- `data-testid="stock-statement1-empty"`
- `data-testid="stock-statement1-error"`

---

## 303. StockStatement-dd

**Route:** `/stock/statement-date-drill`  
**Purpose:** Stock statement with drill-down or advanced dimension by date; supports reviewing stock by day and period, with date-level movement analysis.  
**PRD References:** US-202, FR-202  
**Access Roles:** Inventory Supervisor, Manager, Auditor  
**Screen Type:** Data report view

### Layout & Structure

- **Header:**  
  - Title (`Stock Statement by Date Drill-Down`, `data-testid="stock-statement-dd-title"`)

- **Filters (top, glass filter card):**  
  - **Date:** Single date picker (`data-testid="stock-statement-dd-date"`)
  - **Item/Category:** Searchable select
  - **Warehouse/Location:** Multi-select
  - **Show Day Movement Only:** Checkbox

- **Table:**  
  - Item Code
  - Description
  - Opening (before date)
  - Stock-In (on date)
  - Stock-Out (on date)
  - Adjustments (on date)
  - Closing (after date)
  - UOM

- **Actions:**  
  - **Export** (`data-testid="stock-statement-dd-export-btn"`)
  - **Print** (`data-testid="stock-statement-dd-print-btn"`)

- **Validation:**  
  - Date required; error if not provided.

- **Empty/Error States:**  
  - Empty: "No stock activity for the selected date"
  - Error: sticky error banner above the filter card

#### Interactions
- Changing the date or filter auto refreshes the table.
- Export/Print are always for current view only.

#### Test Identifiers

- `data-testid="stock-statement-dd-title"`
- `data-testid="stock-statement-dd-date"`
- `data-testid="stock-statement-dd-item-filter"`
- `data-testid="stock-statement-dd-location-filter"`
- `data-testid="stock-statement-dd-day-movement-checkbox"`
- `data-testid="stock-statement-dd-export-btn"`
- `data-testid="stock-statement-dd-print-btn"`
- `data-testid="stock-statement-dd-table"`
- `data-testid="stock-statement-dd-empty"`
- `data-testid="stock-statement-dd-error"`

---

## 304. StockStatement-FromItemFile

**Route:** `/stock/statement-from-itemfile`  
**Purpose:** Stock statement sourced and referenced from the base item file, used for mass reconciliation and importing.  
**PRD References:** US-202, FR-202  
**Access Roles:** Inventory Manager  
**Screen Type:** File-upload assisted report (glass card)

### Layout & Structure

- **Header:**  
  - Title (`Stock Statement — From Item File`, `data-testid="stock-statement-fromitemfile-title"`)
  - Description: Instruction to upload item reference file.

- **File Upload Section:**  
  - **Choose File** button (accept `.xlsx`, `.csv`)
  - File name readout and file removal x-button
  - Validation: File must have item codes as first column, row count 1–5000

- **Parameters:**  
  - Effective Date: Date picker (`data-testid="stock-statement-fromitemfile-date"`)
  - Category (optional): Select
  - Warehouse/Location (optional): Select

- **Run Report:**  
  - Primary button (`data-testid="stock-statement-fromitemfile-run-btn"`)
  - Validates file upload presence and date selection

- **Results Table:**  
  - Item Code, Description, Opening Balance, Stock-In, Stock-Out, Adjustments, Closing, UOM

- **Actions:**  
  - **Export Results** (`data-testid="stock-statement-fromitemfile-export-btn"`)
  - **Print** (`data-testid="stock-statement-fromitemfile-print-btn"`)

- **Loading/Error/Empty:**  
  - Loading shows file shimmer, table skeleton rows
  - Error (file import): clear error message as red text under upload section

- **Empty:**  
  - If file items not found: "None of the provided items were found in inventory."

#### Interactions
- Re-uploading file overwrites previous data and clears table.
- Table rows clickable for item detail overlay.

#### Test Identifiers

- `data-testid="stock-statement-fromitemfile-title"`
- `data-testid="stock-statement-fromitemfile-upload"`
- `data-testid="stock-statement-fromitemfile-upload-remove"`
- `data-testid="stock-statement-fromitemfile-date"`
- `data-testid="stock-statement-fromitemfile-category"`
- `data-testid="stock-statement-fromitemfile-location"`
- `data-testid="stock-statement-fromitemfile-run-btn"`
- `data-testid="stock-statement-fromitemfile-results-table"`
- `data-testid="stock-statement-fromitemfile-empty"`
- `data-testid="stock-statement-fromitemfile-error"`
- `data-testid="stock-statement-fromitemfile-export-btn"`
- `data-testid="stock-statement-fromitemfile-print-btn"`

---

## 305. StockStatement

**Route:** `/stock/statement`  
**Purpose:** Inventory position statement for all or filtered items and dates, with drillable transaction detail.  
**PRD References:** US-202, FR-202  
**Access Roles:** Inventory Supervisor, Inventory Manager  
**Screen Type:** Classic tabular stock statement

### Layout & Structure

- **Header:**  
  - Title (`Stock Statement`, `data-testid="stock-statement-title"`)

- **Filters:**  
  - Date range picker (`From`, `To`)
  - Category
  - Item Code/Description (search)
  - Warehouse/Location
  - Show Only Negative Balances: Checkbox

- **Table:**  
  - Item Code
  - Description
  - Opening Balance
  - Stock-In
  - Stock-Out
  - Adjustments
  - Closing Balance
  - UOM

- **Actions:**  
  - Export as Excel/PDF
  - Print

- **Validations:**  
  - Dates required.
  - If no items match, show empty state.

#### Interactions
- Rows link to `/stock/item/:itemCode/ledger` detail.

#### Test Identifiers

- `data-testid="stock-statement-title"`
- `data-testid="stock-statement-date-range"`
- `data-testid="stock-statement-category"`
- `data-testid="stock-statement-item-search"`
- `data-testid="stock-statement-location"`
- `data-testid="stock-statement-negative-balance-checkbox"`
- `data-testid="stock-statement-export-btn"`
- `data-testid="stock-statement-print-btn"`
- `data-testid="stock-statement-table"`
- `data-testid="stock-statement-row-{itemCode}"`
- `data-testid="stock-statement-empty"`
- `data-testid="stock-statement-error"`

---

## 306. StockStatement1

**Route:** `/stock/statement-alt`  
**Purpose:** Alternate layout for inventory stock statement (high-density or card format as per requirements).  
**PRD References:** US-202, FR-202  
**Access Roles:** Inventory Supervisor, Manager  
**Screen Type:** Compact or alternate presentation

### Layout & Structure

- **Header:**  
  - Title (`Stock Statement (Alternate)`, `data-testid="stock-statement1-title"`)

- **Filters:**  
  - Date range
  - Item/category search
  - Warehouse/Location

- **Table or Cards:**  
  - Columns as above (see 305), or grid of cards for each item with quick stats.

- **Actions:**  
  - Export, Print

- **Interactions:**  
  - Export, Print, row/cell click for more info

#### Test Identifiers

- `data-testid="stock-statement1-title"`
- `data-testid="stock-statement1-date-range"`
- `data-testid="stock-statement1-category"`
- `data-testid="stock-statement1-item-search"`
- `data-testid="stock-statement1-location"`
- `data-testid="stock-statement1-export-btn"`
- `data-testid="stock-statement1-print-btn"`
- `data-testid="stock-statement1-table"`
- `data-testid="stock-statement1-row-{itemCode}"`
- `data-testid="stock-statement1-empty"`
- `data-testid="stock-statement1-error"`

---

## 307. StockValuationReport

**Route:** `/stock/valuation-report`  
**Purpose:** Generate and display the inventory valuation for all items at a selected date, using prescribed valuation methods.  
**PRD References:** US-158, FR-203  
**Access Roles:** Inventory Manager, Finance Team, Auditor  
**Screen Type:** Critical report for accounting

### Layout & Structure

- **Header:**  
  - Title (`Stock Valuation Report`, `data-testid="stock-valuation-title"`)
  - Valuation method(s) picker:  
    - FIFO, Weighted Average, Last Purchase

- **Filters:**  
  - Date (required, date picker)
  - Item category (optional)
  - Warehouse/Location
  - Show Zero Stock Only: Checkbox

- **Summary Stats:**  
  - Total value, item count
  - Breakdown by category (bar chart at top)

- **Table:**  
  - Item Code
  - Description
  - Category
  - Quantity
  - Unit Price
  - Total Value
  - Warehouse/Location
  - Last Transaction Date

- **Actions:**  
  - Export as Excel/PDF (with chosen valuation method and all filters)
  - Print

- **Validations:**  
  - Date required. Show error if blank.

#### Interactions
- All filters and method changes auto update report.
- Table implements sticky header so totals are always visible.

- **Loading/Empty/Error:**  
  - Skeleton across stats and table.  
  - Empty: "No items in stock for selected filters."  
  - Error banner with details + retry.

#### Test Identifiers

- `data-testid="stock-valuation-title"`
- `data-testid="stock-valuation-date"`
- `data-testid="stock-valuation-method"`
- `data-testid="stock-valuation-category"`
- `data-testid="stock-valuation-location"`
- `data-testid="stock-valuation-zero-checkbox"`
- `data-testid="stock-valuation-export-btn"`
- `data-testid="stock-valuation-print-btn"`
- `data-testid="stock-valuation-summary"`
- `data-testid="stock-valuation-table"`
- `data-testid="stock-valuation-row-{itemCode}"`
- `data-testid="stock-valuation-empty"`
- `data-testid="stock-valuation-error"`

---

## 308. StockValuationSummaryReport

**Route:** `/stock/valuation-summary`  
**Purpose:** Summarized stock valuation report — category or warehouse totals, trends, high level only  
**PRD References:** US-158, FR-203  
**Access Roles:** Inventory Manager, Auditor  
**Screen Type:** Dashboard report

### Layout & Structure

- **Header:**  
  - Title (`Stock Valuation Summary Report`, `data-testid="stock-valuation-summary-title"`)

- **Filters:**  
  - Date (required)
  - Category
  - Warehouse/Location

- **Summary:**  
  - Tiles for total value per category, per warehouse, grand total

- **Table:**  
  - Category | Total Value | Warehouse | No. of Items | Last Updated

- **Actions:**  
  - Export (Excel/PDF), Print

- **Interactions:**  
  - Clicking category or warehouse cell navigates to filtered detail report.

#### Test Identifiers

- `data-testid="stock-valuation-summary-title"`
- `data-testid="stock-valuation-summary-date"`
- `data-testid="stock-valuation-summary-category"`
- `data-testid="stock-valuation-summary-location"`
- `data-testid="stock-valuation-summary-export-btn"`
- `data-testid="stock-valuation-summary-print-btn"`
- `data-testid="stock-valuation-summary-table"`
- `data-testid="stock-valuation-summary-row-{category}-{warehouse}"`
- `data-testid="stock-valuation-summary-empty"`
- `data-testid="stock-valuation-summary-error"`

---

## 309. SupplierAgeWiseSummary-Foreign-old

**Route:** `/suppliers/agewise-foreign-old`  
**Purpose:** Historical supplier age-wise outstanding summary for foreign suppliers.  
**PRD References:** US-60, US-273  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Historical report

### Layout & Structure

- **Header:**  
  - Title (`Supplier Age Wise Summary (Foreign - Historical)`, `data-testid="suppliers-agewise-foreign-old-title"`)

- **Filters:**  
  - As of date (date picker)
  - Age Buckets: 0–30, 31–60, 61–90, >90
  - Currency (if multi-currency)
  - Supplier (select)

- **Table:**  
  - Supplier Code/Name
  - Age 0–30
  - Age 31–60
  - Age 61–90
  - Age >90
  - Total Outstanding

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-agewise-foreign-old-title"`
- `data-testid="suppliers-agewise-foreign-old-date"`
- `data-testid="suppliers-agewise-foreign-old-supplier"`
- `data-testid="suppliers-agewise-foreign-old-export-btn"`
- `data-testid="suppliers-agewise-foreign-old-print-btn"`
- `data-testid="suppliers-agewise-foreign-old-table"`
- `data-testid="suppliers-agewise-foreign-old-empty"`
- `data-testid="suppliers-agewise-foreign-old-error"`

---

## 310. SupplierAgeWiseSummary-Foreign

**Route:** `/suppliers/agewise-foreign`  
**Purpose:** Age-wise summary of outstanding balances for all foreign suppliers (current).  
**PRD References:** US-60, US-273, FR-273  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Age analysis report

### Layout & Structure

- **Header:**  
  - Title (`Supplier Age Wise Summary (Foreign)`, `data-testid="suppliers-agewise-foreign-title"`)

- **Filters:**  
  - As of date (date picker)
  - Age interval buckets (select)
  - Currency
  - Supplier Group/Name

- **Table:**  
  - Supplier (code/name)
  - Balance Current
  - 1–30
  - 31–60
  - 61–90
  - >90
  - Total

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-agewise-foreign-title"`
- `data-testid="suppliers-agewise-foreign-date"`
- `data-testid="suppliers-agewise-foreign-supplier"`
- `data-testid="suppliers-agewise-foreign-export-btn"`
- `data-testid="suppliers-agewise-foreign-print-btn"`
- `data-testid="suppliers-agewise-foreign-table"`
- `data-testid="suppliers-agewise-foreign-empty"`
- `data-testid="suppliers-agewise-foreign-error"`

---

## 311. SupplierAgeWiseSummary-Local-old

**Route:** `/suppliers/agewise-local-old`  
**Purpose:** Historical local supplier age-wise summary (archived/outdated entries).  
**PRD References:** US-60, US-273  
**Access Roles:** Administrator  
**Screen Type:** Historical reporting

### Layout & Structure

- **Header:**  
  - Title (`Supplier Age Wise Summary (Local - Historical)`, `data-testid="suppliers-agewise-local-old-title"`)

- **Filters:**  
  - As of date (date picker)
  - Age Buckets  
  - Supplier selector

- **Table:**  
  - Supplier Name/Code
  - Age bucket columns (as above)
  - Total

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-agewise-local-old-title"`
- `data-testid="suppliers-agewise-local-old-date"`
- `data-testid="suppliers-agewise-local-old-supplier"`
- `data-testid="suppliers-agewise-local-old-export-btn"`
- `data-testid="suppliers-agewise-local-old-print-btn"`
- `data-testid="suppliers-agewise-local-old-table"`
- `data-testid="suppliers-agewise-local-old-empty"`
- `data-testid="suppliers-agewise-local-old-error"`

---

## 312. SupplierAgeWiseSummary-Local

**Route:** `/suppliers/agewise-local`  
**Purpose:** Age-wise outstanding report for all local suppliers (current).  
**PRD References:** US-60, FR-273  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Age analysis

### Layout & Structure

- **Header:**  
  - Title (`Supplier Age Wise Summary (Local)`, `data-testid="suppliers-agewise-local-title"`)

- **Filters:**  
  - As of date, Bucket size (e.g. 30/60/90 days), Supplier group

- **Table:**  
  - Supplier code/name
  - Balance Current
  - 1–30
  - 31–60
  - 61–90
  - >90
  - Total

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-agewise-local-title"`
- `data-testid="suppliers-agewise-local-date"`
- `data-testid="suppliers-agewise-local-supplier"`
- `data-testid="suppliers-agewise-local-export-btn"`
- `data-testid="suppliers-agewise-local-print-btn"`
- `data-testid="suppliers-agewise-local-table"`
- `data-testid="suppliers-agewise-local-empty"`
- `data-testid="suppliers-agewise-local-error"`

---

## 313. SupplierAgeWiseSummary

**Route:** `/suppliers/agewise-summary`  
**Purpose:** Aggregate and compare all suppliers (foreign + local), display outstanding by age for each.  
**PRD References:** US-60, US-273  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Combined age summary

### Layout & Structure

- **Header:**  
  - Title (`Supplier Age Wise Summary (All)`, `data-testid="suppliers-agewise-summary-title"`)

- **Filters:**  
  - As of date
  - Supplier type (Local/Foreign/All)
  - Group/Bucket

- **Summary Stats:**  
  - Tiles for Each Group: Total Outstanding, Oldest Invoice, Suppliers with >60d aged balance

- **Table:**  
  - Supplier Name
  - Type (Local/Foreign)
  - Age buckets (Current, 1–30, 31–60, 61–90, >90)
  - Total

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-agewise-summary-title"`
- `data-testid="suppliers-agewise-summary-date"`
- `data-testid="suppliers-agewise-summary-type"`
- `data-testid="suppliers-agewise-summary-export-btn"`
- `data-testid="suppliers-agewise-summary-print-btn"`
- `data-testid="suppliers-agewise-summary-table"`
- `data-testid="suppliers-agewise-summary-empty"`
- `data-testid="suppliers-agewise-summary-error"`

---

## 314. SupplierBillWisePending-Both

**Route:** `/suppliers/billwise-pending/both`  
**Purpose:** List and overview all pending bills (both local and foreign) for suppliers.  
**PRD References:** US-145  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Pending bills report

### Layout & Structure

- **Header:**  
  - Title (`Supplier Pending Bills (Local & Foreign)`, `data-testid="suppliers-billwise-pending-both-title"`)

- **Filters:**  
  - Supplier type (dropdown)
  - Invoice/Purchase Order date (range)
  - Supplier

- **Table:**  
  - Supplier Name/Code
  - Bill No
  - Bill/Purchase Date
  - Amount
  - Currency
  - Days Outstanding
  - Bill Type (Local/Foreign)
  - Action (Link to pay/settle if permitted)

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-billwise-pending-both-title"`
- `data-testid="suppliers-billwise-pending-both-supplier-type"`
- `data-testid="suppliers-billwise-pending-both-date-range"`
- `data-testid="suppliers-billwise-pending-both-supplier"`
- `data-testid="suppliers-billwise-pending-both-export-btn"`
- `data-testid="suppliers-billwise-pending-both-print-btn"`
- `data-testid="suppliers-billwise-pending-both-table"`
- `data-testid="suppliers-billwise-pending-both-row-{supplier}-{billNo}"`
- `data-testid="suppliers-billwise-pending-both-empty"`
- `data-testid="suppliers-billwise-pending-both-error"`

---

## 315. SupplierBillWisePending-Foreign-old

**Route:** `/suppliers/billwise-pending/foreign-old`  
**Purpose:** List of old/historical pending bills for foreign suppliers.  
**PRD References:** US-145  
**Access Roles:** Administrator  
**Screen Type:** Legacy pending bills report

### Layout & Structure

- **Header:**  
  - Title (`Pending Supplier Bills — Foreign (Old)`, `data-testid="suppliers-billwise-pending-foreignold-title"`)

- **Filters:**  
  - Supplier, Date range, Bill No

- **Table:**  
  - Same as #314, but from the legacy/historical record set.

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-billwise-pending-foreignold-title"`
- `data-testid="suppliers-billwise-pending-foreignold-table"`
- `data-testid="suppliers-billwise-pending-foreignold-row-{supplier}-{billNo}"`
- `data-testid="suppliers-billwise-pending-foreignold-export-btn"`
- `data-testid="suppliers-billwise-pending-foreignold-print-btn"`
- `data-testid="suppliers-billwise-pending-foreignold-empty"`
- `data-testid="suppliers-billwise-pending-foreignold-error"`

---

## 316. SupplierBillWisePending-Foreign

**Route:** `/suppliers/billwise-pending/foreign`  
**Purpose:** List of all pending supplier bills for foreign suppliers (active).  
**PRD References:** US-145  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Bill-level pending report

### Layout & Structure

- **Header:**  
  - Title (`Pending Supplier Bills — Foreign`, `data-testid="suppliers-billwise-pending-foreign-title"`)

- **Filters:**  
  - Supplier, Date range, Currency

- **Table:**  
  - Supplier name
  - Bill number
  - Date
  - Amount
  - Currency
  - Days due
  - Action

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-billwise-pending-foreign-title"`
- `data-testid="suppliers-billwise-pending-foreign-table"`
- `data-testid="suppliers-billwise-pending-foreign-row-{supplier}-{billNo}"`
- `data-testid="suppliers-billwise-pending-foreign-export-btn"`
- `data-testid="suppliers-billwise-pending-foreign-print-btn"`
- `data-testid="suppliers-billwise-pending-foreign-empty"`
- `data-testid="suppliers-billwise-pending-foreign-error"`

---

## 317. SupplierBillWisePending-local

**Route:** `/suppliers/billwise-pending/local`  
**Purpose:** List all pending bills for local suppliers (active records).  
**PRD References:** US-145  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Pending bills

### Layout & Structure

- **Header:**  
  - Title (`Pending Supplier Bills — Local`, `data-testid="suppliers-billwise-pending-local-title"`)

- **Filters:**  
  - Supplier, Date range

- **Table:**  
  - Supplier
  - Bill No
  - Date
  - Amount
  - Currency
  - Days due

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-billwise-pending-local-title"`
- `data-testid="suppliers-billwise-pending-local-table"`
- `data-testid="suppliers-billwise-pending-local-row-{supplier}-{billNo}"`
- `data-testid="suppliers-billwise-pending-local-export-btn"`
- `data-testid="suppliers-billwise-pending-local-print-btn"`
- `data-testid="suppliers-billwise-pending-local-empty"`
- `data-testid="suppliers-billwise-pending-local-error"`

---

## 318. SupplierBillWisePending

**Route:** `/suppliers/billwise-pending`  
**Purpose:** Combined/all supplier pending bills (all types, consolidated)  
**PRD References:** US-145  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Unified pending bills report

### Layout & Structure

- **Header:**  
  - Title (`Pending Supplier Bills (All Types)`, `data-testid="suppliers-billwise-pending-title"`)

- **Filters:**  
  - Supplier type, Supplier, Date range

- **Table:**  
  - Supplier
  - Bill No
  - Date
  - Amount
  - Currency
  - Days due
  - Bill Type

- **Actions:**  
  - Export, Print

#### Test Identifiers

- `data-testid="suppliers-billwise-pending-title"`
- `data-testid="suppliers-billwise-pending-table"`
- `data-testid="suppliers-billwise-pending-row-{supplier}-{billNo}"`
- `data-testid="suppliers-billwise-pending-export-btn"`
- `data-testid="suppliers-billwise-pending-print-btn"`
- `data-testid="suppliers-billwise-pending-empty"`
- `data-testid="suppliers-billwise-pending-error"`

---

## 319. SupplierList

**Route:** `/suppliers/list`  
**Purpose:** List and search all suppliers, current and historical, with options for actions and reports.  
**PRD References:** US-51, US-52, US-69, FR-56, FR-61  
**Access Roles:** Standard User, Supervisor, Administrator  
**Screen Type:** Data management list page

### Layout & Structure

- **Header:**  
  - Title (`Supplier List`, `data-testid="supplier-list-title"`)
  - Description

- **Search/Filters:**  
  - Supplier name/code (search box; autocomplete)
  - Category/Type
  - Status (active/inactive)
  - Area (dropdown, optional geolocation)
  - Date Created (date range)

- **Table:**  
  - Supplier Code
  - Supplier Name
  - Category
  - Area
  - Country/Local/Foreign
  - Status (Active/Inactive)
  - Contact Person
  - Phone
  - Email
  - Date Created
  - Actions: View, Edit, Deactivate/Reactivate (actions depend on role)

- **Actions:**  
  - Add Supplier (if permitted)
  - Export, Print

#### Interactions

- Clicking a row opens detail drawer
- Inline action icons as outline per design system
- Table paginates at 20/50/100 rows; all actions tagged with data-testid

#### Validations

- All user search fields have "no match found" helper text below when empty result
- Deactivation and reactivation confirmation dialogs
- Autocomplete search debounced

#### Error/Empty States

- Error: sticky banner at top of card; "Failed to load supplier list. [Retry link]"
- Empty: illustration "No suppliers found for the selected search filters."

#### Test Identifiers

- `data-testid="supplier-list-title"`
- `data-testid="supplier-list-search-input"`
- `data-testid="supplier-list-category-filter"`
- `data-testid="supplier-list-status-filter"`
- `data-testid="supplier-list-area-filter"`
- `data-testid="supplier-list-date-created-filter"`
- `data-testid="supplier-list-add-btn"`
- `data-testid="supplier-list-export-btn"`
- `data-testid="supplier-list-print-btn"`
- `data-testid="supplier-list-table"`
- `data-testid="supplier-list-row-{supplierCode}"`
- `data-testid="supplier-list-detail-drawer"`
- `data-testid="supplier-list-empty"`
- `data-testid="supplier-list-error"`
- `data-testid="supplier-list-deactivate-btn-{supplierCode}"`
- `data-testid="supplier-list-reactivate-btn-{supplierCode}"`
- `data-testid="supplier-list-edit-btn-{supplierCode}"`
- `data-testid="supplier-list-view-btn-{supplierCode}"`

---

## 320. SupplierOutstandingSummary

**Route:** `/suppliers/outstanding-summary`  
**Purpose:** Summarize all current outstanding balances for suppliers, with paid amount, ledger balance, and bill balance breakdowns.  
**PRD References:** FR-145  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Financial summary

### Layout & Structure

- **Header:**  
  - Title (`Supplier Outstanding Summary`, `data-testid="suppliers-outstanding-summary-title"`)

- **Filters:**
  - Supplier name/code search
  - Area
  - Show only outstanding >0: Checkbox

- **Table:**
  - Supplier Code
  - Supplier Name
  - Area
  - Phone
  - Ledger Credit
  - Ledger Debit
  - Ledger Balance
  - Paid Amount
  - Bill Balance

- **Actions:**  
  - Export, Print

- **Interactions:**  
  - Clicking a supplier row shows bill and payment history

#### Test Identifiers

- `data-testid="suppliers-outstanding-summary-title"`
- `data-testid="suppliers-outstanding-summary-name-filter"`
- `data-testid="suppliers-outstanding-summary-area-filter"`
- `data-testid="suppliers-outstanding-summary-only-outstanding-checkbox"`
- `data-testid="suppliers-outstanding-summary-export-btn"`
- `data-testid="suppliers-outstanding-summary-print-btn"`
- `data-testid="suppliers-outstanding-summary-table"`
- `data-testid="suppliers-outstanding-summary-row-{supplierCode}"`
- `data-testid="suppliers-outstanding-summary-detail-drawer"`
- `data-testid="suppliers-outstanding-summary-empty"`
- `data-testid="suppliers-outstanding-summary-error"`

---

## 321. TechnicianEfficency

**Route:** `/technicians/efficiency`  
**Purpose:** Report and analyze technician efficiency — jobs completed vs. time, target vs. actual efficiency percentage.  
**PRD References:** US-107  
**Access Roles:** Supervisor  
**Screen Type:** Performance dashboard

### Layout & Structure

- **Header:**  
  - Title (`Technician Efficiency`, `data-testid="technician-efficiency-title"`)

- **Filters:**
  - Technician (dropdown list, multi-select supported)
  - Date range
  - Department/Section

- **Summary Stats:**
  - Average efficiency
  - Best/worst performer tiles
  - Total jobs completed

- **Table:**
  - Technician Name
  - Employee ID
  - Jobs Completed
  - Hours Worked
  - Efficiency % (computed)
  - Target Efficiency %
  - Over/Under Target

- **Actions:**  
  - Export, Print, View Technician Details

- **Interactions:**  
  - Table row click → opens technician detailed efficiency modal (job log)

#### Test Identifiers

- `data-testid="technician-efficiency-title"`
- `data-testid="technician-efficiency-technician-filter"`
- `data-testid="technician-efficiency-date-range"`
- `data-testid="technician-efficiency-department-filter"`
- `data-testid="technician-efficiency-export-btn"`
- `data-testid="technician-efficiency-print-btn"`
- `data-testid="technician-efficiency-table"`
- `data-testid="technician-efficiency-row-{employeeId}"`
- `data-testid="technician-efficiency-detail-modal"`
- `data-testid="technician-efficiency-empty"`
- `data-testid="technician-efficiency-error"`

---

## 322. test

**Route:** `/reports/test`  
**Purpose:** Utility/diagnostic test report screen (used for ad-hoc SQL/diagnostic views — NOT production).  
**PRD References:** (development only; not end-user feature)  
**Access Roles:** Administrator  
**Screen Type:** Raw report/testing

### Layout & Structure

- **Header:**  
  - Title (`Test Report / Diagnostics`, `data-testid="reports-test-title"`)

- **Adhoc SQL Query Input:**  
  - Multi-line code input for validated admins only (run disabled for all others)

- **Run Query:**  
  - Primary button; on click, runs query to backend limited safe SP; result in table

- **Table:**
  - Dynamic columns, depends on query

- **Export/Print**

- **Error State:**
  - If error, show inline beneath code area

#### Test Identifiers

- `data-testid="reports-test-title"`
- `data-testid="reports-test-input"`
- `data-testid="reports-test-run-btn"`
- `data-testid="reports-test-table"`
- `data-testid="reports-test-error"`

---

## 323. TotalSalesReport

**Route:** `/sales/total-report`  
**Purpose:** Generate and display a comprehensive summary of all sales for a given period, viewable by customer/product/region as required.  
**PRD References:** US-283, US-284  
**Access Roles:** Supervisor, Administrator  
**Screen Type:** Full report

### Layout & Structure

- **Header:**  
  - Title (`Total Sales Report`, `data-testid="total-sales-report-title"`)

- **Filters:**  
  - Date range (required)
  - Customer/region (optional)
  - Product/category (optional)
  - Sales Team

- **Summary Tiles:**  
  - Total sales value, Bill count, Avg order size, Top customers

- **Table:**  
  - Invoice/Bill No
  - Date
  - Customer
  - Product/Category
  - Salesperson
  - Total Amount
  - Status (Paid, Unpaid)

- **Actions:**  
  - Export, Print

- **Drilldown:**  
  - Clicking a bill row brings up sale detail modal

#### Test Identifiers

- `data-testid="total-sales-report-title"`
- `data-testid="total-sales-report-date-range"`
- `data-testid="total-sales-report-customer-filter"`
- `data-testid="total-sales-report-category-filter"`
- `data-testid="total-sales-report-team-filter"`
- `data-testid="total-sales-report-export-btn"`
- `data-testid="total-sales-report-print-btn"`
- `data-testid="total-sales-report-table"`
- `data-testid="total-sales-report-row-{billNo}"`
- `data-testid="total-sales-report-detail-modal"`
- `data-testid="total-sales-report-empty"`
- `data-testid="total-sales-report-error"`

---

## 324. TrialBalance-test

**Route:** `/accounts/trialbalance-test`  
**Purpose:** Alternate or diagnostic/trial variant of the standard Trial Balance report, for reconciliation, QA, or audit.  
**PRD References:** (audit/testing only)  
**Access Roles:** Administrator, Auditor  
**Screen Type:** Test report

### Layout & Structure

- **Header:**  
  - Title (`Trial Balance (Test Variant)`, `data-testid="trialbalance-test-title"`)

- **Filters:**  
  - Date range
  - Account group/ledger

- **Table:**  
  - Account Code
  - Account Description
  - Debits
  - Credits
  - Closing Balance

- **Actions:**  
  - Export, Print

- **Error:**  
  - Sum of debits = credits validation; if not, banner warning (`data-testid="trialbalance-test-balance-warning"`)

#### Test Identifiers

- `data-testid="trialbalance-test-title"`
- `data-testid="trialbalance-test-date-range"`
- `data-testid="trialbalance-test-group-filter"`
- `data-testid="trialbalance-test-export-btn"`
- `data-testid="trialbalance-test-print-btn"`
- `data-testid="trialbalance-test-table"`
- `data-testid="trialbalance-test-row-{accountCode}"`
- `data-testid="trialbalance-test-empty"`
- `data-testid="trialbalance-test-error"`
- `data-testid="trialbalance-test-balance-warning"`

---

## 325. TrialBalance-test111

**Route:** `/accounts/trialbalance-test-111`  
**Purpose:** Parallel to 324 — alternative layout, test, or extended columns for advanced check/audit.  
**PRD References:** (audit/diagnostic only)  
**Access Roles:** Administrator, Auditor  
**Screen Type:** Audit test report

### Layout & Structure

- **Header:**  
  - Title (`Trial Balance (Test 111)`, `data-testid="trialbalance-test111-title"`)

- **Filters:**  
  - Date range
  - Account group

- **Table:**  
  - Account Code/Name
  - Opening Balance
  - Debits
  - Credits
  - Closing

- **Actions:**  
  - Export, Print

- **Error:**  
  - Any mismatch, discrepancy note shown above table

#### Test Identifiers

- `data-testid="trialbalance-test111-title"`
- `data-testid="trialbalance-test111-date-range"`
- `data-testid="trialbalance-test111-group-filter"`
- `data-testid="trialbalance-test111-export-btn"`
- `data-testid="trialbalance-test111-print-btn"`
- `data-testid="trialbalance-test111-table"`
- `data-testid="trialbalance-test111-row-{accountCode}"`
- `data-testid="trialbalance-test111-empty"`
- `data-testid="trialbalance-test111-error"`
- `data-testid="trialbalance-test111-discrepancy"`

---

## COVERAGE CHECK

| Screen Name                               | Status   |
|--------------------------------------------|----------|
| StockRe-OrderStatus                       | ✅ covered |
| StockStatement-1                          | ✅ covered |
| StockStatement-dd                         | ✅ covered |
| StockStatement-FromItemFile               | ✅ covered |
| StockStatement                            | ✅ covered |
| StockStatement1                           | ✅ covered |
| StockValuationReport                      | ✅ covered |
| StockValuationSummaryReport               | ✅ covered |
| SupplierAgeWiseSummary-Foreign-old        | ✅ covered |
| SupplierAgeWiseSummary-Foreign            | ✅ covered |
| SupplierAgeWiseSummary-Local-old          | ✅ covered |
| SupplierAgeWiseSummary-Local              | ✅ covered |
| SupplierAgeWiseSummary                    | ✅ covered |
| SupplierBillWisePending-Both              | ✅ covered |
| SupplierBillWisePending-Foreign-old       | ✅ covered |
| SupplierBillWisePending-Foreign           | ✅ covered |
| SupplierBillWisePending-local             | ✅ covered |
| SupplierBillWisePending                   | ✅ covered |
| SupplierList                              | ✅ covered |
| SupplierOutstandingSummary                | ✅ covered |
| TechnicianEfficency                       | ✅ covered |
| test                                      | ✅ covered |
| TotalSalesReport                          | ✅ covered |
| TrialBalance-test                         | ✅ covered |
| TrialBalance-test111                      | ✅ covered |

---

# FRONTEND_SPEC.md  
**(Part 14 of 14)**

---

## 326. TrialBalanceSummary

### Route
`/finance/reports/trial-balance-summary`

### Purpose
View a summarized trial balance by account/group for a given date range or period, with totals, exports, and PRD-compliant reporting.

### PRD Reference
FR-333, FR-334, FR-329  
User Stories: US-210, US-271, US-275, US-279, US-292

### Access Roles
- Supervisor (full)
- Administrator (full)

---

### Layout

- **Glass main container** (`glass-main-container`)
- Title: "Trial Balance Summary"
- Date range filter card (left-aligned, sticky at top)
- Table panel for summary results, with export and print options
- Section for filter summary/meta
- Loupe/search bar for quick account filtering

---

### Fields & UI Components

#### Filter Panel
- **Date Range**
  - Label: "Reporting Period *"
  - [DatePicker: Start Date] `trialbalance-summary-date-from`
  - [DatePicker: End Date] `trialbalance-summary-date-to`
  - Validation: Both required. If 'from' is after 'to':  
    Error: "Start date must be before or same as end date."
- **Account Group** (optional dropdown)
  - Label: "Account Group"
  - [Select: All / list fetched from `/api/v1/accounts/groups`]  
  - Placeholder: "All Groups"

- **Generate Button (primary)**
  - Label: "Generate Summary"
  - `data-testid='trialbalance-summary-generate'`
  - Only one visible primary button

#### Table Columns
- Account Code
- Account Name
- Opening Balance  
- Period Debits  
- Period Credits  
- Closing Balance  
- [If grouped:] Group Name
- Drilldown:  
  - Row click → navigate to account ledger drilldown (opens `/finance/ledgers/:accountCode?from=X&to=Y`)
- All column headers use uppercase, `text-xs` styling as in design system

#### Actions  
- **Export**
  - Label: "Export"
  - Menu: PDF / Excel / CSV
  - `data-testid='trialbalance-summary-export'`
- **Print**
  - Label: "Print"
  - `data-testid='trialbalance-summary-print'`
- **Refresh**
  - Icon button ("Reload")
  - `data-testid='trialbalance-summary-refresh'`
- **Drilldown**
  - Each row clickable; aria label: "View account ledger detail for {accountName}"

#### Validation & Error Messages
- Show contextual errors under filter panel, not in toast only
- Error when API returns no data: "No results found for the selected period."
- Error if export fails: "Could not export summary — please try again."

#### Loading/Skeleton
- Filter panel: gray animated skeleton for inputs and generate button  
- Table: 8 row shimmer with column placeholders
- Disable export/print during loading

#### Empty State
- Large infobox: "No accounts found for this period or criteria. Try changing filters."
- Icon: Outline-style table icon

#### API Error State
- Red border card at top: error message
- Retry link: "Try again"

---

#### Test Identifiers

| data-testid                                           | Purpose                              |
|-------------------------------------------------------|--------------------------------------|
| trialbalance-summary-generate                         | Trigger summary query                |
| trialbalance-summary-export                           | Export dropdown                      |
| trialbalance-summary-print                            | Print table                          |
| trialbalance-summary-refresh                          | Re-run summary with latest data      |
| trialbalance-summary-table-row-[account-code]         | Each row, for selection/drilldown    |
| trialbalance-summary-empty-state                      | Empty result state                   |
| trialbalance-summary-error                            | API/server error display             |

---

## 327. UsedCars

### Route
`/inventory/used-cars`

### Purpose
View the list of used cars in inventory, inspect details, mark status, and export/print reporting.

### PRD Reference
FR-293, FR-329  
User Stories: US-293 (stock statements), US-283 (sales analysis)

### Access Roles
- Supervisor (full)
- Administrator (full)

---

### Layout

- Glass card layout (`glass-main-container`)
- Title: "Used Cars — Inventory"
- Filter/search bar pinned at top
- Main data table below
- Details drawer/modal for expanded car info

---

### Fields & UI Components

#### Filter Panel
- **Car ID/Code**:  
  - Label: "Car ID"
  - [Input text], Placeholder: "e.g. UC-0412"
- **Make/Model**:  
  - Label: "Make/Model"
  - [Input text], Placeholder: "Toyota, Honda..."
- **Status**:  
  - Label: "Status"
  - [Select: All, Available, Reserved, Sold]
- **Sale Date range**:  
  - Label: "Sold Between"
  - [Start Date, End Date]
- **Search/Filter Button**  
  - `usedcars-filters-apply`

#### Table Columns
- Car ID
- Make / Model
- Year
- Status (colored badge: Available/Reserved/Sold)
- Current Price (right aligned)
- Purchase Date
- Sale Date
- Actions:
  - [Inspect/View button]: opens detail drawer (icon: "eye" outline)
  - [Export row button]: exports record

#### Actions
- **Export All Table** (PDF/Excel/CSV)
  - `usedcars-table-export`
- **Print**
  - `usedcars-table-print`
- **Inspect Row**
  - `usedcars-table-view-[car-id]` (opens side drawer/modal)

#### Edit/Update Actions (if allowed by permissions)
- Mark as Sold:  
  - Confirm modal: "Are you sure you want to mark {CarID} as Sold?"
  - Require sale price and sold date.

#### Validation/Error Messaging
- All filters required for "Sold Between" use; error if start > end
  - "Start date must be before end date"
- Mark as Sold: price = required, decimal, >0; date = required, cannot be in future

#### Loading/Skeleton
- Filter bar shimmer on load
- Table: 10 row animated skeleton

#### Empty State
- Card: "No used cars match your filters. Adjust search."
- No 'empty screen' design — always background visible

#### API Error State
- Error banner: "Could not fetch used cars data. Please try again."

---

#### Test Identifiers

| data-testid                               | Purpose                      |
|-------------------------------------------|------------------------------|
| usedcars-filters-apply                    | Apply table filters          |
| usedcars-table-row-[car-id]               | Table row                    |
| usedcars-table-view-[car-id]              | Inspect row action           |
| usedcars-table-mark-sold-[car-id]         | Action: Mark as sold         |
| usedcars-table-export                     | Export all                   |
| usedcars-table-print                      | Print table                  |
| usedcars-table-error                      | Server/API error notice      |
| usedcars-table-empty-state                | No cars match filter         |

---

## 328. UserLogReport

### Route
`/admin/audit/user-log-report`

### Purpose
Audit trailing of user login activity, password changes, authentication-related actions, with filtering and export.

### PRD Reference
FR-12, FR-14, FR-19, FR-35, FR-44, FR-298, BR-07

### Access Roles
- Administrator (full)
- Supervisor (read)

---

### Layout

- Header: "User Log Report" (h1)
- Filters drawer at top: date, user, action type
- Table panel pinned below filter
- Export button set and print

---

### Fields & UI Components

#### Filter Bar
- **User**
  - Label: "User"
  - [Select: Dropdown of all users, fetched from /api/v1/users]
- **Event Type**
  - Label: "Action Type"
  - [Multi-select: Login / Logout / Failed login / Password Change / Password Reset / Lockout / Unlock]
- **Date Range**
  - Label: "Activity Period"
  - [Start date, End date]
  - Validation: start required if end is provided; start <= end enforced

- **Apply Filters**  
  - Primary button; `userlogreport-filters-apply`
- **Export**
  - Three-icon split-button: PDF, Excel, CSV  
  - `userlogreport-export`
- **Print**
  - `userlogreport-print`

#### Table Columns
- Date/Time
- User Name (right-aligned avatar + name)
- Action Type (badge: color-coded per event)
- Status (Success/Failure/Locked/Unlocked)
- Details (e.g., device, IP)
- Comments (for unlocks/lockouts)
- Machine Name (as available)
- IP Address

- Actions:
  - [Row click] for expanded event detail/metadata

#### Validation/Error Messaging
- Filter required: At least one filter must be set.
- If no records: "No user log events found matching criteria."
- If export error: "Export failed — please retry."

#### Loading/Skeleton
- Filter skeleton and table shimmer (8-row min)

#### Empty State
- Info card: "No user authentication actions logged in this period."

#### API Error State
- Error banner top-of-table: error, retry link

---

#### Test Identifiers

| data-testid                          | Purpose                |
|--------------------------------------|------------------------|
| userlogreport-filters-apply          | Apply filter action    |
| userlogreport-table-row-[log-id]     | Table row event log    |
| userlogreport-export                 | Export dropdown/button |
| userlogreport-print                  | Print button           |
| userlogreport-error                  | Error panel            |
| userlogreport-empty-state            | No log events match    |

---

## 329. VehicleAttendanceList

### Route
`/inventory/vehicles/attendance-list`

### Purpose
Track arrivals/departures (attendance) of vehicles for usage, fulfillment, or security audit.

### PRD Reference
FR-294; US-294, FR-337, US-329

### Access Roles
- Supervisor (full access)
- Administrator (full access)

---

### Layout

- Card: glass design
- Title "Vehicle Attendance List"
- Filters pinned: vehicle id, range, type
- Results as table with expandable row details

---

### Fields & UI Components

#### Filter Section
- **Vehicle ID**
  - Label: "Vehicle"
  - [Autocomplete input: ID, registration, make/model]
- **Date Range**
  - Label: "Attendance Period"
  - [Start Date / End Date]
- **Type**
  - Label: "Attendance Type"
  - [Select: All, Arrival, Departure]
- **Apply Filters**
  - `vehicleattendance-filters-apply`
 
#### Table Columns
- Vehicle ID / Registration
- Make/Model
- Attendance Type (Arrival/Departure, badge-coded)
- Date/Time
- Recorded By (user name/avatar)
- Location
- Comments/Notes

- Row Expander: Shows detail—linked job/order info, driver, security check/clearance if present.

#### Actions
- Print table
  - `vehicleattendance-print`
- Export table (Excel/PDF)
  - `vehicleattendance-export`
- Manual Add Attendance (if permitted, admin only) — primary button, dialog for: type, vehicle, date/time, notes

#### Validation/Error Messaging
- Show error if date range invalid: "Start must be on or before end."
- Manual add: all fields required except notes; error if missing.

#### Loading/Skeleton
- Filter shimmer (input, select, buttons)
- Table: at least 7 row shimmer

#### Empty State
- Card: "No vehicle attendance logged. Change search or try a new range."

#### API Error State
- Red banner above table: error, retry link

---

#### Test Identifiers

| data-testid                             | Purpose              |
|-----------------------------------------|----------------------|
| vehicleattendance-filters-apply         | Apply filter button  |
| vehicleattendance-table-row-[att-id]    | Table row, event     |
| vehicleattendance-table-expand-[att-id] | Row expansion        |
| vehicleattendance-print                 | Print table          |
| vehicleattendance-export                | Export menu          |
| vehicleattendance-empty-state           | Blank/empty table    |
| vehicleattendance-error                 | Error message        |
| vehicleattendance-add-attendance        | Manual add button    |

---

## 330. VoucherList

### Route
`/finance/vouchers/list`

### Purpose
Paginated/bulk listing of all voucher transactions by period, account, and type for management, search, admin.

### PRD Reference
FR-300, FR-302, FR-306, FR-307, FR-309, FR-314  
US-252, US-306, US-307

### Access Roles
- Supervisor (full access)
- Administrator (full access)

---

### Layout

- Glass card container
- Title: "Voucher List"
- Filter bar: account, type, period, status
- Action toolbar (Export, Print, Bulk Delete — admin only)
- Paginated table list

---

### Fields & UI Components

#### Filter bar
- **Date Range**
  - Label: "Posting Period"
  - [Start Date, End Date]
- **Account**
  - Label: "Account"
  - [Searchable select: all account codes/names]
- **Voucher Type**
  - Label: "Voucher Type"
  - [Dropdown: Journal, Cash, Bank, Purchase, Sale, PDC, etc.]
- **Status**
  - Label: "Status"
  - [Select: All, Draft, Finalized, Posted, Voided]
- **Apply Filters**
  - `voucherlist-filters-apply`
- **Bulk Delete** (admin only, enabled when checkboxes selected)

#### Table Columns
- Voucher # (clickable for drilldown)
- Date
- Account (code/name)
- Voucher Type
- Reference/Narration
- Debit
- Credit
- Status (badge: color coded)
- Created By
- Actions:
  - View Details
  - Download (row)
  - Delete (if permitted)

#### Actions
- Export (Print/PDF/Excel/CSV)
- `voucherlist-export`
- Print
- Bulk Delete: with multi-select checkboxes+dialog confirmation, reason required

#### Validation/Error Messages
- Required: date range at least one day or filters set.
- Error: "No vouchers found for current criteria."
- Bulk delete error: "Unable to delete all selected vouchers. Check permissions or voucher status."

#### Loading/Skeleton
- Filter: shimmer
- Table: 12 row shimmer+pagination

#### Empty State
- Card: "No voucher transactions detected for given range or filters."
- SVG: doc icon outline

#### API Error State
- Red card banner: failure message and retry

---

#### Test Identifiers

| data-testid                          | Purpose               |
|--------------------------------------|-----------------------|
| voucherlist-filters-apply            | Apply filter button   |
| voucherlist-table-row-[vsrl]         | Table row             |
| voucherlist-table-detail-[vsrl]      | Row view drilldown    |
| voucherlist-table-download-[vsrl]    | Row PDF download      |
| voucherlist-table-delete-[vsrl]      | Row delete            |
| voucherlist-export                   | Export toolbar/menu   |
| voucherlist-print                    | Print                 |
| voucherlist-bulk-delete              | Bulk delete button    |
| voucherlist-empty-state              | Empty state           |
| voucherlist-error                    | API error display     |

---

## 331. VoucherListErrFind

### Route
`/finance/vouchers/err-find`

### Purpose
List and resolve errors or inconsistencies in voucher record entries.

### PRD Reference
US-261, FR-313

### Access Roles
- Administrator (full access)

---

### Layout

- Glass card
- Title: "Voucher List Error Checker"
- Info banner: Explains error detection is run automatically and on demand

---

### Fields & UI Components

#### Auto/Manual Error Scan Controls
- "Run Error Check" button (primary)
  - `voucher-errfind-runscan`
- "Last Scan" time/status
- Download error report  
  - `voucher-errfind-export`

#### Error Table Columns
- Voucher #
- Error Code
- Error Description (rendered as warning/red badge if critical)
- Account / Voucher Type
- Date
- Status (Open/Resolved/Ignored)
- Actions:
  - View Details (expands for row, shows underlying data)
  - Mark Resolved (admin only)
  - Ignore (with reason modal)

---

#### Validation & Error Messaging
- If error scan fails: Top banner "Error scan could not complete — check network or try again."
- Required for ignore: Reason must be filled.

#### Loading/Skeleton
- "Scanning for errors..." shimmer state
- Table: animated shimmer

#### Empty State
- Card: "No voucher errors found."
- SVG: check-circle outline

#### API Error State
- Red card above table

---

#### Test Identifiers

| data-testid                            | Purpose             |
|----------------------------------------|---------------------|
| voucher-errfind-runscan                | Manual scan button  |
| voucher-errfind-table-row-[err-id]     | Table entry         |
| voucher-errfind-table-expand-[err-id]  | View row error det. |
| voucher-errfind-mark-resolved-[err-id] | Mark as resolved    |
| voucher-errfind-ignore-[err-id]        | Ignore button       |
| voucher-errfind-export                 | Export error list   |
| voucher-errfind-empty-state            | No errors display   |
| voucher-errfind-error                  | Scan or api error   |

---

## 332. VoucherListNEW

### Route
`/finance/vouchers/new-list`

### Purpose
Enhanced voucher transaction listing with filters, advanced export, batch approve/reject options, and detail drilldown.

### PRD Reference
FR-315, FR-317, FR-322, US-257, US-261

### Access Roles
- Supervisor (full)
- Administrator (full)

---

### Layout

- Glass main card
- Title: "Voucher List (New Format)"
- Tabs/filters for batch approval, drafts, posted, all
- Multi-select table with status coloring

---

### Fields & UI Components

#### Tab Bar
- Tabs: All Vouchers | Drafts | Pending Approval | Approved | Posted
- Counts displayed per tab

#### Filter bar  
- Same as VoucherList, adds:
  - Batch Operation Dropdown: Approve selected, Reject selected, Export selected

#### Table Columns  
- Checkbox (for multi-select)
- Voucher #
- Date
- Type
- Account
- Reference
- Amount (dr/cr combined column)
- Status
- Approver
- Created By
- Batch/Group (if in batch)
- Actions: View/Edit as allowed

#### Actions
- Export (batch, row)
- Batch Approve [primary in this context]
  - Confirms for selected
- Batch Reject (reason required)
- More (per row, popover for download, edit, audit log)

---

#### Validation/Error Messaging
- Must select at least one row for batch actions
- Error: "No vouchers to approve in this selection."
- If batch operation fails: error banner

#### Loading/Skeleton
- Tabs: loading dot
- Table: 12 shimmer rows, paginated

#### Empty State
- Card: "No voucher entries under this filter."

#### API Error State
- Red banner: error detail

---

#### Test Identifiers

| data-testid                             | Purpose                      |
|-----------------------------------------|------------------------------|
| voucherlistnew-tab-[name]               | Tab selection                |
| voucherlistnew-table-row-[vsrl]         | Table row                    |
| voucherlistnew-batch-approve            | Batch approve button         |
| voucherlistnew-batch-reject             | Batch reject button          |
| voucherlistnew-batch-export             | Export selected batch        |

---

## 333. work_In_Progress

### Route
`/jobs/work-in-progress`

### Purpose
Shows all jobs marked as "In Progress," assignment info, completion/due status, overdue markers, actual/est. times.

### PRD Reference
FR-105, FR-126, FR-107, US-105, US-108

### Access Roles
- Supervisor (full)
- Administrator (full)

---

### Layout

- Glass card main
- Title: "Work In Progress"
- Filters: technician/personnel, period, job status, overdue only

---

### Fields & UI Components

#### Filter set
- **Personnel** (dropdown/autocomplete)
- **Status** (multi-select; default to [In Progress])
- **Date Range**
- **Only Overdue** [checkbox]
- **Apply Filters**
  - `workinprogress-filters-apply`

#### Table Columns
- Job/WO #
- Customer/Vehicle
- Technician/Assigned To (avatar+name)
- Assigned Date
- Expected Completion Date
- Actual Completion
- Status (badge: color)
- Job Notes
- Overdue (callout badge if so)
- Actions (View Details, Mark Complete)

#### Inline Actions
- Mark as Complete
  - Requires comment/confirmation
- View Details
- Print

---

#### Validation/Error Messaging
- Must select at least one active status.
- "Cannot mark as complete unless job card is updated."
- "Mark Complete" dialog error if comment missing.

#### Loading/Skeleton
- Filter: shimmer, table: 7 row shimmer

#### Empty State
- Card: "No work in progress jobs — all current jobs have been completed or reassigned."

#### API Error State
- Banner: detail

---

#### Test Identifiers

| data-testid                           | Purpose                        |
|---------------------------------------|--------------------------------|
| workinprogress-filters-apply          | Filter/search work             |
| workinprogress-table-row-[jobid]      | Row                            |
| workinprogress-table-overdue-[jobid]  | Overdue badge (row)            |
| workinprogress-mark-complete-[jobid]  | Mark job complete              |
| workinprogress-detail-[jobid]         | View job detail                |
| workinprogress-empty-state            | No open jobs                   |
| workinprogress-error                  | Error info                     |

---

## 334. xxx

### Route
`/misc/xxx-report`

### Purpose
Internal diagnostic or test report output screen.

### PRD Reference
Screen only listed as "xxx" (diagnostic/test); see Gaps & Report Test.

### Access Roles
- Administrator only

---

### Layout

- Glass card
- Title: "Diagnostic Report (XXX)"
- Full-width text area for raw report data or test output

---

### Fields & UI Components

#### Controls
- Date range selector  
  - Start/End Date
- "Generate" (primary action for test), `xxx-generate`
- Text area for report (readonly)
- "Copy to Clipboard" button

---

#### Validation/Error Messaging
- Require valid dates
- "Unable to generate diagnostic; check server logs."

#### Loading/Skeleton
- Spinner overlay on report area
- Disabled during run

#### Empty State
- "No diagnostic output for this range."

#### API Error State
- Error banner

---

#### Test Identifiers

| data-testid                  | Purpose                       |
|------------------------------|-------------------------------|
| xxx-generate                 | Generate report               |
| xxx-output                   | Text area diag output         |
| xxx-copy                     | Copy output                   |
| xxx-error                    | Server/API error              |

---

## 335. z

### Route
`/misc/z-report`

### Purpose
Internal temporary/test report page, for special queries or data-dump results.

### PRD Reference
Screen named "z" only (test).

### Access Roles
- Administrator only

---

### Layout

- Glass card + heading "Temporary/Test Report (Z)"
- Query builder fields (SQL not exposed)
- Results grid below

---

### Fields & UI Components

#### Controls
- DateFrom / DateTo (required)
- Entity/type picker (generic: e.g. Accounts, Items, Customers)
- "Generate Test Report" (primary), `z-generate`
- Download button

#### Table Output Columns
- Dynamically mapped — grid with columns from dynamic query

#### Validation/Error Messaging
- All fields required
- API error: top card

#### Loading/Skeleton
- Loading shimmer overlay grid
- Disables form until complete

#### Empty State
- "No data for the query."

#### API Error State
- Red banner

---

#### Test Identifiers

| data-testid                 | Purpose           |
|-----------------------------|-------------------|
| z-generate                  | Generate button   |
| z-table                     | Results grid      |
| z-download                  | Download button   |
| z-error                     | Server error      |

---

## 336. Account Modification Log

### Route
`/admin/audit/account-modification-log`

### Purpose
Review, filter, and export the full change history for individual account records (account, ledger, etc).

### PRD Reference
FR-348, FR-349, FR-264, BR-130, US-295

### Access Roles
- Supervisor (view)
- Administrator (full/filter/export)

---

### Layout

- Glass card
- Title: "Account Modification Log"
- Filter panel, sticky at top

---

### Fields & UI Components

#### Filters
- **Account**
  - Label: "Account"
  - [Searchable select: all chart of account names/codes]
- **Action**
  - Label: "Action Type"
  - [Select: Created, Updated, Deleted]
- **Date range**
  - Label: "Date of Change"
  - [Start date, End date]
- **User**
  - Label: "User"
  - [Select: all user accounts]
- **Apply Filters**  
  - `accountmodlog-filters-apply`
- **Export results** (PDF/Excel/CSV)
  - `accountmodlog-export`
- **Print All**
  - `accountmodlog-print`

#### Table Columns
- Date/Time
- User (w/avatar)
- Account Name/Code
- Action Type (badge)
- Changed Fields
- Old Value(s) (show only if updated)
- New Value(s)
- Comment (if any)

#### Row Expander
- Shows before/after all fields with diff highlights

#### Empty/Loading/Error
- Loading: shimmer, disables controls
- Error: full banner
- Empty: "No modifications found for filter"

---

#### Test Identifiers

| data-testid                                | Purpose              |
|---------------------------------------------|----------------------|
| accountmodlog-filters-apply                 | Apply filter         |
| accountmodlog-table-row-[log-id]            | Table entry          |
| accountmodlog-table-expand-[log-id]         | View row diff        |
| accountmodlog-export                        | Export all           |
| accountmodlog-print                         | Print all            |
| accountmodlog-empty-state                   | Blank result         |
| accountmodlog-error                         | API error            |

---

## 337. Edit Change Log Viewer

### Route
`/admin/audit/change-log-viewer`

### Purpose
Cross-module view for recent changes to any sensitive record/system-wide activity, with rich filtering and drilldown.

### PRD Reference
FR-350, FR-351, BR-134

### Access Roles
- Supervisor (view/filter/export)
- Administrator (full)

---

### Layout

- Glass card
- Title: "System Change Log Viewer"
- Tagline: "Review and filter system-wide record changes for users, entities, and important business objects."

---

### Fields & UI Components

#### Filters
- **Entity Type**  
  - Label: "Entity"
  - [Select: Accounts, Users, Customers, Suppliers, Document, Voucher, ...]
- **Entity ID/Name**  
  - Label: "Entity Reference"
  - [Autocomplete text]
- **Action Type**
  - Label: "Change Type"
  - [Select: Create, Update, Delete, Merge, etc.]
- **User**
  - Label: "Changed by"
  - [Dropdown: all users]
- **Date Range**
  - Label: "Date"
  - [Start, End]
- **Apply Filters**
  - `changelogviewer-filters-apply`
- **Export**
  - PDF/Excel/CSV

#### Table Columns
- Date/Time
- User
- Entity Type
- Reference/ID
- Action
- Summary (fields changed)
- Old Value(s)
- New Value(s)
- Comment

- [Row expand]: Show full details, structured diff

#### Empty/Loading/Error
- Loading: shimmer
- Empty: "No changes found matching filters."
- Error: error banner, retry

---

#### Test Identifiers

| data-testid                            | Purpose                     |
|-----------------------------------------|-----------------------------|
| changelogviewer-filters-apply           | Apply filter button         |
| changelogviewer-table-row-[log-id]      | Row in table                |
| changelogviewer-table-expand-[log-id]   | View full diff/details      |
| changelogviewer-export                  | Export                      |
| changelogviewer-empty-state             | No results                  |
| changelogviewer-error                   | API/server error            |

---

## 338. Duplicate Record Removal Audit

### Route
`/admin/audit/duplicate-removal-log`

### Purpose
Audit log for all removal/merge of duplicate customers, suppliers, vehicles, etc. Confirms traceability and enables investigation.

### PRD Reference
FR-352, FR-353, BR-132, US-299, US-305

### Access Roles
- Supervisor (view/export)
- Administrator (full, comment/add notes)

---

### Layout

- Glass card
- Title: "Duplicate Record Removal Log"
- Info card at top: "For every merge or removal of a duplicate record, the system creates a full audit log entry."

---

### Fields & UI Components

#### Filters
- **Entity Type**
  - Label: "Entity"
  - [Dropdown: Customer, Supplier, Vehicle, Contact]
- **Date**
  - Label: "Merge/Remove Date"
  - [Start/End]
- **User**
  - Label: "Action By"
  - [Select]
- **Apply Filters**
  - `duprmlog-filters-apply`
- **Export/Print**

#### Table Columns
- Date/Time
- Entity Type
- Source Record (ID/name)
- Target/Survivor Record (ID/name)
- User (who performed merge)
- Action (Merged/Deleted)
- Reason/Notes
- Undo/Restore (admin only if active, guarded by warning dialog)

#### Row Expand
- Full detail—list of all changed/removed fields

#### Actions
- Export all/displayed (PDF/Excel/CSV)
- Print

#### Validation/Error Message
- Empty: "No duplicate merges/removals found."
- Error: error message panel, retry

---

#### Test Identifiers

| data-testid                         | Purpose               |
|--------------------------------------|-----------------------|
| duprmlog-filters-apply               | Apply filter button   |
| duprmlog-table-row-[merge-id]        | Table row             |
| duprmlog-table-expand-[merge-id]     | Expand full details   |
| duprmlog-undo-[merge-id]             | Restore (admin)       |
| duprmlog-export                      | Export                |
| duprmlog-print                       | Print                 |
| duprmlog-empty-state                 | No entries            |
| duprmlog-error                       | API error             |

---

## 339. User Action Log Report

### Route
`/admin/audit/user-action-log-report`

### Purpose
Consolidated audit trail of user-initiated system actions for security, compliance, and review. Supports advanced filtering, annotation, and export.

### PRD Reference
FR-354, FR-355, FR-356, FR-357, FR-362, BR-134, US-300, US-307

### Access Roles
- Supervisor (view/export)
- Administrator (full/annotate/print)

---

### Layout

- Glass card with sticky filter panel
- Title: "User Action Log Report"
- Subtitle: "Complete audit of user actions and system activity"
- Annotation toolbar (admin)

---

### Fields & UI Components

#### Filters
- **Date Range** (required for export)
  - Label: "Action Period"
  - [Start Date, End Date]
- **User**
  - Label: "User"
  - [Select]
- **Action Type**
  - Label: "Action"
  - [Multi-select: Create, Update, Delete, Export, Print, Login, Failed Login, Password Change, Role Change, Other]
- **Entity**
  - Label: "Entity"
  - [Select: All, Account, Voucher, User, Customer, Supplier, etc.]
- **Apply Filters**
  - `useractionlog-filters-apply`
- **Export**
  - PDF, Excel, or CSV

#### Table Columns
- Date/Time
- User
- Action (type, badge)
- Entity Name
- Details (simple text)
- Status (OK/Error)
- Annotation (admin added, editable by admin)

- Row expand: show full technical action details/JSON

#### Actions  
- Print
- Export
- Add/Edit Annotation (admin only)
- Row expand

#### Validations
- Date required for exports
- Annotation required for save

#### Empty/Loading/Error
- Loading: shimmer rows
- Empty: "No actions logged."
- Error: banner, retry UI

---

#### Test Identifiers

| data-testid                             | Purpose                     |
|------------------------------------------|-----------------------------|
| useractionlog-filters-apply              | Filter search               |
| useractionlog-table-row-[action-id]      | Table row                   |
| useractionlog-table-expand-[action-id]   | Row expansion               |
| useractionlog-export                     | Export button               |
| useractionlog-print                      | Print log                   |
| useractionlog-add-annotation-[action-id] | Add note/admin              |
| useractionlog-edit-annotation-[action-id]| Edit annotation             |
| useractionlog-empty-state                | No logs found               |
| useractionlog-error                      | Error API                   |

---

## COVERAGE CHECK

| Screen Name                      | Status     |
|-----------------------------------|------------|
| 326. TrialBalanceSummary          | ✅ covered |
| 327. UsedCars                     | ✅ covered |
| 328. UserLogReport                | ✅ covered |
| 329. VehicleAttendanceList        | ✅ covered |
| 330. VoucherList                  | ✅ covered |
| 331. VoucherListErrFind           | ✅ covered |
| 332. VoucherListNEW               | ✅ covered |
| 333. work_In_Progress             | ✅ covered |
| 334. xxx                          | ✅ covered |
| 335. z                            | ✅ covered |
| 336. Account Modification Log     | ✅ covered |
| 337. Edit Change Log Viewer       | ✅ covered |
| 338. Duplicate Record Removal Audit| ✅ covered |
| 339. User Action Log Report       | ✅ covered |

---

---

