import React from "react";
import { useNavigate } from 'react-router-dom';

function YouTubeEmbed({ url }) {
  if (!url) return null;
  
  // Extract YouTube video ID from various URL formats
  const getVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const videoId = getVideoId(url);
  if (!videoId) return null;
  
  return (
    <div className="mt-4 mb-4">
      <iframe
        width="100%"
        height="200"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="rounded-lg max-w-md"
      ></iframe>
    </div>
  );
}

export default function TeslaNewsTimeline({ newsItems, isLoggedIn }) {
  const navigate = useNavigate();
  return (
    <div className="bg-red-700 min-h-screen p-6 text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">TeslaNews Timeline</h1>
          {!isLoggedIn ? (
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-red-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Admin Login
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin')}
              className="bg-white text-red-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Admin Panel
            </button>
          )}
        </div>
        <div className="relative border-l-2 border-white pl-6">
          {newsItems.map((item, index) => (
            <div key={index} className="mb-12 relative">
              <div className="absolute left-[-12px] top-1 w-3 h-3 bg-white rounded-full"></div>
              <p className="text-sm text-white/70">{item.date} <span className="ml-2 text-xs font-medium bg-white/10 px-2 py-1 rounded">{item.tag}</span></p>
              <h2 className="text-xl font-semibold mt-2">{item.title}</h2>
              <p className="text-white/90 mt-1">{item.summary}</p>
              {item.youtubeUrl && <YouTubeEmbed url={item.youtubeUrl} />}
              <a href="#" className="text-white underline mt-2 inline-block">Read More</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
