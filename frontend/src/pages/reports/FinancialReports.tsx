import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import GenericReport from './GenericReport';
import { reportsApi } from '../../api/reports';
import api from '../../api/axios';
import { downloadCsv } from '../../utils/export';


function BalanceSheetReport() {
  const [params, setParams] = useState({ fromDate: '', toDate: '' });
  const [enabled, setEnabled] = useState(false);

  const { data: raw, isLoading, refetch } = useQuery({
    queryKey: ['balance-sheet', params],
    queryFn: () => api.get('/accounts/summary-balance-sheet', { params }).then((r: any) => r.data),
    enabled,
  });

  const summary = raw?.recordset?.[0] ?? {};
  const bankAccounts: any[] = raw?.bankAccounts ?? [];

  const fmt = (v: any) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div data-testid="balance-sheet-page" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Balance Sheet</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ padding: '0.4rem 0.9rem', background: '#e2e8f0', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }} onClick={() => window.print()}>Print</button>
          <button style={{ padding: '0.4rem 0.9rem', background: '#e2e8f0', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }} onClick={() => downloadCsv('balance-sheet.csv', bankAccounts, [{ key: 'Account', label: 'Account' }, { key: 'Balance', label: 'Balance' }])}>Export</button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="date" value={params.fromDate} onChange={e => setParams(p => ({ ...p, fromDate: e.target.value }))} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
        <input type="date" value={params.toDate} onChange={e => setParams(p => ({ ...p, toDate: e.target.value }))} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
        <button onClick={() => { setEnabled(true); setTimeout(() => refetch(), 0); }} style={{ padding: '0.4rem 1.2rem', background: '#3831c4', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}>Generate</button>
      </div>

      {isLoading && <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>}

      {!isLoading && enabled && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Receivables', value: summary.receivables, sub: `${summary.receivableCount ?? 0} invoices` },
              { label: 'Payables', value: summary.payables, sub: `${summary.payableCount ?? 0} invoices` },
              { label: 'Stock Value', value: summary.stockValue, sub: `${summary.stockItemCount ?? 0} items` },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3831c4' }}>{fmt(value)}</div>
                <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sub}</div>
              </div>
            ))}
          </div>

          {bankAccounts.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Bank / Cash Accounts</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#3831c4' }}>Account</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: '#3831c4' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankAccounts.map((a: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{a.Account ?? '—'}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>{fmt(a.Balance)}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 700 }}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>Total</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>{fmt(bankAccounts.reduce((s, a) => s + Number(a.Balance || 0), 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const DATE_FILTERS = [
  { key: 'fromDate', label: 'From Date', type: 'date' as const },
  { key: 'toDate', label: 'To Date', type: 'date' as const },
];

const PL_COLS = [
  { key: 'BillCount', label: 'Bill Count' },
  { key: 'GrossRevenue', label: 'Gross Revenue', format: 'currency' as const },
  { key: 'TotalDiscount', label: 'Discount', format: 'currency' as const },
  { key: 'NetRevenue', label: 'Net Revenue', format: 'currency' as const },
  { key: 'LabourRevenue', label: 'Labour', format: 'currency' as const },
  { key: 'PartsRevenue', label: 'Parts', format: 'currency' as const },
];


const SALES_COLS = [
  { key: 'yr', label: 'Year' },
  { key: 'mth', label: 'Month' },
  { key: 'BillCount', label: 'Bills' },
  { key: 'TotalGross', label: 'Gross', format: 'currency' as const },
  { key: 'TotalNet', label: 'Net', format: 'currency' as const },
  { key: 'TotalDiscount', label: 'Discount', format: 'currency' as const },
];

const MARGIN_COLS = [
  { key: 'yr', label: 'Year' },
  { key: 'mth', label: 'Month' },
  { key: 'Revenue', label: 'Revenue', format: 'currency' as const },
  { key: 'NetRevenue', label: 'Net Revenue', format: 'currency' as const },
  { key: 'Discounts', label: 'Discounts', format: 'currency' as const },
];

const CUST_BILL_COLS = [
  { key: 'CustomerName', label: 'Customer' },
  { key: 'Bill', label: 'Invoice #' },
  { key: 'BillDt', label: 'Date' },
  { key: 'Total', label: 'Amount', format: 'currency' as const },
  { key: 'paid', label: 'Paid', format: 'currency' as const },
  { key: 'Nett', label: 'Net', format: 'currency' as const },
];

const CUST_BILL_SUMMARY_COLS = [
  { key: 'CustomerName', label: 'Customer' },
  { key: 'BillCount', label: 'Bills' },
  { key: 'TotalAmount', label: 'Amount', format: 'currency' as const },
  { key: 'TotalNett', label: 'Net', format: 'currency' as const },
  { key: 'Outstanding', label: 'Outstanding', format: 'currency' as const },
];

const ATT_COLS = [
  { key: 'Ocode', label: 'Employee ID' },
  { key: 'Oname', label: 'Name' },
  { key: 'Designation', label: 'Designation' },
  { key: 'Department', label: 'Department' },
  { key: 'JoinDate', label: 'Join Date' },
  { key: 'Active', label: 'Active' },
];

const SAL_COLS = [
  { key: 'Ocode', label: 'Employee ID' },
  { key: 'Oname', label: 'Name' },
  { key: 'Designation', label: 'Designation' },
];

export const ProfitLossReport = () => <GenericReport title="Profit & Loss" queryKey="profit-loss" fetchFn={reportsApi.profitLoss} testidPrefix="profit-loss" filters={DATE_FILTERS} columns={PL_COLS} totals={['GrossRevenue', 'TotalDiscount', 'NetRevenue']} />;
export const ProfitLossFrmReport = () => <GenericReport title="Profit & Loss (FRM)" queryKey="profit-loss-frm" fetchFn={reportsApi.profitLossFrm} testidPrefix="profit-loss-frm" filters={DATE_FILTERS} columns={PL_COLS} totals={['GrossRevenue', 'NetRevenue']} />;
export { BalanceSheetReport };
export const SalesAnalysisReport = () => <GenericReport title="Sales Analysis" queryKey="sales-analysis" fetchFn={reportsApi.salesAnalysis} testidPrefix="sales-analysis" filters={DATE_FILTERS} columns={SALES_COLS} totals={['TotalGross', 'TotalNet']} />;
export const SalesAnalysisNewReport = () => <GenericReport title="Sales Analysis (New)" queryKey="sales-analysis-new" fetchFn={reportsApi.salesAnalysis} testidPrefix="sales-analysis-new" filters={DATE_FILTERS} columns={SALES_COLS} totals={['TotalNet']} />;
export const MarginReport = () => <GenericReport title="Margin Report" queryKey="margin-report" fetchFn={reportsApi.marginReport} testidPrefix="margin-report" filters={DATE_FILTERS} columns={MARGIN_COLS} totals={['Revenue', 'NetRevenue', 'Discounts']} />;
export const MarginReportNew = () => <GenericReport title="Margin Report (New)" queryKey="margin-report-new" fetchFn={reportsApi.marginReport} testidPrefix="margin-report-new" filters={DATE_FILTERS} columns={MARGIN_COLS} totals={['NetRevenue']} />;
export const DiscountSummaryReport = () => <GenericReport title="Discount Summary" queryKey="discount-summary" fetchFn={reportsApi.discountSummary} testidPrefix="discount-summary" filters={DATE_FILTERS} columns={[{ key: 'yr', label: 'Year' }, { key: 'mth', label: 'Month' }, { key: 'BillCount', label: 'Bills' }, { key: 'TotalDiscount', label: 'Discount', format: 'currency' as const }, { key: 'DiscountPct', label: 'Discount %' }]} totals={['TotalDiscount']} />;
export const SalesCategorySummary = () => <GenericReport title="Sales by Category" queryKey="sales-category" fetchFn={reportsApi.salesCategorySummary} testidPrefix="sales-category" filters={DATE_FILTERS} columns={[{ key: 'yr', label: 'Year' }, { key: 'mth', label: 'Month' }, { key: 'TotalNet', label: 'Amount', format: 'currency' as const }]} totals={['TotalNet']} />;
export const SalesLabourPartsReport = () => <GenericReport title="Sales Labour & Parts" queryKey="sales-labour-parts" fetchFn={reportsApi.salesLabourParts} testidPrefix="sales-labour-parts" filters={DATE_FILTERS} columns={[{ key: 'yr', label: 'Year' }, { key: 'mth', label: 'Month' }, { key: 'BillCount', label: 'Bills' }, { key: 'TotalNet', label: 'Total', format: 'currency' as const }, { key: 'TotalLabour', label: 'Labour', format: 'currency' as const }, { key: 'TotalParts', label: 'Parts', format: 'currency' as const }]} totals={['TotalNet', 'TotalLabour', 'TotalParts']} />;
export const MonthlySalesReport = () => <GenericReport title="Monthly Sales" queryKey="monthly-sales" fetchFn={reportsApi.monthlySales} testidPrefix="monthly-sales" filters={[{ key: 'year', label: 'Year' }]} columns={[{ key: 'MonthName', label: 'Month' }, { key: 'BillCount', label: 'Bills' }, { key: 'TotalNet', label: 'Net', format: 'currency' as const }, { key: 'TotalLabour', label: 'Labour', format: 'currency' as const }, { key: 'TotalParts', label: 'Parts', format: 'currency' as const }]} totals={['TotalNet']} />;
export const CustomerBillsDetailedSummary = () => <GenericReport title="Customer Bills (Detailed)" queryKey="customer-bills-detailed" fetchFn={reportsApi.customerBillsDetailed} testidPrefix="customer-bills-detailed" filters={DATE_FILTERS} columns={CUST_BILL_COLS} totals={['Total', 'Nett']} />;
export const CustomerBillsPending = () => <GenericReport title="Customer Bills (Pending)" queryKey="customer-bills-pending" fetchFn={reportsApi.customerBillsPending} testidPrefix="customer-bills-pending" filters={DATE_FILTERS} columns={CUST_BILL_COLS} totals={['Nett']} />;
export const CustomerBillsPendingOld = () => <GenericReport title="Customer Bills (Pending Old)" queryKey="customer-bills-pending-old" fetchFn={reportsApi.customerBillsPending} testidPrefix="customer-bills-pending-old" filters={DATE_FILTERS} columns={CUST_BILL_COLS} totals={['Nett']} />;
export const CustomerBillsPendingAlt = () => <GenericReport title="Customer Bills (Pending Alt)" queryKey="customer-bills-pending-alt" fetchFn={reportsApi.customerBillsPending} testidPrefix="customer-bills-pending-alt" filters={DATE_FILTERS} columns={CUST_BILL_COLS} totals={['Nett']} />;
export const CustomerBillsSummaryNew = () => <GenericReport title="Customer Bills Summary (New)" queryKey="customer-bills-summary-new" fetchFn={reportsApi.customerBillsSummary} testidPrefix="customer-bills-summary-new" filters={DATE_FILTERS} columns={CUST_BILL_SUMMARY_COLS} totals={['TotalAmount', 'Outstanding']} />;
export const CustomerBillsSummary = () => <GenericReport title="Customer Bills Summary" queryKey="customer-bills-summary" fetchFn={reportsApi.customerBillsSummary} testidPrefix="customer-bills-summary" filters={DATE_FILTERS} columns={CUST_BILL_SUMMARY_COLS} totals={['TotalAmount', 'Outstanding']} />;
export const CustomerBillsSummaryAdvisorwise = () => <GenericReport title="Customer Bills (Advisor-wise)" queryKey="customer-bills-advisorwise" fetchFn={reportsApi.customerBillsSummary} testidPrefix="customer-bills-advisorwise" filters={DATE_FILTERS} columns={CUST_BILL_SUMMARY_COLS} totals={['TotalAmount']} />;
export const CustomerOutstandingReport = () => <GenericReport title="Customer Outstanding (Salesmanwise)" queryKey="customer-outstanding" fetchFn={reportsApi.customerOutstanding} testidPrefix="customer-outstanding" filters={DATE_FILTERS} columns={[{ key: 'Sman', label: 'Salesman' }, { key: 'BillCount', label: 'Bills' }, { key: 'Outstanding', label: 'Outstanding', format: 'currency' as const }]} totals={['Outstanding']} />;
export const SupplierOutstandingReport = () => <GenericReport title="Supplier Outstanding" queryKey="supplier-outstanding" fetchFn={reportsApi.supplierOutstanding} testidPrefix="supplier-outstanding" filters={DATE_FILTERS} columns={[{ key: 'SuppName', label: 'Supplier' }, { key: 'InvCount', label: 'Invoices' }, { key: 'TotalOwed', label: 'Outstanding', format: 'currency' as const }]} totals={['TotalOwed']} />;
export const VoucherDetailsReport = () => <GenericReport title="Voucher Details" queryKey="voucher-details" fetchFn={reportsApi.voucherDetails} testidPrefix="voucher-details" filters={DATE_FILTERS} columns={[{ key: 'VSRL', label: 'Voucher #' }, { key: 'DATE', label: 'Date' }, { key: 'AccountName', label: 'Account' }, { key: 'NARRATION', label: 'Narration' }, { key: 'DEBT', label: 'Debit', format: 'currency' as const }, { key: 'CRED', label: 'Credit', format: 'currency' as const }]} totals={['DEBT', 'CRED']} />;
export const VouchersDetailsListReport = () => <VoucherDetailsReport />;
export const JournalVoucherReport = () => <GenericReport title="Journal Voucher Report" queryKey="journal-voucher-report" fetchFn={reportsApi.journalVoucher} testidPrefix="journal-voucher-report" filters={DATE_FILTERS} columns={[{ key: 'VSRL', label: 'Voucher #' }, { key: 'DATE', label: 'Date' }, { key: 'AccountName', label: 'Account' }, { key: 'NARRATION', label: 'Narration' }, { key: 'DEBT', label: 'Debit', format: 'currency' as const }, { key: 'CRED', label: 'Credit', format: 'currency' as const }]} totals={['DEBT', 'CRED']} />;
export const EmployeeAttendanceReport = () => <GenericReport title="Employee Attendance" queryKey="employee-attendance" fetchFn={reportsApi.employeeAttendance} testidPrefix="employee-attendance" filters={DATE_FILTERS} columns={ATT_COLS} />;
export const VehicleAttendanceReport = () => <GenericReport title="Vehicle Attendance" queryKey="vehicle-attendance" fetchFn={reportsApi.vehicleAttendance} testidPrefix="vehicle-attendance" filters={[]} columns={[{ key: 'VehNo', label: 'Vehicle No' }, { key: 'VehMake', label: 'Make' }, { key: 'VehModel', label: 'Model' }, { key: 'CustName', label: 'Customer' }]} />;
export const SalaryRegisterReport = () => <GenericReport title="Salary Register" queryKey="salary-register" fetchFn={reportsApi.salaryRegister} testidPrefix="salary-register" filters={[{ key: 'month', label: 'Month' }, { key: 'year', label: 'Year' }]} columns={SAL_COLS} />;
export const WorkInProgressReport = () => <GenericReport title="Work In Progress" queryKey="work-in-progress" fetchFn={reportsApi.workInProgress} testidPrefix="work-in-progress" filters={DATE_FILTERS} columns={[{ key: 'Ordr', label: 'Job Card' }, { key: 'CustomerName', label: 'Customer' }, { key: 'StatusDescription', label: 'Status' }, { key: 'Nett', label: 'Net', format: 'currency' as const }, { key: 'Total', label: 'Total', format: 'currency' as const }]} totals={['Nett', 'Total']} />;
export const TechnicianEfficiencyReport = () => <GenericReport title="Technician Efficiency" queryKey="technician-efficiency" fetchFn={reportsApi.technicianEfficiency} testidPrefix="technician-efficiency" filters={DATE_FILTERS} columns={[{ key: 'staffid', label: 'Technician' }, { key: 'JobCount', label: 'Total Jobs' }, { key: 'ClosedJobs', label: 'Closed' }, { key: 'OpenJobs', label: 'Open' }, { key: 'TotalValue', label: 'Value', format: 'currency' as const }]} totals={['TotalValue']} />;
export const UsedCarsReport = () => <GenericReport title="Used Cars" queryKey="used-cars" fetchFn={reportsApi.usedCars} testidPrefix="used-cars" filters={[]} columns={[{ key: 'VehNo', label: 'Vehicle No' }, { key: 'VehMake', label: 'Make' }, { key: 'VehModel', label: 'Model' }, { key: 'VehYear', label: 'Year' }, { key: 'Color', label: 'Color' }, { key: 'CustName', label: 'Customer' }]} />;
export const DiagnosticReport1 = () => <GenericReport title="Diagnostic Report 1" queryKey="diagnostic-1" fetchFn={reportsApi.diagnostic1} testidPrefix="diagnostic-1" filters={DATE_FILTERS} columns={[{ key: 'description', label: 'Description' }, { key: 'value', label: 'Value' }]} />;
export const DiagnosticReport222 = () => <GenericReport title="Diagnostic Report 222" queryKey="diagnostic-222" fetchFn={reportsApi.diagnostic222} testidPrefix="diagnostic-222" filters={DATE_FILTERS} columns={[{ key: 'description', label: 'Description' }, { key: 'value', label: 'Value' }]} />;
export const OMastersReport = () => <GenericReport title="OMasters Report" queryKey="omasters" fetchFn={reportsApi.omasters} testidPrefix="omasters" filters={[]} columns={[{ key: 'Ocode', label: 'Code' }, { key: 'Oname', label: 'Name' }, { key: 'Designation', label: 'Designation' }, { key: 'Department', label: 'Department' }]} />;
export const SalesReportFM = () => <GenericReport title="Sales Report (FM)" queryKey="sales-fm" fetchFn={reportsApi.salesAnalysis} testidPrefix="sales-fm" filters={DATE_FILTERS} columns={SALES_COLS} totals={['TotalNet']} />;
export const SalesmanInvoicesReport = () => <GenericReport title="Salesman Invoices" queryKey="salesman-invoices" fetchFn={reportsApi.salesmanInvoices} testidPrefix="salesman-invoices" filters={DATE_FILTERS} columns={[{ key: 'Sman', label: 'Salesman' }, { key: 'BillCount', label: 'Count' }, { key: 'TotalNet', label: 'Total', format: 'currency' as const }]} totals={['TotalNet']} />;
