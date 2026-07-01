import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Button } from '../../components/ui/Button';
import styles from './UserRights.module.css';

const ROLES = ['Administrator', 'Supervisor', 'Standard User'];

export const UserRights: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['rolePermissions', selectedRole],
    queryFn: () => usersApi.getRights({ role: selectedRole }),
  });

  const [localPerms, setLocalPerms] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (data?.data) {
      const raw = data.data as any;
      // Backend returns RolePermission[] array — restructure into flat object keyed by "module.action"
      if (Array.isArray(raw)) {
        const flat: Record<string, boolean> = {};
        for (const entry of raw) {
          if (!entry || !entry.module) continue;
          flat[`${entry.module}.canView`] = !!entry.canView;
          flat[`${entry.module}.canCreate`] = !!entry.canCreate;
          flat[`${entry.module}.canEdit`] = !!entry.canEdit;
          flat[`${entry.module}.canDelete`] = !!entry.canDelete;
          flat[`${entry.module}.canExport`] = !!entry.canExport;
        }
        setLocalPerms(flat);
      } else {
        setLocalPerms(raw);
      }
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => usersApi.assignPermissions({ role: selectedRole, permissions: localPerms }),
    onSuccess: () => {
      setSaved(true);
      setError('');
      qc.invalidateQueries({ queryKey: ['rolePermissions'] });
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err: any) => setError(err?.response?.data?.error?.message || 'Failed to save permissions.'),
  });

  const toggle = (key: string) => setLocalPerms((p) => ({ ...p, [key]: !p[key] }));

  const permKeys = Object.keys(localPerms);

  return (
    <div data-testid="user-rights-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Rights & Permissions</h1>
          <p className={styles.subtitle}>Manage role-based access control for each system role</p>
        </div>
      </div>

      <div className={styles.roleTabs} role="tablist">
        {ROLES.map((role) => (
          <button
            key={role}
            role="tab"
            aria-selected={selectedRole === role}
            className={`${styles.roleTab} ${selectedRole === role ? styles.roleTabActive : ''}`}
            onClick={() => { setSelectedRole(role); setSaved(false); setError(''); }}
          >
            {role}
          </button>
        ))}
      </div>

      <div className={styles.matrixCard}>
        {saved && <div className={styles.successBanner} role="status">Permissions saved successfully.</div>}
        {error && <div className={styles.errorBanner} role="alert">{error}</div>}

        {isLoading ? (
          <div className={styles.loadingState}>Loading permissions...</div>
        ) : permKeys.length === 0 ? (
          <div className={styles.emptyState}>No permissions configured for this role.</div>
        ) : (
          <div className={styles.permGrid} data-testid="permissions-matrix">
            {permKeys.map((key) => (
              <label key={key} className={styles.permRow}>
                <div className={styles.permInfo}>
                  <span className={styles.permKey}>{key}</span>
                </div>
                <div
                  role="switch"
                  aria-checked={!!localPerms[key]}
                  className={`${styles.toggle} ${localPerms[key] ? styles.toggleOn : ''}`}
                  onClick={() => toggle(key)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggle(key)}
                >
                  <div className={styles.toggleThumb} />
                </div>
              </label>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Button
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            data-testid="save-permissions-button"
          >
            Save Permissions
          </Button>
        </div>
      </div>
    </div>
  );
};
