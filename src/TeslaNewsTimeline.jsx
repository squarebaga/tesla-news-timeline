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
    setSelectedDate('');
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

        {/* Month Navigation */}
        {newsItems.length > 0 && (
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Jump to Month:</label>
                <select
                  value={selectedDate}
                  onChange={(e) => jumpToMonth(e.target.value)}
                  className="bg-white text-red-700 px-3 py-2 rounded text-sm border-0 focus:ring-2 focus:ring-white/50 w-full sm:w-auto min-w-[200px]"
                >
                  <option value="">Select a month...</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(month + '-01').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long'
                      })} ({monthIndex.monthStats.get(month)} news)
                    </option>
                  ))}
                </select>
              </div>
              
              {dateRange && (
                <div className="text-sm text-white/80">
                  <div className="text-xs uppercase tracking-wide mb-1">Timeline Span</div>
                  <div>{dateRange.earliest} → {dateRange.latest}</div>
                  <div className="text-xs text-white/60">{dateRange.span} days • {newsItems.length} total news</div>
                </div>
              )}
            </div>
            
            {/* Quick month buttons for recent months */}
            {availableMonths.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-white/70 self-center mr-2">Quick jump:</span>
                {availableMonths.slice(0, 6).map(month => (
                  <button
                    key={month}
                    onClick={() => jumpToMonth(month)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      selectedDate === month
                        ? 'bg-white text-red-700 font-medium'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    <span className="ml-1 text-[10px]">({monthIndex.monthStats.get(month)})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Performance Stats */}
        {newsItems.length > 20 && (
          <div className="mb-4 text-center text-white/60 text-sm">
            Showing {visibleCount} of {newsItems.length} news items • Scroll to load more
          </div>
        )}
        
        <div ref={timelineRef} className="relative border-l-2 border-white pl-6">
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
