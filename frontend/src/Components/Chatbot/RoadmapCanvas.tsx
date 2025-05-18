import React, { useState, useRef, useEffect } from 'react';
import { CanvasProps, RoadmapItem } from './types';
import './styles/RoadmapCanvas.css';

interface CalendarServiceDialogProps {
  onClose: () => void;
  onSelect: (service: 'google' | 'outlook' | 'ics') => void;
}

const CalendarServiceDialog: React.FC<CalendarServiceDialogProps> = ({ onClose, onSelect }) => {
  // Use a ref to prevent clicks from bubbling up
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Prevent clicks inside dialog from closing it
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="calendar-service-dialog-overlay"
      onClick={onClose}
    >
      <div 
        ref={dialogRef}
        className="calendar-service-dialog" 
        onClick={handleDialogClick}
      >
        <h3>Choose Calendar Option</h3>
        <p className="calendar-dialog-description">Download the ICS file for the full roadmap with all phases (recommended), or add just the first phase to your online calendar.</p>
        <div className="calendar-service-buttons">
          <button
            type="button"
            onClick={() => onSelect('ics')}
            className="calendar-service-button ics recommended"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#555555">
              <path d="M19,3h-1V1h-2v2H8V1H6v2H5C3.89,3,3,3.9,3,5v14c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V9h14V19z M19,7H5V5h14V7z"/>
              <path d="M7,11h5v5H7V11z"/>
            </svg>
            Download .ICS File 
            
          </button>
          <button
            type="button"
            onClick={() => onSelect('google')}
            className="calendar-service-button google"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#4285F4">
              <path d="M19.3,4.5H18V3H16.5v1.5h-9V3H6v1.5H4.7C3.2,4.5,2,5.7,2,7.2v10.5c0,1.5,1.2,2.7,2.7,2.7h14.6c1.5,0,2.7-1.2,2.7-2.7V7.2C22,5.7,20.8,4.5,19.3,4.5z M20.5,17.7c0,0.7-0.5,1.2-1.2,1.2H4.7c-0.7,0-1.2-0.5-1.2-1.2V10.5h17V17.7z M20.5,9h-17V7.2c0-0.7,0.5-1.2,1.2-1.2H6v1.5h1.5V6h9v1.5H18V6h1.3c0.7,0,1.2,0.5,1.2,1.2V9z"/>
            </svg>
            Google Calendar
          </button>
          <button
            type="button"
            onClick={() => onSelect('outlook')}
            className="calendar-service-button outlook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#0078D4">
              <path d="M21.17,3H7.83C6.82,3,6,3.82,6,4.83v14.34C6,20.18,6.82,21,7.83,21h13.34c1.01,0,1.83-0.82,1.83-1.83V4.83C23,3.82,22.18,3,21.17,3z M8.6,6.67c0.93,0,1.69,0.76,1.69,1.69c0,0.93-0.76,1.69-1.69,1.69c-0.93,0-1.69-0.76-1.69-1.69C6.92,7.43,7.67,6.67,8.6,6.67z"/>
              <path d="M20.4,19.2H6.8v-5.44h13.6V19.2z M20.4,12.53H6.8V7.2h13.6V12.53z"/>
            </svg>
            Outlook 
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="calendar-service-close"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

interface ExtendedCanvasProps extends CanvasProps {
  onCalendarRequest?: (items: RoadmapItem[]) => void;
}

const RoadmapCanvas: React.FC<ExtendedCanvasProps> = ({ message, onCalendarRequest }) => {
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
      // Instead of opening multiple tabs, we'll create just one event for the first item
      // and provide instructions to add the remaining items
      const item = roadmapItems[0];
      
      const eventDate = new Date(startDate);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 2); // 2 hour event
      
      const googleUrl = new URL('https://calendar.google.com/calendar/render');
      googleUrl.searchParams.append('action', 'TEMPLATE');
      googleUrl.searchParams.append('text', `${item.title} (${roadmapItems.length}-part roadmap)`);
      
      // Create a comprehensive description that includes all roadmap items
      let fullDetails = `${item.description}\n\nResource: ${item.link}\n\n`;
      fullDetails += "FULL ROADMAP:\n";
      roadmapItems.forEach((roadmapItem, index) => {
        fullDetails += `\nPHASE ${index + 1}: ${roadmapItem.title}`;
      });
      fullDetails += "\n\nNote: You might want to download the full ICS file instead to add all phases as separate events.";
      
      googleUrl.searchParams.append('details', fullDetails);
      googleUrl.searchParams.append('dates', `${formatDate(eventDate).replace(/[-:]/g, '')}/${formatDate(endDate).replace(/[-:]/g, '')}`);
      
      window.open(googleUrl.toString(), '_blank');
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      alert("There was an error creating the Google Calendar event. Try downloading the ICS file instead.");
    }
  };
  
  const addToOutlookCalendar = async (startDate: Date) => {
    try {
      // Similar approach for Outlook - just one event
      const item = roadmapItems[0];
      
      const eventDate = new Date(startDate);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 2); // 2 hour event
      
      const outlookUrl = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
      const params = new URLSearchParams();
      
      params.append('subject', `${item.title} (${roadmapItems.length}-part roadmap)`);
      
      // Create a comprehensive description that includes all roadmap items
      let fullDetails = `${item.description}\n\nResource: ${item.link}\n\n`;
      fullDetails += "FULL ROADMAP:\n";
      roadmapItems.forEach((roadmapItem, index) => {
        fullDetails += `\nPHASE ${index + 1}: ${roadmapItem.title}`;
      });
      fullDetails += "\n\nNote: You might want to download the full ICS file instead to add all phases as separate events.";
      
      params.append('body', fullDetails);
      params.append('startdt', formatDate(eventDate));
      params.append('enddt', formatDate(endDate));
      params.append('path', '/calendar/action/compose');
      
      window.open(`${outlookUrl}?${params.toString()}`, '_blank');
    } catch (error) {
      console.error("Error creating Outlook event:", error);
      alert("There was an error creating the Outlook event. Try downloading the ICS file instead.");
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
      link.download = 'learning_roadmap.ics';
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
          onClick={() => onCalendarRequest && onCalendarRequest(roadmapItems)}
          title="Add all roadmap items to your calendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Add to Calendar
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