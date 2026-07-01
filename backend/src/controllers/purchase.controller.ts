import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/purchase.service';
import { sendSuccess } from '../utils/response';

const h = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => fn;

export const listOrders = h(async (req, res, next) => { try { sendSuccess(res, await svc.listLocalPurchaseOrders(req.query, req.user!)); } catch (e) { next(e); } });
export const createLocalOrder = h(async (req, res, next) => { try { res.status(201); sendSuccess(res, await svc.createLocalPurchaseOrder(req.body, req.user!)); } catch (e) { next(e); } });
export const createForeignOrder = h(async (req, res, next) => { try { res.status(201); sendSuccess(res, await svc.createForeignPurchaseOrder(req.body, req.user!)); } catch (e) { next(e); } });
export const updateOrder = h(async (req, res, next) => { try { await svc.updatePurchaseOrder(req.params.id, req.body, req.user!); sendSuccess(res, { message: 'PO updated.' }); } catch (e) { next(e); } });
export const deleteOrder = h(async (req, res, next) => { try { await svc.deletePurchaseOrder(req.params.id, req.user!); sendSuccess(res, { message: 'PO deleted.' }); } catch (e) { next(e); } });
export const approveOrder = h(async (req, res, next) => { try { await svc.approvePurchaseOrder(req.params.id, req.body.approvalNote, req.user!); sendSuccess(res, { message: 'PO approved.' }); } catch (e) { next(e); } });
export const bulkImport = h(async (req, res, next) => { try { sendSuccess(res, await svc.bulkImportPurchaseOrders(req.body, req.user!)); } catch (e) { next(e); } });
export const bulkExport = h(async (req, res, next) => { try { sendSuccess(res, await svc.bulkExportPurchaseOrders(req.query, req.user!)); } catch (e) { next(e); } });

export const getPendingDOs = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPendingPurchaseDOs(req.query, req.user!)); } catch (e) { next(e); } });
export const createDO = h(async (req, res, next) => { try { res.status(201); sendSuccess(res, await svc.createPurchaseDO(req.body, req.user!)); } catch (e) { next(e); } });
export const updateDO = h(async (req, res, next) => { try { await svc.updatePurchaseDO(req.params.id, req.body, req.user!); sendSuccess(res, { message: 'DO updated.' }); } catch (e) { next(e); } });
export const deleteDO = h(async (req, res, next) => { try { await svc.deletePurchaseDO(req.params.id, req.user!); sendSuccess(res, { message: 'DO deleted.' }); } catch (e) { next(e); } });
export const bulkReceipt = h(async (req, res, next) => { try { sendSuccess(res, await svc.bulkReceiptDOs(req.body, req.user!)); } catch (e) { next(e); } });

export const getDOItemRegister = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseDOItemRegister(req.query, req.user!)); } catch (e) { next(e); } });
export const getLPOAnalysis = h(async (req, res, next) => { try { sendSuccess(res, await svc.getLPOAnalysis(req.query, req.user!)); } catch (e) { next(e); } });
export const getLPODetailsReport = h(async (req, res, next) => { try { sendSuccess(res, await svc.getLPODetailsReport(req.query, req.user!)); } catch (e) { next(e); } });
export const getPurchaseRegAC = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseRegAC(req.query, req.user!)); } catch (e) { next(e); } });
export const getPurchaseRegImport = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseRegImport(req.query, req.user!)); } catch (e) { next(e); } });
export const getPurchaseRegLocal = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseRegLocal(req.query, req.user!)); } catch (e) { next(e); } });
export const getPurchaseRegSuppLocal = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseRegSuppLocal(req.query, req.user!)); } catch (e) { next(e); } });
export const getPurchaseReturnBills = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseReturnBillReport(req.query, req.user!)); } catch (e) { next(e); } });
export const getPurchaseBillImport = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseBillImport(req.query, req.user!)); } catch (e) { next(e); } });
export const getPurchaseBillLocal = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseBillLocal(req.query, req.user!)); } catch (e) { next(e); } });
export const getSupplierBillwisePending = h(async (req, res, next) => { try { sendSuccess(res, await svc.getSupplierBillwisePending(req.query, req.user!)); } catch (e) { next(e); } });
export const getSupplierBillwiseBoth = h(async (req, res, next) => { try { sendSuccess(res, await svc.getSupplierBillwisePendingBoth(req.query, req.user!)); } catch (e) { next(e); } });
export const getSupplierBillwiseForeign = h(async (req, res, next) => { try { sendSuccess(res, await svc.getSupplierBillwisePendingForeign(req.query, req.user!)); } catch (e) { next(e); } });
export const getSupplierBillwiseLocal = h(async (req, res, next) => { try { sendSuccess(res, await svc.getSupplierBillwisePendingLocal(req.query, req.user!)); } catch (e) { next(e); } });
export const getSupplierBillwiseForeignOld = h(async (req, res, next) => { try { sendSuccess(res, await svc.getSupplierBillwisePendingForeignOld(req.query, req.user!)); } catch (e) { next(e); } });
export const getPendingDOReport = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPendingPurchaseDOReport(req.query, req.user!)); } catch (e) { next(e); } });
export const getPurchaseItemReports = h(async (req, res, next) => { try { sendSuccess(res, await svc.getPurchaseItemReports(req.query, req.user!)); } catch (e) { next(e); } });
export const getProdRequests = h(async (req, res, next) => { try { sendSuccess(res, await svc.getProdRequests(req.query, req.user!)); } catch (e) { next(e); } });
