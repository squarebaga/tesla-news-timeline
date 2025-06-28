import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeslaNewsTimeline from './TeslaNewsTimeline';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

const initialNewsItems = [
  // Tesla Positive News (existing items with sentiment added)
  {
    id: 1,
    date: "06/27/2025",
    tag: "#Autopilot",
    title: "Tesla Expands Full Self-Driving Beta Program",
    summary: "Tesla has announced an expansion of its Full Self-Driving (FSD) beta program, allowing more users to access the latest features.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sentiment: "positive"
  },
  {
    id: 2,
    date: "06/25/2025",
    tag: "#BatteryTech",
    title: "New Tesla Battery Technology Improves Range",
    summary: "Tesla has unveiled a new battery technology aimed at significantly improving range of its electric vehicles.",
    sentiment: "positive"
  },
  {
    id: 3,
    date: "06/23/2025",
    tag: "#Supercharger",
    title: "Tesla Opens New Supercharger Stations in Europe",
    summary: "Tesla has opened several new Supercharger stations across Europe to support growing EV demand.",
    sentiment: "positive"
  },
  // Tesla Critical/TESLAQ News (new items)
  {
    id: 101,
    date: "06/26/2025",
    tag: "#FSDConcerns",
    title: "Safety Experts Raise Concerns Over Tesla FSD Beta Expansion",
    summary: "Several automotive safety organizations question Tesla's decision to expand FSD beta without sufficient real-world testing data.",
    sentiment: "negative"
  },
  {
    id: 102,
    date: "06/24/2025",
    tag: "#QualityIssues",
    title: "Tesla Faces Increased Warranty Claims on Battery Packs",
    summary: "Consumer reports indicate a 15% increase in battery-related warranty claims for Tesla vehicles manufactured in Q1 2025.",
    sentiment: "negative"
  },
  {
    id: 103,
    date: "06/22/2025",
    tag: "#MarketConcerns",
    title: "Analysts Question Tesla's Ambitious Production Targets",
    summary: "Wall Street analysts express skepticism about Tesla's ability to meet its 2025 production targets amid supply chain challenges.",
    sentiment: "negative"
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

  const handleAddMultipleNews = (newsArray) => {
    const updatedNews = [...newsArray, ...newsItems];
    setNewsItems(updatedNews);
    localStorage.setItem('teslaNewsItems', JSON.stringify(updatedNews));
  };

  const handleUpdateNews = (updatedNews) => {
    const updatedItems = newsItems.map(item => 
      item.id === updatedNews.id ? updatedNews : item
    );
    setNewsItems(updatedItems);
    localStorage.setItem('teslaNewsItems', JSON.stringify(updatedItems));
  };

  const handleDeleteNews = (newsId) => {
    const updatedNews = newsItems.filter(item => item.id !== newsId);
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
                onAddMultipleNews={handleAddMultipleNews}
                onUpdateNews={handleUpdateNews}
                onDeleteNews={handleDeleteNews}
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