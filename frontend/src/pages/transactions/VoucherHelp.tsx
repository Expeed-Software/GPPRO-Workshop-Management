import React, { useState } from 'react';
import s from './Transactions.module.css';

const FAQS = [
  { q: 'What is a journal voucher?', a: 'A journal voucher is an accounting document that records debit and credit entries for transactions. Debits must always equal credits.' },
  { q: 'What is BR-110?', a: 'Business Rule 110 mandates that the sum of all debit entries must equal the sum of all credit entries in a voucher before it can be saved.' },
  { q: 'What are PDC vouchers?', a: 'Post-Dated Cheque (PDC) vouchers record cheques issued or received with a future date. They are tracked separately until the date arrives.' },
  { q: 'Who can approve voucher batches?', a: 'Only Supervisors and Administrators can approve or reject voucher batches (BR-112).' },
  { q: 'Can I delete a posted voucher?', a: 'No. Once a voucher is posted/finalized, it is locked and cannot be deleted or edited (BR-102).' },
];

export default function VoucherHelp() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div data-testid="voucher-help-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Voucher Help & FAQs</h1></div>
      <div className={s.card}>
        {FAQS.map((f, i) => (
          <div key={i} style={{ borderBottom: '1px solid rgba(56,49,196,0.1)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: '#3831c4', fontSize: '0.95rem', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              {f.q}<span>{open === i ? '▲' : '▼'}</span>
            </button>
            {open === i && <p style={{ margin: '0.5rem 0 0', color: '#475569', fontSize: '0.875rem' }}>{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
