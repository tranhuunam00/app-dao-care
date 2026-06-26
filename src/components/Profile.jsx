import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, Phone, MapPin, CreditCard, Save, RefreshCw, AlertCircle, Users, Check } from 'lucide-react';
import { apiService } from '../services/api';
import './Profile.css';

export default function Profile({ patient, onPatientUpdate }) {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cccd, setCccd] = useState('');
  const [address, setAddress] = useState('');
  
  // Guardian Info
  const [showGuardian, setShowGuardian] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initialize values when component loads or patient changes
  useEffect(() => {
    if (patient) {
      setFullName(patient.fullName || '');
      setDob(patient.dob || '');
      setGender(patient.gender || 'MALE');
      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      setCccd(patient.cccd || '');
      setAddress(patient.address || '');
      
      const hasGuardian = !!(patient.guardianName || patient.guardianPhone || patient.guardianRelation);
      setShowGuardian(hasGuardian);
      setGuardianName(patient.guardianName || '');
      setGuardianPhone(patient.guardianPhone || '');
      setGuardianRelation(patient.guardianRelation || '');
    }
  }, [patient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !dob || !phone.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Ngày sinh, Số điện thoại).');
      setSuccessMsg('');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      fullName: fullName.toUpperCase(), // Standardize name in UPPERCASE
      dob,
      gender,
      phone: phone.trim(),
      email: email.trim() || null,
      cccd: cccd.trim() || null,
      address: address.trim() || null,
      guardianName: showGuardian ? (guardianName.trim() || null) : null,
      guardianPhone: showGuardian ? (guardianPhone.trim() || null) : null,
      guardianRelation: showGuardian ? (guardianRelation.trim() || null) : null,
    };

    try {
      const updatedPatient = await apiService.updatePatient(patient.id, payload);
      setSuccessMsg('Hồ sơ bệnh nhân của bạn đã được cập nhật thành công!');
      setErrorMsg('');
      
      // Notify parent app to update state/session
      if (onPatientUpdate) {
        onPatientUpdate(updatedPatient);
      }
    } catch (err) {
      console.error('Failed to update patient profile:', err);
      setErrorMsg(err.message || 'Lỗi khi cập nhật hồ sơ bệnh nhân. Vui lòng thử lại.');
      setSuccessMsg('');
    } finally {
      setLoading(false);
    }
  };

  const isGoogleIncomplete = patient?.phone?.startsWith('GOOGLE-') || patient?.dob === '1900-01-01';
  const isProfileComplete = !isGoogleIncomplete && !!patient?.fullName;

  return (
    <div className="profile-container">
      <div className="profile-header-section">
        <div>
          <h2 className="profile-title">Hồ Sơ Của Tôi</h2>
          <p className="profile-subtitle">Xem và cập nhật thông tin cá nhân của bạn</p>
        </div>
      </div>

      <div className="profile-card">
        {successMsg && (
          <div className="profile-alert profile-alert-success mb-4">
            <ShieldCheck size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="profile-alert profile-alert-error mb-4">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {isProfileComplete && (
          <div className="profile-info-notice mb-4">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-primary)' }} />
            <span>Thông tin hành chính (Họ tên, Ngày sinh, Giới tính) đã được xác minh. Để điều chỉnh các thông tin này, vui lòng liên hệ trực tiếp quầy Lễ tân phòng khám.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form-grid">
          
          {/* Full Name */}
          <div className="profile-form-group">
            <label className="profile-label" htmlFor="fullName">Họ và tên bệnh nhân *</label>
            <div className="relative">
              <input
                type="text"
                id="fullName"
                className="profile-input"
                style={{ textTransform: 'uppercase' }}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="NGUYỄN VĂN A"
                required
                disabled={loading || isProfileComplete}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="profile-form-group">
            <label className="profile-label" htmlFor="phone">Số điện thoại liên hệ *</label>
            <input
              type="tel"
              id="phone"
              className="profile-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              required
              disabled={loading}
            />
            {phone.startsWith('GOOGLE-') && (
              <span className="profile-badge-note">
                SĐT hiện tại là mã Google liên kết. Hãy cập nhật lại SĐT thật của bạn.
              </span>
            )}
          </div>

          {/* DOB */}
          <div className="profile-form-group">
            <label className="profile-label" htmlFor="dob">Ngày sinh *</label>
            <input
              type="date"
              id="dob"
              className="profile-input"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              disabled={loading || isProfileComplete}
            />
            {dob === '1900-01-01' && (
              <span className="profile-badge-note">
                Vui lòng cập nhật lại ngày sinh chính xác của bạn thay vì ngày mặc định.
              </span>
            )}
          </div>

          {/* Gender */}
          <div className="profile-form-group">
            <label className="profile-label" htmlFor="gender">Giới tính *</label>
            <select
              id="gender"
              className="profile-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading || isProfileComplete}
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* CCCD */}
          <div className="profile-form-group">
            <label className="profile-label" htmlFor="cccd">Số CCCD / Hộ chiếu</label>
            <input
              type="text"
              id="cccd"
              className="profile-input"
              value={cccd}
              onChange={(e) => setCccd(e.target.value)}
              placeholder="Căn cước công dân 12 số"
              disabled={loading || (isProfileComplete && !!patient?.cccd)}
            />
            {isProfileComplete && !!patient?.cccd && (
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Số CCCD đã xác thực, không thể tự chỉnh sửa.
              </span>
            )}
          </div>

          {/* Email */}
          <div className="profile-form-group">
            <label className="profile-label" htmlFor="email">Địa chỉ email</label>
            <input
              type="email"
              id="email"
              className="profile-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              disabled={loading}
            />
          </div>

          {/* Address */}
          <div className="profile-form-group full-width-col">
            <label className="profile-label" htmlFor="address">Địa chỉ thường trú</label>
            <input
              type="text"
              id="address"
              className="profile-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              disabled={loading}
            />
          </div>

          {/* Toggle Guardian Card */}
          <div 
            className="guardian-toggle-card"
            onClick={() => !loading && setShowGuardian(!showGuardian)}
          >
            <div className={`guardian-checkbox ${showGuardian ? 'checked' : ''}`}>
              {showGuardian && <Check size={14} />}
            </div>
            <div>
              <span className="profile-label">Tôi muốn đăng ký thông tin người giám hộ</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Cần thiết đối với trẻ em dưới 15 tuổi hoặc bệnh nhân cần người bảo hộ.
              </p>
            </div>
          </div>

          {/* Guardian details */}
          {showGuardian && (
            <>
              <div className="profile-section-divider">
                <span className="divider-title">Người Giám Hộ</span>
                <span className="divider-line"></span>
              </div>

              {/* Guardian Name */}
              <div className="profile-form-group">
                <label className="profile-label" htmlFor="guardianName">Họ tên người giám hộ</label>
                <input
                  type="text"
                  id="guardianName"
                  className="profile-input"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="NGUYỄN VĂN B"
                  disabled={loading}
                />
              </div>

              {/* Guardian Phone */}
              <div className="profile-form-group">
                <label className="profile-label" htmlFor="guardianPhone">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  id="guardianPhone"
                  className="profile-input"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="0987654321"
                  disabled={loading}
                />
              </div>

              {/* Guardian Relation */}
              <div className="profile-form-group full-width-col">
                <label className="profile-label" htmlFor="guardianRelation">Quan hệ với bệnh nhân</label>
                <input
                  type="text"
                  id="guardianRelation"
                  className="profile-input"
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  placeholder="Ví dụ: Bố, Mẹ, Anh trai, Người bảo hộ..."
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Action Footer */}
          <div className="profile-footer full-width-col">
            <button
              type="submit"
              className="profile-btn-save"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
