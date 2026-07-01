import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import s from './Admin.module.css';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data: summary, isLoading: loadSum } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminApi.dashboardSummary() });
  const { data: notifications = [], isLoading: loadNotif } = useQuery({ queryKey: ['admin-notifications'], queryFn: () => adminApi.notifications() });

  const markRead = useMutation({
    mutationFn: (id: string) => adminApi.updateNotification(id, { status: 'read' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  const labelMap: Record<string, string> = {
    UserCount: 'Total Users',
    CustomerCount: 'Active Customers',
    OpenJobs: 'Open Jobs',
    TodayLogins: 'Today Logins',
  };
  const kpis: [string, string][] = summary
    ? Object.entries(summary as any).slice(0, 6).map(([k, v]) => [labelMap[k] ?? k, v as string])
    : [];

  return (
    <div data-testid="admin-dashboard-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Admin Dashboard</h1></div>
      {loadSum ? <div className={s.skeleton} style={{ height: '80px', marginBottom: '1rem' }} /> : (
        <div className={s.kpiRow}>
          {kpis.map(([k, v]) => (
            <div key={k} className={s.kpiCard}><div className={s.kpiValue}>{String(v)}</div><div className={s.kpiLabel}>{k}</div></div>
          ))}
        </div>
      )}
      <div className={s.card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '0.75rem' }}>Admin Notifications</h2>
        {loadNotif ? <div className={s.skeleton} style={{ height: '80px' }} /> : (notifications as any[]).length === 0 ? (
          <div className={s.empty}>No notifications.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(notifications as any[]).slice(0, 10).map((n: any, i: number) => (
              <div key={i} data-testid={`adminnotification-row-${n.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: n.status === 'read' ? 'transparent' : 'rgba(56,49,196,0.05)', borderRadius: '0.375rem', border: '1px solid rgba(56,49,196,0.08)' }}>
                <span className={`${s.badge} ${n.status === 'read' ? s.badgeGreen : s.badgeYellow}`}>{n.status}</span>
                <span style={{ flex: 1, fontSize: '0.875rem' }}>{n.message ?? n.description}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.createdAt}</span>
                {n.status !== 'read' && <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid={`adminnotification-row-markread-${n.id}`} onClick={() => markRead.mutate(String(n.id))}>Mark Read</button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
