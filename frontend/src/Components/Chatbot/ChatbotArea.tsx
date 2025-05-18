import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import Canvas from './Canvas';
import './styles/ChatbotArea.css';
import CalendarServiceDialog from './CalendarServiceDialog';
import { RoadmapItem } from './types';

const ChatbotArea: React.FC = () => {
  // Existing state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // New state for calendar dialog
  const [showCalendarDialog, setShowCalendarDialog] = useState<boolean>(false);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[] | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Format date for calendar
  const formatDate = (date: Date): string => {
    return date.toISOString().split('.')[0];
  };
  
  // Generate a unique ID for calendar events
  const generateEventId = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };
  
  // Get the date of the next day
  const getNextDay = (): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9 AM
    return tomorrow;
  };
  
  const handleCalendarRequest = (items: RoadmapItem[]) => {
    setRoadmapItems(items);
    setShowCalendarDialog(true);
  };
  
  const handleCalendarServiceSelect = async (service: 'google' | 'outlook' | 'ics') => {
    if (!roadmapItems) return;
    
    try {
      setIsProcessing(true);
      setShowCalendarDialog(false);
      
      const startDate = getNextDay();
      
      if (service === 'google') {
        await addToGoogleCalendar(startDate, roadmapItems);
      } else if (service === 'outlook') {
        await addToOutlookCalendar(startDate, roadmapItems);
      } else {
        await downloadIcsFile(startDate, roadmapItems);
      }
    } catch (error) {
      console.error("Error processing calendar action:", error);
      alert("There was an error with the calendar operation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const addToGoogleCalendar = async (startDate: Date, items: RoadmapItem[]) => {
    try {
      // Use first item with comprehensive description
      const item = items[0];
      
      const eventDate = new Date(startDate);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 2); // 2 hour event
      
      const googleUrl = new URL('https://calendar.google.com/calendar/render');
      googleUrl.searchParams.append('action', 'TEMPLATE');
      googleUrl.searchParams.append('text', `${item.title} (${items.length}-part roadmap)`);
      
      // Create a comprehensive description that includes all roadmap items
      let fullDetails = `${item.description}\n\nResource: ${item.link}\n\n`;
      fullDetails += "FULL ROADMAP:\n";
      items.forEach((roadmapItem, index) => {
        fullDetails += `\nPHASE ${index + 1}: ${roadmapItem.title}`;
      });
      fullDetails += "\n\nNote: You might want to download the full ICS file instead to add all phases as separate events.";
      
      googleUrl.searchParams.append('details', fullDetails);
      googleUrl.searchParams.append('dates', `${formatDate(eventDate).replace(/[-:]/g, '')}/${formatDate(endDate).replace(/[-:]/g, '')}`);
      
      window.open(googleUrl.toString(), '_blank');
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      throw error;
    }
  };
  
  const addToOutlookCalendar = async (startDate: Date, items: RoadmapItem[]) => {
    try {
      // Similar approach for Outlook - just one event
      const item = items[0];
      
      const eventDate = new Date(startDate);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 2); // 2 hour event
      
      const outlookUrl = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
      const params = new URLSearchParams();
      
      params.append('subject', `${item.title} (${items.length}-part roadmap)`);
      
      // Create a comprehensive description that includes all roadmap items
      let fullDetails = `${item.description}\n\nResource: ${item.link}\n\n`;
      fullDetails += "FULL ROADMAP:\n";
      items.forEach((roadmapItem, index) => {
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
      throw error;
    }
  };
  
  const downloadIcsFile = async (startDate: Date, items: RoadmapItem[]): Promise<void> => {
    try {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AskAsha//Career Roadmap//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];
      
      // Create individual events for each roadmap item
      items.forEach((item, index) => {
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

  // ... rest of the ChatbotArea component remains the same
  
  return (
    <div className="chatbot-area">
      {/* Calendar Dialog appears at the top level */}
      {showCalendarDialog && (
        <CalendarServiceDialog 
          onClose={() => setShowCalendarDialog(false)} 
          onSelect={handleCalendarServiceSelect} 
        />
      )}
      
      <div className="messages-container" id="messages-container">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            index={index}
            selectMessage={setSelectedMessageIndex}
            isSelected={selectedMessageIndex === index}
            isUserMessage={message.isUser || false}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {selectedMessageIndex !== null && messages[selectedMessageIndex] && (
        <Canvas 
          message={messages[selectedMessageIndex]} 
          onCalendarRequest={handleCalendarRequest}
        />
      )}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => {
          /* existing send message functionality */
        }}
        onResize={() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default ChatbotArea;
