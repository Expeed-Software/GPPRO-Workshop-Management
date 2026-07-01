import { getDbPool } from '../db/connection';
import sql from 'mssql';

// Real table: SalesOrdr01
// SQL Server 2008 — ROW_NUMBER() pagination only

async function querySalesOrders(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const offset = (page - 1) * limit;
  const search = filter.search || '';

  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  let where = '(o.Ordr LIKE @search OR c.custname LIKE @search OR o.CustId LIKE @search)';
  if (filter.status === 'open') where += ' AND o.CLOSED = 0';
  else if (filter.status === 'closed') where += ' AND o.CLOSED = 1';
  if (filter.fromDate) { req.input('fromDate', sql.DateTime, new Date(filter.fromDate)); where += ' AND o.Ordt >= @fromDate'; }
  if (filter.toDate) { req.input('toDate', sql.DateTime, new Date(filter.toDate)); where += ' AND o.Ordt <= @toDate'; }
  if (filter.custId) { req.input('custId', sql.NVarChar, filter.custId); where += ' AND o.CustId = @custId'; }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY o.Ordt DESC, o.ID DESC) AS rn,' +
    '         o.ID, o.Ccode, o.yr, o.Ordr, o.Ordt, o.CustId, o.Lpo, o.LpoDt,' +
    '         o.Total, o.Txa, o.ServiceCharge, o.Tda, o.Nett, o.[User],' +
    '         o.VehId, o.km, o.CustNote, o.TechNote, o.CLOSED, o.staffid,' +
    '         o.Otype, o.InsurID, o.ClaimNumber, o.ExcessAmt, o.Estimation,' +
    '         o.CompletionDate, o.delivered, o.DeliveryDt, o.StatusId,' +
    '         o.CreatedBy, o.CretedDt, o.EditedBy, o.EditedDt,' +
    '         c.custname AS CustomerName, c.Phone1 AS CustomerPhone,' +
    '         s.Description AS StatusDescription, s.ForeColour, s.BackColour' +
    '  FROM SalesOrdr01 o' +
    '  LEFT JOIN Customer c ON c.CustId = o.CustId' +
    '  LEFT JOIN salesOrdrStatusHead s ON s.StatusID = o.StatusId' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('search', sql.NVarChar, '%' + search + '%');
  if (filter.custId) countReq.input('custId', sql.NVarChar, filter.custId);
  let countWhere = '(o.Ordr LIKE @search OR c.custname LIKE @search OR o.CustId LIKE @search)';
  if (filter.status === 'open') countWhere += ' AND o.CLOSED = 0';
  else if (filter.status === 'closed') countWhere += ' AND o.CLOSED = 1';
  if (filter.custId) countWhere += ' AND o.CustId = @custId';
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM SalesOrdr01 o LEFT JOIN Customer c ON c.CustId = o.CustId WHERE ' + countWhere
  );

  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function getSalesOrders(filter: Record<string, any>) { return querySalesOrders(filter); }

export async function getSalesOrderById(id: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('ordr', sql.NVarChar, id);
  const result = await req.query(
    'SELECT o.ID, o.Ccode, o.yr, o.Ordr, o.Ordt, o.CustId, o.Lpo, o.LpoDt,' +
    '       o.Total, o.Txa, o.ServiceCharge, o.Tda, o.Nett, o.User,' +
    '       o.VehId, o.km, o.CustNote, o.TechNote, o.CLOSED, o.staffid,' +
    '       o.Otype, o.InsurID, o.ClaimNumber, o.ExcessAmt, o.Estimation,' +
    '       o.CompletionDate, o.delivered, o.DeliveryDt, o.StatusId,' +
    '       o.CreatedBy, o.CretedDt, o.EditedBy, o.EditedDt,' +
    '       c.custname AS CustomerName, c.Phone1 AS CustomerPhone,' +
    '       s.Description AS StatusDescription' +
    ' FROM SalesOrdr01 o' +
    ' LEFT JOIN Customer c ON c.CustId = o.CustId' +
    ' LEFT JOIN salesOrdrStatusHead s ON s.StatusID = o.StatusId' +
    ' WHERE o.Ordr = @ordr OR CAST(o.ID AS nvarchar) = @ordr'
  );
  return { recordset: result.recordset };
}

export async function createSalesOrder(body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ccode', sql.NVarChar, body.Ccode || '');
  req.input('yr', sql.NVarChar, body.yr || new Date().getFullYear().toString());
  req.input('Ordr', sql.NVarChar, body.Ordr || '');
  req.input('Ordt', sql.DateTime, body.Ordt ? new Date(body.Ordt) : new Date());
  req.input('CustId', sql.NVarChar, body.CustId || '');
  req.input('Lpo', sql.NVarChar, body.Lpo || '');
  req.input('Total', sql.Float, body.Total || 0);
  req.input('Nett', sql.Float, body.Nett || 0);
  req.input('Tda', sql.Float, body.Tda || 0);
  req.input('Txa', sql.Float, body.Txa || 0);
  req.input('ServiceCharge', sql.Float, body.ServiceCharge || 0);
  req.input('User', sql.NVarChar, body.User || '');
  req.input('VehId', sql.Int, body.VehId || 0);
  req.input('km', sql.Int, body.km || 0);
  req.input('CustNote', sql.NVarChar, body.CustNote || '');
  req.input('TechNote', sql.NVarChar, body.TechNote || '');
  req.input('Otype', sql.NVarChar, body.Otype || '');
  req.input('StatusId', sql.Int, body.StatusId || 1);
  req.input('CreatedBy', sql.NVarChar, body.CreatedBy || '');
  await req.query(
    'INSERT INTO SalesOrdr01 (Ccode, yr, Ordr, Ordt, CustId, Lpo, Total, Nett, Tda, Txa,' +
    ' ServiceCharge, [User], VehId, km, CustNote, TechNote, Otype, CLOSED, StatusId, CreatedBy, CretedDt)' +
    ' VALUES (@Ccode, @yr, @Ordr, @Ordt, @CustId, @Lpo, @Total, @Nett, @Tda, @Txa,' +
    ' @ServiceCharge, @User, @VehId, @km, @CustNote, @TechNote, @Otype, 0, @StatusId, @CreatedBy, GETDATE())'
  );
  return { success: true };
}

export async function updateSalesOrder(id: string, body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, id);
  req.input('CustNote', sql.NVarChar, body.CustNote || '');
  req.input('TechNote', sql.NVarChar, body.TechNote || '');
  req.input('Total', sql.Float, body.Total || 0);
  req.input('Nett', sql.Float, body.Nett || 0);
  req.input('StatusId', sql.Int, body.StatusId || 1);
  req.input('EditedBy', sql.NVarChar, body.EditedBy || '');
  await req.query(
    'UPDATE SalesOrdr01 SET CustNote=@CustNote, TechNote=@TechNote,' +
    ' Total=@Total, Nett=@Nett, StatusId=@StatusId,' +
    ' EditedBy=@EditedBy, EditedDt=GETDATE() WHERE Ordr=@Ordr'
  );
  return { success: true };
}

export async function changeOrderStatus(id: string, status: string, _reason: string, _userId: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, id);
  req.input('StatusId', sql.Int, parseInt(status) || 1);
  await req.query('UPDATE SalesOrdr01 SET StatusId=@StatusId WHERE Ordr=@Ordr');
  return { success: true };
}

export async function bulkUpdateOrderStatus(orderIds: string[], status: string, _userId: number) {
  const pool = await getDbPool();
  for (const id of orderIds) {
    const req = pool.request();
    req.input('Ordr', sql.NVarChar, id);
    req.input('StatusId', sql.Int, parseInt(status) || 1);
    await req.query('UPDATE SalesOrdr01 SET StatusId=@StatusId WHERE Ordr=@Ordr');
  }
  return { success: true };
}

export async function deleteSalesOrder(id: string, _userId: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, id);
  await req.query('DELETE FROM SalesOrdr01 WHERE Ordr=@Ordr AND CLOSED=0');
  return { success: true };
}

export async function changeOrderCustomer(id: string, customerId: string, _reason: string, _userId: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, id);
  req.input('CustId', sql.NVarChar, customerId);
  await req.query('UPDATE SalesOrdr01 SET CustId=@CustId WHERE Ordr=@Ordr');
  return { success: true };
}

export async function sendOrderConfirmation(_id: string) { return { success: true }; }

export async function getSalesOrderAuditTrail(id: string) {
  return getJobStatusHistoryForOrder(id);
}

async function getJobStatusHistoryForOrder(ordr: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, ordr);
  const result = await req.query(
    'SELECT d.DtlId, d.Ordr, d.StatusDate, d.StatusId,' +
    '       h.Description AS StatusDescription' +
    ' FROM salesOrdrStatusDtl d' +
    ' LEFT JOIN salesOrdrStatusHead h ON h.StatusID = d.StatusId' +
    ' WHERE d.Ordr = @Ordr ORDER BY d.StatusDate DESC'
  );
  return { recordset: result.recordset };
}

export async function getSalesOrderReport(filter: Record<string, any>) { return querySalesOrders(filter); }
export async function getPendingOrderRegister(filter: Record<string, any>) {
  return querySalesOrders({ ...filter, status: 'open' });
}
export async function getOrderStatusReport(filter: Record<string, any>) { return querySalesOrders(filter); }
export async function getPendingOrders(filter: Record<string, any>) {
  return querySalesOrders({ ...filter, status: 'open' });
}

export async function writeSalesAuditLog(_entry: any): Promise<void> {}
