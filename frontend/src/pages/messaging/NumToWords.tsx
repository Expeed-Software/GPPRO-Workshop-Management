import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { utilApi } from '../../api/messaging';
import s from './Messaging.module.css';

const CURRENCIES = ['USD', 'AED', 'SAR', 'QAR', 'OMR', 'BHD', 'KWD', 'EUR', 'GBP', 'INR'];

export default function NumToWords() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const convertMut = useMutation({
    mutationFn: () => utilApi.numToWords({ number: amount, currency }),
    onSuccess: (data: any) => setOutput(data?.recordset?.[0]?.result ?? data?.result ?? data?.words ?? data ?? ''),
  });

  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div data-testid="numwords-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Number to Words</h1></div>
      <div className={s.card} style={{ maxWidth: '520px' }}>
        <div className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label>Amount</label>
              <input
                data-testid="numwords-input"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter numeric amount"
              />
            </div>
            <div className={s.field}>
              <label>Currency</label>
              <select data-testid="numwords-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            onClick={() => convertMut.mutate()}
            disabled={!amount || convertMut.isPending}
          >
            {convertMut.isPending ? 'Converting...' : 'Convert'}
          </button>
          {output && (
            <div>
              <div data-testid="numwords-output" style={{ background: 'rgba(56,49,196,0.06)', borderRadius: '0.375rem', padding: '0.75rem', fontStyle: 'italic', color: '#1e1b4b', marginTop: '0.5rem' }}>
                {output}
              </div>
              <button className={`${s.btn} ${s.btnSecondary}`} style={{ marginTop: '0.5rem', fontSize: '0.8rem' }} data-testid="numwords-copy-btn" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
