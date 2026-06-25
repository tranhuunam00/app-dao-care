import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Heart, Phone, MapPin, Clock, QrCode, X, Activity, User, Droplet, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import './Dashboard.css';

export default function Dashboard({ setActiveTab, patient }) {
  const [showTicket, setShowTicket] = useState(false);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [vitals, setVitals] = useState(null);

  useEffect(() => {
    if (!patient?.id) return;

    // 1. Fetch appointments from backend
    apiService.getAppointments(patient.id)
      .then(apps => {
        const now = new Date();
        const upcomingApps = (apps || [])
          .filter(app => {
            if (!['BOOKED', 'CONFIRMED', 'CHECKED_IN'].includes(app.status)) return false;
            try {
              // Parse date and time in local format YYYY-MM-DDTHH:MM:00
              const appDateTime = new Date(`${app.appointmentDate}T${app.startTime}:00`);
              return appDateTime > now;
            } catch (e) {
              return true; // Fallback to showing if parsing fails
            }
          })
          .sort((a, b) => {
            try {
              const dtA = new Date(`${a.appointmentDate}T${a.startTime}:00`);
              const dtB = new Date(`${b.appointmentDate}T${b.startTime}:00`);
              return dtA - dtB;
            } catch (e) {
              return 0;
            }
          });

        if (upcomingApps.length > 0) {
          setUpcomingAppointment(upcomingApps[0]);
        } else {
          setUpcomingAppointment(null);
        }
      })
      .catch(err => console.error('Failed to load appointments from backend:', err));

    // 2. Fetch visits to get latest vitals
    apiService.getVisits(patient.id)
      .then(visits => {
        if (visits && visits.length > 0) {
          // Find the latest visit with any vitals
          const latestVisit = visits[0];
          
          const weight = latestVisit.weight;
          const bloodPressure = latestVisit.bloodPressure;
          const pulse = latestVisit.pulse;
          
          if (weight || bloodPressure || pulse) {
            let bmi = '--';
            if (weight) {
              bmi = (weight / (1.74 * 1.74)).toFixed(1);
            }
            setVitals({
              bloodPressure: bloodPressure || '--',
              pulse: pulse || '--',
              weight: weight || '--',
              bmi: bmi
            });
          } else {
            setVitals(null);
          }
        } else {
          setVitals(null);
        }
      })
      .catch(err => {
        console.error('Failed to load vitals from backend:', err);
        setVitals(null);
      });
  }, [patient]);

  const getBmiStatus = (bmiValue) => {
    const val = parseFloat(bmiValue);
    if (isNaN(val)) return 'Chưa có dữ liệu';
    if (val < 18.5) return 'Thấp';
    if (val <= 24.9) return 'Cân đối';
    return 'Thừa cân';
  };

  const getAge = (dobString) => {
    if (!dobString) return '28';
    try {
      const birth = new Date(dobString);
      const now = new Date();
      return now.getFullYear() - birth.getFullYear();
    } catch (e) {
      return '28';
    }
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="dashboard-pane">
      {/* Patient Profile Banner */}
      <div className="profile-banner">
        <div className="banner-bg-graphic">
          <Activity size={180} />
        </div>
        <div className="banner-content">
          <div className="banner-text">
            <span className="banner-tag">HỒ SƠ BỆNH NHÂN</span>
            <h2 className="banner-title">Xin chào, {patient?.fullName || 'Bệnh nhân'}!</h2>
            <p className="banner-mrn">Mã số hồ sơ (MRN): <span className="font-mono font-bold text-white">{patient?.patientCode || 'Chưa cập nhật'}</span></p>
            <div className="banner-meta">
              <span className="meta-item"><User size={14} /> {patient?.gender === 'MALE' ? 'Nam' : 'Nữ'}, {getAge(patient?.dob)} tuổi</span>
              <span className="meta-item"><Droplet size={14} /> Nhóm máu: O+</span>
            </div>
          </div>
          
          {/* Quick Check-in QR */}
          <div className="qr-checkin-card">
            <div className="qr-box">
              <QrCode size={64} className="qr-icon" />
            </div>
            <div className="qr-text">
              <span className="qr-tag">MÃ CHECK-IN</span>
              <h4 className="qr-title">Tiếp Đón Nhanh</h4>
              <p className="qr-desc">Quét tại quầy lễ tân để check-in tự động</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="quick-nav-grid">
        <button onClick={() => setActiveTab('booking')} className="quick-btn group-card">
          <div className="icon-wrapper green-bg">
            <Calendar size={20} />
          </div>
          <div className="quick-btn-info">
            <h3 className="quick-btn-title">Đặt lịch khám</h3>
            <p className="quick-btn-desc">Đăng ký chỉ với 4 bước</p>
          </div>
        </button>

        <button onClick={() => setActiveTab('records')} className="quick-btn group-card">
          <div className="icon-wrapper blue-bg">
            <FileText size={20} />
          </div>
          <div className="quick-btn-info">
            <h3 className="quick-btn-title">Xem kết quả cũ</h3>
            <p className="quick-btn-desc">Đơn thuốc & xét nghiệm</p>
          </div>
        </button>

        <button onClick={() => setActiveTab('health')} className="quick-btn group-card">
          <div className="icon-wrapper rose-bg">
            <Heart size={20} />
          </div>
          <div className="quick-btn-info">
            <h3 className="quick-btn-title">Sổ tay sức khỏe</h3>
            <p className="quick-btn-desc">Nhịp tim, huyết áp, BMI</p>
          </div>
        </button>

        <a href="tel:19006060" className="quick-btn group-card">
          <div className="icon-wrapper amber-bg">
            <Phone size={20} />
          </div>
          <div className="quick-btn-info">
            <h3 className="quick-btn-title">Hỗ trợ khẩn cấp</h3>
            <p className="quick-btn-desc">Hotline 24/7: 1900 6060</p>
          </div>
        </a>
      </div>

      {/* Upcoming Appointment */}
      {upcomingAppointment ? (
        <div className="card shadow-card appointment-card">
          <div className="card-header flex-between">
            <h3 className="card-title flex-align gap-2">
              <span className="live-dot animate-pulse"></span>
              Lịch hẹn khám sắp tới
            </h3>
            <span className={`status-badge ${upcomingAppointment.status === 'CONFIRMED' || upcomingAppointment.status === 'CHECKED_IN' ? 'green-badge' : 'amber-badge'}`}>
              {upcomingAppointment.status === 'CONFIRMED' ? 'Đã xác nhận' : upcomingAppointment.status === 'CHECKED_IN' ? 'Đã check-in' : 'Chờ xác nhận'}
            </span>
          </div>

          <div className="appointment-body">
            <div className="doctor-profile-row">
              <div className="doctor-avatar">
                {upcomingAppointment.doctor?.fullName ? upcomingAppointment.doctor.fullName.split(' ').pop().substring(0, 2).toUpperCase() : 'BS'}
              </div>
              <div className="doctor-text">
                <h4 className="doctor-name">{upcomingAppointment.doctor?.fullName || 'Bác sĩ phụ trách'}</h4>
                <p className="doctor-spec">Chuyên khoa: {upcomingAppointment.service?.name || 'Nội khoa'}</p>
                <div className="doctor-loc flex-align gap-1">
                  <MapPin size={14} />
                  <span>{upcomingAppointment.branch?.name || 'Chi nhánh DAO CARE Hà Nội'}</span>
                </div>
              </div>
            </div>
            
            <div className="appointment-time-column">
              <p className="time-label">Thời gian hẹn khám</p>
              <div className="time-row flex-align gap-2">
                <Calendar size={16} className="primary-text" />
                <span>{getFormattedDate(upcomingAppointment.appointmentDate)}</span>
              </div>
              <div className="time-row flex-align gap-2">
                <Clock size={16} className="primary-text" />
                <span>{upcomingAppointment.startTime} - {upcomingAppointment.endTime}</span>
              </div>
            </div>
          </div>

          <div className="appointment-actions flex-gap-3">
            <button onClick={() => setShowTicket(true)} className="btn btn-primary flex-center gap-2 flex-1">
              <QrCode size={16} />
              <span>Xem vé điện tử</span>
            </button>
            <button onClick={() => alert('Yêu cầu hủy lịch hẹn đã được gửi. Phòng khám sẽ sớm xác nhận qua điện thoại.')} className="btn btn-muted">
              Hủy lịch
            </button>
          </div>
        </div>
      ) : (
        <div className="card shadow-card appointment-card flex-center py-8 text-center text-slate-400">
          <div>
            <Calendar size={48} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm">Bạn chưa có lịch hẹn khám nào sắp tới.</p>
            <button onClick={() => setActiveTab('booking')} className="btn btn-primary mt-4">Đặt lịch hẹn ngay</button>
          </div>
        </div>
      )}

      {/* Vital Metrics Summary */}
      <div className="card shadow-card vitals-card">
        <div className="card-header flex-between">
          <h3 className="card-title">Chỉ số sức khỏe mới nhất</h3>
          <button onClick={() => setActiveTab('health')} className="link-btn flex-align gap-1">
            Xem chi tiết <ChevronRight size={14} />
          </button>
        </div>
        <div className="vitals-grid">
          <div className="vital-item rose-bg-opacity">
            <span className="vital-label rose-text">Huyết áp</span>
            <div className="vital-value">
              {vitals ? vitals.bloodPressure : '--'}{' '}
              {vitals && vitals.bloodPressure !== '--' && <span className="vital-unit">mmHg</span>}
            </div>
            <span className={`vital-status ${vitals && vitals.bloodPressure !== '--' ? 'green-tag' : 'gray-tag'}`}>
              {vitals && vitals.bloodPressure !== '--' ? 'Bình thường' : 'Chưa có dữ liệu'}
            </span>
          </div>
          <div className="vital-item blue-bg-opacity">
            <span className="vital-label blue-text">Nhịp tim</span>
            <div className="vital-value">
              {vitals ? vitals.pulse : '--'}{' '}
              {vitals && vitals.pulse !== '--' && <span className="vital-unit">bpm</span>}
            </div>
            <span className={`vital-status ${vitals && vitals.pulse !== '--' ? 'green-tag' : 'gray-tag'}`}>
              {vitals && vitals.pulse !== '--' ? 'Khỏe mạnh' : 'Chưa có dữ liệu'}
            </span>
          </div>
          <div className="vital-item amber-bg-opacity">
            <span className="vital-label amber-text">Cân nặng</span>
            <div className="vital-value">
              {vitals ? vitals.weight : '--'}{' '}
              {vitals && vitals.weight !== '--' && <span className="vital-unit">kg</span>}
            </div>
            <span className={`vital-status ${vitals && vitals.weight !== '--' ? 'green-tag' : 'gray-tag'}`}>
              {vitals && vitals.weight !== '--' ? 'Ổn định' : 'Chưa có dữ liệu'}
            </span>
          </div>
          <div className="vital-item green-bg-opacity">
            <span className="vital-label primary-text">Chỉ số BMI</span>
            <div className="vital-value">
              {vitals ? vitals.bmi : '--'}{' '}
              {vitals && vitals.bmi !== '--' && <span className="vital-unit">kg/m²</span>}
            </div>
            <span className={`vital-status ${vitals && vitals.bmi !== '--' ? 'green-tag' : 'gray-tag'}`}>
              {vitals && vitals.bmi !== '--' ? getBmiStatus(vitals.bmi) : 'Chưa có dữ liệu'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= MODAL: TICKET ELECT ================= */}
      {showTicket && upcomingAppointment && (
        <div className="modal-overlay">
          <div className="ticket-modal-content">
            <div className="ticket-header">
              <button onClick={() => setShowTicket(false)} className="close-ticket-btn">
                <X size={20} />
              </button>
              <span className="ticket-header-tag">VÉ ĐIỆN TỬ</span>
              <h3 className="ticket-header-title">Lịch Hẹn Đã Được Xác Nhận</h3>
            </div>
            
            <div className="ticket-body">
              <div className="ticket-qr-section">
                <div className="ticket-qr-wrapper">
                  <QrCode size={120} />
                </div>
                <span className="ticket-id-label">MÃ SỐ CUỘC HẸN</span>
                <span className="ticket-id">{upcomingAppointment.appointmentCode}</span>
              </div>

              <div className="ticket-details-list">
                <div className="ticket-detail-item">
                  <span className="detail-label">Bệnh nhân:</span>
                  <span className="detail-val">{patient?.fullName}</span>
                </div>
                <div className="ticket-detail-item">
                  <span className="detail-label">Bác sĩ:</span>
                  <span className="detail-val">{upcomingAppointment.doctor?.fullName}</span>
                </div>
                <div className="ticket-detail-item">
                  <span className="detail-label">Địa điểm:</span>
                  <span className="detail-val">{upcomingAppointment.branch?.name} ({upcomingAppointment.room?.name || 'P. Khám'})</span>
                </div>
                <div className="ticket-detail-item">
                  <span className="detail-label">Thời gian:</span>
                  <span className="detail-val">{upcomingAppointment.startTime} - {getFormattedDate(upcomingAppointment.appointmentDate)}</span>
                </div>
              </div>
            </div>

            <div className="ticket-footer">
              <button onClick={() => setShowTicket(false)} className="btn btn-dark w-full">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
