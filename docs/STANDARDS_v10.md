<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v10
  Generated at   : 2026-06-24 16:25:27 UTC
-->

# STANDARDS.md — DB-PRESERVE PROJECT

---

## SECTION 1 — TECH STACK (DB-Preserve Mode)

- **Backend:** Node.js (LTS) with Express, TypeScript required.
- **Frontend:** React 19 (TypeScript, Vite, CSS Modules, or as specified by PRD/Design System).
- **Database:** Existing SQL Server database (never altered). 
- **ORM:** NONE. 
- **DB Access:** Direct SP calls via `mssql` and `callProcedure()` helper. NO direct table queries except as fallback for legacy Access DBs (not applicable here).
- **Authentication:** JWT using `passport.js` (`local` strategy). Hash and salt passwords with bcrypt or Argon2 (policy: bcrypt, saltRounds = 12).
- **Authorisation:** RBAC via roles in JWT payload; fine-grained permission checks in services and route middlewares.
- **Session Management:** Token-based (standard JWT auth/refresh flows), session expiry on backend enforced.
- **API layer:** RESTful, OpenAPI conventions, envelope responses.
- **Testing:** Jest for backend, Testing Library (React) for frontend.

---

## SECTION 1B — CODING STANDARDS

### 1. Naming Conventions

- **API Paths:** Lowercase, kebab-case, plural. e.g., `/api/v1/users`, `/api/v1/customers/search`
- **Files (backend):** kebab-case, group by feature (`users.controller.ts`, `users.service.ts`, `users.repository.ts`)
- **Files (frontend):** PascalCase for React components (`UserList.tsx`). Folders grouped by feature, with `index.tsx`.
- **TypeScript Types:** PascalCase (`User`, `CustomerSearchResult`)
- **DB Procedure Reference:** Always use exact names as in `DB_CONNECTION_SPEC.md`
- **Env Variables:** UPPER_SNAKE_CASE (see .env.example from system)

### 2. File Organisation

- **Backend:**
  - `/src/controllers/`   — Express route handlers only
  - `/src/services/`      — Business logic, RBAC checks
  - `/src/repositories/`  — Stored procedure interface, only place that calls `callProcedure`
  - `/src/middleware/`    — Express and RBAC middleware
  - `/src/utils/`         — Helpers, logger, error classes
  - `/src/models/`        — TS types/interfaces (do NOT auto-generate from DB)
- **Frontend:**
  - `/src/pages/`         — Route-level components
  - `/src/components/`    — Shared UI components
  - `/src/api/`           — API client wrappers
  - `/src/context/`       — Auth and global state
  - `/src/styles/`        — CSS Modules/tokens

### 3. Error Handling

- Central error class hierarchy (`AppError`, `ValidationError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `AuthError`, `DatabaseError`)
- **Backend:** Never expose raw DB errors; always map to structured error with code/message.
- **Frontend:** Show user-friendly error messages, never raw details. Use toast for transient errors; dialog/banner for blocking errors.
- All API responses wrapped: 
  ```json
  { "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
  { "success": true, "data": {...} }
  ```
- Logging: Use Winston/Pino logger in backend. Log errors to file and stdout. No console.log in production.

### 4. Security Requirements

- All password storage: use bcrypt (12+ salt). Never log passwords or tokens.
- JWT tokens: RS256 or HS256, min 256b secret; expiration < 12hr; refresh tokens 7–30d.
- All sensitive operations (password changes, role changes): require re-authentication/multi-factor by policy.
- Session expiry after inactivity (per config).
- All API endpoints to validate JWT and roles.
- All input validation: Zod/Joi/Typebox schemas on both backend and frontend.
- Audit trail required for all user writes, auth events, and role changes.
- CORS: lock down to allowed origins only.
- CSRF: backend enforces on cookies (never store JWT in cookie unless SameSite strict).
- XSS/Injection: sanitize all untrusted data on input/output; always use parameterized SP calls.

---

## SECTION 1C — DATABASE ACCESS PATTERN

**ABSOLUTE RULE:** NO schema change. No migrations. No new tables (except for the 1–2 permitted for Auth refresh tokens if approved).

**Strategy:**

- **Stored Procedures Present:**  
  - Use `callProcedure(name, params)` in `/src/repositories/`.  
  - NEVER raw SQL except SELECT fallback only where no SP is available (not the case for SQL Server here).
  - NO direct reference to table names outside of legacy fallback.
  - ALL write operations must use a mapped stored procedure if present.

- **SP Parameter Rules:**
  - Input: always use named parameters (`@Name`: value)
  - Output: map by column name, case sensitive

- **Forbidden:**
  - `CREATE/ALTER/DROP TABLE` anywhere in code/rendered SQL
  - ORM/ActiveRecord (e.g., Prisma, TypeORM, Sequelize)
  - System migrations (`knex`/`typeorm` schema tools)
  - QueryBuilder except in diagnostic scripts

---

## SECTION 2 — BUILD ORDER (PHASE PLAN: COVERAGE FOR ALL MODULES)

### PHASE 1 — FOUNDATION (PROJECT SETUP & AUTH)

1. **Project Setup (Backend + Frontend Skeleton)**
   - README, .env, .env.example, src folders as above
   - GitHub Actions CI/CD starter
   - Lint/formatter config

2. **Database Connection (DB-Preserve)**
   - Implement `/src/db/connection.ts` using `mssql`
   - Implement `callProcedure(name, params)`
   - Implement DB health check endpoint and CLI

3. **Authentication & RBAC Baseline**
   - JWT auth with passport-local; RBAC role system (‘Administrator’, ‘Supervisor’, ‘Standard’), permission granularity per PRD
   - User login/logout, session refresh, error handling, password hashing (bcrypt)
   - Account lockout, unlock, password reset workflows (with secure email/SMS token)
   - Multi-factor scaffold (SMS/email/OTP), but use business toggle for enforcement per role
   - User audit log event write on every sign-in/failure/change
   - Initial `api/v1/auth/*` endpoints + `/api/v1/users/*` (read/write) as per user/role module below

4. **Frontend App Shell**
   - React setup (Vite, TypeScript)
   - Theming, layout, navbar, role-based routing
   - Auth context, API client with token persistence, login page
   - User type/role-aware navigation and error toast system

---

### PHASE 2 — USER, ROLE & EMPLOYEE MANAGEMENT MODULES

1. **User Management**
   - User list (search/filter/paginate)
   - View, create, edit, deactivate/activate, unlock, password reset, role assignment
   - Bulk import/export (CSV, Excel)
   - User audit log
   - Includes employee list (linked to users), export/print

2. **Role & Permission Management**
   - Create/edit/delete roles
   - Assign object-level/report-level/export/design permissions
   - Support for temp/limited accounts (if not in phase 1)
   - Role/permission API endpoints and admin screens

---

### PHASE 3 — CUSTOMER & SUPPLIER MANAGEMENT

1. **Customer/Supplier CRUD**
   - Create/edit/deactivate customer & supplier
   - Contact person CRUD and linking
   - Duplicate detection and merge (supervisor/admin only)
   - Vehicle/linking and merge
   - Guided search, advanced search, tags, age summaries

2. **Bulk Import/Export, Data Integrity**
   - CSV/Excel batch import/update with error/notification on failures
   - Field validation & uniqueness
   - Tagging, settings, personal preferences

3. **Reports & Audit**
   - Customer/supplier/contact/vehicle reporting and export
   - Module-specific audit trail

4. **API & CRM Integration**
   - Read/write endpoints mapped to business SPs
   - API endpoints for external CRM/ERP sync

---

### PHASE 4 — DOCUMENT & ATTACHMENT MANAGEMENT

1. **Attachment Manager**
   - Upload/delete single/batch, preview (PDF/image/text)
   - Role-based access: view/upload/edit/delete by permission
   - Doc header/category management (admin)
   - Tagging, metadata, versioning

2. **Additional Remarks/Notes**
   - Add/remrk/edit with audit/history
   - Notification on new/edited remarks (when business rules require)
   - Metadata management, document workflow
   - Batch operations

3. **Reporting, Export, Audit**
   - Per-doc/remark log/history & export

---

### PHASE 5 — JOB, WORK ORDER & ESTIMATION MGMT

1. **Job/Work Order**
   - Service/job estimation create/approve
   - Assignment, progress updating, batch status ops
   - In-progress/completed/pending reports with export
   - Gantt/calendar views (frontend, if in scope)

2. **Role Enforcement**
   - All screens/actions RBAC enforced per PRD

3. **Audit & Digital Signoff**
   - Audit trails for approvals, assignment, status
   - Digital signature step for completion (if in scope)

---

### PHASE 6 — SALES & ORDER MGMT

1. **Sales Order/Entry**
   - Entry/edit/status update; pending, completed, with audit
   - Customer change tracking
   - Confirmation email, delivery note generation, digital report

2. **Delivery, Mobile, API**
   - Delivery logs, note printing/export
   - Mobile-optimised screens
   - API for order/delivery status update (external)

---

### PHASE 7 — PURCHASE, STOCK, INVENTORY, BANKING, VOUCHERS

1. **Purchase & Procurement**
   - Local/foreign PO entry, status, approval, vendor manage
   - Receipt confirmation, overdue alerts
   - Linked PO/DO, doc upload

2. **Inventory & Stock**
   - Stock in/out, movement, adjustments, re-order, barcode
   - Inventory valuation, aging, audit, duplicate detect/merge

3. **Banking/Reconciliation**
   - Cash, bank book, reconcile, import statement, exceptions
   - Pending bills, audit, reporting

4. **Voucher/Journal**
   - Voucher entry/import/export, batch operations, approval flow

---

### PHASE 8 — REPORTING, AUDIT LOGGING & SYSTEM ADMIN

1. **Reporting Dashboard**
   - Select/view/export all main reports, filtering, scheduling
   - Audit report trail: activity, object-level, export histories

2. **System Admin & Diagnostics**
   - Change tracking/audit logs (read/export)
   - Diagnostics, batch tools, legacy user/data mapping

---

### PHASE 9 — ADVANCED: NOTIFICATION, CUSTOM ROLES, MOBILE TASK FLOWS

1. **Bulk Notifications/Alerts**
   - Supervisor/admin alerting on workflow failures, data issues
   - Role-based subscriptions, in-app/email/SMS

2. **Advanced Permissions**
   - Object-level/field-level custom permission matrix

3. **Mobile/Tablet Flows**
   - As required by user stories and NFRs

---

## PHASE 0 — ACCEPTANCE, NON-FUNCTIONAL, AND NFR TEST

- E2E test scenarios (NFR coverage, auth, RBAC, security, performance)
- Automated regression and role/permission matrix tests
- Load and scalability checks per deployment requirements

---

**ALL new code across phases must conform to the tech and process standards above. DB is NEVER altered in schema, all access strictly through stored procedures (or, in rare legacy fallback, parameterized SELECT only).**