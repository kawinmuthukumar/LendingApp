import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: "Share & Connect",
      description: "Join our community of generous individuals who believe in sharing resources.",
      icon: "🤝"
    },
    {
      title: "Serve Your Community",
      description: "Make a difference by lending items to those who need them most.",
      icon: "❤️"
    },
    {
      title: "Save Money",
      description: "Why buy when you can borrow? Save money and reduce waste.",
      icon: "💰"
    },
    {
      title: "Build Relationships",
      description: "Create lasting connections with people in your neighborhood.",
      icon: "🏘️"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to LendingApp</h1>
        <p className="hero-subtitle">Share Resources, Build Community</p>
        
        <div className="feature-card">
          <div className="feature-icon">{features[currentFeature].icon}</div>
          <h2>{features[currentFeature].title}</h2>
          <p>{features[currentFeature].description}</p>
        </div>
      </div>

      <div className="benefits-section">
        <h2>Why Choose LendingApp?</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">🌟</span>
            <h3>Easy to Use</h3>
            <p>Simple interface to lend and borrow items</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔒</span>
            <h3>Secure Platform</h3>
            <p>Safe and trusted lending process</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🌍</span>
            <h3>Eco-Friendly</h3>
            <p>Reduce waste through sharing</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">👥</span>
            <h3>Community Focused</h3>
            <p>Connect with your neighbors</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Start Sharing?</h2>
        <p>Join our community today and make a difference!</p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button register">Sign Up Now</Link>
          <Link to="/view-items" className="cta-button browse">Browse Items</Link>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <h3>1000+</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-item">
          <h3>5000+</h3>
          <p>Items Shared</p>
        </div>
        <div className="stat-item">
          <h3>$50K+</h3>
          <p>Community Savings</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
