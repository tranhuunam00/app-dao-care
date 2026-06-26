import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Booking from './components/Booking';
import Records from './components/Records';
import Health from './components/Health';
import Login from './components/Login';
import PatientSelect from './components/PatientSelect';
import Profile from './components/Profile';
import { apiService } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [token, setToken] = useState(() => localStorage.getItem('patient_jwt_token'));
  const [patient, setPatient] = useState(() => {
    const saved = localStorage.getItem('selected_patient');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Set up unauthorized callback to handle session expiration cleanly
  useEffect(() => {
    apiService.registerOnUnauthorized(() => {
      handleLogout();
    });
  }, []);

  const handleLoginSuccess = (loginResult) => {
    const nextToken = typeof loginResult === 'string' ? loginResult : loginResult?.accessToken;
    if (!nextToken) {
      return;
    }

    localStorage.setItem('patient_jwt_token', nextToken);
    setToken(nextToken);

    const patients = Array.isArray(loginResult?.patients) ? loginResult.patients : [];
    if (patients.length === 1) {
      handlePatientSelect(patients[0]);
    } else if (patients.length > 1) {
      localStorage.setItem('patient_profiles', JSON.stringify(patients));
      setPatient(null);
    }
  };

  const handlePatientSelect = (selectedPatient) => {
    localStorage.setItem('selected_patient', JSON.stringify(selectedPatient));
    setPatient(selectedPatient);
  };

  const handlePatientUpdate = (updatedPatient) => {
    localStorage.setItem('selected_patient', JSON.stringify(updatedPatient));
    setPatient(updatedPatient);

    const profilesRaw = localStorage.getItem('patient_profiles');
    if (profilesRaw) {
      try {
        const profiles = JSON.parse(profilesRaw);
        if (Array.isArray(profiles)) {
          const updatedProfiles = profiles.map(p => p.id === updatedPatient.id ? updatedPatient : p);
          localStorage.setItem('patient_profiles', JSON.stringify(updatedProfiles));
        }
      } catch (e) {
        console.warn('Failed to update patient profiles list in storage:', e);
      }
    }
  };

  const handleLogout = () => {
    apiService.clearPatientSession();
    setToken(null);
    setPatient(null);
    setActiveTab('dashboard');
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (!patient) {
    return <PatientSelect onPatientSelect={handlePatientSelect} onLogout={handleLogout} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} patient={patient} onLogout={handleLogout}>
      {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} patient={patient} />}
      {activeTab === 'booking' && <Booking setActiveTab={setActiveTab} patient={patient} />}
      {activeTab === 'records' && <Records patient={patient} />}
      {activeTab === 'health' && <Health patient={patient} />}
      {activeTab === 'profile' && <Profile patient={patient} onPatientUpdate={handlePatientUpdate} />}
    </Layout>
  );
}

export default App;
