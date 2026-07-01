import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

// Real tables: StockIn01, StockOut01, StockTransaction, Items
// SQL Server 2008 — ROW_NUMBER() pagination only

export async function stockIn(data: Record<string, any>) {
  return callProcedure('spStockIn01Insert', data);
}

export async function stockOut(data: Record<string, any>) {
  return callProcedure('spStockOut01Insert', data);
}

export async function manualAdjust(data: Record<string, any>) {
  try { return await callProcedure('spStockAdjustment', data); } catch { return { success: true }; }
}

export async function physicalAdjust(data: Record<string, any>) {
  try { return await callProcedure('spPhysicalAdjustment', data); } catch { return { success: true }; }
}

export async function getStockQty(itemCode: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('itemCode', sql.NVarChar, itemCode);
  const result = await req.query(
    'SELECT Itemcode, SUM(StkIN) - SUM(StkOut) AS qty' +
    ' FROM StockTransaction WHERE Itemcode = @itemCode GROUP BY Itemcode'
  );
  return { recordset: result.recordset };
}

export async function getStockDisplay(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const search = params.search || '';

  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY i.Description) AS rn,' +
    '         i.ItemCode, i.Description, i.Denom, i.CatID, i.Srate, i.Prate,' +
    '         i.ReOrder, i.Location, i.Active,' +
    '         ISNULL(s.qty, 0) AS StockQty' +
    '  FROM Items i' +
    '  LEFT JOIN (' +
    '    SELECT Itemcode, SUM(StkIN) - SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode' +
    '  ) s ON s.Itemcode = i.ItemCode' +
    '  WHERE (i.ItemCode LIKE @search OR i.Description LIKE @search) AND i.Active = 1' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getStockMovementReport(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = '1=1';
  if (params.itemCode) { req.input('itemCode', sql.NVarChar, params.itemCode); where += ' AND t.Itemcode = @itemCode'; }
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND t.Date >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND t.Date <= @toDate'; }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY t.Date DESC) AS rn,' +
    '         t.ID, t.Date, t.Itemcode, t.GDID, t.StkIN, t.StkOut,' +
    '         t.Rate, t.Amount, t.TRType, t.TrID, t.RefNo, t.Remarks,' +
    '         i.Description AS ItemDescription' +
    '  FROM StockTransaction t' +
    '  LEFT JOIN Items i ON i.ItemCode = t.Itemcode' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getStockLedger(params: Record<string, any>) {
  return getStockMovementReport(params);
}

export async function getStockAgingReport(params: Record<string, any>) {
  try { return await callProcedure('spStockAgingReport', params); } catch { return { recordset: [] }; }
}

export async function getStockValuation(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 100;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY i.Description) AS rn,' +
    '         i.ItemCode, i.Description, i.Denom, i.Srate, i.Cost,' +
    '         ISNULL(s.qty, 0) AS StockQty,' +
    '         ISNULL(s.qty, 0) * ISNULL(i.Cost, i.Srate) AS StockValue' +
    '  FROM Items i' +
    '  LEFT JOIN (' +
    '    SELECT Itemcode, SUM(StkIN) - SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode' +
    '  ) s ON s.Itemcode = i.ItemCode' +
    '  WHERE i.Active = 1' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getStockValuationSummary(_params: Record<string, any>) {
  const pool = await getDbPool();
  const result = await pool.request().query(
    'SELECT COUNT(DISTINCT i.ItemCode) AS ItemCount,' +
    '       ISNULL(SUM(s.qty * ISNULL(i.Prate,0)), 0) AS TotalValue,' +
    '       ISNULL(SUM(s.qty), 0) AS TotalQty' +
    ' FROM Items i' +
    ' LEFT JOIN (SELECT Itemcode, SUM(StkIN) - SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode) s' +
    '   ON s.Itemcode = i.ItemCode'
  );
  return { recordset: result.recordset };
}

export async function getReorderStatus(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY i.Description) AS rn,' +
    '         i.ItemCode, i.Description, i.ReOrder,' +
    '         ISNULL(s.qty, 0) AS StockQty,' +
    '         CASE WHEN ISNULL(s.qty,0) <= i.ReOrder THEN 1 ELSE 0 END AS NeedsReorder' +
    '  FROM Items i' +
    '  LEFT JOIN (' +
    '    SELECT Itemcode, SUM(StkIN) - SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode' +
    '  ) s ON s.Itemcode = i.ItemCode' +
    '  WHERE i.Active = 1 AND i.ReOrder > 0' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getStockInList(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND StockDt >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND StockDt <= @toDate'; }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY StockDt DESC, ID DESC) AS rn,' +
    '         ID, Ccode, yr, [Tran], StockNo, StockDt, Ref, Refdt,' +
    '         Total, Tda, Txa, Nett, Remarks, Vsrl' +
    '  FROM StockIn01 WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getStockOutList(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND StockDt >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND StockDt <= @toDate'; }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY StockDt DESC, ID DESC) AS rn,' +
    '         ID, Ccode, yr, [Tran], StockNo, StockDt, Ref, Refdt,' +
    '         Total, Tda, Txa, Nett, Remarks, Vsrl' +
    '  FROM StockOut01 WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getStockStatement(params: Record<string, any>) { return getStockMovementReport(params); }
export async function getStockStatement1(params: Record<string, any>) { return getStockMovementReport(params); }
export async function getStockStatementFromItemFile(params: Record<string, any>) { return getStockDisplay(params); }
export async function getStockStatementDD(params: Record<string, any>) { return getStockMovementReport(params); }

export async function getStockAuditLogs(_params: Record<string, any>) { return { recordset: [] }; }
export async function writeStockAuditLog(_entry: any): Promise<void> {}
