import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

// Real tables: ACHEAD (account heads), ACMASTER (vouchers), ACDETAILS (voucher lines)
// SQL Server 2008 — ROW_NUMBER() pagination only

export async function getAccountHeads(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 100;
  const offset = (page - 1) * limit;
  const search = params.search || '';

  const req = pool.request();
  req.input('search', sql.NVarChar, '%' + search + '%');
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY Sort, HEAD) AS rn,' +
    '         ID, HEAD, CODES, DESCRIPTION, CORD, HEADUNDER, DISPLAY, BANK,' +
    '         BANKTYPE, CUSTOMER, SUPPLIER, LOCKED, FineHead, [Group], Hidden, Own,' +
    '         LorF, Sort, CrDays, LockEntry, Freeze, lock' +
    '  FROM ACHEAD' +
    '  WHERE (HEAD LIKE @search OR CODES LIKE @search OR DESCRIPTION LIKE @search)' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );

  const countReq = pool.request();
  countReq.input('search', sql.NVarChar, '%' + search + '%');
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM ACHEAD WHERE (HEAD LIKE @search OR CODES LIKE @search OR DESCRIPTION LIKE @search)'
  );

  return { recordset: result.recordset, total: countResult.recordset[0]?.total || 0, page, limit };
}

export async function getAccountHeadTree(_params: Record<string, any>) {
  const pool = await getDbPool();
  const result = await pool.request().query(
    'SELECT ID, HEAD, CODES, DESCRIPTION, CORD, HEADUNDER, DISPLAY, BANK, CUSTOMER, SUPPLIER,' +
    '       LOCKED, FineHead, [Group], Hidden, Own, LorF, Sort, CrDays, LockEntry, Freeze, lock' +
    ' FROM ACHEAD ORDER BY Sort, HEAD'
  );
  return { recordset: result.recordset };
}

export async function getAccountGroupSum(params: Record<string, any>) {
  try { return await callProcedure('ac_Group_Sum', params); } catch { return { recordset: [] }; }
}

export async function getAccountGroupTotal(params: Record<string, any>) {
  try { return await callProcedure('Ac_GroupTotal', params); } catch { return { recordset: [] }; }
}

export async function getAccountHeadBalance(accountCode: string, _date: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('code', sql.NVarChar, accountCode);
  const result = await req.query(
    'SELECT AC, SUM(DEBT) AS totalDebt, SUM(CRED) AS totalCred,' +
    '       SUM(DEBT) - SUM(CRED) AS balance' +
    ' FROM ACDETAILS WHERE AC = @code GROUP BY AC'
  );
  return { recordset: result.recordset };
}

export async function getAccountOpeningBalance(accountCode: string, date: string) {
  try { return await callProcedure('AcOpeningBalance', { accountCode, date }); } catch { return { recordset: [] }; }
}

export async function getAccountClosingBalance(accountCode: string, date: string) {
  try { return await callProcedure('AcClosingBalance', { accountCode, date }); } catch { return { recordset: [] }; }
}

export async function getAccountSummary(params: Record<string, any>) {
  try { return await callProcedure('AcSummary', params); } catch { return { recordset: [] }; }
}

export async function getAccountBalanceSheet(params: Record<string, any>) {
  try { return await callProcedure('AcSummary_balansheet', params); } catch { return { recordset: [] }; }
}

export async function getAccountBalanceSheetNew(params: Record<string, any>) {
  try { return await callProcedure('AcSummary_balansheet_New', params); } catch { return { recordset: [] }; }
}

export async function getAccountAgeWiseDetails(params: Record<string, any>) {
  try { return await callProcedure('AcAgeWiseDetails', params); } catch { return { recordset: [] }; }
}

export async function getAccountOpeningBalancesNew(params: Record<string, any>) {
  try { return await callProcedure('Opening_Balance_NEW', params); } catch { return { recordset: [] }; }
}

export async function insertAcHead(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('head', sql.NVarChar, String(params.HEAD || params.head || '').substring(0, 50));
  req.input('codes', sql.NVarChar, String(params.CODES || params.codes || '').substring(0, 20));
  req.input('desc', sql.NVarChar, String(params.DESCRIPTION || params.description || '').substring(0, 100));
  req.input('cord', sql.NVarChar, String(params.CORD || params.cord || 'DR').substring(0, 5));
  req.input('headunder', sql.NVarChar, String(params.HEADUNDER || params.headunder || '').substring(0, 50));
  req.input('display', sql.NVarChar, String(params.DISPLAY || params.display || params.HEAD || '').substring(0, 100));
  req.input('grp', sql.NVarChar, String(params.Group || params.group || '').substring(0, 50));
  req.input('sort', sql.Int, Number(params.Sort || params.sort || 0));
  req.input('finehead', sql.Int, params.FineHead || params.finehead ? 1 : 0);
  req.input('bank', sql.Int, params.BANK || params.bank ? 1 : 0);
  await req.query(
    'INSERT INTO ACHEAD (HEAD,CODES,DESCRIPTION,CORD,HEADUNDER,DISPLAY,[Group],Sort,FineHead,BANK,LOCKED,Hidden,LockEntry,Freeze,lock)' +
    ' VALUES (@head,@codes,@desc,@cord,@headunder,@display,@grp,@sort,@finehead,@bank,0,0,0,0,0)'
  );
  return { success: true };
}

export async function updateAcHead(code: string, params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('code', sql.NVarChar, code);
  const sets: string[] = [];
  if (params.DESCRIPTION !== undefined) { req.input('desc', sql.NVarChar, String(params.DESCRIPTION).substring(0, 100)); sets.push('DESCRIPTION=@desc'); }
  if (params.CORD !== undefined) { req.input('cord', sql.NVarChar, String(params.CORD).substring(0, 5)); sets.push('CORD=@cord'); }
  if (params.HEADUNDER !== undefined) { req.input('headunder', sql.NVarChar, String(params.HEADUNDER).substring(0, 50)); sets.push('HEADUNDER=@headunder'); }
  if (params.DISPLAY !== undefined) { req.input('display', sql.NVarChar, String(params.DISPLAY).substring(0, 100)); sets.push('DISPLAY=@display'); }
  if (params.Group !== undefined) { req.input('grp', sql.NVarChar, String(params.Group).substring(0, 50)); sets.push('[Group]=@grp'); }
  if (params.Sort !== undefined) { req.input('sort', sql.Int, Number(params.Sort)); sets.push('Sort=@sort'); }
  if (params.LOCKED !== undefined) { req.input('locked', sql.Int, params.LOCKED ? 1 : 0); sets.push('LOCKED=@locked'); }
  if (!sets.length) return { success: true };
  await req.query('UPDATE ACHEAD SET ' + sets.join(',') + ' WHERE HEAD=@code');
  return { success: true };
}

export async function deleteAcHead(code: string, _userId: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('code', sql.NVarChar, code);
  // Check if referenced by transactions
  const check = await req.query('SELECT TOP 1 ID FROM ACDETAILS WHERE AC=@code');
  if (check.recordset.length > 0) throw new Error('Account head is referenced by transactions and cannot be deleted.');
  await pool.request().input('code', sql.NVarChar, code).query('DELETE FROM ACHEAD WHERE HEAD=@code');
  return { success: true };
}

export async function resortAcHead(params: Record<string, any>) {
  // params.items = [{code, sort}]
  if (!Array.isArray(params.items)) return { success: true };
  const pool = await getDbPool();
  for (const item of params.items) {
    const req = pool.request();
    req.input('sort', sql.Int, Number(item.sort || 0));
    req.input('code', sql.NVarChar, String(item.code || ''));
    await req.query('UPDATE ACHEAD SET Sort=@sort WHERE HEAD=@code');
  }
  return { success: true };
}

export async function bulkImportAcHead(data: Record<string, any>) {
  const rows: any[] = Array.isArray(data.rows) ? data.rows : [];
  const errors: any[] = [];
  let imported = 0;
  for (const row of rows) {
    try {
      if (!row.HEAD && !row.head) { errors.push({ row, reason: 'Missing HEAD' }); continue; }
      await insertAcHead(row);
      imported++;
    } catch (e: any) { errors.push({ row, reason: e.message }); }
  }
  return { recordset: [{ imported, errors: errors.length }] };
}

export async function createAcGroupHead(params: Record<string, any>) {
  return insertAcHead(params);
}

export async function editAccountHeadGroup(id: string, params: Record<string, any>) {
  return updateAcHead(id, params);
}

export async function deleteAcGroupHead(id: string, userId: number) {
  return deleteAcHead(id, userId);
}

export async function getAccountModificationLog(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND LogDate >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND LogDate <= @toDate'; }
  if (params.account) { req.input('account', sql.NVarChar, params.account); where += ' AND HEAD = @account'; }
  try {
    const result = await req.query(
      'SELECT * FROM (' +
      '  SELECT ROW_NUMBER() OVER (ORDER BY LogDate DESC) AS rn,' +
      '         ID, HEAD, Action, OldValue, NewValue, ChangedBy, LogDate, Remarks' +
      '  FROM AccountsLog WHERE ' + where +
      ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
    );
    return { recordset: result.recordset, page, limit };
  } catch {
    return { recordset: [], page, limit };
  }
}

export async function getEditChangeLog(params: Record<string, any>) {
  try { return await callProcedure('spGetEditChangeLog', params); } catch { return { recordset: [] }; }
}

export async function getVoucherList(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  let where = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND m.DATE <= @toDate'; }
  if (params.vtype) { req.input('vtype', sql.NVarChar, params.vtype); where += ' AND m.VTYPE = @vtype'; }
  if (params.trantype) { req.input('trantype', sql.NVarChar, params.trantype); where += ' AND m.TRANTYPE = @trantype'; }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY m.DATE DESC, m.ID DESC) AS rn,' +
    '         m.ID, m.VSRL, m.DATE, m.VTYPE, m.TRANTYPE, m.NARRATION, m.REFNO,' +
    '         m.YEAR, m.PDC, m.POSTED, m.REMARKS, m.Userid, m.Entrydate,' +
    '         m.CHQ, m.QDATE, m.DRAWNON, m.PAYTYPE, m.Checked' +
    '  FROM ACMASTER m' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getVoucherListNew(params: Record<string, any>) { return getVoucherList(params); }
export async function getPdcVoucherList(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY m.DATE DESC) AS rn,' +
    '         m.ID, m.VSRL, m.DATE, m.VTYPE, m.CHQ, m.QDATE, m.DRAWNON,' +
    '         m.NARRATION, m.REFNO, m.PDC, m.POSTED, m.Userid' +
    '  FROM ACMASTER m WHERE m.PDC = 1' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getVoucherSummary(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND DATE >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND DATE <= @toDate'; }
  const result = await pool.request().query(
    'SELECT VTYPE, TRANTYPE, COUNT(*) AS VoucherCount, SUM(ISNULL(' +
    '(SELECT SUM(DEBT) FROM ACDETAILS WHERE VSRL=m.VSRL),0)) AS TotalDebit' +
    ' FROM ACMASTER m WHERE ' + where +
    ' GROUP BY VTYPE, TRANTYPE ORDER BY VTYPE'
  );
  return { recordset: result.recordset };
}

export async function getVoucherSummaryPDC(params: Record<string, any>) {
  const pool = await getDbPool();
  let where = 'PDC=1';
  const req = pool.request();
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND DATE >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND DATE <= @toDate'; }
  const result = await req.query(
    'SELECT VTYPE, COUNT(*) AS VoucherCount, ISNULL(SUM(d.DEBT),0) AS TotalDebit, ISNULL(SUM(d.CRED),0) AS TotalCredit' +
    ' FROM ACMASTER m LEFT JOIN ACDETAILS d ON d.VSRL=m.VSRL' +
    ' WHERE ' + where + ' GROUP BY VTYPE ORDER BY VTYPE'
  );
  return { recordset: result.recordset };
}

export async function getProcVoucherList(params: Record<string, any>) { return getVoucherList(params); }

export async function getVoucherDetails(vsrl: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('vsrl', sql.NVarChar, vsrl);
  const result = await req.query(
    'SELECT d.ID, d.VSRL, d.AC, d.DATE, d.DEBT, d.CRED, d.VAC, d.SORT,' +
    '       d.OnAc, d.Lnarration, d.GroupID, d.Srl, d.CurBal,' +
    '       h.HEAD AS AccountHead, h.CODES, h.DESCRIPTION' +
    ' FROM ACDETAILS d' +
    ' LEFT JOIN ACHEAD h ON h.HEAD = d.AC' +
    ' WHERE d.VSRL = @vsrl ORDER BY d.SORT'
  );
  return { recordset: result.recordset };
}

export async function getVoucherMasterDetails(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('vsrl', sql.NVarChar, String(params.vsrl || ''));
  const result = await req.query(
    'SELECT m.ID, m.VSRL, m.BranchID, m.DATE, m.CHQ, m.QDATE, m.VTYPE, m.TRANTYPE,' +
    '       m.DRAWNON, m.NARRATION, m.REFNO, m.YEAR, m.PDC, m.POSTED, m.REMARKS,' +
    '       m.PAYTYPE, m.Checked, m.Entrydate, m.Userid' +
    ' FROM ACMASTER m WHERE m.VSRL = @vsrl'
  );
  return { recordset: result.recordset };
}

export async function writeBulkJournalVoucher(params: Record<string, any>) {
  const pool = await getDbPool();

  // Generate next VSRL from max numeric VSRL (column is nvarchar(10), PK — must be unique)
  const noDigitPattern = '%[^0-9]%';
  const vsrlReq = pool.request();
  vsrlReq.input('pat', sql.NVarChar, noDigitPattern);
  const vsrlRes = await vsrlReq.query(
    'SELECT CAST(ISNULL(MAX(CAST(VSRL AS BIGINT)), 79832) + 1 AS NVARCHAR(10)) AS nextVSRL FROM ACMASTER WHERE VSRL NOT LIKE @pat AND LEN(VSRL) > 0'
  );
  const vsrl = vsrlRes.recordset[0]?.nextVSRL || '79833';

  const userId = params.userId || params.Userid || '';
  const date = params.date ? new Date(params.date) : new Date();
  const narration = (params.narration || params.NARRATION || '').substring(0, 250);
  const refno = (params.reference || params.REFNO || '').substring(0, 15);
  const vtype = (params.vtype || params.VTYPE || 'Journals').substring(0, 10);

  const txn = pool.transaction();
  await txn.begin();
  try {
    const hdr = txn.request();
    hdr.input('vsrl', sql.NVarChar, vsrl);
    hdr.input('date', sql.DateTime, date);
    hdr.input('vtype', sql.NVarChar, vtype);
    hdr.input('narration', sql.NVarChar, narration);
    hdr.input('refno', sql.NVarChar, refno);
    hdr.input('userid', sql.NVarChar, String(userId).substring(0, 50));
    await hdr.query(
      'INSERT INTO ACMASTER (VSRL,DATE,VTYPE,TRANTYPE,NARRATION,REFNO,PDC,POSTED,Userid,Entrydate,Edited)' +
      " VALUES (@vsrl,@date,@vtype,N'',@narration,@refno,0,0,@userid,GETDATE(),0)"
    );

    const lines: any[] = params.lines || [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lr = txn.request();
      lr.input('vsrl', sql.NVarChar, vsrl);
      lr.input('ac', sql.NVarChar, String(line.account || '').substring(0, 10));
      lr.input('date', sql.DateTime, date);
      lr.input('debt', sql.Decimal(18, 2), Number(line.debit || 0));
      lr.input('cred', sql.Decimal(18, 2), Number(line.credit || 0));
      lr.input('sort', sql.Int, i + 1);
      lr.input('lnarration', sql.NVarChar, (line.narration || narration).substring(0, 125));
      await lr.query(
        'INSERT INTO ACDETAILS (VSRL,AC,DATE,DEBT,CRED,VAC,SORT,OnAc,Lnarration,GroupID)' +
        ' VALUES (@vsrl,@ac,@date,@debt,@cred,@ac,@sort,N\'0\',@lnarration,0)'
      );
    }
    await txn.commit();
  } catch (err) {
    await txn.rollback();
    throw err;
  }

  return { success: true, vsrl };
}

export async function writeBulkJournal02(params: Record<string, any>) {
  return writeBulkJournalVoucher({ ...params, vtype: 'Journals' });
}

export async function writeBulkPDCVoucher(params: Record<string, any>) {
  return callProcedure('PDCBulk', params);
}

export async function handleTempMarginReport(params: Record<string, any>) {
  try { return await callProcedure('tempMarginReport', params); } catch { return { recordset: [] }; }
}

function buildDateWhere(params: Record<string, any>, req: any, prefix = 'm.'): string {
  let w = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); w += ` AND ${prefix}DATE >= @fromDate`; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); w += ` AND ${prefix}DATE <= @toDate`; }
  return w;
}

export async function getLedgerReport(params: Record<string, any>) {
  const pool = await getDbPool();
  const page = params.page || 1;
  const limit = params.limit || 200;
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = buildDateWhere(params, req);
  if (params.account) { req.input('account', sql.NVarChar, params.account); where += ' AND d.AC = @account'; }
  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY m.DATE, m.ID) AS rn,' +
    '         m.VSRL, m.DATE, m.VTYPE, m.TRANTYPE, m.NARRATION, m.REFNO, m.CHQ,' +
    '         d.AC, d.DEBT, d.CRED, d.Lnarration,' +
    '         h.DESCRIPTION AS AccountName, h.CORD' +
    '  FROM ACDETAILS d' +
    '  INNER JOIN ACMASTER m ON m.VSRL = d.VSRL' +
    '  LEFT JOIN ACHEAD h ON h.HEAD = d.AC' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getLedgerActualDateReport(params: Record<string, any>) {
  return getLedgerReport(params);
}

export async function getLedgerPdcReport(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  const page = params.page || 1;
  const limit = params.limit || 200;
  const offset = (page - 1) * limit;
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = 'm.PDC = 1';
  if (params.account) { req.input('account', sql.NVarChar, params.account); where += ' AND d.AC = @account'; }
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); where += ' AND m.DATE >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); where += ' AND m.DATE <= @toDate'; }
  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY m.DATE, m.ID) AS rn,' +
    '         m.VSRL, m.DATE, m.VTYPE, m.CHQ, m.QDATE, m.DRAWNON, m.NARRATION,' +
    '         d.AC, d.DEBT, d.CRED, h.DESCRIPTION AS AccountName' +
    '  FROM ACDETAILS d INNER JOIN ACMASTER m ON m.VSRL=d.VSRL' +
    '  LEFT JOIN ACHEAD h ON h.HEAD=d.AC' +
    '  WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getLedgerSummaryReport(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = buildDateWhere(params, req);
  if (params.account) { req.input('account', sql.NVarChar, params.account); where += ' AND d.AC = @account'; }
  const result = await req.query(
    'SELECT d.AC, h.DESCRIPTION AS AccountName, h.CORD, h.[Group],' +
    '       ISNULL(SUM(d.DEBT),0) AS TotalDebit,' +
    '       ISNULL(SUM(d.CRED),0) AS TotalCredit,' +
    '       ISNULL(SUM(d.DEBT),0) - ISNULL(SUM(d.CRED),0) AS NetBalance' +
    ' FROM ACDETAILS d INNER JOIN ACMASTER m ON m.VSRL=d.VSRL' +
    ' LEFT JOIN ACHEAD h ON h.HEAD=d.AC' +
    ' WHERE ' + where +
    ' GROUP BY d.AC, h.DESCRIPTION, h.CORD, h.[Group]' +
    ' ORDER BY h.[Group], d.AC'
  );
  return { recordset: result.recordset };
}

export async function getLedgerSummaryActual(params: Record<string, any>) {
  return getLedgerSummaryReport(params);
}

export async function getLedgerShortReport(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  const page = params.page || 1;
  const limit = params.limit || 100;
  const offset = (page - 1) * limit;
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  let where = buildDateWhere(params, req);
  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY m.DATE DESC) AS rn,' +
    '         m.VSRL, m.DATE, m.VTYPE, m.NARRATION,' +
    '         ISNULL(SUM(d.DEBT),0) AS TotalDebit,' +
    '         ISNULL(SUM(d.CRED),0) AS TotalCredit' +
    '  FROM ACMASTER m LEFT JOIN ACDETAILS d ON d.VSRL=m.VSRL' +
    '  WHERE ' + where +
    '  GROUP BY m.VSRL, m.DATE, m.VTYPE, m.NARRATION, m.ID' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getLedgerAccountsAudit(params: Record<string, any>) {
  return getLedgerReport(params);
}

export async function getGroupLedgerSummary(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  let where = buildDateWhere(params, req);
  const result = await req.query(
    'SELECT h.[Group] AS AccountGroup,' +
    '       ISNULL(SUM(d.DEBT),0) AS TotalDebit,' +
    '       ISNULL(SUM(d.CRED),0) AS TotalCredit,' +
    '       ISNULL(SUM(d.DEBT),0) - ISNULL(SUM(d.CRED),0) AS NetBalance,' +
    '       COUNT(DISTINCT d.AC) AS AccountCount' +
    ' FROM ACDETAILS d INNER JOIN ACMASTER m ON m.VSRL=d.VSRL' +
    ' LEFT JOIN ACHEAD h ON h.HEAD=d.AC' +
    ' WHERE ' + where +
    ' GROUP BY h.[Group] ORDER BY h.[Group]'
  );
  return { recordset: result.recordset };
}

export async function getTrialBalance(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  let dateWhere = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); dateWhere += ' AND m.DATE >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); dateWhere += ' AND m.DATE <= @toDate'; }
  const result = await req.query(
    'SELECT h.HEAD AS AccountCode, h.CODES, h.DESCRIPTION AS AccountName,' +
    '       h.CORD AS DrCr, h.[Group] AS AccountGroup, h.HEADUNDER AS ParentHead,' +
    '       ISNULL(SUM(d.DEBT),0) AS TotalDebit,' +
    '       ISNULL(SUM(d.CRED),0) AS TotalCredit,' +
    '       ISNULL(SUM(d.DEBT),0) - ISNULL(SUM(d.CRED),0) AS NetBalance' +
    ' FROM ACHEAD h' +
    ' LEFT JOIN ACDETAILS d ON d.AC = h.HEAD' +
    ' LEFT JOIN ACMASTER m ON m.VSRL = d.VSRL AND ' + dateWhere +
    ' WHERE ISNULL(h.Hidden,0) = 0' +
    ' GROUP BY h.HEAD, h.CODES, h.DESCRIPTION, h.CORD, h.[Group], h.HEADUNDER, h.Sort' +
    ' ORDER BY h.[Group], h.Sort, h.CODES'
  );
  return { recordset: result.recordset };
}

export async function getTrialBalanceSummary(params: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  let dateWhere = '1=1';
  if (params.fromDate) { req.input('fromDate', sql.DateTime, new Date(params.fromDate)); dateWhere += ' AND m.DATE >= @fromDate'; }
  if (params.toDate) { req.input('toDate', sql.DateTime, new Date(params.toDate)); dateWhere += ' AND m.DATE <= @toDate'; }
  const result = await req.query(
    'SELECT h.[Group] AS AccountGroup, h.CORD AS DrCr,' +
    '       ISNULL(SUM(d.DEBT),0) AS TotalDebit,' +
    '       ISNULL(SUM(d.CRED),0) AS TotalCredit,' +
    '       ISNULL(SUM(d.DEBT),0) - ISNULL(SUM(d.CRED),0) AS NetBalance' +
    ' FROM ACHEAD h' +
    ' LEFT JOIN ACDETAILS d ON d.AC = h.HEAD' +
    ' LEFT JOIN ACMASTER m ON m.VSRL = d.VSRL AND ' + dateWhere +
    ' WHERE ISNULL(h.Hidden,0) = 0' +
    ' GROUP BY h.[Group], h.CORD ORDER BY h.[Group]'
  );
  return { recordset: result.recordset };
}

export async function getTrialBalanceTest(params: Record<string, any>) { return getTrialBalance(params); }
export async function getTrialBalanceTest111(params: Record<string, any>) { return getTrialBalance(params); }

export async function writeAccountAuditLog(_entry: any): Promise<void> {}
