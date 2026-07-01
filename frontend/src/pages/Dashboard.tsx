import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { api } from '../api/client';
import styles from './Dashboard.module.css';
import { Building2, ShoppingCart, DollarSign, TrendingUp, ArrowRight, Package, FileText } from 'lucide-react';

const fetch$ = (path: string, params?: any) => api.get(path, { params }).then((r: any) => r.data);

export const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const { data: kpis } = useQuery({
    queryKey: ['dash-kpis'],
    queryFn: () => fetch$('/dashboard/kpis'),
    staleTime: 60000,
  });
  const { data: outstandingData } = useQuery({
    queryKey: ['dash-outstanding'],
    queryFn: () => fetch$('/reports/customer-bills-summary'),
    staleTime: 60000,
  });

  const fmt = (n: number | undefined) =>
    n !== undefined && n !== null ? Number(n).toLocaleString() : '—';
  const fmtCurrency = (v: number | undefined) =>
    v !== undefined && v !== null ? 'AED ' + Number(v).toLocaleString('en-AE', { maximumFractionDigits: 0 }) : '—';

  const outArr: any[] = Array.isArray(outstandingData) ? outstandingData : (outstandingData?.recordset ?? []);
  const outstanding = outArr.length > 0 ? outArr.reduce((sum: number, r: any) => sum + Number(r.Outstanding || r.outstanding || 0), 0) : undefined;

  const kpiCards = [
    { label: 'Customers', value: fmt(kpis?.CustomerCount), icon: <Building2 size={22} />, color: '#3831c4', link: '/crm/customers', sub: 'Total registered' },
    { label: 'Open Jobs (WIP)', value: fmt(kpis?.OpenJobCount), icon: <ShoppingCart size={22} />, color: '#2eae6c', link: '/jobs/work-status', sub: 'Jobs in progress' },
    { label: 'Sales Orders', value: fmt(kpis?.OrderCount), icon: <FileText size={22} />, color: '#f7be43', link: '/sales/orders', sub: 'All orders' },
    { label: 'Stock Value', value: fmtCurrency(kpis?.StockValue), icon: <Package size={22} />, color: '#368aad', link: '/inventory/stock/display', sub: 'Inventory valuation' },
    { label: 'Receivables', value: fmtCurrency(outstanding), icon: <DollarSign size={22} />, color: '#d23b41', link: '/reports/customer-outstanding', sub: 'Unpaid invoices' },
    { label: 'Reports', value: '→', icon: <TrendingUp size={22} />, color: '#6c65ea', link: '/reports', sub: 'View all reports' },
  ];

  const quickLinks = [
    { label: 'New Sales Order', path: '/sales/orders/entry' },
    { label: 'Work Status', path: '/jobs/work-status' },
    { label: 'Stock Display', path: '/inventory/stock/display' },
    { label: 'Bank Book', path: '/finance/bank-book' },
    { label: 'Voucher List', path: '/vouchers/list' },
    { label: 'Customer List', path: '/crm/customers' },
    { label: 'Payment Entry', path: '/payments/entry' },
    { label: 'Receipt Entry', path: '/receipts/entry' },
    { label: 'Trial Balance', path: '/reports/trial-balance' },
    { label: 'P&L Report', path: '/reports/profit-loss' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome, {user?.name?.split(' ')[0] || user?.username}!</h1>
          <p className={styles.subtitle}>Here's a summary of your business activity.</p>
        </div>
        <div className={styles.roleBadge}>{user?.roles?.[0]}</div>
      </div>

      <div className={styles.kpiGrid}>
        {kpiCards.map((kpi) => (
          <Link key={kpi.label} to={kpi.link} className={styles.kpiCard} style={{ textDecoration: 'none' }}>
            <div className={styles.kpiIcon} style={{ background: kpi.color + '18', color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiValue}>{kpi.value}</div>
              <div className={styles.kpiLabel}>{kpi.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>{kpi.sub}</div>
            </div>
            <ArrowRight size={14} style={{ color: kpi.color, opacity: 0.5, marginLeft: 'auto' }} />
          </Link>
        ))}
      </div>

      <div className={styles.panels}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
            {quickLinks.map((ql) => (
              <Link
                key={ql.path}
                to={ql.path}
                style={{
                  display: 'block', padding: '10px 14px', borderRadius: '6px',
                  background: 'var(--color-primary-surface)', color: 'var(--color-primary)',
                  textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                  border: '1px solid rgba(56,49,196,0.12)',
                  transition: 'background 0.15s',
                }}
              >
                {ql.label}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Navigation Help</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
            <p><strong>CRM</strong> — Customers, Suppliers, Contacts, Vehicles</p>
            <p><strong>Jobs</strong> — Work Status, Estimation, Job Orders</p>
            <p><strong>Sales</strong> — Orders, Delivery, Reports</p>
            <p><strong>Purchase</strong> — Local/Foreign POs, Delivery Orders</p>
            <p><strong>Inventory</strong> — Items, Stock In/Out, Ledger, Valuation</p>
            <p><strong>Banking</strong> — Bank Book, Reconciliation, PDC</p>
            <p><strong>Accounts</strong> — Chart of Accounts, Ledger, Vouchers</p>
            <p><strong>Transactions</strong> — Payments, Receipts, Petty Cash</p>
            <p><strong>Reports</strong> — P&amp;L, Balance Sheet, Sales Analysis, Outstanding</p>
          </div>
        </div>
      </div>
    </div>
  );
};
