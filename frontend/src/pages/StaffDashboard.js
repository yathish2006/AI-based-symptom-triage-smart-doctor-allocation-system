import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { staffService } from '../services/api';
import '../styles/staffDashboard.css';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes, profileRes] = await Promise.all([
        staffService.getAssignedTasks(),
        staffService.getTaskStats(),
        staffService.getStaffProfile()
      ]);
      setTasks(tasksRes.data.tasks);
      setStats(statsRes.data.stats);
      setProfile(profileRes.data.staff);
      setError('');
    } catch (err) {
      setError('Failed to load staff data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await staffService.updateTaskStatus(taskId, { status: newStatus });
      await fetchStaffData();
    } catch (error) {
      setError('Failed to update task status');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="staff-dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <h1>👔 MedAI Staff</h1>
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
                className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                📋 My Tasks
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                📊 Statistics
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

          {activeTab === 'tasks' && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateTaskModal(true)}
                style={{ marginBottom: '20px' }}
              >
                ➕ Create Task
              </button>
              <TasksSection tasks={tasks} onStatusChange={handleTaskStatusChange} />
              {showCreateTaskModal && (
                <CreateTaskModal
                  onClose={() => setShowCreateTaskModal(false)}
                  onTaskCreated={() => {
                    setShowCreateTaskModal(false);
                    fetchStaffData();
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'stats' && stats && (
            <StatsSection stats={stats} tasks={tasks} />
          )}

          {activeTab === 'profile' && profile && (
            <ProfileSection profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
};

const TasksSection = ({ tasks, onStatusChange }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter(t => t.status === filterStatus);

  const statusColors = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    completed: '#10b981',
    cancelled: '#6b7280'
  };

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#991b1b'
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📋 Assigned Tasks ({filteredTasks.length})</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in-progress')}
          >
            In Progress
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <div className="task-title">
                  <h4>{task.title}</h4>
                  <p className="task-type">{task.taskType}</p>
                </div>
                <div className="task-badges">
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: priorityColors[task.priority] || '#f3f4f6' }}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="task-body">
                {task.description && (
                  <p className="description">{task.description}</p>
                )}

                {task.patient && (
                  <div className="task-info">
                    <strong>Patient:</strong> {task.patient.name}
                  </div>
                )}

                <div className="task-info">
                  <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
                </div>

                {task.notes && (
                  <div className="task-notes">
                    <p><strong>Notes:</strong> {task.notes}</p>
                  </div>
                )}
              </div>

              <div className="task-footer">
                <select
                  className={`status-select status-${task.status}`}
                  value={task.status}
                  onChange={(e) => onStatusChange(task._id, e.target.value)}
                  style={{ borderColor: statusColors[task.status] }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatsSection = ({ stats, tasks }) => {
  const upcomingTasks = tasks.filter(t =>
    new Date(t.dueDate) > new Date() && t.status !== 'completed'
  ).length;

  const overdueTasks = tasks.filter(t =>
    new Date(t.dueDate) < new Date() && t.status !== 'completed'
  ).length;

  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <h3>Total Tasks</h3>
          <p className="stat-value">{stats.total}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Completed</h3>
          <p className="stat-value">{stats.completed}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <h3>Pending</h3>
          <p className="stat-value">{stats.pending}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <h3>Upcoming</h3>
          <p className="stat-value">{upcomingTasks}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <h3>Overdue</h3>
          <p className="stat-value">{overdueTasks}</p>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">📈</div>
          <h3>Completion Rate</h3>
          <p className="stat-value">{stats.completionRate}%</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.completionRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Task Timeline</h2>
        </div>

        <div className="timeline">
          {tasks
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5)
            .map((task, idx) => (
              <div key={task._id} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>{task.title}</h4>
                  <p>{new Date(task.dueDate).toLocaleDateString()}</p>
                  <span className={`timeline-status status-${task.status}`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const ProfileSection = ({ profile }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2>👤 Staff Profile</h2>
      </div>

      <div className="profile-grid">
        <div className="profile-item">
          <label>Department</label>
          <p>{profile.department}</p>
        </div>
        <div className="profile-item">
          <label>Position</label>
          <p>{profile.position}</p>
        </div>
        <div className="profile-item">
          <label>Shift</label>
          <p>{profile.shift}</p>
        </div>
        {profile.hospitalAffiliation && (
          <div className="profile-item">
            <label>Hospital/Clinic</label>
            <p>{profile.hospitalAffiliation}</p>
          </div>
        )}
      </div>

      <div className="info-box">
        <p>
          <strong>Phone:</strong> {profile.userId?.phone}
        </p>
        <p>
          <strong>Email:</strong> {profile.userId?.email}
        </p>
      </div>
    </div>
  );
};

const CreateTaskModal = ({ onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    staffId: '',
    title: '',
    description: '',
    taskType: 'other',
    dueDate: '',
    priority: 'medium',
    patientId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available staff members to assign tasks (future feature)
    // In a real app, you'd fetch this from the backend
    // For now, users enter staff ID manually
  }, []);

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

    if (!formData.staffId || !formData.title || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await staffService.createTask(formData.staffId, {
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType,
        dueDate: formData.dueDate,
        priority: formData.priority,
        patient: formData.patientId || null
      });
      onTaskCreated();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Task</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Assign to Staff Member ID *</label>
            <input
              type="text"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              required
              placeholder="Enter staff member ID"
            />
          </div>

          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Task Type</label>
            <select name="taskType" value={formData.taskType} onChange={handleChange}>
              <option value="other">Other</option>
              <option value="schedule">Schedule</option>
              <option value="patient-visit">Patient Visit</option>
              <option value="checkup">Checkup</option>
              <option value="report">Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Patient ID (Optional)</label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              placeholder="Patient ID if related to patient"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffDashboard;
