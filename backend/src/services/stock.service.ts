import * as repo from '../repositories/stock.repository';
import * as itemRepo from '../repositories/items.repository';
import { AppError } from '../utils/AppError';

const SUP_ADMIN = ['Supervisor', 'Administrator'];
const ADMIN_ONLY = ['Administrator'];

function assertRole(roles: string[], allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw new AppError('FORBIDDEN', 'Insufficient permissions', 403);
}

// BR-71: stock-in required fields
export async function stockIn(data: Record<string, any>, roles: string[], userId: number) {
  const required = ['itemCode', 'qty', 'unitCost', 'referenceNo', 'date'];
  const missing = required.filter((k) => !data[k]);
  if (missing.length) throw new AppError('VALIDATION', `Missing required fields: ${missing.join(', ')}`, 422);
  if (Number(data.qty) <= 0) throw new AppError('VALIDATION', 'qty must be > 0', 422);
  const result = await repo.stockIn({ ...data, userId });
  // BR-76: all stock movements audited
  await repo.writeStockAuditLog({ entityId: data.itemCode, action: 'stock-in', userId, after: data });
  return result;
}

// BR-72: no stock-out > available qty
export async function stockOut(data: Record<string, any>, roles: string[], userId: number) {
  const required = ['itemCode', 'qty', 'referenceNo', 'date'];
  const missing = required.filter((k) => !data[k]);
  if (missing.length) throw new AppError('VALIDATION', `Missing required fields: ${missing.join(', ')}`, 422);
  const [available] = (await repo.getStockQty(data.itemCode)) as any[];
  const availQty = available?.availableQty ?? available?.qty ?? 0;
  if (Number(data.qty) > Number(availQty)) throw new AppError('STOCK', `Insufficient stock: available ${availQty}, requested ${data.qty}`, 422);
  const result = await repo.stockOut({ ...data, userId });
  await repo.writeStockAuditLog({ entityId: data.itemCode, action: 'stock-out', userId, after: data });
  return result;
}

// BR-73: physical adjustments require supervisor+
export async function physicalAdjust(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  // BR-79: no duplicate adjustment — SP enforces uniqueness by referenceNo + date
  const result = await repo.physicalAdjust({ ...data, userId });
  await repo.writeStockAuditLog({ entityId: data.itemCode, action: 'physical-adjust', userId, after: data });
  return result;
}

// BR-73: manual adjustments also require supervisor+
export async function manualAdjust(data: Record<string, any>, roles: string[], userId: number) {
  assertRole(roles, SUP_ADMIN);
  const result = await repo.manualAdjust({ ...data, userId });
  await repo.writeStockAuditLog({ entityId: data.itemCode, action: 'manual-adjust', userId, after: data });
  return result;
}

export async function getStockQty(itemCode: string) {
  return repo.getStockQty(itemCode);
}

export async function getStockDisplay(params: Record<string, any>) {
  return repo.getStockDisplay(params);
}

export async function getStockMovementReport(params: Record<string, any>) {
  return repo.getStockMovementReport(params);
}

export async function getStockLedger(params: Record<string, any>) {
  return repo.getStockLedger(params);
}

// BR-80: inventory report RBAC (aging / valuation are admin-only)
export async function getStockAgingReport(params: Record<string, any>, roles: string[]) {
  assertRole(roles, ADMIN_ONLY);
  return repo.getStockAgingReport(params);
}

// BR-74: valuation method admin-only
export async function getStockValuation(params: Record<string, any>, roles: string[]) {
  assertRole(roles, ADMIN_ONLY);
  return repo.getStockValuation(params);
}

export async function getStockValuationSummary(params: Record<string, any>, roles: string[]) {
  assertRole(roles, ADMIN_ONLY);
  return repo.getStockValuationSummary(params);
}

// BR-75: reorder notification visibility — all roles can view
export async function getReorderStatus(params: Record<string, any>) {
  return repo.getReorderStatus(params);
}

export async function getStockInList(params: Record<string, any>) {
  return repo.getStockInList(params);
}

export async function getStockOutList(params: Record<string, any>) {
  return repo.getStockOutList(params);
}

export async function getStockStatement(params: Record<string, any>) {
  return repo.getStockStatement(params);
}

export async function getStockStatement1(params: Record<string, any>) {
  return repo.getStockStatement1(params);
}

export async function getStockStatementFromItemFile(params: Record<string, any>) {
  return repo.getStockStatementFromItemFile(params);
}

export async function getStockStatementDD(params: Record<string, any>) {
  return repo.getStockStatementDD(params);
}

// BR-77: audit trail RBAC
export async function getStockAuditLogs(params: Record<string, any>, roles: string[]) {
  assertRole(roles, SUP_ADMIN);
  return repo.getStockAuditLogs(params);
}
