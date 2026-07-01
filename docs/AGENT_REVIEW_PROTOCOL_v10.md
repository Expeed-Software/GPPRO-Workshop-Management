<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v10
  Generated at   : 2026-06-24 16:25:27 UTC
-->

# AGENT_REVIEW_PROTOCOL.md

**Integrated Business Operations Suite — Agent Review Protocol**

**Scope:** DB-Preserve Mode. The existing database is UNCHANGED. Application must access data ONLY via stored procedures as specified in DB_CONNECTION_SPEC.md — never direct table/column refs or new DB objects. See PRD for requirements.

**PASSING SCORE: 10/10 required for each layer to approve delivery.**

---

## 1. DB CONNECTION LAYER

**Checklist:**

- [ ] **DB Connection Pool:** The application uses `DB_CONNECTION_STRING` environment variable for all database access; no hardcoded credentials.
- [ ] **callProcedure Helper:** There is a single helper (e.g., `db/callProcedure.ts` for Node.js) that wraps parameterized calls to all stored procedures.
- [ ] **Stored Procedure Invocation:** *Every* backend data access goes through callProcedure (or equivalent), with NO direct `query()`/raw SQL or ORM for reading/writing tabular data.
- [ ] **No Table/Column Access:** No usage of direct SQL referencing tables/columns (SELECT/INSERT/UPDATE/DELETE); only EXEC/EXECUTE/Call to procedures, as mapped in DB_CONNECTION_SPEC.md.
- [ ] **DB Connection Pooling:** Pool is used according to `db-connection-guide.md` (no connection leaks, pooling configured).
- [ ] **Parameterization:** Procedure parameter values are always provided as parameters — no string building or template literals for queries.
- [ ] **Error Handling:** Procedure errors are surfaced to the business layer via a consistent typed error/exception.
- [ ] **Procedure Availability:** *Every* stored procedure listed in Section 2 of DB_CONNECTION_SPEC.md is accessible and testable via the callProcedure helper.
- [ ] **No Schema Migration:** No code or tooling for DB schema migration, schema generation, or database DDL runs, anywhere in the code/repo.
- [ ] **Env Vars Not Exposed:** No code or API returns/echoes DB connection details to any end-user response/log.

**Score:__/10**

---

## 2. API LAYER

**Checklist:**

- [ ] **Endpoint Coverage:** *Every* stored procedure mapped in DB_CONNECTION_SPEC.md exists as a REST endpoint at the method/path shown (e.g., GET /api/v1/customers/outstanding/salesmanwise).
- [ ] **Exact SP Mapping:** Each endpoint calls the **exact** stored procedure name from DB_CONNECTION_SPEC.md — no renaming/mangling.
- [ ] **Request Param Mapping:** Endpoint query/body params are mapped one-to-one to the stored procedure parameters (all required SP params are enforced as required in the API).
- [ ] **Response Structure:** Returned data shape from endpoint matches the columns/types provided back from the stored procedure (field naming and types are preserved/camelCased as per standard).
- [ ] **Envelope Format:** Responses are returned in the envelope format described in `api-contracts.md` (e.g., `{ data: [...], meta: {...} }` for lists).
- [ ] **Auth Middleware:** Auth/authZ (JWT, RBAC) enforced on all endpoints requiring protection (roles, permissions correspond to Access Control Matrix in PRD).
- [ ] **Pagination:** All list endpoints support pagination via query params and pass correct values to SPs for page/limit; metadata present in results.
- [ ] **Error Codes:** Every documented error scenario (e.g., validation, forbidden, expired token, DB failure) returns an appropriate status and JSON body, using error codes from `error-handling.md`.
- [ ] **No Raw Table Access:** No endpoint reads or writes any table directly; only procedures are called.
- [ ] **Disabled Endpoints:** No endpoints exist for unmapped or forbidden procedures/tables or for functionality not covered by a stored procedure.

**Score:__/10**

---

## 3. BUSINESS LOGIC LAYER

> For EVERY PRD business rule, there MUST be visible and enforceable logic (check, policy, validation, or permission) that matches the rule. This is a full assertion checklist.

### Business Rule Assertions:

**(Check every item. Omission = automatic fail)**

1. **BR-01:** User must have unique identifier & password for access.
2. **BR-02:** Account locks after configurable failed sign-ins.
3. **BR-03:** Passwords must meet configured length & complexity.
4. **BR-04:** Password change/reset requires verification.
5. **BR-05:** Sessions expire after inactivity timeout.
6. **BR-06:** Only correct roles may view authentication logs/admin users.
7. **BR-07:** User log report visible only to supervisor/admin roles.
8. **BR-08:** User must re-authenticate to change sensitive settings.
9. **BR-09:** User notified on password change/reset.
10. **BR-10:** All user auth/account management ops exposed as API mapped to service logic.
11. **BR-11:** Only admin may assign/change user/group roles/permissions.
12. **BR-12:** User emails are unique.
13. **BR-13:** Deactivated users CANNOT login or access system routes.
14. **BR-14:** All user/account actions logged with user/timestamp.
15. **BR-15:** All password changes/creates validated for complexity.
16. **BR-16:** User with multiple roles gets HIGHEST privilege from any assigned role.
17. **BR-17:** Reports (view/export/design) only to users with correct permissions.
18. **BR-18:** User bulk import prevents any duplicate entries — validates before processing.
19. **BR-19:** Temporary users automatically lose access after time period.
20. **BR-20:** Role/perm changes take effect immediately on save.
21. **BR-21:** Customers must have unique (name + main contact number).
22. **BR-22:** Supplier record cannot be deactivated if active transactions exist.
23. **BR-23:** Contacts must have at least one valid phone/email.
24. **BR-24:** Merge duplicate requires supervisor/admin approval.
25. **BR-25:** Vehicle linked to only one active customer at a time.
26. **BR-26:** Adding duplicate ID triggers warning and prevents save.
27. **BR-27:** Bulk import validates data for format and uniqueness, only saves valid rows.
28. **BR-28:** All edits to master records logged with user/time.
29. **BR-29:** Only authorized users may view/export sensitive contact info in reports.
30. **BR-30:** Admin may configure field validation settings.
31. **BR-31:** Attachments/documents — only authorized users can upload/view/edit/delete, must check permissions.
32. **BR-32:** Attachment always linked to at least one order/transaction.
33. **BR-33:** Every attachment records user, upload date, and version.
34. **BR-34:** Remarks link to user who made them and are timestamped.
35. **BR-35:** Deleted attachments/remarks not recoverable by standard users.
36. **BR-36:** Bulk deletion/download must confirm action before proceeding.
37. **BR-37:** Admins can access audit trails of all edits/deletes.
38. **BR-38:** Documents use admin-maintained standardized header/category structure.
39. **BR-39:** Estimations require customer, description, and at least one line item/cost to be submitted.
40. **BR-40:** Only supervisor/admin can approve/reject estimations.
41. **BR-41:** Only assigned person or supervisor can update job status.
42. **BR-42:** Cannot assign inactive job status to a job.
43. **BR-43:** Users may not exceed max active jobs unless supervisor override is confirmed [NEEDS CONFIRMATION].
44. **BR-44:** Reports for jobs only visible within assigned department or scope.
45. **BR-45:** Every change to job status/assignment/approval logged with user, timestamp, and value.
46. **BR-46:** Cannot mark job complete if mandatory job card info is missing.
47. **BR-47:** Notification must be sent within 5 min of job assignment.
48. **BR-48:** Job completion requires digital signature.
49. **BR-49:** Mobile access requires multi-factor auth [BEST PRACTICE].
50. **BR-50:** Only admin can edit job status master list.
51. **BR-51:** Cannot delete order if delivery note exists.
52. **BR-52:** Cannot submit order if required fields missing.
53. **BR-53:** Only authorized role may change order customer or status.
54. **BR-54:** Order confirmation email sent immediately on creation.
55. **BR-55:** Delivery notes generated digitally and retained for audit.
56. **BR-56:** Order status changes always logged (with who/when/why).
57. **BR-57:** Deliveries lock further order edits to product/quantity.
58. **BR-58:** Sales summary reports for all customers — admin only.
59. **BR-59:** Discounts/tax formula enforced per company policy.
60. **BR-60:** Each delivery note must point to a valid order and customer.
61. **BR-61:** Purchases above defined value require supervisor approval.
62. **BR-62:** Every purchase delivery order links to purchase order.
63. **BR-63:** Goods in receipt must match ordered qty/items.
64. **BR-64:** Roles for purchase order edit/approval enforced per access control.
65. **BR-65:** Documents must be uploaded for purchase orders exceeding policy threshold.
66. **BR-66:** All purchase order numbers must be unique.
67. **BR-67:** No delete of purchase/delivery orders after supervisor approval.
68. **BR-68:** All PO/DO changes logged with user/timestamp.
69. **BR-69:** Alert sent for overdue delivery orders to responsible purchaser.
70. **BR-70:** Only admin can configure approval workflow/access for procurement.
71. **BR-71:** All stock-in ops require item, qty, date, location.
72. **BR-72:** Cannot stock-out more than available inventory at location.
73. **BR-73:** Manual/physical adjustments require supervisor approval (+ log).
74. **BR-74:** Item valuation performed via configured method only.
75. **BR-75:** Notification triggers if item at/below reorder level.
76. **BR-76:** All stock moves/adjustments/deletes logged (user/time/action).
77. **BR-77:** Restricted access for inventory edit/export/approval.
78. **BR-78:** Mobile counts validated for item/location.
79. **BR-79:** Duplicate stock adjustment (same item/location/period) prevented.
80. **BR-80:** Only approved roles may access sensitive/financial inventory exports.
81. **BR-81:** Only authorized finance/bank role may perform banking edits or reconciliation ops.
82. **BR-82:** Any unreconciled transaction older than 3 days must be resolved or documented.
83. **BR-83:** Reconciliation actions logged with user/time/action.
84. **BR-84:** Banking reports only to authorized roles.
85. **BR-85:** No transaction can be finalized without serial number.
86. **BR-86:** Imported bank statements must be valid (format/data).
87. **BR-87:** Supervisors notified of any unresolved reconciliation in timeframe.
88. **BR-88:** Contextual help available on all recon/banking screens.
89. **BR-89:** Report design/advanced features require explicit role assignment.
90. **BR-90:** Account names unique in group.
91. **BR-91:** Accounts referenced by transactions cannot be deleted (only deactivated).
92. **BR-92:** Parent-head assign only to valid/active account.
93. **BR-93:** Account create requires name, type, group, status.
94. **BR-94:** Only correct roles can create/update/delete accounts/heads.
95. **BR-95:** All account changes logged with user/time/action.
96. **BR-96:** Each ledger entry linked to valid/active account.
97. **BR-97:** Bulk import ensures valid fields and no duplicates.
98. **BR-98:** Import/export failures always generate supervisor alert.
99. **BR-99:** Orphaned heads flagged for correction/review.
100. **BR-100:** No receipt/payment finalized without supervisor or admin auth.
101. **BR-101:** Receipts/payments allocated correctly (to party/account).
102. **BR-102:** Settled/posted transactions are locked, cannot edit/delete.
103. **BR-103:** All "pending" entries require approval/posting before updating main ledgers.
104. **BR-104:** Petty cash never allowed negative balance.
105. **BR-105:** Backup reports visible/exportable only to authorized users.
106. **BR-106:** Electronic payment status must come from validated system/gateway.
107. **BR-107:** All audit log entries have initiating user, timestamp, action.
108. **BR-108:** Receipt/payment CRUD ops log who did what when.
109. **BR-109:** Advanced reporting/design always permission-locked.
110. **BR-110:** Journal entries — debits and credits must balance.
111. **BR-111:** Voucher numbers unique per year.
112. **BR-112:** Only supervisor/admin can approve/reject voucher batches.
113. **BR-113:** Cannot save voucher entry missing required fields/date/account/amount/type.
114. **BR-114:** Every voucher/txn change is audit-logged.
115. **BR-115:** Voucher-attachments only allowed formats/size.
116. **BR-116:** Voucher posting APIs always permission-protected.
117. **BR-117:** Reports only exposed to users with correct role-perm.
118. **BR-118:** Batch import/approve/delete only by authorized users.
119. **BR-119:** Draft vouchers visible only to creator.
120. **BR-120:** Financial/statutory reports only for authorized roles.
121. **BR-121:** Cannot run report without all required parameters.
122. **BR-122:** Account/aging reports always use current/closing data.
123. **BR-123:** Only supervisor/admin may schedule report automation.
124. **BR-124:** Reports exportable in both PDF and Excel.
125. **BR-125:** Statement print format matches approved stationery/plain template.
126. **BR-126:** ALL report actions (gen/export/email) logged.
127. **BR-127:** Report templates editable only by assigned admin/designer.
128. **BR-128:** Backup/test/alt layout reports — admin access only.
129. **BR-129:** Scheduler failure triggers alert to responsibles.
130. **BR-130:** ALL changes to account/customer/supplier MUST be tracked with user/time/what.
131. **BR-131:** Audit/change logs — only supervisor/admin access.
132. **BR-132:** Duplicates merge/delete must be tracked for audit.
133. **BR-133:** Audit records must be retained minimum statutory period.
134. **BR-134:** Security/compliance: supervisor alerted on suspicious events.
135. **BR-135:** Audit/change access must itself be auditable/permissioned.
136. **BR-136:** Audit logs immutable — only archived or expired by process, never deleted by user.
137. **BR-137:** All audit-related stored procs exposed at API layer.

**Score:__/10**

---

## 4. ACCEPTANCE CRITERIA LAYER

**Checklist:** 

> For each PRD acceptance scenario: copy it verbatim here and confirm ("PASS"/"FAIL").  
> **Example** (repeat for ALL scenarios):

---

**Sign In:**  
Given a valid username and password  
When the user submits the sign in form  
Then the system grants access and starts a session  
**Result:** ____ /10

---

**Password Change:**  
Given a signed-in user  
When the user enters their current and new password meeting the policy  
Then the system updates the password securely and confirms success  
**Result:** ____ /10

---

(repeat for all PRD-provided scenarios; do not skip, do not batch.)

**(Agent must reproduce every Given/When/Then PRD acceptance scenario and verify it passes.)**

**Score:__/10**

---

## 5. FRONTEND / UI LAYER

**Checklist:** 

> For every PRD screen: check that the screen exists at required route, matches the described UI, all controls/validation/interactions are present.  
> Screen IDs and names MUST be covered one-by-one, do not skip:

- [ ] **Sign In** — `/auth/sign-in`
- [ ] **Password Change** — `/auth/change-password`
- [ ] **ODBC Sign In** — `/auth/odbc-login`
- [ ] **Bypass/Forgot Password** — `/auth/forgot`
- [ ] **User Log Report** — `/admin/user-log-report`
- [ ] **User List** — `/admin/users`
- [ ] **User Rights Management** — `/admin/users/rights`
- [ ] **User Management** — `/admin/users/:id`
- [ ] **Legacy User Management** — `/admin/users/legacy`
- [ ] **Admin Change Password** — `/admin/users/:id/change-password`
- [ ] **Page/User Info** — `/profile` or user info panel
- [ ] **UserLogReport** — `/admin/audit/userlog`
- [ ] **EmployeeList** — `/admin/employees`
- [ ] **Customer Management** — `/customers`
- [ ] **Supplier Management** — `/suppliers`
- [ ] **Contact Entry** — `/contacts/add`
- [ ] **Contact Search** — `/contacts`
- [ ] **Customer Help** — `/customers/help`
- [ ] **Supplier Help** — `/suppliers/help`
- [ ] **Customer Vehicle Entry** — `/customers/:id/vehicles/add`
- [ ] **Customer Vehicle Help** — `/customers/vehicles/help`
- [ ] **Merge Customer Duplicates** — `/customers/duplicates`
- [ ] **Merge Supplier Duplicates** — `/suppliers/duplicates`
- [ ] **Merge Vehicle Duplicates** — `/vehicles/duplicates`
- [ ] **Customer/Supplier List Report** — `/reports/customers-suppliers`
- [ ] **Check Duplicate Contacts** — `/contacts/duplicates`
- [ ] **Cust Age Wise** — `/reports/customers/agewise`
- [ ] **Items Help New** — `/items/help`
- [ ] **Local Porder Search** — `/purchase/local/search`
- [ ] **Menu** — `/menu` (or in nav)
- [ ] ...  
- [ ] *(MUST check all PRD screens by exact name/ID — do not skip, full list shown above!)*

**For each:**
- [ ] Page exists at correct route/link in sidebar/nav
- [ ] All required fields, buttons, validators present
- [ ] All table/list/report fields and columns match PRD description
- [ ] Loading, error, and empty states show correct messaging
- [ ] Navigation (links, buttons) works E2E; modal/dialog triggers work
- [ ] (For forms) All controls have correct validation and enforce business rules on submit
- [ ] Accessibility: semantic HTML, labels for controls, keyboard navigation, focus ring
- [ ] Responsive design for all major breakpoints

**Score:__/10**

---

## 6. SECURITY & STANDARDS

**Checklist:**

- [ ] **Protected Route Enforcement:** ALL protected endpoints/routes reject unauthenticated (401) and underprivileged/unauthorized (403) requests per RBAC matrix; JWT/refresh enforced according to `authentication.md`
- [ ] **Input Validation:** All API endpoints, forms, and inputs apply input validation and data type checking (sanitisation, safe types, no overflows); no unescaped input sent to SPs.
- [ ] **No Sensitive Data in Logs:** Passwords, tokens, and PII never written to logs, console, or error responses. Only minimal, non-sensitive operation logs/stats permitted.
- [ ] **Parameterization:** All stored procedure calls supply parameters, never use string concat or injection-vulnerable patterns.
- [ ] **No Connection Info in Responses:** DB credentials, connection strings, or hostnames are never returned in any error/exception, nor visible in any built or test artifacts.
- [ ] **Password Handling:** Passwords always hashed (minimum bcrypt/argon2), never sent/received in plaintext over network (except in secure auth flow).
- [ ] **No ORM/Non-SP Access:** All DB operations performed via stored procs; no use of Prisma/Sequelize/TypeORM for direct table access, no usage of `query()` or raw SQL clauses not calling procedures.
- [ ] **No Migrations/DDL:** App contains no code, tool, or pipeline running schema migrations, DDL, or DB modifications of any kind. DB remains unchanged.
- [ ] **Secrets in Env Vars:** All credentials/secrets/tokens are only present in .env files, not hardcoded or committed to source.
- [ ] **Testing/Integration:** All test environments use separate DB connection string, never shared with prod.
- [ ] **Logging:** Logging follows levels in `error-handling.md`, suppressing sensitive detail in non-debug builds.

**Score:__/10**

---

## FINAL SIGN-OFF

| Layer                   | Score (out of 10) | PASS / FAIL |
|-------------------------|-------------------|-------------|
| DB CONNECTION LAYER     |                   |             |
| API LAYER               |                   |             |
| BUSINESS LOGIC LAYER    |                   |             |
| ACCEPTANCE CRITERIA     |                   |             |
| FRONTEND / UI LAYER     |                   |             |
| SECURITY & STANDARDS    |                   |             |

**TOTAL SCORE: __ /60**

> **ALL LAYERS must score a perfect 10/10 to PASS.**  
> Any item missed = remediation required.  
> Attach full test logs and screenshots for all frontend screens, each API route, and all forced error scenarios to back up your checklist.

---

**End of agent review protocol.**
