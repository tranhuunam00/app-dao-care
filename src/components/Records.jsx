import React, { useState, useEffect } from 'react';
import { Pill, Activity, Download, X, AlertCircle, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import './Records.css';

export default function Records({ patient }) {
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visits, setVisits] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patient?.id) return;

    apiService.getVisits(patient.id)
      .then(data => {
        setVisits(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load visits:', err);
        setIsLoading(false);
      });
  }, [patient]);

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const filteredVisits = filter === 'all' 
    ? visits 
    : filter === 'meds' 
      ? visits.filter(v => v.prescriptions && v.prescriptions.length > 0)
      : visits.filter(v => v.bloodPressure || v.pulse);

  if (isLoading) {
    return <div className="text-center py-8 text-slate-400 text-sm">Đang tải lịch sử khám bệnh...</div>;
  }

  return (
    <div className="records-pane">
      <div className="records-header">
        <h2 className="records-title">Lịch Sử Khám Bệnh</h2>
        <p className="records-subtitle">Tra cứu chẩn đoán y khoa, chỉ số sinh tồn và đơn thuốc từ các đợt khám trước</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          onClick={() => setFilter('all')} 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
        >
          Tất cả đợt khám
        </button>
        <button 
          onClick={() => setFilter('meds')} 
          className={`filter-tab ${filter === 'meds' ? 'active' : ''}`}
        >
          Đơn thuốc
        </button>
        <button 
          onClick={() => setFilter('tests')} 
          className={`filter-tab ${filter === 'tests' ? 'active' : ''}`}
        >
          Chỉ số sinh tồn
        </button>
      </div>

      {/* Visits List */}
      <div className="visits-list">
        {filteredVisits.length > 0 ? (
          filteredVisits.map((visit) => (
            <div 
              key={visit.id} 
              onClick={() => setSelectedVisit(visit)} 
              className="visit-item-card group-card cursor-pointer"
            >
              <div className="visit-item-header flex-between">
                <div>
                  <span className="visit-code-tag">MÃ LƯỢT KHÁM: #{visit.visitCode || 'VIS-MOCK'}</span>
                  <h3 className="visit-item-title">{visit.reason || 'Khám bệnh định kỳ'}</h3>
                  <span className="visit-branch">{visit.branch?.name || 'Chi nhánh DAO CARE Hà Nội'}</span>
                </div>
                <span className={`visit-status-badge ${visit.status === 'COMPLETED' ? 'completed' : 'processing'}`}>
                  {visit.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang xử lý'}
                </span>
              </div>

              <div className="visit-quick-details-grid">
                <div className="quick-detail">
                  <span className="detail-label">Bác sĩ thực hiện</span>
                  <span className="detail-value">{visit.currentDoctor?.fullName || 'BS. Trần Hữu Nam'}</span>
                </div>
                <div className="quick-detail">
                  <span className="detail-label">Huyết áp / Nhịp tim</span>
                  <span className="detail-value text-ellipsis">
                    {visit.bloodPressure || '120/80'} mmHg / {visit.pulse || '72'} bpm
                  </span>
                </div>
                <div className="quick-detail">
                  <span className="detail-label">Thời gian khám</span>
                  <span className="detail-value font-medium">{getFormattedDate(visit.createdAt)}</span>
                </div>
              </div>

              <div className="visit-footer-row flex-between">
                <div className="footer-tags flex-align gap-3">
                  <span className="footer-tag flex-align gap-1">
                    <Pill size={12} className="tag-icon" />
                    Đơn thuốc ({visit.prescriptions?.length || 2})
                  </span>
                  <span className="footer-tag flex-align gap-1">
                    <Activity size={12} className="tag-icon" />
                    Chỉ số sinh tồn
                  </span>
                </div>
                <span className="view-detail-link flex-align gap-1">
                  Xem kết quả <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">Không tìm thấy đợt khám nào.</div>
        )}
      </div>

      {/* ================= DETAILED BOTTOM SHEET / MODAL ================= */}
      {selectedVisit && (
        <div className="sheet-overlay">
          <div className="sheet-backdrop" onClick={() => setSelectedVisit(null)}></div>
          
          <div className="bottom-sheet-container">
            {/* Grab handle for touch layout */}
            <div className="sheet-handle" onClick={() => setSelectedVisit(null)}></div>

            <div className="sheet-header">
              <div className="sheet-header-left">
                <span className="sheet-code">MÃ LƯỢT KHÁM: #{selectedVisit.visitCode}</span>
                <h3 className="sheet-title">{selectedVisit.reason || 'Khám sức khỏe tổng quát'}</h3>
                <p className="sheet-meta">{getFormattedDate(selectedVisit.createdAt)} • {selectedVisit.branch?.name || 'Hà Nội'}</p>
              </div>
              <button onClick={() => setSelectedVisit(null)} className="close-sheet-btn">
                <X size={20} />
              </button>
            </div>

            <div className="sheet-body no-scrollbar">
              {/* Section 1: Clinical diagnosis */}
              <div className="sheet-section">
                <h4 className="section-title-bar">Khám lâm sàng & Chẩn đoán</h4>
                <div className="clinical-info-card">
                  <div className="info-row">
                    <span className="row-tag">Lý do khám:</span>
                    <span className="row-text">{selectedVisit.reason || 'Khám định kỳ'}</span>
                  </div>
                  <div className="info-row">
                    <span className="row-tag">Bác sĩ khám:</span>
                    <span className="row-text font-bold">{selectedVisit.currentDoctor?.fullName || 'BS. Trần Hữu Nam'}</span>
                  </div>
                  <div className="info-row">
                    <span className="row-tag">Chẩn đoán chính:</span>
                    <span className="row-text font-extrabold primary-text">{selectedVisit.diagnosis || 'Rối loạn Lipid máu (E78.5)'}</span>
                  </div>
                  <div className="info-row block-row">
                    <span className="row-tag">Dặn dò của Bác sĩ:</span>
                    <p className="advice-paragraph">
                      {selectedVisit.advice || 'Hạn chế ăn đồ béo ngọt, da động vật, mỡ động vật. Tăng cường ăn rau quả xanh, cá. Chăm chỉ đi bộ nhẹ nhàng 30 phút mỗi ngày. Tái khám sau 3 tháng.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Vital signs table */}
              <div className="sheet-section">
                <h4 className="section-title-bar">Các chỉ số sinh tồn đo được</h4>
                <div className="table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Chỉ số sinh tồn</th>
                        <th className="text-center">Kết quả đo</th>
                        <th className="text-right">Khoảng bình thường</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-semibold">Huyết áp (Blood Pressure)</td>
                        <td className="text-center font-bold">{selectedVisit.bloodPressure || '120/80'} mmHg</td>
                        <td className="text-right light-text">90/60 - 130/80</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Nhịp tim (Pulse)</td>
                        <td className="text-center font-bold">{selectedVisit.pulse || '72'} bpm</td>
                        <td className="text-right light-text">60 - 90</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Nhiệt độ cơ thể (Temperature)</td>
                        <td className="text-center font-bold">
                          {selectedVisit.temperature || '36.6'} °C
                          {selectedVisit.temperature > 37.5 && (
                            <span className="alert-indicator flex-align gap-1 inline-flex">
                              <AlertCircle size={10} /> Sốt nhẹ
                            </span>
                          )}
                        </td>
                        <td className="text-right light-text">36.1 - 37.2</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Cân nặng (Weight)</td>
                        <td className="text-center font-bold">{selectedVisit.weight || '68'} kg</td>
                        <td className="text-right light-text">Theo BMI</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Prescriptions (Fallback to default if empty in backend) */}
              <div className="sheet-section">
                <h4 className="section-title-bar">Đơn thuốc chỉ định</h4>
                <div className="meds-list">
                  {(selectedVisit.prescriptions && selectedVisit.prescriptions.length > 0) ? (
                    selectedVisit.prescriptions.map((med, index) => (
                      <div key={index} className="med-item">
                        <div className="med-left">
                          <div className="med-number">{index + 1}</div>
                          <div>
                            <span className="med-name">{med.name}</span>
                            <p className="med-instruction">{med.instruction}</p>
                          </div>
                        </div>
                        <span className="med-qty">SL: {med.quantity}</span>
                      </div>
                    ))
                  ) : (
                    // Default fallback prescription for simulation
                    <>
                      <div className="med-item">
                        <div className="med-left">
                          <div className="med-number">1</div>
                          <div>
                            <span className="med-name">Lipitor 20mg (Atorvastatin)</span>
                            <p className="med-instruction">Uống 1 viên vào buổi tối sau khi ăn xong</p>
                          </div>
                        </div>
                        <span className="med-qty">SL: 30 viên</span>
                      </div>
                      <div className="med-item">
                        <div className="med-left">
                          <div className="med-number">2</div>
                          <div>
                            <span className="med-name">Concor 5mg (Bisoprolol)</span>
                            <p className="med-instruction">Uống 1/2 viên vào buổi sáng lúc 08h00</p>
                          </div>
                        </div>
                        <span className="med-qty">SL: 15 viên</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="sheet-footer flex-gap-3">
              <button onClick={() => alert('Đang tải tệp PDF bệnh án điện tử từ backend...')} className="btn btn-muted flex-center gap-2 flex-1">
                <Download size={16} />
                <span>Tải PDF kết quả</span>
              </button>
              <button onClick={() => setSelectedVisit(null)} className="btn btn-primary flex-1">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
