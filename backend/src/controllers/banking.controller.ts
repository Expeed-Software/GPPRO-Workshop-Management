import { Request, Response } from 'express';
import * as svc from '../services/banking.service';

type Roles = string[];
const roles = (req: Request): Roles => (req as any).user?.roles ?? [];
const userId = (req: Request): number => (req as any).user?.id ?? 0;

function h(fn: () => Promise<any>, res: Response) {
  fn().then((data) => res.json({ success: true, data })).catch((err) => {
    const status = err.status ?? err.statusCode ?? 500;
    res.status(status).json({ success: false, error: { code: err.code ?? 'ERROR', message: err.message } });
  });
}

export const getBankBook = (req: Request, res: Response) => h(() => svc.getBankBook(req.query as any, roles(req), userId(req)), res);
export const getCBPBook = (req: Request, res: Response) => h(() => svc.getCBPBook(req.query as any, roles(req), userId(req)), res);
export const getBankReconciliation = (req: Request, res: Response) => h(() => svc.getBankReconciliation(req.query as any, roles(req), userId(req)), res);
export const importBankStatement = (req: Request, res: Response) => h(() => svc.importBankStatement(req.body, roles(req), userId(req)), res);
export const saveBankReconciliation = (req: Request, res: Response) => h(() => svc.saveBankReconciliation({ ...req.body, reconId: req.params.reconId }, roles(req), userId(req)), res);
export const getBankAccountsForRecon = (req: Request, res: Response) => h(() => svc.getBankAccountsForRecon(roles(req)), res);
export const getReconLog = (req: Request, res: Response) => h(() => svc.getReconLog(req.query as any, roles(req), userId(req)), res);
export const getReconciliationAttachments = (req: Request, res: Response) => h(() => svc.getReconciliationAttachments(req.params.reconId, roles(req)), res);
export const uploadReconciliationAttachment = (req: Request, res: Response) => h(() => svc.uploadReconciliationAttachment({ ...req.body, reconId: req.params.reconId }, roles(req), userId(req)), res);
export const deleteReconciliationAttachment = (req: Request, res: Response) => h(() => svc.deleteReconciliationAttachment(req.params.id, roles(req), userId(req)), res);
export const getPendingBillsLetter = (req: Request, res: Response) => h(() => svc.getPendingBillsLetter(req.query as any, roles(req), userId(req)), res);
export const getAuditSupportLogs = (req: Request, res: Response) => h(() => svc.getAuditSupportLogs(req.query as any, roles(req), userId(req)), res);
export const resolveAuditLog = (req: Request, res: Response) => h(() => svc.resolveAuditLog(req.body, roles(req), userId(req)), res);
export const getMissingAcSerials = (req: Request, res: Response) => h(() => svc.getMissingAcSerials(req.query as any, roles(req)), res);
export const patchMissingAcSrl = (req: Request, res: Response) => h(() => svc.patchMissingAcSrl(req.params.id, req.body.serial, roles(req), userId(req)), res);
export const getPDCVouchers = (req: Request, res: Response) => h(() => svc.getPDCVouchers(req.query as any, roles(req)), res);
export const insertVoucher = (req: Request, res: Response) => h(() => svc.insertVoucher(req.body, roles(req), userId(req)), res);
export const updateVoucher = (req: Request, res: Response) => h(() => svc.updateVoucher(req.params.vsrl, req.body, roles(req), userId(req)), res);
export const deleteVoucher = (req: Request, res: Response) => h(() => svc.deleteVoucher(req.params.vsrl, roles(req), userId(req)), res);
