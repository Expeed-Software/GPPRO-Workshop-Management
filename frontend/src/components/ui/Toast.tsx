import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertCircle size={18} />,
  info: <AlertCircle size={18} />,
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={[styles.toast, styles[type], !visible ? styles.exit : '']
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      <button
        className={styles.close}
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// Toast container component
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => (
  <div className={styles.container} aria-live="polite">
    {toasts.map((t) => (
      <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
    ))}
  </div>
);
