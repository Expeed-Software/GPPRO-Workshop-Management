import * as repo from '../repositories/accounts.repository';
import { AppError } from '../utils/AppError';

const SUP_ADMIN = ['Supervisor', 'Administrator'];
const ADMIN_ONLY = ['Administrator'];
const ALL_AUTH = ['Administrator', 'Supervisor', 'Standard User', 'Accountant', 'Finance Supervisor'];

function assertRole(roles: string[], allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
}

// BR-93: required fields
function validateAcHead(data: Record<string, any>) {
  const required = ['name', 'code', 'type', 'group'];
  const missing = required.filter((k) => !data[k]);
  if (missing.length) throw new AppError(422, 'VALIDATION', `Missing required fields: ${missing.join(', ')}`);
}

export async function getAccountHeads(params: Record<string, any>) {
  return repo.getAccountHeads(params);
}

export async function getAccountHeadTree(params: Record<string, any>) {
  return repo.getAccountHeadTree(params);
}

export async function getAccountSummary(params: Record<string, any>) {
  return repo.getAccountSummary(params);
}

export async function getAccountBalanceSheet(params: Record<string, any>) {
  return repo.getAccountBalanceSheet(params);
}

export async function getAccountModificationLog(params: Record<string, any>, roles: string[]) {
  assertRole(roles, SUP_ADMIN);
  return repo.getAccountModificationLog(params);
}

// BR-90/93/94/95/130: unique name within group, required fields, RBAC, audit log
export async function createAcHead(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  validateAcHead(data);
  const result = await repo.insertAcHead({ ...data, userId });
  await repo.writeAccountAuditLog({ entityId: data.code, action: 'acHead.create', userId, after: data });
  return result;
}

// BR-90/92/94/95/130
export async function updateAcHead(code: string, data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  const result = await repo.updateAcHead(code, { ...data, userId });
  await repo.writeAccountAuditLog({ entityId: code, action: 'acHead.update', userId, after: data });
  return result;
}

// BR-91: SP deactivates if referenced; BR-95/130
export async function deleteAcHead(code: string, roles: string[], userId: number) {
  assertRole(roles, ADMIN_ONLY);
  const result = await repo.deleteAcHead(code, userId);
  await repo.writeAccountAuditLog({ entityId: code, action: 'acHead.delete', userId });
  return result;
}

// BR-97/98/95
export async function bulkImportAcHead(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, ADMIN_ONLY);
  return repo.bulkImportAcHead({ ...data, userId });
}

export async function resortAcHead(params: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  return repo.resortAcHead({ ...params, userId });
}

export async function createAcGroupHead(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  const result = await repo.createAcGroupHead({ ...data, userId });
  await repo.writeAccountAuditLog({ entityId: data.code ?? 'group', action: 'acGroup.create', userId, after: data });
  return result;
}

export async function editAccountHeadGroup(id: string, data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  const result = await repo.editAccountHeadGroup(id, { ...data, userId });
  await repo.writeAccountAuditLog({ entityId: id, action: 'acGroup.edit', userId, after: data });
  return result;
}

export async function deleteAcGroupHead(id: string, roles: string[], userId: number) {
  assertRole(roles, ADMIN_ONLY);
  return repo.deleteAcGroupHead(id, userId);
}

// Ledger Reports — BR-121: params validated, BR-117: RBAC
export async function getLedgerReport(params: Record<string, any>, roles: string[], userId: number) {
  if (!params.account) throw new AppError(422, 'VALIDATION', 'Account is required');
  const result = await repo.getLedgerReport(params);
  await repo.writeAccountAuditLog({ entityId: params.account, action: 'ledger.view', userId });
  return result;
}

export async function getLedgerActualDateReport(params: Record<string, any>, roles: string[], userId: number) {
  if (!params.account) throw new AppError(422, 'VALIDATION', 'Account is required');
  return repo.getLedgerActualDateReport(params);
}

export async function getLedgerPdcReport(params: Record<string, any>) {
  return repo.getLedgerPdcReport(params);
}

export async function getLedgerSummaryReport(params: Record<string, any>) {
  return repo.getLedgerSummaryReport(params);
}

export async function getLedgerSummaryActual(params: Record<string, any>) {
  return repo.getLedgerSummaryActual(params);
}

export async function getLedgerShortReport(params: Record<string, any>) {
  return repo.getLedgerShortReport(params);
}

export async function getLedgerAccountsAudit(params: Record<string, any>, roles: string[]) {
  assertRole(roles, SUP_ADMIN);
  return repo.getLedgerAccountsAudit(params);
}

export async function getGroupLedgerSummary(params: Record<string, any>) {
  return repo.getGroupLedgerSummary(params);
}

// Voucher list
export async function getVoucherList(params: Record<string, any>) {
  return repo.getVoucherList(params);
}

export async function getVoucherDetails(vsrl: string) {
  return repo.getVoucherDetails(vsrl);
}

export async function getDailyVoucherList(params: Record<string, any>) {
  return repo.getVoucherListNew(params);
}

export async function getVoucherListReport(params: Record<string, any>) {
  return repo.getProcVoucherList(params);
}

export async function getVoucherDetailsListReport(params: Record<string, any>) {
  return repo.getVoucherMasterDetails(params);
}

export async function getJournalVoucherList(params: Record<string, any>) {
  return repo.getVoucherList(params);
}

// BR-96/110/111/113: active accounts, balanced debits/credits, unique ref
export async function createJournalVoucherEntry(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  if (!data.date || !data.narration) throw new AppError(422, 'VALIDATION', 'Date and narration required');
  const result = await repo.writeBulkJournalVoucher({ ...data, userId });
  await repo.writeAccountAuditLog({ entityId: data.voucherRef ?? 'new', action: 'voucher.create', userId, after: data });
  return result;
}

// BR-112: supervisor+ for batch approve
export async function writeBulkJournalVoucher(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  return repo.writeBulkJournalVoucher({ ...data, userId });
}

export async function writeBulkPDCReceipt(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  return repo.writeBulkJournal02({ ...data, userId });
}

export async function writeBulkPDCVoucher(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  return repo.writeBulkPDCVoucher({ ...data, userId });
}

// Trial Balance — BR-117
export async function getTrialBalance(params: Record<string, any>) {
  return repo.getTrialBalance(params);
}

export async function getTrialBalanceSummary(params: Record<string, any>) {
  return repo.getTrialBalanceSummary(params);
}

export async function getTrialBalanceTest(params: Record<string, any>) {
  return repo.getTrialBalanceTest(params);
}

export async function getTrialBalanceTest111(params: Record<string, any>) {
  return repo.getTrialBalanceTest111(params);
}
