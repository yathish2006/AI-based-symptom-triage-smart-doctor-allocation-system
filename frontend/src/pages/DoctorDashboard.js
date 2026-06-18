import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorService, consultationService } from '../services/api';
import '../styles/doctorDashboard.css';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescription, setPrescription] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [profileRes, patientsRes, consultationsRes] = await Promise.all([
        doctorService.getDoctorProfile(),
        doctorService.getDoctorPatients(),
        consultationService.getDoctorConsultations()
      ]);
      setProfile(profileRes.data.doctor);
      setPatients(patientsRes.data.patients);
      setConsultations(consultationsRes.data.consultations);
      setError('');
    } catch (err) {
      setError('Failed to load doctor data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConsultation = async (consultationId) => {
    try {
      await consultationService.updateStatus(consultationId, {
        status: 'completed',
        doctorNotes
      });

      if (prescription.length > 0) {
        await consultationService.addPrescription(consultationId, { prescription });
      }

      setSelectedConsultation(null);
      setDoctorNotes('');
      setPrescription([]);
      await fetchDoctorData();
    } catch (error) {
      setError('Failed to update consultation');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="doctor-dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <h1>⚕️ MedAI Doctor</h1>
          <div className="user-menu">
            <span>Dr. {user?.name}</span>
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
                className={`nav-btn ${activeTab === 'patients' ? 'active' : ''}`}
                onClick={() => setActiveTab('patients')}
              >
                👥 My Patients
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeTab === 'consultations' ? 'active' : ''}`}
                onClick={() => setActiveTab('consultations')}
              >
                📋 Consultations
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

          {activeTab === 'patients' && (
            <PatientsSection patients={patients} />
          )}

          {activeTab === 'consultations' && (
            <ConsultationsSection
              consultations={consultations}
              selectedConsultation={selectedConsultation}
              setSelectedConsultation={setSelectedConsultation}
              doctorNotes={doctorNotes}
              setDoctorNotes={setDoctorNotes}
              prescription={prescription}
              setPrescription={setPrescription}
              onUpdate={handleUpdateConsultation}
            />
          )}

          {activeTab === 'profile' && profile && (
            <DoctorProfileSection profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
};

const PatientsSection = ({ patients }) => {
  if (patients.length === 0) {
    return (
      <div className="card">
        <h2>👥 My Patients</h2>
        <p>No patients assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>👥 My Patients ({patients.length})</h2>
      </div>

      <div className="patients-list">
        {patients.map(patient => (
          <div key={patient._id} className="patient-card">
            <div className="patient-info">
              <h4>{patient.name}</h4>
              <p>Email: {patient.email}</p>
              <p>Phone: {patient.phone}</p>
              <p className="last-visit">Last Consultation: {new Date(patient.lastConsultation).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConsultationsSection = ({
  consultations,
  selectedConsultation,
  setSelectedConsultation,
  doctorNotes,
  setDoctorNotes,
  prescription,
  setPrescription,
  onUpdate
}) => {
  const [newMedicine, setNewMedicine] = useState({ medicine: '', dosage: '', frequency: '', duration: '' });

  const addMedicine = () => {
    if (newMedicine.medicine && newMedicine.dosage && newMedicine.frequency && newMedicine.duration) {
      setPrescription([...prescription, newMedicine]);
      setNewMedicine({ medicine: '', dosage: '', frequency: '', duration: '' });
    }
  };

  const removeMedicine = (index) => {
    setPrescription(prescription.filter((_, i) => i !== index));
  };

  const urgentCount = consultations.filter(c => c.status === 'urgent').length;
  const pendingCount = consultations.filter(c => c.status === 'pending').length;

  return (
    <div className="consultations-section">
      <div className="stats-row">
        <div className="stat-card urgent">
          <p className="stat-label">Urgent Cases</p>
          <p className="stat-value">{urgentCount}</p>
        </div>
        <div className="stat-card pending">
          <p className="stat-label">Pending Cases</p>
          <p className="stat-value">{pendingCount}</p>
        </div>
        <div className="stat-card total">
          <p className="stat-label">Total Consultations</p>
          <p className="stat-value">{consultations.length}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📋 Patient Consultations</h2>
        </div>

        <div className="consultations-list">
          {consultations.map(consultation => (
            <div
              key={consultation._id}
              className={`consultation-item ${consultation.status === 'urgent' ? 'urgent-item' : ''}`}
            >
              <div className="cons-header" onClick={() => setSelectedConsultation(selectedConsultation === consultation._id ? null : consultation._id)}>
                <div className="left">
                  <h4>{consultation.patientId?.name}</h4>
                  <p>{consultation.patientId?.phone}</p>
                  <span className={`status-badge status-${consultation.status}`}>
                    {consultation.status.toUpperCase()}
                  </span>
                </div>
                <div className="right">
                  <span className="date">{new Date(consultation.createdAt).toLocaleDateString()}</span>
                  <span className={`risk-level risk-${consultation.aiAnalysis.riskLevel.toLowerCase()}`}>
                    {consultation.aiAnalysis.riskLevel}
                  </span>
                </div>
              </div>

              {selectedConsultation === consultation._id && (
                <div className="cons-details">
                  <div className="details-row">
                    <div className="detail-col">
                      <h5>Patient Symptoms</h5>
                      <div className="symptoms-tags">
                        {consultation.symptoms.map((s, idx) => (
                          <span key={idx} className="tag">{s.symptom}</span>
                        ))}
                      </div>
                    </div>

                    <div className="detail-col">
                      <h5>AI Analysis</h5>
                      <div className="diseases">
                        {consultation.aiAnalysis.potentialDiseases.map((d, idx) => (
                          <div key={idx} className="disease">{d.disease}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {consultation.status !== 'completed' && (
                    <div className="doctor-action">
                      <h5>Add Treatment Notes & Prescription</h5>

                      <div className="form-group">
                        <label>Doctor's Notes</label>
                        <textarea
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Enter your clinical notes..."
                          rows="4"
                        />
                      </div>

                      <div className="prescription-section">
                        <h6>Prescription</h6>

                        {prescription.length > 0 && (
                          <div className="medicines-list">
                            {prescription.map((med, idx) => (
                              <div key={idx} className="medicine">
                                <div>
                                  <strong>{med.medicine}</strong>
                                  <p>{med.dosage} - {med.frequency} for {med.duration}</p>
                                </div>
                                <button
                                  type="button"
                                  className="btn-remove"
                                  onClick={() => removeMedicine(idx)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="medicine-form">
                          <div className="input-group">
                            <input
                              type="text"
                              placeholder="Medicine name"
                              value={newMedicine.medicine}
                              onChange={(e) => setNewMedicine({ ...newMedicine, medicine: e.target.value })}
                            />
                            <input
                              type="text"
                              placeholder="Dosage"
                              value={newMedicine.dosage}
                              onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                            />
                            <input
                              type="text"
                              placeholder="Frequency"
                              value={newMedicine.frequency}
                              onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                            />
                            <input
                              type="text"
                              placeholder="Duration"
                              value={newMedicine.duration}
                              onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                            />
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={addMedicine}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary btn-complete"
                        onClick={() => onUpdate(consultation._id)}
                      >
                        Complete Consultation
                      </button>
                    </div>
                  )}

                  {consultation.status === 'completed' && (
                    <div className="completed-section">
                      <p><strong>Status:</strong> Consultation Completed</p>
                      {consultation.doctorNotes && (
                        <div>
                          <strong>Doctor Notes:</strong>
                          <p>{consultation.doctorNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DoctorProfileSection = ({ profile }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2>👤 Doctor Profile</h2>
      </div>

      <div className="profile-grid">
        <div className="profile-item">
          <label>License Number</label>
          <p>{profile.license}</p>
        </div>
        <div className="profile-item">
          <label>Specialization</label>
          <p>{profile.specialization}</p>
        </div>
        <div className="profile-item">
          <label>Experience</label>
          <p>{profile.experience} years</p>
        </div>
        <div className="profile-item">
          <label>Consultation Fee</label>
          <p>₹{profile.consultationFee}</p>
        </div>
        <div className="profile-item">
          <label>Rating</label>
          <p>⭐ {profile.rating} / 5</p>
        </div>
        <div className="profile-item">
          <label>Total Consultations</label>
          <p>{profile.totalConsultations}</p>
        </div>
      </div>

      {profile.bio && (
        <div>
          <h3>About</h3>
          <p>{profile.bio}</p>
        </div>
      )}

      {profile.qualifications && profile.qualifications.length > 0 && (
        <div>
          <h3>Qualifications</h3>
          <ul>
            {profile.qualifications.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
