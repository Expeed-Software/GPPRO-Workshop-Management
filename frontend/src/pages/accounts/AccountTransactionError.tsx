import React, { useState } from 'react';
import s from './Accounts.module.css';

interface Props {
  error?: string;
  onAcknowledge?: () => void;
  onRetry?: () => void;
}

export default function AccountTransactionError({ error, onAcknowledge, onRetry }: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!error || acknowledged) return null;

  return (
    <div data-testid="account-txn-error-banner" className={s.card} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '1rem' }}>
      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <strong style={{ color: '#dc2626' }}>Transaction Error</strong>
        <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginTop: '0.25rem' }}>{error}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {onRetry && <button className={`${s.btn} ${s.btnSecondary}`} data-testid="account-txn-error-retry" style={{ fontSize: '0.8rem' }} onClick={onRetry}>Retry</button>}
        <button className={`${s.btn} ${s.btnSecondary}`} data-testid="account-txn-error-support" style={{ fontSize: '0.8rem' }}>Support</button>
        <button className={`${s.btn} ${s.btnDanger}`} data-testid="account-txn-error-ack" style={{ fontSize: '0.8rem' }} onClick={() => { setAcknowledged(true); onAcknowledge?.(); }}>Acknowledge</button>
      </div>
    </div>
  );
}
