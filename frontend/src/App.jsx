import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import LearnSigns from './pages/LearnSigns';
import { Hand, BookOpen, LayoutDashboard, Shield, Heart } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-group" onClick={() => setCurrentPage('dashboard')}>
            <div className="brand-icon-wrapper">
              <Hand size={24} className="brand-icon" />
            </div>
            <div className="brand-text">
              <h1 className="brand-name">SIGNALINK</h1>
              <span className="brand-motto">Bridging Hands, Connecting Voices</span>
            </div>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-btn ${currentPage === 'dashboard' ? 'nav-btn-active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-btn ${currentPage === 'learn' ? 'nav-btn-active' : ''}`}
              onClick={() => setCurrentPage('learn')}
            >
              <BookOpen size={18} />
              <span>Sign Dictionary</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        {currentPage === 'dashboard' ? (
          <Dashboard onNavigateToLearn={() => setCurrentPage('learn')} />
        ) : (
          <LearnSigns onBackToDashboard={() => setCurrentPage('dashboard')} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <p>
              <strong>SignaLink</strong> &bull; Indian Sign Language Assistive Communication System
            </p>
            <p className="privacy-pill">
              <Shield size={14} /> Client-Side Privacy: Camera frames are processed strictly in-memory.
            </p>
          </div>
          <div className="footer-right">
            <p className="dev-credit">
              Developed with <Heart size={14} className="heart-icon" /> for Accessible AI & Communication
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
