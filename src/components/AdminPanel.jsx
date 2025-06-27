import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel({ newsItems, onAddNews, onLogout }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    tag: '',
    date: new Date().toISOString().split('T')[0],
    youtubeUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newNews = {
      id: Date.now(),
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
    
    onAddNews(newNews);
    
    // Clear form
    setFormData({
      title: '',
      summary: '',
      tag: '',
      date: new Date().toISOString().split('T')[0],
      youtubeUrl: ''
    });
    
    alert('News added successfully!');
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

  return (
    <div className="bg-red-700 min-h-screen p-6 text-white">
      <div className="max-w-4xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add News Form */}
          <div className="bg-white text-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Add New News</h2>
            
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
              
              <button
                type="submit"
                className="w-full bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors"
              >
                Add News
              </button>
            </form>
          </div>

          {/* News List */}
          <div className="bg-white text-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Current News ({newsItems.length})</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {newsItems.map((item, index) => (
                <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.tag}</span>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}