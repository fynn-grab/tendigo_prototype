// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Target, Settings, LogOut, Radar } from 'lucide-react';
import styles from './Sidebar.module.css';
import logoUrl from '../../assets/logo.png';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div>
        <Link to="/matching" className={styles.logo}>
          <img src={logoUrl} alt="Firmenlogo" />
        </Link>
        <p className={styles.tagline}>
          Ihr Radar für Ausschreibungen.
        </p>

        {/* Links reordered */}
        <nav className={styles.nav}>
          <NavLink to="/matching" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <LayoutDashboard size={20} />
            <span>Matching</span>
          </NavLink>
          <NavLink to="/radar" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <Radar size={20} />
            <span>Radar</span>
          </NavLink>
          <NavLink to="/cockpit" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <Target size={20} />
            <span>Angebots-Cockpit</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
            <Settings size={20} />
            <span>Einstellungen</span>
          </NavLink>
        </nav>
      </div>
      <div className={styles.userProfile}>
        <button className={styles.navLink} disabled title="Funktion noch nicht integriert">
          <LogOut size={20} />
          <span>Abmelden</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;