import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

// Real table: Items (ID, ItemCode, Description, Details, Denom, Tag, Prate, Prate1, Srate, Srate1,
//   CatID, Type, Comp, Ac, Nofp, Active, ReOrder, SlowMove, Ccode, Location, Cost, Stock, GDID)
// SQL Server 2008 — ROW_NUMBER() pagination only

export async function getItemList(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const search = params.search || '';

  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  let where = '(ItemCode LIKE @search OR Description LIKE @search OR Tag LIKE @search)';
  if (params.active !== undefined && params.active !== '') {
    req.input('active', sql.Int, params.active === 'true' || params.active === '1' ? 1 : 0);
    where += ' AND Active = @active';
  }
  if (params.catId) { req.input('catId', sql.NVarChar, params.catId); where += ' AND CatID = @catId'; }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY Description) AS rn,' +
    '         ID, ItemCode, Description, Details, Denom, Tag, tag1, tag2, tag3, tag4,' +
    '         Prate, Prate1, Srate, Srate1, CatID, Type, Comp, Ac, Nofp,' +
    '         Active, ReOrder, SlowMove, Ccode, Location, Cost, Stock, CompStk, GDID' +
    '  FROM Items' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('search', sql.NVarChar, '%' + search + '%');
  if (params.active !== undefined && params.active !== '') countReq.input('active', sql.Int, params.active === 'true' || params.active === '1' ? 1 : 0);
  if (params.catId) countReq.input('catId', sql.NVarChar, params.catId);
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM Items WHERE ' + where
  );

  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function getItemsHelp(params: Record<string, any>) { return getItemList(params); }

export async function bulkImportItems(file: any) {
  return callProcedure('BulkImportItems', { data: JSON.stringify(file) });
}

export async function bulkExportItems(params: Record<string, any>) {
  return getItemList({ ...params, limit: 10000 });
}

export async function createItem(data: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('ItemCode', sql.NVarChar, data.ItemCode || '');
  req.input('Description', sql.NVarChar, data.Description || '');
  req.input('Details', sql.NVarChar, data.Details || '');
  req.input('Denom', sql.NVarChar, data.Denom || 'PCS');
  req.input('Tag', sql.NVarChar, data.Tag || '');
  req.input('Prate', sql.Float, data.Prate || 0);
  req.input('Srate', sql.Float, data.Srate || 0);
  req.input('CatID', sql.NVarChar, data.CatID || '');
  req.input('Type', sql.NVarChar, data.Type || '');
  req.input('Active', sql.Int, data.Active !== undefined ? data.Active : 1);
  req.input('Ccode', sql.NVarChar, data.Ccode || '');
  req.input('Location', sql.NVarChar, data.Location || '');
  req.input('ReOrder', sql.Float, data.ReOrder || 0);
  req.input('Cost', sql.Float, data.Cost || 0);
  req.input('Stock', sql.Float, data.Stock || 0);
  await req.query(
    'INSERT INTO Items (ItemCode, Description, Details, Denom, Tag, Prate, Srate,' +
    ' CatID, Type, Active, Ccode, Location, ReOrder, Cost, Stock)' +
    ' VALUES (@ItemCode, @Description, @Details, @Denom, @Tag, @Prate, @Srate,' +
    ' @CatID, @Type, @Active, @Ccode, @Location, @ReOrder, @Cost, @Stock)'
  );
  return { success: true };
}

export async function updateItem(itemCode: string, data: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('ItemCode', sql.NVarChar, itemCode);
  req.input('Description', sql.NVarChar, data.Description || '');
  req.input('Details', sql.NVarChar, data.Details || '');
  req.input('Denom', sql.NVarChar, data.Denom || 'PCS');
  req.input('Tag', sql.NVarChar, data.Tag || '');
  req.input('Prate', sql.Float, data.Prate || 0);
  req.input('Srate', sql.Float, data.Srate || 0);
  req.input('CatID', sql.NVarChar, data.CatID || '');
  req.input('Active', sql.Int, data.Active !== undefined ? data.Active : 1);
  req.input('ReOrder', sql.Float, data.ReOrder || 0);
  req.input('Cost', sql.Float, data.Cost || 0);
  await req.query(
    'UPDATE Items SET Description=@Description, Details=@Details, Denom=@Denom,' +
    ' Tag=@Tag, Prate=@Prate, Srate=@Srate, CatID=@CatID,' +
    ' Active=@Active, ReOrder=@ReOrder, Cost=@Cost' +
    ' WHERE ItemCode=@ItemCode'
  );
  return { success: true };
}

export async function deleteItem(itemCode: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('ItemCode', sql.NVarChar, itemCode);
  await req.query('UPDATE Items SET Active=0 WHERE ItemCode=@ItemCode');
  return { success: true };
}

export async function getItemAuditLogs(_itemCode: string, _params: Record<string, any>) {
  return { recordset: [] };
}

export async function linkItemToInventory(_itemCode: string, _inventoryId: string) {
  return { success: true };
}

export async function getItemDOList(itemCode: string, params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('itemCode', sql.NVarChar, itemCode);
  const result = await req.query(
    'SELECT t.ID, t.Date, t.Itemcode, t.GDID, t.StkIN, t.StkOut, t.Rate,' +
    '       t.Amount, t.TRType, t.TrID, t.RefNo, t.Remarks' +
    ' FROM StockTransaction t' +
    ' WHERE t.Itemcode = @itemCode ORDER BY t.Date DESC'
  );
  return { recordset: result.recordset };
}

export async function getItemDOSummary(itemCode: string, _params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('itemCode', sql.NVarChar, itemCode);
  const result = await req.query(
    'SELECT Itemcode, SUM(StkIN) AS totalIn, SUM(StkOut) AS totalOut,' +
    '       SUM(StkIN) - SUM(StkOut) AS currentStock' +
    ' FROM StockTransaction WHERE Itemcode = @itemCode GROUP BY Itemcode'
  );
  return { recordset: result.recordset };
}

export async function getItemPendingDOList(_itemCode: string, _params: Record<string, any>) {
  return { recordset: [] };
}

export async function getItemPurchaseListImport(params: Record<string, any>) {
  try { return await callProcedure('ItemPurchaseListImport', params); } catch { return { recordset: [] }; }
}

export async function getItemPurchaseListLocal(params: Record<string, any>) {
  try { return await callProcedure('ItemPurchaseListLocal', params); } catch { return { recordset: [] }; }
}

export async function getItemPurchaseReturnList(params: Record<string, any>) {
  try { return await callProcedure('ItemPurchaseReturnList', params); } catch { return { recordset: [] }; }
}

export async function getItemPurchaseReturnSumm(params: Record<string, any>) {
  try { return await callProcedure('ItemPurchaseReturnSumm', params); } catch { return { recordset: [] }; }
}

export async function getItemPurchaseSummImport(params: Record<string, any>) {
  try { return await callProcedure('ItemPurchaseSummImport', params); } catch { return { recordset: [] }; }
}

export async function getItemPurchaseSummLocal(params: Record<string, any>) {
  try { return await callProcedure('ItemPurchaseSummLocal', params); } catch { return { recordset: [] }; }
}

export async function getItemCategories() {
  const pool = await getDbPool();
  const result = await pool.request().query(
    "SELECT DISTINCT CatID FROM Items WHERE CatID IS NOT NULL AND CatID <> '' ORDER BY CatID"
  );
  return { recordset: result.recordset };
}

export async function writeItemAuditLog(_entry: any): Promise<void> {}
