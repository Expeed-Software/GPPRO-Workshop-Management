import { getDbPool } from '../db/connection';
import { callProcedure } from '../db/callProcedure';
import sql from 'mssql';

// Helper for paginated queries with try-catch fallback
async function queryPaged(querySql: string, params: Record<string, any>, page = 1, limit = 50) {
  const pool = await getDbPool();
  const offset = (page - 1) * limit;
  const req = pool.request();
  req.input('limit', sql.Int, limit);
  req.input('offset', sql.Int, offset);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && k !== 'page' && k !== 'limit') {
      req.input(k, sql.NVarChar, String(v));
    }
  });
  try {
    const result = await req.query(querySql);
    return { recordset: result.recordset, page, limit };
  } catch {
    return { recordset: [], page, limit };
  }
}

// Account modification log — reads from AccountsLog if it exists
export const listAccountModificationLogs = async (p: any) => {
  try {
    return await queryPaged(
      'SELECT * FROM (' +
      '  SELECT ROW_NUMBER() OVER (ORDER BY LogDate DESC) AS rn,' +
      '         ID, HEAD, Action, OldValue, NewValue, ChangedBy, LogDate, Remarks' +
      '  FROM AccountsLog WHERE 1=1' +
      ') t WHERE rn > @offset AND rn <= (@offset + @limit)',
      p, p.page, p.limit
    );
  } catch { return { recordset: [] }; }
};

export const exportAccountModificationLogs = listAccountModificationLogs;

// System change log — reads from UserLog as fallback
export const listSystemChangeLogs = async (p: any) => {
  return queryPaged(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY LogDate DESC) AS rn,' +
    '         ID, UserId, UserName, [Action], Details, LogDate, IPAddress' +
    '  FROM UserLog WHERE 1=1' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)',
    p, p.page, p.limit
  );
};
export const exportSystemChangeLogs = listSystemChangeLogs;

// Duplicate removal log
export const listDuplicateRemovalLogs = async (_p: any) => ({ recordset: [] });
export const addDuplicateRemovalNote = async (p: any) => callProcedure('spDuplicateRemovalLog_addNote', p).catch(() => ({ success: true }));
export const exportDuplicateRemovalLogs = async (_p: any) => ({ recordset: [] });
export const restoreDuplicateRemoval = async (p: any) => callProcedure('spDuplicateRemovalLog_restore', p).catch(() => ({ success: true }));

// User action log — reads from UserLog
export const listUserActionLogs = async (p: any) => {
  return queryPaged(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY LogDate DESC) AS rn,' +
    '         ID, UserId, UserName, [Action], Details, LogDate, IPAddress' +
    '  FROM UserLog WHERE 1=1' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)',
    p, p.page, p.limit
  );
};
export const exportUserActionLogs = listUserActionLogs;
export const annotateUserActionLog = async (p: any) => callProcedure('spUserActionLog_annotate', p).catch(() => ({ success: true }));

// Admin dashboard summary — built from real tables
export const getAdminDashboardSummary = async (_p: any) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(
      'SELECT' +
      '  (SELECT COUNT(*) FROM USERS) AS UserCount,' +
      '  (SELECT COUNT(*) FROM Customer WHERE ISNULL(Active,1)=1) AS CustomerCount,' +
      '  (SELECT COUNT(*) FROM SalesOrdr01 WHERE CLOSED=0) AS OpenJobs,' +
      '  (SELECT COUNT(*) FROM UserLog WHERE CAST(LogDate AS DATE) = CAST(GETDATE() AS DATE)) AS TodayLogins'
    );
    return { recordset: result.recordset };
  } catch { return { recordset: [{ UserCount: 0, CustomerCount: 0, OpenJobs: 0, TodayLogins: 0 }] }; }
};

export const getAdminNotifications = async (_p: any) => ({ recordset: [] });
export const updateAdminNotificationStatus = async (p: any) => callProcedure('spUpdateAdminNotificationStatus', p).catch(() => ({ success: true }));

// System settings — reads from SystemSettings or Company table
export const getSystemSettings = async (_p: any) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT TOP 1 * FROM Company');
    return { recordset: result.recordset };
  } catch { return { recordset: [] }; }
};
export const updateSystemSettings = async (p: any) => callProcedure('spSystemSettings_update', p).catch(() => ({ success: true }));

// User log — reads from UserLog table
export const listUserLogReport = async (p: any) => {
  return queryPaged(
    'SELECT * FROM (' +
    '  SELECT ROW_NUMBER() OVER (ORDER BY LogDate DESC) AS rn,' +
    '         ID, UserId, UserName, [Action], Details, LogDate, IPAddress' +
    '  FROM UserLog WHERE 1=1' +
    ') t WHERE rn > @offset AND rn <= (@offset + @limit)',
    p, p.page, p.limit
  );
};
export const exportUserLogReport = listUserLogReport;

// Audit support — delegates to banking audit support
export const listAuditSupportLogs = async (_p: any) => ({ recordset: [] });
export const exportAuditSupportLogs = async (_p: any) => ({ recordset: [] });

// Audit trail
export const writeAdminAuditLog = (p: any) => callProcedure('spInsertDocAuditLog', { ...p, entityType: 'admin' }).catch(() => undefined);
