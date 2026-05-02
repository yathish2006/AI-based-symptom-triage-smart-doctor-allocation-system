import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

// Consultation Services
export const consultationService = {
  createConsultation: (data) => api.post('/consultations/create', data),
  getPatientConsultations: () => api.get('/consultations/patient'),
  getDoctorConsultations: () => api.get('/consultations/doctor'),
  getConsultationDetails: (id) => api.get(`/consultations/${id}`),
  updateStatus: (id, data) => api.put(`/consultations/${id}/status`, data),
  addPrescription: (id, data) => api.put(`/consultations/${id}/prescription`, data),
  rateConsultation: (id, data) => api.put(`/consultations/${id}/rating`, data)
};

// Doctor Services
export const doctorService = {
  getAllDoctors: () => api.get('/doctors/list'),
  getDoctorsBySpecialization: (specialization) =>
    api.get(`/doctors/specialization/${specialization}`),
  getDoctorProfile: () => api.get('/doctors/profile'),
  getDoctorPatients: () => api.get('/doctors/patients'),
  updateDoctorProfile: (data) => api.put('/doctors/profile', data)
};

// Patient Services
export const patientService = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  addMedicalHistory: (data) => api.post('/patients/medical-history', data)
};

// Staff Services
export const staffService = {
  getAssignedTasks: () => api.get('/staff/tasks'),
  updateTaskStatus: (id, data) => api.put(`/staff/tasks/${id}/status`, data),
  getStaffProfile: () => api.get('/staff/profile'),
  getTaskStats: () => api.get('/staff/tasks/stats'),
  createTask: (staffId, data) => api.post(`/staff/tasks/${staffId}/create`, data)
};

export default api;
