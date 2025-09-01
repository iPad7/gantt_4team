import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="navbar-logo">
            WBS 시스템
          </Link>
        </div>
        
        <div className="navbar-menu">
          <Link 
            to="/dashboard" 
            className={`navbar-item ${isActive('/dashboard')}`}
          >
            대시보드
          </Link>
          <Link 
            to="/gantt" 
            className={`navbar-item ${isActive('/gantt')}`}
          >
            간트 차트
          </Link>
          <Link 
            to="/tasks" 
            className={`navbar-item ${isActive('/tasks')}`}
          >
            작업 관리
          </Link>
          {user?.is_admin && (
            <Link 
              to="/users" 
              className={`navbar-item ${isActive('/users')}`}
            >
              사용자 관리
            </Link>
          )}
        </div>
        
        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
