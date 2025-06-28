import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel({ newsItems, onAddNews, onAddMultipleNews, onUpdateNews, onDeleteNews, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    tag: '',
    date: new Date().toISOString().split('T')[0],
    youtubeUrl: '',
    sentiment: 'positive'
  });
  const [settings, setSettings] = useState({
    siteTitle: 'Tesla News Timeline',
    adminPassword: 'tesla123',
    defaultTag: 'Tesla'
  });
  const [debugLogs, setDebugLogs] = useState([]);
  const [debugData, setDebugData] = useState({
    localStorage: {},
    sessionStorage: {},
    environment: {},
    performance: {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newsData = {
      id: editingNews ? editingNews.id : Date.now(),
      title: formData.title,
      summary: formData.summary,
      tag: formData.tag.startsWith('#') ? formData.tag : `#${formData.tag}`,
      date: new Date(formData.date).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }),
      youtubeUrl: formData.youtubeUrl,
      sentiment: formData.sentiment
    };
    
    if (editingNews) {
      onUpdateNews(newsData);
      setEditingNews(null);
      alert('News updated successfully!');
    } else {
      onAddNews(newsData);
      alert('News added successfully!');
    }
    
    // Clear form
    setFormData({
      title: '',
      summary: '',
      tag: '',
      date: new Date().toISOString().split('T')[0],
      youtubeUrl: '',
      sentiment: 'positive'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleEditNews = (news) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      summary: news.summary,
      tag: news.tag,
      date: new Date(news.date).toISOString().split('T')[0],
      youtubeUrl: news.youtubeUrl || '',
      sentiment: news.sentiment || 'positive'
    });
    setActiveTab('news');
  };

  const handleDeleteNews = (newsId) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      onDeleteNews(newsId);
      alert('News deleted successfully!');
    }
  };

  // Debug functions
  useEffect(() => {
    // Capture console errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      originalError(...args);
      addDebugLog('error', args.join(' '));
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      addDebugLog('warning', args.join(' '));
    };
    
    // Capture unhandled errors
    const handleError = (event) => {
      addDebugLog('error', `Unhandled error: ${event.error?.message || event.message}`);
    };
    
    window.addEventListener('error', handleError);
    
    // Update debug data
    updateDebugData();
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
    };
  }, []);

  const addDebugLog = (type, message) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setDebugLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  const updateDebugData = () => {
    const localStorage = {};
    const sessionStorage = {};
    
    // Get localStorage data
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      try {
        localStorage[key] = JSON.parse(window.localStorage.getItem(key));
      } catch {
        localStorage[key] = window.localStorage.getItem(key);
      }
    }
    
    // Get sessionStorage data
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      try {
        sessionStorage[key] = JSON.parse(window.sessionStorage.getItem(key));
      } catch {
        sessionStorage[key] = window.sessionStorage.getItem(key);
      }
    }
    
    const environment = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      platform: navigator.platform,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    // Performance metrics
    const performanceData = {
      newsItemCount: newsItems.length,
      videosCount: newsItems.filter(item => item.youtubeUrl).length,
      memoryUsage: window.performance.memory ? {
        used: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : 'Not available',
      timing: window.performance.timing ? {
        domContentLoaded: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
        loadComplete: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
        domInteractive: window.performance.timing.domInteractive - window.performance.timing.navigationStart
      } : 'Not available',
      renderEstimate: {
        domNodes: document.querySelectorAll('*').length,
        newsComponents: newsItems.length,
        videoEmbeds: newsItems.filter(item => item.youtubeUrl).length,
        estimatedRenderTime: `${Math.max(newsItems.length * 2, 10)}ms`
      },
      recommendations: []
    };
    
    // Performance recommendations
    if (newsItems.length > 50) {
      performanceData.recommendations.push('Consider implementing pagination (✓ Already implemented)');
    }
    if (newsItems.filter(item => item.youtubeUrl).length > 10) {
      performanceData.recommendations.push('Consider lazy loading YouTube videos');
    }
    if (newsItems.length > 100) {
      performanceData.recommendations.push('Consider virtual scrolling for better performance');
    }
    if (newsItems.length > 500) {
      performanceData.recommendations.push('Consider server-side pagination');
    }
    
    setDebugData({ localStorage, sessionStorage, environment, performance: performanceData });
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ This will clear ALL data including news items and login state. Are you sure?')) {
      window.localStorage.clear();
      window.sessionStorage.clear();
      addDebugLog('info', 'All data cleared');
      alert('All data cleared! Please refresh the page.');
    }
  };

  const generateSampleData = (count = 3) => {
    const titles = [
      'Tesla Cybertruck Production Milestone Achieved',
      'Supercharger V4 Network Expansion Accelerates',
      'AI Day 2025 Reveals Revolutionary Advances',
      'Model Y Performance Refresh Unveiled',
      'Gigafactory Berlin Doubles Production Capacity',
      'FSD Beta V12 Shows Human-Level Performance',
      'Tesla Energy Storage Breaks Industry Records',
      'Robotaxi Service Launches in Major Cities',
      'Neural Network Architecture Reaches New Heights',
      'Battery Day Announces 4680 Cell Mass Production',
      'Model S Plaid Sets New Nürburgring Record',
      'Tesla Solar Roof Achieves Grid Parity',
      'Optimus Robot Demonstrates Advanced Capabilities',
      'Model 3 Highland Refresh Global Launch',
      'Tesla Semi Completes Cross-Country Test',
      'Megapack Factory Opens in Shanghai',
      'FSD Hardware 4.0 Enters Production',
      'Tesla Insurance Expands to New Markets',
      'Cybertruck Beast Mode Performance Test',
      'Supercharger Magic Dock CCS Compatibility',
      'Tesla Bot Gen 2 Factory Demonstration',
      'Model X Refresh Interior Updates',
      'Gigafactory Texas Reaches Full Capacity',
      'Tesla Energy Virtual Power Plant Launch',
      'Autopilot Vision-Only System Update',
      'Tesla Roadster SpaceX Package Details',
      'Model Y Juniper Prototype Spotted',
      'Tesla Phone Rumors Gain Momentum',
      'Giga Berlin Water Usage Optimization',
      'Tesla Wireless Charging Technology Demo'
    ];
    
    const summaries = [
      'Tesla achieves major production milestone with significant manufacturing improvements.',
      'Advanced charging infrastructure deployment continues across global markets.',
      'Breakthrough artificial intelligence developments reshape autonomous vehicle industry.',
      'Enhanced performance specifications and design updates for popular electric SUV.',
      'European manufacturing facility announces major capacity expansion and efficiency gains.',
      'Latest autonomous driving software demonstrates remarkable improvements in real-world scenarios.',
      'Revolutionary energy storage solutions transform residential and commercial applications.',
      'Autonomous transportation service begins operations in metropolitan areas worldwide.',
      'Advanced neural processing capabilities enable unprecedented vehicle intelligence systems.',
      'Next-generation battery technology promises extended range and rapid charging capabilities.',
      'High-performance electric sedan breaks multiple track records in rigorous testing.',
      'Integrated solar roofing solution achieves cost competitiveness with traditional energy sources.',
      'Humanoid robot platform showcases advanced manipulation and navigation capabilities.',
      'Refreshed compact sedan receives global launch with improved efficiency and features.',
      'Electric commercial vehicle completes extensive long-distance reliability testing program.',
      'Large-scale energy storage manufacturing facility begins operations in international market.',
      'Advanced processing hardware enters mass production for next-generation autonomous vehicles.',
      'Usage-based insurance product expands availability to additional geographic regions.',
      'Flagship pickup truck demonstrates exceptional performance capabilities in challenging conditions.',
      'Universal charging compatibility enables broader access to Tesla charging infrastructure.',
      'Second-generation humanoid robot demonstrates manufacturing assembly capabilities.',
      'Luxury SUV receives interior technology updates and comfort enhancements.',
      'Texas manufacturing facility achieves maximum production capacity ahead of schedule.',
      'Distributed energy network connects residential and commercial storage systems.',
      'Camera-based autonomous driving system receives significant capability improvements.',
      'Ultra-high-performance sports car reveals advanced propulsion system details.',
      'Next-generation SUV development program reaches advanced prototype testing phase.',
      'Consumer electronics device speculation intensifies following recent technology patents.',
      'Sustainable manufacturing practices reduce environmental impact at German facility.',
      'Contactless vehicle charging technology undergoes public demonstration and testing.'
    ];
    
    const tags = [
      '#Cybertruck', '#Supercharger', '#AI', '#ModelY', '#Gigafactory', '#FSD', 
      '#Energy', '#Robotaxi', '#Neural', '#Battery', '#ModelS', '#Solar', 
      '#Optimus', '#Model3', '#Semi', '#Megapack', '#Hardware', '#Insurance',
      '#Performance', '#Charging', '#Robot', '#ModelX', '#Texas', '#VPP',
      '#Autopilot', '#Roadster', '#Juniper', '#Phone', '#Berlin', '#Wireless'
    ];
    
    const sampleNews = [];
    const baseTimestamp = Date.now();
    for (let i = 0; i < count; i++) {
      sampleNews.push({
        id: baseTimestamp + i * 1000, // Ensure unique IDs by adding seconds
        title: titles[i % titles.length],
        summary: summaries[i % summaries.length],
        tag: tags[i % tags.length],
        date: new Date(Date.now() - (i * 86400000)).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        youtubeUrl: i % 3 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : ''
      });
    }
    
    if (onAddMultipleNews && sampleNews.length > 1) {
      onAddMultipleNews(sampleNews);
    } else {
      sampleNews.forEach(news => onAddNews(news));
    }
    addDebugLog('info', `Generated ${sampleNews.length} sample news items`);
    alert(`${sampleNews.length} sample news items generated!`);
  };

  const generatePerformanceTestData = () => {
    if (window.confirm('This will generate 100 news items for performance testing. Continue?')) {
      generateSampleData(100);
      setTimeout(() => {
        updateDebugData();
        addDebugLog('info', 'Performance test data generated - check performance metrics');
      }, 1000);
    }
  };

  const exportData = () => {
    const data = {
      newsItems,
      settings,
      debugLogs: debugLogs.slice(0, 10), // Export last 10 logs
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tesla-news-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addDebugLog('info', 'Data exported successfully');
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '□' },
    { id: 'news', name: 'News Management', icon: '+' },
    { id: 'settings', name: 'Settings', icon: '⚙' },
    { id: 'media', name: 'Media', icon: '▶' },
    { id: 'debug', name: 'Debug', icon: '◇' }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl font-bold text-white">+</span>
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-white/70">Total News</p>
              <p className="text-3xl font-bold text-white">{newsItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl font-bold text-white">▶</span>
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-white/70">With Videos</p>
              <p className="text-3xl font-bold text-white">
                {newsItems.filter(item => item.youtubeUrl).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl font-bold text-white">□</span>
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-white/70">This Month</p>
              <p className="text-3xl font-bold text-white">
                {newsItems.filter(item => {
                  const newsDate = new Date(item.date);
                  const currentDate = new Date();
                  return newsDate.getMonth() === currentDate.getMonth() && 
                         newsDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
        <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
          <span className="text-2xl">📰</span>
          Recent News
        </h3>
        <div className="space-y-4">
          {newsItems.slice(0, 3).map((item, index) => (
            <div key={item.id || index} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 hover:bg-white/15 hover:scale-102 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-red-100 transition-colors">{item.title}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-white/70 bg-white/10 px-2 py-1 rounded-full">
                      📅 {item.date}
                    </span>
                    <span className="text-xs text-white bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 rounded-full">
                      {item.tag}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleEditNews(item)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-white/30 hover:scale-105"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNewsManagement = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Add/Edit News Form */}
      <div className="bg-white text-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">
          {editingNews ? 'Edit News' : 'Add New News'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Summary</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Tag</label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              placeholder="e.g., Autopilot, BatteryTech, Supercharger"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">YouTube URL (Optional)</label>
            <input
              type="url"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">News Type</label>
            <select
              name="sentiment"
              value={formData.sentiment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              required
            >
              <option value="positive">✅ Positive (Tesla Updates)</option>
              <option value="negative">⚠️ Critical (TESLAQ/Critics)</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Positive news appears on the right side, critical news on the left side of the timeline
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors"
            >
              {editingNews ? 'Update News' : 'Add News'}
            </button>
            {editingNews && (
              <button
                type="button"
                onClick={() => {
                  setEditingNews(null);
                  setFormData({
                    title: '',
                    summary: '',
                    tag: '',
                    date: new Date().toISOString().split('T')[0],
                    youtubeUrl: '',
                    sentiment: 'positive'
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* News List */}
      <div className="bg-white text-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">All News ({newsItems.length})</h2>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {newsItems.map((item, index) => (
            <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.tag}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditNews(item)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNews(item.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.summary}</p>
              {item.youtubeUrl && (
                <div className="text-xs text-blue-600">▶ Has Video</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Site Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Site Title</label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Default Tag</label>
            <input
              type="text"
              value={settings.defaultTag}
              onChange={(e) => setSettings({...settings, defaultTag: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Admin Password</label>
            <input
              type="password"
              value={settings.adminPassword}
              onChange={(e) => setSettings({...settings, adminPassword: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">Note: This is for demo purposes only</p>
          </div>
          
          <button className="bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">YouTube Videos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newsItems.filter(item => item.youtubeUrl).map((item, index) => (
            <div key={item.id || index} className="border rounded-lg p-4">
              <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-600">▶</span>
              </div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{item.date}</p>
              <a 
                href={item.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                View on YouTube
              </a>
            </div>
          ))}
        </div>
        
        {newsItems.filter(item => item.youtubeUrl).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2 font-bold">▶</span>
            <p>No YouTube videos found</p>
            <p className="text-sm">Add YouTube URLs to your news items to see them here</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Media Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">
              {newsItems.filter(item => item.youtubeUrl).length}
            </div>
            <div className="text-sm text-gray-600">YouTube Videos</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">
              {Math.round((newsItems.filter(item => item.youtubeUrl).length / newsItems.length) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600">News with Media</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDebug = () => (
    <div className="space-y-6">
      {/* Development Tools */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-800">⚙ Development Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => generateSampleData(3)}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Generate Sample Data
          </button>
          
          <button
            onClick={generatePerformanceTestData}
            className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            ⚡ Performance Test (100 items)
          </button>
          
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            ↓ Export Data
          </button>
          
          <button
            onClick={() => {
              updateDebugData();
              addDebugLog('info', 'Debug data refreshed');
            }}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ↻ Refresh Data
          </button>
        </div>
        
        <div className="border-t pt-4">
          <button
            onClick={clearAllData}
            className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            × Clear All Data (Danger)
          </button>
          <p className="text-sm text-gray-600 mt-2">This will remove all news items, settings, and login state</p>
        </div>
      </div>

      {/* Data Inspector */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-800">◇ Data Inspector</h2>
        
        <div className="space-y-4">
          {/* News Items */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">News Items ({newsItems.length})</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(newsItems, null, 2)}
              </pre>
            </div>
          </div>
          
          {/* LocalStorage */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">LocalStorage</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(debugData.localStorage, null, 2)}
              </pre>
            </div>
          </div>
          
          {/* SessionStorage */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">SessionStorage</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(debugData.sessionStorage, null, 2)}
              </pre>
            </div>
          </div>
          
          {/* Environment Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Environment</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(debugData.environment, null, 2)}
              </pre>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Performance Metrics</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(debugData.performance, null, 2)}
              </pre>
            </div>
            {debugData.performance?.recommendations?.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Performance Recommendations:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {debugData.performance.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Logging */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">□ Error Logging</h2>
          <div className="flex gap-2">
            <button
              onClick={() => addDebugLog('info', 'Test info message')}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Test Info
            </button>
            <button
              onClick={() => addDebugLog('warning', 'Test warning message')}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
            >
              Test Warning
            </button>
            <button
              onClick={() => addDebugLog('error', 'Test error message')}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Test Error
            </button>
            <button
              onClick={() => setDebugLogs([])}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-auto">
          {debugLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2 font-bold">□</span>
              <p>No logs captured yet</p>
              <p className="text-sm">Errors and warnings will appear here automatically</p>
            </div>
          ) : (
            debugLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border-l-4 ${
                  log.type === 'error'
                    ? 'bg-red-50 border-red-500 text-red-800'
                    : log.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                    : 'bg-blue-50 border-blue-500 text-blue-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium uppercase">{log.type}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-sm font-mono">{log.message}</div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Auto-captured:</strong> Console errors, warnings, unhandled exceptions<br/>
            <strong>Manual:</strong> Use test buttons to simulate different log types<br/>
            <strong>Storage:</strong> Last 100 logs are kept in memory
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'news':
        return renderNewsManagement();
      case 'settings':
        return renderSettings();
      case 'media':
        return renderMedia();
      case 'debug':
        return renderDebug();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Enhanced Header */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl mb-8 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                Tesla News Admin Panel
              </h1>
              <p className="text-lg text-white/80 mt-2">Manage your news timeline and content</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 font-medium border border-white/20 shadow-lg"
              >
                <span className="mr-2">🏠</span>
                View Timeline
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-red-700/80 transition-all duration-200 font-medium border border-red-400/30 shadow-lg"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-2 mb-8 shadow-xl">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-fit flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? 'bg-white text-red-700 shadow-lg scale-105 border border-red-200/50'
                    : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-102 border border-transparent'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline text-sm">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="text-gray-800">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}