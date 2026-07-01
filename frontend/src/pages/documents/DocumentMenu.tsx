import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '../../api/documents';
import { useAuthStore } from '../../stores/auth';
import styles from './Documents.module.css';

const MENU_ITEMS = [
  { label: 'Create Document', icon: '📄', path: '/documents/entry', roles: ['Administrator', 'Supervisor', 'Standard User'], testid: 'docmenu-create-btn' },
  { label: 'Manage Documents', icon: '🗂️', path: '/documents/list', roles: ['Administrator', 'Supervisor', 'Standard User'], testid: 'docmenu-list-link' },
  { label: 'Upload Attachments', icon: '📎', path: '/attachments', roles: ['Administrator', 'Supervisor', 'Standard User'], testid: 'docmenu-attach-link' },
  { label: 'Additional Remarks', icon: '💬', path: '/documents/additional-remarks-report', roles: ['Administrator', 'Supervisor'], testid: 'docmenu-remarks-link' },
  { label: 'Head Management', icon: '⚙️', path: '/documents/heads', roles: ['Administrator', 'Supervisor'], testid: 'docmenu-heads-link' },
  { label: 'Templates', icon: '📋', path: '/documents/templates', roles: ['Administrator'], testid: 'docmenu-templates-link' },
];

export const DocumentMenu: React.FC = () => {
  const { hasAnyRole } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['document-menu'],
    queryFn: documentsApi.menuData,
  });

  const recentDocs: any[] = (data?.data as any) || [];

  return (
    <div data-testid="document-menu-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Document Management</h1>
          <p className={styles.subtitle}>Manage documents, attachments, and remarks</p>
        </div>
      </div>

      {error && <div className={styles.errorBanner} role="alert">Failed to load document menu data.</div>}

      <div className={styles.menuGrid}>
        {MENU_ITEMS.map((item) => {
          const canAccess = hasAnyRole(item.roles);
          return (
            <Link
              key={item.testid}
              to={canAccess ? item.path : '#'}
              data-testid={item.testid}
              className={styles.menuCard}
              aria-disabled={!canAccess}
              onClick={(e) => !canAccess && e.preventDefault()}
            >
              <span className={styles.menuCardIcon}>{item.icon}</span>
              <span className={styles.menuCardLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 style={{ fontSize: 'var(--text-body-size)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Recent Documents</h2>
        {isLoading ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm-size)' }}>Loading...</div>
        ) : recentDocs.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm-size)' }}>No recent documents.</div>
        ) : (
          <div data-testid="docmenu-recent-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentDocs.slice(0, 5).map((doc: any) => (
              <Link key={doc.id} to={`/documents/${doc.id}`} style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm-size)', textDecoration: 'none', fontWeight: 500 }}>
                {doc.title || doc.docType || `Document #${doc.id}`}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
