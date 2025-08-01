// src/components/layout/MainLayout.jsx
import React from 'react';
import Sidebar from './Sidebar.jsx';
import styles from './MainLayout.module.css'; // Erstelle diese CSS-Datei

const MainLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;