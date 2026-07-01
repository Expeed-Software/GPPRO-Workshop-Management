import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import styles from './CrmList.module.css';

export const ContactList: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ search: '', page: 1 });
  const [dupCheck, setDupCheck] = useState({ name: '', phone: '', email: '' });
  const [dupResults, setDupResults] = useState<any[] | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => contactsApi.list(filters),
  });

  const contacts: any[] = (data?.data as any) || [];

  const checkDupMutation = useMutation({
    mutationFn: () => contactsApi.checkDuplicate(dupCheck),
    onSuccess: (res) => setDupResults((res?.data as any) || []),
  });

  return (
    <div data-testid="contact-list-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Contacts</h1>
          <p className={styles.subtitle}>Manage all contact records across customers and suppliers</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => navigate('/crm/contacts/new')} data-testid="contact-new-button">+ New Contact</Button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <input className={styles.searchInput} placeholder="Search by name, phone, email..."
          data-testid="contact-search-input" value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} />
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>{[...Array(5)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}</div>
        ) : error ? (
          <div className={styles.errorState} role="alert">Failed to load contacts.</div>
        ) : contacts.length === 0 ? (
          <div className={styles.emptyState}>No contacts found.</div>
        ) : (
          <table className={styles.table} data-testid="contact-list-table">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>Linked To</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {contacts.map((c: any) => {
                const id = c.id;
                return (
                  <tr key={id} className={styles.row}>
                    <td className={styles.nameCell}>
                      <div className={styles.avatar}>{(c.ContactPerson ?? c.name ?? c.Name ?? 'C').charAt(0).toUpperCase()}</div>
                      <div className={styles.primaryText}>{c.ContactPerson ?? c.name ?? c.Name}</div>
                    </td>
                    <td className={styles.dimText}>{c.phone ?? c.Phone1 ?? '—'}</td>
                    <td className={styles.dimText}>{c.email ?? c.Email ?? '—'}</td>
                    <td className={styles.dimText}>{c.linkedEntity ?? c.name ?? '—'}</td>
                    <td className={styles.actions}>
                      <Link to={`/crm/contacts/${id}`} className={styles.actionLink}>View</Link>
                      <Link to={`/crm/contacts/${id}/edit`} className={styles.actionLink}>Edit</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
