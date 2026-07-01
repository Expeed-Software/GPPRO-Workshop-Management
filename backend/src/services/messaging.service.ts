import * as repo from '../repositories/messaging.repository';

type Roles = string[];
const SUP_ADMIN = ['Supervisor', 'Administrator'];
const ADMIN_ONLY = ['Administrator'];
const ALL = ['Administrator', 'Supervisor', 'Standard User', 'Accountant', 'Finance Supervisor'];

function checkRole(roles: Roles, allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw Object.assign(new Error('Forbidden'), { status: 403 });
}

async function log(uid: number, action: string, meta?: any) {
  await repo.writeMessagingAuditLog({ userId: uid, action, entityId: 0, meta: meta ? JSON.stringify(meta) : undefined }).catch(() => {});
}

// Mail (BR-14, BR-77)
export const getMailCount = (p: any, roles: Roles) => { checkRole(roles, ALL); return repo.getMailCount(p); };
export const getMail = (p: any, roles: Roles) => { checkRole(roles, ALL); return repo.getMail(p); };
export const sendMail = async (body: any, roles: Roles, uid: number) => { checkRole(roles, ALL); if (!body.toUserId || !body.subject || !body.body) throw Object.assign(new Error('toUserId, subject and body are required'), { status: 422 }); const r = await repo.sendMail(body); await log(uid, 'SEND_MAIL', body); return r; };
export const markMailRead = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL); const r = await repo.markMailRead(p); await log(uid, 'MARK_MAIL_READ', p); return r; };
export const deleteMail = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL); const r = await repo.deleteMail(p); await log(uid, 'DELETE_MAIL', p); return r; };
export const sendReportMail = async (body: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); const r = await repo.sendReportMail(body); await log(uid, 'SEND_REPORT_MAIL', body); return r; };
export const getSentReportMails = (p: any, roles: Roles) => { checkRole(roles, SUP_ADMIN); return repo.getSentReportMails(p); };

// Declare (BR-38)
export const getDeclareItems = (p: any, roles: Roles) => { checkRole(roles, ALL); return repo.getDeclareItems(p); };
export const createDeclareItem = async (body: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); if (!body.name || !body.code) throw Object.assign(new Error('name and code required'), { status: 422 }); const r = await repo.insertDeclareItem(body); await log(uid, 'CREATE_DECLARE', body); return r; };
export const updateDeclareItem = async (body: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); const r = await repo.updateDeclareItem(body); await log(uid, 'UPDATE_DECLARE', body); return r; };
export const deleteDeclareItem = async (body: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); const r = await repo.deleteDeclareItem(body); await log(uid, 'DELETE_DECLARE', body); return r; };

// Utility functions (BR-131, BR-132)
export const runUtility = async (body: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); const r = await repo.runUtilityFunction(body); await log(uid, `RUN_UTILITY:${body.name ?? 'unknown'}`, body); return r; };

// NumToWords (all users)
export const numToWords = (p: any, roles: Roles) => { checkRole(roles, ALL); return repo.numToWords(p); };

// Company info (ADMIN)
export const getCompanyInfo = (p: any, roles: Roles) => { checkRole(roles, ALL); return repo.getCompanyInfo(p); };
export const updateCompanyInfo = async (body: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); const r = await repo.updateCompanyInfo(body); await log(uid, 'UPDATE_COMPANY_INFO', body); return r; };

// DMS (BR-31, BR-32, BR-133)
export const getDocuments = (p: any, roles: Roles) => { checkRole(roles, ALL); return repo.getDocuments(p); };
export const uploadDocument = async (body: any, roles: Roles, uid: number) => { checkRole(roles, ALL); const r = await repo.uploadDocument(body); await log(uid, 'UPLOAD_DOCUMENT', { id: (r as any)?.[0]?.id }); return r; };
export const updateDocument = async (body: any, roles: Roles, uid: number) => { checkRole(roles, ALL); const r = await repo.updateDocument(body); await log(uid, 'UPDATE_DOCUMENT', body); return r; };
export const deleteDocument = async (body: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); const r = await repo.deleteDocument(body); await log(uid, 'DELETE_DOCUMENT', body); return r; };
