import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import s from './Accounts.module.css';

function TreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  return (
    <div style={{ paddingLeft: `${depth * 1.25}rem` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0', cursor: hasChildren ? 'pointer' : 'default' }} onClick={() => hasChildren && setOpen((p) => !p)}>
        {hasChildren && <span style={{ fontSize: '0.75rem', color: '#3831c4' }}>{open ? '▼' : '▶'}</span>}
        {!hasChildren && <span style={{ width: '1rem' }} />}
        <span className={s.treeNodeName}>{node.CODES} — {node.HEAD}</span>
        <span className={`${s.badge} ${s.badgeGreen}`} style={{ marginLeft: 'auto' }}>{node.CORD}</span>
      </div>
      {open && hasChildren && node.children.map((child: any, i: number) => <TreeNode key={i} node={child} depth={depth + 1} />)}
    </div>
  );
}

export default function AccountTree() {
  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['account-head-tree'],
    queryFn: () => accountsApi.headTree({}),
  });

  return (
    <div data-testid="acheadtree-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Account Tree</h1>
        <button className={`${s.btn} ${s.btnSecondary}`} data-testid="acheadtree-export-btn">Export</button>
      </div>
      <div className={s.card} data-testid="acheadtree-root">
        {isLoading ? <div className={s.skeleton} style={{ height: '200px' }} /> : (tree as any[]).length === 0 ? (
          <div className={s.empty}>No account structure found.</div>
        ) : (
          (tree as any[]).map((node: any, i: number) => <TreeNode key={i} node={node} />)
        )}
      </div>
    </div>
  );
}

export function AccountTreeListView() {
  const [search, setSearch] = useState('');
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['account-tree-list', search],
    queryFn: () => accountsApi.headTreeList({ search }),
  });

  return (
    <div data-testid="account-tree-list-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Account Head Tree List</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Search..." data-testid="account-tree-list-search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="account-tree-list-table">
              <thead><tr><th>Code</th><th>Name</th><th>Parent</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {(items as any[]).map((h: any, i: number) => (
                  <tr key={i}><td>{h.CODES}</td><td>{h.HEAD}</td><td>{h.HEADUNDER ?? '—'}</td><td>{h.CORD}</td><td><span className={`${s.badge} ${s.badgeGreen}`}>Active</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
