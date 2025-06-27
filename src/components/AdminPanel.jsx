import React, { useState } from 'react';
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

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'news', name: 'News Management', icon: '📰' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'media', name: 'Media', icon: '🎬' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📰</span>
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
              <span className="text-2xl">🎬</span>
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
              <span className="text-2xl">📅</span>
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
                <div className="text-xs text-blue-600">📹 Has Video</div>
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
                <span className="text-4xl">🎬</span>
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
            <span className="text-4xl block mb-2">📹</span>
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