import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi, suppliersApi } from '../../api/customers';
import styles from './CrmList.module.css';

export const AgewiseSummary: React.FC<{ type: 'customer' | 'supplier' }> = ({ type }) => {
  const api = type === 'customer' ? customersApi : suppliersApi;
  const [params, setParams] = useState({ asOfDate: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: [type + '-agewise', params],
    queryFn: () => api.agewiseSummary(params),
    enabled: !!params.asOfDate,
  });

  const rows: any[] = (data?.data as any) || [];

  return (
    <div data-testid={`${type}-agewise-page`} className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{type === 'customer' ? 'Customer' : 'Supplier'} Agewise Summary</h1>
          <p className={styles.subtitle}>Outstanding amounts by aging buckets</p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} style={{ fontSize: 12 }}>As of Date</label>
          <input type="date" className={styles.filterSelect} data-testid="agewise-date-filter"
            value={params.asOfDate} onChange={(e) => setParams({ asOfDate: e.target.value })} />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}</div>
        ) : error ? (
          <div className={styles.errorState} role="alert">Failed to load agewise summary.</div>
        ) : rows.length === 0 ? (
          <div className={styles.emptyState}>No data available.</div>
        ) : (
          <table className={styles.table} data-testid={`${type}-agewise-table`}>
            <thead>
              <tr>
                <th>{type === 'customer' ? 'Customer' : 'Supplier'}</th>
                <th>Current</th>
                <th>1-30 Days</th>
                <th>31-60 Days</th>
                <th>61-90 Days</th>
                <th>90+ Days</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={i} className={styles.row}>
                  <td className={styles.primaryText}>{r.name || r.Name || r.CustName || r.SupplierName}</td>
                  <td>{r.current || r.Current || '—'}</td>
                  <td>{r.days30 || r.Days30 || '—'}</td>
                  <td>{r.days60 || r.Days60 || '—'}</td>
                  <td>{r.days90 || r.Days90 || '—'}</td>
                  <td>{r.overdue || r.Overdue || '—'}</td>
                  <td className={styles.primaryText}>{r.total || r.Total || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
