import * as repo from '../repositories/admin.repository';

type Roles = string[];
const SUP_ADMIN = ['Supervisor', 'Administrator'];
const ADMIN_ONLY = ['Administrator'];

function checkRole(roles: Roles, allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw Object.assign(new Error('Forbidden'), { status: 403 });
}

async function logAccess(userId: number, action: string, params?: any) {
  await repo.writeAdminAuditLog({ userId, action, entityId: 0, meta: params ? JSON.stringify(params) : undefined }).catch(() => {});
}

// Account Modification Log (BR-130,131,135)
export const getAccountModificationLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'VIEW_ACCOUNT_MOD_LOG', p); return repo.listAccountModificationLogs(p); };
export const exportAccountModificationLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'EXPORT_ACCOUNT_MOD_LOG', p); return repo.exportAccountModificationLogs(p); };

// System Change Log (BR-130,131,135)
export const getSystemChangeLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'VIEW_CHANGE_LOG', p); return repo.listSystemChangeLogs(p); };
export const exportSystemChangeLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'EXPORT_CHANGE_LOG', p); return repo.exportSystemChangeLogs(p); };

// Duplicate Removal Log (BR-130,131,132,134,136)
export const getDuplicateRemovalLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'VIEW_DUPLICATE_LOG', p); return repo.listDuplicateRemovalLogs(p); };
export const addDuplicateNote = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await logAccess(uid, 'ANNOTATE_DUPLICATE_LOG', p); return repo.addDuplicateRemovalNote(p); };
export const exportDuplicateRemovalLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'EXPORT_DUPLICATE_LOG', p); return repo.exportDuplicateRemovalLogs(p); };
export const restoreDuplicateRecord = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await logAccess(uid, 'RESTORE_DUPLICATE', p); return repo.restoreDuplicateRemoval(p); };

// User Action Log (BR-130,131,134,135)
export const getUserActionLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'VIEW_USER_ACTION_LOG', p); return repo.listUserActionLogs(p); };
export const annotateUserAction = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await logAccess(uid, 'ANNOTATE_USER_ACTION', p); return repo.annotateUserActionLog(p); };
export const exportUserActionLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'EXPORT_USER_ACTION_LOG', p); return repo.exportUserActionLogs(p); };

// Admin Dashboard (BR-47,134)
export const getAdminDashboard = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); return repo.getAdminDashboardSummary(p); };
export const getAdminNotifications = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); return repo.getAdminNotifications(p); };
export const updateNotificationStatus = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'UPDATE_NOTIFICATION', p); return repo.updateAdminNotificationStatus(p); };

// System Settings (BR-30,130)
export const getSettings = async (p: any, roles: Roles) => { checkRole(roles, SUP_ADMIN); return repo.getSystemSettings(p); };
export const updateSettings = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await logAccess(uid, 'UPDATE_SYSTEM_SETTINGS', p); return repo.updateSystemSettings(p); };

// User Log Report & Audit Support (BR-07,11,12,35,44,134,136)
export const getUserLogReport = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'VIEW_USER_LOG', p); return repo.listUserLogReport(p); };
export const exportUserLogReport = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'EXPORT_USER_LOG', p); return repo.exportUserLogReport(p); };
export const getAuditSupportLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'VIEW_AUDIT_SUPPORT', p); return repo.listAuditSupportLogs(p); };
export const exportAuditSupportLogs = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await logAccess(uid, 'EXPORT_AUDIT_SUPPORT', p); return repo.exportAuditSupportLogs(p); };
