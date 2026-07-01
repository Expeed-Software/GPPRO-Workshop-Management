import React from 'react';
import { useNavigate } from 'react-router-dom';
import s from './Messaging.module.css';

const MODULES = [
  { id: 'customers', label: 'Customers', icon: '👤', path: '/customers' },
  { id: 'suppliers', label: 'Suppliers', icon: '🏭', path: '/suppliers' },
  { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory' },
  { id: 'accounts', label: 'Accounts', icon: '📊', path: '/accounts' },
  { id: 'payments', label: 'Payments', icon: '💳', path: '/payments/entry' },
  { id: 'receipts', label: 'Receipts', icon: '🧾', path: '/receipts/entry' },
  { id: 'reports', label: 'Reports', icon: '📈', path: '/reports' },
  { id: 'personnel', label: 'Personnel', icon: '👥', path: '/personnel' },
  { id: 'vehicles', label: 'Vehicles', icon: '🚗', path: '/vehicles' },
  { id: 'jobs', label: 'Job Orders', icon: '🔧', path: '/job-orders' },
  { id: 'messages', label: 'Messages', icon: '✉️', path: '/messages/offline' },
  { id: 'admin', label: 'Admin', icon: '⚙️', path: '/admin/dashboard' },
];

export default function MainMenu() {
  const navigate = useNavigate();
  return (
    <div data-testid="main-menu-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Main Menu</h1></div>
      <div className={s.tileGrid}>
        {MODULES.map((m) => (
          <div
            key={m.id}
            className={s.tile}
            data-testid={`main-menu-tile-${m.id}`}
            onClick={() => navigate(m.path)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
          >
            <span style={{ fontSize: '2rem' }}>{m.icon}</span>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e1b4b' }}>{m.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '2rem' }} className={s.card}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            className={s.tile}
            data-testid="cs-menu-card-customer"
            onClick={() => navigate('/customers')}
            style={{ minWidth: '160px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '1.5rem' }}>👤</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#3831c4' }}>Customer Module</div>
          </div>
        </div>
      </div>
    </div>
  );
}
