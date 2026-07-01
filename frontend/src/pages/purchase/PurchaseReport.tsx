import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { purchaseDOApi, purchaseReportsApi } from '../../api/purchase';
import { suppliersApi } from '../../api/customers';
import { downloadCsv } from '../../utils/export';
import s from '../sales/Sales.module.css';

interface Props {
  title: string;
  queryKey: string;
  fetchFn: (params?: any) => Promise<any>;
  columns: { key: string; label: string; testidPrefix?: string }[];
  testidPrefix: string;
  filterSupplier?: boolean;
  filterDate?: boolean;
  filterExtra?: { key: string; label: string; type?: string }[];
}

export default function PurchaseReport({ title, queryKey, fetchFn, columns, testidPrefix, filterSupplier = true, filterDate = true, filterExtra = [] }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: _suppRes } = useQuery({ queryKey: ['suppliers-dropdown'], queryFn: () => suppliersApi.list({ limit: 500 }), enabled: filterSupplier });
  const suppliers: any[] = (_suppRes as any)?.data ?? [];

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => fetchFn(filters),
  });
  const rows: any[] = Array.isArray(_res) ? _res : ((_res as any)?.data ?? (_res as any)?.recordset ?? []);

  return (
    <div data-testid={`${testidPrefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-print`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-export-menu`} onClick={() => downloadCsv(`${testidPrefix}.csv`, rows, columns)}>Export</button>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          {filterSupplier && (
            <select data-testid={`${testidPrefix}-filter-supplier`} value={filters.supplier ?? ''} onChange={(e) => setFilters((p) => ({ ...p, supplier: e.target.value }))}>
              <option value="">All Suppliers</option>
              {suppliers.map((s2: any) => <option key={s2.ID ?? s2.id} value={String(s2.ID ?? s2.id)}>{s2.Name ?? s2.SupplierName ?? s2.name}</option>)}
            </select>
          )}
          {filterDate && <input type="date" data-testid={`${testidPrefix}-filter-datefrom`} value={filters.dateFrom ?? ''} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />}
          {filterDate && <input type="date" placeholder="To" value={filters.dateTo ?? ''} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />}
          {filterExtra.map((f) => (
            <input key={f.key} type={f.type ?? 'text'} placeholder={f.label} value={filters[f.key] ?? ''} onChange={(e) => setFilters((p) => ({ ...p, [f.key]: e.target.value }))} />
          ))}
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>

        {isLoading ? (
          <div data-testid={`${testidPrefix}-loading-skeleton`} className={s.skeleton} style={{ height: '120px' }} />
        ) : (rows as any[]).length === 0 ? (
          <div data-testid={`${testidPrefix}-empty-state`} className={s.empty}>No data available.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${testidPrefix}-table`}>
              <thead><tr>{columns.map((col) => <th key={col.key} data-testid={col.testidPrefix}>{col.label}</th>)}</tr></thead>
              <tbody>
                {(rows as any[]).map((row: any, i: number) => (
                  <tr key={i} data-testid={`${testidPrefix}-row-${i}`}>
                    {columns.map((col) => <td key={col.key}>{row[col.key] ?? '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Pre-configured report pages
export const PurchaseOrderReport = () => <PurchaseReport
  title="Purchase Order Report" queryKey="po-report" fetchFn={async (p) => { const { purchaseOrdersApi } = await import('../../api/purchase'); return purchaseOrdersApi.reports(p); }}
  testidPrefix="purchaseorderreport"
  columns={[{ key: 'Invoice', label: 'PO Number' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'InvDt', label: 'Date' }, { key: 'Total', label: 'Total' }]}
  filterExtra={[{ key: 'Invoice', label: 'PO Number' }]}
/>;

export const PurchaseDOItemRegister = () => <PurchaseReport
  title="Purchase DO Item Register" queryKey="do-item-register" fetchFn={(p) => purchaseDOApi.itemRegister(p)}
  testidPrefix="purchase-do-item-register"
  columns={[{ key: 'PDONo', label: 'DO No' }, { key: 'POrdt', label: 'Date' }, { key: 'itemCode', label: 'Item Code' }, { key: 'qty', label: 'Qty' }, { key: 'amount', label: 'Amount' }]}
/>;

export const PurchaseDOItemSummary = () => <PurchaseReport
  title="Purchase DO Item Summary" queryKey="do-item-summary" fetchFn={(p) => purchaseDOApi.itemSummary(p)}
  testidPrefix="purchase-do-item-register-summary"
  columns={[{ key: 'itemCode', label: 'Item Code' }, { key: 'description', label: 'Description' }, { key: 'totalQty', label: 'Total Qty' }, { key: 'totalAmount', label: 'Total Amount' }]}
/>;

export const PendingPurchaseDOReport = () => <PurchaseReport
  title="Pending Purchase DO Report" queryKey="pending-do-report" fetchFn={(p) => purchaseDOApi.pendingReport(p)}
  testidPrefix="pendingpurchasedoreport"
  columns={[{ key: 'PDONo', label: 'DO No' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'Ref', label: 'PO No' }, { key: 'POrdt', label: 'Expected' }, { key: 'Closed', label: 'Status' }]}
/>;

export const PurchaseDO01PDOReport = () => <PurchaseReport
  title="Purchase DO01PDO Report" queryKey="do01pdo-report" fetchFn={(p) => purchaseDOApi.do01pdoReport(p)}
  testidPrefix="purchasedo01pdoreport"
  columns={[{ key: 'PDONo', label: 'DO No' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'itemCode', label: 'Item' }, { key: 'qty', label: 'Qty' }, { key: 'POrdt', label: 'Date' }]}
/>;

export const LPOAnalysis = () => <PurchaseReport
  title="LPO Analysis" queryKey="lpo-analysis" fetchFn={(p) => purchaseReportsApi.lpoAnalysis(p)}
  testidPrefix="lpo-analysis"
  columns={[{ key: 'Invoice', label: 'PO Number' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'Total', label: 'Total' }, { key: 'InvDt', label: 'Date' }]}
/>;

export const LPODetailsReport = () => <PurchaseReport
  title="LPO Details Report" queryKey="lpo-details" fetchFn={(p) => purchaseReportsApi.lpoDetails(p)}
  testidPrefix="lpo-details"
  columns={[{ key: 'Invoice', label: 'PO Number' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'itemCode', label: 'Item Code' }, { key: 'qty', label: 'Qty' }, { key: 'amount', label: 'Amount' }]}
/>;

export const PurchaseRegAC = () => <PurchaseReport
  title="Purchase Register — Account" queryKey="purchasereg-ac" fetchFn={(p) => purchaseReportsApi.regAccount(p)}
  testidPrefix="purchasereg-ac"
  columns={[{ key: 'account', label: 'Account' }, { key: 'Invoice', label: 'PO No' }, { key: 'amount', label: 'Amount' }, { key: 'InvDt', label: 'Date' }]}
/>;

export const PurchaseRegImported = () => <PurchaseReport
  title="Purchase Register — Imported" queryKey="purchasereg-import" fetchFn={(p) => purchaseReportsApi.regImported(p)}
  testidPrefix="purchasereg-import"
  columns={[{ key: 'Invoice', label: 'PO No' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'Currency', label: 'Currency' }, { key: 'Total', label: 'Amount' }, { key: 'InvDt', label: 'Date' }]}
/>;

export const PurchaseRegLocal = () => <PurchaseReport
  title="Purchase Register — Local" queryKey="purchasereg-local" fetchFn={(p) => purchaseReportsApi.regLocal(p)}
  testidPrefix="purchasereg-local"
  columns={[{ key: 'Invoice', label: 'PO No' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'Total', label: 'Amount' }, { key: 'InvDt', label: 'Date' }]}
/>;

export const PurchaseRegSuppLocal = () => <PurchaseReport
  title="Purchase Register — Supplier Local" queryKey="purchasereg-supp-local" fetchFn={(p) => purchaseReportsApi.regSuppLocal(p)}
  testidPrefix="purchasereg-supp-local"
  columns={[{ key: 'SupplierName', label: 'Supplier' }, { key: 'Invoice', label: 'PO No' }, { key: 'Total', label: 'Amount' }, { key: 'InvDt', label: 'Date' }]}
/>;

export const PurchaseReturnBill = () => <PurchaseReport
  title="Purchase Return Bill Report" queryKey="purchase-return-bill" fetchFn={(p) => purchaseReportsApi.returns(p)}
  testidPrefix="purchase-return-bill"
  columns={[{ key: 'Invoice', label: 'PO No' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'returnAmount', label: 'Return Amount' }, { key: 'InvDt', label: 'Date' }]}
/>;

export const PurchaseBillImport = () => <PurchaseReport
  title="Purchase Bill — Imported" queryKey="purchase-bill-import" fetchFn={(p) => purchaseReportsApi.importBills(p)}
  testidPrefix="purchase-bill-import"
  columns={[{ key: 'Invoice', label: 'Bill No' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'Total', label: 'Amount' }, { key: 'InvDt', label: 'Date' }]}
/>;

export const PurchaseBillLocal = () => <PurchaseReport
  title="Purchase Bill — Local" queryKey="purchase-bill-local" fetchFn={(p) => purchaseReportsApi.localBills(p)}
  testidPrefix="purchase-bill-local"
  columns={[{ key: 'Invoice', label: 'Bill No' }, { key: 'SupplierName', label: 'Supplier' }, { key: 'Total', label: 'Amount' }, { key: 'InvDt', label: 'Date' }]}
/>;

export const SupplierBillwisePending = ({ variant = '' }: { variant?: string }) => {
  const title = variant ? `Supplier Billwise Pending — ${variant}` : 'Supplier Billwise Pending';
  const fetchFn = async (p?: any) => {
    const m = await import('../../api/purchase');
    if (variant === 'Both') return m.purchaseReportsApi.billwisePendingBoth(p);
    if (variant === 'Foreign') return m.purchaseReportsApi.billwisePendingForeign(p);
    if (variant === 'Local') return m.purchaseReportsApi.billwisePendingLocal(p);
    if (variant === 'Foreign Old') return m.purchaseReportsApi.billwisePendingForeignOld(p);
    return m.purchaseReportsApi.billwisePending(p);
  };
  const testidSuffix = variant ? `suppliers-billwise-pending-${variant.toLowerCase().replace(' ', '')}` : 'suppliers-billwise-pending';
  return <PurchaseReport
    title={title} queryKey={`billwise-${variant}`} fetchFn={fetchFn}
    testidPrefix={testidSuffix}
    columns={[{ key: 'SupplierName', label: 'Supplier' }, { key: 'Invoice', label: 'Bill No' }, { key: 'Total', label: 'Amount' }, { key: 'InvDt', label: 'Due Date' }, { key: 'Closed', label: 'Status' }]}
  />;
};

export const PurchaseItemReports = () => <PurchaseReport
  title="Purchase Item Reports" queryKey="purchase-item-reports" fetchFn={(p) => purchaseReportsApi.itemReports(p)}
  testidPrefix="purchase-item-reports"
  columns={[{ key: 'itemCode', label: 'Item Code' }, { key: 'description', label: 'Description' }, { key: 'totalPurchased', label: 'Total Purchased' }, { key: 'totalAmount', label: 'Total Amount' }]}
/>;

export const ProdRequest = () => <PurchaseReport
  title="Product Requests" queryKey="prod-requests" fetchFn={(p) => purchaseReportsApi.prodRequests(p)}
  testidPrefix="prodrequest"
  filterSupplier={false}
  columns={[{ key: 'requestId', label: 'Request ID' }, { key: 'itemCode', label: 'Item Code' }, { key: 'description', label: 'Description' }, { key: 'requestedQty', label: 'Qty' }, { key: 'requestedBy', label: 'Requested By' }, { key: 'date', label: 'Date' }]}
/>;
