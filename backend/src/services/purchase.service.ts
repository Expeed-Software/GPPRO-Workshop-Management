import * as repo from '../repositories/purchase.repository';
import { AppError, ForbiddenError, NotFoundError } from '../utils/errors';

const SUP_ADMIN = ['Administrator', 'Supervisor'];
const ADMIN_ONLY = ['Administrator'];

function assertRole(roles: string[], allowed: string[], msg = 'Forbidden') {
  if (!roles.some((r) => allowed.includes(r))) throw new ForbiddenError(msg);
}

// Purchase Orders
export async function listLocalPurchaseOrders(filter: any, user: any) {
  const r = await repo.listLocalPurchaseOrders(filter);
  return r.recordset || [];
}

export async function createLocalPurchaseOrder(data: any, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-64: Only Supervisor/Admin can create purchase orders.');
  if (!data.supplierId) throw new AppError('Supplier is required.', 400, 'MISSING_SUPPLIER');
  if (!data.date) throw new AppError('Date is required.', 400, 'MISSING_DATE');
  if (!data.items?.length) throw new AppError('At least one item is required.', 400, 'MISSING_ITEMS');
  // BR-65: supporting docs for high value
  const r = await repo.createPurchaseOrder({ ...data, createdBy: user.id });
  const newId = r.recordset?.[0]?.id || r.output?.id;
  await repo.writePurchaseAuditLog({ entityId: String(newId), action: 'po-create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function createForeignPurchaseOrder(data: any, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-64: Only Supervisor/Admin can create purchase orders.');
  if (!data.supplierId) throw new AppError('Supplier is required.', 400, 'MISSING_SUPPLIER');
  if (!data.currency) throw new AppError('Currency is required for foreign POs.', 400, 'MISSING_CURRENCY');
  const r = await repo.createForeignPurchaseOrder({ ...data, createdBy: user.id });
  const newId = r.recordset?.[0]?.id || r.output?.id;
  await repo.writePurchaseAuditLog({ entityId: String(newId), action: 'foreign-po-create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function updatePurchaseOrder(id: string, data: any, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-64: Only Supervisor/Admin can edit purchase orders.');
  // BR-67: no edit if approved
  await repo.updatePurchaseOrder(id, { ...data, updatedBy: user.id });
  await repo.writePurchaseAuditLog({ entityId: id, action: 'po-edit', userId: user.id, after: data });
}

export async function deletePurchaseOrder(id: string, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-64: Only Supervisor/Admin can delete purchase orders.');
  // BR-67: cannot delete approved
  await repo.deletePurchaseOrder(id, user.id);
  await repo.writePurchaseAuditLog({ entityId: id, action: 'po-delete', userId: user.id });
}

export async function approvePurchaseOrder(id: string, approvalNote: string, user: any) {
  // BR-61: supervisor approval
  assertRole(user.roles, SUP_ADMIN, 'BR-61: Only Supervisor/Admin can approve purchase orders.');
  await repo.approvePurchaseOrder(id, user.id, approvalNote);
  await repo.writePurchaseAuditLog({ entityId: id, action: 'po-approve', userId: user.id, after: { approvalNote } });
}

export async function bulkImportPurchaseOrders(data: any, user: any) {
  // BR-70: admin only for approval workflow config
  assertRole(user.roles, ADMIN_ONLY, 'BR-70: Only Administrator can bulk import purchase orders.');
  const r = await repo.bulkImportPurchaseOrders({ ...data, userId: user.id });
  await repo.writePurchaseAuditLog({ entityId: 'bulk', action: 'po-bulk-import', userId: user.id });
  return r.recordset || [];
}

export async function bulkExportPurchaseOrders(filter: any, user: any) {
  assertRole(user.roles, ADMIN_ONLY, 'Only Admin can bulk export.');
  await repo.writePurchaseAuditLog({ entityId: 'bulk', action: 'po-bulk-export', userId: user.id, after: filter });
  const r = await repo.bulkExportPurchaseOrders(filter);
  return r.recordset || [];
}

// Delivery Orders
export async function getPendingPurchaseDOs(filter: any, user: any) {
  const r = await repo.getPendingPurchaseDOs(filter);
  return r.recordset || [];
}

export async function createPurchaseDO(data: any, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-64: Only Supervisor/Admin can create delivery orders.');
  // BR-62: must link to existing PO
  if (!data.poNumber) throw new AppError('PO number is required (BR-62).', 400, 'MISSING_PO');
  const r = await repo.createPurchaseDO({ ...data, createdBy: user.id });
  const newId = r.recordset?.[0]?.id || r.output?.id;
  await repo.writePurchaseAuditLog({ entityId: String(newId), action: 'do-create', userId: user.id, after: data });
  return { id: newId, ...data };
}

export async function updatePurchaseDO(id: string, data: any, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'Only Supervisor/Admin can edit delivery orders.');
  await repo.updatePurchaseDO(id, { ...data, updatedBy: user.id });
  await repo.writePurchaseAuditLog({ entityId: id, action: 'do-edit', userId: user.id, after: data });
}

export async function deletePurchaseDO(id: string, user: any) {
  assertRole(user.roles, SUP_ADMIN, 'BR-67: Only Supervisor/Admin can delete delivery orders.');
  await repo.deletePurchaseDO(id, user.id);
  await repo.writePurchaseAuditLog({ entityId: id, action: 'do-delete', userId: user.id });
}

export async function bulkReceiptDOs(data: any, user: any) {
  // BR-63: qty cannot exceed PO line
  assertRole(user.roles, SUP_ADMIN, 'Only Supervisor/Admin can record bulk receipts.');
  const r = await repo.bulkReceiptDOs({ ...data, userId: user.id });
  await repo.writePurchaseAuditLog({ entityId: 'bulk', action: 'do-bulk-receipt', userId: user.id, after: data });
  return r.recordset || [];
}

// Reports
export async function getPurchaseDOItemRegister(filter: any, user: any) { const r = await repo.getPurchaseDOItemRegister(filter); return r.recordset || []; }
export async function getLPOAnalysis(filter: any, user: any) { const r = await repo.getLPOAnalysis(filter); return r.recordset || []; }
export async function getLPODetailsReport(filter: any, user: any) { const r = await repo.getLPODetailsReport(filter); return r.recordset || []; }
export async function getPurchaseRegAC(filter: any, user: any) { const r = await repo.getPurchaseRegAC(filter); return r.recordset || []; }
export async function getPurchaseRegImport(filter: any, user: any) { const r = await repo.getPurchaseRegImport(filter); return r.recordset || []; }
export async function getPurchaseRegLocal(filter: any, user: any) { const r = await repo.getPurchaseRegLocal(filter); return r.recordset || []; }
export async function getPurchaseRegSuppLocal(filter: any, user: any) { const r = await repo.getPurchaseRegSuppLocal(filter); return r.recordset || []; }
export async function getPurchaseReturnBillReport(filter: any, user: any) { await repo.writePurchaseAuditLog({ entityId: 'report', action: 'return-bill-report', userId: user.id, after: filter }); const r = await repo.getPurchaseReturnBillReport(filter); return r.recordset || []; }
export async function getPurchaseBillImport(filter: any, user: any) { const r = await repo.getPurchaseBillImport(filter); return r.recordset || []; }
export async function getPurchaseBillLocal(filter: any, user: any) { const r = await repo.getPurchaseBillLocal(filter); return r.recordset || []; }
export async function getSupplierBillwisePending(filter: any, user: any) { const r = await repo.getSupplierBillwisePending(filter); return r.recordset || []; }
export async function getSupplierBillwisePendingBoth(filter: any, user: any) { const r = await repo.getSupplierBillwisePendingBoth(filter); return r.recordset || []; }
export async function getSupplierBillwisePendingForeign(filter: any, user: any) { const r = await repo.getSupplierBillwisePendingForeign(filter); return r.recordset || []; }
export async function getSupplierBillwisePendingLocal(filter: any, user: any) { const r = await repo.getSupplierBillwisePendingLocal(filter); return r.recordset || []; }
export async function getSupplierBillwisePendingForeignOld(filter: any, user: any) { const r = await repo.getSupplierBillwisePendingForeignOld(filter); return r.recordset || []; }
export async function getPendingPurchaseDOReport(filter: any, user: any) { const r = await repo.getPendingPurchaseDOReport(filter); return r.recordset || []; }
export async function getPurchaseItemReports(filter: any, user: any) { const r = await repo.getPurchaseItemReports(filter); return r.recordset || []; }
export async function getProdRequests(filter: any, user: any) { const r = await repo.getProdRequests(filter); return r.recordset || []; }
export async function getPurchaseAuditLog(filter: any, user: any) { assertRole(user.roles, SUP_ADMIN, 'BR-131: Only Supervisor/Admin can view audit logs.'); const r = await repo.listLocalPurchaseOrders({ ...filter, auditOnly: true }); return r.recordset || []; }
