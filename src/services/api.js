const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let onUnauthorizedCallback = null;
const PATIENT_TOKEN_KEY = 'patient_jwt_token';
const PATIENT_REFRESH_TOKEN_KEY = 'patient_refresh_token';
const PATIENT_PROFILES_KEY = 'patient_profiles';
const SELECTED_PATIENT_KEY = 'selected_patient';

// Get auth token directly from localStorage
function getAuthToken() {
  return localStorage.getItem(PATIENT_TOKEN_KEY);
}

function persistAuthSession(data) {
  if (data?.accessToken) {
    localStorage.setItem(PATIENT_TOKEN_KEY, data.accessToken);
  }
  if (data?.refreshToken) {
    localStorage.setItem(PATIENT_REFRESH_TOKEN_KEY, data.refreshToken);
  }
  if (Array.isArray(data?.patients)) {
    localStorage.setItem(PATIENT_PROFILES_KEY, JSON.stringify(data.patients));
  }
}

function clearPatientSession() {
  localStorage.removeItem(PATIENT_TOKEN_KEY);
  localStorage.removeItem(PATIENT_REFRESH_TOKEN_KEY);
  localStorage.removeItem(PATIENT_PROFILES_KEY);
  localStorage.removeItem(SELECTED_PATIENT_KEY);
}

// Common fetch helper with JWT auth header
async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Unauthorized - clear credentials and notify app
    clearPatientSession();
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.statusText} (${res.status})`);
  }

  if (res.status === 204) return null;

  return await res.json();
}

export const apiService = {
  registerOnUnauthorized: (cb) => {
    onUnauthorizedCallback = cb;
  },

  // Login explicitly with backend
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error('Sai tài khoản hoặc mật khẩu.');
    }

    const data = await res.json();
    persistAuthSession(data);
    return data;
  },

  loginWithGoogle: async (idToken, profile = {}) => {
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
        ...profile,
      }),
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      throw new Error(detail?.message || 'Không thể đăng nhập bằng Google.');
    }

    const data = await res.json();
    persistAuthSession(data);
    return data;
  },

  getStoredPatientProfiles: () => {
    const raw = localStorage.getItem(PATIENT_PROFILES_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  clearPatientSession,

  // Get current user profile (staff/user account)
  getMe: async () => {
    return await apiFetch('/auth/me');
  },

  // Branches
  getBranches: async () => {
    try {
      return await apiFetch('/branches');
    } catch (e) {
      console.warn('API getBranches failed, using fallback mock branches', e);
      return [
        { id: '11111111-1111-1111-1111-111111111111', name: 'DAO CARE - Chi nhánh Quận 1', addressDetail: '120 Lê Lợi, P. Bến Thành, Q.1', province: 'TP. Hồ Chí Minh' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'DAO CARE - Chi nhánh Bình Thạnh', addressDetail: '456 Điện Biên Phủ, P. 22, Q. Bình Thạnh', province: 'TP. Hồ Chí Minh' }
      ];
    }
  },

  // Specialties
  getSpecialties: async () => {
    try {
      return await apiFetch('/specialties');
    } catch (e) {
      console.warn('API getSpecialties failed, using fallback specialties', e);
      return [
        { id: '33333333-3333-3333-3333-333333333333', name: 'Nội tim mạch', code: 'TIMMACH' },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Nha khoa', code: 'RANGHAM' },
        { id: '55555555-5555-5555-5555-555555555555', name: 'Cơ xương khớp', code: 'NGOAI' }
      ];
    }
  },

  // Services
  getServices: async () => {
    try {
      return await apiFetch('/services');
    } catch (e) {
      console.warn('API getServices failed, using fallback services', e);
      return [
        { id: '66666666-6666-6666-6666-666666666666', name: 'Khám Chuyên Gia Tim Mạch', code: 'DV_KN_TIMMACH', listedPrice: 300000 },
        { id: '77777777-7777-7777-7777-777777777777', name: 'Gói Tầm Soát Tim Mạch Cơ Bản', code: 'DV_SA_TIM', listedPrice: 1200000 }
      ];
    }
  },

  // Doctors / Staff
  getDoctors: async (specialtyId = '', branchId = '') => {
    try {
      let url = '/staff?title=DOCTOR';
      if (specialtyId) url += `&specialtyId=${specialtyId}`;
      if (branchId) url += `&branchId=${branchId}`;
      return await apiFetch(url);
    } catch (e) {
      console.warn('API getDoctors failed, using fallback doctors', e);
      return [
        { id: '88888888-8888-8888-8888-888888888888', fullName: 'ThS. BS Lê Hoàng Nam', title: 'DOCTOR' },
        { id: '99999999-9999-9999-9999-999999999999', fullName: 'ThS. BS Nguyễn Thị Mai', title: 'DOCTOR' }
      ];
    }
  },

  // Patients - get a specific patient profile
  getPatientsList: async () => {
    try {
      return await apiFetch('/patients');
    } catch (e) {
      console.warn('API getPatientsList failed, returning mock patients list', e);
      return [
        { id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', fullName: 'Trần Quốc Bảo', patientCode: 'BN-2026-0001', dob: '1988-08-15', gender: 'MALE', phone: '0905123456' },
        { id: 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', fullName: 'Nguyễn Thị Kim Chi', patientCode: 'BN-2026-0002', dob: '1995-10-12', gender: 'FEMALE', phone: '0988223344' }
      ];
    }
  },

  // Search a patient by phone
  getPatientProfile: async (phone = '0905123456') => {
    try {
      const list = await apiFetch(`/patients?search=${phone}`);
      if (list && list.length > 0) {
        return list[0];
      }
      throw new Error('Not found');
    } catch (e) {
      console.warn('API getPatientProfile failed, using mock patient', e);
      return {
        id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
        fullName: 'Trần Quốc Bảo',
        patientCode: 'BN-2026-0001',
        dob: '1988-08-15',
        gender: 'MALE',
        phone: '0905123456',
        email: 'baotq@gmail.com',
        address: '72 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội',
        cccd: '037088998811'
      };
    }
  },

  // Appointments list for a patient
  getAppointments: async (patientId) => {
    try {
      return await apiFetch(`/appointments?patientId=${patientId}`);
    } catch (e) {
      console.warn('API getAppointments failed, returning mock appointment list', e);
      const todayStr = new Date().toISOString().split('T')[0];
      return [
        {
          id: 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
          appointmentCode: 'LH260624-0001',
          patientId: patientId,
          branch: { name: 'Cơ sở Hà Nội - Hai Bà Trưng' },
          doctor: { fullName: 'BS. Trần Hữu Nam' },
          service: { name: 'Khám nội tổng quát' },
          appointmentDate: todayStr,
          startTime: '09:00',
          endTime: '09:30',
          status: 'CONFIRMED',
          notes: 'Khám dạ dày định kỳ'
        }
      ];
    }
  },

  // Create appointment
  createAppointment: async (appointmentDto) => {
    return await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentDto),
    });
  },

  // Create patient
  createPatient: async (patientDto) => {
    return await apiFetch('/patients', {
      method: 'POST',
      body: JSON.stringify(patientDto),
    });
  },

  // Visits / Medical history list
  getVisits: async (patientId) => {
    try {
      return await apiFetch(`/visits?patientId=${patientId}`);
    } catch (e) {
      console.warn('API getVisits failed, returning mock visits list', e);
      return [
        {
          id: 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
          visitCode: 'LK260624-0001',
          patientId: patientId,
          queueNumber: 1,
          status: 'COMPLETED',
          reason: 'Đau dạ dày, chướng bụng',
          bloodPressure: '120/80',
          pulse: 78,
          temperature: 36.6,
          weight: 65.5,
          createdAt: new Date('2026-05-15T10:15:00.000Z')
        }
      ];
    }
  }
};
