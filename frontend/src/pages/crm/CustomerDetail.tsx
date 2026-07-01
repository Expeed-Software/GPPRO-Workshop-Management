import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import styles from './CrmList.module.css';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(Number(id)),
  });

  const c: any = (data?.data as any) || null;

  if (isLoading) return <div className={styles.loading}>Loading customer...</div>;
  if (error || !c) return <div className={styles.errorState} role="alert">Customer not found.</div>;

  return (
    <div data-testid="customer-detail-page" className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/crm/customers" className={styles.breadcrumbLink}>Customers</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{c.CustName || c.name}</span>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatarLg}>{(c.CustName || c.name || 'C').charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <h1 className={styles.profileName}>{c.CustName || c.name}</h1>
          <p className={styles.profileEmail}>{c.Phone1 || '—'}</p>
        </div>
        <div className={styles.profileActions}>
          <Link to={`/crm/customers/${id}/edit`}><Button variant="secondary" data-testid="customer-edit-button">Edit</Button></Link>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Customer Details</h2>
          {[
            ['ID', `#${c.CustId || c.id}`],
            ['Name', c.CustName || c.name],
            ['Phone', c.Phone1 || '—'],
            ['Email', c.email || '—'],
            ['Address', c.Address1 || '—'],
            ['Status', c.Active === 0 ? 'inactive' : 'active'],
          ].map(([label, val]) => (
            <div key={label} className={styles.fieldRow}>
              <span className={styles.dimText}>{label}</span>
              <span className={styles.fieldValue}>{val}</span>
            </div>
          ))}
        </div>
        <div className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Notes</h2>
          <p style={{ fontSize: 'var(--text-sm-size)', color: 'var(--color-text-secondary)' }}>{c.Remarks || 'No notes.'}</p>
        </div>
      </div>
    </div>
  );
};
