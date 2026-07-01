import * as repo from '../repositories/attachment.repository';
import { ForbiddenError, NotFoundError, AppError } from '../utils/errors';

const ALLOWED_ROLES = ['Administrator', 'Supervisor', 'Standard User'];
const BULK_DELETE_ROLES = ['Administrator', 'Supervisor'];

function assertRole(userRoles: string[], allowed: string[], msg = 'Forbidden') {
  if (!userRoles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

export async function listAttachments(filters: any, user: any) {
  assertRole(user.roles, ALLOWED_ROLES, 'BR-31: Permission required to view attachments.');
  const result = await repo.listAttachments(filters);
  return result.recordset || [];
}

export async function uploadAttachment(data: { transactionId?: number; fileName: string; fileType: string; filePath: string; tags?: string[]; userId: number }, user: any) {
  assertRole(user.roles, ALLOWED_ROLES, 'BR-31: Permission required to upload attachments.');
  // BR-32: must be linked to valid transaction
  if (!data.transactionId) throw new AppError('Attachment must be linked to a valid transaction (BR-32).', 400, 'MISSING_TRANSACTION');
  const payload = { ...data, uploadedBy: user.id, uploadDate: new Date().toISOString(), version: 1 };
  const result = await repo.insertAttachment(payload);
  const newId = result.recordset?.[0]?.id || result.output?.id;
  // BR-33: log user/date/version
  await repo.writeDocAuditLog({ entityId: newId, entityType: 'attachment', action: 'upload', userId: user.id, after: payload });
  return { id: newId, ...payload };
}

export async function editAttachmentMetadata(id: number, data: any, user: any) {
  assertRole(user.roles, ALLOWED_ROLES, 'BR-31: Permission required to edit attachment metadata.');
  const existing = await repo.getAttachmentById(id);
  if (!existing.recordset?.[0]) throw new NotFoundError('Attachment not found.');
  const updated = { ...data, updatedBy: user.id };
  await repo.updateAttachment(id, updated);
  await repo.writeDocAuditLog({ entityId: id, entityType: 'attachment', action: 'edit', userId: user.id, before: existing.recordset[0], after: updated });
  return { id, ...updated };
}

export async function deleteAttachment(id: number, confirmed: boolean, user: any) {
  assertRole(user.roles, ALLOWED_ROLES, 'BR-31: Permission required to delete attachments.');
  // BR-35: soft delete; BR-36: confirmation required
  if (!confirmed) throw new AppError('Deletion must be explicitly confirmed (BR-36).', 400, 'CONFIRMATION_REQUIRED');
  const existing = await repo.getAttachmentById(id);
  if (!existing.recordset?.[0]) throw new NotFoundError('Attachment not found.');
  await repo.deleteAttachment(id);
  await repo.writeDocAuditLog({ entityId: id, entityType: 'attachment', action: 'delete', userId: user.id, before: existing.recordset[0] });
}

export async function bulkUploadAttachments(files: any[], user: any) {
  assertRole(user.roles, ['Administrator', 'Supervisor'], 'BR-36: Bulk upload requires Supervisor or Admin.');
  const result = await repo.bulkInsertAttachments(files.map((f) => ({ ...f, uploadedBy: user.id })));
  await repo.writeDocAuditLog({ entityId: 0, entityType: 'attachment', action: 'bulk-upload', userId: user.id, after: { count: files.length } });
  return result;
}

export async function bulkDeleteAttachments(ids: number[], confirmed: boolean, user: any) {
  assertRole(user.roles, BULK_DELETE_ROLES, 'BR-36: Bulk delete requires Supervisor or Admin.');
  if (!confirmed) throw new AppError('Bulk deletion must be explicitly confirmed (BR-36).', 400, 'CONFIRMATION_REQUIRED');
  await repo.bulkDeleteAttachments(ids);
  await repo.writeDocAuditLog({ entityId: 0, entityType: 'attachment', action: 'bulk-delete', userId: user.id, after: { ids } });
}

export async function getAuditLogs(params: any, user: any) {
  // BR-135: only supervisor/admin
  if (!user.roles.some((r: string) => ['Administrator', 'Supervisor'].includes(r)))
    throw new ForbiddenError('BR-135: Only Supervisor or Administrator can access audit logs.');
  const result = await repo.listDocAuditLogs(params);
  return result.recordset || [];
}
