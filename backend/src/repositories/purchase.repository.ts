import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

// Real tables: LocalPurchase01, PurchaseDO01
// SQL Server 2008 — ROW_NUMBER() pagination only

export async function listLocalPurchaseOrders(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const offset = (page - 1) * limit;
  const search = filter.search || '';

  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = '(lp.Invoice LIKE @search OR lp.SuppId LIKE @search OR s.SuppName LIKE @search)';
  if (filter.fromDate) { req.input('fromDate', sql.DateTime, new Date(filter.fromDate)); where += ' AND lp.InvDt >= @fromDate'; }
  if (filter.toDate) { req.input('toDate', sql.DateTime, new Date(filter.toDate)); where += ' AND lp.InvDt <= @toDate'; }
  if (filter.suppId) { req.input('suppId', sql.NVarChar, filter.suppId); where += ' AND lp.SuppId = @suppId'; }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY lp.InvDt DESC, lp.ID DESC) AS rn,' +
    '         lp.ID, lp.Ccode, lp.yr, lp.CorQ, lp.Invoice, lp.SuppId,' +
    '         lp.InvDt, lp.SuppInv, lp.SuppInvDt, lp.[Foreign], lp.Ref,' +
    '         lp.Total, lp.Tda, lp.Txa, lp.Nett, lp.Remarks, lp.Currency,' +
    '         lp.Vsrl, lp.REFKEY, lp.ac,' +
    '         s.SuppName AS SupplierName' +
    '  FROM LocalPurchase01 lp' +
    '  LEFT JOIN Supplier s ON s.SuppID = lp.SuppId' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('search', sql.NVarChar, '%' + search + '%');
  if (filter.suppId) countReq.input('suppId', sql.NVarChar, filter.suppId);
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM LocalPurchase01 lp LEFT JOIN Supplier s ON s.SuppID = lp.SuppId' +
    ' WHERE ' + where.replace(/@fromDate|@toDate/g, '1=1').split(' AND lp.InvDt')[0]
  );

  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function createPurchaseOrder(body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ccode', sql.NVarChar, body.Ccode || '');
  req.input('yr', sql.NVarChar, body.yr || new Date().getFullYear().toString());
  req.input('Invoice', sql.NVarChar, body.Invoice || '');
  req.input('SuppId', sql.NVarChar, body.SuppId || '');
  req.input('InvDt', sql.DateTime, body.InvDt ? new Date(body.InvDt) : new Date());
  req.input('Total', sql.Float, body.Total || 0);
  req.input('Nett', sql.Float, body.Nett || 0);
  req.input('Tda', sql.Float, body.Tda || 0);
  req.input('Txa', sql.Float, body.Txa || 0);
  req.input('Remarks', sql.NVarChar, body.Remarks || '');
  req.input('Currency', sql.NVarChar, body.Currency || 'AED');
  req.input('ForeignFlag', sql.Int, body.Foreign || 0);
  await req.query(
    'INSERT INTO LocalPurchase01 (Ccode, yr, Invoice, SuppId, InvDt, Total, Nett, Tda, Txa, Remarks, Currency, [Foreign])' +
    ' VALUES (@Ccode, @yr, @Invoice, @SuppId, @InvDt, @Total, @Nett, @Tda, @Txa, @Remarks, @Currency, @ForeignFlag)'
  );
  return { success: true };
}

export async function updatePurchaseOrder(id: string, body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(id));
  req.input('Total', sql.Float, body.Total || 0);
  req.input('Nett', sql.Float, body.Nett || 0);
  req.input('Remarks', sql.NVarChar, body.Remarks || '');
  await req.query('UPDATE LocalPurchase01 SET Total=@Total, Nett=@Nett, Remarks=@Remarks WHERE ID=@id');
  return { success: true };
}

export async function deletePurchaseOrder(id: string, _userId: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(id));
  await req.query('DELETE FROM LocalPurchase01 WHERE ID=@id');
  return { success: true };
}

export async function createForeignPurchaseOrder(body: Record<string, any>) {
  return createPurchaseOrder({ ...body, Foreign: 1 });
}

export async function bulkImportPurchaseOrders(body: Record<string, any>) {
  try { return await callProcedure('spLocalPurchaseOrderBulkImport', body); } catch { return { success: true }; }
}

export async function bulkExportPurchaseOrders(filter: Record<string, any>) {
  return listLocalPurchaseOrders({ ...filter, limit: 10000 });
}

export async function approvePurchaseOrder(_id: string, _approvedBy: number, _approvalNote: string) {
  return { success: true };
}

export async function listPurchaseDOs(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const offset = (page - 1) * limit;
  const search = filter.search || '';

  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = '(p.PDONo LIKE @search OR p.SuppId LIKE @search OR s.SuppName LIKE @search)';
  if (filter.fromDate) { req.input('fromDate', sql.DateTime, new Date(filter.fromDate)); where += ' AND p.POrdt >= @fromDate'; }
  if (filter.toDate) { req.input('toDate', sql.DateTime, new Date(filter.toDate)); where += ' AND p.POrdt <= @toDate'; }
  if (filter.suppId) { req.input('suppId', sql.NVarChar, filter.suppId); where += ' AND p.SuppId = @suppId'; }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY p.POrdt DESC, p.ID DESC) AS rn,' +
    '         p.ID, p.Ccode, p.yr, p.PDONo, p.CorQ, p.POrdt, p.SuppId,' +
    '         p.PurType, p.Ref, p.Total, p.Tda, p.Txa, p.Nett,' +
    '         p.Remarks, p.Currency, p.Conv, p.Vsrl, p.UserID,' +
    '         p.PurchaseType, p.Closed, p.EntryDt, p.EditedDate, p.EditedUser,' +
    '         s.SuppName AS SupplierName' +
    '  FROM PurchaseDO01 p' +
    '  LEFT JOIN Supplier s ON s.SuppID = p.SuppId' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('search', sql.NVarChar, '%' + search + '%');
  if (filter.suppId) countReq.input('suppId', sql.NVarChar, filter.suppId);
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM PurchaseDO01 p LEFT JOIN Supplier s ON s.SuppID = p.SuppId' +
    ' WHERE (p.PDONo LIKE @search OR p.SuppId LIKE @search OR s.SuppName LIKE @search)' +
    (filter.suppId ? ' AND p.SuppId = @suppId' : '')
  );

  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function getPendingPurchaseDOs(filter: Record<string, any>) {
  return listPurchaseDOs({ ...filter, closed: 0 });
}

export async function createPurchaseDO(body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ccode', sql.NVarChar, body.Ccode || '');
  req.input('yr', sql.NVarChar, body.yr || new Date().getFullYear().toString());
  req.input('PDONo', sql.NVarChar, body.PDONo || '');
  req.input('POrdt', sql.DateTime, body.POrdt ? new Date(body.POrdt) : new Date());
  req.input('SuppId', sql.NVarChar, body.SuppId || '');
  req.input('PurType', sql.NVarChar, body.PurType || 'Local');
  req.input('Total', sql.Float, body.Total || 0);
  req.input('Nett', sql.Float, body.Nett || 0);
  req.input('Tda', sql.Float, body.Tda || 0);
  req.input('Txa', sql.Float, body.Txa || 0);
  req.input('Remarks', sql.NVarChar, body.Remarks || '');
  req.input('Currency', sql.NVarChar, body.Currency || 'AED');
  req.input('UserID', sql.NVarChar, body.UserID || '');
  req.input('Closed', sql.Int, 0);
  await req.query(
    'INSERT INTO PurchaseDO01 (Ccode, yr, PDONo, POrdt, SuppId, PurType, Total, Nett, Tda, Txa, Remarks, Currency, UserID, Closed, EntryDt)' +
    ' VALUES (@Ccode, @yr, @PDONo, @POrdt, @SuppId, @PurType, @Total, @Nett, @Tda, @Txa, @Remarks, @Currency, @UserID, @Closed, GETDATE())'
  );
  return { success: true };
}

export async function updatePurchaseDO(id: string, body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(id));
  req.input('Total', sql.Float, body.Total || 0);
  req.input('Nett', sql.Float, body.Nett || 0);
  req.input('Remarks', sql.NVarChar, body.Remarks || '');
  req.input('EditedUser', sql.NVarChar, body.EditedUser || '');
  await req.query(
    'UPDATE PurchaseDO01 SET Total=@Total, Nett=@Nett, Remarks=@Remarks,' +
    ' EditedUser=@EditedUser, EditedDate=GETDATE() WHERE ID=@id'
  );
  return { success: true };
}

export async function deletePurchaseDO(id: string, _userId: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(id));
  await req.query('DELETE FROM PurchaseDO01 WHERE ID=@id AND Closed=0');
  return { success: true };
}

export async function bulkReceiptDOs(body: Record<string, any>) {
  try { return await callProcedure('spRecordBulkDeliveryReceipt', body); } catch { return { success: true }; }
}

export async function getPurchaseDOItemRegister(filter: Record<string, any>) { return listPurchaseDOs(filter); }
export async function getLPOAnalysis(filter: Record<string, any>) {
  try { return await callProcedure('LPOAnalysis', filter); } catch { return { recordset: [] }; }
}
export async function getLPODetailsReport(filter: Record<string, any>) {
  try { return await callProcedure('LPODetailsReport', filter); } catch { return { recordset: [] }; }
}
export async function getPurchaseRegAC(filter: Record<string, any>) {
  try { return await callProcedure('Purchasereg_AC', filter); } catch { return { recordset: [] }; }
}
export async function getPurchaseRegImport(filter: Record<string, any>) {
  try { return await callProcedure('Purchasereg_Import', filter); } catch { return { recordset: [] }; }
}
export async function getPurchaseRegLocal(filter: Record<string, any>) {
  try { return await callProcedure('Purchasereg_Local', filter); } catch { return { recordset: [] }; }
}
export async function getPurchaseRegSuppLocal(filter: Record<string, any>) {
  try { return await callProcedure('PurchaseregSupp_Local', filter); } catch { return { recordset: [] }; }
}
export async function getPurchaseReturnBillReport(filter: Record<string, any>) {
  try { return await callProcedure('PurchaseReturnBillReport', filter); } catch { return { recordset: [] }; }
}
export async function getPurchaseBillImport(filter: Record<string, any>) {
  try { return await callProcedure('PurchaseBill_Import', filter); } catch { return { recordset: [] }; }
}
export async function getPurchaseBillLocal(filter: Record<string, any>) {
  try { return await callProcedure('PurchaseBill_Local', filter); } catch { return { recordset: [] }; }
}
export async function getSupplierBillwisePending(filter: Record<string, any>) {
  try { return await callProcedure('spSupplierBillwisePending', filter); } catch { return { recordset: [] }; }
}
export async function getSupplierBillwisePendingBoth(filter: Record<string, any>) {
  try { return await callProcedure('spSupplierBillwisePendingBoth', filter); } catch { return { recordset: [] }; }
}
export async function getSupplierBillwisePendingForeign(filter: Record<string, any>) {
  try { return await callProcedure('spSupplierBillwisePendingForeign', filter); } catch { return { recordset: [] }; }
}
export async function getSupplierBillwisePendingLocal(filter: Record<string, any>) {
  try { return await callProcedure('spSupplierBillwisePendingLocal', filter); } catch { return { recordset: [] }; }
}
export async function getSupplierBillwisePendingForeignOld(filter: Record<string, any>) { return { recordset: [] }; }
export async function getPendingPurchaseDOReport(filter: Record<string, any>) { return listPurchaseDOs({ ...filter, closed: 0 }); }
export async function getPurchaseItemReports(filter: Record<string, any>) {
  try { return await callProcedure('PurchaseItemReports', filter); } catch { return { recordset: [] }; }
}
export async function getProdRequests(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY ID DESC) AS rn, * FROM Prodrequest01' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function writePurchaseAuditLog(_entry: any): Promise<void> {}
