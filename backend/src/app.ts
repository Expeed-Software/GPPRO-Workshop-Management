import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authController } from './controllers/auth.controller';
import { usersController } from './controllers/users.controller';
import { authenticate } from './middlewares/authenticate';
import { requireAdmin, requireSupervisorOrAdmin } from './middlewares/rbac';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';
import * as custCtrl from './controllers/customer.controller';
import * as suppCtrl from './controllers/supplier.controller';
import * as contCtrl from './controllers/contact.controller';
import * as vehCtrl from './controllers/vehicle.controller';
import * as docCtrl from './controllers/document.controller';
import * as jobCtrl from './controllers/jobs.controller';
import * as salesCtrl from './controllers/sales.controller';
import * as purchaseCtrl from './controllers/purchase.controller';
import * as invCtrl from './controllers/inventory.controller';
import * as bankCtrl from './controllers/banking.controller';
import * as acCtrl from './controllers/accounts.controller';
import * as txCtrl from './controllers/transactions.controller';
import * as rptCtrl from './controllers/reports.controller';
import * as adminCtrl from './controllers/admin.controller';
import * as msgCtrl from './controllers/messaging.controller';
import * as labourIssueCtrl from './controllers/labourIssue.controller';
import * as payrollCtrl from './controllers/payroll.controller';
import { getDbPool } from './db/connection';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later.' } },
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (public)
app.post('/api/v1/auth/sign-in', authLimiter, authController.signIn.bind(authController));
app.post('/api/v1/auth/password-reset', authLimiter, authController.passwordReset.bind(authController));
app.post('/api/v1/auth/password-reset/confirm', authLimiter, authController.passwordResetConfirm.bind(authController));
app.post('/api/v1/auth/mfa/send', authLimiter, authController.mfaSend.bind(authController));
app.post('/api/v1/auth/mfa/verify', authLimiter, authController.mfaVerify.bind(authController));

// Auth routes (protected)
app.post('/api/v1/auth/sign-out', authenticate, authController.signOut.bind(authController));
app.post('/api/v1/auth/change-password', authenticate, authController.changePassword.bind(authController));
app.post('/api/v1/auth/lock-account', authenticate, requireAdmin, authController.lockAccount.bind(authController));
app.post('/api/v1/auth/unlock-account', authenticate, requireAdmin, authController.unlockAccount.bind(authController));

// User log (supervisor+)
app.get('/api/v1/userlog', authenticate, requireSupervisorOrAdmin, usersController.getUserLog.bind(usersController));

// ============================================================
// Phase 2: User Management Endpoints
// ============================================================
app.get('/api/v1/users', authenticate, requireSupervisorOrAdmin, usersController.listUsers.bind(usersController));
app.post('/api/v1/users', authenticate, requireAdmin, usersController.createUser.bind(usersController));
app.get('/api/v1/users/export', authenticate, requireSupervisorOrAdmin, usersController.exportUsers.bind(usersController));
app.post('/api/v1/users/import', authenticate, requireAdmin, usersController.bulkImportUsers.bind(usersController));
app.patch('/api/v1/users/me', authenticate, usersController.updateSelfProfile.bind(usersController));
app.patch('/api/v1/users/roles', authenticate, requireAdmin, usersController.assignRoles.bind(usersController));
app.patch('/api/v1/users/bulk-status', authenticate, requireAdmin, usersController.bulkSetStatus.bind(usersController));
app.get('/api/v1/users/rights', authenticate, requireAdmin, usersController.getRolePermissions.bind(usersController));
app.post('/api/v1/users/rights', authenticate, requireAdmin, usersController.assignPermissions.bind(usersController));
app.get('/api/v1/users/:id', authenticate, usersController.getUserById.bind(usersController));
app.patch('/api/v1/users/:id', authenticate, usersController.updateUser.bind(usersController));
app.patch('/api/v1/users/:id/status', authenticate, requireSupervisorOrAdmin, usersController.setUserStatus.bind(usersController));
app.patch('/api/v1/users/:id/password', authenticate, requireAdmin, usersController.resetUserPassword.bind(usersController));
app.patch('/api/v1/users/:id/roles', authenticate, requireAdmin, usersController.assignRoles.bind(usersController));

// Employee endpoints
app.get('/api/v1/employees', authenticate, requireSupervisorOrAdmin, usersController.getEmployees.bind(usersController));
app.get('/api/v1/employees/:id', authenticate, requireSupervisorOrAdmin, usersController.getEmployeeById.bind(usersController));

// Audit log
app.get('/api/v1/audit/user', authenticate, requireSupervisorOrAdmin, usersController.getUserLog.bind(usersController));

// ============================================================
// Phase 3: Customer, Supplier, Contact & Vehicle Management
// ============================================================

// Customers
app.get('/api/v1/customers', authenticate, custCtrl.listCustomers);
app.get('/api/v1/customers/overview', authenticate, custCtrl.listCustomers);
app.get('/api/v1/customers/agewise-summary', authenticate, requireSupervisorOrAdmin, custCtrl.getAgewiseSummary);
app.get('/api/v1/customers/export', authenticate, requireSupervisorOrAdmin, custCtrl.exportCustomers);
app.post('/api/v1/customers/import', authenticate, requireSupervisorOrAdmin, custCtrl.importCustomers);
app.post('/api/v1/customers/merge', authenticate, requireSupervisorOrAdmin, custCtrl.mergeCustomers);
app.get('/api/v1/customers/:id', authenticate, custCtrl.getCustomer);
app.post('/api/v1/customers', authenticate, requireSupervisorOrAdmin, custCtrl.createCustomer);
app.patch('/api/v1/customers/:id', authenticate, requireSupervisorOrAdmin, custCtrl.updateCustomer);
app.patch('/api/v1/customers/:id/status', authenticate, requireSupervisorOrAdmin, custCtrl.setCustomerStatus);
app.delete('/api/v1/customers/:id', authenticate, requireAdmin, custCtrl.deleteCustomer);
app.get('/api/v1/audit/customer', authenticate, requireSupervisorOrAdmin, custCtrl.getAuditLog);

// Suppliers
app.get('/api/v1/suppliers', authenticate, suppCtrl.listSuppliers);
app.get('/api/v1/suppliers/overview', authenticate, suppCtrl.listSuppliers);
app.get('/api/v1/suppliers/agewise-summary', authenticate, requireSupervisorOrAdmin, suppCtrl.getAgewiseSummary);
app.get('/api/v1/suppliers/export', authenticate, requireSupervisorOrAdmin, suppCtrl.exportSuppliers);
app.post('/api/v1/suppliers/import', authenticate, requireSupervisorOrAdmin, suppCtrl.importSuppliers);
app.post('/api/v1/suppliers/merge', authenticate, requireSupervisorOrAdmin, suppCtrl.mergeSuppliers);
app.get('/api/v1/suppliers/:id', authenticate, suppCtrl.getSupplier);
app.post('/api/v1/suppliers', authenticate, requireSupervisorOrAdmin, suppCtrl.createSupplier);
app.patch('/api/v1/suppliers/:id', authenticate, requireSupervisorOrAdmin, suppCtrl.updateSupplier);
app.patch('/api/v1/suppliers/:id/status', authenticate, requireSupervisorOrAdmin, suppCtrl.setSupplierStatus);
app.delete('/api/v1/suppliers/:id', authenticate, requireAdmin, suppCtrl.deleteSupplier);

// Contacts
app.get('/api/v1/contacts', authenticate, contCtrl.listContacts);
app.post('/api/v1/contacts/check-duplicate', authenticate, contCtrl.checkDuplicate);
app.post('/api/v1/contacts/merge', authenticate, requireSupervisorOrAdmin, contCtrl.mergeContacts);
app.post('/api/v1/contacts/import', authenticate, requireSupervisorOrAdmin, contCtrl.importContacts);
app.get('/api/v1/contacts/export', authenticate, requireSupervisorOrAdmin, contCtrl.exportContacts);
app.get('/api/v1/contacts/:id', authenticate, contCtrl.getContact);
app.post('/api/v1/contacts', authenticate, contCtrl.createContact);
app.patch('/api/v1/contacts/:id', authenticate, contCtrl.updateContact);
app.delete('/api/v1/contacts/:id', authenticate, requireSupervisorOrAdmin, contCtrl.deleteContact);

// Vehicles
app.get('/api/v1/vehicles', authenticate, vehCtrl.listVehicles);
app.get('/api/v1/vehicles/search', authenticate, vehCtrl.searchVehicles);
app.post('/api/v1/vehicles/merge', authenticate, requireSupervisorOrAdmin, vehCtrl.mergeVehicles);
app.get('/api/v1/vehicles/:vehId', authenticate, vehCtrl.getVehicle);
app.post('/api/v1/vehicles', authenticate, requireSupervisorOrAdmin, vehCtrl.createVehicle);
app.patch('/api/v1/vehicles/:vehId', authenticate, requireSupervisorOrAdmin, vehCtrl.updateVehicle);
app.delete('/api/v1/vehicles/:vehId', authenticate, requireAdmin, vehCtrl.deleteVehicle);

// ============================================================
// Phase 4: Document & Attachment Management
// ============================================================

// Attachments
app.get('/api/v1/attachments', authenticate, docCtrl.listAttachments);
app.post('/api/v1/attachments', authenticate, docCtrl.uploadAttachment);
app.post('/api/v1/attachments/bulk', authenticate, requireSupervisorOrAdmin, docCtrl.bulkUpload);
app.delete('/api/v1/attachments/bulk', authenticate, requireSupervisorOrAdmin, docCtrl.bulkDelete);
app.patch('/api/v1/attachments/:id', authenticate, docCtrl.editAttachment);
app.delete('/api/v1/attachments/:id', authenticate, docCtrl.deleteAttachment);
app.get('/api/v1/audit/documents', authenticate, requireSupervisorOrAdmin, docCtrl.getDocAuditLogs);

// Documents
app.get('/api/v1/documents', authenticate, docCtrl.listDocuments);
app.get('/api/v1/documents/menu', authenticate, docCtrl.getDocumentMenuData);
app.get('/api/v1/documents/heads', authenticate, docCtrl.listDocumentHeads);
app.post('/api/v1/documents/heads', authenticate, requireAdmin, docCtrl.createDocumentHead);
app.patch('/api/v1/documents/heads/:id', authenticate, requireSupervisorOrAdmin, docCtrl.editDocumentHead);
app.post('/api/v1/documents', authenticate, docCtrl.createDocument);
app.patch('/api/v1/documents/:id', authenticate, docCtrl.editDocument);
app.patch('/api/v1/documents/:id/status', authenticate, docCtrl.updateDocumentStatus);
app.post('/api/v1/documents/:id/link', authenticate, docCtrl.linkDocument);
app.delete('/api/v1/documents/:id', authenticate, requireSupervisorOrAdmin, docCtrl.deleteDocument);

// Document Types & Categories
app.post('/api/v1/document-type', authenticate, requireAdmin, docCtrl.createDocumentType);
app.patch('/api/v1/document-type/:id', authenticate, requireAdmin, docCtrl.editDocumentType);
app.post('/api/v1/document-category', authenticate, requireAdmin, docCtrl.createDocumentCategory);
app.patch('/api/v1/document-category/:id', authenticate, requireAdmin, docCtrl.editDocumentCategory);

// Remarks
app.get('/api/v1/remarks', authenticate, docCtrl.listRemarks);
app.post('/api/v1/remarks', authenticate, docCtrl.addRemark);
app.get('/api/v1/remarks/history', authenticate, requireSupervisorOrAdmin, docCtrl.getRemarkHistory);
app.get('/api/v1/remarks/report', authenticate, requireSupervisorOrAdmin, docCtrl.getRemarksReport);
app.patch('/api/v1/remarks/:id', authenticate, docCtrl.editRemark);
app.delete('/api/v1/remarks/:id', authenticate, docCtrl.deleteRemark);

// ============================================================
// Phase 5: Jobs, Work Orders & Estimation Management
// ============================================================

// Estimations
app.get('/api/v1/estimations', authenticate, jobCtrl.listEstimations);
app.get('/api/v1/estimations/:jobCardNo', authenticate, jobCtrl.getEstimation);
app.post('/api/v1/estimations', authenticate, jobCtrl.createEstimation);
app.patch('/api/v1/estimations/:id', authenticate, jobCtrl.updateEstimation);
app.post('/api/v1/estimations/:id/submit', authenticate, jobCtrl.submitEstimation);
app.post('/api/v1/estimations/:id/approve', authenticate, requireSupervisorOrAdmin, jobCtrl.approveEstimation);
app.get('/api/v1/estimations/:id/audit', authenticate, requireSupervisorOrAdmin, jobCtrl.getEstimationAudit);

// Jobs
app.post('/api/v1/jobs', authenticate, jobCtrl.createJob);
app.patch('/api/v1/jobs/:id', authenticate, jobCtrl.updateJob);
app.post('/api/v1/jobs/:id/assign', authenticate, requireSupervisorOrAdmin, jobCtrl.assignJob);
app.patch('/api/v1/jobs/:id/status', authenticate, jobCtrl.updateJobStatus);
app.patch('/api/v1/jobs/:id/progress', authenticate, jobCtrl.updateJobProgress);
app.patch('/api/v1/jobs/:id/complete', authenticate, jobCtrl.completeJob);
app.get('/api/v1/jobs/status-history', authenticate, jobCtrl.getJobStatusHistory);
app.get('/api/v1/jobs/running', authenticate, jobCtrl.getRunningJobs);
app.get('/api/v1/jobs/completed', authenticate, jobCtrl.getCompletedJobs);
app.get('/api/v1/jobs/parts-not-available', authenticate, jobCtrl.getPartsNotAvailable);
app.get('/api/v1/jobs/work-status-overview', authenticate, requireSupervisorOrAdmin, jobCtrl.getWorkStatusOverview);
app.get('/api/v1/jobs/work-status', authenticate, jobCtrl.getWorkStatus);
app.get('/api/v1/jobs/work-status-report', authenticate, requireSupervisorOrAdmin, jobCtrl.getWorkStatus);
app.get('/api/v1/jobs/rpt-work-status-summary', authenticate, requireSupervisorOrAdmin, jobCtrl.getWorkStatus);
app.get('/api/v1/jobs/status-advisorwise-report', authenticate, requireSupervisorOrAdmin, jobCtrl.getWorkStatus);
app.get('/api/v1/jobs/pending-jobcard-help', authenticate, jobCtrl.getPartsNotAvailable);
app.get('/api/v1/jobs/work-in-progress-report', authenticate, requireSupervisorOrAdmin, jobCtrl.getRunningJobs);
app.get('/api/v1/audit/job', authenticate, requireSupervisorOrAdmin, jobCtrl.getJobAuditLogs);

// Job Status Master
app.get('/api/v1/job-status', authenticate, jobCtrl.getJobStatusMaster);
app.post('/api/v1/job-status', authenticate, requireAdmin, jobCtrl.createJobStatusMaster);
app.patch('/api/v1/job-status/:id', authenticate, requireAdmin, jobCtrl.updateJobStatusMaster);
app.get('/api/v1/job-status-help', authenticate, jobCtrl.getJobStatusMaster);

// ============================================================
// Phase 6: Sales, Orders & Delivery Management
// ============================================================
app.get('/api/v1/sales/orders/audit', authenticate, requireSupervisorOrAdmin, salesCtrl.getOrderAudit);
app.get('/api/v1/sales/orders/pending/register', authenticate, requireSupervisorOrAdmin, salesCtrl.getPendingRegister);
app.get('/api/v1/sales/orders/pending', authenticate, salesCtrl.getPendingOrders);
app.get('/api/v1/sales/orders/status-report', authenticate, salesCtrl.getStatusReport);
app.get('/api/v1/sales/orders/export', authenticate, salesCtrl.getOrderReport);
app.get('/api/v1/sales/orders/help', authenticate, salesCtrl.getOrderHelp);
app.get('/api/v1/sales/orders', authenticate, salesCtrl.listOrders);
app.post('/api/v1/sales/orders', authenticate, salesCtrl.createOrder);
app.get('/api/v1/sales/orders/:id', authenticate, salesCtrl.getOrder);
app.patch('/api/v1/sales/orders/:id', authenticate, salesCtrl.updateOrder);
app.patch('/api/v1/sales/orders/:id/status', authenticate, requireSupervisorOrAdmin, salesCtrl.changeStatus);
app.patch('/api/v1/sales/orders/:id/customer', authenticate, requireSupervisorOrAdmin, salesCtrl.changeCustomer);
app.patch('/api/v1/sales/orders/bulk-status', authenticate, requireSupervisorOrAdmin, salesCtrl.bulkStatus);
app.delete('/api/v1/sales/orders/:id', authenticate, requireSupervisorOrAdmin, salesCtrl.deleteOrder);
app.get('/api/v1/sales/orders/:id/delivery-notes', authenticate, salesCtrl.listDeliveryNotes);
app.post('/api/v1/sales/orders/:id/delivery-notes', authenticate, salesCtrl.createDeliveryNote);
app.patch('/api/v1/sales/orders/:id/delivery-notes/:noteId', authenticate, salesCtrl.updateDeliveryNote);
app.delete('/api/v1/sales/orders/:id/delivery-notes/:noteId', authenticate, requireSupervisorOrAdmin, salesCtrl.deleteDeliveryNote);
app.get('/api/v1/sales/delivery-log', authenticate, salesCtrl.getDeliveryLog);
app.get('/api/v1/sales/delivery-notes/report', authenticate, salesCtrl.getDeliveryReport);
app.get('/api/v1/sales/delivery-notes/:noteId/print', authenticate, salesCtrl.printNote);
app.get('/api/v1/sales/delivery-notes/:noteId/export', authenticate, salesCtrl.exportNote);
app.get('/api/v1/sales/delivery-notes/:noteId/audit', authenticate, requireSupervisorOrAdmin, salesCtrl.getNoteAudit);
app.post('/api/v1/sales/delivery-notes/:noteId/link', authenticate, salesCtrl.linkNote);
app.get('/api/v1/orders/sales-report', authenticate, salesCtrl.getOrderReport);
app.get('/api/v1/orders/status-report', authenticate, salesCtrl.getStatusReport);
app.get('/api/v1/orders/pending-register', authenticate, requireSupervisorOrAdmin, salesCtrl.getPendingRegister);
app.get('/api/v1/orders/delivery-notes', authenticate, salesCtrl.getDeliveryReport);

// ============================================================
// Phase 7: Purchase, Procurement & Supplier Billing
// ============================================================
app.get('/api/v1/purchase/orders/export', authenticate, requireAdmin, purchaseCtrl.bulkExport);
app.post('/api/v1/purchase/orders/bulk-import', authenticate, requireAdmin, purchaseCtrl.bulkImport);
app.get('/api/v1/purchase/orders', authenticate, purchaseCtrl.listOrders);
app.post('/api/v1/purchase/orders', authenticate, requireSupervisorOrAdmin, purchaseCtrl.createLocalOrder);
app.post('/api/v1/purchase/orders/foreign', authenticate, requireSupervisorOrAdmin, purchaseCtrl.createForeignOrder);
app.patch('/api/v1/purchase/orders/:id', authenticate, requireSupervisorOrAdmin, purchaseCtrl.updateOrder);
app.delete('/api/v1/purchase/orders/:id', authenticate, requireSupervisorOrAdmin, purchaseCtrl.deleteOrder);
app.post('/api/v1/purchase/orders/:id/approve', authenticate, requireSupervisorOrAdmin, purchaseCtrl.approveOrder);
app.get('/api/v1/purchase/pending-delivery-orders', authenticate, purchaseCtrl.getPendingDOs);
app.post('/api/v1/purchase/do', authenticate, requireSupervisorOrAdmin, purchaseCtrl.createDO);
app.patch('/api/v1/purchase/do/:id', authenticate, requireSupervisorOrAdmin, purchaseCtrl.updateDO);
app.delete('/api/v1/purchase/do/:id', authenticate, requireSupervisorOrAdmin, purchaseCtrl.deleteDO);
app.post('/api/v1/purchase/do/bulk-receipt', authenticate, requireSupervisorOrAdmin, purchaseCtrl.bulkReceipt);
app.get('/api/v1/purchase/do/item-register', authenticate, purchaseCtrl.getDOItemRegister);
app.get('/api/v1/purchase/do/item-summary', authenticate, purchaseCtrl.getDOItemRegister);
app.get('/api/v1/purchase/lpo-analysis', authenticate, purchaseCtrl.getLPOAnalysis);
app.get('/api/v1/purchase/lpo-details-report', authenticate, purchaseCtrl.getLPODetailsReport);
app.get('/api/v1/purchase/register/account', authenticate, purchaseCtrl.getPurchaseRegAC);
app.get('/api/v1/purchase/register/imported', authenticate, purchaseCtrl.getPurchaseRegImport);
app.get('/api/v1/purchase/register/local', authenticate, purchaseCtrl.getPurchaseRegLocal);
app.get('/api/v1/purchase/register/supplier-local', authenticate, purchaseCtrl.getPurchaseRegSuppLocal);
app.get('/api/v1/purchase/returns', authenticate, purchaseCtrl.getPurchaseReturnBills);
app.get('/api/v1/purchase/import-bills', authenticate, purchaseCtrl.getPurchaseBillImport);
app.get('/api/v1/purchase/local-bills', authenticate, purchaseCtrl.getPurchaseBillLocal);
app.get('/api/v1/purchase/reports/pending', authenticate, purchaseCtrl.getPendingDOReport);
app.get('/api/v1/purchase/reports/orders', authenticate, purchaseCtrl.listOrders);
app.get('/api/v1/purchase/do-item-register', authenticate, purchaseCtrl.getDOItemRegister);
app.get('/api/v1/purchase/item-reports', authenticate, purchaseCtrl.getPurchaseItemReports);
app.get('/api/v1/products/requests', authenticate, purchaseCtrl.getProdRequests);
app.get('/api/v1/suppliers/billwise-pending/both', authenticate, purchaseCtrl.getSupplierBillwiseBoth);
app.get('/api/v1/suppliers/billwise-pending/foreign', authenticate, purchaseCtrl.getSupplierBillwiseForeign);
app.get('/api/v1/suppliers/billwise-pending/local', authenticate, purchaseCtrl.getSupplierBillwiseLocal);
app.get('/api/v1/suppliers/billwise-pending-old', authenticate, purchaseCtrl.getSupplierBillwiseForeignOld);
app.get('/api/v1/suppliers/billwise-pending', authenticate, purchaseCtrl.getSupplierBillwisePending);

// ============================================================
// Phase 8: Inventory, Stock & Item Management
// ============================================================

// Items (specific routes before :itemCode)
app.get('/api/v1/items', authenticate, invCtrl.listItems);
app.get('/api/v1/items/help', authenticate, invCtrl.itemsHelp);
app.get('/api/v1/items/categories', authenticate, invCtrl.itemCategories);
app.get('/api/v1/items/export', authenticate, requireAdmin, invCtrl.bulkExportItems);
app.post('/api/v1/items/bulk-import', authenticate, requireAdmin, invCtrl.bulkImportItems);
app.post('/api/v1/items', authenticate, requireSupervisorOrAdmin, invCtrl.createItem);
app.get('/api/v1/items/purchase/import', authenticate, invCtrl.itemPurchaseListImport);
app.get('/api/v1/items/purchase/local', authenticate, invCtrl.itemPurchaseListLocal);
app.get('/api/v1/items/purchase/returns', authenticate, invCtrl.itemPurchaseReturnList);
app.get('/api/v1/items/purchase/returns/summary', authenticate, invCtrl.itemPurchaseReturnSumm);
app.get('/api/v1/items/purchase/summary/import', authenticate, invCtrl.itemPurchaseSummImport);
app.get('/api/v1/items/purchase/summary/local', authenticate, invCtrl.itemPurchaseSummLocal);
app.get('/api/v1/items/:itemCode', authenticate, invCtrl.listItems);
app.patch('/api/v1/items/:itemCode', authenticate, requireSupervisorOrAdmin, invCtrl.updateItem);
app.delete('/api/v1/items/:itemCode', authenticate, requireAdmin, invCtrl.deleteItem);
app.get('/api/v1/items/:itemCode/audit', authenticate, requireSupervisorOrAdmin, invCtrl.itemAuditLogs);
app.post('/api/v1/items/:itemCode/link-inventory', authenticate, requireSupervisorOrAdmin, invCtrl.linkItemToInventory);
app.get('/api/v1/items/:itemCode/do-list', authenticate, invCtrl.itemDOList);
app.get('/api/v1/items/:itemCode/do-summary', authenticate, invCtrl.itemDOSummary);
app.get('/api/v1/items/:itemCode/pending-do', authenticate, invCtrl.itemPendingDOList);

// Stock
app.post('/api/v1/stock/in', authenticate, invCtrl.stockIn);
app.post('/api/v1/stock/out', authenticate, invCtrl.stockOut);
app.post('/api/v1/stock/manual-adjust', authenticate, requireSupervisorOrAdmin, invCtrl.manualAdjust);
app.post('/api/v1/stock/physical-adjust', authenticate, requireSupervisorOrAdmin, invCtrl.physicalAdjust);
app.get('/api/v1/stock/qty/:itemCode', authenticate, invCtrl.stockQty);
app.get('/api/v1/stock/display', authenticate, invCtrl.stockDisplay);
app.get('/api/v1/stock/in-list', authenticate, invCtrl.stockInList);
app.get('/api/v1/stock/out-list', authenticate, invCtrl.stockOutList);
app.get('/api/v1/stock/reorder-status', authenticate, invCtrl.reorderStatus);
app.get('/api/v1/stock/movement-report', authenticate, invCtrl.stockMovementReport);
app.get('/api/v1/stock/ledger', authenticate, invCtrl.stockLedger);
app.get('/api/v1/stock/aging-report', authenticate, requireAdmin, invCtrl.stockAgingReport);
app.get('/api/v1/stock/valuation', authenticate, requireAdmin, invCtrl.stockValuation);
app.get('/api/v1/stock/valuation-summary', authenticate, requireAdmin, invCtrl.stockValuationSummary);
app.get('/api/v1/stock/statement', authenticate, invCtrl.stockStatement);
app.get('/api/v1/stock/statement1', authenticate, invCtrl.stockStatement1);
app.get('/api/v1/stock/statement-from-item-file', authenticate, invCtrl.stockStatementFromItemFile);
app.get('/api/v1/stock/statement-dd', authenticate, invCtrl.stockStatementDD);
app.get('/api/v1/audit/stock', authenticate, requireSupervisorOrAdmin, invCtrl.stockAuditLogs);

// ============================================================
// Phase 9: Banking, Reconciliation & Financial Transactions
// ============================================================
app.get('/api/v1/banking/book-details', authenticate, bankCtrl.getBankBook);
app.get('/api/v1/banking/reconcile', authenticate, bankCtrl.getBankReconciliation);
app.post('/api/v1/banking/reconcile', authenticate, bankCtrl.saveBankReconciliation);
app.post('/api/v1/banking/reconciliation/import', authenticate, bankCtrl.importBankStatement);
app.patch('/api/v1/banking/reconciliation/:reconId/save', authenticate, bankCtrl.saveBankReconciliation);
app.get('/api/v1/banking/reconciliation/:reconId/attachments', authenticate, bankCtrl.getReconciliationAttachments);
app.post('/api/v1/banking/reconciliation/:reconId/attachments', authenticate, bankCtrl.uploadReconciliationAttachment);
app.delete('/api/v1/banking/attachments/:id', authenticate, bankCtrl.deleteReconciliationAttachment);
app.get('/api/v1/banking/accounts/recon-list', authenticate, bankCtrl.getBankAccountsForRecon);
app.get('/api/v1/banking/recon-log', authenticate, requireSupervisorOrAdmin, bankCtrl.getReconLog);
app.get('/api/v1/reports/banking/cbp-book', authenticate, bankCtrl.getCBPBook);
app.get('/api/v1/reports/pending-bills-letter', authenticate, bankCtrl.getPendingBillsLetter);
app.get('/api/v1/finance/audit/logs', authenticate, requireSupervisorOrAdmin, bankCtrl.getAuditSupportLogs);
app.post('/api/v1/finance/audit/logs/resolve', authenticate, requireAdmin, bankCtrl.resolveAuditLog);
app.get('/api/v1/finance/audit/missing-serials', authenticate, requireSupervisorOrAdmin, bankCtrl.getMissingAcSerials);
app.patch('/api/v1/finance/audit/missing-serials/:id', authenticate, requireSupervisorOrAdmin, bankCtrl.patchMissingAcSrl);
app.get('/api/v1/vouchers/pdc', authenticate, bankCtrl.getPDCVouchers);
app.post('/api/v1/vouchers', authenticate, bankCtrl.insertVoucher);
app.patch('/api/v1/vouchers/:vsrl', authenticate, bankCtrl.updateVoucher);
app.delete('/api/v1/vouchers/:vsrl', authenticate, requireSupervisorOrAdmin, bankCtrl.deleteVoucher);

// ============================================================
// Phase 10: Accounts, Ledgers & Chart of Accounts
// ============================================================
app.get('/api/v1/accounts/heads/tree', authenticate, acCtrl.getTree);
app.get('/api/v1/accounts/heads/tree-list', authenticate, acCtrl.getTree);
app.get('/api/v1/accounts/heads/help', authenticate, acCtrl.listHeads);
app.get('/api/v1/accounts/heads/new-list', authenticate, acCtrl.listHeads);
app.get('/api/v1/accounts/heads', authenticate, acCtrl.listHeads);
app.post('/api/v1/accounts/heads/resort', authenticate, requireSupervisorOrAdmin, acCtrl.resortHeads);
app.post('/api/v1/accounts/heads/import', authenticate, requireAdmin, acCtrl.bulkImportHeads);
app.post('/api/v1/accounts', authenticate, requireSupervisorOrAdmin, acCtrl.createHead);
app.patch('/api/v1/achead/:code', authenticate, requireSupervisorOrAdmin, acCtrl.updateHead);
app.delete('/api/v1/achead/:code', authenticate, requireAdmin, acCtrl.deleteHead);
app.post('/api/v1/acgrouphead', authenticate, requireSupervisorOrAdmin, acCtrl.createGroupHead);
app.patch('/api/v1/accounts/groups/:id', authenticate, requireSupervisorOrAdmin, acCtrl.editGroup);
app.delete('/api/v1/acgrouphead/:id', authenticate, requireAdmin, acCtrl.deleteGroupHead);
app.get('/api/v1/accounts/select', authenticate, acCtrl.listHeads);
app.get('/api/v1/accounts/:code/subdetails', authenticate, acCtrl.getSummary);
app.get('/api/v1/accounts/:code/error', authenticate, acCtrl.getSummary);
app.get('/api/v1/audit/account-modification-log', authenticate, requireSupervisorOrAdmin, acCtrl.getModLog);
app.get('/api/v1/ledger/report', authenticate, acCtrl.getLedger);
app.get('/api/v1/ledger/actual-date-report', authenticate, acCtrl.getLedgerActualDate);
app.get('/api/v1/ledger/pdc-report', authenticate, acCtrl.getLedgerPdc);
app.get('/api/v1/ledger/summary-report', authenticate, acCtrl.getLedgerSummary);
app.get('/api/v1/ledger/summary-actual', authenticate, acCtrl.getLedgerSummaryActual);
app.get('/api/v1/ledger/short-report', authenticate, acCtrl.getLedgerShort);
app.get('/api/v1/ledger/audit/accounts', authenticate, requireSupervisorOrAdmin, acCtrl.getLedgerAudit);
app.get('/api/v1/vouchers/daily-list', authenticate, acCtrl.getDailyList);
app.get('/api/v1/vouchers/details-list-report', authenticate, acCtrl.getVoucherDetailsReport);
app.get('/api/v1/vouchers/list-report', authenticate, acCtrl.getVoucherReport);
app.get('/api/v1/vouchers/:vsrl/details', authenticate, acCtrl.getVoucherDetails);
app.get('/api/v1/journalvoucher', authenticate, acCtrl.listJournalVouchers);
app.post('/api/v1/journal-voucher-entry', authenticate, requireSupervisorOrAdmin, acCtrl.createJournalVoucher);
app.post('/api/v1/vouchers/bulk-import', authenticate, requireSupervisorOrAdmin, acCtrl.bulkJournalImport);
app.post('/api/v1/bulk/journal-vouchers', authenticate, requireSupervisorOrAdmin, acCtrl.bulkJournalImport);
app.post('/api/v1/bulk/pdc-receipt-transactions', authenticate, requireSupervisorOrAdmin, acCtrl.bulkPDCReceipt);
app.post('/api/v1/bulk/pdc-transactions', authenticate, requireSupervisorOrAdmin, acCtrl.bulkPDCTransactions);
app.get('/api/v1/reports/trial-balance', authenticate, acCtrl.getTrialBalance);
app.get('/api/v1/reports/trial-balance-summary', authenticate, acCtrl.getTrialBalanceSummary);
app.get('/api/v1/reports/trialbalance-test', authenticate, acCtrl.getTrialBalanceTest);
app.get('/api/v1/reports/trialbalance-test-111', authenticate, acCtrl.getTrialBalanceTest111);
app.get('/api/v1/audit/log/group-ledger-summary', authenticate, requireSupervisorOrAdmin, acCtrl.getGroupLedger);
app.get('/api/v1/reports/group-ledger-summary', authenticate, acCtrl.getGroupLedger);

// Phase 11: Payments
app.get('/api/v1/payments', authenticate, txCtrl.listPayments);
app.get('/api/v1/payments/report', authenticate, txCtrl.getPaymentReport);
app.post('/api/v1/payments', authenticate, txCtrl.createPayment);
app.patch('/api/v1/payments/finalize', authenticate, txCtrl.finalizePayments);
app.post('/api/v1/payments/finalize', authenticate, txCtrl.finalizePayments);
app.post('/api/v1/payments/approve', authenticate, txCtrl.approvePaymentBatch);
app.post('/api/v1/payments/reject', authenticate, txCtrl.approvePaymentBatch);
app.post('/api/v1/payments/batch', authenticate, txCtrl.createPayment);
app.patch('/api/v1/payments/:id', authenticate, txCtrl.updatePayment);
app.delete('/api/v1/payments/:id', authenticate, txCtrl.deletePayment);

// Phase 11: Receipts
app.get('/api/v1/receipts', authenticate, txCtrl.listReceipts);
app.get('/api/v1/receipts/report', authenticate, txCtrl.getReceiptReport);
app.get('/api/v1/receipts/backup', authenticate, txCtrl.getReceiptBackup);
app.get('/api/v1/receipts/backup-report', authenticate, txCtrl.getReceiptBackupReport);
app.get('/api/v1/receipts/auto', authenticate, txCtrl.getAutoReceipts);
app.post('/api/v1/receipts', authenticate, txCtrl.createReceipt);
app.post('/api/v1/receipts/approve', authenticate, txCtrl.approveReceiptBatch);
app.post('/api/v1/receipts/reject', authenticate, txCtrl.approveReceiptBatch);
app.post('/api/v1/receipts/backup/restore', authenticate, txCtrl.restoreReceiptBackup);
app.post('/api/v1/receipts/auto', authenticate, txCtrl.insertAutoReceipts);
app.delete('/api/v1/receipts/:id', authenticate, txCtrl.deleteReceipt);

// Phase 11: Petty Cash
app.get('/api/v1/petty-cash', authenticate, txCtrl.listPettyCash);
app.post('/api/v1/petty-cash', authenticate, txCtrl.createPettyCash);
app.post('/api/v1/petty-cash/approve', authenticate, txCtrl.approvePettyCashBatch);
app.patch('/api/v1/petty-cash/:id', authenticate, txCtrl.updatePettyCash);
app.delete('/api/v1/petty-cash/:id', authenticate, txCtrl.deletePettyCash);

// Phase 11: Vouchers
app.get('/api/v1/vouchers', authenticate, txCtrl.listVouchers);
app.get('/api/v1/vouchers/new', authenticate, txCtrl.listVouchersNew);
app.get('/api/v1/vouchers/pdc', authenticate, txCtrl.listVouchersPdc);
app.get('/api/v1/vouchers/summary', authenticate, txCtrl.getVoucherSummary);
app.get('/api/v1/vouchers/summary-pdc', authenticate, txCtrl.getVoucherSummaryPdc);
app.get('/api/v1/vouchers/:vsrl/details', authenticate, txCtrl.getVoucherDetails);
app.get('/api/v1/accounts/:code/vouchers', authenticate, txCtrl.getAccountVouchers);
app.post('/api/v1/vouchers', authenticate, txCtrl.createVoucher);
app.post('/api/v1/vouchers/batch', authenticate, txCtrl.createVoucherBulk);
app.post('/api/v1/vouchers/approve', authenticate, txCtrl.approveVoucherBatch);
app.post('/api/v1/vouchers/pdc-issue', authenticate, txCtrl.createPdcIssue);
app.post('/api/v1/vouchers/pdc-receipt', authenticate, txCtrl.createPdcReceipt);
app.delete('/api/v1/vouchers/:id', authenticate, txCtrl.deleteVoucher);

// Phase 12: Reports
app.get('/api/v1/reports', authenticate, rptCtrl.listReports);
app.post('/api/v1/reports/generate', authenticate, rptCtrl.generateReport);
app.post('/api/v1/reports/export', authenticate, rptCtrl.exportReport);
app.post('/api/v1/reports/mail', authenticate, rptCtrl.mailReport);
app.get('/api/v1/reports/profit-loss', authenticate, rptCtrl.getProfitLoss);
app.get('/api/v1/reports/profit-loss-frm', authenticate, rptCtrl.getProfitLossFrm);
app.get('/api/v1/reports/sales-analysis', authenticate, rptCtrl.getSalesAnalysis);
app.get('/api/v1/reports/discount-summary', authenticate, rptCtrl.getDiscountSummary);
app.get('/api/v1/reports/margin-report', authenticate, rptCtrl.getMarginReport);
app.get('/api/v1/reports/voucher-details', authenticate, rptCtrl.getVoucherDetailsList);
app.get('/api/v1/reports/journal-voucher', authenticate, rptCtrl.getJournalVoucherReport);
app.get('/api/v1/reports/voucher-list', authenticate, rptCtrl.listReports);
app.get('/api/v1/reports/cbp-book', authenticate, rptCtrl.listReports);
app.get('/api/v1/reports/additional-remarks', authenticate, rptCtrl.listReports);
app.get('/api/v1/reports/customer-bills/detailed-summary', authenticate, rptCtrl.getCustomerBillsDetailed);
app.get('/api/v1/reports/customer-bills/pending', authenticate, rptCtrl.getCustomerBillsPending);
app.get('/api/v1/reports/customer-bills/summary', authenticate, rptCtrl.getCustomerBillsSummary);
app.get('/api/v1/reports/diagnostics/custom-1', authenticate, rptCtrl.getDiagnosticReport1);
app.get('/api/v1/reports/diagnostics/custom-2', authenticate, rptCtrl.getDiagnosticReport222);
app.get('/api/v1/reports/stock/ledger', authenticate, rptCtrl.getStockLedger);
app.get('/api/v1/accounts/summary', authenticate, rptCtrl.getAcSummary);
app.get('/api/v1/accounts/group-balance', authenticate, rptCtrl.getGroupBalance);
app.get('/api/v1/accounts/summary-balance-sheet', authenticate, rptCtrl.getBalanceSheet);
app.get('/api/v1/reports/balance-sheet', authenticate, rptCtrl.getBalanceSheet);
app.get('/api/v1/accounts/agewise-details', authenticate, rptCtrl.getAgewiseDetails);
app.get('/api/v1/customers/outstanding/salesmanwise', authenticate, rptCtrl.getCustomerOutstanding);
app.get('/api/v1/suppliers/outstanding-summary', authenticate, rptCtrl.getSupplierOutstanding);
app.get('/api/v1/sales/analysis', authenticate, rptCtrl.getSalesAnalysis);
app.get('/api/v1/sales/category-summary', authenticate, rptCtrl.getSalesCategorySummary);
app.get('/api/v1/sales/labour-parts-report', authenticate, rptCtrl.getSalesLabourParts);
app.get('/api/v1/sales/margin-report', authenticate, rptCtrl.getMarginReport);
app.get('/api/v1/sales/monthly-summary', authenticate, rptCtrl.getMonthlySales);
app.get('/api/v1/sales/invoices/summary-by-staff', authenticate, rptCtrl.getSalesmanInvoices);
app.get('/api/v1/stock/valuation', authenticate, rptCtrl.getStockValuation);
app.get('/api/v1/stock/aging', authenticate, rptCtrl.getStockAging);
app.get('/api/v1/stock/ledger', authenticate, rptCtrl.getStockLedger);
app.get('/api/v1/stock/opening-balances', authenticate, rptCtrl.getOpeningStock);
app.get('/api/v1/inventory/used-cars', authenticate, rptCtrl.getUsedCars);
app.get('/api/v1/jobs/work-in-progress-report', authenticate, rptCtrl.getWorkInProgress);
app.get('/api/v1/reports/work-in-progress', authenticate, rptCtrl.getWorkInProgress);
app.get('/api/v1/dashboard/kpis', authenticate, async (req: any, res: any) => {
  try {
    const pool = await getDbPool();
    const r = await pool.request().query(
      'SELECT ' +
      '  (SELECT COUNT(*) FROM Customer WHERE ISNULL(Active,1)=1) AS CustomerCount,' +
      '  (SELECT COUNT(*) FROM SalesOrdr01) AS OrderCount,' +
      '  (SELECT COUNT(*) FROM SalesOrdr01 J' +
      '   INNER JOIN salesOrdrStatusHead H ON J.statusId = H.StatusID' +
      '   WHERE H.FinishedStatusYN = 0 AND H.PartsNotAvailYN = 0' +
      '     AND J.Ordr NOT IN (SELECT Ordr FROM Sales01)' +
      '     AND ISNULL(J.Closed, 0) = 0 AND ISNULL(J.Delivered, 0) = 0) AS OpenJobCount,' +
      '  (SELECT ISNULL(SUM(s.qty * ISNULL(i.Prate,0)),0) FROM Items i' +
      '   LEFT JOIN (SELECT Itemcode, SUM(StkIN)-SUM(StkOut) AS qty FROM StockTransaction GROUP BY Itemcode) s ON s.Itemcode=i.ItemCode) AS StockValue'
    );
    res.json({ success: true, data: r.recordset[0] });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: e.message } });
  }
});
app.get('/api/v1/reports/customer-bills-summary', authenticate, rptCtrl.getCustomerBillsSummary);
app.get('/api/v1/reports/supplier-outstanding', authenticate, rptCtrl.getSupplierOutstanding);
app.get('/api/v1/reports/customer-outstanding', authenticate, rptCtrl.getCustomerOutstanding);
app.get('/api/v1/reports/agewise-summary', authenticate, rptCtrl.getAgewiseSummary);
app.get('/api/v1/reports/agewise-details', authenticate, rptCtrl.getAgewiseDetails);
app.get('/api/v1/reports/monthly-split-sales', authenticate, rptCtrl.getMonthlySales);
app.get('/api/v1/reports/labour-parts', authenticate, rptCtrl.getSalesLabourParts);
app.get('/api/v1/reports/stock-valuation', authenticate, rptCtrl.getStockValuation);
app.get('/api/v1/reports/stock-valuation-summary', authenticate, rptCtrl.getStockValuationSummary);
app.get('/api/v1/reports/stock-aging', authenticate, rptCtrl.getStockAging);
app.get('/api/v1/reports/stock-ledger', authenticate, rptCtrl.getStockLedger);
app.get('/api/v1/reports/products-overview', authenticate, rptCtrl.getProductsOverview);
app.get('/api/v1/reports/customer-overview', authenticate, rptCtrl.getCustomerOverview);
app.get('/api/v1/technicians/efficiency', authenticate, rptCtrl.getTechnicianEfficiency);
app.get('/api/v1/employee-attendance', authenticate, rptCtrl.getEmployeeAttendance);
app.get('/api/v1/vehicle-attendance', authenticate, rptCtrl.getVehicleAttendance);
app.get('/api/v1/payroll/salary-register', authenticate, rptCtrl.getSalaryRegister);
app.get('/api/v1/payroll/salary-slip/:employeeId/:period', authenticate, rptCtrl.getSalarySlip);
app.get('/api/v1/admin/omasters-report', authenticate, rptCtrl.getOMastersReport);
app.get('/api/v1/company/report-header', authenticate, rptCtrl.getCompanyReportHeader);
app.patch('/api/v1/company/report-header', authenticate, rptCtrl.updateCompanyReportHeader);

// Phase 13: Admin, Audit Logs & Change Tracking
app.get('/api/v1/audit/account-modification-log', authenticate, adminCtrl.getAccountModificationLogs);
app.get('/api/v1/audit/account-modification-log/export', authenticate, adminCtrl.exportAccountModificationLogs);
app.get('/api/v1/audit/change-log', authenticate, adminCtrl.getSystemChangeLogs);
app.get('/api/v1/audit/change-log/export', authenticate, adminCtrl.exportSystemChangeLogs);
app.get('/api/v1/audit/duplicate-removal', authenticate, adminCtrl.getDuplicateRemovalLogs);
app.post('/api/v1/audit/duplicate-removal/annotate', authenticate, adminCtrl.addDuplicateNote);
app.get('/api/v1/audit/duplicate-removal/export', authenticate, adminCtrl.exportDuplicateRemovalLogs);
app.patch('/api/v1/audit/duplicate-removal/restore', authenticate, adminCtrl.restoreDuplicateRecord);
app.get('/api/v1/audit/user-action', authenticate, adminCtrl.getUserActionLogs);
app.post('/api/v1/audit/user-action/annotate', authenticate, adminCtrl.annotateUserAction);
app.get('/api/v1/audit/user-action/export', authenticate, adminCtrl.exportUserActionLogs);
app.get('/api/v1/admin/dashboard-summary', authenticate, adminCtrl.getAdminDashboard);
app.get('/api/v1/admin/notifications', authenticate, adminCtrl.getAdminNotifications);
app.patch('/api/v1/admin/notifications/:id/status', authenticate, adminCtrl.updateNotificationStatus);
app.get('/api/v1/settings', authenticate, adminCtrl.getSettings);
app.patch('/api/v1/settings', authenticate, adminCtrl.updateSettings);
app.get('/api/v1/userlog', authenticate, adminCtrl.getUserLogReport);
app.get('/api/v1/userlog/export', authenticate, adminCtrl.exportUserLogReport);
app.get('/api/v1/audit/support', authenticate, adminCtrl.getAuditSupportLogs);
app.get('/api/v1/audit/support/export', authenticate, adminCtrl.exportAuditSupportLogs);

// Labour Issue (Delivery02)
app.get('/api/v1/labour-issue',       authenticate, labourIssueCtrl.list);
app.get('/api/v1/labour-issue/:id',   authenticate, labourIssueCtrl.getOne);
app.post('/api/v1/labour-issue',      authenticate, labourIssueCtrl.create);
app.patch('/api/v1/labour-issue/:id', authenticate, labourIssueCtrl.update);
app.delete('/api/v1/labour-issue/:id', authenticate, labourIssueCtrl.remove);

// Payroll — Employee (EmployeeDet)
app.get('/api/v1/payroll/employees',          authenticate, requireSupervisorOrAdmin, payrollCtrl.listEmployees);
app.get('/api/v1/payroll/employees/:empId',   authenticate, requireSupervisorOrAdmin, payrollCtrl.getEmployee);
app.post('/api/v1/payroll/employees',         authenticate, requireSupervisorOrAdmin, payrollCtrl.createEmployee);
app.patch('/api/v1/payroll/employees/:empId', authenticate, requireSupervisorOrAdmin, payrollCtrl.updateEmployee);
app.delete('/api/v1/payroll/employees/:empId', authenticate, requireAdmin,            payrollCtrl.deactivateEmployee);

// Payroll — Salary (Salary01)
app.get('/api/v1/payroll/salary/:empId/:month/:year', authenticate, requireSupervisorOrAdmin, payrollCtrl.getSalary);
app.post('/api/v1/payroll/salary',                    authenticate, requireSupervisorOrAdmin, payrollCtrl.saveSalary);

// Payroll — Clocking (jobInProgress)
app.get('/api/v1/payroll/clocking',      authenticate, payrollCtrl.listClocking);
app.post('/api/v1/payroll/clocking',     authenticate, payrollCtrl.clockIn);
app.patch('/api/v1/payroll/clocking/:id', authenticate, payrollCtrl.clockOut);

// Phase 14: Messaging & Utilities
app.get('/api/v1/mail/count', authenticate, msgCtrl.getMailCount);
app.get('/api/v1/mail', authenticate, msgCtrl.getMail);
app.post('/api/v1/mail', authenticate, msgCtrl.sendMail);
app.patch('/api/v1/mail/:id/read', authenticate, msgCtrl.markMailRead);
app.delete('/api/v1/mail/:id', authenticate, msgCtrl.deleteMail);
app.post('/api/v1/mail/reports', authenticate, msgCtrl.sendReportMail);
app.get('/api/v1/mail/reports/sent', authenticate, msgCtrl.getSentReportMails);
app.get('/api/v1/declare', authenticate, msgCtrl.getDeclareItems);
app.post('/api/v1/declare', authenticate, msgCtrl.createDeclareItem);
app.patch('/api/v1/declare/:id', authenticate, msgCtrl.updateDeclareItem);
app.delete('/api/v1/declare/:id', authenticate, msgCtrl.deleteDeclareItem);
app.post('/api/v1/utility/functions/:name', authenticate, msgCtrl.runUtility);
app.get('/api/v1/util/numto-words', authenticate, msgCtrl.numToWords);
app.get('/api/v1/companyinfo', authenticate, msgCtrl.getCompanyInfo);
app.patch('/api/v1/companyinfo', authenticate, msgCtrl.updateCompanyInfo);
app.get('/api/v1/documents/help', authenticate, msgCtrl.getDocuments);
app.get('/api/v1/dms/attachments', authenticate, msgCtrl.getDocuments);
app.post('/api/v1/dms/attachments', authenticate, msgCtrl.uploadDocument);
app.patch('/api/v1/dms/attachments/:id', authenticate, msgCtrl.updateDocument);
app.delete('/api/v1/dms/attachments/:id', authenticate, msgCtrl.deleteDocument);

// 404 handler — must be after all routes
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found.' } });
});

// Error handler
app.use(errorHandler);

export default app;
