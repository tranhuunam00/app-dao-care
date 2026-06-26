import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Check, Info, User } from 'lucide-react';
import { apiService } from '../services/api';
import './Booking.css';

export default function Booking({ setActiveTab, patient }) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Data fetched from backend
  const [branchesList, setBranchesList] = useState([]);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  
  // User selections (stores UUIDs)
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [time, setTime] = useState('08:30');
  const [symptoms, setSymptoms] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial metadata from backend
  useEffect(() => {
    // 1. Fetch branches
    apiService.getBranches()
      .then(data => {
        setBranchesList(data);
        if (data.length > 0) setSelectedBranchId(data[0].id);
      })
      .catch(err => console.error(err));

    // 2. Fetch specialties
    apiService.getSpecialties()
      .then(data => {
        setSpecialtiesList(data);
        if (data.length > 0) setSelectedSpecialtyId(data[0].id);
      })
      .catch(err => console.error(err));

    // 3. Fetch services
    apiService.getServices()
      .then(data => {
        setServicesList(data);
        if (data.length > 0) setSelectedServiceId(data[0].id);
      })
      .catch(err => console.error(err));

    // 4. Generate next 7 days starting from today
    const weekdays = ['C.Nhật', 'T.Hai', 'T.Ba', 'T.Tư', 'T.Năm', 'T.Sáu', 'T.Bảy'];
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const dayVal = d.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${dayVal}`;
      
      dates.push({
        value: dateStr,
        dayName: weekdays[d.getDay()],
        dayNum: d.getDate(),
        monthName: `Th ${month}`
      });
    }
    
    setAvailableDates(dates);
    if (dates.length > 0) {
      setDate(dates[0].value);
    }
  }, []);

  // Fetch doctors dynamically filtered by selected branch & specialty
  useEffect(() => {
    if (!selectedBranchId || !selectedSpecialtyId) return;

    apiService.getDoctors(selectedSpecialtyId, selectedBranchId)
      .then(data => {
        setDoctorsList(data);
        if (data.length > 0) {
          setSelectedDoctorId(data[0].id);
        } else {
          setSelectedDoctorId('any');
        }
      })
      .catch(err => {
        console.error('Failed to load filtered doctors:', err);
        setDoctorsList([]);
        setSelectedDoctorId('any');
      });
  }, [selectedBranchId, selectedSpecialtyId]);

  // Filter services by selected specialty if applicable
  const filteredServices = servicesList.filter(srv => 
    !selectedSpecialtyId || !srv.specialtyId || srv.specialtyId === selectedSpecialtyId
  );

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 4: Submit to backend
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!patient?.id || !selectedBranchId) {
      alert('Lỗi: Thiếu thông tin bệnh nhân hoặc chi nhánh.');
      return;
    }

    setIsSubmitting(true);

    // Calculate end time (e.g. start + 30 mins)
    let endHour = parseInt(time.split(':')[0]);
    let endMin = parseInt(time.split(':')[1]) + 30;
    if (endMin >= 60) {
      endHour += 1;
      endMin -= 60;
    }
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    const appointmentDto = {
      patientId: patient.id,
      branchId: selectedBranchId,
      doctorId: (selectedDoctorId && selectedDoctorId !== 'any') ? selectedDoctorId : undefined,
      serviceId: selectedServiceId || undefined,
      appointmentDate: date,
      startTime: time,
      endTime: endTime,
      notes: symptoms || undefined
    };

    try {
      await apiService.createAppointment(appointmentDto);
      alert('Đăng ký lịch hẹn khám thành công! Lịch khám của bạn đang được phòng khám phê duyệt.');
      setActiveTab('dashboard');
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi gửi lịch hẹn lên hệ thống. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepClass = (stepNum) => {
    if (stepNum < currentStep) return 'step-badge completed';
    if (stepNum === currentStep) return 'step-badge active';
    return 'step-badge';
  };

  const getLabelClass = (stepNum) => {
    if (stepNum < currentStep) return 'step-label completed';
    if (stepNum === currentStep) return 'step-label active';
    return 'step-label';
  };

  const getFormattedDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('vi-VN', options);
  };

  // Helper selectors to get names from IDs
  const getSelectedBranchName = () => {
    const b = branchesList.find(x => x.id === selectedBranchId);
    return b ? b.name : 'Chi nhánh đã chọn';
  };

  const getSelectedBranch = () => {
    return branchesList.find(x => x.id === selectedBranchId);
  };

  const getSelectedServiceName = () => {
    const s = servicesList.find(x => x.id === selectedServiceId);
    const sp = specialtiesList.find(x => x.id === selectedSpecialtyId);
    return `${sp ? sp.name : 'Nội khoa'} - ${s ? s.name : 'Khám tổng quát'}`;
  };

  const getSelectedDoctorName = () => {
    if (selectedDoctorId === 'any') return 'Bác sĩ bất kỳ (Sắp xếp tự động)';
    const d = doctorsList.find(x => x.id === selectedDoctorId);
    return d ? d.fullName : 'Bác sĩ đã chọn';
  };

  return (
    <div className="booking-pane card shadow-card">
      <div className="booking-header">
        <h2 className="booking-title">Đặt Lịch Hẹn Khám</h2>
        <p className="booking-subtitle">Đăng ký lịch trực tuyến nhanh chóng, tiết kiệm thời gian chờ tiếp đón</p>
      </div>

      {/* Stepper Steps Navigation */}
      <div className="booking-stepper">
        <div className="step-indicator">
          <span className={getStepClass(1)}>
            {currentStep > 1 ? <Check size={14} /> : '1'}
          </span>
          <span className={getLabelClass(1)}>Cơ sở</span>
        </div>
        <div className={`step-line ${currentStep > 1 ? 'completed' : ''}`}></div>
        
        <div className="step-indicator">
          <span className={getStepClass(2)}>
            {currentStep > 2 ? <Check size={14} /> : '2'}
          </span>
          <span className={getLabelClass(2)}>Dịch vụ</span>
        </div>
        <div className={`step-line ${currentStep > 2 ? 'completed' : ''}`}></div>

        <div className="step-indicator">
          <span className={getStepClass(3)}>
            {currentStep > 3 ? <Check size={14} /> : '3'}
          </span>
          <span className={getLabelClass(3)}>Bác sĩ & Giờ</span>
        </div>
        <div className={`step-line ${currentStep > 3 ? 'completed' : ''}`}></div>

        <div className="step-indicator">
          <span className={getStepClass(4)}>
            {currentStep > 4 ? <Check size={14} /> : '4'}
          </span>
          <span className={getLabelClass(4)}>Xác nhận</span>
        </div>
      </div>

      {/* ================= STEP 1: BRANCH ================= */}
      {currentStep === 1 && (
        <div className="step-content active step-layout">
          <h3 className="step-heading">Bước 1: Lựa chọn chi nhánh phòng khám</h3>
          <div className="options-column">
            {branchesList.map(b => (
              <label key={b.id} className={`option-card ${selectedBranchId === b.id ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="branch" 
                  value={b.id}
                  checked={selectedBranchId === b.id}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="hidden-input"
                />
                <div className="option-details">
                  <span className="option-title">{b.name}</span>
                  <p className="option-desc">
                    {b.googleMapUrl ? (
                      <a 
                        href={b.googleMapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="map-link"
                        onClick={(e) => e.stopPropagation()} 
                        style={{ color: '#10b981', textDecoration: 'underline', fontWeight: '500' }}
                      >
                        {b.addressDetail ? `${b.addressDetail}, ${b.province || ''}` : 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội'}
                      </a>
                    ) : (
                      b.addressDetail ? `${b.addressDetail}, ${b.province || ''}` : 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội'
                    )}
                  </p>
                  <span className="badge badge-green flex-align gap-1"><MapPin size={10} /> Chi nhánh chính - Có bãi đỗ xe</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 2: SPECIALTY & SERVICE ================= */}
      {currentStep === 2 && (
        <div className="step-content active step-layout">
          <h3 className="step-heading">Bước 2: Lựa chọn chuyên khoa & gói dịch vụ</h3>
          
          <div className="step-sub-section">
            <p className="section-label">1. Chọn Chuyên Khoa</p>
            <div className="grid-2-col">
              {specialtiesList.map((spec) => (
                <label key={spec.id} className={`selector-badge ${selectedSpecialtyId === spec.id ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="specialty" 
                    value={spec.id}
                    checked={selectedSpecialtyId === spec.id}
                    onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                    className="hidden-input"
                  />
                  <span>{spec.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="step-sub-section">
            <p className="section-label">2. Chọn Gói Dịch Vụ</p>
            <div className="options-column">
              {filteredServices.length > 0 ? (
                filteredServices.map(srv => (
                  <label key={srv.id} className={`option-card flex-between align-center ${selectedServiceId === srv.id ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="service" 
                      value={srv.id}
                      checked={selectedServiceId === srv.id}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="hidden-input"
                    />
                    <div className="option-details text-left">
                      <span className="option-title">{srv.name}</span>
                      <p className="option-desc">Mã: {srv.code} • Thời gian thực hiện: {srv.durationMinutes || 20} phút</p>
                    </div>
                    <span className="price-tag">{srv.listedPrice ? `${srv.listedPrice.toLocaleString('vi-VN')}đ` : '200.000đ'}</span>
                  </label>
                ))
              ) : (
                <p className="text-slate-400 text-xs text-center py-4">Chuyên khoa chưa cấu hình dịch vụ khám. Vui lòng chọn chuyên khoa khác.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: DOCTOR & DATE/TIME ================= */}
      {currentStep === 3 && (
        <div className="step-content active step-layout">
          <h3 className="step-heading">Bước 3: Chọn Bác sĩ, Ngày khám & Khung giờ</h3>
          
          <div className="step-sub-section">
            <p className="section-label">1. Chọn Bác Sĩ Thực Hiện</p>
            <div className="options-column">
              {doctorsList.map(doc => (
                <label key={doc.id} className={`option-card flex-align gap-3 ${selectedDoctorId === doc.id ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="doctor" 
                    value={doc.id}
                    checked={selectedDoctorId === doc.id}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="hidden-input"
                  />
                  <div className="avatar-holder">
                    {doc.fullName.split(' ').pop().substring(0, 2).toUpperCase()}
                  </div>
                  <div className="option-details text-left">
                    <span className="option-title">{doc.fullName}</span>
                    <p className="option-desc">Chứng chỉ: {doc.practicingCertificate?.certificateNumber || 'Đầy đủ chứng chỉ hành nghề bộ Y tế'}</p>
                  </div>
                </label>
              ))}

              <label className={`option-card flex-align gap-3 ${selectedDoctorId === 'any' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="doctor" 
                  value="any"
                  checked={selectedDoctorId === 'any'}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="hidden-input"
                />
                <div className="avatar-holder green-avatar"><User size={18} /></div>
                <div className="option-details text-left">
                  <span className="option-title">Bác sĩ bất kỳ (Sắp xếp tự động)</span>
                  <p className="option-desc">Hệ thống phân công Bác sĩ phù hợp nhất theo khung giờ của bạn</p>
                </div>
              </label>
            </div>
          </div>

          <div className="step-sub-section">
            <p className="section-label">2. Chọn Ngày Khám</p>
            <div className="date-scroll-nav no-scrollbar">
              {availableDates.map((d) => (
                <label key={d.value} className={`date-item ${date === d.value ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="date" 
                    value={d.value}
                    checked={date === d.value}
                    onChange={(e) => setDate(e.target.value)}
                    className="hidden-input"
                  />
                  <span className="day-name">{d.dayName}</span>
                  <span className="day-num">{d.dayNum}</span>
                  <span className="month-name">{d.monthName}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="step-sub-section">
            <p className="section-label">3. Chọn Giờ Khám</p>
            <div className="time-slots-grid">
              {['08:30', '09:00', '09:30', '14:00', '14:30'].map((slotTime) => (
                <label key={slotTime} className={`time-slot ${time === slotTime ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="time" 
                    value={slotTime}
                    checked={time === slotTime}
                    onChange={(e) => setTime(e.target.value)}
                    className="hidden-input"
                  />
                  <span className="time-text">{slotTime}</span>
                  <span className="slot-status">Còn chỗ</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 4: REVIEW & CONFIRM ================= */}
      {currentStep === 4 && (
        <div className="step-content active step-layout">
          <h3 className="step-heading text-center">Bước 4: Xác nhận thông tin lịch khám</h3>
          
          <div className="summary-box">
            <h4 className="summary-box-title">Tóm Tắt Phiếu Khám</h4>
            <div className="summary-list">
              <div className="summary-row">
                <span className="row-label">Bệnh nhân:</span>
                <span className="row-value">{patient?.fullName} ({patient?.phone})</span>
              </div>
              <div className="summary-row">
                <span className="row-label">Cơ sở y tế:</span>
                <span className="row-value">
                  {getSelectedBranch()?.googleMapUrl ? (
                    <a 
                      href={getSelectedBranch().googleMapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: '#10b981', textDecoration: 'underline', fontWeight: '500' }}
                    >
                      {getSelectedBranchName()}
                    </a>
                  ) : (
                    getSelectedBranchName()
                  )}
                </span>
              </div>
              <div className="summary-row">
                <span className="row-label">Chuyên khoa & Dịch vụ:</span>
                <span className="row-value">{getSelectedServiceName()}</span>
              </div>
              <div className="summary-row">
                <span className="row-label">Bác sĩ khám:</span>
                <span className="row-value">{getSelectedDoctorName()}</span>
              </div>
              <div className="summary-row">
                <span className="row-label">Thời gian khám:</span>
                <span className="row-value highlight-value">{time} - {getFormattedDate(date)}</span>
              </div>
            </div>
            
            <div className="summary-symptoms">
              <label className="symptoms-label">Triệu chứng lâm sàng / Lý do đi khám</label>
              <textarea 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="symptoms-input"
                rows="3" 
                placeholder="Ví dụ: Đau mỏi khớp vai, nhức đầu thường xuyên vào buổi sáng..."
              />
            </div>
          </div>

          <div className="info-alert flex-align gap-2">
            <Info size={16} className="info-icon" />
            <p className="info-text">
              Bạn có thể dễ dàng quản lý, thay đổi thời gian hoặc hủy lịch hẹn mà không mất phí tại Trang chủ trước ca khám tối thiểu 2 tiếng.
            </p>
          </div>
        </div>
      )}

      {/* Stepper Navigation Buttons */}
      <div className="stepper-actions flex-gap-3">
        {currentStep > 1 && (
          <button onClick={prevStep} className="btn btn-muted flex-1" disabled={isSubmitting}>
            Quay lại
          </button>
        )}
        <button 
          onClick={nextStep} 
          className={`btn btn-primary flex-1 ${currentStep === 4 ? 'confirm-btn' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang gửi...' : currentStep === 4 ? 'Xác nhận đặt lịch' : 'Tiếp tục'}
        </button>
      </div>
    </div>
  );
}
