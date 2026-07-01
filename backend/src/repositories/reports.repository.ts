import { getDbPool } from '../db/connection';
import sql from 'mssql';

// Helper for date range filters on a named column
function addDateRange(req: any, where: string, p: any, col: string) {
  if (p.fromDate) { req.input('fromDate', sql.DateTime, new Date(p.fromDate)); where += ` AND ${col} >= @fromDate`; }
  if (p.toDate) { req.input('toDate', sql.DateTime, new Date(p.toDate)); where += ` AND ${col} <= @toDate`; }
  return where;
}

// Safe join from ACDETAILS.AC (NVarChar, may contain non-numeric values) to ACHEAD.ID (INT)
const AC_JOIN = "CASE WHEN d.AC NOT LIKE '%[^0-9]%' AND LEN(d.AC)>0 THEN CAST(d.AC AS INT) ELSE NULL END = h.ID";
const AC_JOIN_T = "CASE WHEN t.AC NOT LIKE '%[^0-9]%' AND LEN(t.AC)>0 THEN CAST(t.AC AS INT) ELSE NULL END = h.ID";

export async function getSalesAnalysis(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'BillDt');
  if (p.custId) { req.input('custId', sql.NVarChar, String(p.custId)); where += ' AND CustId=@custId'; }
  const result = await req.query(
    `SELECT YEAR(BillDt) AS yr, MONTH(BillDt) AS mth,
            COUNT(*) AS BillCount, SUM(Total) AS TotalGross,
            SUM(Nett) AS TotalNet, SUM(TotLabour) AS TotalLabour,
            SUM(Tdr+Tda) AS TotalDiscount
     FROM Sales01 WHERE ${where}
     GROUP BY YEAR(BillDt), MONTH(BillDt)
     ORDER BY yr DESC, mth DESC`
  );
  return { recordset: result.recordset };
}

export async function getMonthlySplitSales(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'BillDt');
  const result = await req.query(
    `SELECT YEAR(BillDt) AS yr, MONTH(BillDt) AS mth,
            DATENAME(MONTH, BillDt) AS MonthName,
            COUNT(*) AS BillCount,
            SUM(Nett) AS TotalNet,
            SUM(TotLabour) AS TotalLabour,
            SUM(Nett - ISNULL(TotLabour,0)) AS TotalParts
     FROM Sales01 WHERE ${where}
     GROUP BY YEAR(BillDt), MONTH(BillDt), DATENAME(MONTH, BillDt)
     ORDER BY yr DESC, mth DESC`
  );
  return { recordset: result.recordset };
}

export async function getDiscountSummary(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'BillDt');
  const result = await req.query(
    `SELECT YEAR(BillDt) AS yr, MONTH(BillDt) AS mth,
            COUNT(*) AS BillCount,
            SUM(Total) AS TotalGross, SUM(Nett) AS TotalNet,
            SUM(ISNULL(Tdr,0)) AS TotalTrade, SUM(ISNULL(Tda,0)) AS TotalAdd,
            SUM(ISNULL(Tdr,0)+ISNULL(Tda,0)) AS TotalDiscount,
            CASE WHEN SUM(Total)>0 THEN 100.0*SUM(ISNULL(Tdr,0)+ISNULL(Tda,0))/SUM(Total) ELSE 0 END AS DiscountPct
     FROM Sales01 WHERE ${where}
     GROUP BY YEAR(BillDt), MONTH(BillDt)
     ORDER BY yr DESC, mth DESC`
  );
  return { recordset: result.recordset };
}

export async function getSalesLabourParts(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'BillDt');
  const result = await req.query(
    `SELECT YEAR(BillDt) AS yr, MONTH(BillDt) AS mth,
            COUNT(*) AS BillCount,
            SUM(Nett) AS TotalNet,
            SUM(ISNULL(TotLabour,0)) AS TotalLabour,
            SUM(Nett - ISNULL(TotLabour,0)) AS TotalParts,
            CASE WHEN SUM(Nett)>0 THEN 100.0*SUM(ISNULL(TotLabour,0))/SUM(Nett) ELSE 0 END AS LabourPct
     FROM Sales01 WHERE ${where}
     GROUP BY YEAR(BillDt), MONTH(BillDt)
     ORDER BY yr DESC, mth DESC`
  );
  return { recordset: result.recordset };
}

export async function getSalesReportCatSub(p: any) { return getSalesAnalysis(p); }
export async function getSalesReportFM(p: any) { return getSalesAnalysis(p); }
export async function getSalesmanInvoices(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'BillDt');
  if (p.sman) { req.input('sman', sql.NVarChar, String(p.sman)); where += ' AND Sman=@sman'; }
  const result = await req.query(
    `SELECT Sman, COUNT(*) AS BillCount, SUM(Nett) AS TotalNet
     FROM Sales01 WHERE ${where}
     GROUP BY Sman ORDER BY TotalNet DESC`
  );
  return { recordset: result.recordset };
}

export async function getMarginReport(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'BillDt');
  const result = await req.query(
    `SELECT YEAR(BillDt) AS yr, MONTH(BillDt) AS mth,
            SUM(Total) AS Revenue, SUM(Nett) AS NetRevenue,
            SUM(Tda+Tdr) AS Discounts
     FROM Sales01 WHERE ${where}
     GROUP BY YEAR(BillDt), MONTH(BillDt)
     ORDER BY yr DESC, mth DESC`
  );
  return { recordset: result.recordset };
}

export async function getCustomerOutstandingSalesmanwise(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = "paid=0";
  where = addDateRange(req, where, p, 'BillDt');
  if (p.sman) { req.input('sman', sql.NVarChar, String(p.sman)); where += ' AND Sman=@sman'; }
  const result = await req.query(
    `SELECT Sman, COUNT(*) AS BillCount, SUM(Nett) AS Outstanding,
            MIN(BillDt) AS OldestBill, MAX(BillDt) AS LatestBill
     FROM Sales01 WHERE ${where}
     GROUP BY Sman ORDER BY Outstanding DESC`
  );
  return { recordset: result.recordset };
}

export async function getSupplierOutstandingSummary(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'InvDt');
  if (p.suppId) { req.input('suppId', sql.Int, Number(p.suppId)); where += ' AND SuppId=@suppId'; }
  const result = await req.query(
    `SELECT lp.SuppId, s.SuppName, COUNT(*) AS InvCount, SUM(lp.Nett) AS TotalOwed,
            MIN(lp.InvDt) AS OldestInv, MAX(lp.InvDt) AS LatestInv
     FROM LocalPurchase01 lp
     LEFT JOIN Supplier s ON s.SuppId=lp.SuppId
     WHERE ${where}
     GROUP BY lp.SuppId, s.SuppName ORDER BY TotalOwed DESC`
  );
  return { recordset: result.recordset };
}

export async function getAgewiseSummary(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  const refDate = p.asOfDate ? new Date(p.asOfDate) : new Date();
  req.input('refDate', sql.DateTime, refDate);
  const result = await req.query(
    `SELECT
       SUM(CASE WHEN DATEDIFF(day, BillDt, @refDate) <= 30 THEN Nett ELSE 0 END) AS [0_30],
       SUM(CASE WHEN DATEDIFF(day, BillDt, @refDate) BETWEEN 31 AND 60 THEN Nett ELSE 0 END) AS [31_60],
       SUM(CASE WHEN DATEDIFF(day, BillDt, @refDate) BETWEEN 61 AND 90 THEN Nett ELSE 0 END) AS [61_90],
       SUM(CASE WHEN DATEDIFF(day, BillDt, @refDate) BETWEEN 91 AND 180 THEN Nett ELSE 0 END) AS [91_180],
       SUM(CASE WHEN DATEDIFF(day, BillDt, @refDate) > 180 THEN Nett ELSE 0 END) AS [Over180],
       SUM(Nett) AS Total,
       COUNT(*) AS BillCount
     FROM Sales01 WHERE paid=0`
  );
  return { recordset: result.recordset };
}

export async function getAgewiseDetails(p: any) {
  const pool = await getDbPool();
  const page = p.page || 1; const limit = p.limit || 100; const offset = (page - 1) * limit;
  const req = pool.request();
  const refDate = p.asOfDate ? new Date(p.asOfDate) : new Date();
  req.input('refDate', sql.DateTime, refDate);
  req.input('limit', sql.Int, limit); req.input('offset', sql.Int, offset);
  const result = await req.query(
    `SELECT * FROM (
       SELECT ROW_NUMBER() OVER (ORDER BY BillDt ASC) AS rn,
              CustId, CustomerName, Bill, BillDt, Nett,
              DATEDIFF(day, BillDt, @refDate) AS AgeDays,
              CASE
                WHEN DATEDIFF(day, BillDt, @refDate) <= 30 THEN '0-30'
                WHEN DATEDIFF(day, BillDt, @refDate) <= 60 THEN '31-60'
                WHEN DATEDIFF(day, BillDt, @refDate) <= 90 THEN '61-90'
                WHEN DATEDIFF(day, BillDt, @refDate) <= 180 THEN '91-180'
                ELSE 'Over 180'
              END AS AgeBucket
       FROM Sales01 WHERE paid=0
     ) t WHERE rn > @offset AND rn <= (@offset + @limit)`
  );
  return { recordset: result.recordset, page, limit };
}

export async function getProfitLoss(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'BillDt');
  const incomeResult = await req.query(
    `SELECT
       COUNT(*) AS BillCount,
       SUM(Total) AS GrossRevenue,
       SUM(Tdr+Tda) AS TotalDiscount,
       SUM(Nett) AS NetRevenue,
       SUM(ISNULL(TotLabour,0)) AS LabourRevenue,
       SUM(Nett - ISNULL(TotLabour,0)) AS PartsRevenue
     FROM Sales01 WHERE ${where}`
  );

  const expReq = pool.request();
  let expWhere = "m.VTYPE='Payments'";
  if (p.fromDate) { expReq.input('fromDate2', sql.DateTime, new Date(p.fromDate)); expWhere += ' AND m.DATE >= @fromDate2'; }
  if (p.toDate) { expReq.input('toDate2', sql.DateTime, new Date(p.toDate)); expWhere += ' AND m.DATE <= @toDate2'; }
  const expResult = await expReq.query(
    `SELECT h.DESCRIPTION AS AccountName, SUM(d.DEBT) AS TotalDebit, SUM(d.CRED) AS TotalCredit
     FROM ACMASTER m
     JOIN ACDETAILS d ON d.VSRL = m.VSRL
     LEFT JOIN ACHEAD h ON ${AC_JOIN}
     WHERE ${expWhere}
     GROUP BY h.DESCRIPTION ORDER BY TotalDebit DESC`
  );

  return {
    recordset: incomeResult.recordset,
    income: incomeResult.recordset[0] || {},
    expenses: expResult.recordset,
  };
}

export async function getProfitLossFrm(p: any) { return getProfitLoss(p); }

export async function getAcSummary(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  if (p.fromDate) { req.input('fromDate', sql.DateTime, new Date(p.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (p.toDate) { req.input('toDate', sql.DateTime, new Date(p.toDate)); where += ' AND m.DATE <= @toDate'; }
  if (p.vtype) { req.input('vtype', sql.NVarChar, p.vtype); where += ' AND m.VTYPE = @vtype'; }
  const result = await req.query(
    `SELECT h.DESCRIPTION AS AccountName, m.VTYPE,
            SUM(d.DEBT) AS TotalDebit, SUM(d.CRED) AS TotalCredit,
            SUM(d.DEBT) - SUM(d.CRED) AS NetBalance
     FROM ACMASTER m
     JOIN ACDETAILS d ON d.VSRL = m.VSRL
     LEFT JOIN ACHEAD h ON ${AC_JOIN}
     WHERE ${where}
     GROUP BY h.DESCRIPTION, m.VTYPE
     ORDER BY h.DESCRIPTION, m.VTYPE`
  );
  return { recordset: result.recordset };
}

export async function getAcSummaryBalanceSheet(p: any) {
  const pool = await getDbPool();

  const recvReq = pool.request();
  const recvResult = await recvReq.query(
    `SELECT COUNT(*) AS InvCount, SUM(Nett) AS Receivables FROM Sales01 WHERE paid=0`
  );

  const payReq = pool.request();
  const payResult = await payReq.query(
    `SELECT COUNT(*) AS InvCount, SUM(Nett) AS Payables FROM LocalPurchase01`
  );

  const stockReq = pool.request();
  const stockResult = await stockReq.query(
    `SELECT COUNT(*) AS ItemCount,
            SUM(ISNULL(s.qty,0) * ISNULL(i.Cost, i.Srate)) AS StockValue
     FROM Items i
     LEFT JOIN (SELECT Itemcode, SUM(StkIN)-SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode) s
       ON s.Itemcode = i.ItemCode
     WHERE i.Active=1`
  );

  const cashReq = pool.request();
  const cashResult = await cashReq.query(
    `SELECT TOP 20 h.DESCRIPTION AS Account, SUM(d.DEBT)-SUM(d.CRED) AS Balance
     FROM ACDETAILS d
     JOIN ACHEAD h ON ${AC_JOIN}
     WHERE h.BANK=1
     GROUP BY h.DESCRIPTION
     ORDER BY Balance DESC`
  );

  return {
    recordset: [
      {
        receivables: recvResult.recordset[0]?.Receivables || 0,
        receivableCount: recvResult.recordset[0]?.InvCount || 0,
        payables: payResult.recordset[0]?.Payables || 0,
        payableCount: payResult.recordset[0]?.InvCount || 0,
        stockValue: stockResult.recordset[0]?.StockValue || 0,
        stockItemCount: stockResult.recordset[0]?.ItemCount || 0,
      },
    ],
    bankAccounts: cashResult.recordset,
    receivables: recvResult.recordset,
    payables: payResult.recordset,
    stock: stockResult.recordset,
  };
}

export async function getAcSummaryBalanceSheetNew(p: any) { return getAcSummaryBalanceSheet(p); }

export async function getGroupBalance(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  if (p.fromDate) { req.input('fromDate', sql.DateTime, new Date(p.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (p.toDate) { req.input('toDate', sql.DateTime, new Date(p.toDate)); where += ' AND m.DATE <= @toDate'; }
  const result = await req.query(
    `SELECT h.HEAD, h.DESCRIPTION, SUM(d.DEBT) AS TotalDebit, SUM(d.CRED) AS TotalCredit,
            SUM(d.DEBT)-SUM(d.CRED) AS NetBalance
     FROM ACDETAILS d
     JOIN ACHEAD h ON ${AC_JOIN}
     JOIN ACMASTER m ON m.VSRL=d.VSRL
     WHERE ${where}
     GROUP BY h.HEAD, h.DESCRIPTION
     ORDER BY h.DESCRIPTION`
  );
  return { recordset: result.recordset };
}

export async function getGroupTotal(p: any) { return getGroupBalance(p); }

export async function getWorkInProgress(p: any) {
  const pool = await getDbPool();
  const page = p.page || 1; const limit = p.limit || 50; const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit); req.input('offset', sql.Int, offset);
  const result = await req.query(
    `SELECT * FROM (
       SELECT ROW_NUMBER() OVER (ORDER BY so.Ordt DESC) AS rn,
              so.Ordr, so.Ordt, so.CustId, so.Nett,
              so.staffid, so.CLOSED, so.StatusId,
              j.StatusID AS JobStatus, j.Remarks AS JobRemarks, j.Date AS LastUpdate
       FROM SalesOrdr01 so
       LEFT JOIN (
         SELECT Ordr, MAX(ID) AS MaxID FROM jobInProgress GROUP BY Ordr
       ) jl ON jl.Ordr=so.Ordr
       LEFT JOIN jobInProgress j ON j.ID=jl.MaxID
       WHERE so.CLOSED=0
     ) t WHERE rn > @offset AND rn <= (@offset + @limit)`
  );
  const countResult = await pool.request().query('SELECT COUNT(*) AS total FROM SalesOrdr01 WHERE CLOSED=0');
  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function getTechnicianEfficiency(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  where = addDateRange(req, where, p, 'Ordt');
  const result = await req.query(
    `SELECT staffid, COUNT(*) AS JobCount, SUM(Nett) AS TotalValue,
            SUM(CASE WHEN CLOSED=1 THEN 1 ELSE 0 END) AS ClosedJobs,
            SUM(CASE WHEN CLOSED=0 THEN 1 ELSE 0 END) AS OpenJobs
     FROM SalesOrdr01 WHERE ${where}
     GROUP BY staffid ORDER BY JobCount DESC`
  );
  return { recordset: result.recordset };
}

export async function getProductsOverview(p: any) {
  const pool = await getDbPool();
  const result = await pool.request().query(
    `SELECT TOP 50 i.ItemCode, i.Description, i.Srate, i.Cost,
            ISNULL(s.qty,0) AS StockQty,
            ISNULL(s.qty,0) * ISNULL(i.Cost,i.Srate) AS StockValue
     FROM Items i
     LEFT JOIN (SELECT Itemcode, SUM(StkIN)-SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode) s
       ON s.Itemcode=i.ItemCode
     WHERE i.Active=1 ORDER BY StockValue DESC`
  );
  return { recordset: result.recordset };
}

export async function getCustomerOverview(p: any) {
  const pool = await getDbPool();
  const result = await pool.request().query(
    `SELECT TOP 50 s.CustId, s.CustomerName,
            COUNT(*) AS BillCount, SUM(s.Nett) AS TotalPurchases,
            SUM(CASE WHEN s.paid=0 THEN s.Nett ELSE 0 END) AS Outstanding
     FROM Sales01 s
     GROUP BY s.CustId, s.CustomerName
     ORDER BY TotalPurchases DESC`
  );
  return { recordset: result.recordset };
}

export async function getVoucherDetailsList(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  if (p.fromDate) { req.input('fromDate', sql.DateTime, new Date(p.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (p.toDate) { req.input('toDate', sql.DateTime, new Date(p.toDate)); where += ' AND m.DATE <= @toDate'; }
  if (p.vtype) { req.input('vtype', sql.NVarChar, p.vtype); where += ' AND m.VTYPE=@vtype'; }
  const result = await req.query(
    `SELECT TOP 200 m.VSRL, m.DATE, m.VTYPE, m.NARRATION, m.REFNO,
            d.AC, h.DESCRIPTION AS AccountName, d.DEBT, d.CRED, d.Lnarration
     FROM ACMASTER m
     JOIN ACDETAILS d ON d.VSRL=m.VSRL
     LEFT JOIN ACHEAD h ON h.ID=d.AC
     WHERE ${where}
     ORDER BY m.DATE DESC, m.VSRL`
  );
  return { recordset: result.recordset };
}

export async function getJournalVoucherReport(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = "m.VTYPE='Journals'";
  if (p.fromDate) { req.input('fromDate', sql.DateTime, new Date(p.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (p.toDate) { req.input('toDate', sql.DateTime, new Date(p.toDate)); where += ' AND m.DATE <= @toDate'; }
  const result = await req.query(
    `SELECT m.VSRL, m.DATE, m.NARRATION, m.REFNO,
            d.AC, h.DESCRIPTION AS AccountName, d.DEBT, d.CRED, d.Lnarration
     FROM ACMASTER m
     JOIN ACDETAILS d ON d.VSRL=m.VSRL
     LEFT JOIN ACHEAD h ON h.ID=d.AC
     WHERE ${where}
     ORDER BY m.DATE DESC`
  );
  return { recordset: result.recordset };
}

export async function getCustomerBillsDetailed(p: any) {
  const pool = await getDbPool();
  const page = p.page || 1; const limit = p.limit || 50; const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit); req.input('offset', sql.Int, offset);
  let where = '1=1';
  if (p.custId) { req.input('custId', sql.NVarChar, String(p.custId)); where += ' AND CustId=@custId'; }
  if (p.fromDate) { req.input('fromDate', sql.DateTime, new Date(p.fromDate)); where += ' AND BillDt >= @fromDate'; }
  if (p.toDate) { req.input('toDate', sql.DateTime, new Date(p.toDate)); where += ' AND BillDt <= @toDate'; }
  if (p.paid !== undefined) { req.input('paid', sql.Int, Number(p.paid)); where += ' AND paid=@paid'; }
  const result = await req.query(
    `SELECT * FROM (
       SELECT ROW_NUMBER() OVER (ORDER BY BillDt DESC) AS rn,
              ID, Bill, BillDt, CustId, CustomerName, Sman,
              Total, Nett, paid, VSRL
       FROM Sales01 WHERE ${where}
     ) t WHERE rn > @offset AND rn <= (@offset + @limit)`
  );
  return { recordset: result.recordset, page, limit };
}

export async function getCustomerBillsPending(p: any) {
  return getCustomerBillsDetailed({ ...p, paid: 0 });
}

export async function getCustomerBillsSummary(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  if (p.custId) { req.input('custId', sql.NVarChar, String(p.custId)); where += ' AND CustId=@custId'; }
  const result = await req.query(
    `SELECT CustId, CustomerName, COUNT(*) AS BillCount,
            SUM(Total) AS TotalAmount, SUM(Nett) AS TotalNett,
            SUM(CASE WHEN paid=0 THEN Nett ELSE 0 END) AS Outstanding
     FROM Sales01 WHERE ${where}
     GROUP BY CustId, CustomerName ORDER BY TotalAmount DESC`
  );
  return { recordset: result.recordset };
}

export async function getStockValuationReport(p: any) {
  const pool = await getDbPool();
  const page = p.page || 1; const limit = p.limit || 100; const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit); req.input('offset', sql.Int, offset);
  const result = await req.query(
    `SELECT * FROM (
       SELECT ROW_NUMBER() OVER (ORDER BY i.Description) AS rn,
              i.ItemCode, i.Description, i.Denom, i.Srate, i.Cost,
              ISNULL(s.qty,0) AS StockQty,
              ISNULL(s.qty,0) * ISNULL(i.Cost,i.Srate) AS StockValue
       FROM Items i
       LEFT JOIN (SELECT Itemcode, SUM(StkIN)-SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode) s
         ON s.Itemcode=i.ItemCode
       WHERE i.Active=1
     ) t WHERE rn > @offset AND rn <= (@offset + @limit)`
  );
  return { recordset: result.recordset, page, limit };
}

export async function getStockValuationSummary(p: any) {
  const pool = await getDbPool();
  const result = await pool.request().query(
    `SELECT COUNT(*) AS ItemCount,
            SUM(ISNULL(s.qty,0)) AS TotalQty,
            SUM(ISNULL(s.qty,0)*ISNULL(i.Cost,i.Srate)) AS TotalValue
     FROM Items i
     LEFT JOIN (SELECT Itemcode, SUM(StkIN)-SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode) s
       ON s.Itemcode=i.ItemCode
     WHERE i.Active=1`
  );
  return { recordset: result.recordset };
}

export async function getStockAgingReport(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  const refDate = p.asOfDate ? new Date(p.asOfDate) : new Date();
  req.input('refDate', sql.DateTime, refDate);
  const result = await req.query(
    `SELECT t.Itemcode, i.Description,
            SUM(CASE WHEN DATEDIFF(day, t.Date, @refDate) <= 30 THEN t.StkIN-t.StkOut ELSE 0 END) AS [0_30],
            SUM(CASE WHEN DATEDIFF(day, t.Date, @refDate) BETWEEN 31 AND 60 THEN t.StkIN-t.StkOut ELSE 0 END) AS [31_60],
            SUM(CASE WHEN DATEDIFF(day, t.Date, @refDate) BETWEEN 61 AND 90 THEN t.StkIN-t.StkOut ELSE 0 END) AS [61_90],
            SUM(CASE WHEN DATEDIFF(day, t.Date, @refDate) > 90 THEN t.StkIN-t.StkOut ELSE 0 END) AS [Over90],
            SUM(t.StkIN-t.StkOut) AS NetQty
     FROM StockTransaction t
     LEFT JOIN Items i ON i.ItemCode=t.Itemcode
     GROUP BY t.Itemcode, i.Description
     HAVING SUM(t.StkIN-t.StkOut) > 0
     ORDER BY NetQty DESC`
  );
  return { recordset: result.recordset };
}

export async function getStockLedger(p: any) {
  const pool = await getDbPool();
  const page = p.page || 1; const limit = p.limit || 50; const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit); req.input('offset', sql.Int, offset);
  let where = '1=1';
  if (p.itemCode) { req.input('itemCode', sql.NVarChar, p.itemCode); where += ' AND t.Itemcode=@itemCode'; }
  if (p.fromDate) { req.input('fromDate', sql.DateTime, new Date(p.fromDate)); where += ' AND t.Date >= @fromDate'; }
  if (p.toDate) { req.input('toDate', sql.DateTime, new Date(p.toDate)); where += ' AND t.Date <= @toDate'; }
  const result = await req.query(
    `SELECT * FROM (
       SELECT ROW_NUMBER() OVER (ORDER BY t.Date DESC) AS rn,
              t.ID, t.Date, t.Itemcode, i.Description AS ItemName,
              t.StkIN, t.StkOut, t.Rate, t.Amount, t.TRType, t.RefNo, t.Remarks
       FROM StockTransaction t
       LEFT JOIN Items i ON i.ItemCode=t.Itemcode
       WHERE ${where}
     ) t WHERE rn > @offset AND rn <= (@offset + @limit)`
  );
  return { recordset: result.recordset, page, limit };
}

export async function getOpeningStockList(p: any) { return getStockValuationReport(p); }

export async function getUsedCars(p: any) {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(
      'SELECT TOP 50 v.VehID, v.VehNo, v.VehMake, v.VehModel, v.VehYear, v.Color,' +
      '       v.ChassisNo, v.EngineNo, v.CustId, c.CustName' +
      ' FROM CustomerVehicle v LEFT JOIN Customer c ON c.CustId=v.CustId' +
      ' ORDER BY v.VehID DESC'
    );
    return { recordset: result.recordset };
  } catch { return { recordset: [] }; }
}

export async function getEmployeeAttendance(p: any) {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(
      'SELECT TOP 100 Ocode, Oname, Designation, Department, JoinDate, Active' +
      ' FROM Omasters ORDER BY Ocode'
    );
    return { recordset: result.recordset };
  } catch { return { recordset: [] }; }
}

export async function getVehicleAttendance(p: any) {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(
      'SELECT TOP 100 v.VehID, v.VehNo, v.VehMake, v.VehModel, c.CustName' +
      ' FROM CustomerVehicle v LEFT JOIN Customer c ON c.CustId=v.CustId' +
      ' ORDER BY v.VehID DESC'
    );
    return { recordset: result.recordset };
  } catch { return { recordset: [] }; }
}

export async function getSalaryRegister(p: any) {
  return { recordset: [], message: 'Payroll module not configured. No salary data available in this system.' };
}

export async function getSalarySlip(p: any) {
  return { recordset: [], message: 'Payroll module not configured. No salary slip data available.' };
}

export async function getDiagnosticReport1(p: any) { return getAcSummary(p); }
export async function getDiagnosticReport222(p: any) { return getSalesAnalysis(p); }

export async function getOMastersReport(p: any) {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT TOP 100 * FROM Omasters ORDER BY ID');
    return { recordset: result.recordset };
  } catch { return { recordset: [] }; }
}

export async function getPurchaseReturnRegister(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = "CorQ='Debit'";
  if (p.fromDate) { req.input('fromDate', sql.DateTime, new Date(p.fromDate)); where += ' AND InvDt >= @fromDate'; }
  if (p.toDate) { req.input('toDate', sql.DateTime, new Date(p.toDate)); where += ' AND InvDt <= @toDate'; }
  const result = await req.query(
    `SELECT TOP 100 lp.ID, lp.Invoice, lp.InvDt, lp.SuppId,
            s.SuppName, lp.Nett, lp.Remarks
     FROM LocalPurchase01 lp
     LEFT JOIN Supplier s ON s.SuppId=lp.SuppId
     WHERE ${where}
     ORDER BY lp.InvDt DESC`
  );
  return { recordset: result.recordset };
}

export async function getCompanyReportHeader(p: any) {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT TOP 1 * FROM Company');
    return { recordset: result.recordset };
  } catch { return { recordset: [] }; }
}

export async function updateCompanyReportHeader(p: any) {
  try {
    const pool = await getDbPool(); const req = pool.request();
    if (p.CompanyName) req.input('name', sql.NVarChar, p.CompanyName);
    await req.query('UPDATE Company SET CompanyName=@name WHERE ID=1');
    return { success: true };
  } catch { return { success: false }; }
}

export async function writeReportAuditLog(_p: any): Promise<void> {}
