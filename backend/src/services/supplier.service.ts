import * as repo from '../repositories/supplier.repository';
import { ForbiddenError, NotFoundError, ConflictError, AppError } from '../utils/errors';
import logger from '../utils/logger';

const WRITE_ROLES = ['Administrator', 'Supervisor'];
const MERGE_ROLES = ['Administrator', 'Supervisor'];

function assertRole(userRoles: string[], allowed: string[], msg = 'Forbidden') {
  if (!userRoles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

export async function listSuppliers(params: any, user: any) {
  const result = await repo.getSupplierOverview(params);
  return result.recordset || [];
}

export async function getSupplierById(id: number, user: any) {
  const result = await repo.getSupplierById(id);
  const supplier = result.recordset?.[0];
  if (!supplier) throw new NotFoundError('Supplier not found.');
  return supplier;
}

export async function createSupplier(data: any, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  if (!data.phone && !data.email) throw new AppError('Supplier must have at least one phone or email (BR-23).', 400, 'MISSING_CONTACT');
  const dupes = await repo.checkDuplicateSupplier(data.name, data.phone);
  if (dupes.recordset?.length) throw new ConflictError('A supplier with this name or phone already exists (BR-21).', 'DUPLICATE_SUPPLIER');
  const result = await repo.insertSupplier({ ...data, createdBy: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  await repo.writeSupplierAuditLog({ entityId: newId, action: 'create', userId: user.id, after: data });
  logger.info({ userId: user.id, action: 'supplier.create', id: newId });
  return { id: newId, ...data };
}

export async function updateSupplier(id: number, data: any, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  const existing = await getSupplierById(id, user);
  await repo.updateSupplier(id, { ...data, updatedBy: user.id });
  await repo.writeSupplierAuditLog({ entityId: id, action: 'edit', userId: user.id, before: existing, after: data });
  return { id, ...data };
}

export async function setSupplierStatus(id: number, status: string, reason: string, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  const existing = await getSupplierById(id, user);
  await repo.setSupplierStatus(id, status);
  await repo.writeSupplierAuditLog({ entityId: id, action: `status-${status}`, userId: user.id, before: { status: existing.Status }, after: { status }, reason });
}

export async function deleteSupplier(id: number, user: any) {
  assertRole(user.roles, ['Administrator']);
  const existing = await getSupplierById(id, user);
  await repo.deleteSupplier(id);
  await repo.writeSupplierAuditLog({ entityId: id, action: 'delete', userId: user.id, before: existing });
}

export async function mergeSuppliers(masterId: number, duplicateIds: number[], fieldMap: any, user: any) {
  assertRole(user.roles, MERGE_ROLES, 'Only Supervisor or Administrator can merge suppliers.');
  await repo.mergeSuppliers(masterId, duplicateIds, fieldMap);
  await repo.writeSupplierAuditLog({ entityId: masterId, action: 'merge', userId: user.id, after: { masterId, duplicateIds, fieldMap } });
}

export async function importSuppliers(rows: any[], user: any) {
  assertRole(user.roles, WRITE_ROLES);
  const errors: any[] = [];
  const valid: any[] = [];
  for (const row of rows) {
    if (!row.name) { errors.push({ row, reason: 'Missing name' }); continue; }
    if (!row.phone && !row.email) { errors.push({ row, reason: 'Missing phone/email (BR-23)' }); continue; }
    const dupes = await repo.checkDuplicateSupplier(row.name, row.phone);
    if (dupes.recordset?.length) { errors.push({ row, reason: 'Duplicate supplier' }); continue; }
    valid.push(row);
  }
  if (valid.length) await repo.importSuppliers(valid);
  await repo.writeSupplierAuditLog({ entityId: 0, action: 'import', userId: user.id, after: { count: valid.length, errorCount: errors.length } });
  return { imported: valid.length, errors };
}

export async function exportSuppliers(params: any, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor']);
  return repo.exportSuppliers(params);
}

export async function getSupplierAgewiseSummary(params: any) {
  return repo.getSupplierAgewiseSummary(params);
}
