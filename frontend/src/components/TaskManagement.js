import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import './TaskManagement.css';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    parent_task: '',
    status: 'not_started',
    progress: 0,
    assigned_to: []
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/');
      setTasks(response.data);
    } catch (error) {
      setError('작업 목록을 불러오는데 실패했습니다.');
      console.error('Tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, options } = e.target;
    if (name === 'assigned_to' && options) {
      const selectedIds = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedIds }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      parent_task: '',
      status: 'not_started',
      progress: 0,
      assigned_to: []
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 전송 전 데이터 정리: 빈 문자열을 null로 변환
    const cleanedData = {
      ...formData,
      parent_task: formData.parent_task || null,
    };

    try {
      if (editingTask) {
        // 수정
        await axios.put(`/api/tasks/${editingTask.id}/`, cleanedData);
        setError('');
      } else {
        // 생성
        await axios.post('/api/tasks/', cleanedData);
        setError('');
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      const errorMsg = Object.values(error.response.data).join(' ');
      setError(errorMsg || '작업 저장에 실패했습니다.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      start_date: task.start_date,
      end_date: task.end_date,
      parent_task: task.parent_task || '',
      status: task.status,
      progress: task.progress,
      assigned_to: task.assigned_to || []
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('정말로 이 작업을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/tasks/${taskId}/`);
        fetchTasks();
        setError('');
      } catch (error) {
        setError('작업 삭제에 실패했습니다.');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in_progress':
        return 'badge-warning';
      case 'not_started':
        return 'badge-secondary';
      case 'on_hold':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'in_progress':
        return '진행 중';
      case 'not_started':
        return '시작 전';
      case 'on_hold':
        return '보류';
      default:
        return status;
    }
  };

  const toggleSubtasks = (taskId) => {
    setExpandedTasks(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId);
      } else {
        newExpanded.add(taskId);
      }
      return newExpanded;
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>작업 목록 로딩 중...</h2>
      </div>
    );
  }

  return (
    <div className="task-management">
      <h1 className="page-title">작업 관리</h1>
      
      <div className="task-stats">
        <div className="stat-item">
          <span className="stat-number">{tasks.length}</span>
          <span className="stat-label">전체 작업</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {tasks.filter(task => task.status === 'completed').length}
          </span>
          <span className="stat-label">완료된 작업</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {tasks.filter(task => task.status === 'in_progress').length}
          </span>
          <span className="stat-label">진행 중</span>
        </div>
      </div>

      {/* 작업 생성/수정 폼 */}
      <div className="task-form-section">
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '폼 닫기' : '새 작업 추가'}
        </button>
        
        {showForm && (
          <form onSubmit={handleSubmit} className="task-form">
            <h3>{editingTask ? '작업 수정' : '새 작업 생성'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>작업명 *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>상위 작업</label>
                <select
                  name="parent_task"
                  value={formData.parent_task}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">없음</option>
                  {tasks.filter(task => !task.parent_task).map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>시작일 *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>종료일 *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>상태</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="not_started">시작 전</option>
                  <option value="in_progress">진행 중</option>
                  <option value="completed">완료</option>
                  <option value="on_hold">보류</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>진행률 (%)</label>
                <input
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>담당자</label>
                <select
                  multiple
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingTask ? '수정' : '생성'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="tasks-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>작업명</th>
              <th>상위 작업</th>
              <th>시작일</th>
              <th>종료일</th>
              <th>상태</th>
              <th>진행률</th>
              <th>담당자</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {tasks.filter(t => !t.parent_task).map(parentTask => {
              const subtasks = tasks.filter(t => t.parent_task === parentTask.id);
              const isExpanded = expandedTasks.has(parentTask.id);

              return (
                <React.Fragment key={parentTask.id}>
                  {/* 상위 작업 행 */}
                  <tr className="parent-task-row">
                    <td>
                      <div className="task-title-cell">
                        <button 
                          className="toggle-btn"
                          onClick={() => toggleSubtasks(parentTask.id)}
                        >
                          {subtasks.length > 0 && (isExpanded ? '▼' : '▶')}
                        </button>
                        <div 
                          className="task-color-indicator"
                          style={{ backgroundColor: parentTask.color }}
                        ></div>
                        <span>{parentTask.title}</span>
                      </div>
                    </td>
                    <td>-</td>
                    <td>{format(new Date(parentTask.start_date), 'MM/dd', { locale: ko })}</td>
                    <td>{format(new Date(parentTask.end_date), 'MM/dd', { locale: ko })}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(parentTask.status)}`}>
                        {getStatusText(parentTask.status)}
                      </span>
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${parentTask.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{parentTask.progress}%</span>
                      </div>
                    </td>
                    <td>{parentTask.assigned_to_names.join(', ') || '-'}</td>
                    <td>
                      <div className="task-actions">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(parentTask)}
                        >
                          수정
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(parentTask.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* 하위 작업 행 (펼쳐졌을 때만 보임) */}
                  {isExpanded && subtasks.map(subtask => (
                    <tr key={subtask.id} className="subtask-row">
                      <td>
                        <div className="task-title-cell subtask-title-cell">
                          <span className="subtask-prefix">└</span>
                          <span>{subtask.title}</span>
                        </div>
                      </td>
                      <td>{subtask.parent_task_title || '-'}</td>
                      <td>{format(new Date(subtask.start_date), 'MM/dd', { locale: ko })}</td>
                      <td>{format(new Date(subtask.end_date), 'MM/dd', { locale: ko })}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(subtask.status)}`}>
                          {getStatusText(subtask.status)}
                        </span>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${subtask.progress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{subtask.progress}%</span>
                        </div>
                      </td>
                      <td>{subtask.assigned_to_names.join(', ') || '-'}</td>
                      <td>
                        <div className="task-actions">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(subtask)}
                          >
                            수정
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(subtask.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskManagement;
