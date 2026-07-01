import { callProcedure } from '../db/callProcedure';
import { getDbPool } from '../db/connection';
import sql from 'mssql';

async function querySuppliers(params: { search?: string; status?: string; page?: number; limit?: number }) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const search = params.search || '';
  const activeOnly = params.status === 'inactive' ? 0 : (params.status === 'active' ? 1 : null);

  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  let activeClause = '';
  if (activeOnly !== null) {
    req.input('active', sql.Int, activeOnly);
    activeClause = 'AND Active = @active';
  }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY SuppName) AS rn,' +
    '         SuppID, SuppName, Phone1, Phone2, Fax, email,' +
    '         Address1, Emirate, ContactPerson, ContactTel, area AS Area, Active, Remarks, ccode' +
    '  FROM Supplier' +
    '  WHERE (SuppName LIKE @search OR Phone1 LIKE @search OR email LIKE @search)' +
    '  ' + activeClause +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('search', sql.NVarChar, '%' + search + '%');
  if (activeOnly !== null) countReq.input('active', sql.Int, activeOnly);
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM Supplier' +
    ' WHERE (SuppName LIKE @search OR Phone1 LIKE @search OR email LIKE @search)' +
    ' ' + activeClause
  );
  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function getSupplierOverview(params: any) { return querySuppliers(params); }
export async function getSupplierList(params: any) { return querySuppliers(params); }

export async function getSupplierById(id: string | number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.NVarChar, String(id));
  const result = await req.query(
    'SELECT SuppID, SuppName, Phone1, Phone2, Fax, email,' +
    '       Address1, Address2, Address3, Emirate, ContactPerson, ContactTel,' +
    '       area AS Area, Active, Remarks, ccode, Sman, Grade, LimitApproved, AcStarted, AcClosed' +
    ' FROM Supplier WHERE SuppID = @id'
  );
  return { recordset: result.recordset };
}

export async function insertSupplier(data: any) { return callProcedure('spInsertSupplier', data); }
export async function updateSupplier(id: any, data: any) { return callProcedure('spUpdateSupplier', { id, ...data }); }
export async function deleteSupplier(id: any) { return callProcedure('spDeleteSupplier', { id }); }
export async function setSupplierStatus(id: any, status: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.NVarChar, String(id));
  req.input('active', sql.Int, status === 'inactive' ? 0 : 1);
  await req.query('UPDATE Supplier SET Active = @active WHERE SuppID = @id');
}
export async function mergeSuppliers(masterId: any, duplicateIds: any[], fieldMap: any) {
  return callProcedure('spMergeSuppliers', { masterId, duplicateIds: JSON.stringify(duplicateIds), fieldMap: JSON.stringify(fieldMap) });
}
export async function getSupplierOutstanding(params: any) { return callProcedure('spSupplierOutStandingSummary', params); }
export async function writeSupplierAuditLog(_entry: any): Promise<void> { }
