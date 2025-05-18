import React, { useRef, useEffect } from 'react';
import './styles/CalendarServiceDialog.css';

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
        <h3>Choose Calendar Service</h3>
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

export default CalendarServiceDialog;