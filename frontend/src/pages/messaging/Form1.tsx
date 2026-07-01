import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import s from './Messaging.module.css';

export default function Form1() {
  const [output, setOutput] = useState<any>(null);
  const { register, handleSubmit, reset } = useForm<any>();

  const onGenerate = (d: any) => { setOutput(d); };

  return (
    <div data-testid="form1-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Form 1 (Dev/Test Tool)</h1></div>
      <div className={s.card}>
        <form onSubmit={handleSubmit(onGenerate)} className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label>Field A</label>
              <input {...register('fieldA')} placeholder="Value A" />
            </div>
            <div className={s.field}>
              <label>Field B</label>
              <input {...register('fieldB')} placeholder="Value B" />
            </div>
            <div className={s.field}>
              <label>Field C (number)</label>
              <input type="number" {...register('fieldC')} />
            </div>
          </div>
          <div className={s.field}>
            <label>Notes</label>
            <textarea {...register('notes')} rows={3} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`} data-testid="form1-generate-btn">Generate</button>
            <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="form1-clear-btn" onClick={() => { reset(); setOutput(null); }}>Clear</button>
          </div>
        </form>
        {output && (
          <div style={{ marginTop: '1rem', background: 'rgba(56,49,196,0.05)', borderRadius: '0.375rem', padding: '0.75rem' }}>
            <strong style={{ fontSize: '0.8rem', color: '#3831c4' }}>Output:</strong>
            <pre style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{JSON.stringify(output, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
