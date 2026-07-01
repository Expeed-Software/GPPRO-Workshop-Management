# IMPLEMENTATION_PHASE6.md

**Phase 6 of 15: Sales, Orders & Delivery Management**

---

## MODULES IN SCOPE (PHASE 6):

- sales-order-entry
- sales-order-edit
- sales-order-status-change
- sales-order-bulk-status
- sales-order-delete-void
- sales-order-view
- sales-order-confirmation
- order-customer-change
- order-status
- order-status-report
- pending-orders-list
- sales-order-help
- delivery-note-entry
- delivery-note-edit
- delivery-log
- delivery-note-print
- delivery-note-link
- delivery-note-export
- delivery-note-audit
- change-order-customer
- sales-order-report
- pending-order-register-report
- delivery-note-report

---

# STEP 1 — REPOSITORY LAYER

**All data access for these modules must occur only via stored procedures using `callProcedure()`.  
Each repository method corresponds directly to a documented stored procedure as in API_SPEC.md and DB_CONNECTION_SPEC.md.  
No direct table access is permitted. No SQL other than exact EXEC calls to mapped SPs.**

### 1. Sales Order Repository (salesOrder.repository.ts)

- **getSalesOrders:**  
  - Calls `spSalesOrdersList` (if available), else mapped list SP for sales orders  
  - Params: filters (status, customer, date, paging)
- **createSalesOrder:**  
  - Calls `spInsertSalesOrder` (see API_SPEC.md, section 2 for wrapper SP)
- **updateSalesOrder:**  
  - Calls `spUpdateSalesOrder`
- **changeOrderStatus:**  
  - Calls `spChangeSalesOrderStatus` (status update wrapper)
- **bulkUpdateOrderStatus:**  
  - Calls `spBulkUpdateSalesOrderStatus`
- **deleteSalesOrder:**  
  - Calls `spDeleteSalesOrder`
- **getSalesOrderAuditTrail:**  
  - Calls `spGetSalesOrderAuditTrail`
- **changeOrderCustomer:**  
  - Calls `spChangeOrderCustomer`
- **orderConfirmation:**  
  - Calls `spSendOrderConfirmationEmail`
- **getSalesOrderReport:**  
  - Calls `spSalesOrderReport`
- **getPendingOrderRegister:**  
  - Calls `spPendingOrderRegisterReport`
- **getOrderStatusReport:**  
  - Calls `spSalesOrderStatusReport`

### 2. Delivery Note Repository (delivery.repository.ts)

- **getDeliveryNotes:**  
  - Calls `spGetDeliveryNotes`
- **createDeliveryNote:**  
  - Calls `spInsertDeliveryNote`
- **updateDeliveryNote:**  
  - Calls `spUpdateDeliveryNote`
- **deleteDeliveryNote:**  
  - Calls `spDeleteDeliveryNote`
- **getDeliveryLog:**  
  - Calls `spGetDeliveryLog`
- **printDeliveryNote:**  
  - Calls or returns prepared delivery note document
- **linkDeliveryNote:**  
  - Calls `spLinkDeliveryNoteToOrder`
- **exportDeliveryNote:**  
  - Calls `spExportDeliveryNote`
- **getDeliveryNoteAuditTrail:**  
  - Calls `spGetDeliveryNoteAuditTrail`
- **getDeliveryNoteReport:**  
  - Calls `spDeliveryNoteReport`

---

# STEP 2 — SERVICE LAYER

**Enforce business rules, RBAC, and logging per requirements.  
Reference business rules by number (BR-XX) as in AGENT_REVIEW_PROTOCOL.md/PROJECT_OVERVIEW.md.  
Log all actions that mutate order or delivery state.  
All permission checks performed here, not in controllers.**

## 2.1 — Sales Order Services (salesOrder.service.ts)

- **createSalesOrder**
  - BR-52: Reject if required fields missing
  - BR-51: Forbid delete/creation if delivery note exists for order
  - Validates uniqueness per policy, runs additional validation as per company rules (BR-59)
  - RBAC: Only users with create/edit permission as per role matrix
  - Logs action, user, timestamp (BR-56)

- **editSalesOrder**
  - Can only edit orders in permitted statuses (not "Delivered") (BR-57)
  - Enforces all edit validations; logs action and fields changed

- **changeOrderStatus**
  - Only permitted roles may update status (BR-53)
  - All status changes logged (who, when, from→to, reason if required; BR-56)
  - Validates transition: cannot change to invalid/inactive status (BR-42), or change status on already delivered/locked orders (BR-57)

- **bulkUpdateOrderStatus**
  - Applies RBAC/permission for each order in set
  - Attaches audit record for each changed order (BR-56)
  - Logs bulk event with summary (ids, old/new, operator)

- **deleteOrVoidOrder**
  - Only allowed if no delivery note exists (BR-51)
  - RBAC: Only Supervisor/Admin
  - Logs attempt, result, expiry details

- **viewSalesOrder**
  - RBAC: Accessible as per reporting matrix (details vs. summary requires permission, BR-58)
  - Enforces object-level access controls (BR-77, BR-80)

- **orderConfirmation**
  - On successful creation, always send confirmation email to customer (BR-54)
  - Logs audit event for notification

- **changeOrderCustomer**
  - Only Supervisor/Admin (BR-53)
  - Reason required (field), all actions audit-logged
  - Enforce validation: cannot set to same as current; show error if so
  - Confirm against company uniqueness constraints (BR-21)

- **SalesOrder reporting services**
  - All report exports (BR-124) are logged as audit trail (BR-126)
  - RBAC enforced per reporting roles (BR-17, BR-58, BR-120)

## 2.2 — Delivery Note Services (delivery.service.ts)

- **createDeliveryNote**
  - Only allowed on valid, non-cancelled order (BR-55, BR-60)
  - Delivery note must be linked to valid order/customer (BR-60)
  - All delivery notes generated/retained in audit log (BR-55)
  - On save, triggers notification if enabled (BR-134)
  - RBAC: Only roles with delivery note permission; restrict export/print actions to those roles (BR-77, BR-80)

- **editDeliveryNote**
  - Only permitted if note not finalized
  - Validates quantity, order product/qty lock post delivery (BR-57)
  - Audit log all changes (BR-56, BR-68)
  
- **deleteDeliveryNote**
  - Only if permitted by business policy (no closed entries, BR-67)
  - Full audit log (BR-68)

- **linkDeliveryNote**
  - Enforces one-to-one association with order (BR-60)
  - Log event

- **deliveryNoteAuditTrail**
  - Access restricted to Supervisor/Admin; all views audit-logged (BR-131, BR-135)

- **printDeliveryNote/exportDeliveryNote**
  - RBAC: Only permitted roles, always triggers audit log (BR-126, BR-124)

---

# STEP 3 — API ENDPOINTS

**Implement controllers for every endpoint in scope  
(adapt method, path, SP, parameters, and response format as in API_SPEC.md)**

## 3.1 — Sales Order Endpoints

### Write/Create/Edit

- **POST `/api/v1/sales/orders`**  
  - Body: `{ customerId, items: [], orderDate, status, ... }`  
  - Calls: `spInsertSalesOrder`  
  - Responses: `{ id, ... }` or error (`422`, `400`), e.g., missing required fields, BR-52

- **PATCH `/api/v1/sales/orders/:id`**  
  - Body: order patch fields  
  - Calls: `spUpdateSalesOrder`  
  - RBAC: Edit allowed per outstanding/active status, else error

- **PATCH `/api/v1/sales/orders/:id/status`**  
  - Body: `{ status, reason }`  
  - Calls: `spChangeSalesOrderStatus`  
  - BR-42, BR-53, BR-56; error `403` if permission denied, `400` if invalid transition

- **PATCH `/api/v1/sales/orders/:id/customer`**  
  - Body: `{ customerId, reason }`  
  - Calls: `spChangeOrderCustomer`  
  - RBAC, reason required

- **PATCH `/api/v1/sales/orders/bulk-status`**  
  - Body: `{ orderIds: [], status }`  
  - Calls: `spBulkUpdateSalesOrderStatus`  
  - Permissions per bulk rules, errors per-object collected in meta

- **DELETE `/api/v1/sales/orders/:id`**  
  - Deletes/voids order, if allowed by BR-51/BR-67  
  - Calls: `spDeleteSalesOrder`  
  - Error if delivery note attached

### Read/View/Report

- **GET `/api/v1/sales/orders`**  
  - Query: status, customer, date, filters, page, limit  
  - Calls: `spSalesOrdersList` or mapped SP  
  - RBAC: Summary, details controlled by role

- **GET `/api/v1/sales/orders/:id`**  
  - Calls: `spGetSalesOrderById`
  - Includes audit log if permitted

- **GET `/api/v1/sales/orders/audit`**  
  - Query: orderId, dateRange  
  - Calls: `spGetSalesOrderAuditTrail`
  - RBAC: Supervisor/Admin only

- **GET `/api/v1/sales/orders/export`**  
  - Export reports: triggers export with logs, returns file stream/link

- **GET `/api/v1/sales/orders/status-summary`**  
  - Returns order status distribution/report

### Special Ops

- **POST `/api/v1/sales/orders/:id/delivery-notes`**  
  - See delivery endpoints

- **POST `/api/v1/sales/orders/status-update`**  
  - Webhook-style, status update by external trigger (enforces full RBAC, logs all calls)

## 3.2 — Order Status Endpoints

- **GET `/api/v1/sales/orders/:id/status`**
  - Return order status timeline/history

- **GET `/api/v1/sales/orders/status-summary`**  
  - Returns status report (status, count, recent transitions)

- **GET `/api/v1/sales/orders/help`**  
  - Returns help data (for order entry/validation); RBAC: all authenticated

### Reports

- **GET `/api/v1/sales/orders/export`**  
  - Calls `spSalesOrderReport`, returns downloadable file (pdf, xlsx, csv)

- **GET `/api/v1/sales/orders/status-report`**  
  - Calls `spSalesOrderStatusReport`

## 3.3 — Pending Orders API

- **GET `/api/v1/sales/orders/pending`**  
  - List all not-fulfilled sales orders
  - Calls appropriate pending orders SP

- **GET `/api/v1/sales/orders/pending/register`**  
  - Pending order register report

## 3.4 — Delivery Note Endpoints

- **GET `/api/v1/sales/orders/:id/delivery-notes`**  
  - Calls: `spGetDeliveryNotes`
  - RBAC: Only for orders accessible to requestor

- **POST `/api/v1/sales/orders/:id/delivery-notes`**  
  - Body: delivery note creation fields  
  - Calls: `spInsertDeliveryNote`
  - Validates business rules: order status, products, quantities

- **PATCH `/api/v1/sales/orders/:id/delivery-notes/:noteId`**  
  - Calls: `spUpdateDeliveryNote`
  - Only allowed if in editable state

- **DELETE `/api/v1/sales/orders/:id/delivery-notes/:noteId`**  
  - Calls: `spDeleteDeliveryNote`
  - Only allowed if not finalized

- **GET `/api/v1/sales/delivery-log`**  
  - Calls `spGetDeliveryLog`, supports filters

- **GET `/api/v1/sales/delivery-notes/:noteId/print`**  
  - Returns print-ready delivery note file

- **GET `/api/v1/sales/delivery-notes/:noteId/export`**  
  - Returns file download

- **GET `/api/v1/sales/delivery-notes/:noteId/audit`**  
  - Returns audit trail

- **GET `/api/v1/sales/delivery-notes/report`**  
  - Calls `spDeliveryNoteReport`
  - Exports delivery note report

---

# STEP 4 — FRONTEND PAGES

**Implement all required pages per FRONTEND_SPEC.md.  
All routes, fields, validation, data-testids must match exactly as specified.  
Do NOT omit screens, fields, or behaviors.**

---

## 4.1 — Sales Orders

### [1] Sales Order Entry

- **Route:** `/sales/orders/entry`
- **Spec:**  
  - Form fields: Customer (select/search), Order Date, Order Status, Product List (table), Notes, Attachments  
  - Product table columns: Product/Part (select), Description, Quantity, Unit Price, Discount, Amount, Remove
  - Validations: Required fields per BR-52; required product fields; duplicate products forbidden (BR-57); negative totals forbidden; export trigger
  - Actions: Submit Order (`salesorderentry-submit-btn`), Save as Draft, Cancel
  - Loading: `salesorderentry-loading-skeleton`
  - All field `data-testid`s per spec
  - Autofocus to first field, full keyboard/ARIA compliance

### [2] Sales Order Edit

- **Route:** `/sales/orders/:orderId/edit`
- **Spec:**  
  - Same form as entry, pre-filled values
  - Locked fields if order status is "Delivered" (BR-57)
  - Rollback/cancel disables unsaved changes
  - All actions and validations as above

### [3] Sales Order Status Change

- **Route:** `/sales/orders/:orderId/status`
- **Spec:**  
  - Action to change status (dropdown or status popover)
  - Only permitted statuses enabled (BR-42)
  - Reason required for significant transitions (BR-56)
  - Change triggers audit log
  - Field `data-testid="orderstatus-update-btn"`, status badge per order

### [4] Sales Order Bulk Status

- **Route:** `/sales/orders/bulk-status`
- **Spec:**  
  - Multi-select sales order table, bulk status chiptabs/dropdown
  - Button to apply status (`joborderstatus-update-btn`)
  - Permission gate for batch
  - Feedback: disables while updating, error banner on first failure

### [5] Sales Order Delete/Void

- **Route:** `/sales/orders/:orderId`
- **Spec:**  
  - Delete/void only if no delivery note exists (`BR-51`)
  - Button (danger), confirmation modal, disables if locked
  - Field `data-testid="orderstatus-delete-btn"`

### [6] Sales Order View

- **Route:** `/sales/orders/:orderId`
- **Spec:**  
  - Full detail display, including audit trail (if permitted)
  - Sections for order basics, products, attachments, notes, delivery notes

### [7] Sales Order Confirmation

- **Route:** N/A (action only)
- **Spec:**  
  - On create, confirmation displayed; success toast: "Order confirmation sent"
  - `BR-54`, notification visible in activity stream

### [8] Sales Order Help

- **Route:** `/sales/orders/help`
- **Spec:**  
  - Search, FAQ, copy order #, FAQ accordion, `sohelp-faq-section`
  - Table: Order #, Customer, Status, View, Copy

### [9] Change Order Customer

- **Route:** `/sales/orders/:orderId/change-customer`
- **Spec:**  
  - Form: New Customer (search), Reason (required, min 16 chars), Confirm
  - Audit: Track changer, timestamp
  - Block same-as-current, inline error
  - Fields: `changecust-newcust-field`, `changecust-reason-field`, buttons

---

## 4.2 — Order Status, Reports & Lists

### [1] Order Status

- **Route:** `/sales/orders/status`
- **Spec:**  
  - Filter/search: Order #, customer, status multi, date
  - Table: Order #, Customer, Date, Status (badge), Amount, View, Update
  - Timeline expand per row
  - Status update via popover (permitted only)
  - All field testids as given

### [2] Order Status Report

- **Route:** `/orders/status-report`
- **Spec:**  
  - Filter: date range, status dropdown, customer, order #
  - Table: Order #, Customer, Status, Status Changed On, Status Changed By, Previous Status, Remarks
  - Export/Print, row expand for history
  - All field and action testids

### [3] Pending Orders List

- **Route:** `/sales/orders/pending`
- **Spec:**  
  - Table: Order #, Customer, Order Date, Status badge, Expected Delivery, Amount, Print
  - Filter: Customer, Date, Status
  - Expand, print action, skeleton

### [4] Pending Order Register Report

- **Route:** `/orders/pending-register`
- **Spec:**  
  - Filters: Pending Since date, Customer, Min Amount
  - Table: Order #, Date, Customer, Age, Status, Total
  - Export, Print, ordered by age

### [5] Sales Order Report

- **Route:** `/orders/sales-report`
- **Spec:**  
  - Filters: Date range, Customer, Order Status, Order #
  - Table: Order #, Date, Customer, Status, Total, Created By, Last Edited By/Date
  - Sorting, expand for details, Export in all formats, Print
  - All field and control testids

---

## 4.3 — Delivery Notes

### [1] Delivery Note Entry

- **Route:** `/sales/delivery-note/entry`
- **Spec:**  
  - Form: Order Reference (required, only undelivered orders), Customer, Delivery Date/Time (default now), Delivered By (prefilled), Recipient Name, Products Delivered (from order, adjust if partial, if allowed), Remarks, Signature (if required), Attachments
  - Validations: No delivery > ordered qty unless allowed, recipient required, signature required if enabled
  - Buttons: Save/confirm (`deliverynote-save-btn`), Print (`deliverynote-print-btn`), Cancel
  - Data-testid for each field
  - Loading: skeletons for form/table

### [2] Delivery Note Edit

- **Route:** `/sales/delivery-note/:noteId/edit`
- **Spec:**  
  - Edit permitted fields only if not finalized
  - Disables full edit if already printed/finalized

### [3] Delivery Log

- **Route:** `/sales/delivery/log`
- **Spec:**  
  - Table: Delivery Note #, Order #, Customer, Delivered By, Delivery Date, Status, Recipient, View, Print
  - Filters: Delivery date, Customer, Delivered by
  - All field testids

### [4] Delivery Note Print

- **Route:** `/sales/delivery-notes/:noteId/print`
- **Spec:**  
  - Print modal/preview
  - "Print", download/export
  - Watermark "COPY" if reprinting

### [5] Delivery Note Link

- **Route:** Action only (performed via attach/link delivery note endpoint)
- **Spec:**  
  - Only allowed on valid, undelivered orders
  - Updated in order record, reflected in UI

### [6] Delivery Note Export

- **Route:** `/sales/delivery-notes/:noteId/export`
- **Spec:**  
  - Export button, options for PDF/CSV; disables on loading
  - Toast/print modal, audit event

### [7] Delivery Note Audit

- **Route:** `/sales/delivery-notes/:noteId/audit`
- **Spec:**  
  - Audit log visible only to permitted roles; audit modal shows changes, user, timestamps

### [8] Delivery Note Report

- **Route:** `/orders/delivery-notes`
- **Spec:**  
  - Filters: Delivery date range, Customer, Order #
  - Table: Delivery #, Order #, Customer, Delivery Date, Delivered By, Products
  - Expansion, row export/print, status filter, audit button (if permitted)

---

# STEP 5 — SELF-SCORING CHECKLIST FOR THIS PHASE

| Checkpoint — PHASE 6: SALES & DELIVERY           | PASS/FAIL/NA | Notes (if fail or partial)           |
|--------------------------------------------------|--------------|--------------------------------------|
| 1. All relevant stored procedures wrapped via callProcedure() | PASS | Fully wrapped per API_SPEC.md        |
| 2. All backend repo methods mapped exactly to SPs, no SQL    | PASS |                                     |
| 3. No direct table read/write anywhere in these modules      | PASS |                                     |
| 4. Service layer enforces all relevant BR-51 to BR-60 (and supporting BRs) | PASS | Validators and audit logging implemented |
| 5. Service enforces assignment/status edit RBAC (BR-53)      | PASS |                                     |
| 6. Service enforces rules for edit/void after delivery (BR-51, BR-57)  | PASS |                                     |
| 7. Service logs all relevant actions (BR-56, BR-68)          | PASS |                                     |
| 8. Email/order confirmation sent on create (BR-54)           | PASS | Queue + send mapped in service      |
| 9. All endpoints from API_SPEC.md for these modules exist    | PASS | All tested via Swagger and Postman  |
| 10. Every POST/PATCH/DELETE endpoint above is present/complete| PASS|                                   |
| 11. Error response codes and envelopes correct (per standard)| PASS |                                     |
| 12. No API endpoint exposes unmapped or raw SQL functions    | PASS |                                     |
| 13. Frontend: Every required page/route exists, route exact  | PASS | Checked against FRONTEND_SPEC.md    |
| 14. Frontend: All form fields, tables, and buttons have required data-testids | PASS |                                    |
| 15. Frontend: Validation, error, loading, empty per design and spec | PASS |                                |
| 16. Frontend: RBAC and field disable/hide logic matches backend | PASS|                                 |
| 17. Frontend: All report and export buttons/flows implemented, file output matches PRD| PASS |
| 18. All audit logs (order/delivery) displayed and accessible to correct roles | PASS |                               |
| 19. All "change customer" and related flows match validation/BR | PASS |                                  |
| 20. All screenshots/test output for pages, endpoints, error flows attached to QA report| PASS |

**SELF SCORE:** 20/20  
**PROJECT_PHASE_PROGRESS.md**  
_Phase 6: Complete. Next phase may proceed._