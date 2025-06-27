import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple hardcoded authentication (you can change these credentials)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'tesla123';
    
    if (formData.username === ADMIN_USERNAME && formData.password === ADMIN_PASSWORD) {
      onLogin();
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="bg-red-700 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors"
          >
            Login
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-red-700 hover:text-red-800 underline"
          >
            Back to Timeline
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Default credentials: admin / tesla123
        </div>
      </div>
    </div>
  );
}