# DB_LOGIC_AUDIT.md

Audit of `backend/src/repositories/*.ts` raw SQL against AutoDealer's original
views/stored procedures, per the "DB-Preserve" policy in the README. No code
was changed as a result of this audit — see "Why no code changes yet" below.

## Method

- Grepped every repository file for `.query(` (raw SQL) vs `callProcedure(`
  calls: **23 raw-SQL call sites across 11 files**, vs **125 `callProcedure()`
  calls across 15 files**. Stored-procedure usage is the dominant pattern
  overall; the raw-SQL exception is concentrated in `reports.repository.ts`
  (0% SP usage, ~40 functions), plus scattered functions in
  `jobs.repository.ts`, `accounts.repository.ts`, `admin.repository.ts`, and
  a few others.
- No local `AUTODEALER-New/Scripts` folder exists in this environment, so
  instead of searching for `.sql` files, every view (119) and stored
  procedure (111) definition was pulled directly from the connected
  `autodealer` SQL Server via `sys.sql_modules` — the authoritative source.
- For every plausible name match, the **actual SQL body** was read and
  compared line-by-line against the raw query — not matched by name alone.

## Headline finding

Every "obviously matching" name pair checked (14 in `reports.repository.ts`,
4 in `jobs.repository.ts`) turned out to have genuinely different business
logic under the hood: different base tables, different bucket boundaries,
disabled/dead calculation code, or a different join topology. Matching by
name alone would have produced a wrong swap in 100% of cases checked here.

## reports.repository.ts (0% SP usage)

### Confirmed mismatches — do not swap without reconciling the logic difference

| # | App function | Raw SQL basis | Candidate DB object | How they differ |
|---|---|---|---|---|
| 1 | `getCustomerOverview` | `Sales01` invoice aggregate (BillCount, TotalPurchases, Outstanding = unpaid invoices) | SP `CustomerOverview` | SP computes Outstanding from the **account ledger** (`ACDETAILS.DEBT-CRED` per customer's AC head), joined via Area/Contact info. Different metric under the same name. Also paginated via temp table + a raw `@WhereCondition` string param (`exec('...' + @WhereCondition)`). |
| 2 | `getProductsOverview` | `StockQty × ISNULL(Cost,Srate)` | SP `ProductsOverview` | SP's `[Stock Value]` calculation block is **commented out / dead code** — the column is always NULL in production. The disabled, intended formula was a discount-adjusted **average purchase rate** (`avg((rate - rate*costDisc/100) * stkIn)`), not `Cost`/`Srate`. The app invents a third, different formula. This is exactly the drift pattern flagged in the audit request. |
| 3 | `getMarginReport` | Monthly `SUM(Total/Nett/Tda+Tdr)` from Sales01 | SP `SP_MarginRpt` | SP is a **per-bill line-item margin detail** report (purchase rate vs sale rate per item), not a monthly rollup. Different grain entirely. |
| 4 | `getDiscountSummary` | Monthly discount % from Sales01 | SP `SPDISCOUNTSUMMARY` | SP finds **invoices exceeding a staff discount threshold** (`@MAXDISC`) with per-staff job counts (Total/Running/Invoiced/Cancelled) — a discount-abuse audit, not a monthly trend. |
| 5 | `getMonthlySplitSales` | Monthly Nett/Labour/Parts from Sales01 header fields | SP `spMonthlySplitSales` | SP groups **Sales02 line items** by `SplitSection`/`ItemType` category — not the header's `TotLabour` field. |
| 6 | `getSalesLabourParts` | `TotLabour` header field / `Nett - TotLabour` residual | SP `spSalesLabourPartsReport` | SP recomputes the Labour/Parts split from **Sales02 line items using the `itemCode='000000'` convention** for Labour. If the `TotLabour` header field ever drifts from the underlying line-item sum, the app's number is wrong. |
| 7 | `getSalesmanInvoices` | `SUM(Nett) GROUP BY Sman` from Sales01 | SP `spRptSalesManInvoices` | SP groups by StaffId **and item category** (CatDescr) from Sales02, and adds TotalJob/InvJob/RunningJob counts per salesman. Richer and differently grained. |
| 8 | `getCustomerOutstandingSalesmanwise` | `SUM(Nett) WHERE paid=0 GROUP BY Sman` from Sales01 | SP `spCustomerOutStandingSalesManwise` | SP computes from the **ledger balance** (`CustBill01Sql.BalAmt <> 0` as of a cutoff date), salesman resolved via `OMasters Type='Q'`. **This exact SP is already correctly called elsewhere** — `customer.repository.ts.getCustomerOutstanding()`. The app currently has two live endpoints both named "customer outstanding" that return two different numbers. |
| 9 | `getSupplierOutstandingSummary` | `SUM(Nett) FROM LocalPurchase01 GROUP BY SuppId` | SP `spSupplierOutStandingSummary` | SP computes ledger DEBT/CRED balance per supplier from `ACDETAILS`, not from LocalPurchase01 invoice totals. |
| 10 | `getAgewiseSummary` / `getAgewiseDetails` | 30/60/90/180-day buckets on `Sales01.BillDt` | SP `AgewiseSummary` | SP buckets on **15/30/45/60/75/90/120/360 days**, based on account-ledger aging (ACHEAD/receipts/contact dates), not raw invoice date. This exact SP is **already correctly used elsewhere** — `customer.repository.ts.getCustomerAgewiseSummary`. Same duplicate-endpoint risk as #8, plus different bucket boundaries. |
| 11 | `getWorkInProgress` | `SalesOrdr01 WHERE CLOSED=0` + latest `jobInProgress` row | View `WorkInProgressSql` | The view is actually a **staff/technician clock-in-clock-out activity tracker** (EmpId, ActivityCode, LoggedIn/LoggedOut) — a completely different business object despite the near-identical name. The most misleading name-collision found in this audit. Also missing the `NOT IN Sales01 AND Delivered=0` exclusions — see jobs.repository.ts findings below, same root cause as the dashboard KPI bug fixed earlier. |
| 12 | `getStockValuationReport` / `getStockValuationSummary` / stock component of `getAcSummaryBalanceSheet` | `Qty × ISNULL(Cost,Srate)` | SP `spStockValuation` | SP computes cost as a **purchase-weighted average rate minus discount, as of a historical date** — not a static `Items.Cost`/`Srate` field lookup. Same invented-formula pattern as #2, repeated across 3+ functions. |
| 13 | `getStockAgingReport` | 30/60/90+ day buckets by transaction date | SP `spStockAgingReport` | SP buckets by **days since last transaction** against a caller-supplied threshold, and computes the same weighted-average cost as #12 (which the app version omits entirely). |
| 14 | `getSalesAnalysis` (+ aliases `getSalesReportCatSub`, `getSalesReportFM`, `getDiagnosticReport222`) | Monthly `SUM` from Sales01 | SP `SPSALESANALYSIS` | SP is a **per-line-item drill-down** with cost/margin calculated from `LocalPurchase02` rates — not a monthly aggregate. |

### No plausible DB match found (flagged, not silently changed)

`getTechnicianEfficiency`, `getGroupBalance`/`getGroupTotal`, `getAcSummary`,
`getAcSummaryBalanceSheet`/`New`, `getProfitLoss`/`Frm`,
`getVoucherDetailsList`, `getJournalVoucherReport`, `getCustomerBillsDetailed`
/`Pending`/`Summary`, `getStockLedger`, `getUsedCars`,
`getEmployeeAttendance`, `getVehicleAttendance`, `getOMastersReport`,
`getPurchaseReturnRegister`, `getCompanyReportHeader` — no clearly
corresponding SP/view was identified among the 111 SPs / 119 views checked.
`Ac_GroupTotal`, `ac_Group_Sum`, `acTBGroupTotal`, `TrialBalance` exist and
are plausible partial candidates for the accounts-summary group, but were
not body-verified in this pass (see Coverage note).

`getSalaryRegister`/`getSalarySlip` explicitly return "module not
configured" — an unimplemented stub, not a drift issue.

## jobs.repository.ts (mostly correct — the 4 flagged functions have confirmed drift)

| App function | Current behavior | Matching SP | Finding |
|---|---|---|---|
| `getWorkStatus` (powers the "Work Status" page, the primary Jobs screen) | `SalesOrdr01 WHERE CLOSED=0` + Customer + salesOrdrStatusHead | **`spGetWorkStatus`** | **Highest-confidence real match in this audit.** SP's filter is `Ordr NOT IN (SELECT Ordr FROM Sales01) AND ISNULL(Closed,0)=0 AND ISNULL(Delivered,0)=0` — the app is missing the `NOT IN Sales01` and `Delivered` exclusions entirely, the exact same gap already found and fixed in the dashboard KPI query. The SP also surfaces `ReadyToDeliver`, `PartsNotAvailable`, `INProgressYN`, `AssignedYN`, `days`, `ForeColour`/`BackColour`, and the assigned `EmpId` (via `WorkinProgressSql`/`AssignedJobs`) — none of which the current query computes, so any status-badge/colour logic on this page is working off incomplete data. |
| `getRunningJobs` | `jobInProgress WHERE LastRecord=1` + joins | `GetRunningJobsForWorkStatus` | Name-alike SP is actually a **single-criteria search-by-Ordr/Advisor/VehicleNo lookup helper** (returns just ID/Ordr/Advisor/RegNo) — a different purpose, not a full running-jobs list. No verified full-list match found. |
| `getCompletedJobs` | `SalesOrdr01 WHERE CLOSED=1` | `JObFinished` | SP is a multi-criteria search filtering `StatusID=@JobCompleted AND Closed=0 AND Invoiced=0` — i.e. "marked complete by status but not yet formally closed/billed." Opposite `Closed` value and a different meaning of "finished." Not a match. |
| `getWorkStatusOverview` | `COUNT(*) GROUP BY StatusID` from `SalesOrdr01 WHERE CLOSED=0` | **`spWorkStatusOverviewForControlRoom`** | Shares the same `NOT IN Sales01 / Closed=0 / Delivered=0` base filter as `spGetWorkStatus`, then classifies into 4 different "control room" views via an `@Type` param (active-only / parts-blocked / finished-not-closed / all). A richer feature, not a simple status count — and confirms the missing-exclusion bug is systemic across the whole work-status family, not a one-off. |
| `getPartsNotAvailableJobs` | — | `spPartsNotAvailJobs` | Already correctly wired via `callProcedure` — no action needed, included for completeness. |

## Why no code changes were applied in this pass

Every verified real match (`spGetWorkStatus`, `spWorkStatusOverviewForControlRoom`,
and the reports.repository.ts SPs above) returns a **different column set**
than the current raw query. Swapping the query alone would leave the
consuming frontend page rendering blank/undefined fields, or silently
dropping columns the SP doesn't return (e.g. `spGetWorkStatus` has no
`TechNote`, `Total`, or `Nett`, which `WorkStatus.tsx` currently displays).
Fixing the filter logic correctly requires updating the frontend's column
mapping in the same change — bigger than "swap the query" and risky to do
without sign-off on the new shape, since it could visibly break a
currently-working page.

## Recommended next steps, in priority order

1. **Highest value, lowest ambiguity**: `jobs.repository.ts.getWorkStatus` →
   `spGetWorkStatus`, paired with a `WorkStatus.tsx` column-mapping update.
   Fixes the same root cause already found and patched in the dashboard KPI
   query.
2. **Needs a product decision, not a code decision**: findings #8 and #10 —
   two live endpoints each for "customer outstanding" and "agewise summary,"
   computing genuinely different numbers under the same name. Someone with
   domain knowledge needs to decide which definition is authoritative before
   either is removed.
3. **Needs confirmation before enabling dead/disabled logic**:
   `ProductsOverview` and `spStockValuation`'s cost-basis formulas — turning
   on the currently-disabled purchase-weighted-average calculation changes
   real financial figures (stock valuation, product overview) that finance
   may already be relying on in their current simplified form.

## Coverage note

This pass verified ~18 of the ~40 raw-SQL functions in `reports.repository.ts`
against actual SP/view bodies (all reused/reference tables and prioritized
by likely name match), plus all 4 flagged `jobs.repository.ts` functions.
The remaining ~22 functions in reports.repository.ts (listed under "no
plausible match found") were checked against the full object list by name
only — a deeper pass would re-run this same body-level comparison for the
`Ac_GroupTotal`/`ac_Group_Sum`/`acTBGroupTotal`/`TrialBalance` cluster before
concluding "no match."

Full dump of all 230 view/SP definitions pulled from the live DB for this
audit is at (session-scoped, not committed to the repo):
`C:\Users\MARIA~1.JOH\AppData\Local\Temp\claude\d--Projects-GPPRO-Workshop-Management\567f52b6-f7d6-4796-9e4b-b13643f556bc\scratchpad\all_db_defs.sql`
