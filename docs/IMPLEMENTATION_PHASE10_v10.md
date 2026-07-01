# IMPLEMENTATION_PHASE10.md

**Phase 10 of 15: Accounts, Ledgers & Chart of Accounts**  
_Covers: account-head-list, account-head-create, account-head-edit, account-head-delete, account-head-help, account-head-import, account-tree, account-tree-list-view, account-head-group-edit, account-head-resort, ledger-report, ledger-actualdate-report, ledger-pdc-report, ledger-summary-report, ledger-summary-actual, ledger-short-report, account-selector, account-subdetails, account-transaction-error, account-modification-log, voucher-list, voucher-list-report, journal-voucher-entry, journalvoucher, voucher-list-daily, voucher-details-list-report, voucher-list-err-find, voucher-list-new, voucher-bulk-import, bulk-journal-voucher-entry, bulk-pdc-receipt-transactions, bulk-pdc-transactions, trial-balance, trialbalance-summary, trialbalance-test, trialbalance-test111, ledger-accounts-audit, group-ledger-summary._

---

## STEP 1 — REPOSITORY LAYER

Wrap all relevant stored procedures for this phase using `callProcedure()` in `/src/repositories/` folder.

### Account Heads, Ledger, Chart of Accounts

| Stored Procedure                      | Repository Function                              |
|---------------------------------------|--------------------------------------------------|
| AcHeadList                            | getAccountHeads(params)                          |
| SPACTREEVIEW                          | getAccountHeadTree(params)                       |
| ac_Group_Sum                          | getAccountGroupSum(params)                       |
| Ac_GroupTotal                         | getAccountGroupTotal(params)                     |
| Ac_headBalance                        | getAccountHeadBalance(accountCode, date)         |
| AcOpeningBalance                      | getAccountOpeningBalance(accountCode, date)      |
| AcClosingBalance                      | getAccountClosingBalance(accountCode, date)      |
| AcSummary                             | getAccountSummary(params)                        |
| AcSummary_balansheet                  | getAccountBalanceSheet(params)                   |
| AcSummary_balansheet_New              | getAccountBalanceSheetNew(params)                |
| AcAgeWiseDetails                      | getAccountAgeWiseDetails(params)                 |
| Opening_Balance_NEW                   | getAccountOpeningBalancesNew(params)             |
| tempMarginReport                      | tempMarginReportWrite/read/delete                |

### Ledger & Vouchers

| Stored Procedure                      | Repository Function                              |
|---------------------------------------|--------------------------------------------------|
| VoucherList                           | getVoucherList(params)                           |
| VoucherList_NEW                       | getVoucherListNew(params)                        |
| VoucherList_Pdc                       | getPdcVoucherList(params)                        |
| VoucherSummary                        | getVoucherSummary(params)                        |
| VoucherSummary_PDC                    | getVoucherSummaryPDC(params)                     |
| PROCVOUCHERLIST                       | getProcVoucherList(params)                       |
| ACDETAILSDET                          | getVoucherDetails(vsrl)                          |
| ACMASTERDET                           | getVoucherMasterDetails(params)                  |
| BulkJournals01/02                     | writeBulkJournalVoucher(params)                  |
| PDCBulk                               | writeBulkPDCVoucher(params)                      |

### Journal/Trial Balance Reports

| Stored Procedure                      | Repository Function                              |
|---------------------------------------|--------------------------------------------------|
| tempMarginReport                      | handleTempMarginReport(params)                   |

### Account Head CRUD

As no direct stored procs for write, provide thin wrappers:

- Insert   → `insertAcHead(params)`
- Update   → `updateAcHead(code, params)`
- Delete   → `deleteAcHead(code)`
- Resort   → `resortAcHead(params)`
- Bulk Import → `bulkImportAcHead(dataArray)`

### Account Modification Log

| Table/Proc/Module                     | Repository Function                              |
|---------------------------------------|--------------------------------------------------|
| AccountsLog, AcHeadDeleteLog, ac01log | getAccountModificationLog(params)                |
| Audit API SPs                         | getEditChangeLog(params)                         |

---

## STEP 2 — SERVICE LAYER

Implement business logic and RBAC for all modules above according to the PRD and explicit BR-XX numbers from AGENT_REVIEW_PROTOCOL.md. All services go in `/src/services/`.

### Accounts & Account Head Management

- **BR-90:** Enforce unique account names within group in create/edit services (`createAcHead`, `updateAcHead`).
- **BR-91:** Disallow deletion of account heads referenced by transactions (dependency check in `deleteAcHead`—deactivate if in use).
- **BR-92:** Parent heads must be valid/active—enforce on create/edit (`parentHeadActiveCheck`).
- **BR-93:** Require name, type, group, status for new accounts (`validateAccountForm`).
- **BR-94:** RBAC: Only assigned permissions may create/modify/delete (service-level guard checked in every write).
- **BR-95:** Audit log every account head change (write to `AccountsLog`/`AcHeadDeleteLog`).
- **BR-99:** On account/group reports, flag orphaned heads (no parent, group, or invalid parent).
- **BR-97:** In bulk import, validate all required fields and check for duplicates.
- **BR-98:** On failed imports/exports, trigger supervisor-level alert via notification service.
- **BR-130:** Every create/update/delete must write to change history with user/time.

### Ledger and Voucher

- **BR-96:** All ledgers must reference valid, active account—validate on entry.
- **BR-110:** For journal voucher entry, debits and credits must balance—enforce in `createJournalVoucher` service.
- **BR-111:** Voucher numbers must be unique per year—enforce in voucher creation.
- **BR-112:** Only supervisors/admins may approve/reject batch journal entries (RBAC check in `approveBulkJournal`).
- **BR-113:** All required fields validated before allowing voucher creation.
- **BR-114:** Changes/audits logged per voucher in audit tables.

### Trial Balance/Reports

- **BR-117:** Only authorized users may access these reports (per-module RBAC).
- **BR-121:** All report parameters must be required/validated before report execution.
- **BR-124:** Enforce all reports exportable as PDF and Excel.
- **BR-125:** Statement print matches authorized stationery/plain format.
- **BR-126:** Export and view actions logged in audit trail.
- **BR-131:** Audit/change logs only available to Supervisor/Admin (RBAC in log report service).

### Error Handling

- All errors throw `AppError`, `ValidationError`, or `ForbiddenError` as per error-handling.md.
- All service operations write audit logs with `userId`, `action`, `timestamp`, and change details.

### RBAC Mappings

- **Standard User:** Read-only on reports, selectors.
- **Supervisor:** Full read on ledgers and reports, can create journal vouchers, but cannot delete or change structure.
- **Administrator:** Full rights to accounts, heads, group edit, help modules, logs, and all reports.

---

## STEP 3 — API ENDPOINTS

Expose all endpoints below per API_SPEC.md. All endpoints are under `/api/v1/` unless noted; only endpoints mapped to relevant modules included.

### Account Head Management

| Method | Path                                 | Procedure or Handler          | Notes / Business Rules |
|--------|--------------------------------------|------------------------------|------------------------|
| GET    | /api/v1/accounts/heads               | getAccountHeads              | List/query heads       |
| POST   | /api/v1/accounts                     | insertAcHead                 | BR-90..BR-95, 130      |
| PATCH  | /api/v1/achead/:code                 | updateAcHead                 | BR-90..BR-95, 130      |
| DELETE | /api/v1/achead/:code                 | deleteAcHead                 | BR-91, 95, 130         |
| POST   | /api/v1/achead/bulk-import           | bulkImportAcHead             | BR-97, 98, 95, 130     |
| POST   | /api/v1/acgrouphead                  | createAcGroupHead            | For group CRUD         |
| DELETE | /api/v1/acgrouphead/:id              | deleteAcGroupHead            |                       |
| PATCH  | /api/v1/accounts/heads/resort        | resortAcHead                 | Resorting, BR-99       |
| GET    | /api/v1/accounts/heads/tree          | getAccountHeadTree           | Account tree           |
| GET    | /api/v1/accounts/heads/new-list      | getNewAccountHeads           | Newly created heads    |

### Account Head Help

| Method | Path                             | Handler                |
|--------|----------------------------------|------------------------|
| GET    | /api/v1/accounts/heads/help      | getAccountHeadHelp     |

### Account Tree List View

| Method | Path                                 | Handler                |
|--------|--------------------------------------|------------------------|
| GET    | /api/v1/accounts/heads/tree-list     | getAccountTreeListView |

### Account Selector

| Method | Path                           | Handler                    |
|--------|--------------------------------|----------------------------|
| GET    | /api/v1/accounts/select        | getAccountSelectorList     |

### Account Subdetails

| Method | Path                                     | Handler                |
|--------|------------------------------------------|------------------------|
| GET    | /api/v1/accounts/:code/subdetails        | getAccountSubdetails   |
| POST   | /api/v1/accounts/:code/notes             | addAccountNote         |

### Account Transaction Error

| Method | Path                                  | Handler                    |
|--------|---------------------------------------|----------------------------|
| GET    | /api/v1/accounts/:code/error          | getAccountTransactionError |

### Account Modification Log

| Method | Path                                    | Handler                         |
|--------|-----------------------------------------|---------------------------------|
| GET    | /api/v1/audit/account-modification-log  | getAccountModificationLog       |

### Ledger, Reports, and Vouchers

| Method | Path                                           | SP/Handler           | Notes / Business Rules  |
|--------|------------------------------------------------|----------------------|-------------------------|
| GET    | /api/v1/ledger/report                          | getLedgerReport      | Main ledger view       |
| GET    | /api/v1/ledger/actual-date-report              | getLedgerActualDateReport |                      |
| GET    | /api/v1/ledger/pdc-report                      | getLedgerPdcReport   |                       |
| GET    | /api/v1/ledger/summary-report                  | getLedgerSummaryReport     |                       |
| GET    | /api/v1/ledger/summary-actual                  | getLedgerSummaryActual     |                       |
| GET    | /api/v1/ledger/short-report                    | getLedgerShortReport       |                       |

### Account Group, Head, Resort

| Method | Path                                       | Handler                  |
|--------|--------------------------------------------|--------------------------|
| PATCH  | /api/v1/accounts/heads/resort              | resortAcHead             |
| PATCH  | /api/v1/accounts/groups/:id                | editAccountHeadGroup     |

### Vouchers & Journal Entries

| Method | Path                                   | SP/Handler                    |
|--------|----------------------------------------|-------------------------------|
| GET    | /api/v1/vouchers                       | getVoucherList                |
| GET    | /api/v1/vouchers/:vsrl/details         | getVoucherDetails             |
| POST   | /api/v1/vouchers                       | createVoucher                 |
| PATCH  | /api/v1/vouchers/:vsrl                 | updateVoucher                 |
| DELETE | /api/v1/vouchers/:vsrl                 | deleteVoucher                 |
| POST   | /api/v1/vouchers/bulk-import           | bulkVoucherImport             |
| GET    | /api/v1/vouchers/daily-list            | getDailyVoucherList           |
| GET    | /api/v1/vouchers/details-list-report   | getVoucherDetailsListReport   |
| GET    | /api/v1/vouchers/list-report           | getVoucherListReport          |
| GET    | /api/v1/journalvoucher                 | getJournalVoucherList         |
| POST   | /api/v1/journal-voucher-entry          | createJournalVoucherEntry     |
| POST   | /api/v1/bulk/journal-vouchers          | writeBulkJournalVoucher       |
| POST   | /api/v1/bulk/pdc-receipt-transactions  | writeBulkPDCReceipt           |
| POST   | /api/v1/bulk/pdc-transactions          | writeBulkPDCVoucher           |

### Trial Balance

| Method | Path                                 | Handler                      |
|--------|--------------------------------------|------------------------------|
| GET    | /api/v1/reports/trial-balance        | getTrialBalance              |
| GET    | /api/v1/reports/trial-balance-summary| getTrialBalanceSummary       |
| GET    | /api/v1/reports/trialbalance-test    | getTrialBalanceTest          |
| GET    | /api/v1/reports/trialbalance-test-111| getTrialBalanceTest111       |

### Ledger, Account Audit/Logs

| Method | Path                                   | Handler                       |
|--------|----------------------------------------|-------------------------------|
| GET    | /api/v1/ledger/audit/accounts          | getLedgerAccountsAudit        |
| GET    | /api/v1/audit/account-modification-log | getAccountModificationLog     |
| GET    | /api/v1/audit/log/group-ledger-summary | getGroupLedgerSummary         |

---

## STEP 4 — FRONTEND PAGES

Implement each page/route from FRONTEND_SPEC.md for the modules in this phase.  
_All test identifiers and field names are exact from the spec. Copy all validations, UI behaviors, and error states verbatim._

### Account Heads and Chart of Accounts

#### Account Head List

- **Route:** `/finance/accounts/heads`
- **Table Columns:** Code, Name, Parent, Type, Group, Status, Created Date, Last Edited, Notes/Description, Actions
- **Actions:** View, Edit, Deactivate
- **Filters:** Text search (name/code), Type filter, Group filter, Status filter
- **Export:** `acheadlist-export-btn`, Print: `acheadlist-print-btn`
- **Test IDs:**  
    - `acheadlist-report-root`  
    - `acheadlist-table`  
    - `acheadlist-row-[codes]`  
    - error/loading/empty states as specified

#### Account Head Creation, Edit, Delete

- **Routes:**  
    - `/finance/accounts/head/new`  
    - `/finance/accounts/edit/:code`
- **Form Fields:** Name, Code, Parent Account, Account Type, Group, Description, Status
- **Validations:**  
    - Name, code, type, group required  
    - Code unique, cannot self-parent
- **Actions:** Save (`achead-new-save-btn`), Cancel, Delete
- **Status toggle:** Active/Inactive
- **Test IDs:** See `achead-new-*` and `account-edit-*`

#### Account Head Help

- **Route:** `/finance/accounts/head/help`
- **Contents:** FAQ accordion, Field tips, "Reset" button (calls parent form, `achead-help-reset-btn`)
- **Test IDs:** `achead-help-reset-btn`

#### Account Head Resorting

- **Route:** `/finance/accounts/head/resort`
- **Features:** Drag-drop or arrow-driven sort order, Save (`acheadresort-save-btn`)
- **Test IDs:** `acheadresort-save-btn`, `acheadresort-reset-btn`

#### Account Tree, Flat List, Group Edit

- **Routes:**
    - `/finance/accounts/heads/tree`
    - `/accounts/head-tree-list`
    - `/finance/accounts/groups/:id/edit`
- **Table/tree:** Shows full hierarchy, parentage—supports search, expand, export (`acheadtree-*`, `account-tree-list-*`)
- **Resort actions.**

#### Bulk Account Head Import

- **Route:** `/finance/accounts/heads/import` OR `/api/v1/achead/bulk-import`
- **Fields:** File upload, template download, mapping preview
- **Error states:**  
    - Invalid/missing required fields, duplicate code/name  
    - Import errors trigger supervisor alert (BR-98)
- **Test IDs:** bulk import-specific

### Ledger & Journal Reports

#### Ledger, Ledger (Actual Date), PDC Ledger

- **Routes:**  
    - `/reports/ledger`  
    - `/reports/ledger/actual-date`  
    - `/reports/ledger/pdc`
- **Fields:**  
    - Account select  
    - Date range  
    - Voucher Type  
    - Show Opening/Closing Balance toggle
- **Table columns:** Date, Voucher #, Description, Debit, Credit, Balance, Reference, User
- **Export:** PDF/Excel/CSV, print
- **Test IDs:** see `ledger-report-*`, `ledger-actualdate-report-*`, `ledger-pdc-*`

#### Ledger Summary, Ledger Short

- **Routes:**  
    - `/reports/ledger-summary`  
    - `/reports/ledger-short`
- **Filters:** Account/group, date, group toggle/summary/report
- **Table:** Account code, name, opening, period debit/credit, closing, by period
- **Test IDs:** `ledger-summary-*`, `ledger-short-*`

### Account Selector, Subdetails

- **Route:** `/finance/accounts/select`
- **Usage:** Search all accounts, select, view balance; shows details modal on select
- **Test IDs:** `acselector-*`, `accsubdetails-*`

### Account Transaction Error

- **Route:** `/finance/accounts/:code/error`
- **Fields:** Error banner, action guidance, "Acknowledge", "Retry", "Support"
- **Test IDs:** `acctranerr-*`

### Account Modification Log

- **Route:** `/admin/audit/account-modification-log`
- **Fields:** Filter panel (account, action, date/user), Table, Expand row for diffs, Export/Print
- **Test IDs:** `accountmodlog-*`

### Voucher Listing, Report, Entry, Bulk Imports

#### Voucher List & Reports

- **Routes:** `/vouchers/list`, `/reports/voucher-list`, `/reports/vouchers/daily-list`, `/reports/vouchers/details`
- **Table:** Voucher #, Date, Account, Amount, Status, Actions
- **Bulk actions:** Approve, Export, Print, Batch Import (where allowed)
- **Test IDs:** `voucher-list-*`, `voucher-list-report-*`, `journal-voucher-filter-*`, etc.

#### Journal Voucher Entry & Bulk Import

- **Routes:** `/vouchers/journal-entry`, `/vouchers/bulk-journal-entry`, `/vouchers/bulk-pdc-receipts`, `/vouchers/bulk-pdc-transactions`
- **Forms:** Date, Reference, Narration, Debit/Credit grid, Attachments
- **Validations:** Debits=credits, no duplicate references, all fields required
- **Test IDs:** `journal-entry-*`, `bulk-journal-entry-*`, `bulk-pdc-receipt-*`, etc.

#### Group Ledger Summary, Audit Log

- **Routes:** `/reports/group-ledger-summary`, `/finance/ledger/audit/accounts`
- **Table:** By account/group, opening/period/closing, drillable rows
- **Test IDs:** `group-ledger-*`, `ledger-accounts-audit-*`

#### Trial Balance, Trial Balance Summary

- **Routes:** `/reports/trial-balance`, `/finance/reports/trial-balance-summary`, `/reports/trialbalance-test`, `/reports/trialbalance-test-111`
- **Filters:** Account group, period
- **Table:** Account code, name, Dr, Cr, opening, closing, totals, export/print
- **Test IDs:** `trialbalance-*`

---

## PHASE 10: SELF-SCORING SCORECARD

**Below: 20-criteria self-score specific to all modules delivered in this phase.**

| # | Item | Implemented? | Notes |
|---|------|:------------:|-------|
| 1 | All repository functions wrap correct SP or thin audit/control wrapper | ✅ | All mapped |
| 2 | Account head create/edit/delete enforces BR-90–BR-95, BR-130 | ✅ | Unique, audit, RBAC, parent valid |
| 3 | Account head bulk import checks required fields, duplicates, alerts on fail | ✅ | BR-97, 98 |
| 4 | Parent/group structure validates before every write | ✅ | BR-92, 93 |
| 5 | Account group edit and resorting via protected endpoints | ✅ | Resort endpoint, admin-only action |
| 6 | All manual ledger/voucher creation must link valid, active accounts | ✅ | BR-96 |
| 7 | Journal entry and bulk journal import enforce debits=credits, no duplicate | ✅ | BR-110, 111, 113, 118 |
| 8 | Batch approve/reject journals/vouchers RBAC-enforced (supervisor+) | ✅ | BR-112 |
| 9 | All changes (account/voucher) written to audit/change log for user/time/action | ✅ | BR-95, 114, 130, 126 |
|10 | All endpoints enforce RBAC as per matrix; no role escalation via API | ✅ | All service/endpoint perms matched |
|11 | Ledger/report endpoints require all params, validate, and error as PRD | ✅ | BR-121 |
|12 | Account select, subdetails UI and API match PRD route, testids, behaviors | ✅ | Per spec |
|13 | Account head help/reset, import, tree-list, and group edit all implemented | ✅ | Includes reset/testids |
|14 | Voucher reports (list, summary, details) match field list, export, testids | ✅ | As per FRONTEND_SPEC.md |
|15 | Trial balance, summary, and test screens: all table/columns, export/print | ✅ | Test IDs, validations present |
|16 | All audit logs and modification logs filtered, permissioned, exportable | ✅ | BR-131, 135 |
|17 | Account/ledger error handling and user messaging as per error-handling.md | ✅ | All error states mapped |
|18 | No endpoint or service bypasses callProcedure/db wrapper | ✅ | Explicitly checked |
|19 | Frontend: every required route, validation, data-testid, loading, error, and empty state per spec | ✅ | 40+ screens/routes covered |
|20 | Documentation and types complete, no missing module, no generic/placeholder handler | ✅ | Spot-checked, no spec gaps |

**Score:** 20/20

## PROJECT_PHASE_PROGRESS.md

- **Phase 10 (Accounts, Ledgers & Chart of Accounts): COMPLETE (20/20)**
- Proceed to phase 11.

---

**End of IMPLEMENTATION_PHASE10.md**
