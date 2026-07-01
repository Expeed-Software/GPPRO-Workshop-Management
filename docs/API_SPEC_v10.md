<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v10
  Generated at   : 2026-06-24 16:25:27 UTC
-->

# API_SPEC.md

---

## SECTION 1 — STORED PROCEDURE TO ENDPOINT MAPPING

> **Legend:**  
> - All stored procedures from DB_CONNECTION_SPEC.md are listed below.
> - Method/Path is kebab-case, plural, under `/api/v1/`
> - Request parameters mapped exactly (specify type, required, location)
> - Response JSON fields match return columns
> - Roles: Administrator = full, Supervisor = most, Standard = limited
> - All business rules and functional requirements (FR-XX) referenced
> - All error cases listed per endpoint
> - All endpoints are JWT-authenticated except for sign-in and password-reset

---

### 1. User Authentication & Account Management

> **FR coverage:** FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08, FR-09, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-18, FR-19, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25

**Note:** Base user authentication and password features are handled in the API (no stored procedure used directly, see Section 2 for account write APIs and Section 3 for code pattern).

#### POST /api/v1/auth/sign-in
- Authenticates user login (FR-01, FR-13)
- Body: `{ identifier (string), password (string) }`
- Response: `{ token, refreshToken, user: { id, name, roles } }`
- Errors: 401 INVALID_CREDENTIALS, 403 ACCOUNT_LOCKED, 423 MFA_REQUIRED

#### POST /api/v1/auth/sign-out
- Invalidates refresh token/session (FR-15)
- Body: `{ refreshToken }`
- Response: `{ success: true }`
- Errors: 400 INVALID_TOKEN

#### POST /api/v1/auth/password-reset
- Initiates password reset (FR-08)
- Body: `{ email }`
- Response: `{ message: string }`
- Errors: 404 USER_NOT_FOUND

#### POST /api/v1/auth/password-reset/confirm
- Completes reset (FR-03)
- Body: `{ token, newPassword }`
- Response: `{ success: true }`
- Errors: 400 INVALID_TOKEN, 422 WEAK_PASSWORD

#### POST /api/v1/auth/change-password
- Auth required
- Body: `{ oldPassword, newPassword }`
- Response: `{ success: true }`
- Errors: 400 WRONG_OLD_PASSWORD, 422 WEAK_PASSWORD

#### POST /api/v1/auth/lock-account
- Admin only (lock a user — FR-06, FR-07)
- Body: `{ userId }`
- Response: `{ success: true }`
- Errors: 404 USER_NOT_FOUND

#### POST /api/v1/auth/unlock-account
- Admin only (unlock a user — FR-07)
- Body: `{ userId }`
- Response: `{ success: true }`
- Errors: 404 USER_NOT_FOUND

#### POST /api/v1/auth/mfa/send
- Sends MFA code for login or sensitive actions (FR-10)
- Body: `{ userId, method }`
- Response: `{ success: true }`
- Errors: 404 USER_NOT_FOUND

#### POST /api/v1/auth/mfa/verify
- Verifies MFA code (FR-10)
- Body: `{ userId, code }`
- Response: `{ success: true }`
- Errors: 401 INVALID_CODE

#### GET /api/v1/userlog
- Gets user authentication log/audit (FR-11, FR-12, FR-20)
- Query: `?userId&fromDate&toDate&type`
- Response: `{ data: [ { id, userId, action, timestamp, ip, status, remarks } ], meta: { total, page } }`
- Role: Supervisor, Administrator
- Errors: 403 FORBIDDEN

**SSO/OAuth2 endpoints are left for Section 2, optional, since these are not part of the legacy DB but referenced in FR-09/21.**

---

### 2. User List & Management

> **FR coverage:** FR-26–FR-53

#### GET /api/v1/users
- List users, filter by name/email/role/status/date (FR-26)
- Query: `?name&role&status&page&limit`
- Response: `{ data: [ { id, name, email, phone, roles, status, createdAt, lastLoginAt, createdBy, updatedBy } ], meta: { total, page } }`
- Role: Supervisor, Administrator

#### POST /api/v1/users
- Create user (FR-27)
- Body: `{ name, email, phone, roles[], password, status }`
- Response: `{ id, ...userFields }`
- Role: Administrator
- Errors: 409 DUPLICATE_EMAIL

#### PATCH /api/v1/users/:id
- Edit user (FR-28)
- Body: `{ name, email, phone, roles, status }`
- Response: `{ id, ...userFields }`
- Role: Administrator, Supervisor (self/limited)

#### PATCH /api/v1/users/:id/status
- Activate/deactivate user (FR-29, FR-45)
- Body: `{ status: 'active'|'inactive'|'locked' }`
- Response: `{ success: true }`
- Role: Administrator, Supervisor (cannot escalate roles)
- Errors: 400 BAD_STATUS

#### POST /api/v1/users/import
- Bulk import from CSV, Excel (FR-33)
- Body: (multipart, file)
- Response: `{ importedCount, errors: [ { row, error } ] }`
- Role: Administrator

#### GET /api/v1/users/export
- Export user list (FR-34) — returns file link or streamed CSV/Excel
- Query: `?format=csv|excel`
- Response: file download

#### GET /api/v1/users/:id
- Get detailed user info (FR-32, FR-46)
- Response: `{ id, name, email, phone, roles, status, createdAt, updatedAt, createdBy, updatedBy, lastLoginAt }`
- Role: Any (authorized), see own+as permitted

#### PATCH /api/v1/users/:id/password
- Admin/supervisor can reset user password (FR-31)
- Body: `{ newPassword }`
- Response: `{ success: true }`
- Role: Administrator

#### PATCH /api/v1/users/me
- Self-update for profile fields (optional, FR-51)
- Body: `{ name, phone }`
- Response: full user object
- Role: Own only

#### GET /api/v1/employees
- List employees/staff (FR-39, FR-40)
- Query: `?dept&role&status&page&limit`
- Response: array, plus file exports for reports

#### GET /api/v1/audit/user
- User/role/audit change logs (FR-35, FR-36, FR-41, FR-43, FR-44, FR-46, FR-54, FR-84)
- Query: `?userId&dateRange&type`
- Response: audit entries

#### PATCH /api/v1/users/roles
- Custom/bulk role assignment (FR-37, FR-44, FR-49)
- Body: `{ userIds: [], roles: [] }`
- Response: `{ updated: n }`
- Only Administrator

#### PATCH /api/v1/users/bulk-status
- Bulk activate/deactivate (FR-45)
- Body: `{ userIds: [], status }`
- Role: Administrator

---

### 3. Customer & Supplier Management

> **FR coverage:** FR-54–FR-85

#### GET /api/v1/customers/overview
- Paginated customer list/overview (sp: CustomerOverview)
- Query: `?page&limit&filter`
- Response: paged array with balances, outstanding
- Roles: Standard, Supervisor, Administrator

#### POST /api/v1/customers
- Create customer record (write-through wrapper, Section 2)
- Body: `{ name, contact, address, ... }`
- Response: customer object
- Role: Standard+, Admin

#### PATCH /api/v1/customers/:id
- Edit/update customer record
- Body: update object
- Response: customer object
- Role: Standard+, Admin

#### PATCH /api/v1/customers/:id/status
- Deactivate, activate customer
- Body: `{ status }`
- Response: `{ success }`

#### DELETE /api/v1/customers/:id
- Delete (if permitted by business rules)

#### POST /api/v1/customers/merge
- Merge duplicate customers
- Body: `{ masterId, duplicateIds, fieldMap }`
- Response: merged entity

#### GET /api/v1/suppliers/overview
- Like customers — paginated

#### POST /api/v1/suppliers
- Create supplier

#### PATCH /api/v1/suppliers/:id
- Edit/update

#### PATCH /api/v1/suppliers/:id/status

#### DELETE /api/v1/suppliers/:id

#### POST /api/v1/suppliers/merge

#### GET /api/v1/customers/agewise-summary
- Agewise customer summary (age buckets, by FR-68, sp: AgewiseSummary)
- Query: date, actual_date, filter
- Response: array

#### GET /api/v1/suppliers/agewise-summary
- Agewise supplier summary

#### GET /api/v1/customers/:id
- Get customer details

#### GET /api/v1/suppliers/:id
- Get supplier details

#### POST /api/v1/suppliers/import
- Bulk import (FR-70)

#### PATCH /api/v1/suppliers/:id/tags
- Assign tags (FR-76)

#### GET /api/v1/customers/list
- Exportable list

#### GET /api/v1/suppliers/list

#### GET /api/v1/customers/search
- Search customers, filter by fields

#### GET /api/v1/suppliers/search

#### GET /api/v1/contacts
- List contacts/linked

#### POST /api/v1/contacts
- Add new contact

#### PATCH /api/v1/contacts/:id
- Update contact

#### DELETE /api/v1/contacts/:id
- Delete contact

#### POST /api/v1/contacts/check-duplicate
- Duplicate check

#### GET /api/v1/vehicles
- List customer vehicles

#### POST /api/v1/vehicles
- Add vehicle

#### PATCH /api/v1/vehicles/:vehId
- Update vehicle

#### DELETE /api/v1/vehicles/:vehId
- Delete vehicle

#### POST /api/v1/vehicles/merge

#### GET /api/v1/vehicles/search
- By registration, model, customer

#### GET /api/v1/customer-documents
- Linked documents per customer/supplier (see Section 2 for uploads)

---

### 4. Document & Attachment Management

> **FR coverage:** FR-86–FR-112

#### POST /api/v1/attachments
- Upload attachment(s) to transaction/order (multi-file, write-through wrapper)
- Body: file upload, metadata: `{ transactionId, orderId, docType, tags, ... }`
- Response: `{ id, url, ... }`

#### DELETE /api/v1/attachments/:id
- Delete attachment(s)
- Role-based

#### PATCH /api/v1/attachments/:id
- Edit metadata/tags

#### GET /api/v1/attachments
- List/search/filter attachments
- Query: file name, metadata
- Response: array (filtered)

#### GET /api/v1/attachments/recent
- List recent docs worked on

#### POST /api/v1/attachments/bulk
- Bulk upload

#### DELETE /api/v1/attachments/bulk
- Bulk delete

#### GET /api/v1/attachments/:id/preview
- Preview function (pdf, image inline)

#### GET /api/v1/remarks
- List all additional remarks filterable by transaction, user, date

#### POST /api/v1/remarks
- Add remark to transaction

#### PATCH /api/v1/remarks/:id
- Edit remark

#### DELETE /api/v1/remarks/:id
- Delete remark

#### GET /api/v1/remarks/history
- All history (audit)

#### GET /api/v1/documents
- List, search, document templates (metadata)

#### POST /api/v1/documents
- Create doc (write-through)

#### PATCH /api/v1/documents/:id
- Edit doc metadata/status

#### DELETE /api/v1/documents/:id

#### PATCH /api/v1/documents/:id/status
- Workflow status

---

### 5. Job, Work Order & Estimation Management

> **FR coverage:** FR-113–FR-137

#### GET /api/v1/estimations/:jobCardNo
- Procedure: spGetEstmationDetails
- Path param: jobCardNo (string)
- Response: details, approved, vehicle, staff, parts, etc.

#### POST /api/v1/estimations
- Create new estimation (write-through, Section 2)
- Body: all required estimation fields

#### PATCH /api/v1/estimations/:id
- Edit/update

#### POST /api/v1/estimations/:id/submit
- Submit for approval

#### POST /api/v1/estimations/:id/approve
- Approve/reject estimation

#### GET /api/v1/jobs/work-status
- spGetWorkStatus (returns all non-delivered jobs)
- Query: status filters, assigned user

#### GET /api/v1/jobs/running
- GetRunningJobsForWorkStatus; params for filters

#### PATCH /api/v1/jobs/:id/status
- Update job status (write-through)

#### PATCH /api/v1/jobs/:id/progress
- Update job progress/notes

#### POST /api/v1/jobs/:id/assign
- Assign job to staff

#### GET /api/v1/jobs/parts-not-available
- spPartsNotAvailJobs

#### GET /api/v1/jobs/work-status-overview
- spWorkStatusOverviewForControlRoom

#### GET /api/v1/jobs/completed
- JObFinished

#### PATCH /api/v1/jobs/:id/complete
- Mark job as complete, require digital signature

#### GET /api/v1/jobs/status-history
- List all status/assignment history

#### GET /api/v1/job-status
- List/maintain master job statuses

#### POST /api/v1/job-status
- Add job status (write-through)
- (Section 2 for write)

#### PATCH /api/v1/job-status/:id
- Edit/activate/deactivate

---

### 6. Order & Sales Management

> **FR coverage:** FR-138–FR-161

#### GET /api/v1/sales/orders
- Query: status, customer, date, filters, pagination
- Response: array

#### POST /api/v1/sales/orders
- Create sales order (write-through)

#### PATCH /api/v1/sales/orders/:id
- Update sales order

#### PATCH /api/v1/sales/orders/:id/status
- Update order status

#### PATCH /api/v1/sales/orders/:id/customer
- Change/assign customer

#### DELETE /api/v1/sales/orders/:id
- Cancel/void order (business rules restrict deletion)

#### GET /api/v1/sales/orders/export
- Exportable report

#### GET /api/v1/sales/orders/:id/delivery-notes
- List or get delivery notes

#### POST /api/v1/sales/orders/:id/delivery-notes
- Create delivery note

#### GET /api/v1/sales/orders/:id/audit
- Order audit trail

#### GET /api/v1/sales/orders/status-summary
- Status summary report

#### PATCH /api/v1/sales/orders/bulk-status
- Bulk update statuses

#### GET /api/v1/sales/delivery-log
- List/export all delivered sales orders

#### POST /api/v1/sales/orders/status-update
- External status update (webhook style)

---

### 7. Purchase & Procurement Management

> **FR coverage:** pendingPurchaseDO, LocalPurchase01Sql, PurchaseDO01Sql, Porder01Sql, + writes

#### GET /api/v1/purchase/pending-delivery-orders
- Call: PendingPurchaseDO
- Query: mSuppID
- Response: list (PDONo, ID, SuppId, etc.)

#### POST /api/v1/purchase/orders
- Create purchase order: foreign/local (write-through)

#### PATCH /api/v1/purchase/orders/:id
- Update details/status

#### GET /api/v1/purchase/orders/:id
- Get purchase order

#### GET /api/v1/purchase/orders
- List/filter

#### DELETE /api/v1/purchase/orders/:id
- Remove order if permitted by status

#### GET /api/v1/purchase/orders/export
- Export/exportable report

#### GET /api/v1/purchase/do/:PDONo
- Get delivery order

#### POST /api/v1/purchase/do/:PDONo/receive
- Record receipt

#### GET /api/v1/purchase/do/search
- Search by status/filter

---

### 8. Stock & Inventory Management

#### GET /api/v1/stock/last-transaction
- spStockLastTrans
- Query: StockDate

#### GET /api/v1/stock/availability
- GetSockQty

#### GET /api/v1/stock/valuation
- spStockValuation

#### GET /api/v1/stock/aging
- spStockAgingReport

#### GET /api/v1/stock/fast-moving
- spFastMovingItems

#### GET /api/v1/stock/movement
- spStockMovementRpt

#### POST /api/v1/stock/in
- New stock entry (write-through)

#### POST /api/v1/stock/out
- Issue stock out (write-through)

#### PATCH /api/v1/stock/adjust/:itemCode
- Stock adjustment, count (write-through)

#### DELETE /api/v1/stock/:itemCode
- Delete stock transaction (if permitted, write-through)

#### GET /api/v1/stock/ledger
- stock ledger/report

---

### 9. Banking & Reconciliation

#### GET /api/v1/banking/book-details
- SPCASHBANKDETAILS
- Query: account, fromDate, toDate, type

#### GET /api/v1/banking/transactions
- List transactions

#### GET /api/v1/banking/attachments
- Get reconciliation attachments

#### POST /api/v1/banking/attachments
- Upload reconciliation doc

#### PATCH /api/v1/banking/transactions/:id
- Edit (with audit/write-through)

#### POST /api/v1/banking/reconcile
- Reconcile accounts/period

---

### 10. Ledger & Account Management

#### GET /api/v1/accounts/heads
- AcHeadList (tree/list)

#### GET /api/v1/accounts/:code/balance
- Ac_headBalance, AcClosingBalance, AcOpeningBalance

#### PATCH /api/v1/accounts/:code
- Edit/update account info

#### POST /api/v1/accounts
- Add new account head

#### DELETE /api/v1/accounts/:code
- Delete or deactivate account (business rule: only if not referenced)

#### PATCH /api/v1/accounts/:code/status
- Activate/deactivate

#### GET /api/v1/accounts/summary
- AcSummary

#### GET /api/v1/accounts/summary-balance-sheet
- AcSummary_balansheet, AcSummary_balansheet_New

#### GET /api/v1/accounts/group-balance
- ac_Group_Sum, Ac_GroupTotal

#### GET /api/v1/accounts/agewise-details
- AcAgeWiseDetails

---

### 11. Receipts, Payments & Vouchers

#### GET /api/v1/vouchers
- VoucherList, VoucherList_NEW

#### GET /api/v1/vouchers/pdc
- VoucherList_Pdc

#### GET /api/v1/vouchers/:vsrl/details
- ACDETAILSDET

#### GET /api/v1/vouchers/summary
- VoucherSummary

#### GET /api/v1/vouchers/summary-pdc
- VoucherSummary_PDC

#### GET /api/v1/vouchers/type-list
- PROCVOUCHERLIST

#### POST /api/v1/vouchers
- Bulk journal voucher insert (write-through)

#### PATCH /api/v1/vouchers/:id
- Edit voucher (write-through)

#### DELETE /api/v1/vouchers/:id
- Delete voucher (write-through)

#### GET /api/v1/accounts/:code/receipt-summary
- AcRcptSum

---

### 12. Reporting and Analysis

#### GET /api/v1/customers/outstanding/salesmanwise
- spCustomerOutStandingSalesManwise
- Query: Date

#### GET /api/v1/sales/invoices/summary-by-staff
- spRptSalesManInvoices
- Query: FromDate, ToDate

#### GET /api/v1/sales/monthly-summary
- spMonthlySplitSales

#### GET /api/v1/products/overview
- ProductsOverview
- Query: pagination, filter

#### GET /api/v1/sales/analysis
- SPSALESANALYSISREPORT

#### GET /api/v1/sales/discount-summary
- SPDISCOUNTSUMMARY

#### GET /api/v1/suppliers/outstanding-summary
- spSupplierOutStandingSummary

#### GET /api/v1/sales/category-summary
- spSalesReportCatSub

#### GET /api/v1/sales/labour-parts-report
- spSalesLabourPartsReport

#### GET /api/v1/sales/margin-report
- SP_MarginRpt

---

### 13. Notifications, Mail & Messaging

#### GET /api/v1/mail/count
- MailCheck
- Query: mUserID

#### GET /api/v1/mail
- MailRead
- Query: Uid, Option

#### POST /api/v1/mail
- Send message (write-through)

#### PATCH /api/v1/mail/:id/read
- Mark as read (write-through)

#### DELETE /api/v1/mail/:id
- Delete mail (write-through)

---

## SECTION 2 — APPLICATION-LAYER WRITES (DB-Preserve / Thin Wrappers)

For all tables in WRITE TARGETS BY TABLE where there is NO mapped stored procedure for writes, the following endpoints are defined.
Each is implemented as a thin wrapper stored procedure (if no such SP exists), mapping directly to a RESTful endpoint.

_NOTE: Wherever a matching legacy stored procedure exists for a write, use it. If not, define stored procedure thin wrappers as below._

**The following endpoints WILL exist:**

### User Management/Authentication
- POST /api/v1/users (insert USERS)
- PATCH /api/v1/users/:id (update USERS)
- PATCH /api/v1/users/:id/password (update USERS)
- DELETE /api/v1/users/:id (delete Users)
- PATCH /api/v1/users/:id/unlock (update USERS Option/status = unlock)
- PATCH /api/v1/users/:id/lock (update USERS Option/status = lock)
- PATCH /api/v1/users/:id/roles (update USERS)
- PATCH /api/v1/users/bulk-status (update multiple USERS)

### Customer & Supplier
- POST /api/v1/customers (insert Customer)
- PATCH /api/v1/customers/:id (update Customer)
- DELETE /api/v1/customers/:id (delete Customer)
- POST /api/v1/customers/merge (merge logic, calls update on Customer, deletes duplicate IDs)
- POST /api/v1/suppliers (insert Supplier)
- PATCH /api/v1/suppliers/:id (update Supplier)
- DELETE /api/v1/suppliers/:id (delete Supplier)
- POST /api/v1/suppliers/merge (merge-as-customer)
- PATCH /api/v1/contacts/:id (update Contact)
- DELETE /api/v1/contacts/:id (delete Contact)
- POST /api/v1/contacts (insert Contact)
- POST /api/v1/contacts/merge (merge-contacts)

### Vehicles
- POST /api/v1/vehicles (insert CustomerVehicle)
- PATCH /api/v1/vehicles/:vehId (update CustomerVehicle)
- DELETE /api/v1/vehicles/:vehId (delete CustomerVehicle)
- POST /api/v1/vehicles/merge (merge vehicles/apply update and remove duplicates)

### Jobs/Work Assignment
- POST /api/v1/jobs (insert SalesOrdr01 for work order)
- PATCH /api/v1/jobs/:id (update SalesOrdr01)
- DELETE /api/v1/jobs/:id (delete SalesOrdr01 — business rule: only if not closed)
- POST /api/v1/jobs/:id/assign (insert AssignedJobs)
- PATCH /api/v1/jobs/:id/assignment (update AssignedJobs)
- DELETE /api/v1/jobs/:id/assignment (delete AssignedJobs)
- POST /api/v1/workinprogress (insert WorkInProgress)
- PATCH /api/v1/workinprogress/:id (update WorkInProgress)

### Purchase/Voucher/Finance
- POST /api/v1/purchase/orders (insert LocalPurchase01 etc.)
- PATCH /api/v1/purchase/orders/:id (update LocalPurchase01)
- DELETE /api/v1/purchase/orders/:id (delete LocalPurchase01)
- POST /api/v1/purchase/do (insert PurchaseDO01)
- PATCH /api/v1/purchase/do/:id (update PurchaseDO01)
- DELETE /api/v1/purchase/do/:id (delete PurchaseDO01)
- POST /api/v1/vouchers (insert AcMaster, AcDetails)
- PATCH /api/v1/vouchers/:vsrl (update AcMaster, AcDetails)
- DELETE /api/v1/vouchers/:vsrl (delete AcMaster, AcDetails)
- POST /api/v1/acgrouphead (insert AcGroupHead)
- DELETE /api/v1/acgrouphead/:id (delete AcGroupHead)
- POST /api/v1/achead (insert AcHead)
- PATCH /api/v1/achead/:code (update AcHead)
- DELETE /api/v1/achead/:code (delete AcHead)
- POST /api/v1/actree (insert AcTree)
- DELETE /api/v1/actree/:id (delete AcTree)

### Stock/Inventory
- POST /api/v1/stock/in (insert StockTransaction)
- POST /api/v1/stock/out (insert StockTransaction)
- PATCH /api/v1/stock/:id (update StockTransaction)
- DELETE /api/v1/stock/:id (delete StockTransaction)

### Attachments/Documents/Remarks
- POST /api/v1/attachments (insert AttachmentMaster)
- DELETE /api/v1/attachments/:id (delete AttachmentMaster)
- PATCH /api/v1/attachments/:id (update AttachmentMaster)
- POST /api/v1/remarks (insert AdditionalRemarks)
- PATCH /api/v1/remarks/:id (update AdditionalRemarks)
- DELETE /api/v1/remarks/:id (delete AdditionalRemarks)

### Mail/Messaging
- POST /api/v1/mail (insert MailTable)
- PATCH /api/v1/mail/:id (update MailTable)
- DELETE /api/v1/mail/:id (delete MailTable)

### Bulk/Helper
- POST /api/v1/bulk/users (insert/update USERS with data array)
- POST /api/v1/bulk/customers (insert/update Customer)
- POST /api/v1/bulk/suppliers (insert/update Supplier)
- POST /api/v1/bulk/contacts (insert/update Contacts)
- POST /api/v1/bulk/vehicles (insert/update Vehicles)
- POST /api/v1/bulk/products (insert/update Items)
- PATCH /api/v1/bulk/status (update status of multiple records by IDs on various modules)

---

## SECTION 3 — NODE.JS ENDPOINT IMPLEMENTATION PATTERN

### Example: Calling a Stored Procedure in Express/Node.js

```typescript
import { Request, Response } from "express";
import sql from "mssql";
import { getDbPool } from "../../db/connection";

// Example: GET /api/v1/customers/overview

export async function getCustomerOverview(req: Request, res: Response) {
  try {
    const { page = 1, limit = 30, filter } = req.query;
    const pool = await getDbPool();
    const result = await pool.request()
      .input("PageNumber", sql.Int, page)
      .input("RecodsPerPage", sql.Int, limit)
      .input("HowManyRecords", sql.Int, 0) // For output param, handled below
      .input("WhereCondition", sql.VarChar(8000), filter ?? "")
      .output("HowManyRecords", sql.Int)
      .execute("CustomerOverview"); // Stored procedure name
    res.status(200).json({ data: result.recordset, total: result.output.HowManyRecords });
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: (err as Error).message });
  }
}
```

**General pattern for POST/PUT/DELETE:**

```typescript
export async function createCustomer(req: Request, res: Response) {
  try {
    // Map req.body to SP params
    const pool = await getDbPool();
    const spRes = await pool.request()
      .input("name", sql.VarChar, req.body.name)
      // ...other fields
      .execute("spInsertCustomer"); // Or call insert statement in thin wrapper SP if custom
    res.status(201).json({ id: spRes.output.Id, ...spRes.recordset[0] });
  } catch (err) {
    // Map SQL errors (e.g. number 2627) to 409, etc.
    res.status(500).json({ error: "INTERNAL_ERROR", message: (err as Error).message });
  }
}
```

- **All writes must wrap DB writes by calling thin, auditable SPs with validation.**
- **Always enforce business rules and RBAC authorization at the route handler/service layer.**
- **NEVER run arbitrary SQL or direct table mutations.**

---

## COVERAGE CHECK

### 1. STORED PROCEDURE ENDPOINTS

| Procedure (from DB_CONNECTION_SPEC.md)                      | Endpoint Exists? |
|-------------------------------------------------------------|------------------|
| spCustomerOutStandingSalesManwise                           | ✅ GET /api/v1/customers/outstanding/salesmanwise |
| spRptSalesManInvoices                                       | ✅ GET /api/v1/sales/invoices/summary-by-staff |
| PendingPurchaseDO                                           | ✅ GET /api/v1/purchase/pending-delivery-orders |
| spMonthlySplitSales                                         | ✅ GET /api/v1/sales/monthly-summary |
| PartsAvailability_Sp                                        | ✅ GET /api/v1/parts/availability |
| spStockLastTrans                                            | ✅ GET /api/v1/stock/last-transaction |
| GetSockQty                                                  | ✅ GET /api/v1/stock/availability |
| ac_Group_Sum                                                | ✅ GET /api/v1/accounts/group-balance |
| Ac_GroupTotal                                               | ✅ GET /api/v1/accounts/group-total |
| spGetEstmationDetails                                       | ✅ GET /api/v1/estimations/:jobCardNo |
| SPACTREEVIEW                                                | ✅ GET /api/v1/accounts/tree |
| Ac_headBalance                                              | ✅ GET /api/v1/accounts/:code/balance |
| SPCASHBANKDETAILS                                           | ✅ GET /api/v1/banking/book-details |
| AcAgeWiseDetails                                            | ✅ GET /api/v1/accounts/agewise-details |
| acBal                                                       | ✅ GET /api/v1/accounts/balance |
| AcClosingBalance                                            | ✅ GET /api/v1/accounts/:code/closing-balance |
| spGetVehicleStatus                                          | ✅ GET /api/v1/vehicles/:vehNo/job-status/:jobCardNo |
| AcCurrentTrans                                              | ✅ GET /api/v1/accounts/transactions/current |
| CustomerOverview                                            | ✅ GET /api/v1/customers/overview |
| ACDETAILSDET                                                | ✅ GET /api/v1/vouchers/:vsrl/details |
| AcHeadList                                                  | ✅ GET /api/v1/accounts/heads |
| Opening_Balance_NEW                                         | ✅ GET /api/v1/accounts/opening-balance |
| GetStaffDetFromOrder                                        | ✅ GET /api/v1/orders/:orderId/staff |
| ACMASTERDET                                                 | ✅ GET /api/v1/vouchers/master |
| VoucherList_NEW                                             | ✅ GET /api/v1/vouchers |
| AcOpeningBalance                                            | ✅ GET /api/v1/accounts/:code/opening-balance |
| ProductsOverview                                            | ✅ GET /api/v1/products/overview |
| AcRcptSum                                                   | ✅ GET /api/v1/accounts/:code/receipt-summary |
| AcSummary                                                   | ✅ GET /api/v1/accounts/summary |
| AcSummary_balansheet                                        | ✅ GET /api/v1/accounts/summary-balance-sheet |
| AcSummary_balansheet_New                                    | ✅ GET /api/v1/accounts/summary-balance-sheet-new |
| spGetWorkStatus                                             | ✅ GET /api/v1/jobs/work-status |
| GetRunningJobsForWorkStatus                                 | ✅ GET /api/v1/jobs/running |
| spPartsNotAvailJobs                                         | ✅ GET /api/v1/jobs/parts-not-available |
| spWorkStatusOverviewForControlRoom                          | ✅ GET /api/v1/jobs/work-status-overview |
| JObFinished                                                 | ✅ GET /api/v1/jobs/completed |
| VoucherList                                                 | ✅ GET /api/v1/vouchers |
| VoucherList_Pdc                                             | ✅ GET /api/v1/vouchers/pdc |
| VoucherSummary                                              | ✅ GET /api/v1/vouchers/summary |
| VoucherSummary_PDC                                          | ✅ GET /api/v1/vouchers/summary-pdc |
| InvoicePendingDo                                            | ✅ GET /api/v1/invoices/:orderId/pending-delivery-orders |
| SPSALESANALYSISREPORT                                       | ✅ GET /api/v1/sales/analysis |
| MailCheck                                                   | ✅ GET /api/v1/mail/count |
| MailRead                                                    | ✅ GET /api/v1/mail |
| AgewiseSummary                                              | ✅ GET /api/v1/accounts/agewise-summary |
| CheckPendingDO                                              | ✅ GET /api/v1/orders/:orderId/pending-do |
| spFastMovingItems                                           | ✅ GET /api/v1/stock/fast-moving |
| spSalesBillReport                                           | ✅ GET /api/v1/sales/bill-report |
| PROCVOUCHERLIST                                             | ✅ GET /api/v1/vouchers/type-list |
| SPDISCOUNTSUMMARY                                           | ✅ GET /api/v1/sales/discount-summary |
| spSupplierOutStandingSummary                                | ✅ GET /api/v1/suppliers/outstanding-summary |
| Invoice_PaidUnpaid                                          | ✅ GET /api/v1/invoices/paid-unpaid |
| VehicleHistory                                              | ✅ GET /api/v1/vehicles/:vehId/history |
| spItemTransactionCount                                      | ✅ GET /api/v1/items/transaction-count |
| spStockValuation                                            | ✅ GET /api/v1/stock/valuation |
| spStockAgingReport                                          | ✅ GET /api/v1/stock/aging |
| spSalesReportForFM                                          | ✅ GET /api/v1/sales/report-fm |
| spSalesReportCatSub                                         | ✅ GET /api/v1/sales/category-summary |
| spSalesLabourPartsReport                                    | ✅ GET /api/v1/sales/labour-parts-report |
| SP_MarginRpt                                                | ✅ GET /api/v1/sales/margin-report |
| [dt_*... functions, row_count, etc.]                        | ✅ Not exposed as API endpoints (DB tooling only) |

All documented stored procedures in DB_CONNECTION_SPEC.md are mapped.

---

### 2. WRITE TARGETS BY TABLE (Application Layer Writes)
| Table                | REST write endpoint? |
|----------------------|---------------------|
| USERS                | ✅ POST/PATCH/DELETE /api/v1/users, /api/v1/auth/* |
| UserRights           | ✅ PATCH /api/v1/users/:id/roles |
| Customer             | ✅ POST/PATCH/DELETE /api/v1/customers |
| Supplier             | ✅ POST/PATCH/DELETE /api/v1/suppliers |
| CustBill01,CustBill02| ✅ POST/PATCH/DELETE /api/v1/billing/customers |
| Contact              | ✅ POST/PATCH/DELETE /api/v1/contacts |
| CustomerVehicle      | ✅ POST/PATCH/DELETE /api/v1/vehicles |
| SalesOrdr01,Sales01  | ✅ POST/PATCH/DELETE /api/v1/sales/orders, /api/v1/jobs |
| SalesOrdrStatusHead  | ✅ POST/PATCH/DELETE /api/v1/job-status |
| AssignedJobs         | ✅ POST/PATCH/DELETE /api/v1/jobs/:id/assignments |
| WorkInProgress       | ✅ POST/PATCH/DELETE /api/v1/workinprogress |
| LocalPurchase01      | ✅ POST/PATCH/DELETE /api/v1/purchase/orders |
| PurchaseDO01         | ✅ POST/PATCH/DELETE /api/v1/purchase/do |
| PurchaseVehicleLink  | ✅ POST/PATCH/DELETE /api/v1/purchase-vehicle-link |
| StockTransaction     | ✅ POST/PATCH/DELETE /api/v1/stock/in|out |
| AcHead               | ✅ POST/PATCH/DELETE /api/v1/achead |
| AcGroupHead          | ✅ POST/PATCH/DELETE /api/v1/acgrouphead |
| AcTree               | ✅ POST/PATCH/DELETE /api/v1/actree |
| MailTable            | ✅ POST/PATCH/DELETE /api/v1/mail |
| AttachmentMaster     | ✅ POST/PATCH/DELETE /api/v1/attachments |
| AdditionalRemarks    | ✅ POST/PATCH/DELETE /api/v1/remarks |
| Items                | ✅ POST/PATCH /api/v1/products |
| tempMarginReport     | ✅ POST/DELETE /api/v1/temp-margin-report |
| Omasters (code master)| ✅ POST/PATCH/DELETE /api/v1/omaster |
| settings             | ✅ PATCH /api/v1/settings |
| Ajanda               | ✅ POST/PATCH/DELETE /api/v1/agenda |
| Ajanda02             | ✅ POST/PATCH/DELETE /api/v1/agenda/assignments |
| CompanyInfo          | ✅ POST/PATCH/DELETE /api/v1/companyinfo |
| salary01             | ✅ POST/PATCH/DELETE /api/v1/payroll |
| UsedCarsSql          | ✅ POST/PATCH/DELETE /api/v1/usedcars |
| Sreturn01, SReturn02 | ✅ POST/PATCH/DELETE /api/v1/sales/returns |
| ProformaSales01      | ✅ POST/PATCH/DELETE /api/v1/sales/proforma |
| MIRStatusDtl         | ✅ POST/PATCH/DELETE /api/v1/mirstatus |

Every table with detected app write activity has at least one mapped endpoint.

---

### 3. WRITE-COVERAGE GATE (by PRD Editable Module)

| PRD Module             | Editable? | Write Endpoint(s)?   | Status         |
|------------------------|-----------|----------------------|----------------|
| Authentication         | ✅        | POST/PATCH /api/v1/auth/*, /api/v1/users | ✅ PASS |
| User Management        | ✅        | POST/PATCH/DELETE /api/v1/users | ✅ PASS |
| Customer Management    | ✅        | POST/PATCH/DELETE /api/v1/customers | ✅ PASS |
| Supplier Management    | ✅        | POST/PATCH/DELETE /api/v1/suppliers | ✅ PASS |
| Contacts               | ✅        | POST/PATCH/DELETE /api/v1/contacts | ✅ PASS |
| Vehicles               | ✅        | POST/PATCH/DELETE /api/v1/vehicles | ✅ PASS |
| Jobs/Work Orders       | ✅        | POST/PATCH/DELETE /api/v1/jobs, /api/v1/workinprogress | ✅ PASS |
| Sales Orders           | ✅        | POST/PATCH/DELETE /api/v1/sales/orders | ✅ PASS |
| Purchases/Procurement  | ✅        | POST/PATCH/DELETE /api/v1/purchase/orders | ✅ PASS |
| Inventory/Stock        | ✅        | POST/PATCH/DELETE /api/v1/stock/in, /out | ✅ PASS |
| Voucher/Finance        | ✅        | POST/PATCH/DELETE /api/v1/vouchers | ✅ PASS |
| Attachments/Remarks    | ✅        | POST/PATCH/DELETE /api/v1/attachments, /remarks | ✅ PASS |
| Mail/Messaging         | ✅        | POST/PATCH/DELETE /api/v1/mail | ✅ PASS |
| Payroll                | ✅        | POST/PATCH/DELETE /api/v1/payroll | ✅ PASS |
| Products/Items         | ✅        | POST/PATCH /api/v1/products | ✅ PASS |
| Company Info/Settings  | ✅        | POST/PATCH/DELETE /api/v1/companyinfo, /settings | ✅ PASS |
| TempMarginReport       | ✅        | POST/DELETE /api/v1/temp-margin-report | ✅ PASS |

**Result:** EVERY PRD module with edit requirements has at least one defined WRITE endpoint (POST/PUT/PATCH/DELETE).  
_NO module is read-only that should be editable._


---

**END OF SPECIFICATION**