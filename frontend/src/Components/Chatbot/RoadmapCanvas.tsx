import React, { useState } from 'react';
import { CanvasProps, RoadmapItem } from './types';
import './styles/RoadmapCanvas.css';
import CalendarServiceDialog from './CalendarServiceDialog';

const RoadmapCanvas: React.FC<CanvasProps> = ({ message }) => {
  const [showCalendarDialog, setShowCalendarDialog] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Early return if no roadmap data is available
  if (!message.canvasUtils?.roadmap || !Array.isArray(message.canvasUtils.roadmap)) {
    return (
      <div className="canvas-panel roadmap-canvas">
        <div className="canvas-header">
          <h3>Career Roadmap</h3>
        </div>
        <p>No roadmap data available.</p>
      </div>
    );
  }

  const roadmapItems: RoadmapItem[] = message.canvasUtils.roadmap;
  
  // Get the date of the next day
  const getNextDay = (): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9 AM
    return tomorrow;
  };
  
  // Format date for calendar
  const formatDate = (date: Date): string => {
    return date.toISOString().split('.')[0];
  };
  
  // Generate a unique ID for calendar events
  const generateEventId = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleCalendarServiceSelect = async (service: 'google' | 'outlook' | 'ics') => {
    try {
      setIsProcessing(true);
      setShowCalendarDialog(false);
      
      const startDate = getNextDay();
      
      if (service === 'google') {
        await addToGoogleCalendar(startDate);
      } else if (service === 'outlook') {
        await addToOutlookCalendar(startDate);
      } else {
        await downloadIcsFile(startDate);
      }
    } catch (error) {
      console.error("Error processing calendar action:", error);
      alert("There was an error with the calendar operation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const addToGoogleCalendar = async (startDate: Date) => {
    try {
      // Create a single event with a comprehensive description of all roadmap items
      const firstItem = roadmapItems[0];
      
      const eventDate = new Date(startDate);
      const endDate = new Date(eventDate);
      
      // Set the end date to cover the entire roadmap period
      endDate.setDate(endDate.getDate() + roadmapItems.length - 1);
      endDate.setHours(17, 0, 0, 0); // End at 5 PM on the last day
      
      // Create the Google Calendar URL
      const googleUrl = new URL('https://calendar.google.com/calendar/render');
      googleUrl.searchParams.append('action', 'TEMPLATE');
      googleUrl.searchParams.append('text', `Career Roadmap: ${firstItem.title.split(':')[0] || 'Development Plan'}`);
      
      // Create a comprehensive description that includes all roadmap items
      let fullDetails = "Career Development Roadmap\n\n";
      roadmapItems.forEach((item, index) => {
        fullDetails += `PHASE ${index + 1}: ${item.title}\n`;
        fullDetails += `${item.description}\n`;
        fullDetails += `Resource: ${item.link}\n\n`;
      });
      
      googleUrl.searchParams.append('details', fullDetails);
      googleUrl.searchParams.append('dates', `${formatDate(eventDate).replace(/[-:]/g, '')}/${formatDate(endDate).replace(/[-:]/g, '')}`);
      
      // Open only one tab
      window.open(googleUrl.toString(), '_blank');
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      throw error;
    }
  };
  
  const addToOutlookCalendar = async (startDate: Date) => {
    try {
      // Similar approach, one event with all roadmap phases
      const firstItem = roadmapItems[0];
      
      const eventDate = new Date(startDate);
      const endDate = new Date(eventDate);
      
      // Set the end date to cover the entire roadmap period
      endDate.setDate(endDate.getDate() + roadmapItems.length - 1);
      endDate.setHours(17, 0, 0, 0); // End at 5 PM on the last day
      
      const outlookUrl = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
      const params = new URLSearchParams();
      
      params.append('subject', `Career Roadmap: ${firstItem.title.split(':')[0] || 'Development Plan'}`);
      
      // Create a comprehensive description that includes all roadmap items
      let fullDetails = "Career Development Roadmap\n\n";
      roadmapItems.forEach((item, index) => {
        fullDetails += `PHASE ${index + 1}: ${item.title}\n`;
        fullDetails += `${item.description}\n`;
        fullDetails += `Resource: ${item.link}\n\n`;
      });
      
      params.append('body', fullDetails);
      params.append('startdt', formatDate(eventDate));
      params.append('enddt', formatDate(endDate));
      params.append('path', '/calendar/action/compose');
      
      // Open only one tab
      window.open(`${outlookUrl}?${params.toString()}`, '_blank');
    } catch (error) {
      console.error("Error creating Outlook event:", error);
      throw error;
    }
  };
  
  const downloadIcsFile = async (startDate: Date): Promise<void> => {
    try {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AskAsha//Career Roadmap//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];
      
      // Create individual events for each roadmap item
      roadmapItems.forEach((item, index) => {
        const eventDate = new Date(startDate);
        eventDate.setDate(eventDate.getDate() + index); // Each item gets its own day
        
        const endDate = new Date(eventDate);
        endDate.setHours(endDate.getHours() + 2); // 2 hour event
        
        const eventId = generateEventId();
        const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const startDateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const title = item.calendar_event || item.title;
        const description = item.description.replace(/\n/g, '\\n');
        
        icsContent = icsContent.concat([
          'BEGIN:VEVENT',
          `UID:${eventId}@askasha.com`,
          `DTSTAMP:${now}`,
          `DTSTART:${startDateStr}`,
          `DTEND:${endDateStr}`,
          `SUMMARY:${title}`,
          `DESCRIPTION:${description}\\n\\nResource: ${item.link}`,
          `URL:${item.link}`,
          'END:VEVENT'
        ]);
      });
      
      icsContent.push('END:VCALENDAR');
      
      // Create and download the .ics file
      const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Create a hidden link element to trigger download
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = 'career_roadmap.ics';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating ICS file:", error);
      return Promise.reject(error);
    }
  };

  return (
    <div className="canvas-panel roadmap-canvas">
      {showCalendarDialog && (
        <CalendarServiceDialog 
          onClose={() => setShowCalendarDialog(false)} 
          onSelect={handleCalendarServiceSelect} 
        />
      )}
      
      <div className="canvas-header">
        <h3>Career Roadmap</h3>
        <button 
          type="button"
          className="add-to-calendar-button"
          onClick={() => setShowCalendarDialog(true)}
          disabled={isProcessing}
          title="Add all roadmap items to your calendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {isProcessing ? 'Processing...' : 'Add to Calendar'}
        </button>
      </div>
      
      <div className="roadmap-container">
        {roadmapItems.map((item, index) => (
          <div key={index} className={`roadmap-item ${index % 2 === 0 ? 'roadmap-item-right' : 'roadmap-item-left'}`}>
            <div className="roadmap-item-content">
              <h4 className="roadmap-item-title">{item.title}</h4>
              <p className="roadmap-item-description">{item.description}</p>
              <div className="roadmap-item-actions">
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="roadmap-item-link"
                >
                  LEARN MORE
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapCanvas;