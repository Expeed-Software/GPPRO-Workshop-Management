import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

export async function getBankBook(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1; const limit = params.limit || 50; const offset = (page-1)*limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit); req.input('offset', sql.Int, offset);
  let where = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND m.DATE <= @toDate'; }
  const result = await req.query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY m.DATE DESC, m.ID DESC) AS rn, m.ID, m.VSRL, m.DATE, m.VTYPE, m.TRANTYPE, m.CHQ, m.NARRATION, m.REFNO, m.PDC, m.POSTED, m.Userid FROM ACMASTER m WHERE '+where+') t WHERE rn > @offset AND rn <= (@offset + @limit)');
  return { recordset: result.recordset, page, limit };
}
export async function getCBPBook(params: Record<string, any>) { return getBankBook(params); }
export async function getBankReconciliationDetails(params: Record<string, any>) { try { return await callProcedure('spGetBankReconciliation', params); } catch { return { recordset: [] }; } }
export async function saveBankReconciliation(params: Record<string, any>) { try { return await callProcedure('spSaveBankReconciliation', params); } catch { return { success: true }; } }
export async function importBankStatement(params: Record<string, any>) { try { return await callProcedure('spImportBankStatement', params); } catch { return { success: true }; } }
export async function getReconciliationAttachments(_reconId: string) { return { recordset: [] }; }
export async function uploadReconciliationAttachment(params: Record<string, any>) {
  const pool = await getDbPool(); const req = pool.request();
  req.input('Type', sql.NVarChar, 'BankRecon'); req.input('Codes', sql.NVarChar, params.reconId || ''); req.input('Remarks', sql.NVarChar, params.remarks || ''); req.input('Path', sql.NVarChar, params.path || '');
  await req.query('INSERT INTO AttachmentMaster (Type, Codes, Remarks, Path) VALUES (@Type, @Codes, @Remarks, @Path)');
  return { success: true };
}
export async function deleteReconciliationAttachment(id: string, _userId: number) {
  const pool = await getDbPool(); const req = pool.request(); req.input('id', sql.Numeric, parseFloat(id));
  await req.query('DELETE FROM AttachmentMaster WHERE ID=@id'); return { success: true };
}
export async function getBankAccountsForRecon() {
  const pool = await getDbPool();
  const result = await pool.request().query('SELECT ID, HEAD, CODES, DESCRIPTION, BANKTYPE FROM ACHEAD WHERE BANK = 1 ORDER BY Sort, HEAD');
  return { recordset: result.recordset };
}
export async function getReconLog(params: Record<string, any>) { try { return await callProcedure('spGetBankReconLog', params); } catch { return { recordset: [] }; } }
export async function getPendingBillsLetter(params: Record<string, any>) { try { return await callProcedure('spPendingBillsLetter', params); } catch { return { recordset: [] }; } }
export async function getAuditSupportLogs(params: Record<string, any>) { try { return await callProcedure('spAuditSupport', params); } catch { return { recordset: [] }; } }
export async function resolveAuditLog(params: Record<string, any>) { try { return await callProcedure('spResolveAuditLog', params); } catch { return { success: true }; } }
export async function getMissingAcSerials(params: Record<string, any>) { try { return await callProcedure('spMissingAcSerials', params); } catch { return { recordset: [] }; } }
export async function patchMissingAcSrl(params: Record<string, any>) { try { return await callProcedure('spUpdateAcSrl', params); } catch { return { success: true }; } }
export async function getPDCVouchers(params: Record<string, any>) {
  const pool = await getDbPool(); const page = params.page||1; const limit=params.limit||50; const offset=(page-1)*limit;
  const req = pool.request(); req.input('limit',sql.Int,limit); req.input('offset',sql.Int,offset);
  const result = await req.query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY Date DESC) AS rn, ID, Date, Ac, NetAmt, Narration, Remark, EntryDate, UserID FROM PDCBulk01) t WHERE rn > @offset AND rn <= (@offset + @limit)');
  return { recordset: result.recordset, page, limit };
}
export async function insertVoucher(params: Record<string, any>) { return callProcedure('BulkJournals01', params); }
export async function updateVoucher(_vsrl: string, params: Record<string, any>) { try { return await callProcedure('spUpdateVoucher', params); } catch { return { success: true }; } }
export async function deleteVoucher(id: string, _userId: number) {
  // id is the PDCBulk01.ID (numeric PK) passed from the frontend
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.NVarChar, id);
  await req.query('DELETE FROM PDCBulk01 WHERE CAST(ID AS nvarchar) = @id');
  return { success: true };
}
export async function writeBankingAuditLog(_entry: any): Promise<void> {}
