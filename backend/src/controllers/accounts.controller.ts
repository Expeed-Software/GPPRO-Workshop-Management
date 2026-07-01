import { Request, Response } from 'express';
import * as svc from '../services/accounts.service';

const roles = (req: Request): string[] => (req as any).user?.roles ?? [];
const userId = (req: Request): number => (req as any).user?.id ?? 0;

function h(fn: () => Promise<any>, res: Response) {
  fn().then((data) => res.json({ success: true, data })).catch((err) => {
    const status = err.status ?? err.statusCode ?? 500;
    res.status(status).json({ success: false, error: { code: err.code ?? 'ERROR', message: err.message } });
  });
}

export const listHeads = (req: Request, res: Response) => h(() => svc.getAccountHeads(req.query as any), res);
export const getTree = (req: Request, res: Response) => h(() => svc.getAccountHeadTree(req.query as any), res);
export const getSummary = (req: Request, res: Response) => h(() => svc.getAccountSummary(req.query as any), res);
export const getBalanceSheet = (req: Request, res: Response) => h(() => svc.getAccountBalanceSheet(req.query as any), res);
export const getModLog = (req: Request, res: Response) => h(() => svc.getAccountModificationLog(req.query as any, roles(req)), res);
export const createHead = (req: Request, res: Response) => h(() => svc.createAcHead(req.body, roles(req), userId(req)), res);
export const updateHead = (req: Request, res: Response) => h(() => svc.updateAcHead(req.params.code, req.body, roles(req), userId(req)), res);
export const deleteHead = (req: Request, res: Response) => h(() => svc.deleteAcHead(req.params.code, roles(req), userId(req)), res);
export const bulkImportHeads = (req: Request, res: Response) => h(() => svc.bulkImportAcHead(req.body, roles(req), userId(req)), res);
export const resortHeads = (req: Request, res: Response) => h(() => svc.resortAcHead(req.body, roles(req), userId(req)), res);
export const createGroupHead = (req: Request, res: Response) => h(() => svc.createAcGroupHead(req.body, roles(req), userId(req)), res);
export const editGroup = (req: Request, res: Response) => h(() => svc.editAccountHeadGroup(req.params.id, req.body, roles(req), userId(req)), res);
export const deleteGroupHead = (req: Request, res: Response) => h(() => svc.deleteAcGroupHead(req.params.id, roles(req), userId(req)), res);
export const getLedger = (req: Request, res: Response) => h(() => svc.getLedgerReport(req.query as any, roles(req), userId(req)), res);
export const getLedgerActualDate = (req: Request, res: Response) => h(() => svc.getLedgerActualDateReport(req.query as any, roles(req), userId(req)), res);
export const getLedgerPdc = (req: Request, res: Response) => h(() => svc.getLedgerPdcReport(req.query as any), res);
export const getLedgerSummary = (req: Request, res: Response) => h(() => svc.getLedgerSummaryReport(req.query as any), res);
export const getLedgerSummaryActual = (req: Request, res: Response) => h(() => svc.getLedgerSummaryActual(req.query as any), res);
export const getLedgerShort = (req: Request, res: Response) => h(() => svc.getLedgerShortReport(req.query as any), res);
export const getLedgerAudit = (req: Request, res: Response) => h(() => svc.getLedgerAccountsAudit(req.query as any, roles(req)), res);
export const getGroupLedger = (req: Request, res: Response) => h(() => svc.getGroupLedgerSummary(req.query as any), res);
export const listVouchers = (req: Request, res: Response) => h(() => svc.getVoucherList(req.query as any), res);
export const getVoucherDetails = (req: Request, res: Response) => h(() => svc.getVoucherDetails(req.params.vsrl), res);
export const getDailyList = (req: Request, res: Response) => h(() => svc.getDailyVoucherList(req.query as any), res);
export const getVoucherReport = (req: Request, res: Response) => h(() => svc.getVoucherListReport(req.query as any), res);
export const getVoucherDetailsReport = (req: Request, res: Response) => h(() => svc.getVoucherDetailsListReport(req.query as any), res);
export const listJournalVouchers = (req: Request, res: Response) => h(() => svc.getJournalVoucherList(req.query as any), res);
export const createJournalVoucher = (req: Request, res: Response) => h(() => svc.createJournalVoucherEntry(req.body, roles(req), userId(req)), res);
export const bulkJournalImport = (req: Request, res: Response) => h(() => svc.writeBulkJournalVoucher(req.body, roles(req), userId(req)), res);
export const bulkPDCReceipt = (req: Request, res: Response) => h(() => svc.writeBulkPDCReceipt(req.body, roles(req), userId(req)), res);
export const bulkPDCTransactions = (req: Request, res: Response) => h(() => svc.writeBulkPDCVoucher(req.body, roles(req), userId(req)), res);
export const getTrialBalance = (req: Request, res: Response) => h(() => svc.getTrialBalance(req.query as any), res);
export const getTrialBalanceSummary = (req: Request, res: Response) => h(() => svc.getTrialBalanceSummary(req.query as any), res);
export const getTrialBalanceTest = (req: Request, res: Response) => h(() => svc.getTrialBalanceTest(req.query as any), res);
export const getTrialBalanceTest111 = (req: Request, res: Response) => h(() => svc.getTrialBalanceTest111(req.query as any), res);
