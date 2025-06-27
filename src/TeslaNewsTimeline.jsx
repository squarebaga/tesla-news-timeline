import React from "react";
import { useNavigate } from 'react-router-dom';

export default function TeslaNewsTimeline({ newsItems }) {
  const navigate = useNavigate();
  return (
    <div className="bg-red-700 min-h-screen p-6 text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">TeslaNews Timeline</h1>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-red-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Admin Login
          </button>
        </div>
        <div className="relative border-l-2 border-white pl-6">
          {newsItems.map((item, index) => (
            <div key={index} className="mb-12 relative">
              <div className="absolute left-[-12px] top-1 w-3 h-3 bg-white rounded-full"></div>
              <p className="text-sm text-white/70">{item.date} <span className="ml-2 text-xs font-medium bg-white/10 px-2 py-1 rounded">{item.tag}</span></p>
              <h2 className="text-xl font-semibold mt-2">{item.title}</h2>
              <p className="text-white/90 mt-1">{item.summary}</p>
              <a href="#" className="text-white underline mt-2 inline-block">Read More</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
