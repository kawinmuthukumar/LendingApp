import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      const name = localStorage.getItem('userName');
      setIsLoggedIn(loginStatus);
      setUserName(name || '');
    };

    // Check initially
    checkLoginStatus();

    // Add event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);
    
    // Check when component mounts
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">LendingApp</Link>
      </div>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link to="/add-item" className="nav-link">Add Item</Link>
            <Link to="/view-items" className="nav-link">View Items</Link>
            <Link to="/transactions" className="nav-link">Transactions</Link>
            <div className="user-info">
              <span className="welcome-text">Welcome, {userName}!</span>
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/signin" className="nav-link">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
