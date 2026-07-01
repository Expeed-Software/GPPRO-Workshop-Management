import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

// Real tables: SalesOrdr01, jobInProgress, Estimation01, salesOrdrStatusHead, salesOrdrStatusDtl
// SQL Server 2008 — ROW_NUMBER() pagination only

export async function getEstimationDetails(jobCardNo: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('jobCard', sql.NVarChar, jobCardNo);

  const headerResult = await req.query(
    'SELECT e.ID, e.Yr, e.ccode, e.EstimationNo, e.BillDt, e.CustomerId,' +
    '       e.VehicleId, e.StaffId, e.Addition, e.Less, e.Remarks, e.Total,' +
    '       e.totlabour, e.nett, e.JObCardNo, e.User, e.jobCard,' +
    '       c.custname AS CustomerName' +
    ' FROM Estimation01 e' +
    ' LEFT JOIN Customer c ON c.CustId = e.CustomerId' +
    ' WHERE e.JObCardNo = @jobCard OR e.jobCard = @jobCard'
  );

  const header = headerResult.recordset?.[0] ?? null;
  if (!header) return { recordset: [] };

  const req2 = pool.request();
  req2.input('estId', sql.Int, header.ID);
  const linesResult = await req2.query(
    'SELECT ID, Description, Qty, UnitPrice, LabourAmt' +
    ' FROM Estimation02 WHERE ID = @estId ORDER BY Srl'
  );

  header.items = linesResult.recordset || [];
  return { recordset: [header] };
}

export async function listEstimations(filter: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();

  const page   = Math.max(1, parseInt(filter.page  ?? '1',  10));
  const limit  = Math.min(100, Math.max(1, parseInt(filter.limit ?? '50', 10)));
  const offset = (page - 1) * limit;

  let where = '1=1';
  if (filter.EstimationNo) { req.input('EstimationNo', sql.NVarChar, `%${filter.EstimationNo}%`); where += ' AND e.EstimationNo LIKE @EstimationNo'; }
  if (filter.JObCardNo)    { req.input('JObCardNo',    sql.NVarChar, `%${filter.JObCardNo}%`);    where += ' AND e.JObCardNo LIKE @JObCardNo'; }
  if (filter.CustomerName) { req.input('CustomerName', sql.NVarChar, `%${filter.CustomerName}%`); where += ' AND c.custname LIKE @CustomerName'; }
  if (filter.StaffId)      { req.input('StaffId',      sql.NVarChar, filter.StaffId);             where += ' AND e.StaffId = @StaffId'; }
  if (filter.dateFrom)     { req.input('dateFrom',     sql.Date,     new Date(filter.dateFrom));   where += ' AND e.BillDt >= @dateFrom'; }
  if (filter.dateTo)       { req.input('dateTo',       sql.Date,     new Date(filter.dateTo));     where += ' AND e.BillDt <= @dateTo'; }

  req.input('offset', sql.Int, offset);
  req.input('limit',  sql.Int, limit);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY e.BillDt DESC, e.ID DESC) AS rn,' +
    '         e.ID, e.EstimationNo, e.BillDt, e.JObCardNo, e.CustomerId,' +
    '         e.VehicleId, e.StaffId, e.Total, e.nett,' +
    '         c.custname AS CustomerName' +
    '  FROM Estimation01 e' +
    '  LEFT JOIN Customer c ON c.CustId = e.CustomerId' +
    '  WHERE ' + where +
    ') AS paged' +
    ' WHERE rn > @offset AND rn <= (@offset + @limit)' +
    ' ORDER BY rn'
  );

  const countReq = pool.request();
  if (filter.EstimationNo) { countReq.input('EstimationNo', sql.NVarChar, `%${filter.EstimationNo}%`); }
  if (filter.JObCardNo)    { countReq.input('JObCardNo',    sql.NVarChar, `%${filter.JObCardNo}%`); }
  if (filter.CustomerName) { countReq.input('CustomerName', sql.NVarChar, `%${filter.CustomerName}%`); }
  if (filter.StaffId)      { countReq.input('StaffId',      sql.NVarChar, filter.StaffId); }
  if (filter.dateFrom)     { countReq.input('dateFrom',     sql.Date,     new Date(filter.dateFrom)); }
  if (filter.dateTo)       { countReq.input('dateTo',       sql.Date,     new Date(filter.dateTo)); }

  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total' +
    ' FROM Estimation01 e' +
    ' LEFT JOIN Customer c ON c.CustId = e.CustomerId' +
    ' WHERE ' + where
  );

  const total = countResult.recordset?.[0]?.total ?? 0;
  return { recordset: result.recordset || [], total, page, limit };
}

export async function insertEstimation(body: Record<string, any>) {
  return callProcedure('spInsertEstimation01', body);
}

export async function updateEstimation(id: string, body: Record<string, any>) {
  return callProcedure('spUpdateEstimation01', { id, ...body });
}

export async function submitEstimation(id: string) {
  return callProcedure('spSubmitEstimation01', { id });
}

export async function approveEstimation(id: string, action: string, comment: string, assignTo?: string) {
  return callProcedure('spApproveEstimation01', { id, action, comment, assignTo });
}

export async function getEstimationAuditLog(id: string) {
  try { return await callProcedure('spEstimationAuditLog', { id }); } catch { return { recordset: [] }; }
}

export async function insertJobWorkOrder(body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, body.Ordr || '');
  req.input('Date', sql.DateTime, body.Date ? new Date(body.Date) : new Date());
  req.input('SectionID', sql.NVarChar, body.SectionID || '');
  req.input('EmpID', sql.NVarChar, body.EmpID || '');
  req.input('StatusID', sql.Int, body.StatusID || 1);
  req.input('Remarks', sql.NVarChar, body.Remarks || '');
  req.input('PRefID', sql.Int, body.PRefID || 0);
  req.input('UserID', sql.NVarChar, body.UserID || '');
  await req.query(
    'INSERT INTO jobInProgress (Ordr, Date, SectionID, EmpID, StatusID, Remarks, PRefID, UserID, CreatedDt, LastRecord)' +
    ' VALUES (@Ordr, @Date, @SectionID, @EmpID, @StatusID, @Remarks, @PRefID, @UserID, GETDATE(), 1)'
  );
  return { success: true };
}

export async function updateJobWorkOrder(id: string, body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(id));
  req.input('StatusID', sql.Int, body.StatusID || 1);
  req.input('Remarks', sql.NVarChar, body.Remarks || '');
  req.input('EmpID', sql.NVarChar, body.EmpID || '');
  req.input('EditedBy', sql.NVarChar, body.EditedBy || '');
  await req.query(
    'UPDATE jobInProgress SET StatusID=@StatusID, Remarks=@Remarks, EmpID=@EmpID,' +
    ' EditedBy=@EditedBy, EditedDt=GETDATE() WHERE ID=@id'
  );
  return { success: true };
}

export async function assignJobToStaff(jobId: string, staffId: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, jobId);
  req.input('staffid', sql.NVarChar, staffId);
  await req.query('UPDATE SalesOrdr01 SET staffid=@staffid WHERE Ordr=@Ordr');
  return { success: true };
}

export async function updateJobStatus(jobId: string, status: string, _userId: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, jobId);
  req.input('StatusId', sql.Int, parseInt(status) || 0);
  await req.query('UPDATE SalesOrdr01 SET StatusId=@StatusId WHERE Ordr=@Ordr');
  return { success: true };
}

export async function completeJobWithSignoff(jobId: string, _signature: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, jobId);
  await req.query('UPDATE SalesOrdr01 SET CLOSED=1, CompletionDate=GETDATE() WHERE Ordr=@Ordr');
  return { success: true };
}

export async function updateJobProgress(jobId: string, _progress: number, note: string, _userId: number) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, jobId);
  req.input('note', sql.NVarChar, note);
  await req.query('UPDATE SalesOrdr01 SET TechNote=@note WHERE Ordr=@Ordr');
  return { success: true };
}

export async function getJobStatusHistory(jobId: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr', sql.NVarChar, jobId);
  const result = await req.query(
    'SELECT d.DtlId, d.Ordr, d.StatusDate, d.StatusId,' +
    '       h.Description AS StatusDescription, h.ForeColour, h.BackColour' +
    ' FROM salesOrdrStatusDtl d' +
    ' LEFT JOIN salesOrdrStatusHead h ON h.StatusID = d.StatusId' +
    ' WHERE d.Ordr = @Ordr ORDER BY d.StatusDate DESC'
  );
  return { recordset: result.recordset };
}

// Uses spGetWorkStatus (DB-Preserve): the base "open job" set is defined by the SP as
// Ordr NOT IN Sales01 AND Closed=0 AND Delivered=0 — not just CLOSED=0. The SP takes no
// parameters, so date/advisor/status narrowing and pagination are applied here, in-memory,
// on top of the SP's authoritative result set.
export async function getWorkStatus(filter: Record<string, any>) {
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const offset = (page - 1) * limit;

  const result = await callProcedure('spGetWorkStatus');
  let rows = result.recordset as any[];

  if (filter.dateFrom) { const d = new Date(filter.dateFrom); rows = rows.filter((r) => r.ordt && new Date(r.ordt) >= d); }
  if (filter.dateTo)   { const d = new Date(filter.dateTo);   rows = rows.filter((r) => r.ordt && new Date(r.ordt) <= d); }
  if (filter.advisor)  { const adv = String(filter.advisor).toLowerCase(); rows = rows.filter((r) => (r.StaffName || '').toLowerCase() === adv); }
  if (filter.status)   { const st = String(filter.status).toLowerCase();  rows = rows.filter((r) => (r.Status || '').toLowerCase().includes(st)); }

  const total = rows.length;
  return { recordset: rows.slice(offset, offset + limit), page, limit, total };
}

export async function getRunningJobs(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const offset = (page - 1) * limit;

  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY j.CreatedDt DESC) AS rn,' +
    '         j.ID, j.Ordr, j.Date, j.SectionID, j.EmpID, j.StatusID,' +
    '         j.Remarks, j.UserID, j.CreatedDt,' +
    '         o.CustId, o.VehId, o.Total, o.Nett,' +
    '         c.custname AS CustomerName,' +
    '         s.Description AS StatusDescription' +
    '  FROM jobInProgress j' +
    '  LEFT JOIN SalesOrdr01 o ON o.Ordr = j.Ordr' +
    '  LEFT JOIN Customer c ON c.CustId = o.CustId' +
    '  LEFT JOIN salesOrdrStatusHead s ON s.StatusID = j.StatusID' +
    '  WHERE j.LastRecord = 1' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getCompletedJobs(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const offset = (page - 1) * limit;

  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY o.CompletionDate DESC) AS rn,' +
    '         o.ID, o.Ordr, o.Ordt, o.CustId, o.VehId, o.staffid,' +
    '         o.Total, o.Nett, o.CompletionDate, o.StatusId,' +
    '         c.custname AS CustomerName' +
    '  FROM SalesOrdr01 o' +
    '  LEFT JOIN Customer c ON c.CustId = o.CustId' +
    '  WHERE o.CLOSED = 1' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function getPartsNotAvailableJobs(filter: Record<string, any>) {
  try { return await callProcedure('spPartsNotAvailJobs', filter); } catch { return { recordset: [] }; }
}

export async function getWorkStatusOverview() {
  const pool = await getDbPool();
  const result = await pool.request().query(
    'SELECT s.StatusID, s.Description, s.ForeColour, s.BackColour,' +
    '       COUNT(o.ID) AS JobCount' +
    ' FROM salesOrdrStatusHead s' +
    ' LEFT JOIN SalesOrdr01 o ON o.StatusId = s.StatusID AND o.CLOSED = 0' +
    ' GROUP BY s.StatusID, s.Description, s.ForeColour, s.BackColour' +
    ' ORDER BY s.SortOrder'
  );
  return { recordset: result.recordset };
}

export async function getJobStatusMaster() {
  const pool = await getDbPool();
  const result = await pool.request().query(
    'SELECT StatusID, Description, FinishedStatusYN, PartsNotAvailYN,' +
    '       INProgressYN, ForeColour, BackColour, AssignedYN, ApprovedYN, SortOrder' +
    ' FROM salesOrdrStatusHead ORDER BY SortOrder'
  );
  return { recordset: result.recordset };
}

export async function insertJobStatusMaster(body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Description', sql.VarChar, body.Description || '');
  req.input('ForeColour', sql.VarChar, body.ForeColour || '#000000');
  req.input('BackColour', sql.VarChar, body.BackColour || '#ffffff');
  req.input('SortOrder', sql.Int, body.SortOrder || 0);
  await req.query(
    'INSERT INTO salesOrdrStatusHead (Description, ForeColour, BackColour, SortOrder,' +
    ' FinishedStatusYN, PartsNotAvailYN, INProgressYN, AssignedYN, ApprovedYN)' +
    ' VALUES (@Description, @ForeColour, @BackColour, @SortOrder, 0, 0, 0, 0, 0)'
  );
  return { success: true };
}

export async function updateJobStatusMaster(id: string, body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id', sql.Int, parseInt(id));
  req.input('Description', sql.VarChar, body.Description || '');
  req.input('ForeColour', sql.VarChar, body.ForeColour || '#000000');
  req.input('BackColour', sql.VarChar, body.BackColour || '#ffffff');
  req.input('SortOrder', sql.Int, body.SortOrder || 0);
  await req.query(
    'UPDATE salesOrdrStatusHead SET Description=@Description, ForeColour=@ForeColour,' +
    ' BackColour=@BackColour, SortOrder=@SortOrder WHERE StatusID=@id'
  );
  return { success: true };
}

export async function writeJobAuditLog(_entry: any): Promise<void> {}
export async function getJobAuditLogs(_jobId: string) { return { recordset: [] }; }
