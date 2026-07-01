import { getDbPool } from '../db/connection';
import sql from 'mssql';

export async function getReceipts(p: any) {
  const pool = await getDbPool(); const page=p.page||1; const limit=p.limit||50; const offset=(page-1)*limit;
  const req = pool.request(); req.input('limit',sql.Int,limit); req.input('offset',sql.Int,offset);
  let where = "(m.TRANTYPE LIKE N'%receipt%' OR m.VTYPE LIKE N'CR%' OR m.VTYPE LIKE N'BR%')";
  if (p.fromDate) { req.input('fromDate',sql.DateTime,new Date(p.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (p.toDate) { req.input('toDate',sql.DateTime,new Date(p.toDate)); where += ' AND m.DATE <= @toDate'; }
  const result = await req.query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY m.DATE DESC, m.ID DESC) AS rn, m.ID, m.VSRL, m.DATE, m.VTYPE, m.TRANTYPE, m.NARRATION, m.REFNO, m.CHQ, m.POSTED, m.Userid FROM ACMASTER m WHERE '+where+') t WHERE rn > @offset AND rn <= (@offset + @limit)');
  return { recordset: result.recordset, page, limit };
}
export async function insertReceipt(p: any) {
  const pool = await getDbPool(); const req = pool.request();
  req.input('VSRL',sql.NVarChar,p.VSRL||''); req.input('DATE',sql.DateTime,p.DATE?new Date(p.DATE):new Date());
  req.input('VTYPE',sql.NVarChar,p.VTYPE||'BR'); req.input('NARRATION',sql.NVarChar,p.NARRATION||'');
  req.input('REFNO',sql.NVarChar,p.REFNO||''); req.input('Userid',sql.NVarChar,p.Userid||'');
  await req.query('INSERT INTO ACMASTER (VSRL,DATE,VTYPE,TRANTYPE,NARRATION,REFNO,PDC,POSTED,Userid,Entrydate,Edited) VALUES (@VSRL,@DATE,@VTYPE,N' + "'Receipt'" + ',@NARRATION,@REFNO,0,0,@Userid,GETDATE(),0)');
  return { success: true };
}
export async function updateReceipt(_p: any) { return { success: true }; }
export async function deleteReceipt(p: any) {
  const pool = await getDbPool(); const req = pool.request(); req.input('vsrl',sql.NVarChar,p.vsrl||p.VSRL||'');
  await req.query('DELETE FROM ACMASTER WHERE VSRL=@vsrl AND POSTED=0'); return { success: true };
}
export async function approveReceiptBatch(_p: any) { return { success: true }; }
export async function getReceiptBackup(p: any) { return getReceipts(p); }
export async function restoreReceiptBackup(_p: any) { return { success: true }; }
export async function getReceiptBackupReport(p: any) { return getReceipts(p); }
export async function getAutoReceipts(p: any) { return getReceipts(p); }
export async function insertAutoReceipts(_p: any) { return { success: true }; }
export async function writeReceiptAuditLog(_p: any): Promise<void> {}
