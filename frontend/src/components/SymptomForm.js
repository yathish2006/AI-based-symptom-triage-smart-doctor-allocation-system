import React, { useState } from 'react';
import { consultationService } from '../services/api';
import '../styles/symptomForm.css';

const SymptomForm = ({ onSubmit }) => {
  const [symptoms, setSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState({ symptom: '', severity: 'mild', duration: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const commonSymptoms = [
    'Fever',
    'Cough',
    'Headache',
    'Body ache',
    'Sore throat',
    'Difficulty breathing',
    'Chest pain',
    'Diarrhea',
    'Nausea',
    'Fatigue'
  ];

  const addSymptom = (symptom) => {
    if (symptom.trim() && !symptoms.find(s => s.symptom.toLowerCase() === symptom.toLowerCase())) {
      setSymptoms([...symptoms, { symptom, severity: 'mild', duration: '1-2 days' }]);
      setNewSymptom({ symptom: '', severity: 'mild', duration: '' });
      setError('');
    }
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const updateSymptom = (index, field, value) => {
    const updated = [...symptoms];
    updated[index][field] = value;
    setSymptoms(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await consultationService.createConsultation({ symptoms });
      setResult(response.data);
      onSubmit(symptoms);
      setSymptoms([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="symptom-container">
      <div className="card">
        <div className="card-header">
          <h2>🏥 Describe Your Symptoms</h2>
          <p>Our AI will analyze your symptoms and recommend appropriate care</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Quick Select Common Symptoms</h3>
            <div className="symptom-buttons">
              {commonSymptoms.map(symptom => (
                <button
                  key={symptom}
                  type="button"
                  className="symptom-btn"
                  onClick={() => addSymptom(symptom)}
                  disabled={symptoms.find(s => s.symptom.toLowerCase() === symptom.toLowerCase())}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Add Custom Symptom</h3>
            <div className="form-row">
              <div className="form-group flex-1">
                <input
                  type="text"
                  value={newSymptom.symptom}
                  onChange={(e) => setNewSymptom({ ...newSymptom, symptom: e.target.value })}
                  placeholder="Enter a symptom..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSymptom(newSymptom.symptom);
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => addSymptom(newSymptom.symptom)}
              >
                Add
              </button>
            </div>
          </div>

          {symptoms.length > 0 && (
            <div className="selected-symptoms">
              <h3>Selected Symptoms ({symptoms.length})</h3>
              <div className="symptoms-list">
                {symptoms.map((symptom, index) => (
                  <div key={index} className="symptom-card">
                    <div className="symptom-header">
                      <span className="symptom-name">{symptom.symptom}</span>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => removeSymptom(index)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="symptom-details">
                      <div className="form-group">
                        <label>Severity:</label>
                        <select
                          value={symptom.severity}
                          onChange={(e) => updateSymptom(index, 'severity', e.target.value)}
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Duration:</label>
                        <input
                          type="text"
                          value={symptom.duration}
                          onChange={(e) => updateSymptom(index, 'duration', e.target.value)}
                          placeholder="e.g., 2-3 days"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading || symptoms.length === 0}
          >
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </form>
      </div>

      {result && (
        <div className="result-container">
          <SymptomResult result={result} />
        </div>
      )}
    </div>
  );
};

const SymptomResult = ({ result }) => {
  const { consultation, message } = result;
  const { aiAnalysis } = consultation;

  const riskLevelColor = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444',
    CRITICAL: '#991b1b'
  };

  return (
    <div className="card result-card">
      <div className="card-header">
        <h2>🤖 AI Analysis Result</h2>
      </div>

      {aiAnalysis.isEmergency && (
        <div className="alert alert-error">
          <strong>⚠️ EMERGENCY ALERT:</strong> {message}
        </div>
      )}

      <div className="analysis-grid">
        <div className="analysis-section">
          <h3>Risk Level</h3>
          <div
            className="risk-badge"
            style={{ backgroundColor: riskLevelColor[aiAnalysis.riskLevel] }}
          >
            {aiAnalysis.riskLevel}
          </div>
        </div>

        <div className="analysis-section">
          <h3>Potential Conditions</h3>
          <div className="diseases-list">
            {aiAnalysis.potentialDiseases.map((disease, index) => (
              <div key={index} className="disease-item">
                <span className="disease-name">{disease.disease}</span>
                <div className="probability-bar">
                  <div
                    className="probability-fill"
                    style={{ width: `${disease.probability}%` }}
                  ></div>
                </div>
                <span className="probability-text">{disease.probability.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-section">
          <h3>Recommendations</h3>
          <ul className="recommendations-list">
            {aiAnalysis.recommendations.map((rec, index) => (
              <li key={index}>
                <span className="bullet">✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {!aiAnalysis.isEmergency && (
          <div className="analysis-section">
            <h3>Assigned Doctor</h3>
            {consultation.assignedDoctor ? (
              <div className="doctor-info">
                <p><strong>{consultation.assignedDoctor.name}</strong></p>
                <p>Specialization: {consultation.assignedDoctor.specialization}</p>
                <p>Rating: ⭐ {consultation.assignedDoctor.rating}</p>
              </div>
            ) : (
              <p className="text-muted">No doctor assigned. You can consult our staff.</p>
            )}
          </div>
        )}
      </div>

      <div className="info-box">
        <p>
          <strong>Note:</strong> This AI analysis is for informational purposes only and should
          not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.
        </p>
      </div>
    </div>
  );
};

export default SymptomForm;
