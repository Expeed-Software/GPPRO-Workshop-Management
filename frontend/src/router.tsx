import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalLoader } from './components/GlobalLoader';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { SignIn } from './pages/auth/SignIn';
import { ChangePassword } from './pages/auth/ChangePassword';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { OdbcSignIn } from './pages/auth/OdbcSignIn';
import { Dashboard } from './pages/Dashboard';
import { UserLogReport } from './pages/admin/UserLogReport';
import { UserList } from './pages/admin/UserList';
import { UserForm } from './pages/admin/UserForm';
import { UserDetail } from './pages/admin/UserDetail';
import { UserRights } from './pages/admin/UserRights';
import { EmployeeList } from './pages/admin/EmployeeList';
import { LegacyUserManagement } from './pages/admin/LegacyUserManagement';
import { CustomerList } from './pages/crm/CustomerList';
import { CustomerForm } from './pages/crm/CustomerForm';
import { CustomerDetail } from './pages/crm/CustomerDetail';
import { SupplierList } from './pages/crm/SupplierList';
import { SupplierForm } from './pages/crm/SupplierForm';
import { ContactList } from './pages/crm/ContactList';
import { ContactForm } from './pages/crm/ContactForm';
import { VehicleList } from './pages/crm/VehicleList';
import { VehicleForm } from './pages/crm/VehicleForm';
import { MergeDuplicates } from './pages/crm/MergeDuplicates';
import { AgewiseSummary } from './pages/crm/AgewiseSummary';
import { AttachmentManager } from './pages/documents/AttachmentManager';
import { DocumentMenu } from './pages/documents/DocumentMenu';
import { DocumentEntry } from './pages/documents/DocumentEntry';
import { DocumentHeadManagement } from './pages/documents/DocumentHeadManagement';
import { AdditionalRemarksReport } from './pages/documents/AdditionalRemarksReport';
import EstimationEntry from './pages/jobs/EstimationEntry';
import EstimationList from './pages/jobs/EstimationList';
import EstimationApproval from './pages/jobs/EstimationApproval';
import JobOrderStatus from './pages/jobs/JobOrderStatus';
import JobStatusMaster from './pages/jobs/JobStatusMaster';
import JobStatusHelp from './pages/jobs/JobStatusHelp';
import WorkStatus from './pages/jobs/WorkStatus';
import WorkStatusManagement from './pages/jobs/WorkStatusManagement';
import WorkStatusReport from './pages/jobs/WorkStatusReport';
import WorkStatusSummary from './pages/jobs/WorkStatusSummary';
import PendingJobCardHelp from './pages/jobs/PendingJobCardHelp';
import StatusAdvisorWise from './pages/jobs/StatusAdvisorWise';
import JobAuditLogs from './pages/jobs/JobAuditLogs';
import SalesOrderList from './pages/sales/SalesOrderList';
import SalesOrderEntry from './pages/sales/SalesOrderEntry';
import SalesOrderView from './pages/sales/SalesOrderView';
import ChangeOrderCustomer from './pages/sales/ChangeOrderCustomer';
import SalesOrderHelp from './pages/sales/SalesOrderHelp';
import OrderStatus from './pages/sales/OrderStatus';
import OrderStatusReport from './pages/sales/OrderStatusReport';
import PendingOrdersList from './pages/sales/PendingOrdersList';
import PendingOrderRegister from './pages/sales/PendingOrderRegister';
import SalesOrderReport from './pages/sales/SalesOrderReport';
import DeliveryNoteEntry from './pages/sales/DeliveryNoteEntry';
import LabourIssue from './pages/sales/LabourIssue';
import { EmployeeEntry } from './pages/admin/EmployeeEntry';
import SalaryEntry from './pages/payroll/SalaryEntry';
import ClockingEntry from './pages/payroll/ClockingEntry';
import DeliveryLog from './pages/sales/DeliveryLog';
import DeliveryNoteReport from './pages/sales/DeliveryNoteReport';
import DeliveryNotePrint from './pages/sales/DeliveryNotePrint';
import LocalPurchaseEntry from './pages/purchase/LocalPurchaseEntry';
import ForeignPurchaseEntry from './pages/purchase/ForeignPurchaseEntry';
import LocalPOManagement from './pages/purchase/LocalPOManagement';
import PendingPurchaseDO from './pages/purchase/PendingPurchaseDO';
import {
  PurchaseOrderReport, PurchaseDOItemRegister, PurchaseDOItemSummary, PendingPurchaseDOReport,
  PurchaseDO01PDOReport, LPOAnalysis, LPODetailsReport, PurchaseRegAC, PurchaseRegImported,
  PurchaseRegLocal, PurchaseRegSuppLocal, PurchaseReturnBill, PurchaseBillImport, PurchaseBillLocal,
  SupplierBillwisePending, PurchaseItemReports, ProdRequest,
} from './pages/purchase/PurchaseReport';
import ItemList from './pages/inventory/ItemList';
import ItemsHelp from './pages/inventory/ItemsHelp';
import InventoryHelp from './pages/inventory/InventoryHelp';
import ItemDOList from './pages/inventory/ItemDOList';
import ItemDOSummary from './pages/inventory/ItemDOSummary';
import ItemPendingDOList from './pages/inventory/ItemPendingDOList';
import StockInEntry from './pages/inventory/StockInEntry';
import StockOutEntry from './pages/inventory/StockOutEntry';
import ManualAdjustment from './pages/inventory/ManualAdjustment';
import PhysicalAdjustment from './pages/inventory/PhysicalAdjustment';
import StockAvailability from './pages/inventory/StockAvailability';
import StockDisplay from './pages/inventory/StockDisplay';
import StockLedger from './pages/inventory/StockLedger';
import StockValuation from './pages/inventory/StockValuation';
import StockAgingReport from './pages/inventory/StockAgingReport';
import StockInList from './pages/inventory/StockInList';
import StockOutList from './pages/inventory/StockOutList';
import StockReorderStatus from './pages/inventory/StockReorderStatus';
import { StockStatementMain, StockStatement1, StockStatementFromItemFile, StockStatementDD } from './pages/inventory/StockStatements';
import StockAuditLog from './pages/inventory/StockAuditLog';
import BankBook, { CashBook } from './pages/banking/BankBook';
import BankReconciliation from './pages/banking/BankReconciliation';
import SelectBankForReconciliation from './pages/banking/SelectBankForReconciliation';
import CBPBook from './pages/banking/CBPBook';
import PendingBillsLetter from './pages/banking/PendingBillsLetter';
import AuditSupport from './pages/banking/AuditSupport';
import MissingAcSerials from './pages/banking/MissingAcSerials';
import PDCVouchers, { PDCReceiptVouchers } from './pages/banking/PDCVouchers';
import AccountHeadList from './pages/accounts/AccountHeadList';
import { AccountTreeListView } from './pages/accounts/AccountTree';
import AccountTree from './pages/accounts/AccountTree';
import AccountHeadHelp from './pages/accounts/AccountHeadHelp';
import AccountHeadResort from './pages/accounts/AccountHeadResort';
import AccountSelector from './pages/accounts/AccountSelector';
import AccountModificationLog from './pages/accounts/AccountModificationLog';
import { LedgerReportPage, LedgerActualDateReport, LedgerPDCReport, LedgerSummaryReport, LedgerSummaryActual, LedgerShortReport, GroupLedgerSummary, LedgerAccountsAudit } from './pages/accounts/LedgerReports';
import { VoucherListReport, VoucherDailyList, VoucherDetailsListReport, JournalVoucherList } from './pages/accounts/VoucherList';
import JournalVoucherEntry, { BulkJournalVoucherEntry, BulkPDCReceiptTransactions, BulkPDCTransactions } from './pages/accounts/JournalVoucherEntry';
import { TrialBalance, TrialBalanceSummary, TrialBalanceTest, TrialBalanceTest111 } from './pages/accounts/TrialBalance';
import PaymentEntry from './pages/transactions/PaymentEntry';
import ReceiptEntry from './pages/transactions/ReceiptEntry';
import PettyCashEntry from './pages/transactions/PettyCashEntry';
import PaymentFinalization from './pages/transactions/PaymentFinalization';
import { PendingAddPayment, PendingAddReceipt } from './pages/transactions/PendingBatch';
import { ReceiptsReport, PaymentsReport, ReceiptsBackupReport } from './pages/transactions/TransactionReports';
import ReceiptsBackup from './pages/transactions/ReceiptsBackup';
import AutoReceiptEntry from './pages/transactions/AutoReceiptEntry';
import AccountVoucherDisplay from './pages/transactions/AccountVoucherDisplay';
import VoucherHelp from './pages/transactions/VoucherHelp';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import { ProfitLossReport, ProfitLossFrmReport, BalanceSheetReport, SalesAnalysisReport, SalesAnalysisNewReport, MarginReport, MarginReportNew, DiscountSummaryReport, SalesCategorySummary, SalesLabourPartsReport, MonthlySalesReport, CustomerBillsDetailedSummary, CustomerBillsPending, CustomerBillsPendingOld, CustomerBillsPendingAlt, CustomerBillsSummaryNew, CustomerBillsSummary, CustomerBillsSummaryAdvisorwise, CustomerOutstandingReport, SupplierOutstandingReport, VoucherDetailsReport, VouchersDetailsListReport, JournalVoucherReport, EmployeeAttendanceReport, VehicleAttendanceReport, SalaryRegisterReport, WorkInProgressReport, TechnicianEfficiencyReport, UsedCarsReport, DiagnosticReport1, DiagnosticReport222, OMastersReport, SalesReportFM, SalesmanInvoicesReport } from './pages/reports/FinancialReports';
import CompanyReportHeader from './pages/reports/CompanyReportHeader';
import SalarySlip from './pages/reports/SalarySlip';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AccountModificationLogPage, ChangeLogViewerPage, DuplicateRemovalLogPage, UserActionLogPage } from './pages/admin/AuditLogViewer';
import SystemSettings from './pages/admin/SystemSettings';
import OfflineMessages from './pages/messaging/OfflineMessages';
import MailReporter from './pages/messaging/MailReporter';
import DeclareModule from './pages/messaging/DeclareModule';
import FunctionsUtilities from './pages/messaging/FunctionsUtilities';
import NumToWords from './pages/messaging/NumToWords';
import MainMenu from './pages/messaging/MainMenu';
import Form1 from './pages/messaging/Form1';
import DMSModule from './pages/messaging/DMSModule';

const Unauthorized: React.FC = () => (
  <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-error)' }}>
    <h2>Access Denied</h2>
    <p>You do not have permission to view this page.</p>
  </div>
);

const NotFound: React.FC = () => (
  <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
    <h2>Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <GlobalLoader />
    <Routes>
      {/* Auth routes (public) */}
      <Route path="/auth/sign-in" element={<SignIn />} />
      <Route path="/auth/change-password" element={
        <ProtectedRoute><ChangePassword /></ProtectedRoute>
      } />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/odbc-sign-in" element={<OdbcSignIn />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Phase 2: User Management */}
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['Supervisor', 'Administrator']}>
            <UserList />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/new" element={
          <ProtectedRoute roles={['Administrator']}>
            <UserForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/rights" element={
          <ProtectedRoute roles={['Administrator']}>
            <UserRights />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/legacy" element={
          <ProtectedRoute roles={['Administrator']}>
            <LegacyUserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id" element={
          <ProtectedRoute roles={['Supervisor', 'Administrator']}>
            <UserDetail />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id/edit" element={
          <ProtectedRoute roles={['Administrator']}>
            <UserForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/userlog" element={
          <ProtectedRoute roles={['Supervisor', 'Administrator']}>
            <UserLogReport />
          </ProtectedRoute>
        } />
        {/* Legacy route alias */}
        <Route path="/admin/user-log-report" element={
          <ProtectedRoute roles={['Supervisor', 'Administrator']}>
            <UserLogReport />
          </ProtectedRoute>
        } />

        {/* Phase 2: Employee Management */}
        <Route path="/admin/employees" element={
          <ProtectedRoute roles={['Supervisor', 'Administrator']}>
            <EmployeeList />
          </ProtectedRoute>
        } />
        <Route path="/admin/employees/new" element={
          <ProtectedRoute roles={['Supervisor', 'Administrator']}>
            <EmployeeEntry />
          </ProtectedRoute>
        } />
        <Route path="/admin/employees/:empId/edit" element={
          <ProtectedRoute roles={['Supervisor', 'Administrator']}>
            <EmployeeEntry />
          </ProtectedRoute>
        } />
        <Route path="/admin/employees/:id" element={
          <ProtectedRoute roles={['Supervisor', 'Administrator']}>
            <EmployeeList />
          </ProtectedRoute>
        } />

        {/* Phase 3: CRM — Customer, Supplier, Contact, Vehicle */}
        <Route path="/crm/customers" element={<CustomerList />} />
        <Route path="/crm/customers/new" element={<ProtectedRoute roles={['Administrator','Supervisor']}><CustomerForm /></ProtectedRoute>} />
        <Route path="/crm/customers/merge-duplicates" element={<ProtectedRoute roles={['Administrator','Supervisor']}><MergeDuplicates /></ProtectedRoute>} />
        <Route path="/crm/customers/:id/edit" element={<ProtectedRoute roles={['Administrator','Supervisor']}><CustomerForm /></ProtectedRoute>} />
        <Route path="/crm/customers/:id" element={<CustomerDetail />} />
        <Route path="/customers/agewise" element={<ProtectedRoute roles={['Administrator','Supervisor']}><AgewiseSummary type="customer" /></ProtectedRoute>} />

        <Route path="/crm/suppliers" element={<SupplierList />} />
        <Route path="/crm/suppliers/new" element={<ProtectedRoute roles={['Administrator','Supervisor']}><SupplierForm /></ProtectedRoute>} />
        <Route path="/crm/suppliers/merge-duplicates" element={<ProtectedRoute roles={['Administrator','Supervisor']}><MergeDuplicates /></ProtectedRoute>} />
        <Route path="/crm/suppliers/:id/edit" element={<ProtectedRoute roles={['Administrator','Supervisor']}><SupplierForm /></ProtectedRoute>} />
        <Route path="/crm/suppliers/:id" element={<SupplierList />} />
        <Route path="/suppliers/agewise" element={<ProtectedRoute roles={['Administrator','Supervisor']}><AgewiseSummary type="supplier" /></ProtectedRoute>} />

        <Route path="/crm/contacts" element={<ContactList />} />
        <Route path="/crm/contacts/new" element={<ContactForm />} />
        <Route path="/crm/contacts/:id/edit" element={<ContactForm />} />

        <Route path="/crm/vehicles" element={<VehicleList />} />
        <Route path="/crm/vehicles/new" element={<ProtectedRoute roles={['Administrator','Supervisor']}><VehicleForm /></ProtectedRoute>} />
        <Route path="/crm/vehicles/merge-duplicates" element={<ProtectedRoute roles={['Administrator','Supervisor']}><MergeDuplicates /></ProtectedRoute>} />
        <Route path="/crm/vehicles/:id/edit" element={<ProtectedRoute roles={['Administrator','Supervisor']}><VehicleForm /></ProtectedRoute>} />
        <Route path="/crm/vehicles/:id" element={<VehicleList />} />

        {/* Placeholder routes for future phases */}
        <Route path="/customers" element={<CustomerList />} />
        {/* Phase 4: Document & Attachment Management */}
        <Route path="/documents" element={<DocumentMenu />} />
        <Route path="/documents/menu" element={<DocumentMenu />} />
        <Route path="/documents/entry" element={<DocumentEntry />} />
        <Route path="/documents/:docId/edit" element={<DocumentEntry />} />
        <Route path="/documents/heads" element={<ProtectedRoute roles={['Administrator','Supervisor']}><DocumentHeadManagement /></ProtectedRoute>} />
        <Route path="/documents/additional-remarks-report" element={<ProtectedRoute roles={['Administrator','Supervisor']}><AdditionalRemarksReport /></ProtectedRoute>} />
        <Route path="/documents/list" element={<DocumentMenu />} />
        <Route path="/attachments" element={<AttachmentManager />} />
        {/* Phase 5: Jobs, Work Orders & Estimation */}
        <Route path="/jobs/estimations" element={<EstimationList />} />
        <Route path="/jobs/estimation-entry" element={<EstimationEntry />} />
        <Route path="/jobs/estimation-entry/:jobCardNo" element={<EstimationEntry />} />
        <Route path="/jobs/estimation/:estimationId/approval" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><EstimationApproval /></ProtectedRoute>} />
        <Route path="/jobs/orders/status" element={<JobOrderStatus />} />
        <Route path="/jobs/job-status-master" element={<ProtectedRoute roles={['Administrator']}><JobStatusMaster /></ProtectedRoute>} />
        <Route path="/jobs/job-status-help" element={<JobStatusHelp />} />
        <Route path="/jobs/work-status" element={<WorkStatus />} />
        <Route path="/jobs/work-status-management" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><WorkStatusManagement /></ProtectedRoute>} />
        <Route path="/jobs/work-status-report" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><WorkStatusReport /></ProtectedRoute>} />
        <Route path="/jobs/rpt-work-status-summary" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><WorkStatusSummary /></ProtectedRoute>} />
        <Route path="/jobs/pending-jobcard-help" element={<PendingJobCardHelp />} />
        <Route path="/jobs/status-advisorwise-report" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><StatusAdvisorWise /></ProtectedRoute>} />
        <Route path="/audit/job" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><JobAuditLogs /></ProtectedRoute>} />
        <Route path="/jobs" element={<Navigate to="/jobs/work-status" replace />} />
        {/* Phase 6: Sales, Orders & Delivery Management */}
        <Route path="/sales/orders/help" element={<SalesOrderHelp />} />
        <Route path="/sales/orders/pending" element={<PendingOrdersList />} />
        <Route path="/sales/orders/status" element={<OrderStatus />} />
        <Route path="/sales/orders/bulk-status" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><SalesOrderList /></ProtectedRoute>} />
        <Route path="/sales/orders/entry" element={<SalesOrderEntry />} />
        <Route path="/sales/orders" element={<SalesOrderList />} />
        <Route path="/sales/orders/:orderId/edit" element={<SalesOrderEntry />} />
        <Route path="/sales/orders/:orderId/change-customer" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><ChangeOrderCustomer /></ProtectedRoute>} />
        <Route path="/sales/orders/:orderId/delivery-note/entry" element={<DeliveryNoteEntry />} />
        <Route path="/sales/orders/:orderId/delivery-notes/:noteId/edit" element={<DeliveryNoteEntry />} />
        <Route path="/sales/orders/:orderId" element={<SalesOrderView />} />
        <Route path="/sales/delivery/log" element={<DeliveryLog />} />
        <Route path="/sales/delivery-notes/:noteId/print" element={<DeliveryNotePrint />} />
        <Route path="/sales/delivery-notes/:noteId/export" element={<DeliveryNotePrint />} />
        <Route path="/sales/delivery-notes/:noteId/audit" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><DeliveryNotePrint /></ProtectedRoute>} />
        <Route path="/orders/status-report" element={<OrderStatusReport />} />
        <Route path="/orders/pending-register" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><PendingOrderRegister /></ProtectedRoute>} />
        <Route path="/orders/sales-report" element={<SalesOrderReport />} />
        <Route path="/orders/delivery-notes" element={<DeliveryNoteReport />} />
        <Route path="/sales/labour-issue" element={<LabourIssue />} />
        {/* Payroll */}
        <Route path="/payroll/salary-entry" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><SalaryEntry /></ProtectedRoute>} />
        <Route path="/payroll/clocking" element={<ClockingEntry />} />
        <Route path="/sales" element={<Navigate to="/sales/orders" replace />} />
        {/* Phase 7: Purchase, Procurement & Supplier Billing */}
        <Route path="/purchase/orders/local" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><LocalPurchaseEntry /></ProtectedRoute>} />
        <Route path="/purchase/orders/:orderId/edit" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><LocalPurchaseEntry /></ProtectedRoute>} />
        <Route path="/purchase/orders/foreign" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><ForeignPurchaseEntry /></ProtectedRoute>} />
        <Route path="/purchase/orders/local/manage" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><LocalPOManagement /></ProtectedRoute>} />
        <Route path="/purchase/delivery-orders/pending" element={<PendingPurchaseDO />} />
        <Route path="/purchase/reports/orders" element={<PurchaseOrderReport />} />
        <Route path="/purchase/delivery-orders/items" element={<PurchaseDOItemRegister />} />
        <Route path="/purchase/delivery-orders/items/summary" element={<PurchaseDOItemSummary />} />
        <Route path="/purchase/reports/pending-delivery-orders" element={<PendingPurchaseDOReport />} />
        <Route path="/purchase/reports/delivery-order-details" element={<PurchaseDO01PDOReport />} />
        <Route path="/purchase/lpo-analysis" element={<LPOAnalysis />} />
        <Route path="/purchase/lpo-details-report" element={<LPODetailsReport />} />
        <Route path="/purchase/register/account" element={<PurchaseRegAC />} />
        <Route path="/purchase/register/imported" element={<PurchaseRegImported />} />
        <Route path="/purchase/register/local" element={<PurchaseRegLocal />} />
        <Route path="/purchase/register/supplier-local" element={<PurchaseRegSuppLocal />} />
        <Route path="/purchase/returns" element={<PurchaseReturnBill />} />
        <Route path="/purchase/import-bills" element={<PurchaseBillImport />} />
        <Route path="/purchase/local-bills" element={<PurchaseBillLocal />} />
        <Route path="/suppliers/billwise-pending/both" element={<SupplierBillwisePending variant="Both" />} />
        <Route path="/suppliers/billwise-pending/foreign" element={<SupplierBillwisePending variant="Foreign" />} />
        <Route path="/suppliers/billwise-pending/local" element={<SupplierBillwisePending variant="Local" />} />
        <Route path="/suppliers/billwise-pending-old" element={<SupplierBillwisePending variant="Foreign Old" />} />
        <Route path="/suppliers/billwise-pending" element={<SupplierBillwisePending />} />
        <Route path="/purchase/item-reports" element={<PurchaseItemReports />} />
        <Route path="/products/requests" element={<ProdRequest />} />
        <Route path="/purchase" element={<Navigate to="/purchase/orders/local/manage" replace />} />
        {/* Phase 8: Inventory, Stock & Item Management */}
        <Route path="/inventory/items" element={<ItemList />} />
        <Route path="/inventory/items/help" element={<ItemsHelp />} />
        <Route path="/inventory/help" element={<InventoryHelp />} />
        <Route path="/inventory/items/:itemCode/do-list" element={<ItemDOList />} />
        <Route path="/inventory/items/:itemCode/do-summary" element={<ItemDOSummary />} />
        <Route path="/inventory/items/:itemCode/pending-do" element={<ItemPendingDOList />} />
        <Route path="/inventory/items/do-list" element={<ItemDOList />} />
        <Route path="/inventory/items/do-summary" element={<ItemDOSummary />} />
        <Route path="/inventory/items/pending-do" element={<ItemPendingDOList />} />
        <Route path="/inventory/stock/in" element={<StockInEntry />} />
        <Route path="/inventory/stock/out" element={<StockOutEntry />} />
        <Route path="/inventory/stock/manual-adjust" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><ManualAdjustment /></ProtectedRoute>} />
        <Route path="/inventory/stock/physical-adjust" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><PhysicalAdjustment /></ProtectedRoute>} />
        <Route path="/inventory/stock/availability" element={<StockAvailability />} />
        <Route path="/inventory/stock/display" element={<StockDisplay />} />
        <Route path="/inventory/stock/ledger" element={<StockLedger />} />
        <Route path="/inventory/stock/valuation" element={<ProtectedRoute roles={['Administrator']}><StockValuation /></ProtectedRoute>} />
        <Route path="/inventory/stock/aging-report" element={<ProtectedRoute roles={['Administrator']}><StockAgingReport /></ProtectedRoute>} />
        <Route path="/inventory/stock/in-list" element={<StockInList />} />
        <Route path="/inventory/stock/out-list" element={<StockOutList />} />
        <Route path="/inventory/stock/reorder-status" element={<StockReorderStatus />} />
        <Route path="/inventory/stock/statement" element={<StockStatementMain />} />
        <Route path="/inventory/stock/statement1" element={<StockStatement1 />} />
        <Route path="/inventory/stock/statement-from-item-file" element={<StockStatementFromItemFile />} />
        <Route path="/inventory/stock/statement-dd" element={<StockStatementDD />} />
        <Route path="/audit/stock" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><StockAuditLog /></ProtectedRoute>} />
        <Route path="/inventory" element={<StockDisplay />} />
        {/* Phase 9: Banking, Reconciliation & Financial Transactions */}
        <Route path="/finance/bank-book" element={<BankBook />} />
        <Route path="/finance/cash-book" element={<CashBook />} />
        <Route path="/finance/bank-reconciliation/select-bank" element={<SelectBankForReconciliation />} />
        <Route path="/finance/bank-reconciliation" element={<BankReconciliation />} />
        <Route path="/reports/bank-cash-book" element={<CBPBook />} />
        <Route path="/reports/pending-bills-letter" element={<PendingBillsLetter />} />
        <Route path="/finance/audit-support" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><AuditSupport /></ProtectedRoute>} />
        <Route path="/finance/audit-support/missing-ac-serials" element={<ProtectedRoute roles={['Supervisor', 'Administrator']}><MissingAcSerials /></ProtectedRoute>} />
        <Route path="/payments/pdc-issue" element={<PDCVouchers />} />
        <Route path="/payments/pdc-receipt" element={<PDCReceiptVouchers />} />
        <Route path="/banking" element={<Navigate to="/finance/bank-book" replace />} />
        {/* Phase 10: Accounts, Ledgers & Chart of Accounts */}
        <Route path="/accounts/heads" element={<ProtectedRoute roles={['Supervisor','Administrator']}><AccountHeadList /></ProtectedRoute>} />
        <Route path="/accounts/tree" element={<AccountTree />} />
        <Route path="/accounts/tree-list" element={<AccountTreeListView />} />
        <Route path="/accounts/help" element={<AccountHeadHelp />} />
        <Route path="/accounts/resort" element={<ProtectedRoute roles={['Supervisor','Administrator']}><AccountHeadResort /></ProtectedRoute>} />
        <Route path="/accounts/selector" element={<AccountSelector />} />
        <Route path="/accounts/modification-log" element={<ProtectedRoute roles={['Supervisor','Administrator']}><AccountModificationLog /></ProtectedRoute>} />
        <Route path="/reports/ledger" element={<LedgerReportPage />} />
        <Route path="/reports/ledger-actual-date" element={<LedgerActualDateReport />} />
        <Route path="/reports/ledger-pdc" element={<LedgerPDCReport />} />
        <Route path="/reports/ledger-summary" element={<LedgerSummaryReport />} />
        <Route path="/reports/ledger-summary-actual" element={<LedgerSummaryActual />} />
        <Route path="/reports/ledger-short" element={<LedgerShortReport />} />
        <Route path="/reports/group-ledger-summary" element={<GroupLedgerSummary />} />
        <Route path="/reports/ledger-accounts-audit" element={<ProtectedRoute roles={['Supervisor','Administrator']}><LedgerAccountsAudit /></ProtectedRoute>} />
        <Route path="/vouchers/list" element={<VoucherListReport />} />
        <Route path="/vouchers/daily-list" element={<VoucherDailyList />} />
        <Route path="/vouchers/details-list" element={<VoucherDetailsListReport />} />
        <Route path="/vouchers/journal-list" element={<JournalVoucherList />} />
        <Route path="/vouchers/journal-entry" element={<ProtectedRoute roles={['Supervisor','Administrator']}><JournalVoucherEntry /></ProtectedRoute>} />
        <Route path="/vouchers/bulk-journal-entry" element={<ProtectedRoute roles={['Supervisor','Administrator']}><BulkJournalVoucherEntry /></ProtectedRoute>} />
        <Route path="/vouchers/bulk-pdc-receipts" element={<ProtectedRoute roles={['Supervisor','Administrator']}><BulkPDCReceiptTransactions /></ProtectedRoute>} />
        <Route path="/vouchers/bulk-pdc-transactions" element={<ProtectedRoute roles={['Supervisor','Administrator']}><BulkPDCTransactions /></ProtectedRoute>} />
        <Route path="/reports/trial-balance" element={<TrialBalance />} />
        <Route path="/finance/reports/trial-balance-summary" element={<TrialBalanceSummary />} />
        <Route path="/reports/trialbalance-test" element={<TrialBalanceTest />} />
        <Route path="/reports/trialbalance-test-111" element={<TrialBalanceTest111 />} />
        <Route path="/accounts" element={<AccountTree />} />
        {/* Phase 11: Receipts, Payments, Petty Cash & Journal Vouchers */}
        <Route path="/payments/entry" element={<PaymentEntry />} />
        <Route path="/payments/finalize" element={<ProtectedRoute roles={['Supervisor','Administrator']}><PaymentFinalization /></ProtectedRoute>} />
        <Route path="/payments/pending-add" element={<ProtectedRoute roles={['Supervisor','Administrator']}><PendingAddPayment /></ProtectedRoute>} />
        <Route path="/receipts/entry" element={<ReceiptEntry />} />
        <Route path="/receipts/petty-cash" element={<PettyCashEntry />} />
        <Route path="/receipts/auto-entry" element={<AutoReceiptEntry />} />
        <Route path="/receipts/pending-add" element={<ProtectedRoute roles={['Supervisor','Administrator']}><PendingAddReceipt /></ProtectedRoute>} />
        <Route path="/receipts/backup" element={<ProtectedRoute roles={['Supervisor','Administrator']}><ReceiptsBackup /></ProtectedRoute>} />
        <Route path="/reports/receipts" element={<ReceiptsReport />} />
        <Route path="/reports/payments" element={<PaymentsReport />} />
        <Route path="/reports/receipts-backup" element={<ProtectedRoute roles={['Supervisor','Administrator']}><ReceiptsBackupReport /></ProtectedRoute>} />
        <Route path="/accounts/:code/vouchers" element={<AccountVoucherDisplay />} />
        <Route path="/vouchers/help" element={<VoucherHelp />} />
        <Route path="/receipts" element={<ReceiptsReport />} />
        {/* Phase 12: Reporting, Statements & Analytics */}
        <Route path="/reports" element={<ReportsDashboard />} />
        <Route path="/reports/profit-loss" element={<ProtectedRoute roles={['Supervisor','Administrator']}><ProfitLossReport /></ProtectedRoute>} />
        <Route path="/reports/profit-loss-frm" element={<ProtectedRoute roles={['Supervisor','Administrator']}><ProfitLossFrmReport /></ProtectedRoute>} />
        <Route path="/reports/balance-sheet" element={<ProtectedRoute roles={['Supervisor','Administrator']}><BalanceSheetReport /></ProtectedRoute>} />
        <Route path="/reports/sales-analysis" element={<ProtectedRoute roles={['Supervisor','Administrator']}><SalesAnalysisReport /></ProtectedRoute>} />
        <Route path="/reports/sales-analysis-new" element={<ProtectedRoute roles={['Supervisor','Administrator']}><SalesAnalysisNewReport /></ProtectedRoute>} />
        <Route path="/sales/analysis-one" element={<ProtectedRoute roles={['Supervisor','Administrator']}><SalesAnalysisReport /></ProtectedRoute>} />
        <Route path="/sales/category-summary" element={<ProtectedRoute roles={['Supervisor','Administrator']}><SalesCategorySummary /></ProtectedRoute>} />
        <Route path="/sales/labour-parts-report" element={<ProtectedRoute roles={['Supervisor','Administrator']}><SalesLabourPartsReport /></ProtectedRoute>} />
        <Route path="/sales/margin-report" element={<ProtectedRoute roles={['Supervisor','Administrator']}><MarginReport /></ProtectedRoute>} />
        <Route path="/sales/margin-report-new" element={<ProtectedRoute roles={['Supervisor','Administrator']}><MarginReportNew /></ProtectedRoute>} />
        <Route path="/sales/order-report" element={<ProtectedRoute roles={['Supervisor','Administrator']}><SalesReportFM /></ProtectedRoute>} />
        <Route path="/reports/monthly-sales" element={<ProtectedRoute roles={['Supervisor','Administrator']}><MonthlySalesReport /></ProtectedRoute>} />
        <Route path="/reports/discount-summary" element={<ProtectedRoute roles={['Supervisor','Administrator']}><DiscountSummaryReport /></ProtectedRoute>} />
        <Route path="/reports/customer-bills/detailed-summary" element={<ProtectedRoute roles={['Supervisor','Administrator']}><CustomerBillsDetailedSummary /></ProtectedRoute>} />
        <Route path="/reports/customer-bills/pending" element={<ProtectedRoute roles={['Supervisor','Administrator']}><CustomerBillsPending /></ProtectedRoute>} />
        <Route path="/reports/customer-bills/pending-old" element={<ProtectedRoute roles={['Supervisor','Administrator']}><CustomerBillsPendingOld /></ProtectedRoute>} />
        <Route path="/reports/customer-bills/pending-alt" element={<ProtectedRoute roles={['Supervisor','Administrator']}><CustomerBillsPendingAlt /></ProtectedRoute>} />
        <Route path="/reports/customer-bills/summary-new" element={<ProtectedRoute roles={['Supervisor','Administrator']}><CustomerBillsSummaryNew /></ProtectedRoute>} />
        <Route path="/reports/customer-bills/summary" element={<ProtectedRoute roles={['Supervisor','Administrator']}><CustomerBillsSummary /></ProtectedRoute>} />
        <Route path="/reports/customer-bills/summary-advisorwise" element={<ProtectedRoute roles={['Supervisor','Administrator']}><CustomerBillsSummaryAdvisorwise /></ProtectedRoute>} />
        <Route path="/reports/customer-outstanding" element={<ProtectedRoute roles={['Supervisor','Administrator']}><CustomerOutstandingReport /></ProtectedRoute>} />
        <Route path="/reports/supplier-outstanding" element={<ProtectedRoute roles={['Supervisor','Administrator']}><SupplierOutstandingReport /></ProtectedRoute>} />
        <Route path="/reports/voucher-details" element={<ProtectedRoute roles={['Supervisor','Administrator']}><VoucherDetailsReport /></ProtectedRoute>} />
        <Route path="/reports/vouchers/details-list" element={<ProtectedRoute roles={['Supervisor','Administrator']}><VouchersDetailsListReport /></ProtectedRoute>} />
        <Route path="/reports/journal-voucher" element={<ProtectedRoute roles={['Supervisor','Administrator']}><JournalVoucherReport /></ProtectedRoute>} />
        <Route path="/reports/voucher-list" element={<ProtectedRoute roles={['Supervisor','Administrator']}><VoucherDetailsReport /></ProtectedRoute>} />
        <Route path="/reports/stock/ledger" element={<ProtectedRoute roles={['Supervisor','Administrator']}><WorkInProgressReport /></ProtectedRoute>} />
        <Route path="/jobs/report/status-detail" element={<ProtectedRoute roles={['Supervisor','Administrator']}><WorkInProgressReport /></ProtectedRoute>} />
        <Route path="/jobs/report/status-summary" element={<ProtectedRoute roles={['Supervisor','Administrator']}><WorkInProgressReport /></ProtectedRoute>} />
        <Route path="/technicians/efficiency" element={<ProtectedRoute roles={['Supervisor','Administrator']}><TechnicianEfficiencyReport /></ProtectedRoute>} />
        <Route path="/inventory/vehicles/attendance-list" element={<ProtectedRoute roles={['Supervisor','Administrator']}><VehicleAttendanceReport /></ProtectedRoute>} />
        <Route path="/inventory/used-cars" element={<UsedCarsReport />} />
        <Route path="/personnel/payroll/register" element={<ProtectedRoute roles={['Administrator']}><SalaryRegisterReport /></ProtectedRoute>} />
        <Route path="/personnel/payroll/slip/:employeeId/:period" element={<ProtectedRoute roles={['Administrator']}><SalarySlip /></ProtectedRoute>} />
        <Route path="/finance/insurance-invoices/report" element={<ProtectedRoute roles={['Supervisor','Administrator']}><SalesAnalysisReport /></ProtectedRoute>} />
        <Route path="/reports/diagnostics/xxx" element={<ProtectedRoute roles={['Administrator']}><DiagnosticReport1 /></ProtectedRoute>} />
        <Route path="/reports/diagnostics/z" element={<ProtectedRoute roles={['Administrator']}><DiagnosticReport1 /></ProtectedRoute>} />
        <Route path="/reports/diagnostics/custom-1" element={<ProtectedRoute roles={['Administrator']}><DiagnosticReport1 /></ProtectedRoute>} />
        <Route path="/reports/diagnostics/custom-2" element={<ProtectedRoute roles={['Administrator']}><DiagnosticReport222 /></ProtectedRoute>} />
        <Route path="/admin/omasters-report" element={<ProtectedRoute roles={['Administrator']}><OMastersReport /></ProtectedRoute>} />
        <Route path="/admin/company-report-header" element={<ProtectedRoute roles={['Administrator']}><CompanyReportHeader /></ProtectedRoute>} />
        {/* Phase 13: System Admin, Audit Logs & Change Tracking */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['Supervisor','Administrator']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute roles={['Supervisor','Administrator']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/audit/account-modification-log" element={<ProtectedRoute roles={['Supervisor','Administrator']}><AccountModificationLogPage /></ProtectedRoute>} />
        <Route path="/admin/audit/change-log-viewer" element={<ProtectedRoute roles={['Supervisor','Administrator']}><ChangeLogViewerPage /></ProtectedRoute>} />
        <Route path="/admin/audit/duplicate-removal-log" element={<ProtectedRoute roles={['Supervisor','Administrator']}><DuplicateRemovalLogPage /></ProtectedRoute>} />
        <Route path="/admin/audit/user-action-log-report" element={<ProtectedRoute roles={['Supervisor','Administrator']}><UserActionLogPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute roles={['Administrator']}><SystemSettings /></ProtectedRoute>} />
        <Route path="/customers-suppliers/settings" element={<ProtectedRoute roles={['Administrator']}><SystemSettings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['Administrator']}><AdminDashboard /></ProtectedRoute>} />
        {/* Phase 14: Notifications, Messaging & Utilities */}
        <Route path="/messages/offline" element={<OfflineMessages />} />
        <Route path="/report/mail" element={<ProtectedRoute roles={['Supervisor','Administrator']}><MailReporter /></ProtectedRoute>} />
        <Route path="/customers-suppliers/declare" element={<DeclareModule />} />
        <Route path="/customers-suppliers/functions" element={<ProtectedRoute roles={['Supervisor','Administrator']}><FunctionsUtilities /></ProtectedRoute>} />
        <Route path="/customers-suppliers/utilities" element={<ProtectedRoute roles={['Supervisor','Administrator']}><FunctionsUtilities /></ProtectedRoute>} />
        <Route path="/tools/num-words" element={<NumToWords />} />
        <Route path="/mainmenu" element={<MainMenu />} />
        <Route path="/customers-suppliers/menu" element={<MainMenu />} />
        <Route path="/customers-suppliers/main" element={<MainMenu />} />
        <Route path="/form1" element={<Form1 />} />
        <Route path="/dms" element={<DMSModule />} />
        <Route path="/profile" element={<div style={{ padding: 24 }}>Profile</div>} />
      </Route>

      {/* Utility */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
