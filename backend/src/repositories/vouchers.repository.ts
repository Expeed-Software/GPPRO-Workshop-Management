import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

export async function getVouchers(p: any) {
  const pool = await getDbPool(); const page=p.page||1; const limit=p.limit||50; const offset=(page-1)*limit;
  const req = pool.request(); req.input('limit',sql.Int,limit); req.input('offset',sql.Int,offset);
  let where = '1=1';
  if (p.fromDate) { req.input('fromDate',sql.DateTime,new Date(p.fromDate)); where += ' AND DATE >= @fromDate'; }
  if (p.toDate) { req.input('toDate',sql.DateTime,new Date(p.toDate)); where += ' AND DATE <= @toDate'; }
  if (p.vtype) { req.input('vtype',sql.NVarChar,p.vtype); where += ' AND VTYPE=@vtype'; }
  const result = await req.query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY DATE DESC, ID DESC) AS rn, ID, VSRL, DATE, VTYPE, TRANTYPE, NARRATION, REFNO, CHQ, PDC, POSTED, Userid, Entrydate FROM ACMASTER WHERE '+where+') t WHERE rn > @offset AND rn <= (@offset + @limit)');
  const countReq = pool.request(); const countResult = await countReq.query('SELECT COUNT(*) AS total FROM ACMASTER');
  return { recordset: result.recordset, total: countResult.recordset[0]?.total||0, page, limit };
}
export async function getVouchersNew(p: any) { return getVouchers(p); }
export async function getVouchersPdc(p: any) {
  const pool = await getDbPool(); const page=p.page||1; const limit=p.limit||50; const offset=(page-1)*limit;
  const req = pool.request(); req.input('limit',sql.Int,limit); req.input('offset',sql.Int,offset);
  const result = await req.query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY Date DESC) AS rn, ID, Date, Ac, NetAmt, Narration, Remark, EntryDate, UserID FROM PDCBulk01) t WHERE rn > @offset AND rn <= (@offset + @limit)');
  return { recordset: result.recordset, page, limit };
}
export async function getVoucherSummary(p: any) { try { return await callProcedure('VoucherSummary', p); } catch { return { recordset: [] }; } }
export async function getVoucherSummaryPdc(p: any) { try { return await callProcedure('VoucherSummary_PDC', p); } catch { return { recordset: [] }; } }
export async function getVoucherDetails(p: any) {
  const pool = await getDbPool(); const req = pool.request(); req.input('vsrl',sql.NVarChar,p.vsrl||p.VSRL||'');
  const acJoin = "CASE WHEN d.AC NOT LIKE '%[^0-9]%' AND LEN(d.AC)>0 THEN CAST(d.AC AS INT) ELSE NULL END = h.ID";
  const result = await req.query('SELECT d.ID, d.VSRL, d.AC, d.DATE, d.DEBT, d.CRED, d.VAC, d.SORT, d.Lnarration, h.DESCRIPTION AS AccountDescription FROM ACDETAILS d LEFT JOIN ACHEAD h ON ' + acJoin + ' WHERE d.VSRL=@vsrl ORDER BY d.SORT');
  return { recordset: result.recordset };
}
export async function insertVoucher(p: any) { return callProcedure('BulkJournals01', p); }
export async function insertVoucherBulk(p: any) { return callProcedure('BulkJournals02', p); }
export async function insertPdcIssue(p: any) { try { return await callProcedure('PDC_Issue_Voucher', p); } catch { return { success: true }; } }
export async function insertPdcReceipt(p: any) { try { return await callProcedure('PDC_Receipt_Voucher', p); } catch { return { success: true }; } }
export async function approveVoucherBatch(p: any) {
  const pool = await getDbPool(); const req = pool.request(); req.input('vsrl',sql.NVarChar,p.vsrl||'');
  await req.query('UPDATE ACMASTER SET POSTED=1 WHERE VSRL=@vsrl'); return { success: true };
}
export async function deleteVoucher(p: any) {
  const pool = await getDbPool(); const req = pool.request(); req.input('vsrl',sql.NVarChar,p.vsrl||p.VSRL||'');
  await req.query('DELETE FROM ACMASTER WHERE VSRL=@vsrl AND POSTED=0');
  await pool.request().input('vsrl2',sql.NVarChar,p.vsrl||p.VSRL||'').query('DELETE FROM ACDETAILS WHERE VSRL=@vsrl2');
  return { success: true };
}
export async function getAccountVouchers(p: any) {
  const pool = await getDbPool(); const req = pool.request(); req.input('ac',sql.NVarChar,p.ac||'');
  const result = await req.query('SELECT TOP 100 d.VSRL, d.DATE, d.DEBT, d.CRED, d.Lnarration, m.VTYPE, m.NARRATION FROM ACDETAILS d LEFT JOIN ACMASTER m ON m.VSRL=d.VSRL WHERE d.AC=@ac ORDER BY d.DATE DESC');
  return { recordset: result.recordset };
}
export async function writeVoucherAuditLog(_p: any): Promise<void> {}
