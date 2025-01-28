import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserRegistration from './components/UserRegistration';
import AddItem from './components/AddItem';
import ViewItems from './components/ViewItems';
import Transaction from './components/Transaction';
import SignIn from './components/SignIn';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/view-items" element={<ViewItems />} />
            <Route path="/transactions" element={<Transaction />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
