import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import s from './Accounts.module.css';

export default function AccountHeadResort() {
  const { data: heads = [], isLoading } = useQuery({
    queryKey: ['account-heads-resort'],
    queryFn: () => accountsApi.listHeads({}),
  });

  const [ordered, setOrdered] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => { if ((heads as any[]).length) setOrdered(heads as any[]); }, [heads]);

  const saveMut = useMutation({
    mutationFn: () => accountsApi.resort({ orderedCodes: ordered.map((h) => h.code) }),
    onSuccess: () => setSaved(true),
  });

  const move = (index: number, dir: -1 | 1) => {
    setOrdered((p) => {
      const arr = [...p];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
    setSaved(false);
  };

  return (
    <div data-testid="acheadresort-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Account Head Resorting</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="acheadresort-reset-btn" onClick={() => setOrdered(heads as any[])}>Reset</button>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="acheadresort-save-btn" onClick={() => saveMut.mutate()} disabled={saveMut.isPending || saved}>Save Order</button>
        </div>
      </div>
      <div className={s.card}>
        {saved && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>Order saved.</div>}
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead><tr><th>#</th><th>Code</th><th>Name</th><th>Type</th><th>Move</th></tr></thead>
              <tbody>
                {ordered.map((h: any, i: number) => (
                  <tr key={h.code ?? i}>
                    <td>{i + 1}</td><td>{h.code}</td><td>{h.name}</td><td>{h.type}</td>
                    <td>
                      <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', marginRight: '0.25rem' }} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                      <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }} onClick={() => move(i, 1)} disabled={i === ordered.length - 1}>↓</button>
                    </td>
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
