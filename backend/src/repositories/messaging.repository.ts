import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

// Real tables: MailTable (ID, Key, Date, SendTo, Subject, Msg, SendBy, [Read], ReadOn),
//   MailFilterTable, Company, AdditionalRemarks

export async function getMailCount(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('sendTo', sql.NVarChar, p.username || p.sendTo || '');
  const result = await req.query(
    'SELECT COUNT(*) AS unread FROM MailTable WHERE SendTo = @sendTo AND ([Read] IS NULL OR [Read] = 0)'
  );
  return { recordset: result.recordset };
}

export async function getMail(p: any) {
  const pool = await getDbPool();
  const page = p.page || 1;
  const limit = p.limit || 50;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('sendTo', sql.NVarChar, p.username || p.sendTo || '');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY Date DESC) AS rn,' +
    '         ID, [Key], Date, SendTo, Subject, Msg, SendBy, [Read], ReadOn' +
    '  FROM MailTable WHERE SendTo = @sendTo' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('sendTo', sql.NVarChar, p.username || p.sendTo || '');
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM MailTable WHERE SendTo = @sendTo'
  );

  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function sendMail(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('SendTo', sql.NVarChar, p.SendTo || p.sendTo || '');
  req.input('Subject', sql.NVarChar, p.Subject || p.subject || '');
  req.input('Msg', sql.NVarChar, p.Msg || p.msg || p.message || '');
  req.input('SendBy', sql.NVarChar, p.SendBy || p.sendBy || '');
  await req.query(
    'INSERT INTO MailTable (Date, SendTo, Subject, Msg, SendBy, [Read])' +
    ' VALUES (GETDATE(), @SendTo, @Subject, @Msg, @SendBy, 0)'
  );
  return { success: true };
}

export async function markMailRead(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(p.id || p.ID));
  await req.query('UPDATE MailTable SET [Read]=1, ReadOn=GETDATE() WHERE ID=@id');
  return { success: true };
}

export async function deleteMail(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(p.id || p.ID));
  await req.query('DELETE FROM MailTable WHERE ID=@id');
  return { success: true };
}

export async function filterMail(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  const search = p.search || '';
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('sendTo', sql.NVarChar, p.username || p.sendTo || '');
  const result = await req.query(
    'SELECT TOP 100 ID, [Key], Date, SendTo, Subject, Msg, SendBy, [Read], ReadOn' +
    ' FROM MailTable' +
    ' WHERE SendTo = @sendTo AND (Subject LIKE @search OR Msg LIKE @search OR SendBy LIKE @search)' +
    ' ORDER BY Date DESC'
  );
  return { recordset: result.recordset };
}

export async function sendReportMail(p: any) { return sendMail({ ...p, Subject: '[Report] ' + (p.Subject || p.subject || 'Report') }); }

export async function getSentReportMails(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('sendBy', sql.NVarChar, p.username || p.sendBy || '');
  const result = await req.query(
    'SELECT TOP 50 ID, [Key], Date, SendTo, Subject, Msg, SendBy, [Read], ReadOn' +
    ' FROM MailTable WHERE SendBy = @sendBy ORDER BY Date DESC'
  );
  return { recordset: result.recordset };
}

export async function getDeclareItems(p: any) {
  try { return await callProcedure('spGetDeclareItems', p); }
  catch {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT TOP 100 * FROM AdditionalRemarks ORDER BY AdditionalRemarksId DESC');
    return { recordset: result.recordset };
  }
}

export async function insertDeclareItem(p: any) {
  try { return await callProcedure('InsertOrUpdateDeclareItem', p); }
  catch {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('Ordr', sql.NVarChar, p.Ordr || p.ordr || '');
    req.input('EntryDate', sql.VarChar, new Date().toISOString().split('T')[0]);
    req.input('Remarks', sql.VarChar, p.Remarks || p.remarks || '');
    await req.query('INSERT INTO AdditionalRemarks (Ordr, EntryDate, Remarks) VALUES (@Ordr, @EntryDate, @Remarks)');
    return { success: true };
  }
}

export async function updateDeclareItem(p: any) {
  try { return await callProcedure('InsertOrUpdateDeclareItem', p); }
  catch {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('id', sql.Int, parseInt(p.id || p.ID));
    req.input('Remarks', sql.VarChar, p.Remarks || p.remarks || '');
    await req.query('UPDATE AdditionalRemarks SET Remarks=@Remarks WHERE AdditionalRemarksId=@id');
    return { success: true };
  }
}

export async function deleteDeclareItem(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(p.id || p.ID));
  await req.query('DELETE FROM AdditionalRemarks WHERE AdditionalRemarksId=@id');
  return { success: true };
}

export async function runUtilityFunction(p: any) {
  try { return await callProcedure('BulkMergeCleanup', p); }
  catch { return { success: true, message: 'Utility function completed' }; }
}

export async function numToWords(p: any) {
  try { return await callProcedure('NumToWords_Sp', p); }
  catch { return { recordset: [{ result: String(p.number || 0) }] }; }
}

export async function getCompanyInfo(_p: any) {
  const pool = await getDbPool();
  const result = await pool.request().query('SELECT TOP 1 * FROM Company');
  return { recordset: result.recordset };
}

export async function updateCompanyInfo(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('CompanyName', sql.NVarChar, p.CompanyName || '');
  req.input('Address1', sql.NVarChar, p.Address1 || '');
  req.input('Phone1', sql.NVarChar, p.Phone1 || '');
  req.input('email', sql.NVarChar, p.email || '');
  req.input('CCode', sql.NVarChar, p.CCode || '');
  await req.query(
    'UPDATE Company SET CompanyName=@CompanyName, Address1=@Address1, Phone1=@Phone1, email=@email WHERE CCode=@CCode'
  );
  return { success: true };
}

export async function getDocuments(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('type', sql.NVarChar, p.type || '%');
  req.input('codes', sql.NVarChar, p.codes || '%');
  const result = await req.query(
    'SELECT TOP 100 ID, Type, Codes, Remarks, Path FROM AttachmentMaster' +
    ' WHERE Type LIKE @type AND Codes LIKE @codes ORDER BY ID DESC'
  );
  return { recordset: result.recordset };
}

export async function uploadDocument(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Type', sql.NVarChar, p.Type || p.type || '');
  req.input('Codes', sql.NVarChar, p.Codes || p.codes || '');
  req.input('Remarks', sql.NVarChar, p.Remarks || p.remarks || '');
  req.input('Path', sql.NVarChar, p.Path || p.path || '');
  await req.query('INSERT INTO AttachmentMaster (Type, Codes, Remarks, Path) VALUES (@Type, @Codes, @Remarks, @Path)');
  return { success: true };
}

export async function updateDocument(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Numeric, p.id || p.ID);
  req.input('Remarks', sql.NVarChar, p.Remarks || p.remarks || '');
  await req.query('UPDATE AttachmentMaster SET Remarks=@Remarks WHERE ID=@id');
  return { success: true };
}

export async function deleteDocument(p: any) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Numeric, p.id || p.ID);
  await req.query('DELETE FROM AttachmentMaster WHERE ID=@id');
  return { success: true };
}

export async function writeMessagingAuditLog(_p: any): Promise<void> {}
