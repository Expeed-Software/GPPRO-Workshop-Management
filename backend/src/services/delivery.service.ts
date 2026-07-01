import * as repo from '../repositories/delivery.repository';
import * as orderRepo from '../repositories/salesOrder.repository';
import { AppError, ForbiddenError, NotFoundError } from '../utils/errors';

const SUP_ADMIN = ['Administrator', 'Supervisor'];

function assertRole(roles: string[], allowed: string[], msg = 'Forbidden') {
  if (!roles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

export async function getDeliveryNotes(orderId: string, user: any) {
  const r = await repo.getDeliveryNotes(orderId);
  return r.recordset || [];
}

export async function createDeliveryNote(orderId: string, data: any, user: any) {
  // BR-55/60: must be linked to valid, non-cancelled order
  const orderResult = await orderRepo.getSalesOrderById(orderId);
  const order = orderResult.recordset?.[0];
  if (!order) throw new NotFoundError('Order not found (BR-60).');
  if (order.status === 'Cancelled' || order.status === 'Delivered') throw new AppError(`Cannot create delivery note for ${order.status} order (BR-55).`, 400, 'INVALID_ORDER_STATUS');
  if (!data.recipientName) throw new AppError('Recipient name is required.', 400, 'MISSING_RECIPIENT');
  const r = await repo.createDeliveryNote({ ...data, orderId, createdBy: user.id });
  const newId = r.recordset?.[0]?.id || r.output?.id;
  await repo.writeDeliveryAuditLog({ entityId: newId, action: 'delivery-note-create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function updateDeliveryNote(noteId: string, data: any, user: any) {
  // BR-57: quantity/product lock post delivery
  await repo.updateDeliveryNote(noteId, { ...data, updatedBy: user.id });
  await repo.writeDeliveryAuditLog({ entityId: noteId, action: 'delivery-note-edit', userId: user.id, after: data });
}

export async function deleteDeliveryNote(noteId: string, user: any) {
  // BR-67: cannot delete closed entries
  assertRole(user.roles, SUP_ADMIN, 'Only Supervisor/Admin can delete delivery notes.');
  await repo.deleteDeliveryNote(noteId, user.id);
  // BR-68: full audit log
  await repo.writeDeliveryAuditLog({ entityId: noteId, action: 'delivery-note-delete', userId: user.id });
}

export async function getDeliveryLog(filter: any, user: any) {
  const r = await repo.getDeliveryLog(filter);
  return r.recordset || [];
}

export async function linkDeliveryNote(noteId: string, orderId: string, user: any) {
  // BR-60: one-to-one
  const r = await repo.linkDeliveryNote(noteId, orderId);
  await repo.writeDeliveryAuditLog({ entityId: noteId, action: 'delivery-note-link', userId: user.id, after: { orderId } });
  return r;
}

export async function printDeliveryNote(noteId: string, user: any) {
  const r = await repo.printDeliveryNote(noteId);
  // BR-126: audit log print
  await repo.writeDeliveryAuditLog({ entityId: noteId, action: 'delivery-note-print', userId: user.id });
  return r.recordset?.[0] || {};
}

export async function exportDeliveryNote(noteId: string, user: any) {
  const r = await repo.exportDeliveryNote(noteId);
  // BR-124/126: audit
  await repo.writeDeliveryAuditLog({ entityId: noteId, action: 'delivery-note-export', userId: user.id });
  return r.recordset?.[0] || {};
}

export async function getDeliveryNoteAuditTrail(noteId: string, user: any) {
  // BR-131/135: Supervisor/Admin only
  assertRole(user.roles, SUP_ADMIN, 'BR-131: Only Supervisor/Admin can view delivery note audit logs.');
  await repo.writeDeliveryAuditLog({ entityId: noteId, action: 'audit-log-read', userId: user.id });
  const r = await repo.getDeliveryNoteAuditTrail(noteId);
  return r.recordset || [];
}

export async function getDeliveryNoteReport(filter: any, user: any) {
  await repo.writeDeliveryAuditLog({ entityId: 'report', action: 'delivery-report-export', userId: user.id, after: filter });
  const r = await repo.getDeliveryNoteReport(filter);
  return r.recordset || [];
}
