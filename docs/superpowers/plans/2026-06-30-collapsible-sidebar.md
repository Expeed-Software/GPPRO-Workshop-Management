# Collapsible Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the horizontal top navbar with a collapsible left sidebar that shows icons+labels when expanded (220px) and icons-only when collapsed (52px).

**Architecture:** AppLayout switches from column-flex to row-flex. AppNav becomes a vertical sidebar with a toggle button at the top. Submenus become inline accordions (expand in place) when sidebar is expanded, and floating popouts when collapsed. Profile/user controls move to the sidebar footer.

**Tech Stack:** React, TypeScript, CSS Modules, React Router, Lucide icons, Zustand (auth store)

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `src/components/AppLayout.tsx` | Modify | `flex-direction: row`, pass `collapsed` state down or use context |
| `src/components/AppLayout.module.css` | Modify | Row layout, sidebar + main side-by-side |
| `src/components/AppNav.tsx` | Rewrite | Vertical sidebar, toggle, accordion submenus |
| `src/components/AppNav.module.css` | Rewrite | Sidebar styles, collapsed/expanded states |

---

## Task 1: Sidebar state with localStorage persistence

**Files:**
- Modify: `src/components/AppNav.tsx` (add collapsed state at top of component)

- [ ] **Step 1: Add collapsed state to AppNav**

In `AppNav.tsx`, add this inside the `AppNav` component, after the existing `useState` declarations:

```tsx
const [collapsed, setCollapsed] = useState<boolean>(() => {
  return localStorage.getItem('sidebarCollapsed') === 'true';
});

const toggleCollapsed = () => {
  setCollapsed((prev) => {
    localStorage.setItem('sidebarCollapsed', String(!prev));
    return !prev;
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AppNav.tsx
git commit -m "feat: add collapsible sidebar state with localStorage persistence"
```

---

## Task 2: Rewrite AppLayout for row layout

**Files:**
- Modify: `src/components/AppLayout.tsx`
- Modify: `src/components/AppLayout.module.css`

- [ ] **Step 1: Update AppLayout.tsx**

Replace the entire file with:

```tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNav } from './AppNav';
import styles from './AppLayout.module.css';

export const AppLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <AppNav />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
```

- [ ] **Step 2: Update AppLayout.module.css**

Replace the entire file with:

```css
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  background: var(--color-bg-page);
}

.main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: var(--space-6);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AppLayout.tsx src/components/AppLayout.module.css
git commit -m "feat: switch AppLayout to row flex for sidebar layout"
```

---

## Task 3: Rewrite AppNav.module.css for sidebar

**Files:**
- Modify: `src/components/AppNav.module.css`

- [ ] **Step 1: Replace AppNav.module.css entirely**

```css
/* ── Sidebar shell ── */
.nav {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  box-shadow: 2px 0 16px 0 rgba(56,49,196,0.18);
  z-index: 100;
  transition: width 0.22s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
  flex-shrink: 0;
}

.nav.expanded { width: 220px; }
.nav.collapsed { width: 52px; }

/* ── Toggle button ── */
.toggleBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.12);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
  margin: 12px auto 4px;
}
.toggleBtn:hover { background: rgba(255,255,255,0.22); }
.toggleBtn:focus-visible { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 2px; }

/* ── Logo area ── */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  padding: 10px 12px 14px;
  flex-shrink: 0;
  overflow: hidden;
  white-space: nowrap;
}

/* ── Scroll area for nav items ── */
.navLinks {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0 8px;
}
.navLinks::-webkit-scrollbar { width: 3px; }
.navLinks::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

/* ── Section labels ── */
.sectionLabel {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  padding: 10px 14px 3px;
  white-space: nowrap;
  overflow: hidden;
}
.nav.collapsed .sectionLabel { visibility: hidden; height: 0; padding: 0; }

/* ── Nav items ── */
.navItem {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 14px;
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-decoration: none;
  font-family: inherit;
  text-align: left;
  position: relative;
  transition: background 0.15s, color 0.15s;
}
.navItem:hover { background: rgba(255,255,255,0.09); color: #fff; }
.navItem.active { background: rgba(255,255,255,0.16); color: #fff; font-weight: 600; }
.navItem.active::before {
  content: '';
  position: absolute;
  left: 0; top: 5px; bottom: 5px;
  width: 3px;
  background: #fff;
  border-radius: 0 2px 2px 0;
}
.navItem:focus-visible { outline: 2px solid rgba(255,255,255,0.5); outline-offset: -2px; }

.navIcon { flex-shrink: 0; display: flex; align-items: center; }
.navLabel { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.navChevron { flex-shrink: 0; transition: transform 0.18s; margin-left: auto; }
.navChevron.open { transform: rotate(180deg); }

/* collapsed: center icons, hide text */
.nav.collapsed .navItem { padding: 9px; justify-content: center; gap: 0; }
.nav.collapsed .navLabel,
.nav.collapsed .navChevron { display: none; }

/* ── Accordion submenu ── */
.subMenu {
  overflow: hidden;
  transition: max-height 0.2s ease;
}
.nav.collapsed .subMenu { display: none; }

.subItem {
  display: block;
  padding: 7px 14px 7px 40px;
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.12s, color 0.12s;
}
.subItem:hover { background: rgba(255,255,255,0.07); color: #fff; }
.subItem.subActive { color: #fff; font-weight: 600; background: rgba(255,255,255,0.10); }

/* ── Floating submenu (collapsed mode) ── */
.floatMenu {
  position: fixed;
  left: 52px;
  min-width: 190px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  z-index: 400;
  overflow: hidden;
  padding: 4px 0;
}
.floatMenuTitle {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
  padding: 8px 14px 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.floatMenuItem {
  display: block;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background 0.1s;
  white-space: nowrap;
}
.floatMenuItem:hover { background: var(--color-primary-surface); color: var(--color-primary); }
.floatMenuItem.floatActive { background: var(--color-primary-surface); color: var(--color-primary); font-weight: 600; }

/* ── Sidebar footer (profile) ── */
.sidebarFooter {
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.12);
  padding: 8px 0 4px;
}

.profileBtn {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s;
  white-space: nowrap;
  overflow: hidden;
}
.profileBtn:hover { background: rgba(255,255,255,0.09); }
.nav.collapsed .profileBtn { justify-content: center; gap: 0; padding: 9px; }

.avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.profileInfo { display: flex; flex-direction: column; line-height: 1.2; flex: 1; overflow: hidden; }
.profileName { font-size: 13px; font-weight: 600; color: #fff; overflow: hidden; text-overflow: ellipsis; }
.profileRole { font-size: 10px; color: rgba(255,255,255,0.65); }

.nav.collapsed .profileInfo,
.nav.collapsed .profileChevron { display: none; }

/* profile dropdown */
.profileDropdown {
  position: fixed;
  bottom: 60px;
  left: 8px;
  min-width: 190px;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 400;
}

.dropdownItem {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: 10px 16px;
  font-size: var(--text-sm-size);
  color: var(--color-text-primary);
  background: none;
  border: none;
  text-decoration: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  font-family: inherit;
}
.dropdownItem:hover { background: var(--color-primary-surface); }
.dropdownDivider { border: none; border-top: 1px solid var(--color-border); margin: 4px 0; }
.signOutItem { color: var(--color-error); }
.signOutItem:hover { background: rgba(210,59,65,0.06); }

/* bell button */
.iconBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  padding: 8px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s;
  white-space: nowrap;
}
.iconBtn:hover { background: rgba(255,255,255,0.09); color: #fff; }
.nav.collapsed .iconBtn { justify-content: center; gap: 0; padding: 9px; }
.nav.collapsed .iconBtnLabel { display: none; }

@media (prefers-reduced-motion: reduce) {
  .nav, .subMenu, .navChevron { transition: none !important; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AppNav.module.css
git commit -m "feat: rewrite AppNav CSS for collapsible vertical sidebar"
```

---

## Task 4: Rewrite AppNav.tsx component

**Files:**
- Modify: `src/components/AppNav.tsx`

- [ ] **Step 1: Replace AppNav.tsx entirely**

```tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, FileText, Briefcase,
  ShoppingCart, Package, DollarSign, BookOpen, Receipt,
  BarChart2, Settings, Bell, LogOut, ChevronDown, User,
  Truck, Warehouse, Menu,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../api/auth';
import { Logo } from './Logo';
import styles from './AppNav.module.css';

interface SubItem { label: string; path: string; }
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: ('Administrator' | 'Supervisor' | 'Standard User')[];
  sub?: SubItem[];
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  {
    label: 'CRM', path: '/crm/customers', icon: <Building2 size={18} />,
    section: 'Operations',
    sub: [
      { label: 'Customers', path: '/crm/customers' },
      { label: 'Suppliers', path: '/crm/suppliers' },
      { label: 'Contacts', path: '/crm/contacts' },
      { label: 'Vehicles', path: '/crm/vehicles' },
      { label: 'Agewise Summary', path: '/customers/agewise' },
    ],
  },
  { label: 'Documents', path: '/documents', icon: <FileText size={18} /> },
  {
    label: 'Jobs', path: '/jobs/work-status', icon: <Briefcase size={18} />,
    sub: [
      { label: 'Work Status', path: '/jobs/work-status' },
      { label: 'Estimation List', path: '/jobs/estimations' },
      { label: 'Estimation Entry', path: '/jobs/estimation-entry' },
      { label: 'Job Order Status', path: '/jobs/orders/status' },
      { label: 'Work Status Report', path: '/jobs/work-status-report' },
      { label: 'Status Advisor Wise', path: '/jobs/status-advisorwise-report' },
    ],
  },
  {
    label: 'Sales', path: '/sales/orders', icon: <ShoppingCart size={18} />,
    sub: [
      { label: 'Sales Orders', path: '/sales/orders' },
      { label: 'Pending Orders', path: '/sales/orders/pending' },
      { label: 'Order Status', path: '/sales/orders/status' },
      { label: 'Delivery Log', path: '/sales/delivery/log' },
      { label: 'Sales Report', path: '/orders/sales-report' },
      { label: 'Delivery Notes Report', path: '/orders/delivery-notes' },
      { label: 'Labour Issue', path: '/sales/labour-issue' },
    ],
  },
  {
    label: 'Purchase', path: '/purchase/orders/local/manage', icon: <Truck size={18} />,
    sub: [
      { label: 'Local Purchase Orders', path: '/purchase/orders/local/manage' },
      { label: 'New Local PO', path: '/purchase/orders/local' },
      { label: 'Foreign PO', path: '/purchase/orders/foreign' },
      { label: 'Pending Delivery Orders', path: '/purchase/delivery-orders/pending' },
      { label: 'Purchase Report', path: '/purchase/reports/orders' },
      { label: 'LPO Analysis', path: '/purchase/lpo-analysis' },
    ],
  },
  {
    label: 'Inventory', path: '/inventory/items', icon: <Warehouse size={18} />,
    section: 'Stock & Finance',
    sub: [
      { label: 'Items', path: '/inventory/items' },
      { label: 'Stock Display', path: '/inventory/stock/display' },
      { label: 'Stock In', path: '/inventory/stock/in' },
      { label: 'Stock Out', path: '/inventory/stock/out' },
      { label: 'Stock Ledger', path: '/inventory/stock/ledger' },
      { label: 'Reorder Status', path: '/inventory/stock/reorder-status' },
    ],
  },
  {
    label: 'Banking', path: '/finance/bank-book', icon: <DollarSign size={18} />,
    sub: [
      { label: 'Bank Book', path: '/finance/bank-book' },
      { label: 'Cash Book', path: '/finance/cash-book' },
      { label: 'Bank Reconciliation', path: '/finance/bank-reconciliation/select-bank' },
      { label: 'PDC Issues', path: '/payments/pdc-issue' },
      { label: 'PDC Receipts', path: '/payments/pdc-receipt' },
      { label: 'CBP Book', path: '/reports/bank-cash-book' },
    ],
  },
  {
    label: 'Accounts', path: '/accounts/heads', icon: <BookOpen size={18} />,
    sub: [
      { label: 'Account Heads', path: '/accounts/heads' },
      { label: 'Account Tree', path: '/accounts/tree' },
      { label: 'Trial Balance', path: '/reports/trial-balance' },
      { label: 'Ledger Report', path: '/reports/ledger' },
      { label: 'Vouchers', path: '/vouchers/list' },
      { label: 'Journal Entry', path: '/vouchers/journal-entry' },
    ],
  },
  {
    label: 'Transactions', path: '/payments/entry', icon: <Receipt size={18} />,
    sub: [
      { label: 'Payment Entry', path: '/payments/entry' },
      { label: 'Receipt Entry', path: '/receipts/entry' },
      { label: 'Petty Cash', path: '/receipts/petty-cash' },
      { label: 'Payment Finalization', path: '/payments/finalize' },
      { label: 'Receipts Report', path: '/reports/receipts' },
      { label: 'Payments Report', path: '/reports/payments' },
    ],
  },
  {
    label: 'Reports', path: '/reports', icon: <BarChart2 size={18} />,
    sub: [
      { label: 'Reports Dashboard', path: '/reports' },
      { label: 'Profit & Loss', path: '/reports/profit-loss' },
      { label: 'Balance Sheet', path: '/reports/balance-sheet' },
      { label: 'Sales Analysis', path: '/reports/sales-analysis' },
      { label: 'Customer Bills', path: '/reports/customer-bills/detailed-summary' },
      { label: 'Customer Outstanding', path: '/reports/customer-outstanding' },
    ],
  },
  {
    label: 'Payroll', path: '/payroll/salary-entry', icon: <DollarSign size={18} />,
    roles: ['Administrator', 'Supervisor'],
    section: 'Admin',
    sub: [
      { label: 'Employee List', path: '/admin/employees' },
      { label: 'New Employee', path: '/admin/employees/new' },
      { label: 'Salary Entry', path: '/payroll/salary-entry' },
      { label: 'Salary Register', path: '/personnel/payroll/register' },
      { label: 'Clocking / Attendance', path: '/payroll/clocking' },
    ],
  },
  {
    label: 'Admin', path: '/admin/dashboard', icon: <Settings size={18} />,
    roles: ['Administrator', 'Supervisor'],
    sub: [
      { label: 'Admin Dashboard', path: '/admin/dashboard' },
      { label: 'User Management', path: '/admin/users' },
      { label: 'Employee List', path: '/admin/employees' },
      { label: 'System Settings', path: '/admin/settings' },
      { label: 'User Log', path: '/admin/userlog' },
      { label: 'Messaging', path: '/messages/offline' },
      { label: 'Company Info', path: '/customers-suppliers/menu' },
    ],
  },
];

export const AppNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth, refreshToken, hasAnyRole } = useAuthStore();
  const navRef = useRef<HTMLDivElement>(null);

  const [collapsed, setCollapsed] = useState<boolean>(() =>
    localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  // for collapsed floating submenu: { key, top }
  const [floatMenu, setFloatMenu] = useState<{ key: string; top: number } | null>(null);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      if (!prev) {
        // collapsing — close accordion menus
        setOpenMenu(null);
        setFloatMenu(null);
      }
      return !prev;
    });
  };

  const visibleItems = navItems.filter(
    (item) => !item.roles || hasAnyRole(item.roles as any)
  );

  const isActive = (item: NavItem) =>
    location.pathname === item.path ||
    (item.sub?.some((s) => location.pathname.startsWith(s.path)) ?? false) ||
    location.pathname.startsWith(item.path);

  const handleSignOut = async () => {
    try { if (refreshToken) await authApi.signOut(refreshToken); } catch {}
    clearAuth();
    navigate('/auth/sign-in');
  };

  // close float menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setFloatMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // close float menu on route change
  useEffect(() => {
    setFloatMenu(null);
    setOpenMenu(null);
  }, [location.pathname]);

  const handleNavItemClick = useCallback(
    (item: NavItem, e: React.MouseEvent<HTMLElement>) => {
      if (!item.sub) return; // Link handles routing directly
      if (collapsed) {
        // show floating submenu
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setFloatMenu((prev) =>
          prev?.key === item.path ? null : { key: item.path, top: rect.top }
        );
      } else {
        setOpenMenu((prev) => (prev === item.path ? null : item.path));
      }
    },
    [collapsed]
  );

  return (
    <nav
      className={[styles.nav, collapsed ? styles.collapsed : styles.expanded].join(' ')}
      aria-label="Main navigation"
      ref={navRef}
    >
      {/* Toggle button */}
      <button
        className={styles.toggleBtn}
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Menu size={16} />
      </button>

      {/* Logo */}
      <Link to="/dashboard" className={styles.logo}>
        <Logo size={28} showText={!collapsed} textColor="#fff" />
      </Link>

      {/* Nav items */}
      <div className={styles.navLinks}>
        {visibleItems.map((item) => {
          const active = isActive(item);
          const itemClasses = [styles.navItem, active ? styles.active : ''].filter(Boolean).join(' ');

          // Section label
          const showSection = item.section;

          const navElement = item.sub ? (
            <>
              {showSection && (
                <div className={styles.sectionLabel}>{item.section}</div>
              )}
              <button
                key={item.path}
                className={itemClasses}
                onClick={(e) => handleNavItemClick(item, e)}
                aria-haspopup="true"
                aria-expanded={collapsed ? floatMenu?.key === item.path : openMenu === item.path}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                <ChevronDown
                  size={13}
                  className={[
                    styles.navChevron,
                    (!collapsed && openMenu === item.path) ? styles.open : '',
                  ].filter(Boolean).join(' ')}
                />
              </button>

              {/* Accordion submenu (expanded sidebar) */}
              {!collapsed && openMenu === item.path && (
                <div className={styles.subMenu}>
                  {item.sub.map((s) => (
                    <Link
                      key={s.path}
                      to={s.path}
                      className={[
                        styles.subItem,
                        location.pathname === s.path ? styles.subActive : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Floating submenu (collapsed sidebar) */}
              {collapsed && floatMenu?.key === item.path && (
                <div className={styles.floatMenu} style={{ top: floatMenu.top }}>
                  <div className={styles.floatMenuTitle}>{item.label}</div>
                  {item.sub.map((s) => (
                    <Link
                      key={s.path}
                      to={s.path}
                      className={[
                        styles.floatMenuItem,
                        location.pathname === s.path ? styles.floatActive : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setFloatMenu(null)}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {showSection && (
                <div className={styles.sectionLabel}>{item.section}</div>
              )}
              <Link key={item.path} to={item.path} className={itemClasses}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </>
          );

          return <React.Fragment key={item.path}>{navElement}</React.Fragment>;
        })}
      </div>

      {/* Footer: notifications + profile */}
      <div className={styles.sidebarFooter}>
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={17} />
          {!collapsed && <span className={styles.iconBtnLabel}>Notifications</span>}
        </button>

        <button
          className={styles.profileBtn}
          onClick={() => setProfileOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={profileOpen}
        >
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{user?.name}</span>
                <span className={styles.profileRole}>{user?.roles?.[0]}</span>
              </div>
              <ChevronDown size={13} className={styles.profileChevron} />
            </>
          )}
        </button>

        {profileOpen && (
          <div className={styles.profileDropdown}>
            <Link
              to="/profile"
              className={styles.dropdownItem}
              onClick={() => setProfileOpen(false)}
            >
              <User size={15} /> My Profile
            </Link>
            <Link
              to="/auth/change-password"
              className={styles.dropdownItem}
              onClick={() => setProfileOpen(false)}
            >
              Change Password
            </Link>
            <hr className={styles.dropdownDivider} />
            <button
              className={[styles.dropdownItem, styles.signOutItem].join(' ')}
              onClick={handleSignOut}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppNav.tsx
git commit -m "feat: rewrite AppNav as collapsible vertical sidebar with accordion submenus"
```

---

## Task 5: Remove top-navbar remnants & verify

**Files:**
- Verify: `src/components/AppNav.module.css` — confirm no unused `.inner`, `.navLinks`-as-flex-row rules remain
- Verify: `src/components/AppLayout.module.css` — confirm no `flex-direction: column` remains

- [ ] **Step 1: Check app renders correctly**

Start dev server and open the app:
```bash
cd frontend && npm run dev
```

Confirm:
- Sidebar appears on the left, ~220px wide
- Toggle button (☰) at top collapses sidebar to 52px icon-only mode
- Clicking a menu item with submenus opens the accordion (expanded) or floating panel (collapsed)
- Profile button at bottom opens dropdown
- Active route is highlighted with white left-bar indicator
- Page content fills the remaining horizontal space

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: complete collapsible sidebar — layout verified"
```
