import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bankingApi } from '../../api/banking';
import s from './Banking.module.css';

export default function SelectBankForReconciliation() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['bank-accounts-recon'],
    queryFn: () => bankingApi.bankAccountsForRecon(),
  });

  const filtered = (accounts as any[]).filter((a: any) => !search || a.HEAD?.toLowerCase().includes(search.toLowerCase()) || a.CODES?.includes(search));

  return (
    <div data-testid="select-bank-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Select Bank for Reconciliation</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Search bank accounts..." data-testid="select-bank-search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : filtered.length === 0 ? (
          <div data-testid="select-bank-empty-state" className={s.empty}>No bank accounts available for reconciliation.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {filtered.map((a: any) => (
              <div key={a.ID} className={s.card} style={{ margin: 0, cursor: 'pointer', borderColor: 'rgba(56,49,196,0.2)' }}>
                <div style={{ fontWeight: 600, color: '#1e1b4b', marginBottom: '0.5rem' }}>{a.HEAD}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>{a.CODES} | Balance: —</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={`${s.btn} ${s.btnPrimary}`} data-testid={`select-bank-btn-${a.ID}`} style={{ fontSize: '0.75rem' }} onClick={() => navigate(`/finance/bank-reconciliation?accountId=${a.ID}`)}>Reconcile</button>
                  <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`select-bank-summary-btn-${a.ID}`} style={{ fontSize: '0.75rem' }}>Summary</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
