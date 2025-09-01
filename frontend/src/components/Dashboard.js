import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>대시보드 로딩 중...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>오류 발생</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="error">
        <h2>데이터를 불러올 수 없습니다.</h2>
      </div>
    );
  }

  const {
    total_tasks,
    completed_tasks,
    in_progress_tasks,
    not_started_tasks,
    project_progress,
    user_task_counts,
    recent_tasks
  } = dashboardData;

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

  return (
    <div className="dashboard">
      <h1 className="page-title">프로젝트 대시보드</h1>
      
      {/* 프로젝트 개요 */}
      <div className="overview-section">
        <h2 className="section-title">프로젝트 개요</h2>
        <div className="grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>전체 작업</h3>
              <p className="stat-number">{total_tasks}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>완료된 작업</h3>
              <p className="stat-number text-success">{completed_tasks}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h3>진행 중</h3>
              <p className="stat-number text-warning">{in_progress_tasks}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>시작 전</h3>
              <p className="stat-number text-muted">{not_started_tasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 프로젝트 진행률 */}
      <div className="progress-section">
        <h2 className="section-title">프로젝트 진행률</h2>
        <div className="progress-card">
          <div className="progress-header">
            <span>전체 진행률</span>
            <span className="progress-percentage">{project_progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${project_progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 사용자별 작업 현황 */}
      <div className="users-section">
        <h2 className="section-title">팀원별 작업 현황</h2>
        <div className="users-grid">
          {user_task_counts.map((user) => (
            <div key={user.user_id} className="user-card">
              <div className="user-avatar">
                {user.name.charAt(0)}
              </div>
              <div className="user-info">
                <h4>{user.name}</h4>
                <p className="user-username">@{user.username}</p>
                <p className="user-tasks">담당 작업: {user.task_count}개</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 작업 */}
      <div className="recent-tasks-section">
        <h2 className="section-title">최근 작업</h2>
        <div className="recent-tasks">
          {recent_tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-header">
                <h4 className="task-title">{task.title}</h4>
                <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
              <div className="task-meta">
                <span className="task-date">
                  {format(new Date(task.start_date), 'yyyy년 MM월 dd일', { locale: ko })} ~ 
                  {format(new Date(task.end_date), 'yyyy년 MM월 dd일', { locale: ko })}
                </span>
                {task.assigned_to_name && (
                  <span className="task-assignee">
                    담당자: {task.assigned_to_name}
                  </span>
                )}
              </div>
              {task.progress > 0 && (
                <div className="task-progress">
                  <div className="task-progress-bar">
                    <div 
                      className="task-progress-fill" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span className="task-progress-text">{task.progress}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 프로젝트 정보 */}
      <div className="project-info-section">
        <h2 className="section-title">프로젝트 정보</h2>
        <div className="project-info-card">
          <div className="info-item">
            <strong>프로젝트 기간:</strong>
            <span>2025년 7월 23일 (수) ~ 2025년 9월 15일 (월)</span>
          </div>
          <div className="info-item">
            <strong>총 업무일:</strong>
            <span>40일 (주말 제외)</span>
          </div>
          <div className="info-item">
            <strong>팀 구성:</strong>
            <span>5명 (프로젝트 매니저, 개발자 4명)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
