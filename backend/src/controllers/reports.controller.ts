import { Request, Response } from 'express';
import * as svc from '../services/reports.service';

type Roles = string[];
const roles = (req: Request): Roles => (req as any).user?.roles ?? [];
const uid = (req: Request): number => (req as any).user?.id ?? 0;

function h(fn: () => Promise<any>, res: Response) {
  fn().then((data) => res.json({ success: true, data })).catch((err) => {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: { code: status === 403 ? 'FORBIDDEN' : status === 422 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message: err.message } });
  });
}

export const listReports = (_req: Request, res: Response) => res.json({ success: true, data: [] });
export const generateReport = (req: Request, res: Response) => h(() => svc.generateReport(req.body, roles(req), uid(req)), res);
export const exportReport = (req: Request, res: Response) => h(() => svc.generateReport({ ...req.body, export: true }, roles(req), uid(req)), res);
export const mailReport = (req: Request, res: Response) => h(() => svc.generateReport({ ...req.body, mail: true }, roles(req), uid(req)), res);

export const getCustomerOutstanding = (req: Request, res: Response) => h(() => svc.getCustomerOutstanding(req.query, roles(req), uid(req)), res);
export const getSupplierOutstanding = (req: Request, res: Response) => h(() => svc.getSupplierOutstanding(req.query, roles(req), uid(req)), res);
export const getAgewiseSummary = (req: Request, res: Response) => h(() => svc.getAgewiseSummary(req.query, roles(req), uid(req)), res);
export const getAgewiseDetails = (req: Request, res: Response) => h(() => svc.getAgewiseDetails(req.query, roles(req), uid(req)), res);

export const getAcSummary = (req: Request, res: Response) => h(() => svc.getAcSummary(req.query, roles(req), uid(req)), res);
export const getBalanceSheet = (req: Request, res: Response) => h(() => svc.getBalanceSheet(req.query, roles(req), uid(req)), res);
export const getBalanceSheetNew = (req: Request, res: Response) => h(() => svc.getBalanceSheetNew(req.query, roles(req), uid(req)), res);
export const getGroupBalance = (req: Request, res: Response) => h(() => svc.getGroupBalance(req.query, roles(req), uid(req)), res);

export const getProfitLoss = (req: Request, res: Response) => h(() => svc.getProfitLoss(req.query, roles(req), uid(req)), res);
export const getProfitLossFrm = (req: Request, res: Response) => h(() => svc.getProfitLossFrm(req.query, roles(req), uid(req)), res);

export const getSalesAnalysis = (req: Request, res: Response) => h(() => svc.getSalesAnalysis(req.query, roles(req), uid(req)), res);
export const getDiscountSummary = (req: Request, res: Response) => h(() => svc.getDiscountSummary(req.query, roles(req), uid(req)), res);
export const getMarginReport = (req: Request, res: Response) => h(() => svc.getMarginReport(req.query, roles(req), uid(req)), res);
export const getSalesCategorySummary = (req: Request, res: Response) => h(() => svc.getSalesCategorySummary(req.query, roles(req), uid(req)), res);
export const getSalesLabourParts = (req: Request, res: Response) => h(() => svc.getSalesLabourParts(req.query, roles(req), uid(req)), res);
export const getMonthlySales = (req: Request, res: Response) => h(() => svc.getMonthlySales(req.query, roles(req), uid(req)), res);
export const getSalesmanInvoices = (req: Request, res: Response) => h(() => svc.getSalesmanInvoices(req.query, roles(req), uid(req)), res);
export const getSalesReportFM = (req: Request, res: Response) => h(() => svc.getSalesReportFM(req.query, roles(req), uid(req)), res);

export const getCustomerBillsDetailed = (req: Request, res: Response) => h(() => svc.getCustomerBillsDetailed(req.query, roles(req), uid(req)), res);
export const getCustomerBillsPending = (req: Request, res: Response) => h(() => svc.getCustomerBillsPending(req.query, roles(req), uid(req)), res);
export const getCustomerBillsSummary = (req: Request, res: Response) => h(() => svc.getCustomerBillsSummary(req.query, roles(req), uid(req)), res);

export const getStockValuation = (req: Request, res: Response) => h(() => svc.getStockValuation(req.query, roles(req), uid(req)), res);
export const getStockValuationSummary = (req: Request, res: Response) => h(() => svc.getStockValuationSummary(req.query, roles(req), uid(req)), res);
export const getStockAging = (req: Request, res: Response) => h(() => svc.getStockAging(req.query, roles(req), uid(req)), res);
export const getStockLedger = (req: Request, res: Response) => h(() => svc.getStockLedger(req.query, roles(req), uid(req)), res);
export const getOpeningStock = (req: Request, res: Response) => h(() => svc.getOpeningStock(req.query, roles(req), uid(req)), res);
export const getUsedCars = (req: Request, res: Response) => h(() => svc.getUsedCars(req.query, roles(req), uid(req)), res);

export const getWorkInProgress = (req: Request, res: Response) => h(() => svc.getWorkInProgress(req.query, roles(req), uid(req)), res);
export const getTechnicianEfficiency = (req: Request, res: Response) => h(() => svc.getTechnicianEfficiency(req.query, roles(req), uid(req)), res);
export const getProductsOverview = (req: Request, res: Response) => h(() => svc.getProductsOverview(req.query, roles(req), uid(req)), res);
export const getCustomerOverview = (req: Request, res: Response) => h(() => svc.getCustomerOverview(req.query, roles(req), uid(req)), res);

export const getVoucherDetailsList = (req: Request, res: Response) => h(() => svc.getVoucherDetailsList(req.query, roles(req), uid(req)), res);
export const getJournalVoucherReport = (req: Request, res: Response) => h(() => svc.getJournalVoucherReport(req.query, roles(req), uid(req)), res);

export const getEmployeeAttendance = (req: Request, res: Response) => h(() => svc.getEmployeeAttendance(req.query, roles(req), uid(req)), res);
export const getVehicleAttendance = (req: Request, res: Response) => h(() => svc.getVehicleAttendance(req.query, roles(req), uid(req)), res);
export const getSalaryRegister = (req: Request, res: Response) => h(() => svc.getSalaryRegister(req.query, roles(req), uid(req)), res);
export const getSalarySlip = (req: Request, res: Response) => h(() => svc.getSalarySlip({ ...req.query, ...req.params }, roles(req), uid(req)), res);

export const getDiagnosticReport1 = (req: Request, res: Response) => h(() => svc.getDiagnosticReport1(req.query, roles(req), uid(req)), res);
export const getDiagnosticReport222 = (req: Request, res: Response) => h(() => svc.getDiagnosticReport222(req.query, roles(req), uid(req)), res);
export const getOMastersReport = (req: Request, res: Response) => h(() => svc.getOMastersReport(req.query, roles(req), uid(req)), res);
export const getPurchaseReturnRegister = (req: Request, res: Response) => h(() => svc.getPurchaseReturnRegister(req.query, roles(req), uid(req)), res);
export const getCompanyReportHeader = (req: Request, res: Response) => h(() => svc.getCompanyReportHeader(req.query, roles(req), uid(req)), res);
export const updateCompanyReportHeader = (req: Request, res: Response) => h(() => svc.updateCompanyReportHeader(req.body, roles(req), uid(req)), res);
