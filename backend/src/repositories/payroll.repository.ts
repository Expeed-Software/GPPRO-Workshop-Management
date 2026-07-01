import { getDbPool } from '../db/connection';
import sql from 'mssql';

// ─── EmployeeDet ─────────────────────────────────────────────────────────────

export async function listEmployeeDet(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page  = Number(filter.page  || 1);
  const limit = Number(filter.limit || 50);
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit',  sql.Int, limit);
  req.input('offset', sql.Int, offset);

  let where = '1=1';
  if (filter.dept) {
    req.input('dept', sql.NVarChar, `%${filter.dept}%`);
    where += ' AND Dept LIKE @dept';
  }
  if (filter.active !== undefined && filter.active !== '') {
    req.input('active', sql.Bit, Number(filter.active));
    where += ' AND Active = @active';
  }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY EmpID) AS rn,' +
    '         EmpID, EmpName, Dept, Desig, DateJoin, DOB, Gender,' +
    '         Phone, Email, BasicSal, Active' +
    '  FROM EmployeeDet WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  const countReq = pool.request();
  if (filter.dept) countReq.input('dept', sql.NVarChar, `%${filter.dept}%`);
  if (filter.active !== undefined && filter.active !== '') countReq.input('active', sql.Bit, Number(filter.active));
  const countResult = await countReq.query(
    'SELECT COUNT(*) AS total FROM EmployeeDet WHERE ' + where
  );
  return {
    recordset: result.recordset,
    total: countResult.recordset[0]?.total || 0,
    page,
    limit,
  };
}

export async function getEmployeeDetById(empId: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('EmpID', sql.NVarChar, empId);
  const result = await req.query(
    'SELECT EmpID, EmpName, Dept, Desig, DateJoin, DOB, Gender,' +
    '       Phone, Email, BasicSal, Active' +
    ' FROM EmployeeDet WHERE EmpID = @EmpID'
  );
  return { recordset: result.recordset };
}

export async function insertEmployeeDet(body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('EmpID',    sql.NVarChar, body.EmpID    || '');
  req.input('EmpName',  sql.NVarChar, body.EmpName  || '');
  req.input('Dept',     sql.NVarChar, body.Dept     || '');
  req.input('Desig',    sql.NVarChar, body.Desig    || '');
  req.input('DateJoin', sql.DateTime, body.DateJoin ? new Date(body.DateJoin) : null);
  req.input('DOB',      sql.DateTime, body.DOB      ? new Date(body.DOB)      : null);
  req.input('Gender',   sql.NVarChar, body.Gender   || '');
  req.input('Phone',    sql.NVarChar, body.Phone    || '');
  req.input('Email',    sql.NVarChar, body.Email    || '');
  req.input('BasicSal', sql.Float,    Number(body.BasicSal) || 0);
  req.input('Active',   sql.Bit,      1);

  await req.query(
    'INSERT INTO EmployeeDet (EmpID, EmpName, Dept, Desig, DateJoin, DOB, Gender, Phone, Email, BasicSal, Active)' +
    ' VALUES (@EmpID, @EmpName, @Dept, @Desig, @DateJoin, @DOB, @Gender, @Phone, @Email, @BasicSal, @Active)'
  );
  return { success: true };
}

export async function updateEmployeeDet(empId: string, body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('EmpID',    sql.NVarChar, empId);
  req.input('EmpName',  sql.NVarChar, body.EmpName  || '');
  req.input('Dept',     sql.NVarChar, body.Dept     || '');
  req.input('Desig',    sql.NVarChar, body.Desig    || '');
  req.input('DateJoin', sql.DateTime, body.DateJoin ? new Date(body.DateJoin) : null);
  req.input('DOB',      sql.DateTime, body.DOB      ? new Date(body.DOB)      : null);
  req.input('Gender',   sql.NVarChar, body.Gender   || '');
  req.input('Phone',    sql.NVarChar, body.Phone    || '');
  req.input('Email',    sql.NVarChar, body.Email    || '');
  req.input('BasicSal', sql.Float,    Number(body.BasicSal) || 0);

  await req.query(
    'UPDATE EmployeeDet SET EmpName=@EmpName, Dept=@Dept, Desig=@Desig,' +
    '  DateJoin=@DateJoin, DOB=@DOB, Gender=@Gender,' +
    '  Phone=@Phone, Email=@Email, BasicSal=@BasicSal' +
    ' WHERE EmpID=@EmpID'
  );
  return { success: true };
}

export async function deactivateEmployeeDet(empId: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('EmpID', sql.NVarChar, empId);
  await req.query('UPDATE EmployeeDet SET Active=0 WHERE EmpID=@EmpID');
  return { success: true };
}

// ─── Salary01 ────────────────────────────────────────────────────────────────
// Exact column names as specified (note: DB uses mixed case as given)

export async function getSalary(empId: string, month: string, year: string) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('empId', sql.NVarChar, empId);
  req.input('Month', sql.Int,      Number(month));
  req.input('Year',  sql.Int,      Number(year));
  const result = await req.query(
    'SELECT empId, Month, Year, Basic, DA, Hra, Food, Petrol, Washing, OthAllowance,' +
    '       Ot, incentives, Atten, days, Absent, Leave, ReguHoliday, OthHoliday,' +
    '       advance, OthDeduction, TotEarning, TotalDeduction, NetSalary, MonthSal, Hship' +
    ' FROM Salary01 WHERE empId=@empId AND Month=@Month AND Year=@Year'
  );
  return { recordset: result.recordset };
}

export async function upsertSalary(body: Record<string, any>) {
  const pool = await getDbPool();

  // Delete existing row first (legacy SalaryFrm pattern — delete then insert)
  const delReq = pool.request();
  delReq.input('empId', sql.NVarChar, body.empId || '');
  delReq.input('Month', sql.Int,      Number(body.Month) || 0);
  delReq.input('Year',  sql.Int,      Number(body.Year)  || 0);
  await delReq.query('DELETE FROM Salary01 WHERE empId=@empId AND Month=@Month AND Year=@Year');

  const req = pool.request();
  req.input('empId',          sql.NVarChar, body.empId          || '');
  req.input('Month',          sql.Int,      Number(body.Month)          || 0);
  req.input('Year',           sql.Int,      Number(body.Year)           || 0);
  req.input('Basic',          sql.Float,    Number(body.Basic)          || 0);
  req.input('DA',             sql.Float,    Number(body.DA)             || 0);
  req.input('Hra',            sql.Float,    Number(body.Hra)            || 0);
  req.input('Food',           sql.Float,    Number(body.Food)           || 0);
  req.input('Petrol',         sql.Float,    Number(body.Petrol)         || 0);
  req.input('Washing',        sql.Float,    Number(body.Washing)        || 0);
  req.input('OthAllowance',   sql.Float,    Number(body.OthAllowance)   || 0);
  req.input('Ot',             sql.Float,    Number(body.Ot)             || 0);
  req.input('incentives',     sql.Float,    Number(body.incentives)     || 0);
  req.input('Atten',          sql.Float,    Number(body.Atten)          || 0);
  req.input('days',           sql.Int,      Number(body.days)           || 0);
  req.input('Absent',         sql.Int,      Number(body.Absent)         || 0);
  req.input('Leave',          sql.Int,      Number(body.Leave)          || 0);
  req.input('ReguHoliday',    sql.Int,      Number(body.ReguHoliday)    || 0);
  req.input('OthHoliday',     sql.Int,      Number(body.OthHoliday)     || 0);
  req.input('advance',        sql.Float,    Number(body.advance)        || 0);
  req.input('OthDeduction',   sql.Float,    Number(body.OthDeduction)   || 0);
  req.input('TotEarning',     sql.Float,    Number(body.TotEarning)     || 0);
  req.input('TotalDeduction', sql.Float,    Number(body.TotalDeduction) || 0);
  req.input('NetSalary',      sql.Float,    Number(body.NetSalary)      || 0);
  req.input('MonthSal',       sql.Float,    Number(body.MonthSal)       || 0);
  req.input('Hship',          sql.Float,    Number(body.Hship)          || 0);

  await req.query(
    'INSERT INTO Salary01' +
    ' (empId, Month, Year, Basic, DA, Hra, Food, Petrol, Washing, OthAllowance,' +
    '  Ot, incentives, Atten, days, Absent, Leave, ReguHoliday, OthHoliday,' +
    '  advance, OthDeduction, TotEarning, TotalDeduction, NetSalary, MonthSal, Hship)' +
    ' VALUES' +
    ' (@empId, @Month, @Year, @Basic, @DA, @Hra, @Food, @Petrol, @Washing, @OthAllowance,' +
    '  @Ot, @incentives, @Atten, @days, @Absent, @Leave, @ReguHoliday, @OthHoliday,' +
    '  @advance, @OthDeduction, @TotEarning, @TotalDeduction, @NetSalary, @MonthSal, @Hship)'
  );
  return { success: true };
}

// ─── Clocking (jobInProgress) ─────────────────────────────────────────────────

export async function listClocking(filter: Record<string, any>) {
  const pool = await getDbPool();
  const page  = Number(filter.page  || 1);
  const limit = Number(filter.limit || 50);
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit',  sql.Int, limit);
  req.input('offset', sql.Int, offset);

  let where = '1=1';
  if (filter.EmpID) {
    req.input('EmpID', sql.NVarChar, filter.EmpID);
    where += ' AND j.EmpID = @EmpID';
  }
  if (filter.Ordr) {
    req.input('Ordr', sql.NVarChar, filter.Ordr);
    where += ' AND j.Ordr = @Ordr';
  }
  if (filter.dateFrom) {
    req.input('dateFrom', sql.DateTime, new Date(filter.dateFrom));
    where += ' AND j.Date >= @dateFrom';
  }
  if (filter.dateTo) {
    req.input('dateTo', sql.DateTime, new Date(filter.dateTo));
    where += ' AND j.Date <= @dateTo';
  }

  const result = await req.query(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY j.ID DESC) AS rn,' +
    '         j.ID, j.Ordr, j.Date, j.SectionID, j.EmpID, j.StatusID,' +
    '         j.Remarks, j.UserID, j.CreatedDt, j.LastRecord' +
    '  FROM jobInProgress j WHERE ' + where +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
  );
  return { recordset: result.recordset, page, limit };
}

export async function insertClocking(body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('Ordr',      sql.NVarChar, body.Ordr      || '');
  req.input('Date',      sql.DateTime, body.Date ? new Date(body.Date) : new Date());
  req.input('SectionID', sql.NVarChar, body.SectionID || '');
  req.input('EmpID',     sql.NVarChar, body.EmpID     || '');
  req.input('StatusID',  sql.Int,      Number(body.StatusID) || 1);
  req.input('Remarks',   sql.NVarChar, body.Remarks   || '');
  req.input('PRefID',    sql.Int,      Number(body.PRefID)   || 0);
  req.input('UserID',    sql.NVarChar, body.UserID    || '');

  const result = await req.query(
    'INSERT INTO jobInProgress (Ordr, Date, SectionID, EmpID, StatusID, Remarks, PRefID, UserID, CreatedDt, LastRecord)' +
    ' OUTPUT INSERTED.ID' +
    ' VALUES (@Ordr, @Date, @SectionID, @EmpID, @StatusID, @Remarks, @PRefID, @UserID, GETDATE(), 1)'
  );
  return { recordset: result.recordset };
}

export async function updateClocking(id: string, body: Record<string, any>) {
  const pool = await getDbPool();
  const req = pool.request();
  req.input('id',       sql.Int,      parseInt(id, 10));
  req.input('StatusID', sql.Int,      Number(body.StatusID) || 2);
  req.input('Remarks',  sql.NVarChar, body.Remarks  || '');
  req.input('UserID',   sql.NVarChar, body.UserID   || '');

  await req.query(
    'UPDATE jobInProgress SET StatusID=@StatusID, Remarks=@Remarks,' +
    '  EditedBy=@UserID, EditedDt=GETDATE() WHERE ID=@id'
  );
  return { success: true };
}
