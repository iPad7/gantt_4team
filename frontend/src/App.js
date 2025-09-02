import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GanttChart from './components/GanttChart';
import TaskManagement from './components/TaskManagement';
import UserManagement from './components/UserManagement';
import Navigation from './components/Navigation';

// Context
import { AuthContext } from './context/AuthContext';

// API 설정
// React Dev Server의 Proxy를 사용하여 API를 호출합니다.
// (package.json: "proxy": "http://localhost:8000")
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 확인
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/status/');
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('인증되지 않은 사용자');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login/', { username, password });
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '로그인에 실패했습니다.' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.delete('/api/auth/logout/');
      setUser(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>로딩 중...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="App">
          {user && <Navigation />}
          <Routes>
            <Route 
              path="/login" 
              element={
                <div className="container">
                  {user ? <Navigate to="/dashboard" /> : <Login />}
                </div>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <div className="container">
                  {user ? <Dashboard /> : <Navigate to="/login" />}
                </div>
              } 
            />
            <Route 
              path="/gantt" 
              element={
                <div className="container-wide">
                  {user ? <GanttChart /> : <Navigate to="/login" />}
                </div>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <div className="container">
                  {user ? <TaskManagement /> : <Navigate to="/login" />}
                </div>
              } 
            />
            <Route 
              path="/users" 
              element={
                <div className="container">
                  {user && user.is_admin ? <UserManagement /> : <Navigate to="/dashboard" />}
                </div>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
