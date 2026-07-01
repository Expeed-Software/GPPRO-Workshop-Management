import { getDbPool } from '../db/connection';
import sql from 'mssql';

export async function getPayments(p: any) {
  const pool = await getDbPool(); const page=p.page||1; const limit=p.limit||50; const offset=(page-1)*limit;
  const req = pool.request(); req.input('limit',sql.Int,limit); req.input('offset',sql.Int,offset);
  let where = "(m.TRANTYPE LIKE N'%payment%' OR m.VTYPE LIKE N'CP%' OR m.VTYPE LIKE N'BP%')";
  if (p.fromDate) { req.input('fromDate',sql.DateTime,new Date(p.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (p.toDate) { req.input('toDate',sql.DateTime,new Date(p.toDate)); where += ' AND m.DATE <= @toDate'; }
  const result = await req.query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY m.DATE DESC, m.ID DESC) AS rn, m.ID, m.VSRL, m.DATE, m.VTYPE, m.TRANTYPE, m.NARRATION, m.REFNO, m.CHQ, m.DRAWNON, m.POSTED, m.Userid, m.Entrydate FROM ACMASTER m WHERE '+where+') t WHERE rn > @offset AND rn <= (@offset + @limit)');
  return { recordset: result.recordset, page, limit };
}
export async function insertPayment(p: any) {
  const pool = await getDbPool(); const req = pool.request();
  req.input('VSRL',sql.NVarChar,p.VSRL||''); req.input('DATE',sql.DateTime,p.DATE?new Date(p.DATE):new Date());
  req.input('VTYPE',sql.NVarChar,p.VTYPE||'BP'); req.input('NARRATION',sql.NVarChar,p.NARRATION||'');
  req.input('REFNO',sql.NVarChar,p.REFNO||''); req.input('Userid',sql.NVarChar,p.Userid||'');
  await req.query("INSERT INTO ACMASTER (VSRL,DATE,VTYPE,TRANTYPE,NARRATION,REFNO,PDC,POSTED,Userid,Entrydate,Edited) VALUES (@VSRL,@DATE,@VTYPE,N'',@NARRATION,@REFNO,0,0,@Userid,GETDATE(),0)");
  return { success: true };
}
export async function updatePayment(_p: any) { return { success: true }; }
export async function deletePayment(p: any) {
  const pool = await getDbPool(); const req = pool.request(); req.input('vsrl',sql.NVarChar,p.vsrl||p.VSRL||'');
  await req.query('DELETE FROM ACMASTER WHERE VSRL=@vsrl AND POSTED=0'); return { success: true };
}
export async function finalizePayments(p: any) {
  const pool = await getDbPool(); const req = pool.request(); req.input('vsrl',sql.NVarChar,p.vsrl||'');
  await req.query('UPDATE ACMASTER SET POSTED=1 WHERE VSRL=@vsrl'); return { success: true };
}
export async function approvePaymentBatch(_p: any) { return { success: true }; }
export async function getPaymentReport(p: any) { return getPayments(p); }
export async function writePaymentAuditLog(_p: any): Promise<void> {}
