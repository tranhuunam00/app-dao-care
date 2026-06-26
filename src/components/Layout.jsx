import React from 'react';
import { Activity, Home, Calendar, FileText, Heart, Bell, LogOut, User } from 'lucide-react';
import './Layout.css';

export default function Layout({ activeTab, setActiveTab, patient, onLogout, children }) {
  return (
    <div className="layout-shell">
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="brand-title">DAO CARE</h1>
            <p className="brand-subtitle">Sức khỏe là tài sản</p>
          </div>
        </div>

        <div className="patient-quick-card clickable" onClick={() => setActiveTab('profile')}>
          <div className="patient-avatar-badge">
            {patient?.fullName ? patient.fullName.split(' ').pop().substring(0, 2).toUpperCase() : 'BN'}
          </div>
          <div className="patient-meta">
            <h4 className="patient-name">{patient?.fullName || 'Bệnh nhân'}</h4>
            <span className="patient-mrn-badge">{patient?.patientCode || 'MRN-7890'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Home size={20} />
            <span>Trang chủ</span>
          </button>
          <button 
            onClick={() => setActiveTab('booking')} 
            className={`nav-btn ${activeTab === 'booking' ? 'active' : ''}`}
          >
            <Calendar size={20} />
            <span>Đặt lịch khám</span>
          </button>
          <button 
            onClick={() => setActiveTab('records')} 
            className={`nav-btn ${activeTab === 'records' ? 'active' : ''}`}
          >
            <FileText size={20} />
            <span>Kết quả khám cũ</span>
          </button>
          <button 
            onClick={() => setActiveTab('health')} 
            className={`nav-btn ${activeTab === 'health' ? 'active' : ''}`}
          >
            <Heart size={20} />
            <span>Sổ tay sức khỏe</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={20} />
            <span>Hồ sơ của tôi</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ================= HEADER (MOBILE) ================= */}
      <header className="mobile-header">
        <div className="brand-mini">
          <div className="brand-logo-mini">
            <Activity size={20} />
          </div>
          <span className="brand-title-mini">DAO CARE</span>
        </div>
        <div className="header-actions">
          <button className="notification-trigger" aria-label="Thông báo">
            <Bell size={18} />
            <span className="notification-dot"></span>
          </button>
          <button className="notification-trigger" onClick={onLogout} aria-label="Đăng xuất" style={{ color: 'var(--color-rose)' }}>
            <LogOut size={18} />
          </button>
          <div className="patient-avatar-mini clickable" onClick={() => setActiveTab('profile')}>
            {patient?.fullName ? patient.fullName.split(' ').pop().substring(0, 2).toUpperCase() : 'BN'}
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="main-content">
        <div className="tab-wrapper">
          {children}
        </div>
      </main>

      {/* ================= BOTTOM NAVIGATION (MOBILE) ================= */}
      <nav className="mobile-bottom-nav">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`bottom-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <Home size={22} />
          <span>Trang chủ</span>
        </button>
        <button 
          onClick={() => setActiveTab('booking')} 
          className={`bottom-nav-btn ${activeTab === 'booking' ? 'active' : ''}`}
        >
          <Calendar size={22} />
          <span>Đặt lịch</span>
        </button>
        <button 
          onClick={() => setActiveTab('records')} 
          className={`bottom-nav-btn ${activeTab === 'records' ? 'active' : ''}`}
        >
          <FileText size={22} />
          <span>Kết quả</span>
        </button>
        <button 
          onClick={() => setActiveTab('health')} 
          className={`bottom-nav-btn ${activeTab === 'health' ? 'active' : ''}`}
        >
          <Heart size={22} />
          <span>Sổ tay</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`bottom-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={22} />
          <span>Cá nhân</span>
        </button>
      </nav>
    </div>
  );
}
