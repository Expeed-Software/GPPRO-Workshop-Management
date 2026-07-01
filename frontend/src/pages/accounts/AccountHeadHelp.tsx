import React from 'react';
import s from './Accounts.module.css';

const FAQS = [
  { q: 'What is an Account Code?', a: 'A unique alphanumeric identifier for each account head in the chart of accounts.' },
  { q: 'What is an Account Type?', a: 'Classifies the account as Asset, Liability, Income, or Expense.' },
  { q: 'What is an Account Group?', a: 'A categorization for grouping related account heads together in reports.' },
  { q: 'Can I delete an account?', a: 'Accounts used in transactions cannot be deleted — only deactivated (BR-91).' },
  { q: 'What is Parent Account?', a: 'The parent account this head reports under in the account tree hierarchy.' },
];

interface Props { onReset?: () => void; }

export default function AccountHeadHelp({ onReset }: Props) {
  return (
    <div data-testid="acheadhelp-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Account Head Help</h1>
        {onReset && <button className={`${s.btn} ${s.btnSecondary}`} data-testid="achead-help-reset-btn" onClick={onReset}>Reset</button>}
      </div>
      <div className={s.card}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem' }}>
            <div style={{ fontWeight: 600, color: '#1e1b4b', marginBottom: '0.3rem' }}>{faq.q}</div>
            <div style={{ color: '#475569', fontSize: '0.875rem' }}>{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
