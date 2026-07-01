<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v10
  Generated at   : 2026-06-24 16:25:27 UTC
-->

# DB_CONNECTION_SPEC.md

---

## SECTION 1 — DATABASE CONNECTION

**Database Type:** SQL Server

**Connection String Template:**
```
Server=${DB_HOST};Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};Encrypt=false;TrustServerCertificate=true;
```

**Environment Variables:**
```
DB_TYPE=sqlserver
DB_HOST=192.168.0.235\sql2008
DB_NAME=autodealer
DB_USER=sa
DB_PASSWORD=p@ssw0rd
```

---

## SECTION 2 — STORED PROCEDURES

---
### spCustomerOutStandingSalesManwise
- Parameters:
  - @Date VARCHAR(10) [IN]
- Returns: TABLE (ID INT, CustID NVARCHAR, Bill NVARCHAR, Date DATETIME, Amount FLOAT, totRcpt FLOAT, AcName NVARCHAR, CUSTOMER INT, HEAD NVARCHAR, BalAmt FLOAT, Phone1 NVARCHAR, VSRL NVARCHAR, Ordr NVARCHAR, SalesMan NVARCHAR, [age in days] INT)
- Purpose: Returns outstanding customer balances grouped by sales person as of a given date.
- Maps to: GET /api/v1/customers/outstanding/salesmanwise

---
### spRptSalesManInvoices
- Parameters:
  - @FromDate DATETIME [IN]
  - @Todate DATETIME [IN]
- Returns: TABLE (StaffID NVARCHAR, SalesMan NVARCHAR, CatDescr NVARCHAR, Amount FLOAT, Discount FLOAT, TotalJob INT, InvJob INT, RunningJob INT)
- Purpose: Returns sales invoice totals, counts, and jobs grouped by sales advisor/staff, within date range.
- Maps to: GET /api/v1/sales/invoices/summary-by-staff

---
### PendingPurchaseDO
- Parameters:
  - @mSuppID NVARCHAR(255) [IN] (optional)
- Returns: TABLE (PDONo NVARCHAR, ID INT, SuppId NVARCHAR, Ref NVARCHAR, PorDt DATETIME, PurchaseID INT)
- Purpose: Lists all pending purchase delivery orders, can be filtered by supplier.
- Maps to: GET /api/v1/purchase/pending-delivery-orders

---
### spMonthlySplitSales
- Parameters:
  - @fromDate DATETIME [IN]
  - @toDate DATETIME [IN]
- Returns: TABLE (Month INT, Year INT, amount FLOAT, SplitSection NVARCHAR, ItemType NVARCHAR)
- Purpose: Aggregates monthly sales totals split by section and item type. 
- Maps to: GET /api/v1/sales/monthly-summary

---
### PartsAvailability_Sp
- Parameters:
  - @JobCard NVARCHAR(15) [IN, optional]
  - @AllOrApproved INT [IN] (0|1)
- Returns: TABLE (All fields from PartsAvailability_orderedsql view)
- Purpose: Returns availability status of parts, optionally filtered by job/approval.
- Maps to: GET /api/v1/parts/availability

---
### spStockLastTrans
- Parameters:
  - @StockDate VARCHAR(10) [IN]
- Returns: TABLE (itemcode VARCHAR, description VARCHAR, tag VARCHAR, location VARCHAR, stockDate DATETIME, Stock FLOAT, Rate FLOAT, TDR FLOAT, TDA FLOAT, Amount FLOAT, CostDisc FLOAT, AgeType INT, DaysInStock INT)
- Purpose: Provides last stock transaction record and aging info as of a date for all items.
- Maps to: GET /api/v1/stock/last-transaction

---
### GetSockQty
- Parameters: None
- Returns: TABLE (ITEMCODE NVARCHAR, TAG NVARCHAR, description VARCHAR, Location NVARCHAR, STOCK NUMERIC, COST NUMERIC)
- Purpose: Returns current stock quantity and cost for all items.
- Maps to: GET /api/v1/stock/availability

---
### ac_Group_Sum
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @DateOption INT [IN]
- Returns: TABLE (Bal FLOAT)
- Purpose: Returns sum balance of account group over period; option for using actual date vs voucher date.
- Maps to: GET /api/v1/accounts/group-balance

---
### Ac_GroupTotal
- Parameters:
  - @mCodes NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @DateOption INT [IN]
- Returns: TABLE (bal FLOAT)
- Purpose: Returns balance for a set of account codes over a period.
- Maps to: GET /api/v1/accounts/group-total

---
### spGetEstmationDetails
- Parameters:
  - @JobCardNo VARCHAR(12) [IN]
- Returns: TABLE (Approved INT, JobCardNo VARCHAR, ... Estimation01 fields, customer/vehicle details, RefNo)
- Purpose: Gets full details and approval status for a specific service estimation.
- Maps to: GET /api/v1/estimations/:jobCardNo

---
### SPACTREEVIEW
- Parameters: None
- Returns: TABLE (HEAD NVARCHAR, CODES VARCHAR, SCODE VARCHAR, DESCRIPTION VARCHAR, SORT INT, LEVEL INT)
- Purpose: Returns hierarchical account tree with levels and sorted order.
- Maps to: GET /api/v1/accounts/tree

---
### Ac_headBalance
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN, optional]
  - @mDate2 DATETIME [IN]
- Returns: TABLE (BalAmt FLOAT)
- Purpose: Returns the balance of a specified account at a date or over a period.
- Maps to: GET /api/v1/accounts/:code/balance

---
### SPCASHBANKDETAILS
- Parameters:
  - @ACCOUNT VARCHAR(50) [IN, nullable]
  - @FROMDATE VARCHAR(12) [IN]
  - @TODATE VARCHAR(12) [IN]
  - @TYPE VARCHAR(50) [IN] (All|filter)
- Returns: TABLE (All fields from ACDETAILSSQL bank/cash book subset)
- Purpose: Returns detailed cash or bank book ledger by account and type, over date range.
- Maps to: GET /api/v1/banking/book-details

---
### AcAgeWiseDetails
- Parameters:
  - @mDate DATETIME [IN]
  - @mHead NVARCHAR(255) [IN] (account head)
- Returns: TABLE (VSRL NVARCHAR, DATE DATETIME, AC NVARCHAR, description NVARCHAR, DEBT FLOAT, CRED FLOAT, Name NVARCHAR, Phone1 NVARCHAR, Fax NVARCHAR, ContactPerson NVARCHAR, ContactTel NVARCHAR, Days FLOAT)
- Purpose: Provides age-wise breakdown for specified head/customer/supplier as of a date.
- Maps to: GET /api/v1/accounts/agewise-details

---
### acBal
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @DateOption INT [IN]
- Returns: TABLE (bal FLOAT)
- Purpose: Returns account balance for requested code(s) and period.
- Maps to: GET /api/v1/accounts/balance

---
### AcClosingBalance
- Parameters:
  - @mAc NVARCHAR(255) [IN]
- Returns: TABLE (BalAmt FLOAT)
- Purpose: Returns closing balance for the given account code.
- Maps to: GET /api/v1/accounts/:code/closing-balance

---
### spGetVehicleStatus
- Parameters:
  - @VehNo VARCHAR(50) [IN]
  - @JobCardNo VARCHAR(50) [IN]
  - @Status INT [OUT]
- Returns: INT status code (0:not matched, 1:active, 2:delivered, 3:invoiced)
- Purpose: Returns status code for a vehicle/job card.
- Maps to: GET /api/v1/vehicles/:vehNo/job-status/:jobCardNo

---
### AcCurrentTrans
- Parameters:
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mHead NVARCHAR(10) [IN, nullable]
- Returns: TABLE (DESCRIPTION NVARCHAR, CODES NVARCHAR, HEAD NVARCHAR, bankType INT, bank INT, Opn FLOAT, CurrDr FLOAT, CurrCr FLOAT)
- Purpose: Returns opening/current debit/credit for all or filtered accounts between dates.
- Maps to: GET /api/v1/accounts/transactions/current

---
### CustomerOverview
- Parameters:
  - @PageNumber INT [IN]
  - @RecodsPerPage INT [IN]
  - @HowManyRecords INT [OUT]
  - @WhereCondition VARCHAR(8000) [IN, SQL snippet]
- Returns: TABLE (RowNumber INT, CustId INT, Name VARCHAR, Phone VARCHAR, Fax VARCHAR, Contact Person VARCHAR, Contact Phone VARCHAR, Area VARCHAR, DEBT NUMERIC, CRED NUMERIC, OutStanding NUMERIC, ACCode VARCHAR)
- Purpose: Returns paginated customer overview data including outstanding balances and contact.
- Maps to: GET /api/v1/customers/overview

---
### ACDETAILSDET
- Parameters:
  - @mVsrl NVARCHAR(255) [IN]
  - @mAc NVARCHAR(255) [IN]
- Returns: TABLE (All columns from ACDETAILSSQL)
- Purpose: Returns voucher/linedetails for a voucher serial and, optionally, account.
- Maps to: GET /api/v1/vouchers/:vsrl/details

---
### AcHeadList
- Parameters:
  - @mAc NVARCHAR(255) [IN]
- Returns: TABLE (TreeHD NVARCHAR, achead.*, TotRec INT)
- Purpose: Lists account heads/tree and total record counts, filtering by code if given.
- Maps to: GET /api/v1/accounts/heads

---
### Opening_Balance_NEW
- Parameters:
  - @mDate DATETIME [IN]
  - @mAc NVARCHAR(255) [IN]
  - @mActualDate INT [IN] (0|1)
  - @mGroupFilter VARCHAR(200) [IN]
- Returns: TABLE (OpDebt FLOAT, OpCred FLOAT, OpClosing FLOAT)
- Purpose: Returns opening balances for an account and group up to a date.
- Maps to: GET /api/v1/accounts/opening-balance

---
### GetStaffDetFromOrder
- Parameters:
  - @mOrder NVARCHAR(10) [IN]
- Returns: TABLE (StaffID NVARCHAR)
- Purpose: Gets staff/advisor for an order (job).
- Maps to: GET /api/v1/orders/:orderId/staff

---
### ACMASTERDET
- Parameters:
  - @mID INTEGER [IN] (optional)
  - @mVsrl NVARCHAR(255) [IN]
- Returns: TABLE (All fields from acmasterSql)
- Purpose: Gets voucher master record by ID or serial.
- Maps to: GET /api/v1/vouchers/master

---
### VoucherList_NEW
- Parameters:
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mAc VARCHAR(255) [IN]
  - @mActualDate INT [IN] (0|1)
  - @mGroupFilter VARCHAR(200) [IN]
- Returns: TABLE (All fields from acdetailsSql + group info)
- Purpose: Lists vouchers with detail between two dates, filterable.
- Maps to: GET /api/v1/vouchers

---
### AcOpeningBalance
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
- Returns: TABLE (BalAmt FLOAT)
- Purpose: Gets opening balance for an account up to date or for a period.
- Maps to: GET /api/v1/accounts/:code/opening-balance

---
### ProductsOverview
- Parameters:
  - @PageNumber INT [IN]
  - @RecodsPerPage INT [IN]
  - @HowManyRecords INT [OUT]
  - @WhereCondition VARCHAR(8000) [IN, SQL snippet]
- Returns: TABLE ([Id] INT, [Code] VARCHAR, [Description] VARCHAR, PartNo VARCHAR, Category VARCHAR, [Stock Qty] NUMERIC, [Stock Value] FLOAT)
- Purpose: Paginated product overview with balances, quick product lookup.
- Maps to: GET /api/v1/products/overview

---
### AcRcptSum
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate DATETIME [IN]
  - @mCustSupp INT [IN]
  - @mActualdate INT [IN]
- Returns: TABLE (RcVDAmnt FLOAT)
- Purpose: Returns sum of receipts/debits for a given account as of a date.
- Maps to: GET /api/v1/accounts/:code/receipt-summary

---
### AcSummary
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mGroupID INT [IN]
  - @DateOption INT [IN]
- Returns: TABLE (TreeHD NVARCHAR, head NVARCHAR, codes NVARCHAR, description NVARCHAR, [group] INT, bank INT, banktype INT, locked INT, [hidden] INT, lock INT, SumCr FLOAT, SumDr FLOAT)
- Purpose: Returns a summary of all account codes and grouped totals for a period.
- Maps to: GET /api/v1/accounts/summary

---
### AcSummary_balansheet
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mGroupID INT [IN]
  - @DateOption INT [IN]
  - @mFilterFld NVARCHAR(255) [IN]
- Returns: TABLE (TreeHD NVARCHAR, codes NVARCHAR, head NVARCHAR, description NVARCHAR, display INT, [group] INT, freeze INT, lock INT, bal FLOAT, grptotal FLOAT, Locked INT)
- Purpose: Returns account summary for balance sheet as of a date/group/period.
- Maps to: GET /api/v1/accounts/summary-balance-sheet

---
### AcSummary_balansheet_New
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mGroupID INT [IN]
  - @DateOption INT [IN]
  - @mFilterFld NVARCHAR(255) [IN]
  - @FromBalanceSheet INT [IN]
- Returns: TABLE (TreeHD NVARCHAR, codes NVARCHAR, head NVARCHAR, description NVARCHAR, display INT, [group] INT, freeze INT, lock INT, bal FLOAT, grptotal FLOAT, Locked INT)
- Purpose: New version: balance sheet/PL summary by period.
- Maps to: GET /api/v1/accounts/summary-balance-sheet-new

---
### spGetWorkStatus
- Parameters: None
- Returns: TABLE ([SELECT] BIT, Ordr NVARCHAR, Status NVARCHAR, ordt DATETIME, CustName NVARCHAR, ContactTel NVARCHAR, CustEstValue FLOAT, EngineNo NVARCHAR, VehNo NVARCHAR, Make NVARCHAR, Colour NVARCHAR, StaffName NVARCHAR, ReadyToDeliver BIT, PartsNotAvailable BIT, INProgressYN BIT, AssignedYN BIT, Days INT, forecolour NVARCHAR, backcolour NVARCHAR, EmpID INT, StatusId INT)
- Purpose: Returns all work/job orders currently not delivered/closed, including assignment details.
- Maps to: GET /api/v1/jobs/work-status

---
### GetRunningJobsForWorkStatus
- Parameters:
  - @Ordr VARCHAR(20) [IN, optional]
  - @ServAdv VARCHAR(30) [IN, optional]
  - @VehNo VARCHAR(25) [IN, optional]
- Returns: TABLE (ID INT, Ordr NVARCHAR, [Serv. Adv] NVARCHAR, [Reg. No] NVARCHAR)
- Purpose: Returns jobs in progress, with optional filter by order, advisor, vehicle.
- Maps to: GET /api/v1/jobs/running

---
### spPartsNotAvailJobs
- Parameters: None
- Returns: TABLE ([Select] BIT, Ordr NVARCHAR, CompletionDate DATETIME, CustName NVARCHAR, ContactTel NVARCHAR, CustEstValue FLOAT, EngineNo NVARCHAR, VehNo NVARCHAR, Make NVARCHAR, Colour NVARCHAR, Status NVARCHAR, StaffName NVARCHAR)
- Purpose: Returns job orders which have status “Parts Not Available” or relevant flag.
- Maps to: GET /api/v1/jobs/parts-not-available

---
### spWorkStatusOverviewForControlRoom
- Parameters:
  - @Type INT [IN]
- Returns: TABLE ([Select] BIT, Ordr NVARCHAR, CompletionDate DATETIME, CustName NVARCHAR, ContactTel NVARCHAR, CustEstValue FLOAT, EngineNo NVARCHAR, VehNo NVARCHAR, Make NVARCHAR, Colour NVARCHAR, Status NVARCHAR, StaffName NVARCHAR)
- Purpose: Returns job/work status overview, filter depending on type param (jobs, parts N/A, finished).
- Maps to: GET /api/v1/jobs/work-status-overview

---
### JObFinished
- Parameters:
  - @mCustID NVARCHAR(10) [IN]
  - @mStaffID NVARCHAR(10) [IN]
  - @mVehID NVARCHAR(10) [IN]
  - @mOrdr NVARCHAR(10) [IN]
  - @JobCompleted INT [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
- Returns: TABLE (* from salesordr01sql)
- Purpose: Returns jobs/works that are set to finished (StatusID).
- Maps to: GET /api/v1/jobs/completed

---
### VoucherList
- Parameters:
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mAc VARCHAR(255) [IN]
  - @mActualDate INT [IN, 0|1]
- Returns: TABLE (from acdetailsSql)
- Purpose: Returns vouchers (journal entries/lines) within date/period, optional filter by account.
- Maps to: GET /api/v1/vouchers

---
### VoucherList_Pdc
- Parameters:
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mAc VARCHAR(255) [IN]
  - @mFilterAc NVARCHAR(255) [IN]
- Returns: TABLE (from acdetailsSql)
- Purpose: Returns voucher entries specific to post-dated cheques.
- Maps to: GET /api/v1/vouchers/pdc

---
### VoucherSummary
- Parameters:
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mAc NVARCHAR(255) [IN]
  - @mActualDate INT [IN]
- Returns: TABLE (Sum_DEBT FLOAT, Sum_CRED FLOAT, AC NVARCHAR, DESCRIPTION NVARCHAR, mYY INT, mMM INT)
- Purpose: Returns debit/credit summary by month for an account.
- Maps to: GET /api/v1/vouchers/summary

---
### VoucherSummary_PDC
- Parameters:
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mAc NVARCHAR(255) [IN]
  - @mFilterAc NVARCHAR(255) [IN]
- Returns: TABLE (Sum_DEBT FLOAT, Sum_CRED FLOAT, AC NVARCHAR, DESCRIPTION NVARCHAR, mYY INT, mMM INT)
- Purpose: Returns debit/credit by month for an account with filter on PDC accounts.
- Maps to: GET /api/v1/vouchers/summary-pdc

---
### InvoicePendingDo
- Parameters:
  - @mOrdr NVARCHAR(255) [IN]
- Returns: TABLE (DoNo NVARCHAR, BillID INT, Tag NVARCHAR, Qty FLOAT)
- Purpose: Returns pending delivery orders for a sales order/job not yet invoiced.
- Maps to: GET /api/v1/invoices/:orderId/pending-delivery-orders

---
### SPSALESANALYSISREPORT
- Parameters:
  - @FROMDATE VARCHAR(10) [IN]
  - @TODATE VARCHAR(10) [IN]
- Returns: TABLE (ID INT, BILL NVARCHAR, BILLDT DATETIME, VSRL NVARCHAR, ORDR NVARCHAR, NETT FLOAT, CUSTNAME NVARCHAR, PHONE1 NVARCHAR, STAFFNAME NVARCHAR, VEHNO NVARCHAR, MAKE NVARCHAR, PAID FLOAT)
- Purpose: Returns invoice, customer, vehicle and paid amount for sales analysis.
- Maps to: GET /api/v1/sales/analysis

---
### MailCheck
- Parameters:
  - @mUserID NVARCHAR(255) [IN]
- Returns: TABLE (MailCount INT)
- Purpose: Returns unread inbox message count for a user.
- Maps to: GET /api/v1/mail/count

---
### MailRead
- Parameters:
  - @Uid NVARCHAR(255) [IN]
  - @Option INT [IN] (read/unread)
- Returns: TABLE (mailtable.* and column Opt)
- Purpose: Returns unread or read messages for a user.
- Maps to: GET /api/v1/mail

---
### AgewiseSummary
- Parameters:
  - @mDate DATETIME [IN]
  - @mActualDate INT [IN]
  - @Customer INT [IN]
  - @Supplier INT [IN]
  - @mCode VARCHAR(10) [IN]
  - @mDatewise INT [IN]
  - @mContactdate VARCHAR(10) [IN]
  - @ReportType INT [IN]
- Returns: TABLE (ac NVARCHAR, description NVARCHAR, Name NVARCHAR, Phone1 NVARCHAR, Fax NVARCHAR, ContactPerson NVARCHAR, ContactTel NVARCHAR, salesman NVARCHAR, Days FLOAT, D15 FLOAT, D30 FLOAT, D45 FLOAT, D60 FLOAT, D75 FLOAT, D90 FLOAT, D120 FLOAT, D360 FLOAT, Rcpt FLOAT, Tot FLOAT, Rcpt5 FLOAT, NextContactDt DATETIME, LastContactDt DATETIME, Freezed INT)
- Purpose: Returns aged balances for customers/suppliers.
- Maps to: GET /api/v1/accounts/agewise-summary

---
### CheckPendingDO
- Parameters:
  - @mOrdr NVARCHAR(255) [IN]
- Returns: TABLE (dono NVARCHAR, tag NVARCHAR, qty FLOAT)
- Purpose: Returns pending delivery order details for a job/order.
- Maps to: GET /api/v1/orders/:orderId/pending-do

---
### spFastMovingItems
- Parameters:
  - @FromDate VARCHAR(10) [IN]
  - @Todate VARCHAR(10) [IN]
  - @minCount INT [IN]
- Returns: TABLE (cnt FLOAT, ITEMCODE NVARCHAR, TAG NVARCHAR, description NVARCHAR)
- Purpose: Lists fast moving items in inventory for the sales period/count.
- Maps to: GET /api/v1/stock/fast-moving

---
### spSalesBillReport
- Parameters:
  - @fromDate VARCHAR(10) [IN]
  - @ToDate VARCHAR(10) [IN]
  - @option INT [IN]
- Returns: TABLE (Ordr NVARCHAR, Bill NVARCHAR, BillDt DATETIME, Nett FLOAT, CustName NVARCHAR, Phone1 NVARCHAR, StaffName NVARCHAR, Vehno NVARCHAR, Make NVARCHAR, PaidAmount FLOAT, Balance FLOAT)
- Purpose: Returns sales bills and paid/balance amounts within a date range.
- Maps to: GET /api/v1/sales/bill-report

---
### PROCVOUCHERLIST
- Parameters:
  - @FROMDATE VARCHAR(10) [IN]
  - @TODATE VARCHAR(10) [IN]
- Returns: TABLE (PAYTYPE NVARCHAR, RefNo NVARCHAR, AC NVARCHAR, VAC NVARCHAR, DATE DATETIME, DEBT FLOAT, CRED FLOAT, DESCRIPTION NVARCHAR, VACDESCR NVARCHAR, NARRATION NVARCHAR, VTYPE NVARCHAR, TYPE VARCHAR)
- Purpose: Returns vouchers and paytype for cash/bank accounts within date.
- Maps to: GET /api/v1/vouchers/type-list

---
### SPDISCOUNTSUMMARY
- Parameters:
  - @FROMDATE VARCHAR(10) [IN]
  - @TODATE VARCHAR(10) [IN]
  - @MAXDISC FLOAT [IN]
- Returns: TABLE (BILL NVARCHAR, BILLDT DATETIME, CUSTNAME NVARCHAR, INVAMT FLOAT, DISCOUNT FLOAT, DISCCALC FLOAT, NETT FLOAT, TOTLJOBS INT, RUNNINGJOBS INT, INVJOBS INT, PAIDJOBS INT, CANCELJOBS INT, STAFFID NVARCHAR, STAFFNAME NVARCHAR)
- Purpose: Returns summary of discounts for invoices in date range.
- Maps to: GET /api/v1/sales/discount-summary

---
### spSupplierOutStandingSummary
- Parameters: None
- Returns: TABLE (SuppId NVARCHAR, SuppName NVARCHAR, Address NVARCHAR, Phone1 NVARCHAR, Fax NVARCHAR, DEBT FLOAT, CRED FLOAT, LedgerBal FLOAT, PaidAmt FLOAT, BillBal FLOAT)
- Purpose: Returns supplier outstanding and paid/balance amounts.
- Maps to: GET /api/v1/suppliers/outstanding-summary

---
### Invoice_PaidUnpaid
- Parameters:
  - @mCustID NVARCHAR(10) [IN]
  - @mStaffID NVARCHAR(10) [IN]
  - @mVehID NVARCHAR(10) [IN]
  - @mOrdr NVARCHAR(10) [IN]
  - @mBalAmtType INT [IN]
  - @mDelivered INT [IN]
  - @mDate1 NVARCHAR(15) [IN]
  - @mDate2 NVARCHAR(15) [IN]
- Returns: TABLE (All from Sales01Sql_acBal)
- Purpose: Returns invoices (paid/unpaid) for customers/staff/vehicle/orders.
- Maps to: GET /api/v1/invoices/paid-unpaid

---
### VehicleHistory
- Parameters:
  - @mCustID NVARCHAR(10) [IN]
  - @mStaffID NVARCHAR(10) [IN]
  - @mVehID NVARCHAR(10) [IN]
  - @mOrdr NVARCHAR(10) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
- Returns: TABLE (* from salesOrdr01Sql)
- Purpose: Returns sales/order history for a vehicle, customer, staff, or order.
- Maps to: GET /api/v1/vehicles/:vehId/history

---
### ProductsOverview
- Parameters:
  - @PageNumber INT [IN]
  - @RecodsPerPage INT [IN]
  - @HowManyRecords INT [OUT]
  - @WhereCondition VARCHAR(8000) [IN]
- Returns: TABLE (Id INT, Code VARCHAR, Description VARCHAR, PartNo VARCHAR, Category VARCHAR, StockQty NUMERIC, StockValue FLOAT)
- Purpose: Returns paged products with stock and value.
- Maps to: GET /api/v1/products/overview

---
### spItemTransactionCount
- Parameters:
  - @dtFrom VARCHAR(10) [IN]
  - @dtto VARCHAR(10) [IN]
  - @Count INT [IN]
  - @CatId INT [IN]
- Returns: TABLE (itemcode NVARCHAR, tag NVARCHAR, description NVARCHAR, total NUMERIC)
- Purpose: Returns count of item transactions for a category & period.
- Maps to: GET /api/v1/items/transaction-count

---
### spStockValuation
- Parameters:
  - @type VARCHAR(10) [IN]
  - @Date VARCHAR(10) [IN]
- Returns: TABLE (Type NVARCHAR, ItemType NVARCHAR, ItemCode NVARCHAR, Tag NVARCHAR, Description NVARCHAR, Location NVARCHAR, StockIN FLOAT, StockOut FLOAT, Balance FLOAT, COST FLOAT)
- Purpose: Returns inventory valuation for all or filtered items as of a given date.
- Maps to: GET /api/v1/stock/valuation

---
### spStockAgingReport
- Parameters:
  - @type VARCHAR(10) [IN]
  - @Date VARCHAR(10) [IN]
  - @Days INT [IN]
- Returns: TABLE (Type NVARCHAR, ItemType NVARCHAR, ItemCode NVARCHAR, Tag NVARCHAR, Description NVARCHAR, Location NVARCHAR, StockIN FLOAT, StockOut FLOAT, Balance FLOAT, COST FLOAT, LastTranDate DATETIME, Days INT)
- Purpose: Provides aging analysis of inventory items, showing duration stock has not moved.
- Maps to: GET /api/v1/stock/aging

---
### spSalesReportForFM
- Parameters:
  - @BodyShop BIT [IN]
  - @year INT [IN]
- Returns: TABLE (Bill NVARCHAR, BillDt DATETIME, CustName NVARCHAR, Amount FLOAT, CorQ NVARCHAR, StaffId NVARCHAR)
- Purpose: Returns sales report for field/mobile or body shop for a year.
- Maps to: GET /api/v1/sales/report-fm

---
### spSalesReportCatSub
- Parameters:
  - @staffId VARCHAR(10) [IN]
  - @FromDate DATETIME [IN]
  - @ToDate DATETIME [IN]
- Returns: TABLE (CatID NVARCHAR, Category NVARCHAR, StaffId VARCHAR, Amount FLOAT, Disc FLOAT)
- Purpose: Returns sales totals by item category/subcategory and staff/date.
- Maps to: GET /api/v1/sales/category-summary

---
### spSalesLabourPartsReport
- Parameters:
  - @FromDt VARCHAR(10) [IN]
  - @ToDt VARCHAR(10) [IN]
- Returns: TABLE (Bill NVARCHAR, BillDt DATETIME, Ordr NVARCHAR, CustName NVARCHAR, Vehno NVARCHAR, Make NVARCHAR, LabourTotal FLOAT, PartsTotal FLOAT, Nett FLOAT, StaffId NVARCHAR, StaffName NVARCHAR)
- Purpose: Returns report of job/labour/parts sales over a period.
- Maps to: GET /api/v1/sales/labour-parts-report

---
### SP_MarginRpt
- Parameters:
  - @DTFROM VARCHAR(10) [IN]
  - @DTTO VARCHAR(10) [IN]
  - @ORDRNO VARCHAR(10) [IN]
  - @INVNO VARCHAR(10) [IN]
- Returns: TABLE (Bill NVARCHAR, BlDt DATETIME, Ordr NVARCHAR, Ordt DATETIME, ... Margin FLOAT, BillTotNett FLOAT ...)
- Purpose: Returns report of sales margins, costs, parts/labour per invoice.
- Maps to: GET /api/v1/sales/margin-report

---

## Coverage Check

- Total procedures in DB_CONNECTION_SPEC.md: 57
- Procedures mapped to endpoints: 57
- Unmapped procedures (not needed for this application):  
  - dt_generateansiname, dt_adduserobject, dt_setpropertybyid, dt_getobjwithprop, dt_getpropertiesbyid, dt_setpropertybyid_u, dt_getobjwithprop_u, dt_getpropertiesbyid_u, dt_dropuserobjectbyid, dt_adduserobject_vcs, dt_addtosourcecontrol, dt_getpropertiesbyid_vcs, dt_displayoaerror, dt_validateloginparams, dt_addtosourcecontrol_u, dt_getpropertiesbyid_vcs_u, dt_checkinobject, dt_checkoutobject, dt_isundersourcecontrol, dt_removefromsourcecontrol, dt_checkinobject_u, dt_checkoutobject_u, dt_isundersourcecontrol_u, dt_whocheckedout, dt_whocheckedout_u, Row_Count, ConvertToMonth, AcHead_GroupBal, CurrentStock, Invoiced_Order, tonumber, GetAcRefNo

These unmapped are system utility/internal tooling functions or DB versioning support — not required for the business application API surface.

---

## SECTION 3 — EXISTING TABLES REFERENCED

| Table Name               | Description                                                                           |
|--------------------------|---------------------------------------------------------------------------------------|
| ACDETAILS                | Journal voucher transaction lines (debit/credit per ledger)                           |
| ACHEAD                   | Account heads/master chart of accounts, including customer/supplier/bank mapping      |
| ACMASTER                 | Voucher master records — headers for each voucher batch                               |
| Ajanda                   | Calendar/agenda entries for jobs, orders, activities                                 |
| Ajanda02                 | Calendar assigned users                                                              |
| AssignedJobs             | Stores job assignments to employees                                                  |
| AttachmentMaster         | Metadata for stored file attachments and document links                              |
| Branch                   | Company branch/location master                                                       |
| Company                  | Company info                                                                         |
| CustBill01, CustBill02   | Customer billing heads and details                                                   |
| Customer                 | Customer master data                                                                |
| CustomerVehicle          | Vehicle records linked to customer accounts                                          |
| Delivery01, Delivery02   | Sales order/delivery order header and item lines                                     |
| Department               | Trade/department master                                                              |
| Document01               | Document entry and storage                                                           |
| Items                    | Master list of items/parts/stock                                                     |
| LocalPurchase01, 02      | Local purchase order headers and details                                             |
| LpoIssue01, LpoIssue02   | LPO issue headers and details                                                        |
| MailTable                | Internal system/user mail/notifications                                              |
| MIRStatusDtl             | Material inward status details                                                       |
| Omasters                 | Code master for role, type, godown, staff, category, etc.                            |
| Partsavailable01, 02     | Parts/stock availability status/requests                                             |
| Prodrequest01, 02        | Product requisition headers and details                                              |
| ProformaSales01, 02      | Proforma (quotation) sales order head and details                                    |
| PurchaseDO01, 02         | Purchase delivery order and items                                                    |
| PurchaseVehicleLink      | Links purchases to vehicle/job                                                       |
| Preturn01, 02            | Purchase return head/details                                                         |
| QtnRequest01, 02         | Quotation requests and items                                                         |
| salary01                 | Salary master/details                                                                |
| Sales01, Sales02         | Sales invoice header and lines                                                       |
| SalesOrdr01, SalesOrdr02 | Sales order header and details                                                       |
| salesOrdrStatusDtl, Head | Sales order/job status tracking for workflow                                         |
| Section                  | Section/work area master                                                             |
| settings                 | Misc application/business policy settings                                            |
| Sreturn01, SReturn02     | Sales return head and item lines                                                     |
| StockIn01, StockIn02     | Stock in transaction header/details                                                  |
| StockOut01, StockOut02   | Stock out transaction header/details                                                 |
| StockTransaction         | All stock movement ledger entries (in/out)                                           |
| SuppBill01, SuppBill02   | Supplier bill head and line items                                                    |
| Supplier                 | Supplier/vendor master records                                                       |
| tempMarginReport         | Temporary sales margin report data                                                   |
| UsedCarsSql              | Used-car specialized record (automotive vertical)                                    |
| Users, USERS             | User authentication and profile records                                              |
| Vehicles                 | Fleet/vehicle records                                                                |
| WorkInProgress           | Tracks ongoing work/job status for service/repair                                    |

**Note:** Some tables have historical variants (e.g. *_31_07_2011); these are for archive rows and not in live use unless PRD specifies.

---
**NO MODIFICATION TO ANY EXISTING TABLES OR SCHEMA IS PERMITTED. All access is via stored procedures as documented above.**
