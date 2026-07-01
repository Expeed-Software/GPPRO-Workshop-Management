<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v10
  Generated at   : 2026-06-24 16:25:27 UTC
-->

# PROJECT_OVERVIEW.md

---

## SECTION 1 — PROJECT OVERVIEW

### 1.1 Application Purpose

The Integrated Business Operations Suite is a comprehensive platform for end-to-end management of finance, sales, purchasing, inventory, order processing, CRM, help and audit utilities, and advanced reporting for service-, sales-, and inventory-driven businesses. Its goal is to unify key business processes, streamline operations, uphold compliance, maintain full audit trails, and support enterprise analytics across diverse operational modules.

---

### 1.2 Key Business Domains and Entities

Each business domain below is derived directly from the PRD data model and user stories. For each, the core entities, primary relationships, and critical business rules (with PRD rule numbers) are listed explicitly.

#### 1.2.1 User Management & Security

- **Core Entities:** USERS, UserRights, UserLog, loginDetails, LoginStatus, UserTable
- **Key Features:** Authentication, RBAC, password management, session management, bulk import/export, audit log, SSO/multi-factor support (if enabled).
- **Key Relationships:** USERS connected to UserRights and grouped by roles; UserLog logs all user actions.
- **Business Rules:**  
  - BR-01: Unique identifier (username/email) and password per user  
  - BR-02: Account lockout after repeated failed login attempts  
  - BR-03/BR-15: Password complexity/minimum length  
  - BR-04: Verification required for password change/reset  
  - BR-05: Session expiry after inactivity  
  - BR-06: Only proper roles may view authentication logs/admin  
  - BR-07: User log report for supervisor/administrator roles only  
  - BR-08: Re-authentication prior to sensitive actions  
  - BR-09: User notification after password changes/resets  
  - BR-10: All user/auth ops via API endpoints  
  - BR-11: Only admins can assign/modify permissions  
  - BR-12: User accounts require unique email address  
  - BR-13: Deactivated users cannot access the system  
  - BR-14: All user management actions logged  
  - BR-16: Highest access applies if multiple roles  
  - BR-17: Only relevant reporting permissions may view/export/design reports  
  - BR-18: Bulk import must validate for duplicate users  
  - BR-19: Temporary access auto-expires  
  - BR-20: Role/permission changes apply immediately

#### 1.2.2 Customer & Supplier Management

- **Core Entities:** Customer, Supplier, Contact (Contact fields within Customer/Supplier), CustomerVehicle, Vehicles, Omasters (coded lookup), AreaSql, SmanSql, Ajanda/Ajanda02 (contact/assignment data)
- **Relationships:** 
  - Customers/Suppliers can have multiple contacts and vehicles
  - Vehicles belong to Customers or stand-alone, but a vehicle is linked to only one active customer at a time (BR-25)
- **Business Rules:**  
  - BR-21: Unique (name, main contact number) for customers  
  - BR-22: Suppliers cannot be deactivated if referenced in active transactions  
  - BR-23: Contact must have at least one valid phone/email  
  - BR-24/BR-132: Only supervisor/admin may merge duplicates; merging is fully logged  
  - BR-25: Vehicle linked to one active customer  
  - BR-26/BR-27: Attempts to create duplicates prompt warnings; bulk import validates uniqueness  
  - BR-28/BR-130: All edits to customer/supplier/contact logged with user/time  
  - BR-29: Sensitive contact data export only by authorized users  
  - BR-30: Validation rules for entry are admin configurable  
  - BR-131: Audit/change logs accessible only to authorized users  
  - BR-132: Duplicate merge/removal must be logged in detail  
  - BR-133: Audit logs retained per company policy

#### 1.2.3 Document & Attachment Management

- **Core Entities:** AttachmentMaster, AdditionalRemarks, Document01, DocHead
- **Relationships:** 
  - Attachments are linked to transactions, orders, or master records
  - Additional remarks are tied to user and timestamp
- **Business Rules:**  
  - BR-31: Only users with proper permission may upload/view/edit/delete  
  - BR-32: Attachments always tied to at least one valid transaction/order  
  - BR-33: Each document records user/upload date/version  
  - BR-34: All remarks attributed to user/time  
  - BR-35: Deleted attachments/remarks not restorable by standard users  
  - BR-36: Batch ops (del/download) require confirmation  
  - BR-37/BR-134/BR-136: Audit trails on all edits/deletions, cannot be deleted except by policy  
  - BR-38: Document header/category structure as set by admin  
  - BR-135: Audit log access restricted  
  - BR-136: Audit logs only deleted according to policy

#### 1.2.4 Job, Work Order & Estimation Management

- **Core Entities:** Estimation01, Estimation02, SalesOrdr01, SalesOrdr02, jobInProgress, AssignedJobs, WorkInProgress, salesOrdrStatusDtl, salesOrdrStatusHead, Omasters (StaffSql)
- **Relationships:** 
  - Estimations are tied to customers, vehicles, and result in job/work orders
  - Work orders/jobs are assigned to staff/technicians
  - Status tracking is via status history tables
- **Business Rules:**  
  - BR-39: Estimation must have full details before submitting  
  - BR-40: Only supervisors/admins approve/reject estimations  
  - BR-41: Status updates only by assigned/authorized users  
  - BR-42: Inactive statuses cannot be assigned  
  - BR-43: Max active jobs/user without override [confirmation needed]  
  - BR-44: Reporting limited to department/scope  
  - BR-45/BR-130/BR-132: All job/assignment/approval changes logged with details  
  - BR-46: Cannot mark job complete if details missing  
  - BR-47: Users notified within 5 min of assignment  
  - BR-48: Digital signature required on completion  
  - BR-49: Mobile access requires MFA  
  - BR-50: Only admin may edit master list of statuses
  
#### 1.2.5 Sales Order, Delivery, and Invoicing

- **Core Entities:** SalesOrdr01, SalesOrdr02, Delivery01, Delivery02, Sales01, Sales02, Sales01CancelledInvoice, Customer, Omasters, Vehicles
- **Relationships:** 
  - Sales orders reference customers, items, vehicles, statuses
  - Delivery notes cannot exist without a valid sales order
  - Invoices linked to delivery notes and sales orders
- **Business Rules:**  
  - BR-51: Cannot delete order if delivery note exists  
  - BR-52: Must complete all required fields to submit  
  - BR-53: Only authorized roles can change assignment/status  
  - BR-54: Order confirmation emails sent automatically  
  - BR-55: All delivery notes digital & retained for audit  
  - BR-56: Order status changes are fully logged  
  - BR-57: Delivered orders cannot have further edit to product/qty  
  - BR-58: Only admins access summary sales order reports  
  - BR-59: Discount/tax calculated by company-approved formulas  
  - BR-60: Each delivery note references valid order/customer

#### 1.2.6 Purchase & Procurement Management

- **Core Entities:** LocalPurchase01/02, PurchaseDO01/02, LpoIssue01/02, QtnRequest01/02, Porder01/02, Supplier, Items (for PO lines), Omasters, PurchaseVehicleLink
- **Relationships:** 
  - Purchase orders reference suppliers and must be unique
  - Delivery orders cannot exist without a purchase order
- **Business Rules:**  
  - BR-61: Supervisor approval required for large-value POs  
  - BR-62: Each delivery order links to an existing PO  
  - BR-63: Goods received must match purchase order items/quantities  
  - BR-64: Role-based access for procurement actions  
  - BR-65: Supporting documents required for high-value orders  
  - BR-66: Purchase order numbers unique  
  - BR-67: Cannot delete approved POs/DOs  
  - BR-68: All changes fully audited  
  - BR-69: Overdue DO alerts to purchaser  
  - BR-70: Approval workflow config only by admin

#### 1.2.7 Inventory, Stock, and Item Management

- **Core Entities:** Items, StockTransaction, StockIn01/02, StockOut01/02, StockOpn01/02, ItemTransaction_Checking, Partsavailable01/02, CustomerVehicle, Vehicles, Recomondation
- **Relationships:** 
  - Items can be linked to multiple transactions (in/out/adjustment)
  - Reorder and aging analytics tie Items to Partsavailable, StockTransaction, and alerting logic
- **Business Rules:**  
  - BR-71: Stock in requires item, qty, date, warehouse  
  - BR-72: Cannot issue stock beyond available balance  
  - BR-73: Physical adjustment requires supervisor approval, audit trail  
  - BR-74: Use selected valuation methods for stock value  
  - BR-75: Alert when inventory falls below threshold  
  - BR-76: All stock movements/changes/deletes fully logged  
  - BR-77: Edit/approve/export of sensitive data by permission  
  - BR-78: Mobile stocktaking inputs validated  
  - BR-79: Prevent duplicate adjustment for same item/location/period  
  - BR-80: Role checking for inventory report/export

#### 1.2.8 Banking, Cash Book, and Reconciliation

- **Core Entities:** ACMASTER, ACDETAILS, Branch, CustBill01/02, Supplier, Account/Bank heads, reconcilation logs, Omasters
- **Relationships:** 
  - ACMASTER is the voucher/batch header; ACDETAILS are line items
  - Bank accounts and cash books mapped to ACHEAD entries, reconciliation to transaction logs
- **Business Rules:**  
  - BR-81: Only proper finance/bank roles can edit/reconcile  
  - BR-82: Unreconciled transactions must be cleared/documented within 3 days  
  - BR-83: All reconciliation actions logged  
  - BR-84: CBPBook/PendingBillsLetter report access by permission  
  - BR-85: No finalization without serial numbers  
  - BR-86: Bank statement import passes validation  
  - BR-87: Exceptions/alerts for unresolved reconciliation  
  - BR-88: Help available on main banking/recon screens  
  - BR-89: Advanced reporting/designer access for assigned users

#### 1.2.9 Accounts, Ledgers, and Financial Structure

- **Core Entities:** ACHEAD, AcGroupLink, AcTree, ACMASTER, ACDETAILS, AcVerification, tempMarginReport, Profit/Loss, audit tables (ac01log, ac02Log, AccountsLog, AcHeadDeleteLog)
- **Relationships:** 
  - ACHEAD forms hierarchy, with AcGroupLink/AcTree defining parent/child/group structures
  - ACMASTER/ACDETAILS — main accounting voucher pattern
- **Business Rules:**  
  - BR-90: Account names must be unique in group  
  - BR-91: Referenced accounts cannot be deleted, only deactivated  
  - BR-92: Parent heads only for valid/active accounts  
  - BR-93: Account creation requires name, type, group, status  
  - BR-94: Only assigned permissions may manage accounts/heads  
  - BR-95: All account head changes audited  
  - BR-96: All ledgers on valid, active accounts  
  - BR-97: Bulk import validates required fields, detects duplicates  
  - BR-98: Import/export errors trigger supervisor notification  
  - BR-99: Orphaned account heads flagged for correction

#### 1.2.10 Receipts, Payments, Petty Cash

- **Core Entities:** ACMASTER, ACDETAILS, CustBill01/02, SuppBill01/02, Cash book, Petty cash, Voucher tables (BulkJournals01/02, PDC*, temp tables)
- **Relationships:** 
  - Receipt entries, payment entries, and petty cash reference customer/supplier/accounts
- **Business Rules:**  
  - BR-100: No payment/receipt can finalize without supervisor/admin  
  - BR-101: Allocations must accurately reference payees  
  - BR-102: Settled/posted transactions cannot be edited or deleted  
  - BR-103: Pending entries get approval prior to posting  
  - BR-104: Petty cash never negative  
  - BR-105: Only permitted roles may access/print backup reports  
  - BR-106: Payment status from external sources is authoritative  
  - BR-107: All changes/audits must record user/time/action  
  - BR-108: Payment/receipt API ops enforce permission, log every outcome  
  - BR-109: Advanced custom/design/report functions require explicit permission

#### 1.2.11 Journal Voucher & Transaction Entry

- **Core Entities:** ACMASTER, ACDETAILS, BulkJournals01/02, tempMarginReport, voucher detail reporting
- **Relationships:** 
  - Vouchers can be approved, posted, or remain draft/pre-final
- **Business Rules:**  
  - BR-110: Debits/credits must balance  
  - BR-111: Voucher numbers unique/year  
  - BR-112: Only supervisors+ can approve/reject batches  
  - BR-113: All required fields must be completed  
  - BR-114: Full audit trail on all voucher changes  
  - BR-115: Attachments only in allowed formats  
  - BR-116: Posting via API for authorized users/systems only  
  - BR-117: Role-based report access  
  - BR-118: Only authorized batch import/approval/deletion  
  - BR-119: Draft voucher only visible to creator

#### 1.2.12 Reporting, Statements & Analytics

- **Core Entities:** All *_Sql and *_Report views, PLReportTempTable, report logs
- **Relationships:** 
  - Reports reference all major modules; audit and export records link to user
- **Business Rules:**  
  - BR-120: Only users with defined roles may access statutory/financial reports  
  - BR-121: All report parameters required/validated  
  - BR-122: Reports use up-to-date data  
  - BR-123: Scheduling only for supervisors/admins  
  - BR-124: Report output available in Excel and PDF  
  - BR-125: Statement must match stationery/plain format  
  - BR-126: Report gen/export/email events logged with all metadata  
  - BR-127: Template creation/modification by admin/designer  
  - BR-128: Tests/backups/alternates for admin only  
  - BR-129: Scheduling failures trigger alert

#### 1.2.13 Audit Logging & Change Tracking

- **Core Entities:** AccountsLog, AcHeadDeleteLog, UserLog, ac01log, ac02Log, loginDetails, etc.
- **Relationships:** 
  - All sensitive actions are traced by user/time/detail, available for compliance reporting
- **Business Rules:** 
  - BR-130: ALL changes to accounts/customers/suppliers must be fully recorded with user details  
  - BR-131: Only authorized (supervisor, admin) may view/export audit/change logs  
  - BR-132: Removal/merge of duplicates must be fully logged  
  - BR-133: Audit log retention by company/legal standards  
  - BR-134: Suspicious/high-risk activities must alert supervisors/admins  
  - BR-135: Access to log data must itself be auditable/restricted  
  - BR-136: Audit logs only removable via permitted archival policies  
  - BR-137: All audit-related SPs available via API

#### 1.2.14 Notifications, Internal Communication

- **Core Entities:** MailTable, MailFilterTable, Read Offline Message, MailCheck, MailRead
- **Relationships:** 
  - MailTable stores user/system notifications and messages
- **Business Rules:** 
  - User/system notifications for password change, job assignment, overdue, etc. as per above module rules

---

### 1.3 System Constraints

Copied exactly from the PRD "Assumptions & Constraints", "Non-Functional Requirements", and "Access Control Matrix":

#### Security

- Password complexity: Minimum length and must contain upper/lowercase, digit, special char (BR-03, BR-15)
- Account lockout after configurable failed login attempts (BR-02)
- Session expiry after inactivity (BR-05)
- Role-based access control on all routes/operations (BR-06, BR-77, BR-81, BR-120, BR-131, etc.)
- Token expiration and refresh for API sessions

#### Data Integrity & Compliance

- No schema migrations, no direct table changes, DB is preserved exactly
- All edits, deletions, postings logged with user/timestamp/action/reason
- All audit/change logs retained per compliance (BR-133)
- Audit log viewing/deletion is restricted to supervisors/admin and is itself logged (BR-135, BR-136)

#### Performance

- System dashboard load: < 2 seconds
- Save/update operation: < 1 second
- All report exports: within 10 seconds
- Uptime > 99% during business hours

#### Compliance

- All sensitive changes/rules must be enforced for data protection and audit
- Regulatory compliance across audit, reporting, retention, and access

#### No Feature Regressions

- Every operational, help, audit, and admin feature referenced in the PRD must be retained
- Export/reporting completeness: every named report must be available as in legacy

#### Roles & Permissions

- Roles: Standard User, Supervisor, Administrator (see PRD matrix below)
- Permissions: Assigned as per PRD "Access Control Matrix," including on reporting, advanced finance, user management, audit trail, report designer
- Highest access level is applied when user has multiple roles (BR-16)

#### Access Control Matrix (condensed per PRD table)

| Feature                           | Standard User | Supervisor      | Administrator |
|-----------------------------------|:-------------:|:---------------:|:-------------:|
| User & Role Management            |     None      |   View Only     |     Full      |
| Finance, Sales, CRM, Inventory    |     Full      |     Full        |     Full      |
| Purchase, Reconciliation, Ledger  |   View Only   |     Full        |     Full      |
| Audit Logging/History             |     None      |   View Only     |     Full      |
| Reporting (Basic, Export, Design) |  View/Export  |     Full        |     Full      |
| Advanced/report designer/audit    |     None      |     By Role     |     Full      |

- Only administrators may assign/modify roles or permissions (BR-11)
- Temporary user access (e.g. for contractors) expires automatically (BR-19)

---

#### PRD Gaps & Inferred Requirements

All gaps/inferred/best practice notes below are direct from the PRD Gaps section.  
- For [IN SCOPE]: These are required for v1.0.  
- For [DEFERRED]: Clear explicitly if not in v1.0.

**In Scope for v1.0:**
- SSO/MFA support for admin/high-privilege roles [BEST PRACTICE]
- Automated suspicious-activity notification to supervisors/admin [INFERRED]
- Real-time audit log retention rules for compliance [INFERRED]
- Bulk import/report error notifications via email/system inbox [INFERRED]
- User-driven conflict resolution for record merges (customer, supplier, vehicle) [IN SCOPE]
- Notification integration for critical access and data change events [BEST PRACTICE]
- Fine-grained, object-level access control for advanced reporting/image/docs [IN SCOPE]
- Real-time API for user data sync to external systems (e.g., HRIS) [IN SCOPE]

**Explicitly Deferred for Future Phases:**
- Workflow visual designer, self-service report designer (beyond Save/Load/Export for supervisors) [DEFERRED]
- Mobile-native UI (web only v1.0) [DEFERRED]
- Advanced machine learning/analytics [DEFERRED]
- Third-party payment gateway integration [DEFERRED]
- Full external ERP/CRM integration (API endpoints defined, but not active until future phase) [DEFERRED]

---

#### Document/Invoice/Transaction Types (PRD Data Model Coverage)

- Journal Vouchers & Accounting: ACMASTER, ACDETAILS, BulkJournals01/02, PDCBulk, Receipts (CustBill), Payments (SuppBill)
- Orders: SalesOrdr01/02, Delivery01/02, LocalPurchase01/02, PurchaseDO01/02, LpoIssue, QtnRequest, Prodrequest
- Invoice/Bill: Sales01, Sales02, CustBill, SuppBill, ProformaSales, InsrInvoice, Margin/PL Report Temp
- Stock/Inventory: StockTransaction, StockIn01/02, StockOut01/02, Physical Stock Adjustment
- Attachment/Document: AttachmentMaster, AdditionalRemarks, Document01/DocHead
- Contact/Vehicle/CRM: Customer, Supplier, CustomerVehicle, Vehicles, Staff, Area, Department, Section
- Audit/Auxiliary: UserLog, loginDetails, AcHeadDeleteLog, AccountsLog, audit tables

---

## SECTION 2 — ARCHITECTURE

### 2.1 High-Level Architecture

**DB-Preserve, REST API, Modern Frontend**

```
+-----------------+            +------------------------------------------+           +-----------------------+
|    Frontend     | <--------> |      Node.js API Layer (Express, TS)     | <-------> |   SQL Server (SP-Only)|
|  (React 19, TS) |  HTTPS      |  - All API calls via REST endpoints      |   ODBC    |   (NO direct table,   |
| - Auth, RBAC    |             |  - All DB access via callProcedure()    |           |    SP calls only!)    |
| - Pages/Routes  |             |  - API-layer RBAC                       |           +-----------------------+
+-----------------+             |  - Calls only those SPs listed in DB_   |
                                |    CONNECTION_SPEC.md                   |
                                +------------------------------------------+
```

- **Frontend:** React 19 + TypeScript + Vite, CSS Modules, Zod validation, TanStack Query, React Hook Form
- **Backend:** Node.js 20+, TypeScript, Express, Repository pattern with `callProcedure()` to invoke stored procs
- **DB:** SQL Server (connection via mssql, see .env example from DB_CONNECTION_SPEC.md)
- **Authentication:** JWT (access + refresh tokens), password hashing (bcrypt), RBAC; supports SSO/MFA if needed
- **API:** RESTful, versioned at `/api/v1/`, only exposes endpoints mapped to stored procs; never raw table access

### 2.2 Folder & Project Structure

**Monorepo or single repo, as per standards:**

```
/
|-- backend/
|   |-- src/
|   |   |-- controllers/      # API route handlers per module (calls ONLY services)
|   |   |-- services/         # Business logic, all RBAC checks, calls only repository
|   |   |-- repositories/     # One per module/table; calls callProcedure()
|   |   |-- db/
|   |   |   |-- connection.ts # Setup, pool config, .env use
|   |   |   |-- callProcedure.ts # Helper for stored proc invocation
|   |   |-- middlewares/
|   |   |-- utils/
|   |   |-- types/
|   |   |-- app.ts            # Express setup
|   |   |-- server.ts         # Entrypoint
|   |-- .env                  # See below
|   |-- ...                   # Dockerfile, tests/
|
|-- frontend/
|   |-- src/
|       |-- pages/            # One directory per route/page, screen components only
|       |-- components/       # Shared, atomic UI components, pure and styled
|       |-- api/              # Typed API clients for each endpoint/spec
|       |-- hooks/
|       |-- stores/           # Zustand for auth, etc.
|       |-- utils/
|       |-- styles/
|-- deployment/
|   |-- docker-compose.yml    # Backend (no DB), Nginx, etc.
|   |-- nginx.conf
|-- .github/
|   |-- workflows/ci.yml      # CI pipeline, run/test/deploy
|-- README.md
|-- PROJECT_OVERVIEW.md       # This file!

```

### 2.3 Technology Versions and Choices

- **Frontend:**  
  - React 19  
  - Vite  
  - TypeScript (>=5.0)  
  - Zod (validation)  
  - React Hook Form  
  - TanStack Query (data fetching)  
  - Zustand (state)  
  - Lucide Icons/CSS Modules  
  - Only modules: never use legacy context/hooks for auth

- **Backend:**  
  - Node.js 20+  
  - Express  
  - TypeScript  
  - mssql (DB driver)  
  - JWT (passport/jose)  
  - bcrypt for password hashing  
  - Nodemailer/SMS adapter (for notifications)  
  - Jest (testing)  
  - ESLint/Prettier

- **DB Connectivity:**  
  - ODBC/ADO for mssql, using .env config  
  - `callProcedure()` helper in all repository access  
  - Never raw SQL; never new tables; never migrations

### 2.4 Service Boundaries

- **Per Domain:**  
  - User Service  
  - Customer Service / Supplier Service  
  - Job/WorkOrder/Estimation Service  
  - Order & Sales Service  
  - Procurement/Purchase Service  
  - Inventory/Stock Service  
  - Banking/Finance Service  
  - Accounts/Ledger Service  
  - Receipts/Payments Service  
  - Reporting Service  
  - Audit/ChangeLog Service  
  - Document/Attachment Service  
  - Notification Service (mail/message)

Each service maps exactly to the business domains above and only calls its repository. API-layer RBAC in services, not in controllers.

### 2.5 Environment Configuration

**.env variables (see DB_CONNECTION_SPEC.md):**

```
DB_TYPE=sqlserver
DB_HOST=192.168.0.235\sql2008
DB_NAME=autodealer
DB_USER=sa
DB_PASSWORD=p@ssw0rd

JWT_SECRET=**SET_THIS**
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_FROM_ADDRESS=no-reply@ibosuite.in
EMAIL_SMTP_HOST=**SET_THIS**
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=**SET_THIS**
EMAIL_SMTP_PASS=**SET_THIS**

NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000

LOG_LEVEL=info
SESSION_TIMEOUT_MINUTES=30
MAX_FAILED_LOGINS=5
PASSWORD_POLICY="minLength:10,uppercase:1,lowercase:1,number:1,special:1"
```

### 2.6 Deployment Approach

- **Dockerized:**  
  - Backend runs behind nginx, connects out to existing SQL Server (no DB container)
  - .env file injected at build/deploy
  - Health check endpoints for monitoring
  - CI/CD pipeline via GitHub Actions (build, test, deploy stages), see deployment-setup.md

- **Secrets:**  
  - All sensitive config (DB_PASSWORD, JWT_SECRET) must come from environment  
  - Never checked into version control

- **Frontend deploy:**  
  - Static assets (Vite build) served by nginx, or via Vercel/Netlify if public
  - Source maps and error boundaries always enabled in production

---

**This file is the definitive system blueprint for the coding agent.**  
— All business logic is bounded by the domains, roles, and rules described above.  
— The prescribed technology stack, folder layout, connectivity, and deployment approach are final and unambiguous.  
— No database schema change or migration is permitted under any circumstance.
