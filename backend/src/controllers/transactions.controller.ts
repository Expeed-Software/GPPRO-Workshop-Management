import { Request, Response } from 'express';
import * as paySvc from '../services/payments.service';
import * as recSvc from '../services/receipts.service';
import * as pcSvc from '../services/pettycash.service';
import * as vchSvc from '../services/vouchers.service';

type Roles = string[];
const roles = (req: Request): Roles => (req as any).user?.roles ?? [];
const userId = (req: Request): number => (req as any).user?.id ?? 0;

function h(fn: () => any, res: Response) {
  Promise.resolve().then(() => fn()).then((data) => res.json({ success: true, data })).catch((err) => {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? 'FORBIDDEN' : status === 422 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message: err.message } });
  });
}

// Payments
export const listPayments = (req: Request, res: Response) => h(() => paySvc.getPayments(req.query, roles(req)), res);
export const createPayment = (req: Request, res: Response) => h(() => paySvc.createPayment(req.body, roles(req), userId(req)), res);
export const updatePayment = (req: Request, res: Response) => h(() => paySvc.updatePaymentStatus({ ...req.body, id: req.params.id }, roles(req), userId(req)), res);
export const deletePayment = (req: Request, res: Response) => h(() => paySvc.deletePayment({ id: req.params.id }, roles(req), userId(req)), res);
export const finalizePayments = (req: Request, res: Response) => h(() => paySvc.finalizePayments(req.body, roles(req), userId(req)), res);
export const approvePaymentBatch = (req: Request, res: Response) => h(() => paySvc.approvePaymentBatch(req.body, roles(req), userId(req)), res);
export const getPaymentReport = (req: Request, res: Response) => h(() => paySvc.getPaymentReport(req.query, roles(req)), res);

// Receipts
export const listReceipts = (req: Request, res: Response) => h(() => recSvc.getReceipts(req.query, roles(req)), res);
export const createReceipt = (req: Request, res: Response) => h(() => recSvc.createReceipt(req.body, roles(req), userId(req)), res);
export const deleteReceipt = (req: Request, res: Response) => h(() => recSvc.deleteReceipt({ id: req.params.id }, roles(req), userId(req)), res);
export const approveReceiptBatch = (req: Request, res: Response) => h(() => recSvc.approveReceiptBatch(req.body, roles(req), userId(req)), res);
export const getReceiptBackup = (req: Request, res: Response) => h(() => recSvc.getReceiptBackup(req.query, roles(req)), res);
export const restoreReceiptBackup = (req: Request, res: Response) => h(() => recSvc.restoreReceiptBackup(req.body, roles(req), userId(req)), res);
export const getReceiptBackupReport = (req: Request, res: Response) => h(() => recSvc.getReceiptBackupReport(req.query, roles(req)), res);
export const getAutoReceipts = (req: Request, res: Response) => h(() => recSvc.getAutoReceipts(req.query, roles(req)), res);
export const insertAutoReceipts = (req: Request, res: Response) => h(() => recSvc.insertAutoReceipts(req.body, roles(req), userId(req)), res);
export const getReceiptReport = (req: Request, res: Response) => h(() => recSvc.getReceiptReport(req.query, roles(req)), res);

// Petty Cash
export const listPettyCash = (req: Request, res: Response) => h(() => pcSvc.getPettyCash(req.query, roles(req)), res);
export const createPettyCash = (req: Request, res: Response) => h(() => pcSvc.createPettyCash(req.body, roles(req), userId(req)), res);
export const updatePettyCash = (req: Request, res: Response) => h(() => pcSvc.updatePettyCash({ ...req.body, id: req.params.id }, roles(req), userId(req)), res);
export const deletePettyCash = (req: Request, res: Response) => h(() => pcSvc.deletePettyCash({ id: req.params.id }, roles(req), userId(req)), res);
export const approvePettyCashBatch = (req: Request, res: Response) => h(() => pcSvc.approvePettyCashBatch(req.body, roles(req), userId(req)), res);

// Vouchers
export const listVouchers = (req: Request, res: Response) => h(() => vchSvc.getVouchers(req.query, roles(req)), res);
export const listVouchersNew = (req: Request, res: Response) => h(() => vchSvc.getVouchersNew(req.query, roles(req)), res);
export const listVouchersPdc = (req: Request, res: Response) => h(() => vchSvc.getVouchersPdc(req.query, roles(req)), res);
export const getVoucherSummary = (req: Request, res: Response) => h(() => vchSvc.getVoucherSummary(req.query, roles(req)), res);
export const getVoucherSummaryPdc = (req: Request, res: Response) => h(() => vchSvc.getVoucherSummaryPdc(req.query, roles(req)), res);
export const getVoucherDetails = (req: Request, res: Response) => h(() => vchSvc.getVoucherDetails({ ...req.query, vsrl: req.params.vsrl }, roles(req)), res);
export const getAccountVouchers = (req: Request, res: Response) => h(() => vchSvc.getAccountVouchers({ ...req.query, code: req.params.code }, roles(req)), res);
export const createVoucher = (req: Request, res: Response) => h(() => vchSvc.createVoucher(req.body, roles(req), userId(req)), res);
export const createVoucherBulk = (req: Request, res: Response) => h(() => vchSvc.createVoucherBulk(req.body, roles(req), userId(req)), res);
export const approveVoucherBatch = (req: Request, res: Response) => h(() => vchSvc.approveVoucherBatch(req.body, roles(req), userId(req)), res);
export const deleteVoucher = (req: Request, res: Response) => h(() => vchSvc.deleteVoucher({ id: req.params.id }, roles(req), userId(req)), res);
export const createPdcIssue = (req: Request, res: Response) => h(() => vchSvc.createPdcIssue(req.body, roles(req), userId(req)), res);
export const createPdcReceipt = (req: Request, res: Response) => h(() => vchSvc.createPdcReceipt(req.body, roles(req), userId(req)), res);
