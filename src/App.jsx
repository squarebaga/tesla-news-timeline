import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeslaNewsTimeline from './TeslaNewsTimeline';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

const initialNewsItems = [
  {
    id: 1,
    date: "06/27/2025",
    tag: "#Autopilot",
    title: "Tesla Expands Full Self-Driving Beta Program",
    summary: "Tesla has announced an expansion of its Full Self-Driving (FSD) beta program, allowing more users to access the latest features."
  },
  {
    id: 2,
    date: "06/25/2025",
    tag: "#BatteryTech",
    title: "New Tesla Battery Technology Improves Range",
    summary: "Tesla has unveiled a new battery technology aimed at significantly improving range of its electric vehicles."
  },
  {
    id: 3,
    date: "06/23/2025",
    tag: "#Supercharger",
    title: "Tesla Opens New Supercharger Stations in Europe",
    summary: "Tesla has opened several new Supercharger stations across Europe to support growing EV demand."
  }
];

function App() {
  const [newsItems, setNewsItems] = useState(() => {
    const saved = localStorage.getItem('teslaNewsItems');
    return saved ? JSON.parse(saved) : initialNewsItems;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('teslaAdminLoggedIn');
    return saved === 'true';
  });

  const handleAddNews = (newNews) => {
    const updatedNews = [newNews, ...newsItems];
    setNewsItems(updatedNews);
    localStorage.setItem('teslaNewsItems', JSON.stringify(updatedNews));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('teslaAdminLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('teslaAdminLoggedIn');
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<TeslaNewsTimeline newsItems={newsItems} isLoggedIn={isLoggedIn} />} 
        />
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/admin" 
          element={
            isLoggedIn ? (
              <AdminPanel 
                newsItems={newsItems}
                onAddNews={handleAddNews}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;