import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Download, Upload, UserCheck, UserX, Unlock, RefreshCw } from 'lucide-react';
import { usersApi, UserRecord } from '../../api/users';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/auth';
import { downloadFileFromApi } from '../../utils/export';
import styles from './UserList.module.css';

const STATUS_COLORS: Record<string, string> = {
  active: '#2eae6c',
  inactive: '#959ac7',
  locked: '#d23b41',
};

const ROLE_COLORS: Record<string, string> = {
  Administrator: '#3831c4',
  Supervisor: '#368aad',
  'Standard User': '#595987',
};

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { hasAnyRole } = useAuthStore();
  const isAdmin = hasAnyRole(['Administrator']);

  const [filters, setFilters] = useState({ name: '', role: '', status: '', page: 1 });
  const [selected, setSelected] = useState<number[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersApi.list(filters),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: string }) =>
      usersApi.bulkSetStatus(ids, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setSelected([]); },
  });

  const users: UserRecord[] = (data?.data as any) || [];
  const total = (data?.meta?.total) || 0;

  const toggleSelect = (id: number) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const toggleAll = () => {
    if (selected.length === users.length) setSelected([]);
    else setSelected(users.map((u) => u.id));
  };

  return (
    <div data-testid="user-list-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Manage user accounts, roles, and access</p>
        </div>
        {isAdmin && (
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadFileFromApi(usersApi.export(), 'users.csv')}
            >
              <Download size={15} /> Export
            </Button>
            <Button size="sm" onClick={() => navigate('/admin/users/new')}>
              <Plus size={15} /> New User
            </Button>
          </div>
        )}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            data-testid="user-list-search"
            className={styles.searchInput}
            placeholder="Search by name, email..."
            value={filters.name}
            onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value, page: 1 }))}
          />
        </div>

        <select
          className={styles.filterSelect}
          data-testid="user-list-role-filter"
          value={filters.role}
          onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))}
        >
          <option value="">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Standard User">Standard User</option>
        </select>

        <select
          className={styles.filterSelect}
          data-testid="user-list-status-filter"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
        </select>
      </div>

      {selected.length > 0 && isAdmin && (
        <div className={styles.bulkBar}>
          <span>{selected.length} selected</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => bulkStatusMutation.mutate({ ids: selected, status: 'active' })}
            loading={bulkStatusMutation.isPending}
          >
            <UserCheck size={14} /> Activate
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => bulkStatusMutation.mutate({ ids: selected, status: 'inactive' })}
            loading={bulkStatusMutation.isPending}
          >
            <UserX size={14} /> Deactivate
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Cancel</Button>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton} aria-label="Loading users">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorState} role="alert">Failed to load users. Please try again.</div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>No users found matching your criteria.</div>
        ) : (
          <table className={styles.table} data-testid="user-list-table">
            <thead>
              <tr>
                {isAdmin && (
                  <th>
                    <input type="checkbox" checked={selected.length === users.length} onChange={toggleAll} aria-label="Select all" />
                  </th>
                )}
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={styles.row}>
                  {isAdmin && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </td>
                  )}
                  <td className={styles.nameCell}>
                    <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userUsername}>@{user.username}</div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className={styles.roles}>
                      {user.roles.map((r) => (
                        <span
                          key={r}
                          className={styles.roleBadge}
                          style={{ background: (ROLE_COLORS[r] || '#595987') + '18', color: ROLE_COLORS[r] || '#595987' }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ background: (STATUS_COLORS[user.status] || '#959ac7') + '18', color: STATUS_COLORS[user.status] || '#959ac7' }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className={styles.dimCell}>
                    {(user as any).lastLoginAt ? new Date((user as any).lastLoginAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <Link to={`/admin/users/${user.id}`} className={styles.actionLink}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <span className={styles.totalCount}>{total} total users</span>
        <Button
          size="sm"
          variant="ghost"
          disabled={filters.page <= 1}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
        >
          Previous
        </Button>
        <span>Page {filters.page}</span>
        <Button
          size="sm"
          variant="ghost"
          disabled={users.length < 20}
          onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
