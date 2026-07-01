import * as repo from '../repositories/salesOrder.repository';
import * as delivRepo from '../repositories/delivery.repository';
import { AppError, ForbiddenError, NotFoundError } from '../utils/errors';

const SUP_ADMIN = ['Administrator', 'Supervisor'];

function assertRole(roles: string[], allowed: string[], msg = 'Forbidden') {
  if (!roles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

export async function getSalesOrders(filter: any, user: any) {
  const r = await repo.getSalesOrders(filter);
  return r.recordset || [];
}

export async function getSalesOrderById(id: string, user: any) {
  const r = await repo.getSalesOrderById(id);
  const order = r.recordset?.[0];
  if (!order) throw new NotFoundError('Sales order not found.');
  return order;
}

export async function createSalesOrder(data: any, user: any) {
  // BR-52: required fields
  if (!data.customerId) throw new AppError('Customer is required (BR-52).', 400, 'MISSING_CUSTOMER');
  if (!data.orderDate) throw new AppError('Order date is required (BR-52).', 400, 'MISSING_DATE');
  if (!data.items || !data.items.length) throw new AppError('At least one product is required (BR-52).', 400, 'MISSING_ITEMS');
  const r = await repo.createSalesOrder({ ...data, createdBy: user.id });
  const newId = r.recordset?.[0]?.id || r.output?.id;
  // BR-54: send confirmation email
  await repo.sendOrderConfirmation(newId).catch(() => {});
  // BR-56: audit log
  await repo.writeSalesAuditLog({ entityId: newId, action: 'order-create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function updateSalesOrder(id: string, data: any, user: any) {
  const order = await getSalesOrderById(id, user);
  // BR-57: cannot edit if already delivered
  if (order.status === 'Delivered') throw new AppError('Cannot edit a delivered order (BR-57).', 400, 'ORDER_DELIVERED');
  await repo.updateSalesOrder(id, { ...data, updatedBy: user.id });
  await repo.writeSalesAuditLog({ entityId: id, action: 'order-edit', userId: user.id, before: order, after: data });
}

export async function changeOrderStatus(id: string, status: string, reason: string, user: any) {
  // BR-53: only supervisor/admin can change status
  assertRole(user.roles, SUP_ADMIN, 'BR-53: Only Supervisor/Admin can change order status.');
  const order = await getSalesOrderById(id, user);
  // BR-57: cannot change if already delivered
  if (order.status === 'Delivered') throw new AppError('Cannot change status of a delivered order (BR-57).', 400, 'ORDER_DELIVERED');
  await repo.changeOrderStatus(id, status, reason, user.id);
  // BR-56: audit log
  await repo.writeSalesAuditLog({ entityId: id, action: `order-status-${status}`, userId: user.id, before: { status: order.status }, after: { status, reason } });
}

export async function bulkUpdateOrderStatus(orderIds: string[], status: string, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-53: Only Supervisor/Admin can bulk update order status.');
  await repo.bulkUpdateOrderStatus(orderIds, status, user.id);
  await repo.writeSalesAuditLog({ entityId: orderIds.join(','), action: 'order-bulk-status', userId: user.id, after: { orderIds, status } });
}

export async function deleteOrVoidOrder(id: string, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-53: Only Supervisor/Admin can delete orders.');
  // BR-51: cannot delete if delivery note exists
  const dnResult = await delivRepo.getDeliveryNotes(id);
  if ((dnResult.recordset || []).length > 0) throw new AppError('Cannot delete order with existing delivery note (BR-51).', 400, 'HAS_DELIVERY_NOTE');
  await repo.deleteSalesOrder(id, user.id);
  await repo.writeSalesAuditLog({ entityId: id, action: 'order-delete', userId: user.id });
}

export async function changeOrderCustomer(id: string, customerId: string, reason: string, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-53: Only Supervisor/Admin can change order customer.');
  if (!reason || reason.length < 16) throw new AppError('Reason is required (min 16 chars).', 400, 'REASON_REQUIRED');
  const order = await getSalesOrderById(id, user);
  if (String(order.customerId) === String(customerId)) throw new AppError('New customer must be different from current (BR-21).', 400, 'SAME_CUSTOMER');
  await repo.changeOrderCustomer(id, customerId, reason, user.id);
  await repo.writeSalesAuditLog({ entityId: id, action: 'order-customer-change', userId: user.id, before: { customerId: order.customerId }, after: { customerId, reason } });
}

export async function getSalesOrderAuditTrail(id: string, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-131: Only Supervisor/Admin can view audit logs.');
  const r = await repo.getSalesOrderAuditTrail(id);
  await repo.writeSalesAuditLog({ entityId: id, action: 'audit-log-read', userId: user.id });
  return r.recordset || [];
}

export async function getSalesOrderReport(filter: any, user: any) {
  await repo.writeSalesAuditLog({ entityId: 'report', action: 'order-report-export', userId: user.id, after: filter });
  const r = await repo.getSalesOrderReport(filter);
  return r.recordset || [];
}

export async function getPendingOrders(filter: any, user: any) {
  const r = await repo.getPendingOrders(filter);
  return r.recordset || [];
}

export async function getPendingOrderRegister(filter: any, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'Only Supervisor/Admin can view pending register report.');
  const r = await repo.getPendingOrderRegister(filter);
  return r.recordset || [];
}

export async function getOrderStatusReport(filter: any, user: any) {
  const r = await repo.getOrderStatusReport(filter);
  return r.recordset || [];
}
