import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import Navbar from './components/Navbar';
import SignIn from './components/SignIn';
import UserRegistration from './components/UserRegistration';
import AddItem from './components/AddItem';
import ViewItems from './components/ViewItems';
import Transaction from './components/Transaction';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loginStatus);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={isLoggedIn ? <Navigate to="/view-items" /> : <SignIn />} />
            <Route path="/register" element={<UserRegistration />} />
            <Route 
              path="/add-item" 
              element={
                <ProtectedRoute>
                  <AddItem />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/view-items" 
              element={
                <ProtectedRoute>
                  <ViewItems />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <Transaction />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
