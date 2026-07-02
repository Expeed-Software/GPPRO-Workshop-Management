import { callProcedure } from '../db/callProcedure';
import { getDbPool } from '../db/connection';
import sql from 'mssql';

// Real table: Customer (CustId nvarchar, custname, Phone1, Phone2, Fax, email,
//   Address1-3, Emirate, ContactPerson, ContactTel, area, Active, Remarks, ccode)
// SQL Server 2008: use ROW_NUMBER() for pagination, no OFFSET/FETCH support.

export async function getCustomerOverview(params: {
  page?: number; limit?: number; search?: string; status?: string;
}) {
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
    '  SELECT ROW_NUMBER() OVER (ORDER BY custname) AS rn,' +
    '         CustId, custname AS CustName, Phone1, Phone2, Fax, email,' +
    '         Address1, Emirate, ContactPerson, ContactTel, area AS Area, Active, Remarks, ccode' +
    '  FROM CustomerSql' +
    "  WHERE (custname LIKE @search OR Phone1 LIKE @search OR email LIKE @search)" +
    '  ' + activeClause +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('search', sql.NVarChar, '%' + search + '%');
  if (activeOnly !== null) countReq.input('active', sql.Int, activeOnly);
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM CustomerSql' +
    " WHERE (custname LIKE @search OR Phone1 LIKE @search OR email LIKE @search)" +
    ' ' + activeClause
  );

  return {
    recordset: result.recordset,
    total: countResult.recordset[0]?.total || 0,
    page,
    limit,
  };
}

export async function getCustomerList(params: { search?: string; status?: string; page?: number; limit?: number }) {
  return getCustomerOverview(params);
}

export async function getCustomerById(id: string | number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.NVarChar, String(id));
  const result = await req.query(
    'SELECT CustId, custname AS CustName, Phone1, Phone2, Fax, email,' +
    '       Address1, Address2, Address3, Emirate, ContactPerson, ContactTel,' +
    '       area AS Area, Active, Remarks, ccode, Sman, Grade, LimitApproved,' +
    '       AcStarted, AcClosed' +
    ' FROM CustomerSql WHERE CustId = @id'
  );
  return { recordset: result.recordset };
}

export async function insertCustomer(data: Record<string, any>) {
  return callProcedure('spInsertCustomer', data);
}

export async function updateCustomer(id: string | number, data: Record<string, any>) {
  return callProcedure('spUpdateCustomer', { id, ...data });
}

export async function setCustomerStatus(id: string | number, status: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.NVarChar, String(id));
  req.input('active', sql.Int, status === 'inactive' ? 0 : 1);
  await req.query('UPDATE Customer SET Active = @active WHERE CustId = @id');
}

export async function deleteCustomer(id: string | number) {
  return callProcedure('spDeleteCustomer', { id });
}

export async function mergeCustomers(masterId: any, duplicateIds: any[], fieldMap: any) {
  return callProcedure('spMergeCustomers', {
    masterId,
    duplicateIds: JSON.stringify(duplicateIds),
    fieldMap: JSON.stringify(fieldMap),
  });
}

export async function checkDuplicateCustomer(name: string, phone: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('name', sql.NVarChar, name);
  req.input('phone', sql.NVarChar, phone);
  const result = await req.query(
    'SELECT CustId, custname AS CustName, Phone1 FROM CustomerSql WHERE custname = @name OR Phone1 = @phone'
  );
  return { recordset: result.recordset };
}

export async function importCustomers(rows: Record<string, any>[]) {
  return callProcedure('spImportCustomers', { data: JSON.stringify(rows) });
}

export async function exportCustomers(params: Record<string, any>) {
  return getCustomerOverview({ ...params, limit: 10000 });
}

export async function getCustomerOutstanding(params: Record<string, any>) {
  return callProcedure('spCustomerOutStandingSalesManwise', params);
}

export async function getCustomerAgewiseSummary(params: { custId?: number; asOfDate?: string }) {
  return callProcedure('AgewiseSummary', { entityType: 'customer', ...params });
}

export async function writeCustomerAuditLog(_entry: any): Promise<void> { }
