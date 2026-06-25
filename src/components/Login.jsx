import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowRight, Phone, ShieldAlert } from 'lucide-react';
import { apiService } from '../services/api';
import './Login.css';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '506643667310-r9u7425ui324en7kh17sskspj5e55kte.apps.googleusercontent.com';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('admin@hisdaocare.com');
  const [password, setPassword] = useState('Admin@HIS2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('1995-01-01');
  const [gender, setGender] = useState('MALE');
  const [regEmail, setRegEmail] = useState('');

  useEffect(() => {
    let cancelled = false;

    const handleGoogleCredential = async (response) => {
      if (!response?.credential) {
        setError('Google không trả về mã xác thực. Vui lòng thử lại.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await apiService.loginWithGoogle(response.credential);
        if (data?.accessToken) {
          onLoginSuccess(data);
        } else {
          setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
        }
      } catch (err) {
        setError(err.message || 'Không thể đăng nhập bằng Google.');
      } finally {
        setLoading(false);
      }
    };

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'left',
        width: Math.min(356, googleButtonRef.current.clientWidth || 356),
      });
      setGoogleReady(true);
    };

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton);
      renderGoogleButton();
      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', renderGoogleButton);
      };
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      if (!cancelled) {
        setGoogleReady(false);
        setError('Không tải được Google Sign-In. Kiểm tra mạng hoặc cấu hình OAuth.');
      }
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiService.login(email, password);
      if (data?.accessToken) {
        onLoginSuccess(data);
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !dob || !gender) {
      setError('Vui lòng nhập đầy đủ họ tên, số điện thoại, ngày sinh và giới tính.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiService.login(email, password);
      if (data?.accessToken) {
        const newPatient = await apiService.createPatient({
          fullName,
          dob,
          gender,
          phone,
          email: regEmail || undefined,
          address: 'Hà Nội',
        });

        localStorage.setItem('selected_patient', JSON.stringify(newPatient));
        onLoginSuccess(data);
      } else {
        setError('Đăng ký thất bại. Không thể cấu hình phiên làm việc.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi đăng ký bệnh nhân.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card shadow-card">
        <div className="login-header">
          <div className="login-logo">
            <Activity size={32} />
          </div>
          <h1 className="login-title">DAO CARE</h1>
          <p className="login-subtitle">Cổng Thông Tin Bệnh Nhân</p>
        </div>

        {error && (
          <div className="error-banner flex-align gap-2">
            <ShieldAlert size={18} className="rose-text" />
            <span>{error}</span>
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-divider first-divider">
              <span>Đăng nhập bệnh nhân</span>
            </div>

            <div className="google-button-shell">
              <div ref={googleButtonRef} className="google-button-host" aria-hidden={!googleReady} />
              {!googleReady && (
                <button type="button" className="btn btn-google google-loading-button w-full" disabled>
                  Đang tải Google...
                </button>
              )}
            </div>

            <div className="login-divider">
              <span>Tài khoản hệ thống</span>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email tài khoản</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhanvien@hisdaocare.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="test-credential-badge">
              <span className="badge-tag">DEV</span>
              <p className="badge-desc">Chỉ dùng cho tài khoản nội bộ khi cần kiểm thử dữ liệu hệ thống.</p>
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn w-full" disabled={loading}>
              {loading ? (
                <span className="spinner">Đang xác thực...</span>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="toggle-auth-view">
              <span>Chưa có hồ sơ? </span>
              <button type="button" className="toggle-link-btn" onClick={() => setIsRegistering(true)} disabled={loading}>
                Đăng ký hồ sơ ngay
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên bệnh nhân *</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại liên hệ *</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                disabled={loading}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="dob">Ngày sinh *</label>
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính *</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regEmail">Email liên hệ</label>
              <input
                type="email"
                id="regEmail"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="email@example.com"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn w-full" disabled={loading}>
              {loading ? (
                <span className="spinner">Đang tạo hồ sơ...</span>
              ) : (
                <>
                  <span>Đăng Ký Hồ Sơ</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="toggle-auth-view">
              <span>Đã có tài khoản? </span>
              <button type="button" className="toggle-link-btn" onClick={() => setIsRegistering(false)} disabled={loading}>
                Quay lại đăng nhập
              </button>
            </div>
          </form>
        )}

        <div className="login-footer">
          <p className="support-hotline">
            <Phone size={14} />
            Hỗ trợ kỹ thuật: <strong>1900 6060</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
