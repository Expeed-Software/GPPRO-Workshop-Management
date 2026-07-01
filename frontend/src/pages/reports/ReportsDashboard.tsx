import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import s from './Reports.module.css';

const REPORT_CARDS = [
  { id: 'profit-loss', title: 'Profit & Loss', path: '/reports/profit-loss', category: 'Finance' },
  { id: 'trial-balance', title: 'Trial Balance', path: '/reports/trial-balance', category: 'Finance' },
  { id: 'balance-sheet', title: 'Balance Sheet', path: '/reports/balance-sheet', category: 'Finance' },
  { id: 'ledger', title: 'Ledger Report', path: '/reports/ledger', category: 'Finance' },
  { id: 'group-ledger', title: 'Group Ledger Summary', path: '/reports/group-ledger-summary', category: 'Finance' },
  { id: 'sales-analysis', title: 'Sales Analysis', path: '/reports/sales-analysis', category: 'Sales' },
  { id: 'margin-report', title: 'Margin Report', path: '/sales/margin-report', category: 'Sales' },
  { id: 'monthly-sales', title: 'Monthly Sales', path: '/reports/monthly-sales', category: 'Sales' },
  { id: 'customer-bills', title: 'Customer Bills', path: '/reports/customer-bills/summary', category: 'Customer' },
  { id: 'customer-outstanding', title: 'Customer Outstanding', path: '/reports/customer-outstanding', category: 'Customer' },
  { id: 'supplier-outstanding', title: 'Supplier Outstanding', path: '/reports/supplier-outstanding', category: 'Supplier' },
  { id: 'stock-valuation', title: 'Stock Valuation', path: '/inventory/stock/valuation', category: 'Inventory' },
  { id: 'stock-aging', title: 'Stock Aging', path: '/inventory/stock/aging-report', category: 'Inventory' },
  { id: 'voucher-list', title: 'Voucher List', path: '/vouchers/list', category: 'Vouchers' },
  { id: 'journal-voucher', title: 'Journal Voucher Report', path: '/reports/journal-voucher', category: 'Vouchers' },
  { id: 'bank-book', title: 'Bank Book', path: '/finance/bank-book', category: 'Banking' },
  { id: 'work-in-progress', title: 'Work In Progress', path: '/jobs/report/status-detail', category: 'Jobs' },
  { id: 'technician-efficiency', title: 'Technician Efficiency', path: '/technicians/efficiency', category: 'Jobs' },
  { id: 'salary-register', title: 'Salary Register', path: '/personnel/payroll/register', category: 'Payroll' },
  { id: 'receipts-report', title: 'Receipts', path: '/reports/receipts', category: 'Transactions' },
  { id: 'payments-report', title: 'Payments', path: '/reports/payments', category: 'Transactions' },
];

export default function ReportsDashboard() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const categories = Array.from(new Set(REPORT_CARDS.map((r) => r.category)));
  const filtered = REPORT_CARDS.filter((r) =>
    (!search || r.title.toLowerCase().includes(search.toLowerCase())) &&
    (!category || r.category === category)
  );

  return (
    <div data-testid="reports-dashboard-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Reports Library</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input data-testid="reports-search-box" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '220px' }} />
          <select data-testid="reports-type-dropdown" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className={s.empty}>No reports match your search.</div>
        ) : (
          <div className={s.reportGrid} data-testid="reports-library-grid">
            {filtered.map((r) => (
              <div key={r.id} className={s.reportCard} data-testid={`report-card-${r.id}`} onClick={() => navigate(r.path)}>
                <div style={{ fontWeight: 600, color: '#1e1b4b', marginBottom: '0.25rem' }}>{r.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>{r.category}</div>
                <button className={`${s.btn} ${s.btnPrimary}`} data-testid={`report-card-generate-btn-${r.id}`} style={{ fontSize: '0.75rem' }}>Open</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
