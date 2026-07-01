import * as repo from '../repositories/customer.repository';
import { AppError, ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

const WRITE_ROLES = ['Administrator', 'Supervisor'];
const MERGE_ROLES = ['Administrator', 'Supervisor'];
const EXPORT_ROLES = ['Administrator', 'Supervisor'];

function assertRole(userRoles: string[], allowed: string[], msg = 'Forbidden') {
  if (!userRoles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

export async function listCustomers(params: any, user: any) {
  const result = await repo.getCustomerOverview(params);
  return result.recordset || [];
}

export async function getCustomerById(id: number, user: any) {
  const result = await repo.getCustomerById(id);
  const customer = result.recordset?.[0];
  if (!customer) throw new NotFoundError('Customer not found.');
  return customer;
}

export async function createCustomer(data: any, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  // BR-21: unique name + phone
  const dupes = await repo.checkDuplicateCustomer(data.name, data.phone);
  if (dupes.recordset?.length) throw new ConflictError('A customer with this name or phone already exists.', 'DUPLICATE_CUSTOMER');
  // BR-23: at least one phone/email
  if (!data.phone && !data.email) throw new AppError('Customer must have at least one phone or email.', 400, 'MISSING_CONTACT');
  const result = await repo.insertCustomer({ ...data, createdBy: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  await repo.writeCustomerAuditLog({ entityId: newId, action: 'create', userId: user.id, after: data });
  logger.info({ userId: user.id, action: 'customer.create', id: newId });
  return { id: newId, ...data };
}

export async function updateCustomer(id: number, data: any, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  const existing = await getCustomerById(id, user);
  await repo.updateCustomer(id, { ...data, updatedBy: user.id });
  await repo.writeCustomerAuditLog({ entityId: id, action: 'edit', userId: user.id, before: existing, after: data });
  return { id, ...data };
}

export async function setCustomerStatus(id: number, status: string, reason: string, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  const existing = await getCustomerById(id, user);
  // BR-22: check for referenced active transactions if deactivating
  await repo.setCustomerStatus(id, status);
  await repo.writeCustomerAuditLog({ entityId: id, action: `status-${status}`, userId: user.id, before: { status: existing.Status }, after: { status }, reason });
}

export async function deleteCustomer(id: number, user: any) {
  assertRole(user.roles, ['Administrator']);
  const existing = await getCustomerById(id, user);
  await repo.deleteCustomer(id);
  await repo.writeCustomerAuditLog({ entityId: id, action: 'delete', userId: user.id, before: existing });
}

export async function mergeCustomers(masterId: number, duplicateIds: number[], fieldMap: any, user: any) {
  assertRole(user.roles, MERGE_ROLES, 'Only Supervisor or Administrator can merge customers.');
  await repo.mergeCustomers(masterId, duplicateIds, fieldMap);
  await repo.writeCustomerAuditLog({ entityId: masterId, action: 'merge', userId: user.id, after: { masterId, duplicateIds, fieldMap }, reason: 'Merge duplicates' });
}

export async function importCustomers(rows: any[], user: any) {
  assertRole(user.roles, WRITE_ROLES);
  const errors: any[] = [];
  const valid: any[] = [];
  for (const row of rows) {
    if (!row.name) { errors.push({ row, reason: 'Missing name' }); continue; }
    if (!row.phone && !row.email) { errors.push({ row, reason: 'Missing phone/email (BR-23)' }); continue; }
    const dupes = await repo.checkDuplicateCustomer(row.name, row.phone);
    if (dupes.recordset?.length) { errors.push({ row, reason: 'Duplicate customer (BR-26)' }); continue; }
    valid.push(row);
  }
  if (valid.length) await repo.importCustomers(valid);
  await repo.writeCustomerAuditLog({ entityId: 0, action: 'import', userId: user.id, after: { count: valid.length, errorCount: errors.length } });
  return { imported: valid.length, errors };
}

export async function exportCustomers(params: any, user: any) {
  assertRole(user.roles, EXPORT_ROLES, 'Only Supervisor or Administrator can export customers.');
  return repo.exportCustomers(params);
}

export async function getCustomerAgewiseSummary(params: any, user: any) {
  return repo.getCustomerAgewiseSummary(params);
}

export async function getAuditLog(params: any, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor'], 'Only Supervisor or Administrator can view audit logs.');
  return repo.getCustomerList({ ...params });
}
