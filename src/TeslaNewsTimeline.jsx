import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

const LazyYouTubeEmbed = React.memo(({ url }) => {
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
      { threshold: 0.2 } // Higher threshold for better performance
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
});

// Optimized virtual scrolling news item component with memoization
const VirtualNewsItem = React.memo(({ item, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Debounce visibility changes to reduce re-renders
        if (entry.isIntersecting !== isVisible) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { 
        threshold: 0.05, // Reduced threshold for better performance
        rootMargin: '50px 0px' // Reduced margin to load less content ahead
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]); // Add dependency to prevent unnecessary re-observations

  return (
    <div ref={ref} className="mb-8 relative min-h-[200px]">
      {/* Simplified timeline marker for better performance */}
      <div className="absolute left-[-16px] top-6 w-4 h-4 bg-white rounded-full border-2 border-red-400/50"></div>
      
      {isVisible ? (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 will-change-transform hover:bg-white/8 hover:border-white/15 transition-colors duration-200">
          {/* Header with date and tag */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <time className="text-sm font-medium text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
              📅 {item.date}
            </time>
            <span className="text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-full">
              {item.tag}
            </span>
          </div>
          
          {/* Title with better typography */}
          <h2 className="text-xl font-bold text-white mb-3 leading-tight">
            {item.title}
          </h2>
          
          {/* Summary with improved readability */}
          <p className="text-white/90 leading-relaxed mb-4 text-sm">
            {item.summary}
          </p>
          
          {/* YouTube embed */}
          {item.youtubeUrl && <LazyYouTubeEmbed url={item.youtubeUrl} />}
          
          {/* Simplified read more section */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
            <a 
              href="#" 
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-sm bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl transition-colors duration-150"
            >
              <span>Read More</span>
              <span>→</span>
            </a>
            
            {/* Simplified share button */}
            <button className="inline-flex items-center gap-2 text-white/70 hover:text-white/90 text-sm px-3 py-2 rounded-xl hover:bg-white/10 transition-colors duration-150">
              <span>⚡</span>
              Share
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="h-6 bg-white/20 rounded-full w-24"></div>
            <div className="h-6 bg-white/20 rounded-full w-20"></div>
          </div>
          <div className="h-7 bg-white/20 rounded-lg w-3/4 mb-3"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
          </div>
          <div className="h-10 bg-white/20 rounded-xl w-32"></div>
        </div>
      )}
    </div>
  );
});

export default function TeslaNewsTimeline({ newsItems, isLoggedIn }) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedDate, setSelectedDate] = useState('');
  const [jumpToIndex, setJumpToIndex] = useState(null);
  const loadMoreRef = useRef();
  const timelineRef = useRef();

  // Create month index for quick lookups
  const monthIndex = useMemo(() => {
    const index = new Map();
    const monthStats = new Map();
    
    newsItems.forEach((item, idx) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!index.has(monthKey)) {
        index.set(monthKey, []);
      }
      index.set(monthKey, [...index.get(monthKey), { item, index: idx }]);
      
      // Count items per month
      monthStats.set(monthKey, (monthStats.get(monthKey) || 0) + 1);
    });
    
    return { index, monthStats };
  }, [newsItems]);

  // Get available months sorted
  const availableMonths = useMemo(() => {
    return Array.from(monthIndex.monthStats.keys()).sort((a, b) => {
      return new Date(b + '-01') - new Date(a + '-01'); // Most recent first
    });
  }, [monthIndex]);

  // Date range info
  const dateRange = useMemo(() => {
    if (newsItems.length === 0) return null;
    const dates = newsItems.map(item => new Date(item.date)).sort((a, b) => a - b);
    return {
      earliest: dates[0].toLocaleDateString(),
      latest: dates[dates.length - 1].toLocaleDateString(),
      span: Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24))
    };
  }, [newsItems]);

  // Jump to specific month
  const jumpToMonth = useCallback((targetMonth) => {
    if (!targetMonth || !monthIndex.index.has(targetMonth)) return;
    
    const firstItemForMonth = monthIndex.index.get(targetMonth)[0];
    const targetIndex = firstItemForMonth.index;
    
    // Ensure enough items are visible
    if (targetIndex >= visibleCount) {
      setVisibleCount(Math.max(targetIndex + 10, visibleCount));
    }
    
    setJumpToIndex(targetIndex);
    setSelectedDate(targetMonth);
  }, [monthIndex, visibleCount]);

  // Scroll to target item when jumpToIndex changes
  useEffect(() => {
    if (jumpToIndex !== null && timelineRef.current) {
      const timelineItems = timelineRef.current.children;
      if (timelineItems[jumpToIndex]) {
        timelineItems[jumpToIndex].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Highlight the target item temporarily
        const targetElement = timelineItems[jumpToIndex];
        targetElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        targetElement.style.borderRadius = '8px';
        targetElement.style.padding = '16px';
        targetElement.style.marginLeft = '-16px';
        targetElement.style.marginRight = '-16px';
        
        setTimeout(() => {
          targetElement.style.backgroundColor = '';
          targetElement.style.borderRadius = '';
          targetElement.style.padding = '';
          targetElement.style.marginLeft = '';
          targetElement.style.marginRight = '';
        }, 2000);
      }
      setJumpToIndex(null);
    }
  }, [jumpToIndex]);

  // Optimized infinite scroll effect with throttling
  useEffect(() => {
    let timeoutId;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < newsItems.length) {
          // Throttle the scroll loading to reduce rapid re-renders
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + 15, newsItems.length)); // Load more items at once
          }, 100); // Small delay to batch multiple scroll events
        }
      },
      { threshold: 0.3 } // Higher threshold to load less aggressively
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visibleCount, newsItems.length]);

  // Reset visible count when newsItems change significantly
  useEffect(() => {
    setVisibleCount(20);
    setSelectedDate('');
  }, [newsItems.length]);

  const visibleItems = useMemo(() => 
    newsItems.slice(0, visibleCount), 
    [newsItems, visibleCount]
  );
  return (
    <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 min-h-screen text-white font-sans">
      {/* Header Section */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                Tesla News
              </h1>
              <p className="text-lg text-white/80 mt-2">Latest updates from the Tesla ecosystem</p>
            </div>
            {!isLoggedIn ? (
              <button
                onClick={() => navigate('/login')}
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 text-sm font-medium border border-white/20 shadow-lg"
              >
                Admin Login
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin')}
                className="bg-white text-red-700 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 text-sm font-medium shadow-lg"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Month Navigation */}
        {newsItems.length > 0 && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white/90 flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      Navigate Timeline
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => jumpToMonth(e.target.value)}
                      className="bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm border border-white/20 focus:ring-2 focus:ring-white/30 focus:border-white/40 w-full sm:w-auto min-w-[250px] transition-all duration-200"
                    >
                      <option value="" className="text-gray-800">Select a month...</option>
                      {availableMonths.map(month => (
                        <option key={month} value={month} className="text-gray-800">
                          {new Date(month + '-01').toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long'
                          })} ({monthIndex.monthStats.get(month)} news)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Quick month buttons */}
                  {availableMonths.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-white/60 self-center mr-2 font-medium">Quick:</span>
                      {availableMonths.slice(0, 6).map(month => (
                        <button
                          key={month}
                          onClick={() => jumpToMonth(month)}
                          className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 font-medium ${
                            selectedDate === month
                              ? 'bg-white text-red-700 shadow-lg scale-105'
                              : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/20'
                          }`}
                        >
                          {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                          <span className="ml-1 text-[10px] opacity-70">({monthIndex.monthStats.get(month)})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {dateRange && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs uppercase tracking-wide mb-2 text-white/60 font-bold flex items-center gap-1">
                      <span>📊</span>
                      Timeline Stats
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{dateRange.earliest} → {dateRange.latest}</div>
                    <div className="text-xs text-white/70">
                      <span className="bg-white/10 px-2 py-1 rounded-full mr-2">{dateRange.span} days</span>
                      <span className="bg-white/10 px-2 py-1 rounded-full">{newsItems.length} news</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Performance Stats */}
        {newsItems.length > 20 && (
          <div className="mb-4 text-center text-white/60 text-sm">
            Showing {visibleCount} of {newsItems.length} news items • Scroll to load more
          </div>
        )}
        
        <div ref={timelineRef} className="relative">
          {/* Enhanced timeline line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/80 via-white/40 to-white/20 rounded-full shadow-sm"></div>
          
          <div className="pl-8">
            {visibleItems.map((item, index) => (
              <VirtualNewsItem key={item.id || index} item={item} index={index} />
            ))}
            
            {/* Infinite scroll trigger */}
            {visibleCount < newsItems.length && (
              <div ref={loadMoreRef} className="py-8 text-center">
                <div className="inline-flex items-center gap-3 text-white/60 text-sm bg-white/5 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="font-medium">Loading more news...</span>
                </div>
              </div>
            )}
            
            {/* End indicator */}
            {visibleCount >= newsItems.length && newsItems.length > 20 && (
              <div className="py-8 text-center">
                <div className="inline-flex items-center gap-2 text-white/70 text-sm bg-white/5 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
                  <span className="text-lg">🎉</span>
                  <span className="font-medium">You've reached the end! {newsItems.length} total news items</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
