import React, { useState } from 'react';
import { consultationService } from '../services/api';
import '../styles/consultationHistory.css';

const ConsultationHistory = ({ consultations: initialConsultations }) => {
  const [consultations, setConsultations] = useState(initialConsultations);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [hoveringRating, setHoveringRating] = useState(0);

  const handleRating = async (consultationId, ratingValue) => {
    try {
      await consultationService.rateConsultation(consultationId, { rating: ratingValue });
      setConsultations(consultations.map(c =>
        c._id === consultationId ? { ...c, rating: ratingValue } : c
      ));
      setSelectedConsultation(null);
    } catch (error) {
      console.error('Error rating consultation:', error);
    }
  };

  if (consultations.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>📋 Consultation History</h2>
        </div>
        <div className="empty-state">
          <p>No consultations yet. Start by describing your symptoms!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-history">
      <div className="card">
        <div className="card-header">
          <h2>📋 Consultation History</h2>
          <span className="count">{consultations.length} consultations</span>
        </div>

        <div className="consultations-list">
          {consultations.map(consultation => (
            <div
              key={consultation._id}
              className="consultation-item"
              onClick={() => setSelectedConsultation(consultation._id === selectedConsultation ? null : consultation._id)}
            >
              <div className="consultation-header">
                <div className="left">
                  <h4>{new Date(consultation.createdAt).toLocaleDateString()}</h4>
                  <span className={`status-badge status-${consultation.status}`}>
                    {consultation.status.toUpperCase()}
                  </span>
                </div>
                <div className="right">
                  {consultation.rating && (
                    <span className="rating">⭐ {consultation.rating}</span>
                  )}
                </div>
              </div>

              {selectedConsultation === consultation._id && (
                <div className="consultation-details">
                  <div className="detail-section">
                    <h5>Symptoms</h5>
                    <div className="symptoms-tags">
                      {consultation.symptoms.map((s, idx) => (
                        <span key={idx} className="tag">
                          {s.symptom} ({s.severity})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>AI Analysis</h5>
                    <div className="risk-level" style={{
                      backgroundColor: getRiskColor(consultation.aiAnalysis.riskLevel)
                    }}>
                      Risk: {consultation.aiAnalysis.riskLevel}
                    </div>

                    <div className="diseases-list">
                      <strong>Potential Conditions:</strong>
                      {consultation.aiAnalysis.potentialDiseases.map((d, idx) => (
                        <div key={idx} className="disease-item">
                          <span>{d.disease}</span>
                          <span className="probability">{d.probability.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="recommendations">
                      <strong>Recommendations:</strong>
                      <ul>
                        {consultation.aiAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {consultation.assignedDoctor && (
                    <div className="detail-section">
                      <h5>Assigned Doctor</h5>
                      <p><strong>{consultation.assignedDoctor.name}</strong></p>
                      <p>{consultation.assignedDoctor.specialization}</p>
                    </div>
                  )}

                  {consultation.doctorNotes && (
                    <div className="detail-section">
                      <h5>Doctor's Notes</h5>
                      <p>{consultation.doctorNotes}</p>
                    </div>
                  )}

                  {consultation.prescription && consultation.prescription.length > 0 && (
                    <div className="detail-section">
                      <h5>Prescription</h5>
                      <div className="prescription-list">
                        {consultation.prescription.map((med, idx) => (
                          <div key={idx} className="medicine-item">
                            <strong>{med.medicine}</strong>
                            <p>Dosage: {med.dosage}</p>
                            <p>Frequency: {med.frequency}</p>
                            <p>Duration: {med.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!consultation.rating && consultation.status === 'completed' && (
                    <div className="rating-section">
                      <h5>Rate This Consultation</h5>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            className={`star ${star <= hoveringRating ? 'hover' : ''} ${star <= consultation.rating ? 'filled' : ''}`}
                            onMouseEnter={() => setHoveringRating(star)}
                            onMouseLeave={() => setHoveringRating(0)}
                            onClick={() => handleRating(consultation._id, star)}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
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

const getRiskColor = (level) => {
  const colors = {
    LOW: '#dcfce7',
    MEDIUM: '#fef3c7',
    HIGH: '#fee2e2',
    CRITICAL: '#fee2e2'
  };
  return colors[level] || '#f3f4f6';
};

export default ConsultationHistory;
