import React, { useState, useEffect } from 'react';
import { PlusCircle, BellRing, Pill, Check } from 'lucide-react';
import { apiService } from '../services/api';
import './Health.css';

export default function Health({ patient }) {
  const [selectedMetric, setSelectedMetric] = useState('huyết áp');
  const [visitsData, setVisitsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [meds, setMeds] = useState([
    { id: 1, name: 'Lipitor 20mg', purpose: 'Thuốc điều trị mỡ máu', dose: '1 viên - Uống sau ăn tối', taken: false },
    { id: 2, name: 'Concor 5mg', purpose: 'Thuốc điều hòa huyết áp', dose: '1/2 viên - Uống lúc 08:00 sáng', taken: true }
  ]);

  const [metricsInfo, setMetricsInfo] = useState({
    'huyết áp': { value: '120/80', unit: 'mmHg', date: 'Mặc định', status: 'Bình thường' },
    'nhịp tim': { value: '72', unit: 'bpm', date: 'Mặc định', status: 'Khỏe mạnh' },
    'cân nặng': { value: '68', unit: 'kg', date: 'Mặc định', status: 'Bình thường' },
    'đường huyết': { value: '5.6', unit: 'mmol/L', date: '3 ngày trước', status: 'Bình thường' }
  });

  useEffect(() => {
    if (!patient?.id) return;

    apiService.getVisits(patient.id)
      .then(visits => {
        setVisitsData(visits);
        if (visits && visits.length > 0) {
          const latest = visits[0];
          
          let weightVal = latest.weight || '68';
          let bmiStatus = 'BMI: Cân đối';
          if (latest.weight) {
            const bmi = (latest.weight / (1.74 * 1.74)).toFixed(1);
            bmiStatus = `BMI: ${bmi} - Cân đối`;
          }

          setMetricsInfo({
            'huyết áp': { 
              value: latest.bloodPressure || '120/80', 
              unit: 'mmHg', 
              date: new Date(latest.createdAt).toLocaleDateString('vi-VN'), 
              status: 'Bình thường' 
            },
            'nhịp tim': { 
              value: latest.pulse?.toString() || '72', 
              unit: 'bpm', 
              date: new Date(latest.createdAt).toLocaleDateString('vi-VN'), 
              status: 'Khỏe mạnh' 
            },
            'cân nặng': { 
              value: weightVal.toString(), 
              unit: 'kg', 
              date: new Date(latest.createdAt).toLocaleDateString('vi-VN'), 
              status: bmiStatus 
            },
            'đường huyết': { 
              value: '5.6', 
              unit: 'mmol/L', 
              date: '3 ngày trước', 
              status: 'Bình thường' 
            }
          });
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [patient]);

  const toggleMedTaken = (id) => {
    setMeds(meds.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  // Helper to parse systolic/diastolic blood pressure strings
  const getBpCoordinates = () => {
    if (visitsData.length === 0) {
      // Fallback default coordinates
      return {
        systolicPoints: [[60, 60], [130, 55], [200, 62], [270, 58], [340, 50], [410, 52], [470, 60]],
        diastolicPoints: [[60, 100], [130, 96], [200, 102], [270, 98], [340, 90], [410, 94], [470, 100]],
        dates: ['19/06', '20/06', '21/06', '22/06', '23/06', '24/06', 'Hôm nay']
      };
    }

    // Take up to 7 visits (in reverse order to show cronological left-to-right)
    const recentVisits = [...visitsData].slice(0, 7).reverse();
    const dates = [];
    const systolicPoints = [];
    const diastolicPoints = [];

    const startX = 60;
    const gapX = 68; // (470-60)/6

    recentVisits.forEach((v, index) => {
      const dateLabel = new Date(v.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
      dates.push(dateLabel);

      const bp = v.bloodPressure || '120/80';
      const sys = parseInt(bp.split('/')[0]) || 120;
      const dia = parseInt(bp.split('/')[1]) || 80;

      // Map BP values to SVG Y coordinate (height 150)
      // Y = 130 - (Value - 60) * (110 / 80)
      const sysY = 130 - (sys - 60) * 1.375;
      const diaY = 130 - (dia - 60) * 1.375;

      const x = startX + index * gapX;
      systolicPoints.push([x, sysY]);
      diastolicPoints.push([x, diaY]);
    });

    return { systolicPoints, diastolicPoints, dates };
  };

  const { systolicPoints, diastolicPoints, dates } = getBpCoordinates();

  const makePathD = (points) => {
    if (points.length === 0) return '';
    return `M ${points[0][0]} ${points[0][1]} ` + points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ');
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-400 text-sm">Đang tải sổ tay sức khỏe...</div>;
  }

  return (
    <div className="health-pane">
      <div className="health-header">
        <h2 className="health-title">Sổ Tay Sức Khỏe</h2>
        <p className="health-subtitle">Theo dõi sát sao các chỉ số sinh tồn và thiết lập lịch uống thuốc hàng ngày</p>
      </div>

      {/* Metrics Quick Selector Grid */}
      <div className="metrics-grid">
        {Object.entries(metricsInfo).map(([key, info]) => (
          <button 
            key={key}
            onClick={() => setSelectedMetric(key)}
            className={`metric-select-btn ${selectedMetric === key ? 'selected' : ''}`}
          >
            {selectedMetric === key && <span className="selected-dot-indicator">Xem</span>}
            <span className="m-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <div className="m-value">{info.value} <span className="m-unit">{info.unit}</span></div>
            <span className="m-date">Cập nhật: {info.date}</span>
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="card shadow-card chart-card">
        <div className="chart-card-header flex-between">
          <div>
            <h3 className="card-title text-capitalize">Biểu đồ xu hướng {selectedMetric}</h3>
            <p className="chart-desc-text">Dữ liệu theo dõi kết nối trực tiếp từ lịch sử lượt khám</p>
          </div>
          <select className="chart-time-select">
            <option>7 ngày gần nhất</option>
            <option>30 ngày gần nhất</option>
          </select>
        </div>

        {/* SVG Chart Render */}
        <div className="svg-chart-container">
          <svg className="chart-svg" viewBox="0 0 500 150">
            {/* Grid helper lines */}
            <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />
            <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1.5" />
            <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1.5" />
            <line x1="40" y1="130" x2="480" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
            
            {/* Y-Axis scale label */}
            <text x="15" y="24" className="axis-scale-text">140</text>
            <text x="15" y="64" className="axis-scale-text">120</text>
            <text x="15" y="104" className="axis-scale-text">90</text>
            <text x="15" y="134" className="axis-scale-text">60</text>
            
            {/* Conditional paths based on metric */}
            {selectedMetric === 'huyết áp' ? (
              <>
                {/* Systolic (Red) */}
                <path d={makePathD(systolicPoints)} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                {/* Diastolic (Blue) */}
                <path d={makePathD(diastolicPoints)} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
                
                {/* Systolic points */}
                {systolicPoints.map((p, idx) => (
                  <circle key={idx} cx={p[0]} cy={p[1]} r="4.5" fill="#f43f5e" stroke="white" strokeWidth="1.5" />
                ))}
                
                {/* Diastolic points */}
                {diastolicPoints.map((p, idx) => (
                  <circle key={idx} cx={p[0]} cy={p[1]} r="4.5" fill="#0284c7" stroke="white" strokeWidth="1.5" />
                ))}
              </>
            ) : (
              <>
                {/* General Metric Line (Green) mapped dynamically using systolic points as scale base */}
                <path d={makePathD(systolicPoints.map(p => [p[0], p[1] + 10]))} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                {systolicPoints.map((p, idx) => (
                  <circle key={idx} cx={p[0]} cy={p[1] + 10} r="4.5" fill="#059669" stroke="white" strokeWidth="1.5" />
                ))}
              </>
            )}

            {/* X-Axis dates */}
            {dates.map((d, idx) => {
              const x = 60 + idx * 68;
              return <text key={idx} x={x} y="146" className="axis-date-text">{d}</text>;
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="chart-legend flex-center gap-6">
          {selectedMetric === 'huyết áp' ? (
            <>
              <span className="legend-item flex-align gap-2 text-rose"><span className="legend-dot rose-dot"></span> Huyết áp tâm thu</span>
              <span className="legend-item flex-align gap-2 text-blue"><span className="legend-dot blue-dot"></span> Huyết áp tâm trương</span>
            </>
          ) : (
            <span className="legend-item flex-align gap-2 text-green"><span className="legend-dot green-dot"></span> Chỉ số theo đợt khám</span>
          )}
        </div>
      </div>

      {/* Quick Add Log Entry */}
      <button onClick={() => alert('Chức năng nhập chỉ số sức khỏe trực tuyến sẽ sớm kết nối với máy đo cá nhân.')} className="btn btn-primary add-log-btn flex-center gap-2">
        <PlusCircle size={18} />
        <span>Ghi chép chỉ số sức khỏe hôm nay</span>
      </button>

      {/* Medication reminders */}
      <div className="card shadow-card meds-reminders-card">
        <h3 className="card-title flex-align gap-2">
          <BellRing size={20} className="primary-text" />
          Lịch uống thuốc hôm nay
        </h3>
        <div className="meds-list-wrapper">
          {meds.map(med => (
            <div key={med.id} className="med-reminder-row flex-between">
              <div className="med-row-left flex-align gap-3">
                <div className="med-pill-box">
                  <Pill size={16} />
                </div>
                <div>
                  <h4 className="med-reminder-name">{med.name}</h4>
                  <p className="med-reminder-purpose">{med.purpose} • {med.dose}</p>
                </div>
              </div>
              
              <button 
                onClick={() => toggleMedTaken(med.id)}
                className={`med-action-btn ${med.taken ? 'taken' : 'untaken'}`}
              >
                {med.taken ? (
                  <>
                    <Check size={14} />
                    <span>Đã uống</span>
                  </>
                ) : (
                  'Chưa uống'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
