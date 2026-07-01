import * as repo from '../repositories/receipts.repository';

type Roles = string[];
const SUP_ADMIN = ['Supervisor', 'Administrator'];
const FINANCE = ['Accountant', 'Finance Supervisor', 'Administrator', 'Supervisor'];

function checkRole(roles: Roles, allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw Object.assign(new Error('Forbidden'), { status: 403 });
}

function validateReceipt(body: any) {
  const required = ['receiptDate', 'receivedFrom', 'payer', 'paymentMethod', 'amount'];
  for (const f of required) if (!body[f]) throw Object.assign(new Error(`${f} is required (BR-113)`), { status: 422 });
  if (Number(body.amount) <= 0) throw Object.assign(new Error('Amount must be > 0'), { status: 422 });
}

export const getReceipts = (p: any, roles: Roles) => {
  checkRole(roles, FINANCE);
  return repo.getReceipts(p);
};

export const createReceipt = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, FINANCE);
  validateReceipt(body);
  const result = await repo.insertReceipt(body);
  await repo.writeReceiptAuditLog({ userId, action: 'CREATE_RECEIPT', entityId: result?.[0]?.id ?? 0 });
  return result;
};

export const deleteReceipt = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-100
  const result = await repo.deleteReceipt(body);
  await repo.writeReceiptAuditLog({ userId, action: 'DELETE_RECEIPT', entityId: body.id });
  return result;
};

export const approveReceiptBatch = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-112
  const result = await repo.approveReceiptBatch(body);
  await repo.writeReceiptAuditLog({ userId, action: `${body.action?.toUpperCase() ?? 'APPROVE'}_RECEIPT_BATCH`, entityId: 0 });
  return result;
};

export const getReceiptBackup = (p: any, roles: Roles) => {
  checkRole(roles, SUP_ADMIN); // BR-105
  return repo.getReceiptBackup(p);
};

export const restoreReceiptBackup = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, SUP_ADMIN); // BR-105
  const result = await repo.restoreReceiptBackup(body);
  await repo.writeReceiptAuditLog({ userId, action: 'RESTORE_RECEIPT_BACKUP', entityId: 0 });
  return result;
};

export const getReceiptBackupReport = (p: any, roles: Roles) => {
  checkRole(roles, SUP_ADMIN); // BR-105
  return repo.getReceiptBackupReport(p);
};

export const getAutoReceipts = (p: any, roles: Roles) => {
  checkRole(roles, FINANCE);
  return repo.getAutoReceipts(p);
};

export const insertAutoReceipts = async (body: any, roles: Roles, userId: number) => {
  checkRole(roles, FINANCE);
  const result = await repo.insertAutoReceipts(body);
  await repo.writeReceiptAuditLog({ userId, action: 'BULK_AUTO_RECEIPT', entityId: 0 });
  return result;
};

export const getReceiptReport = (p: any, roles: Roles) => {
  checkRole(roles, FINANCE);
  return repo.getReceipts({ ...p, report: true });
};
