// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import MainLayout from './components/layout/MainLayout.jsx';
import RadarPage from './pages/RadarPage.jsx';
import MatchingPage from './pages/MatchingPage.jsx';
import CockpitPage from './pages/CockpitPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import './styles/global.css';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Default route now navigates to /matching */}
            <Route path="/" element={<Navigate replace to="/matching" />} />
            <Route path="/radar" element={<RadarPage />} />
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="/cockpit" element={<CockpitPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </MainLayout>
      </Router>
    </SettingsProvider>
  );
}

export default App;