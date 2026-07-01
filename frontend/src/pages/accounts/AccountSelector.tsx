import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import s from './Accounts.module.css';

export default function AccountSelector() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['account-selector', search],
    queryFn: () => accountsApi.selectList({ search }),
  });

  return (
    <div data-testid="acselector-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Account Selector</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Search account code or name..." data-testid="acselector-search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {selected && (
          <div className={s.card} style={{ background: 'rgba(56,49,196,0.04)', marginBottom: '1rem' }} data-testid="accsubdetails-panel">
            <strong>Selected:</strong> {selected.CODES} — {selected.HEAD} <span className={`${s.badge} ${s.badgeBlue}`}>{selected.CORD}</span>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>Group: {selected.Group ?? '—'} | Status: Active</div>
          </div>
        )}
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="acselector-table">
              <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Group</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {(accounts as any[]).map((a: any, i: number) => (
                  <tr key={i} data-testid={`acselector-row-${a.CODES}`}>
                    <td>{a.CODES}</td><td>{a.HEAD}</td><td>{a.CORD}</td><td>{a.Group ?? '—'}</td>
                    <td><span className={`${s.badge} ${s.badgeGreen}`}>Active</span></td>
                    <td><button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: '0.75rem' }} onClick={() => setSelected(a)}>Select</button></td>
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
