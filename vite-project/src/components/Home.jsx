import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [featuredItems, setFeaturedItems] = useState([]);
  const [stats, setStats] = useState({ users: 0, items: 0, transactions: 0 });
  const [currentFeature, setCurrentFeature] = useState(0);
  const [loading, setLoading] = useState(true);

  const features = [
    {
      title: "Share & Connect",
      description: "Join our community of generous individuals who believe in sharing resources.",
      icon: "🤝"
    },
    {
      title: "Save Money",
      description: "Why buy when you can borrow? Save money and reduce waste.",
      icon: "💰"
    },
    {
      title: "Build Trust",
      description: "Create lasting connections with people in your neighborhood.",
      icon: "🏘️"
    }
  ];

  useEffect(() => {
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    const name = localStorage.getItem('userName');
    setIsLoggedIn(loginStatus);
    setUserName(name || '');

    // Auto-rotate features
    const timer = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch featured items
        const itemsResponse = await axios.get(`${API_BASE_URL}/api/items/featured`);
        setFeaturedItems(itemsResponse.data.slice(0, 6));

        // Fetch statistics
        const statsResponse = await axios.get(`${API_BASE_URL}/api/stats`);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleItemClick = (itemId) => {
    if (isLoggedIn) {
      navigate(`/items/${itemId}`);
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to LendingApp</h1>
          <p className="hero-subtitle">Share Resources, Build Community</p>
          
          {isLoggedIn ? (
            <div className="welcome-section">
              <h2>Welcome back, {userName}!</h2>
              <div className="action-buttons">
                <Link to="/add-item" className="action-button primary">
                  Share an Item
                </Link>
                <Link to="/view-items" className="action-button secondary">
                  Browse Items
                </Link>
              </div>
            </div>
          ) : (
            <div className="cta-section">
              <p>Join our community today!</p>
              <div className="cta-buttons">
                <Link to="/register" className="cta-button register">
                  Get Started
                </Link>
                <Link to="/signin" className="cta-button signin">
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card animate-slide">
          <div className="feature-icon">{features[currentFeature].icon}</div>
          <h2>{features[currentFeature].title}</h2>
          <p>{features[currentFeature].description}</p>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="featured-section">
        <h2>Featured Items</h2>
        {loading ? (
          <div className="loading">Loading featured items...</div>
        ) : (
          <div className="featured-grid">
            {featuredItems.map((item) => (
              <div 
                key={item._id} 
                className="featured-item"
                onClick={() => handleItemClick(item._id)}
              >
                <div className="item-image">
                  <img src={item.imageUrl || '/default-item.png'} alt={item.name} />
                </div>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="item-owner">Shared by {item.ownerName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.users}+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-card">
            <h3>{stats.items}+</h3>
            <p>Items Shared</p>
          </div>
          <div className="stat-card">
            <h3>{stats.transactions}+</h3>
            <p>Successful Loans</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your free account in minutes</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>List or Browse</h3>
            <p>Share items or find what you need</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Connect</h3>
            <p>Meet and share with your community</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
