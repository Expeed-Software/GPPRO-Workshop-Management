import React from 'react';
import s from './Inventory.module.css';

const FAQS = [
  { q: 'How do I add new stock?', a: 'Go to Stock In Entry and fill in the item code, quantity, unit cost, and reference number.' },
  { q: 'How is the available quantity calculated?', a: 'Available Qty = Total Stock In − Total Stock Out ± Adjustments.' },
  { q: 'Who can make physical adjustments?', a: 'Only Supervisors and Administrators can create physical stock adjustments (BR-73).' },
  { q: 'How is stock valuation calculated?', a: 'Valuation uses the method configured by the Administrator (BR-74). Only Admins can view valuation reports.' },
  { q: 'What triggers a reorder alert?', a: 'When available quantity falls below the item\'s reorder quantity threshold (BR-75).' },
  { q: 'Who can view audit logs?', a: 'Stock audit logs are accessible to Supervisors and Administrators only (BR-77).' },
];

export default function InventoryHelp() {
  return (
    <div data-testid="inventoryhelp-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Inventory Help</h1></div>
      <div className={s.card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Frequently Asked Questions</h2>
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
