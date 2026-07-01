import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FileText, Briefcase,
  ShoppingCart, DollarSign, BookOpen, Receipt,
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
  const [floatMenu, setFloatMenu] = useState<{ key: string; top: number } | null>(null);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      if (!prev) {
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

  useEffect(() => {
    setFloatMenu(null);
    setOpenMenu(null);
  }, [location.pathname]);

  const handleNavItemClick = useCallback(
    (item: NavItem, e: React.MouseEvent<HTMLElement>) => {
      if (!item.sub) return;
      if (collapsed) {
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
      <div className={styles.header}>
        <button
          className={styles.toggleBtn}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={16} />
        </button>

        <Link to="/dashboard" className={styles.logo}>
          <Logo size={28} showText={!collapsed} textColor="#fff" />
        </Link>
      </div>

      <div className={styles.navLinks}>
        {visibleItems.map((item) => {
          const active = isActive(item);
          const itemClasses = [styles.navItem, active ? styles.active : ''].filter(Boolean).join(' ');

          const navElement = item.sub ? (
            <>
              {item.section && (
                <div className={styles.sectionLabel}>{item.section}</div>
              )}
              <button
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
              {item.section && (
                <div className={styles.sectionLabel}>{item.section}</div>
              )}
              <Link to={item.path} className={itemClasses}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </>
          );

          return <React.Fragment key={item.path}>{navElement}</React.Fragment>;
        })}
      </div>

      <div className={styles.sidebarFooter}>
        <button className={styles.iconBtn} aria-label="Notifications">
          <span className={styles.navIcon}><Bell size={17} /></span>
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
