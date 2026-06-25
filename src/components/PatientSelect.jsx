import React, { useState, useEffect } from 'react';
import { User, Search, LogOut, ArrowRight, Activity, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import './PatientSelect.css';

export default function PatientSelect({ onPatientSelect, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Register unauthorized listener to handle session expiration cleanly
    apiService.registerOnUnauthorized(() => {
      onLogout();
    });

    const storedProfiles = apiService.getStoredPatientProfiles();
    if (storedProfiles.length > 0) {
      setPatients(storedProfiles);
      setLoading(false);
      return;
    }

    apiService.getPatientsList()
      .then(data => {
        setPatients(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch patients:', err);
        setError('Không thể tải danh sách bệnh nhân từ backend.');
        setLoading(false);
      });
  }, [onLogout]);

  const filteredPatients = patients.filter(p => {
    const nameMatch = p.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = p.phone?.includes(searchQuery);
    const codeMatch = p.patientCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || phoneMatch || codeMatch;
  });

  const getAge = (dobString) => {
    if (!dobString) return '';
    try {
      const birth = new Date(dobString);
      const now = new Date();
      return now.getFullYear() - birth.getFullYear();
    } catch (e) {
      return '';
    }
  };

  const getFormattedDob = (dobString) => {
    if (!dobString) return '';
    try {
      const d = new Date(dobString);
      return d.toLocaleDateString('vi-VN');
    } catch (e) {
      return dobString;
    }
  };

  return (
    <div className="patient-select-container">
      <div className="patient-select-card shadow-card">
        <div className="patient-select-header">
          <div className="select-logo">
            <Activity size={28} />
          </div>
          <h2 className="select-title">CHỌN BỆNH NHÂN TRẢI NGHIỆM</h2>
          <p className="select-subtitle">
            Hệ thống kết nối thành công. Vui lòng chọn một hồ sơ bệnh nhân từ backend để tiếp tục:
          </p>
        </div>

        {/* Search Input */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên, Số điện thoại hoặc Mã số..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Patients List */}
        <div className="patients-list-wrapper">
          {loading ? (
            <div className="select-loading">Đang tải danh sách hồ sơ...</div>
          ) : filteredPatients.length > 0 ? (
            <div className="patients-grid">
              {filteredPatients.map(p => (
                <div key={p.id} className="patient-card-item" onClick={() => onPatientSelect(p)}>
                  <div className="patient-card-avatar">
                    <User size={20} />
                  </div>
                  <div className="patient-card-details">
                    <h4 className="patient-card-name">{p.fullName}</h4>
                    <div className="patient-card-meta">
                      <span className="patient-code-badge">{p.patientCode}</span>
                      <span className="patient-meta-text">
                        {p.gender === 'MALE' ? 'Nam' : 'Nữ'} • {getAge(p.dob)} tuổi
                      </span>
                    </div>
                    <div className="patient-card-contact">
                      <span>SĐT: {p.phone || 'Chưa cập nhật'}</span>
                      {p.dob && <span className="dob-text">NS: {getFormattedDob(p.dob)}</span>}
                    </div>
                  </div>
                  <div className="patient-card-action">
                    <ArrowRight size={18} className="action-arrow" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-patients text-center">
              Không tìm thấy bệnh nhân nào khớp với từ khóa "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="patient-select-footer">
          <button onClick={onLogout} className="select-logout-btn btn btn-muted">
            <LogOut size={16} />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
}
