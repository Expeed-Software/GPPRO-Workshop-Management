import * as repo from '../repositories/remark.repository';
import * as auditRepo from '../repositories/attachment.repository';
import { ForbiddenError, NotFoundError } from '../utils/errors';

export async function listRemarks(filters: any, user: any) {
  const result = await repo.listRemarks(filters);
  return result.recordset || [];
}

export async function addRemark(data: { transactionId: number; remark: string }, user: any) {
  // BR-34: tagged with user/time; not anonymous
  const result = await repo.insertRemark({ ...data, userId: user.id });
  const newId = result.recordset?.[0]?.id || result.output?.id;
  await auditRepo.writeDocAuditLog({ entityId: newId, entityType: 'remark', action: 'create', userId: user.id, after: data });
  return { id: newId, ...data, userId: user.id };
}

export async function editRemark(id: number, remark: string, user: any) {
  const existing = await repo.getRemarkById(id);
  const r = existing.recordset?.[0];
  if (!r) throw new NotFoundError('Remark not found.');
  // Standard users can only edit their own remarks
  if (user.roles.every((role: string) => role === 'Standard User') && r.UserId !== user.id)
    throw new ForbiddenError('Standard users may only edit their own remarks.');
  await repo.updateRemark(id, remark, user.id);
  await auditRepo.writeDocAuditLog({ entityId: id, entityType: 'remark', action: 'edit', userId: user.id, before: r, after: { remark } });
  return { id, remark };
}

export async function deleteRemark(id: number, user: any) {
  const existing = await repo.getRemarkById(id);
  const r = existing.recordset?.[0];
  if (!r) throw new NotFoundError('Remark not found.');
  // BR-35: standard users cannot delete
  if (user.roles.every((role: string) => role === 'Standard User'))
    throw new ForbiddenError('BR-35: Standard users cannot delete remarks.');
  await repo.deleteRemark(id);
  await auditRepo.writeDocAuditLog({ entityId: id, entityType: 'remark', action: 'delete', userId: user.id, before: r });
}

export async function getRemarkHistory(transactionId: number, user: any) {
  if (user.roles.every((r: string) => r === 'Standard User'))
    throw new ForbiddenError('Remark history is accessible to Supervisor/Admin only.');
  const result = await repo.getRemarkHistory(transactionId);
  return result.recordset || [];
}

export async function getRemarksReport(filters: any, user: any) {
  if (!user.roles.some((r: string) => ['Administrator', 'Supervisor'].includes(r)))
    throw new ForbiddenError('Remark reports are accessible to Supervisor/Admin only.');
  const result = await repo.getRemarksReport(filters);
  return result.recordset || [];
}
