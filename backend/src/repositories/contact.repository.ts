import { getDbPool } from '../db/connection';
import sql from 'mssql';

// No dedicated contacts table in DB — contacts are derived from Customer.ContactPerson/ContactTel
// SQL Server 2008 — ROW_NUMBER() pagination only

export async function searchContacts(filters: { search?: string; entityId?: number; entityType?: string; page?: number; limit?: number }) {
  const pool = await getDbPool();
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;
  const search = filters.search || '';
  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY CustId) AS rn,' +
    '         CustId AS id, CustName AS name, ContactPerson, ContactTel AS phone,' +
    '         Phone1, Phone2, email, Address1, Emirate, Area, Active' +
    '  FROM Customer' +
    '  WHERE ContactPerson IS NOT NULL AND ContactPerson != \'\''+
    '    AND (CustName LIKE @search OR ContactPerson LIKE @search OR ContactTel LIKE @search OR email LIKE @search)' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('search', sql.NVarChar, '%' + search + '%');
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM Customer' +
    ' WHERE ContactPerson IS NOT NULL AND ContactPerson != \'\''+
    '   AND (CustName LIKE @search OR ContactPerson LIKE @search OR ContactTel LIKE @search OR email LIKE @search)'
  );

  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function getContactById(id: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.NVarChar, String(id));
  const result = await req.query(
    'SELECT CustId AS id, CustName AS name, ContactPerson, ContactTel AS phone, Phone1, Phone2, email, Address1, Active' +
    ' FROM Customer WHERE CustId = @id'
  );
  return { recordset: result.recordset };
}

export async function insertContact(data: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('ContactPerson', sql.NVarChar, data.name || data.ContactPerson || '');
  req.input('ContactTel', sql.NVarChar, data.phone || data.ContactTel || '');
  req.input('email', sql.NVarChar, data.email || '');
  req.input('CustName', sql.NVarChar, data.company || data.CustName || '');
  req.input('Address1', sql.NVarChar, data.address || data.Address1 || '');
  await req.query(
    'INSERT INTO Customer (CustName, ContactPerson, ContactTel, email, Address1, Active)' +
    ' VALUES (@CustName, @ContactPerson, @ContactTel, @email, @Address1, 1)'
  );
  return { success: true };
}

export async function updateContact(id: number, data: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.NVarChar, String(id));
  req.input('ContactPerson', sql.NVarChar, data.name || data.ContactPerson || '');
  req.input('ContactTel', sql.NVarChar, data.phone || data.ContactTel || '');
  req.input('email', sql.NVarChar, data.email || '');
  await req.query('UPDATE Customer SET ContactPerson=@ContactPerson, ContactTel=@ContactTel, email=@email WHERE CustId=@id');
  return { success: true };
}

export async function deleteContact(_id: number) {
  return { success: true, message: 'Contact deletion not supported in legacy schema.' };
}

export async function checkDuplicateContact(fields: { name: string; phone?: string; email?: string }) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('name', sql.NVarChar, fields.name || '');
  req.input('phone', sql.NVarChar, fields.phone || '');
  req.input('email', sql.NVarChar, fields.email || '');
  const result = await req.query(
    'SELECT CustId AS id, CustName AS name, ContactPerson, ContactTel AS phone, email FROM Customer' +
    ' WHERE CustName = @name OR (@phone != \'\' AND ContactTel = @phone) OR (@email != \'\' AND email = @email)'
  );
  return { recordset: result.recordset };
}

export async function mergeContacts(_masterId: number, _duplicateIds: number[], _fieldMap: Record<string, any>) {
  return { success: true, message: 'Contact merge not supported in legacy schema.' };
}

export async function importContacts(rows: Record<string, any>[]) {
  const pool = await getDbPool();
  let count = 0;
  for (const row of rows) {
    const req = pool.request();
    req.input('CustName', sql.NVarChar, row.company || row.CustName || '');
    req.input('ContactPerson', sql.NVarChar, row.name || row.ContactPerson || '');
    req.input('ContactTel', sql.NVarChar, row.phone || row.ContactTel || '');
    req.input('email', sql.NVarChar, row.email || '');
    await req.query('INSERT INTO Customer (CustName, ContactPerson, ContactTel, email, Active) VALUES (@CustName, @ContactPerson, @ContactTel, @email, 1)');
    count++;
  }
  return { success: true, count };
}

export async function exportContacts(_params: Record<string, any>) {
  const pool = await getDbPool();
  const result = await pool.request().query(
    'SELECT TOP 500 CustId AS id, CustName AS name, ContactPerson, ContactTel AS phone, email, Address1 FROM Customer WHERE ContactPerson IS NOT NULL AND ContactPerson != \'\' ORDER BY CustName'
  );
  return { recordset: result.recordset };
}

export async function writeContactAuditLog(_entry: any): Promise<void> {}
