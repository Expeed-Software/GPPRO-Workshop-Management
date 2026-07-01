import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

// Real USERS table: Sl (int PK), User (nvarchar), Pw (nvarchar), Option (nvarchar), Disable (nvarchar)
// Option=1 => Admin/Supervisor, Option=0 => Standard User
// UserLog: SLNo, UserId (int), UserName, MachineName, IpAdresses, ActionDate, ActionName, Remarks, ordr
// loginDetails: ID, SessionID, UserID (nvarchar), LoginDate, LogoutDate, CompName, Area

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  name: string;
  roles: string[];
  status: 'active' | 'inactive' | 'locked';
  failedLoginAttempts: number;
}

export interface EmployeeRecord {
  id: number | string;
  staffId: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  section?: string;
  role?: string;
  status: string;
}

export interface UserLogEntry {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  timestamp: Date;
  ip?: string;
  status: string;
  remarks?: string;
}

export interface RolePermission {
  role: string;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

function mapRole(option: any): string[] {
  const opt = parseInt(String(option || '0'), 10);
  return opt >= 1 ? ['Administrator', 'Supervisor'] : ['Standard User'];
}

function mapUserRow(row: any): UserRecord {
  return {
    id: row.id,
    username: row.username || '',
    email: row.email || row.username || '',
    name: row.name || row.username || '',
    roles: mapRole(row.option),
    status: row.disabled ? 'inactive' : 'active',
    failedLoginAttempts: 0,
  };
}

export class UsersManagementRepository {
  async getUserList(filters: { name?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<{ data: UserRecord[]; total: number }> {
    const pool = await getDbPool();
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const req = pool.request();
    req.input('limit', sql.Int, limit);
    req.input('offset', sql.Int, offset);
    let where = '1=1';
    if (filters.name) { req.input('name', sql.NVarChar, '%' + filters.name + '%'); where += ' AND [User] LIKE @name'; }
    if (filters.status === 'inactive') where += ' AND Disable IS NOT NULL AND Disable <> N' + "''";
    else if (filters.status === 'active') where += " AND (Disable IS NULL OR Disable = N'')";

    const result = await req.query(
      'SELECT * FROM (' +
      '  SELECT ROW_NUMBER() OVER (ORDER BY Sl) AS rn,' +
      '         Sl AS id, [User] AS username, [User] AS email, [User] AS name,' +
      '         [Option] AS [option], Disable AS disabled' +
      '  FROM USERS WHERE ' + where +
      ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
    );
    const countReq = pool.request();
    if (filters.name) countReq.input('name', sql.NVarChar, '%' + filters.name + '%');
    const countResult = await countReq.query('SELECT COUNT(*) AS total FROM USERS WHERE ' + where);
    const data = result.recordset.map(mapUserRow);
    const filtered = filters.role ? data.filter(u => u.roles.includes(filters.role!)) : data;
    return { data: filtered, total: countResult.recordset[0]?.total || 0 };
  }

  async getUserById(id: number): Promise<UserRecord | null> {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('id', sql.Int, id);
    const result = await req.query('SELECT Sl AS id, [User] AS username, [User] AS email, [User] AS name, [Option] AS [option], Disable AS disabled FROM USERS WHERE Sl = @id');
    if (!result.recordset.length) return null;
    return mapUserRow(result.recordset[0]);
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('username', sql.NVarChar, email);
    const result = await req.query('SELECT Sl AS id FROM USERS WHERE [User] = @username');
    if (!result.recordset.length) return null;
    return this.getUserById(result.recordset[0].id);
  }

  async insertUser(data: { username: string; email: string; name: string; passwordHash: string; roles: string[]; status: string; createdBy: string; mustChangePassword?: boolean }): Promise<number> {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('username', sql.NVarChar, data.username);
    req.input('pw', sql.NVarChar, data.passwordHash);
    const optionVal = data.roles.some(r => r === 'Administrator' || r === 'Supervisor') ? '1' : '0';
    req.input('option', sql.NVarChar, optionVal);
    req.input('disable', sql.NVarChar, data.status === 'inactive' ? 'Y' : '');
    const result = await req.query("INSERT INTO USERS ([User], Pw, [Option], Disable) VALUES (@username, @pw, @option, @disable); SELECT SCOPE_IDENTITY() AS id");
    return result.recordset[0]?.id || 0;
  }

  async updateUser(id: number, data: { name?: string; email?: string; roles?: string[]; status?: string; updatedBy: string }): Promise<void> {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('id', sql.Int, id);
    const sets: string[] = [];
    if (data.name !== undefined) { req.input('name', sql.NVarChar, data.name); sets.push('[User] = @name'); }
    if (data.roles !== undefined) {
      const optionVal = data.roles.some(r => r === 'Administrator' || r === 'Supervisor') ? '1' : '0';
      req.input('option', sql.NVarChar, optionVal); sets.push('[Option] = @option');
    }
    if (data.status !== undefined) {
      req.input('disable', sql.NVarChar, data.status === 'inactive' ? 'Y' : ''); sets.push('Disable = @disable');
    }
    if (sets.length > 0) await req.query('UPDATE USERS SET ' + sets.join(', ') + ' WHERE Sl = @id');
  }

  async setUserStatus(id: number, status: 'active' | 'inactive' | 'locked', _updatedBy: string): Promise<void> {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('id', sql.Int, id);
    req.input('disable', sql.NVarChar, status === 'inactive' || status === 'locked' ? 'Y' : '');
    await req.query('UPDATE USERS SET Disable = @disable WHERE Sl = @id');
  }

  async bulkSetStatus(userIds: number[], status: string, updatedBy: string): Promise<void> {
    for (const id of userIds) { await this.setUserStatus(id, status as any, updatedBy); }
  }

  async getUserLog(filters: { userId?: number; fromDate?: string; toDate?: string; type?: string; page?: number; limit?: number }): Promise<{ data: UserLogEntry[]; total: number }> {
    const pool = await getDbPool();
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;
    const req = pool.request();
    req.input('limit', sql.Int, limit);
    req.input('offset', sql.Int, offset);
    let where = '1=1';
    if (filters.userId) { req.input('userId', sql.Int, filters.userId); where += ' AND UserId = @userId'; }
    if (filters.fromDate) { req.input('fromDate', sql.DateTime, new Date(filters.fromDate)); where += ' AND ActionDate >= @fromDate'; }
    if (filters.toDate) { req.input('toDate', sql.DateTime, new Date(filters.toDate)); where += ' AND ActionDate <= @toDate'; }
    if (filters.type) { req.input('type', sql.VarChar, filters.type); where += ' AND ActionName = @type'; }

    const result = await req.query(
      'SELECT * FROM (' +
      '  SELECT ROW_NUMBER() OVER (ORDER BY ActionDate DESC) AS rn,' +
      '         SLNo AS id, UserId AS userId, UserName AS userName, ActionName AS action,' +
      '         ActionDate AS timestamp, IpAdresses AS ip, Remarks AS remarks' +
      '  FROM UserLog WHERE ' + where +
      ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
    );

    const countReq = pool.request();
    if (filters.userId) countReq.input('userId', sql.Int, filters.userId);
    const countResult = await countReq.query('SELECT COUNT(*) AS total FROM UserLog WHERE ' + (filters.userId ? 'UserId = @userId' : '1=1'));

    return {
      data: result.recordset.map((r: any) => ({ ...r, status: 'success' })),
      total: countResult.recordset[0]?.total || 0,
    };
  }

  async getEmployeeList(filters: { dept?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<{ data: EmployeeRecord[]; total: number }> {
    const pool = await getDbPool();
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const req = pool.request();
    req.input('limit', sql.Int, limit);
    req.input('offset', sql.Int, offset);
    const result = await req.query(
      'SELECT * FROM (' +
      '  SELECT ROW_NUMBER() OVER (ORDER BY Ocode) AS rn,' +
      '         Ocode AS staffId, Description AS name, Type AS role,' +
      '         ccode, Active' +
      '  FROM Omasters WHERE Active = 1' +
      ') t WHERE rn > @offset AND rn <= (@offset + @limit)'
    );
    const countResult = await pool.request().query('SELECT COUNT(*) AS total FROM Omasters WHERE Active = 1');
    return {
      data: result.recordset.map((r: any) => ({
        id: r.staffId, staffId: r.staffId, name: r.name,
        role: r.role, status: 'active',
      })),
      total: countResult.recordset[0]?.total || 0,
    };
  }

  async getEmployeeById(id: number): Promise<EmployeeRecord | null> {
    try {
      const pool = await getDbPool();
      const req = pool.request();
      req.input('id', sql.NVarChar, String(id));
      const result = await req.query('SELECT Ocode AS staffId, Description AS name, Type AS role FROM Omasters WHERE Ocode = @id');
      if (!result.recordset.length) return null;
      const r = result.recordset[0];
      return { id: r.staffId, staffId: r.staffId, name: r.name, role: r.role, status: 'active' };
    } catch { return null; }
  }

  async getRolePermissions(): Promise<RolePermission[]> {
    const roles = ['Administrator', 'Supervisor', 'Standard User'];
    const modules = ['Users', 'Customers', 'Sales', 'Purchase', 'Inventory', 'Banking', 'Accounts', 'Reports', 'Audit'];
    const matrix: RolePermission[] = [];
    for (const role of roles) {
      for (const module of modules) {
        matrix.push({
          role, module,
          canView: true,
          canCreate: role !== 'Standard User',
          canEdit: role !== 'Standard User',
          canDelete: role === 'Administrator',
          canExport: role !== 'Standard User',
        });
      }
    }
    return matrix;
  }

  async assignUserRoles(userId: number, roles: string[], _assignedBy: string): Promise<void> {
    const optionVal = roles.some(r => r === 'Administrator' || r === 'Supervisor') ? '1' : '0';
    const pool = await getDbPool();
    const req = pool.request();
    req.input('id', sql.Int, userId);
    req.input('option', sql.NVarChar, optionVal);
    await req.query('UPDATE USERS SET [Option] = @option WHERE Sl = @id');
  }

  async writeAuditLog(entry: { userId: number; action: string; ip?: string; status: string; remarks?: string }): Promise<void> {
    try {
      const pool = await getDbPool();
      const req = pool.request();
      req.input('UserId', sql.Int, entry.userId);
      req.input('ActionName', sql.VarChar, entry.action.substring(0, 50));
      req.input('IpAdresses', sql.VarChar, entry.ip || '');
      req.input('Remarks', sql.VarChar, (entry.remarks || '').substring(0, 200));
      await req.query('INSERT INTO UserLog (UserId, ActionDate, ActionName, IpAdresses, Remarks) VALUES (@UserId, GETDATE(), @ActionName, @IpAdresses, @Remarks)');
    } catch {}
  }
}

export const usersManagementRepository = new UsersManagementRepository();
