import React, { useEffect, useState } from 'react';
import { CanvasProps } from './types';

interface SessionData {
  post_id: string;
  user_id?: number;
  post_info: {
    post_id: string;
    user_short_profile: {
      user_id: number;
      username: string;
      profile_picture_url: string | null;
      role: string;
    };
    banner_image?: string;
  };
  post_content: {
    post_topic_text: string;
    discussion_post_image_url: string;
    discussion_date_time?: string;
    discussion_start_date_time: string;
    discussion_end_date_time: string | number;
    duration: string;
    categories: { id: number; name: string }[];
    interested_participants: {
      participants_count: number;
      profile_thumbnail_image?: any[];
    };
    discussion_url?: string;
    external_url?: string;
    youtube_url?: string;
    location?: string;
  };
  status: string;
  discussion_id: string;
  is_draft?: boolean;
  women_only?: boolean;
  payment_status?: string;
  user_transactions?: {
    pre_amount: number;
    act_amount: number;
    currency: string;
    discount: string;
  };
}

interface SessionResponse {
  response_code: number;
  message: string;
  pagination?: {
    page_number: string;
    total_pages: number;
    total_items: number;
  };
  body: SessionData[];
}

// Category mapping for Herkey session types
const CATEGORY_MAPPING: Record<number, string> = {
  0: "Webinar",
  1: "Workshop",
  2: "Mentorship Session",
  3: "Panel Discussion",
  4: "Interview",
  5: "AMA Session",
  6: "Community Event",
  7: "Networking Event",
  8: "Course",
  9: "Training Program",
  10: "Conference",
  11: "Job Fair",
  12: "Hackathon",
  13: "Career Fair",
  14: "Bootcamp"
};

const getCategoryName = (categoryId: number | string): string => {
  const id = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  return CATEGORY_MAPPING[id] || `Category ${categoryId}`;
};

const SessionCanvas: React.FC<CanvasProps> = ({ message, onClose }) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Category options for filtering
  const categoryOptions = Object.entries(CATEGORY_MAPPING).map(([id, name]) => ({
    value: parseInt(id, 10),
    label: name
  }));

  useEffect(() => {
    // First check if we have session_results provided directly from backend
    if (message.canvasUtils?.session_results && Array.isArray(message.canvasUtils.session_results)) {
      setSessions(message.canvasUtils.session_results);
      setFilteredSessions(message.canvasUtils.session_results);
      return;
    }
    
    // If no session_results, try to fetch sessions using session_link and token
    const fetchSessions = async () => {
      if (!message.canvasUtils?.session_link) return;
      
      setLoading(true);
      setError(null);

      try {
        // Get the session ID from provided token or fetch a new one
        let sessionId = message.canvasUtils?.session_api;
        
        if (!sessionId) {
          const sessionResponse = await fetch('https://api-prod.herkey.com/api/v1/herkey/generate-session');
          const sessionData = await sessionResponse.json();
          
          if (!sessionData.success) {
            throw new Error('Failed to get authorization token');
          }
          
          sessionId = sessionData.body.session_id;
        }
        
        setSessionId(sessionId);
        
        // Now fetch the sessions with the authorization header
        const sessionResponse = await fetch(message.canvasUtils.session_link, {
          headers: {
            'Authorization': `Token ${sessionId}`
          }
        });
        
        const sessionData: SessionResponse = await sessionResponse.json();
        console.log('Session Data:', sessionResponse, sessionData);
        
        if (!sessionData.body || !Array.isArray(sessionData.body)) {
          throw new Error('Invalid response format from sessions API');
        }
        
        // Filter out past sessions
        const currentDate = new Date();
        const validSessions = sessionData.body.filter(session => {
          // If session has an end_date_time field, check if it's still valid
          if (session.post_content.discussion_end_date_time && false) {
            const endDate = new Date(session.post_content.discussion_end_date_time);
            return endDate > currentDate;
          }
          return true; // If no end date, include the session
        });
        
        setSessions(validSessions);
        setFilteredSessions(validSessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [message.canvasUtils]);

  // Apply category filter when selectedCategory changes or sessions change
  useEffect(() => {
    if (selectedCategory !== null) {
      const filtered = sessions.filter(session => {
        // Handle case where categories is a number array
        if (Array.isArray(session.post_content.categories)) {
          return session.post_content.categories.some(cat => {
            const categoryId = typeof cat === 'string' ? parseInt(cat, 10) : cat;
            return categoryId === selectedCategory;
          });
        }
        // Handle case where categories is a string (comma-separated)
        else if (typeof session.post_content.categories === 'string') {
          const categoryIds = (session.post_content.categories as string).split(',')
            .map((id: string) => parseInt(id.trim(), 10))
            .filter((id: number) => !isNaN(id));
          return categoryIds.includes(selectedCategory);
        }
        return false;
      });
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions(sessions);
    }
  }, [selectedCategory, sessions]);

  // Handle filter selection
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCategory(value === "" ? null : parseInt(value, 10));
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Get session URL
  const getSessionUrl = (session: SessionData): string => {
    // Try different URL fields in order of preference
    if (session.post_content.discussion_url) return session.post_content.discussion_url;
    if (session.post_content.external_url) return session.post_content.external_url;
    if (session.post_content.youtube_url) return session.post_content.youtube_url;
    
    // If none of the above, construct URL from post_id
    if (session.post_info?.post_id) {
      return `https://www.herkey.com/sessions/${session.post_info.post_id}`;
    }
    
    // Fallback
    return 'https://www.herkey.com/sessions';
  };
  
  // Convert category IDs to human-readable names
  const getCategoryLabels = (categories: any): string[] => {
    if (!categories) return [];

    // If categories is an array of objects with 'id' and 'name'
    if (Array.isArray(categories) && categories.length > 0 && typeof categories[0] === 'object' && categories[0] !== null && 'name' in categories[0]) {
      return categories.map((cat: { id: number; name: string }) => cat.name || getCategoryName(cat.id));
    }

    // If categories is an array of ids (number or string)
    if (Array.isArray(categories)) {
      return categories.map(cat => {
        const catId = typeof cat === 'string' ? parseInt(cat, 10) : cat;
        return getCategoryName(catId);
      });
    }

    // If categories is a comma-separated string
    if (typeof categories === 'string') {
      return categories.split(',')
        .map(cat => cat.trim())
        .filter(cat => cat !== '')
        .map(cat => getCategoryName(parseInt(cat, 10)));
    }

    return [];
  };

  return (
    <div className="canvas-panel session-canvas">
      <div className="canvas-header">
        <h3>Event & Session Results</h3>
      </div>
      
      {loading && (
        <div className="loading">
          <div className="loading-text">Loading sessions...</div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <a 
            href={message.canvasUtils?.session_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="error-link"
          >
            Try viewing sessions directly
          </a>
        </div>
      )}
      
      {!loading && !error && sessions.length === 0 && (
        <div className="no-results">
          <p>No upcoming sessions found.</p>
          <a 
            href="https://www.herkey.com/sessions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="error-link"
          >
            Browse all sessions on Herkey
          </a>
        </div>
      )}
      
      {!loading && !error && sessions.length > 0 && (
        <>
          <div className="filter-dropdown">
            <label htmlFor="category-filter">Filter by: </label>
            <select 
              id="category-filter" 
              value={selectedCategory === null ? "" : selectedCategory.toString()}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Event Types</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value.toString()}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {filteredSessions.length === 0 && (
            <div className="no-filter-results">
              <p>No sessions match the selected filter.</p>
              <button 
                className="clear-filter-button"
                onClick={() => setSelectedCategory(null)}
              >
                Clear Filter
              </button>
            </div>
          )}
          
          <div className="session-list">
            {filteredSessions.map((session, index) => (
              <div 
                key={index} 
                className="session-card" 
                onClick={() => window.open(getSessionUrl(session), '_blank')}
              >
                {session.post_content.discussion_post_image_url && (
                  <div className="session-image">
                    <img 
                      src={session.post_content.discussion_post_image_url} 
                      alt={session.post_content.post_topic_text || 'Session image'} 
                      className="session-img" 
                    />
                  </div>
                )}
                
                <div className="session-content">
                  <h4 className="session-title">{session.post_content.post_topic_text || 'Upcoming Session'}</h4>
                  
                  <div className="session-host">
                    Hosted by: {session.post_info.user_short_profile.username || 'Herkey'}
                  </div>
                  
                  <div className="session-time">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#7f8c8d"/>
                    </svg>
                    {session.post_content.discussion_start_date_time ? formatDate(session.post_content.discussion_start_date_time) : 'Date TBD'}
                  </div>

                  <div className="session-duration">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#7f8c8d"/>
                    </svg>
                    Duration: {session.post_content.duration || 'Not specified'}
                  </div>
                  
                  {session.post_content.interested_participants?.participants_count > 0 && (
                    <div className="session-attendees">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#7f8c8d"/>
                      </svg>
                      {session.post_content.interested_participants.participants_count} attending
                    </div>
                  )}
                  
                  <div className="session-categories">



                    {getCategoryLabels(session.post_content.categories).slice(0, 2).map((category, i) => (
                      <span key={i} className="category-tag">
                        {category}
                      </span>
                    ))}
                    {/* {getCategoryLabels(session.post_content.categories).length > 2 && (
                      <span className="category-tag more-categories">
                        +{getCategoryLabels(session.post_content.categories).length - 2}
                      </span>
                    )} */}
                  </div>
                  
                  <div className="session-status">
                    Status: <span className={`status-${session.status?.toLowerCase()}`}>{session.status}</span>
                  </div>
                  
                  <button 
                    className="session-register-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(getSessionUrl(session), '_blank');
                    }}
                  >
                    Join now
                  </button>
                </div>
              </div>
            ))}

          </div>
          
          <a 
            href="https://www.herkey.com/sessions" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="view-all-sessions"
          >
            View All Sessions
          </a>
        </>
      )}
    </div>
  );
};

export default SessionCanvas;