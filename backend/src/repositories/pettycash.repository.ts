import { getDbPool } from '../db/connection';
import sql from 'mssql';

export async function getPettyCash(p: any) {
  const pool = await getDbPool(); const page=p.page||1; const limit=p.limit||50; const offset=(page-1)*limit;
  const req = pool.request(); req.input('limit',sql.Int,limit); req.input('offset',sql.Int,offset);
  let where = "(VTYPE LIKE N'PC%' OR VTYPE LIKE N'JN%' OR TRANTYPE LIKE N'%petty%' OR TRANTYPE LIKE N'%cash%')";
  if (p.fromDate) { req.input('fromDate',sql.DateTime,new Date(p.fromDate)); where += ' AND DATE >= @fromDate'; }
  if (p.toDate) { req.input('toDate',sql.DateTime,new Date(p.toDate)); where += ' AND DATE <= @toDate'; }
  const result = await req.query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY DATE DESC, ID DESC) AS rn, ID, VSRL, DATE, VTYPE, TRANTYPE, NARRATION, REFNO, POSTED, Userid, Entrydate FROM ACMASTER WHERE '+where+') t WHERE rn > @offset AND rn <= (@offset + @limit)');
  return { recordset: result.recordset, page, limit };
}
export async function insertPettyCash(p: any) {
  const pool = await getDbPool(); const req = pool.request();
  req.input('VSRL',sql.NVarChar,p.VSRL||''); req.input('DATE',sql.DateTime,p.DATE?new Date(p.DATE):new Date());
  req.input('NARRATION',sql.NVarChar,p.NARRATION||''); req.input('REFNO',sql.NVarChar,p.REFNO||''); req.input('Userid',sql.NVarChar,p.Userid||'');
  await req.query("INSERT INTO ACMASTER (VSRL,DATE,VTYPE,TRANTYPE,NARRATION,REFNO,PDC,POSTED,Userid,Entrydate,Edited) VALUES (@VSRL,@DATE,N'PC',N'PettyCash',@NARRATION,@REFNO,0,0,@Userid,GETDATE(),0)");
  return { success: true };
}
export async function updatePettyCash(_p: any) { return { success: true }; }
export async function deletePettyCash(p: any) {
  const pool = await getDbPool(); const req = pool.request(); req.input('vsrl',sql.NVarChar,p.vsrl||p.VSRL||'');
  await req.query('DELETE FROM ACMASTER WHERE VSRL=@vsrl AND POSTED=0'); return { success: true };
}
export async function approvePettyCashBatch(_p: any) { return { success: true }; }
export async function writePettyCashAuditLog(_p: any): Promise<void> {}
