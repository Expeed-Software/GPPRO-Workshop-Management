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
