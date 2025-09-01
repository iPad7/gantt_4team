import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/');
      setUsers(response.data);
    } catch (error) {
      setError('사용자 목록을 불러오는데 실패했습니다.');
      console.error('Users error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>사용자 목록 로딩 중...</h2>
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

  return (
    <div className="user-management">
      <h1 className="page-title">사용자 관리</h1>
      
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-number">{users.length}</span>
          <span className="stat-label">전체 사용자</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {users.filter(user => user.is_admin).length}
          </span>
          <span className="stat-label">관리자</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {users.filter(user => !user.is_admin).length}
          </span>
          <span className="stat-label">일반 사용자</span>
        </div>
      </div>

      <div className="users-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>사용자명</th>
              <th>실명</th>
              <th>권한</th>
              <th>가입일</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-username">
                    @{user.username}
                  </div>
                </td>
                <td>
                  <div className="user-name">
                    {user.name}
                  </div>
                </td>
                <td>
                  <span className={`badge ${user.is_admin ? 'badge-danger' : 'badge-secondary'}`}>
                    {user.is_admin ? '관리자' : '일반 사용자'}
                  </span>
                </td>
                <td>
                  {format(new Date(user.date_joined), 'yyyy년 MM월 dd일', { locale: ko })}
                </td>
                <td>
                  <span className="badge badge-success">
                    활성
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-note">
        <h3>관리자 안내</h3>
        <p>
          새로운 사용자 계정은 Django 관리자 페이지에서 생성할 수 있습니다. 
          관리자 권한이 필요한 사용자는 <code>is_admin</code> 필드를 체크해주세요.
        </p>
        <div className="admin-link">
          <a href="/admin/" target="_blank" className="btn btn-primary">
            Django 관리자 페이지 열기
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
