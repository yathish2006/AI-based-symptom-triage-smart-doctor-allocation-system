import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { consultationService, patientService } from '../services/api';
import SymptomForm from '../components/SymptomForm';
import ConsultationHistory from '../components/ConsultationHistory';
import '../styles/patientDashboard.css';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('symptoms');
  const [profile, setProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [profileRes, consultationsRes] = await Promise.all([
        patientService.getProfile(),
        consultationService.getPatientConsultations()
      ]);
      setProfile(profileRes.data.patient);
      setConsultations(consultationsRes.data.consultations);
      setError('');
    } catch (err) {
      setError('Failed to load patient data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomSubmit = async (symptoms) => {
    await fetchPatientData();
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="patient-dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <h1>⚕️ MedAI Patient</h1>
          <div className="user-menu">
            <span>{user?.name}</span>
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="sidebar">
          <ul className="nav-list">
            <li>
              <button
                className={`nav-btn ${activeTab === 'symptoms' ? 'active' : ''}`}
                onClick={() => setActiveTab('symptoms')}
              >
                🏥 Symptom Check
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                📋 Consultation History
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 My Profile
              </button>
            </li>
          </ul>
        </div>

        <div className="main-content">
          {error && <div className="alert alert-error">{error}</div>}

          {activeTab === 'symptoms' && (
            <SymptomForm onSubmit={handleSymptomSubmit} />
          )}

          {activeTab === 'history' && (
            <ConsultationHistory consultations={consultations} />
          )}

          {activeTab === 'profile' && profile && (
            <ProfileSection profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileSection = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    gender: profile?.gender || '',
    dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
    allergies: profile?.allergies?.join(', ') || '',
    currentMedications: profile?.currentMedications?.join(', ') || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientService.updateProfile({
        ...formData,
        allergies: formData.allergies.split(',').map(a => a.trim()),
        currentMedications: formData.currentMedications.split(',').map(m => m.trim())
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>My Medical Profile</h2>
        <button
          className="btn btn-secondary"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {!isEditing ? (
        <div className="profile-info">
          <div className="info-row">
            <label>Gender:</label>
            <span>{profile?.gender || 'Not specified'}</span>
          </div>
          <div className="info-row">
            <label>Date of Birth:</label>
            <span>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not specified'}</span>
          </div>
          <div className="info-row">
            <label>Allergies:</label>
            <span>{profile?.allergies?.length ? profile.allergies.join(', ') : 'None'}</span>
          </div>
          <div className="info-row">
            <label>Current Medications:</label>
            <span>{profile?.currentMedications?.length ? profile.currentMedications.join(', ') : 'None'}</span>
          </div>
          {profile?.assignedDoctor && (
            <div className="info-row">
              <label>Assigned Doctor:</label>
              <span>{profile.assignedDoctor.name} ({profile.assignedDoctor.specialization})</span>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Allergies (comma-separated)</label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g., Penicillin, Nuts"
            />
          </div>

          <div className="form-group">
            <label>Current Medications (comma-separated)</label>
            <input
              type="text"
              name="currentMedications"
              value={formData.currentMedications}
              onChange={handleChange}
              placeholder="e.g., Aspirin, Vitamin D"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
};

export default PatientDashboard;
