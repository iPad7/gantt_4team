import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays, differenceInDays, isWeekend } from 'date-fns';
import { ko } from 'date-fns/locale';
import './GanttChart.css';

const GanttChart = () => {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    try {
      const response = await axios.get('/api/timeline/');
      setTimelineData(response.data);
    } catch (error) {
      setError('타임라인 데이터를 불러오는데 실패했습니다.');
      console.error('Timeline error:', error);
    } finally {
      setLoading(false);
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
        <h2>간트 차트 로딩 중...</h2>
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

  // 프로젝트 시작일과 종료일을 정확하게 설정
  const startDate = new Date('2025-07-23'); // 7월 23일 (수요일)
  const endDate = new Date('2025-09-15');   // 9월 15일 (월요일)
  
  // 업무일 계산 (주말 제외)
  const getWorkDays = () => {
    const days = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      if (!isWeekend(currentDate)) {
        days.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  };

  const workDays = getWorkDays();

  // 작업의 시작 위치와 너비 계산
  const calculateTaskPosition = (taskStart, taskEnd) => {
    const start = new Date(taskStart);
    const end = new Date(taskEnd);
    
    let startOffset = 0;
    let width = 0;
    
    for (let i = 0; i < workDays.length; i++) {
      const day = workDays[i];
      if (day >= start && day <= end) {
        if (startOffset === 0) startOffset = i;
        width++;
      }
    }
    
    return { startOffset, width };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'in_progress':
        return '#ffc107';
      case 'not_started':
        return '#6c757d';
      case 'on_hold':
        return '#dc3545';
      default:
        return '#6c757d';
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
    <div className="gantt-chart">
      <h1 className="page-title">간트 차트</h1>
      
      <div className="gantt-container">
        {/* 헤더 */}
        <div className="gantt-header">
          <div className="gantt-header-task">작업</div>
          <div className="gantt-header-status">진행 상황</div>
          <div className="gantt-header-timeline">
            {workDays.map((day, index) => (
              <div key={index} className="gantt-header-day">
                <div className="gantt-header-date">
                  {format(day, 'MM/dd')}
                </div>
                <div className="gantt-header-weekday">
                  {format(day, 'E', { locale: ko })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 작업 타임라인 */}
        <div className="gantt-body">
          {timelineData && timelineData.timeline_data ? (
            timelineData.timeline_data.map((task) => {
              const { startOffset, width } = calculateTaskPosition(
                task.start_date, 
                task.end_date
              );
              const isExpanded = expandedTasks.has(task.id);
              
              return (
                <React.Fragment key={task.id}>
                  {/* 상위 작업 행 */}
                  <div className="gantt-row parent-task-row" onClick={() => toggleSubtasks(task.id)}>
                    <div className="gantt-task-info">
                      <div className="task-title" style={{ color: task.color }}>
                        <span className="toggle-icon">
                          {task.subtasks && task.subtasks.length > 0 && (isExpanded ? '▼' : '▶')}
                        </span>
                        {task.title}
                      </div>
                      <div className="task-dates">
                        {format(new Date(task.start_date), 'MM/dd', { locale: ko })} ~ 
                        {format(new Date(task.end_date), 'MM/dd', { locale: ko })}
                      </div>
                    </div>
                    <div className="gantt-task-status"></div>
                    <div className="gantt-timeline">
                      {workDays.map((day, index) => (
                        <div key={index} className="gantt-day">
                          {index >= startOffset && index < startOffset + width && (
                            <div 
                              className="gantt-task-bar"
                              style={{ backgroundColor: task.color, width: '100%' }}
                            >
                              <div className="task-tooltip">
                                <strong>{task.title}</strong><br />
                                {format(new Date(task.start_date), 'yyyy년 MM월 dd일', { locale: ko })} ~ 
                                {format(new Date(task.end_date), 'yyyy년 MM월 dd일', { locale: ko })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 하위 작업들 (펼쳐졌을 때만 보임) */}
                  {isExpanded && task.subtasks && task.subtasks.map((subtask) => {
                    const { startOffset: subStartOffset, width: subWidth } = calculateTaskPosition(
                      subtask.start_date, 
                      subtask.end_date
                    );
                    
                    return (
                      <div key={subtask.id} className="gantt-row subtask-row">
                        <div className="gantt-task-info">
                          <div className="task-title subtask-title">
                            └ {subtask.title}
                          </div>
                          <div className="task-dates">
                            {format(new Date(subtask.start_date), 'MM/dd', { locale: ko })} ~ 
                            {format(new Date(subtask.end_date), 'MM/dd', { locale: ko })}
                          </div>
                        </div>
                        <div className="gantt-task-status">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(subtask.status) }}
                          >
                            {getStatusText(subtask.status)}
                          </span>
                          {subtask.progress > 0 && (
                            <span className="progress-text">{subtask.progress}%</span>
                          )}
                        </div>
                        <div className="gantt-timeline">
                          {workDays.map((day, index) => (
                            <div key={index} className="gantt-day">
                              {index >= subStartOffset && index < subStartOffset + subWidth && (
                                <div 
                                  className="gantt-task-bar subtask-bar"
                                  style={{ 
                                    backgroundColor: getStatusColor(subtask.status),
                                    opacity: 0.7,
                                    width: '100%'
                                  }}
                                >
                                  <div className="task-tooltip">
                                    <strong>{subtask.title}</strong><br />
                                    상태: {getStatusText(subtask.status)}<br />
                                    진행률: {subtask.progress}%
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })
          ) : (
            <div className="no-tasks">
              <p>등록된 작업이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 프로젝트 정보 */}
        <div className="project-info">
          <h3>프로젝트 정보</h3>
          <p><strong>시작일:</strong> 2025년 7월 23일 (수요일)</p>
          <p><strong>종료일:</strong> 2025년 9월 15일 (월요일)</p>
          <p><strong>총 업무일:</strong> {workDays.length}일 (주말 제외)</p>
        </div>
      </div>

      {/* 범례 */}
      <div className="gantt-legend">
        <h3>범례</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF6B6B' }}></div>
            <span>상위 작업</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
            <span>완료된 작업</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
            <span>진행 중인 작업</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#6c757d' }}></div>
            <span>시작 전 작업</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
