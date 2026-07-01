import * as repo from '../repositories/contact.repository';
import { ForbiddenError, NotFoundError, ConflictError, AppError } from '../utils/errors';

const WRITE_ROLES = ['Administrator', 'Supervisor', 'Standard User'];
const MERGE_ROLES = ['Administrator', 'Supervisor'];

function assertRole(userRoles: string[], allowed: string[], msg = 'Forbidden') {
  if (!userRoles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

export async function listContacts(params: any, user: any) {
  const result = await repo.searchContacts(params);
  return result.recordset || [];
}

export async function getContactById(id: number, user: any) {
  const result = await repo.getContactById(id);
  const contact = result.recordset?.[0];
  if (!contact) throw new NotFoundError('Contact not found.');
  return contact;
}

export async function createContact(data: any, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  // BR-23: at least one phone/email
  if (!data.phone && !data.email) throw new AppError('Contact must have at least one phone or email (BR-23).', 400, 'MISSING_CONTACT');
  const dupes = await repo.checkDuplicateContact({ name: data.name, phone: data.phone, email: data.email });
  if (dupes.recordset?.length) throw new ConflictError('A contact with this name/phone/email already exists.', 'DUPLICATE_CONTACT');
  const result = await repo.insertContact({ ...data, createdBy: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  await repo.writeContactAuditLog({ entityId: newId, action: 'create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function updateContact(id: number, data: any, user: any) {
  assertRole(user.roles, WRITE_ROLES);
  if (!data.phone && !data.email) throw new AppError('Contact must have at least one phone or email (BR-23).', 400, 'MISSING_CONTACT');
  const existing = await getContactById(id, user);
  await repo.updateContact(id, { ...data, updatedBy: user.id });
  await repo.writeContactAuditLog({ entityId: id, action: 'edit', userId: user.id, before: existing, after: data });
  return { id, ...data };
}

export async function deleteContact(id: number, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor']);
  const existing = await getContactById(id, user);
  await repo.deleteContact(id);
  await repo.writeContactAuditLog({ entityId: id, action: 'delete', userId: user.id, before: existing });
}

export async function checkDuplicateContact(fields: any, user: any) {
  const result = await repo.checkDuplicateContact(fields);
  return result.recordset || [];
}

export async function mergeContacts(masterId: number, duplicateIds: number[], fieldMap: any, user: any) {
  assertRole(user.roles, MERGE_ROLES, 'Only Supervisor or Administrator can merge contacts (BR-132).');
  await repo.mergeContacts(masterId, duplicateIds, fieldMap);
  await repo.writeContactAuditLog({ entityId: masterId, action: 'merge', userId: user.id, after: { masterId, duplicateIds, fieldMap } });
}

export async function importContacts(rows: any[], user: any) {
  assertRole(user.roles, WRITE_ROLES);
  const errors: any[] = [];
  const valid: any[] = [];
  for (const row of rows) {
    if (!row.name) { errors.push({ row, reason: 'Missing name' }); continue; }
    if (!row.phone && !row.email) { errors.push({ row, reason: 'Missing phone/email (BR-23)' }); continue; }
    valid.push(row);
  }
  if (valid.length) await repo.importContacts(valid);
  return { imported: valid.length, errors };
}

export async function exportContacts(params: any, user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor']);
  return repo.exportContacts(params);
}
