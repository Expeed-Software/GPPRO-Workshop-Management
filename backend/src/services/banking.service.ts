import * as repo from '../repositories/banking.repository';
import { AppError } from '../utils/AppError';

const FINANCE_ROLES = ['Accountant', 'Finance Supervisor', 'Administrator', 'Supervisor'];
const SUP_ADMIN = ['Supervisor', 'Administrator', 'Finance Supervisor'];
const ADMIN_ONLY = ['Administrator'];

function assertRole(roles: string[], allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw new AppError('FORBIDDEN', 'Insufficient permissions', 403);
}

// BR-81: only finance/bank roles can view/reconcile
export async function getBankBook(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, FINANCE_ROLES);
  const result = await repo.getBankBook(params);
  await repo.writeBankingAuditLog({ entityId: params.account ?? 'all', action: 'bankBook.view', userId });
  return result;
}

export async function getCBPBook(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, FINANCE_ROLES);
  const result = await repo.getCBPBook(params);
  await repo.writeBankingAuditLog({ entityId: params.accountType ?? 'all', action: 'cbpBook.view', userId });
  return result;
}

export async function getBankReconciliation(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, FINANCE_ROLES);
  const result = await repo.getBankReconciliationDetails(params);
  await repo.writeBankingAuditLog({ entityId: params.accountId ?? 'all', action: 'reconciliation.view', userId });
  return result;
}

// BR-86: validate bank statement file before import
export async function importBankStatement(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, ['Accountant', 'Finance Supervisor', 'Administrator']);
  if (!data.accountId) throw new AppError('VALIDATION', 'accountId is required', 422);
  if (!data.fileData) throw new AppError('VALIDATION', 'File data is required', 422);
  const result = await repo.importBankStatement({ ...data, userId });
  await repo.writeBankingAuditLog({ entityId: data.accountId, action: 'bankStatement.import', userId });
  return result;
}

// BR-83: all reconciliation actions logged
export async function saveBankReconciliation(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, FINANCE_ROLES);
  if (!params.reconId && !params.accountId) throw new AppError('VALIDATION', 'reconId or accountId required', 422);
  const result = await repo.saveBankReconciliation({ ...params, userId });
  await repo.writeBankingAuditLog({ entityId: String(params.reconId ?? params.accountId), action: 'reconciliation.save', userId });
  return result;
}

export async function getBankAccountsForRecon(roles: string[]) {
  assertRole(roles, FINANCE_ROLES);
  return repo.getBankAccountsForRecon();
}

export async function getReconLog(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  const result = await repo.getReconLog(params);
  await repo.writeBankingAuditLog({ entityId: params.accountId ?? 'all', action: 'reconLog.view', userId });
  return result;
}

export async function getReconciliationAttachments(reconId: string, roles: string[]) {
  assertRole(roles, FINANCE_ROLES);
  return repo.getReconciliationAttachments(reconId);
}

export async function uploadReconciliationAttachment(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, FINANCE_ROLES);
  const result = await repo.uploadReconciliationAttachment({ ...params, userId });
  await repo.writeBankingAuditLog({ entityId: params.reconId, action: 'attachment.upload', userId });
  return result;
}

export async function deleteReconciliationAttachment(id: string, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  const result = await repo.deleteReconciliationAttachment(id, userId);
  await repo.writeBankingAuditLog({ entityId: id, action: 'attachment.delete', userId });
  return result;
}

// BR-84: access controlled by role
export async function getPendingBillsLetter(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, FINANCE_ROLES);
  const result = await repo.getPendingBillsLetter(params);
  await repo.writeBankingAuditLog({ entityId: params.recipientType ?? 'all', action: 'pendingBills.view', userId });
  return result;
}

// BR-135: audit support log access SUP_ADMIN only
export async function getAuditSupportLogs(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  const result = await repo.getAuditSupportLogs(params);
  await repo.writeBankingAuditLog({ entityId: 'audit-support', action: 'auditLog.view', userId });
  return result;
}

export async function resolveAuditLog(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, ADMIN_ONLY);
  const result = await repo.resolveAuditLog({ ...params, userId });
  await repo.writeBankingAuditLog({ entityId: String(params.id), action: 'auditLog.resolve', userId });
  return result;
}

export async function getMissingAcSerials(params: Record<string, any>, roles: string[]) {
  assertRole(roles, SUP_ADMIN);
  return repo.getMissingAcSerials(params);
}

// BR-134: suspicious serial fix attempts are logged
export async function patchMissingAcSrl(id: string, serial: string, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  if (!serial) throw new AppError('VALIDATION', 'Serial number is required', 422);
  const result = await repo.patchMissingAcSrl({ id, serial, userId });
  await repo.writeBankingAuditLog({ entityId: id, action: 'missingSerial.patch', userId, after: { serial } });
  return result;
}

// BR-106: PDC payment status — no manual override without supervisor
// BR-118: only supervisor/admin can bulk-import PDCs
export async function getPDCVouchers(params: Record<string, any>, roles: string[]) {
  assertRole(roles, FINANCE_ROLES);
  return repo.getPDCVouchers(params);
}

// BR-110: debits/credits must balance (SP-enforced); BR-85: serial required
export async function insertVoucher(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, FINANCE_ROLES);
  const result = await repo.insertVoucher({ ...params, userId });
  await repo.writeBankingAuditLog({ entityId: String(params.voucherRef ?? 'new'), action: 'voucher.insert', userId });
  return result;
}

// BR-102: cannot delete posted/finalized voucher — SP enforces
export async function deleteVoucher(vsrl: string, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  const result = await repo.deleteVoucher(vsrl, userId);
  await repo.writeBankingAuditLog({ entityId: vsrl, action: 'voucher.delete', userId });
  return result;
}

export async function updateVoucher(vsrl: string, params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, FINANCE_ROLES);
  const result = await repo.updateVoucher(vsrl, { ...params, userId });
  await repo.writeBankingAuditLog({ entityId: vsrl, action: 'voucher.update', userId, after: params });
  return result;
}
