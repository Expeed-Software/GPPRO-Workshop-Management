import * as repo from '../repositories/items.repository';
import { AppError } from '../utils/AppError';

const SUP_ADMIN = ['Supervisor', 'Administrator'];
const ADMIN_ONLY = ['Administrator'];

function assertRole(roles: string[], allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw new AppError('FORBIDDEN', 'Insufficient permissions', 403);
}

export async function listItems(params: Record<string, any>) {
  return repo.getItemList(params);
}

export async function getItemsHelp(params: Record<string, any>) {
  return repo.getItemsHelp(params);
}

// BR-97: unique itemCode enforced by SP; service validates required fields
export async function createItem(data: Record<string, any>, roles: string[]) {
  assertRole(roles, SUP_ADMIN);
  const required = ['itemCode', 'description', 'unit'];
  const missing = required.filter((k) => !data[k]);
  if (missing.length) throw new AppError('VALIDATION', `Missing required fields: ${missing.join(', ')}`, 422);
  const result = await repo.createItem(data);
  await repo.writeItemAuditLog({ entityId: data.itemCode, action: 'create', userId: data.userId, after: data });
  return result;
}

export async function updateItem(itemCode: string, data: Record<string, any>, roles: string[]) {
  assertRole(roles, SUP_ADMIN);
  if (!itemCode) throw new AppError('VALIDATION', 'itemCode required', 422);
  const result = await repo.updateItem(itemCode, data);
  await repo.writeItemAuditLog({ entityId: itemCode, action: 'update', userId: data.userId, after: data });
  return result;
}

export async function deleteItem(itemCode: string, userId: number, roles: string[]) {
  assertRole(roles, ADMIN_ONLY);
  if (!itemCode) throw new AppError('VALIDATION', 'itemCode required', 422);
  // BR-99: SP will reject deletion of items with active inventory links
  const result = await repo.deleteItem(itemCode);
  await repo.writeItemAuditLog({ entityId: itemCode, action: 'delete', userId });
  return result;
}

export async function bulkImportItems(file: any, roles: string[]) {
  assertRole(roles, ADMIN_ONLY);
  return repo.bulkImportItems(file);
}

export async function bulkExportItems(params: Record<string, any>, roles: string[]) {
  assertRole(roles, ADMIN_ONLY);
  return repo.bulkExportItems(params);
}

export async function getItemAuditLogs(itemCode: string, params: Record<string, any>, roles: string[]) {
  assertRole(roles, SUP_ADMIN);
  return repo.getItemAuditLogs(itemCode, params);
}

export async function linkItemToInventory(itemCode: string, inventoryId: string, roles: string[]) {
  assertRole(roles, SUP_ADMIN);
  return repo.linkItemToInventory(itemCode, inventoryId);
}

export async function getItemDOList(itemCode: string, params: Record<string, any>) {
  return repo.getItemDOList(itemCode, params);
}

export async function getItemDOSummary(itemCode: string, params: Record<string, any>) {
  return repo.getItemDOSummary(itemCode, params);
}

export async function getItemPendingDOList(itemCode: string, params: Record<string, any>) {
  return repo.getItemPendingDOList(itemCode, params);
}

export async function getItemPurchaseListImport(params: Record<string, any>) {
  return repo.getItemPurchaseListImport(params);
}

export async function getItemPurchaseListLocal(params: Record<string, any>) {
  return repo.getItemPurchaseListLocal(params);
}

export async function getItemPurchaseReturnList(params: Record<string, any>) {
  return repo.getItemPurchaseReturnList(params);
}

export async function getItemPurchaseReturnSumm(params: Record<string, any>) {
  return repo.getItemPurchaseReturnSumm(params);
}

export async function getItemPurchaseSummImport(params: Record<string, any>) {
  return repo.getItemPurchaseSummImport(params);
}

export async function getItemPurchaseSummLocal(params: Record<string, any>) {
  return repo.getItemPurchaseSummLocal(params);
}

export async function getItemCategories() {
  return repo.getItemCategories();
}
