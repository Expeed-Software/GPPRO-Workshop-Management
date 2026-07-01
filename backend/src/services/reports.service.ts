import * as repo from '../repositories/reports.repository';

type Roles = string[];
const SUP_ADMIN = ['Supervisor', 'Administrator'];
const ADMIN_ONLY = ['Administrator'];
const ALL_FINANCE = ['Accountant', 'Finance Supervisor', 'Administrator', 'Supervisor'];
const ALL_ROLES = ['Administrator', 'Supervisor', 'Standard User', 'Accountant', 'Finance Supervisor'];

function checkRole(roles: Roles, allowed: string[]) {
  if (!roles.some((r) => allowed.includes(r))) throw Object.assign(new Error('Forbidden'), { status: 403 });
}

function requireParams(params: any, required: string[]) {
  for (const f of required) if (!params?.[f]) throw Object.assign(new Error(`${f} is required (BR-121)`), { status: 422 });
}

async function log(userId: number, reportName: string, params: any) {
  await repo.writeReportAuditLog({ userId, action: `GENERATE_REPORT:${reportName}`, entityId: 0, meta: JSON.stringify(params) }).catch(() => {});
}

// Customer/Supplier
export const getCustomerOutstanding = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'CustomerOutstanding', p); return repo.getCustomerOutstandingSalesmanwise(p); };
export const getSupplierOutstanding = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'SupplierOutstanding', p); return repo.getSupplierOutstandingSummary(p); };
export const getAgewiseSummary = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'AgewiseSummary', p); return repo.getAgewiseSummary(p); };
export const getAgewiseDetails = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'AgewiseDetails', p); return repo.getAgewiseDetails(p); };

// Accounts summaries (BR-94 SUP_ADMIN)
export const getAcSummary = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'AcSummary', p); return repo.getAcSummary(p); };
export const getBalanceSheet = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'BalanceSheet', p); return repo.getAcSummaryBalanceSheet(p); };
export const getBalanceSheetNew = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'BalanceSheetNew', p); return repo.getAcSummaryBalanceSheetNew(p); };
export const getGroupBalance = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'GroupBalance', p); return repo.getGroupBalance(p); };

// P&L
export const getProfitLoss = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'ProfitLoss', p); return repo.getProfitLoss(p); };
export const getProfitLossFrm = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'ProfitLossFrm', p); return repo.getProfitLossFrm(p); };

// Sales
export const getSalesAnalysis = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'SalesAnalysis', p); return repo.getSalesAnalysis(p); };
export const getDiscountSummary = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'DiscountSummary', p); return repo.getDiscountSummary(p); };
export const getMarginReport = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'MarginReport', p); return repo.getMarginReport(p); };
export const getSalesCategorySummary = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL_FINANCE); await log(uid, 'SalesCategorySummary', p); return repo.getSalesReportCatSub(p); };
export const getSalesLabourParts = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL_FINANCE); await log(uid, 'SalesLabourParts', p); return repo.getSalesLabourParts(p); };
export const getMonthlySales = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'MonthlySales', p); return repo.getMonthlySplitSales(p); };
export const getSalesmanInvoices = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'SalesmanInvoices', p); return repo.getSalesmanInvoices(p); };
export const getSalesReportFM = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'SalesReportFM', p); return repo.getSalesReportFM(p); };

// Customer bills
export const getCustomerBillsDetailed = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'CustomerBillsDetailed', p); return repo.getCustomerBillsDetailed(p); };
export const getCustomerBillsPending = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'CustomerBillsPending', p); return repo.getCustomerBillsPending(p); };
export const getCustomerBillsSummary = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'CustomerBillsSummary', p); return repo.getCustomerBillsSummary(p); };

// Stock
export const getStockValuation = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'StockValuation', p); return repo.getStockValuationReport(p); };
export const getStockValuationSummary = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'StockValuationSummary', p); return repo.getStockValuationSummary(p); };
export const getStockAging = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'StockAging', p); return repo.getStockAgingReport(p); };
export const getStockLedger = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL_FINANCE); await log(uid, 'StockLedger', p); return repo.getStockLedger(p); };
export const getOpeningStock = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'OpeningStock', p); return repo.getOpeningStockList(p); };
export const getUsedCars = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL_ROLES); await log(uid, 'UsedCars', p); return repo.getUsedCars(p); };

// Job/work
export const getWorkInProgress = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'WorkInProgress', p); return repo.getWorkInProgress(p); };
export const getTechnicianEfficiency = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'TechnicianEfficiency', p); return repo.getTechnicianEfficiency(p); };
export const getProductsOverview = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL_ROLES); await log(uid, 'ProductsOverview', p); return repo.getProductsOverview(p); };
export const getCustomerOverview = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL_ROLES); await log(uid, 'CustomerOverview', p); return repo.getCustomerOverview(p); };

// Voucher
export const getVoucherDetailsList = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'VoucherDetails', p); return repo.getVoucherDetailsList(p); };
export const getJournalVoucherReport = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'JournalVoucher', p); return repo.getJournalVoucherReport(p); };

// Attendance/payroll
export const getEmployeeAttendance = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'EmployeeAttendance', p); return repo.getEmployeeAttendance(p); };
export const getVehicleAttendance = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'VehicleAttendance', p); return repo.getVehicleAttendance(p); };
export const getSalaryRegister = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'SalaryRegister', p); return repo.getSalaryRegister(p); };
export const getSalarySlip = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'SalarySlip', p); return repo.getSalarySlip(p); };

// Diagnostics (BR-128 admin only)
export const getDiagnosticReport1 = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'Diagnostic1', p); return repo.getDiagnosticReport1(p); };
export const getDiagnosticReport222 = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'Diagnostic222', p); return repo.getDiagnosticReport222(p); };
export const getOMastersReport = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'OMasters', p); return repo.getOMastersReport(p); };
export const getPurchaseReturnRegister = async (p: any, roles: Roles, uid: number) => { checkRole(roles, SUP_ADMIN); await log(uid, 'PurchaseReturnRegister', p); return repo.getPurchaseReturnRegister(p); };

// Company header
export const getCompanyReportHeader = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ALL_ROLES); return repo.getCompanyReportHeader(p); };
export const updateCompanyReportHeader = async (p: any, roles: Roles, uid: number) => { checkRole(roles, ADMIN_ONLY); await log(uid, 'UpdateCompanyHeader', p); return repo.updateCompanyReportHeader(p); };

// Generic report generate (BR-121 validated in FE and here)
export const generateReport = async (body: any, roles: Roles, uid: number) => {
  checkRole(roles, ALL_ROLES);
  if (!body.reportName) throw Object.assign(new Error('reportName required'), { status: 400 });
  await log(uid, body.reportName, body.params);
  return repo.writeReportAuditLog({ userId: uid, action: 'EXPORT_REPORT', entityId: 0, meta: JSON.stringify(body) });
};
