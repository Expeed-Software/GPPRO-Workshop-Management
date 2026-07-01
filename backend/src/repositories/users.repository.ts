import { getDbPool } from '../db/connection';
import { User, UserLog } from '../types/User';
import logger from '../utils/logger';
import sql from 'mssql';

/**
 * Users repository — maps the legacy USERS table schema.
 * Actual columns: Sl (id), [User] (username), Pw (plain-text password),
 * [Option] (0=Standard, 1=Administrator/Supervisor), Disable (0=active, 1=disabled).
 * Passwords are plain-text in this legacy DB; bcrypt NOT used for verify.
 */
export class UsersRepository {
  async findByIdentifier(identifier: string): Promise<User | null> {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('identifier', sql.NVarChar, identifier);
    const result = await req.query(
      `SELECT TOP 1 Sl as id, [User] as username, Pw as passwordHash,
              [Option] as roleOption, Disable as disabled, Createdby as createdBy
       FROM USERS
       WHERE [User] = @identifier`
    );
    if (!result.recordset.length) return null;
    return this.mapRow(result.recordset[0]);
  }

  async findById(id: number): Promise<User | null> {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('id', sql.Int, id);
    const result = await req.query(
      `SELECT TOP 1 Sl as id, [User] as username, Pw as passwordHash,
              [Option] as roleOption, Disable as disabled, Createdby as createdBy
       FROM USERS
       WHERE Sl = @id`
    );
    if (!result.recordset.length) return null;
    return this.mapRow(result.recordset[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    // No email column in legacy table — treat email as username lookup
    return this.findByIdentifier(email);
  }

  async updateFailedLogins(_userId: number, _count: number): Promise<void> {
    // No FailedLogins column in legacy table — no-op
  }

  async lockUser(_userId: number): Promise<void> {
    // No Status column — no-op (Disable column could be used but we avoid mutations)
  }

  async unlockUser(_userId: number): Promise<void> {
    // No-op for legacy table
  }

  async updateLastLogin(_userId: number): Promise<void> {
    // No LastLoginAt column in legacy table — no-op
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const pool = await getDbPool();
    const req = pool.request();
    req.input('userId', sql.Int, userId);
    req.input('pw', sql.NVarChar, newPassword);
    await req.query(`UPDATE USERS SET Pw = @pw WHERE Sl = @userId`);
  }

  async writeUserLog(entry: Omit<UserLog, 'id'>): Promise<void> {
    try {
      const pool = await getDbPool();
      const req = pool.request();
      req.input('userId', sql.NVarChar, String(entry.userId));
      req.input('action', sql.NVarChar, entry.action);
      req.input('loginDate', sql.DateTime, new Date());
      await req.query(
        `INSERT INTO loginDetails (UserID, LoginDate, CompName, Area)
         VALUES (@userId, @loginDate, 'WEB', @action)`
      );
    } catch (err) {
      logger.error({ err }, 'Failed to write user log');
    }
  }

  async getUserLogs(_filters: any): Promise<{ data: UserLog[]; total: number }> {
    try {
      const pool = await getDbPool();
      const result = await pool.request().query(
        `SELECT TOP 100 ID as id, UserID as userId, LoginDate as timestamp,
                CompName as ip, Area as action, '' as status, '' as remarks
         FROM loginDetails ORDER BY LoginDate DESC`
      );
      return { data: result.recordset, total: result.recordset.length };
    } catch {
      return { data: [], total: 0 };
    }
  }

  async storePasswordResetToken(_userId: number, _token: string, _expiresAt: Date): Promise<void> {
    // No ResetToken column in legacy table — no-op
  }

  async findByResetToken(_token: string): Promise<User | null> {
    return null;
  }

  async clearResetToken(_userId: number): Promise<void> {
    // No-op
  }

  private mapRow(row: any): User {
    const roleOption = parseInt(row.roleOption ?? '0', 10);
    const roles = roleOption >= 1 ? ['Administrator', 'Supervisor'] : ['Standard User'];
    return {
      id: row.id,
      username: row.username,
      email: row.username,
      name: row.username,
      phone: null,
      passwordHash: row.passwordHash,
      roles,
      status: row.disabled ? 'locked' : 'active',
      failedLoginAttempts: 0,
      lastLoginAt: null,
      createdAt: null,
      updatedAt: null,
      createdBy: row.createdBy,
      updatedBy: null,
      mustChangePassword: false,
      mfaEnabled: false,
      mfaSecret: undefined,
    };
  }
}

export const usersRepository = new UsersRepository();
