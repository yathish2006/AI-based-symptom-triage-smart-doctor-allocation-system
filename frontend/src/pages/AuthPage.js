import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/authPage.css';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    confirmPassword: '',
    // Doctor fields
    license: '',
    specialization: '',
    experience: '',
    qualifications: '',
    hospitalAffiliation: '',
    // Staff fields
    department: '',
    position: '',
    shift: ''
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
    setError('');
    setSuccess('');

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    try {
      setLoading(true);
      if (isSignUp) {
        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role
        };

        // Add role-specific fields
        if (role === 'doctor') {
          registerData.license = formData.license;
          registerData.specialization = formData.specialization;
          registerData.experience = parseInt(formData.experience) || 0;
          registerData.qualifications = formData.qualifications ? formData.qualifications.split(',').map(q => q.trim()) : [];
          registerData.hospitalAffiliation = formData.hospitalAffiliation;
        } else if (role === 'staff') {
          registerData.department = formData.department;
          registerData.position = formData.position;
          registerData.shift = formData.shift;
          registerData.hospitalAffiliation = formData.hospitalAffiliation;
        }

        await register(registerData);
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate(role === 'patient' ? '/patient' : role === 'doctor' ? '/doctor' : '/staff');
        }, 1500);
      } else {
        await login(formData.email, formData.password);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>⚕️ MedAI Triage</h1>
          <p>AI-Powered Health Assistance</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={isSignUp}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required={isSignUp}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label>Medical License *</label>
                    <input
                      type="text"
                      name="license"
                      value={formData.license}
                      onChange={handleChange}
                      required
                      placeholder="Enter your medical license number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Specialization *</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="General">General</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Qualifications (comma separated)</label>
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      placeholder="e.g., MD, MBBS, Board Certified"
                    />
                  </div>

                  <div className="form-group">
                    <label>Hospital Affiliation</label>
                    <input
                      type="text"
                      name="hospitalAffiliation"
                      value={formData.hospitalAffiliation}
                      onChange={handleChange}
                      placeholder="Enter hospital name"
                    />
                  </div>
                </>
              )}

              {role === 'staff' && (
                <>
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Reception">Reception</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Administration">Administration</option>
                      <option value="Lab">Lab</option>
                      <option value="Pharmacy">Pharmacy</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g., Nurse, Receptionist"
                    />
                  </div>

                  <div className="form-group">
                    <label>Shift</label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                    >
                      <option value="">Select Shift</option>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Hospital Affiliation</label>
                    <input
                      type="text"
                      name="hospitalAffiliation"
                      value={formData.hospitalAffiliation}
                      onChange={handleChange}
                      placeholder="Enter hospital name"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={isSignUp}
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  phone: '',
                  confirmPassword: '',
                  license: '',
                  specialization: '',
                  experience: '',
                  qualifications: '',
                  hospitalAffiliation: '',
                  department: '',
                  position: '',
                  shift: ''
                });
                setRole('patient');
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="features">
          <h3>Why Chose MedAI?</h3>
          <ul>
            <li>✓ AI-powered symptom analysis</li>
            <li>✓ Quick doctor allocation</li>
            <li>✓ 24/7 emergency support</li>
            <li>✓ Secure medical records</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
