import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

function LazyYouTubeEmbed({ url }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

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
    <div ref={ref} className="mt-4 mb-4">
      {!isVisible ? (
        <div className="w-full h-[200px] bg-gray-200 rounded-lg flex items-center justify-center max-w-md">
          <span className="text-gray-500 text-sm">Loading video...</span>
        </div>
      ) : !isLoaded ? (
        <div 
          className="w-full h-[200px] bg-gray-800 rounded-lg flex items-center justify-center max-w-md cursor-pointer relative"
          onClick={() => setIsLoaded(true)}
        >
          <div className="text-center text-white">
            <div className="text-4xl mb-2">▶</div>
            <div className="text-sm">Click to load video</div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}

// Virtual scrolling news item component
function VirtualNewsItem({ item, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.1,
        rootMargin: '100px 0px' // Load items 100px before they come into view
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mb-12 relative min-h-[200px]">
      <div className="absolute left-[-12px] top-1 w-3 h-3 bg-white rounded-full"></div>
      {isVisible ? (
        <>
          <p className="text-sm text-white/70">
            {item.date} <span className="ml-2 text-xs font-medium bg-white/10 px-2 py-1 rounded">{item.tag}</span>
          </p>
          <h2 className="text-xl font-semibold mt-2">{item.title}</h2>
          <p className="text-white/90 mt-1">{item.summary}</p>
          {item.youtubeUrl && <LazyYouTubeEmbed url={item.youtubeUrl} />}
          <a href="#" className="text-white underline mt-2 inline-block">Read More</a>
        </>
      ) : (
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-32 mb-2"></div>
          <div className="h-6 bg-white/20 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-full mb-1"></div>
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
        </div>
      )}
    </div>
  );
}

export default function TeslaNewsTimeline({ newsItems, isLoggedIn }) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(20); // Start with 20 items
  const loadMoreRef = useRef();

  // Infinite scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < newsItems.length) {
          setVisibleCount(prev => Math.min(prev + 10, newsItems.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, newsItems.length]);

  // Reset visible count when newsItems change significantly
  useEffect(() => {
    setVisibleCount(20);
  }, [newsItems.length]);

  const visibleItems = useMemo(() => 
    newsItems.slice(0, visibleCount), 
    [newsItems, visibleCount]
  );
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
        
        {/* Performance Stats */}
        {newsItems.length > 20 && (
          <div className="mb-4 text-center text-white/60 text-sm">
            Showing {visibleCount} of {newsItems.length} news items • Scroll to load more
          </div>
        )}
        
        <div className="relative border-l-2 border-white pl-6">
          {visibleItems.map((item, index) => (
            <VirtualNewsItem key={item.id || index} item={item} index={index} />
          ))}
          
          {/* Infinite scroll trigger */}
          {visibleCount < newsItems.length && (
            <div ref={loadMoreRef} className="py-8 text-center">
              <div className="inline-flex items-center gap-2 text-white/60 text-sm">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Loading more news...
              </div>
            </div>
          )}
          
          {/* End indicator */}
          {visibleCount >= newsItems.length && newsItems.length > 20 && (
            <div className="py-8 text-center text-white/60 text-sm">
              🎉 You've reached the end! {newsItems.length} total news items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
