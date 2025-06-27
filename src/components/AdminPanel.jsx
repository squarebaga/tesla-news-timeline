import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel({ newsItems, onAddNews, onUpdateNews, onDeleteNews, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    tag: '',
    date: new Date().toISOString().split('T')[0],
    youtubeUrl: ''
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
    environment: {}
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
      youtubeUrl: formData.youtubeUrl
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
      youtubeUrl: ''
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
      youtubeUrl: news.youtubeUrl || ''
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
    
    setDebugData({ localStorage, sessionStorage, environment });
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ This will clear ALL data including news items and login state. Are you sure?')) {
      window.localStorage.clear();
      window.sessionStorage.clear();
      addDebugLog('info', 'All data cleared');
      alert('All data cleared! Please refresh the page.');
    }
  };

  const generateSampleData = () => {
    const sampleNews = [
      {
        id: Date.now() + 1,
        title: 'Tesla Cybertruck Production Update',
        summary: 'Tesla announces significant progress in Cybertruck production at the Austin Gigafactory.',
        tag: '#Cybertruck',
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: Date.now() + 2,
        title: 'New Supercharger V4 Rollout',
        summary: 'Tesla begins deployment of faster Supercharger V4 stations across major highways.',
        tag: '#Supercharger',
        date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        youtubeUrl: ''
      },
      {
        id: Date.now() + 3,
        title: 'AI Day 2025 Announcement',
        summary: 'Tesla reveals breakthrough in neural network architecture for FSD computers.',
        tag: '#AI',
        date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ];
    
    sampleNews.forEach(news => onAddNews(news));
    addDebugLog('info', `Generated ${sampleNews.length} sample news items`);
    alert('Sample data generated!');
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl font-bold text-blue-600">+</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total News</p>
              <p className="text-2xl font-bold text-gray-900">{newsItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl font-bold text-green-600">▶</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Videos</p>
              <p className="text-2xl font-bold text-gray-900">
                {newsItems.filter(item => item.youtubeUrl).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl font-bold text-purple-600">□</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
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

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent News</h3>
        <div className="space-y-3">
          {newsItems.slice(0, 3).map((item, index) => (
            <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">{item.date} • {item.tag}</p>
              </div>
              <button
                onClick={() => handleEditNews(item)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
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
          
          <div className="mb-6">
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
                    youtubeUrl: ''
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={generateSampleData}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Generate Sample Data
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
    <div className="bg-red-700 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tesla News Admin Panel</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-white text-red-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              View Timeline
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 rounded-lg p-1 mb-8">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-red-700 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
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