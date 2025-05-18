import React, { createContext, useState, useContext, ReactNode } from 'react';
import { RoadmapItem } from '../Components/Chatbot/types';

type CalendarServiceType = 'google' | 'outlook' | 'ics' | null;

interface CalendarDialogContextType {
  showDialog: boolean;
  roadmapItems: RoadmapItem[] | null;
  selectedService: CalendarServiceType;
  openCalendarDialog: (items: RoadmapItem[]) => void;
  closeCalendarDialog: () => void;
  selectCalendarService: (service: CalendarServiceType) => void;
}

const CalendarDialogContext = createContext<CalendarDialogContextType | undefined>(undefined);

export const CalendarDialogProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[] | null>(null);
  const [selectedService, setSelectedService] = useState<CalendarServiceType>(null);

  const openCalendarDialog = (items: RoadmapItem[]) => {
    setRoadmapItems(items);
    setShowDialog(true);
  };

  const closeCalendarDialog = () => {
    setShowDialog(false);
    setSelectedService(null);
  };

  const selectCalendarService = (service: CalendarServiceType) => {
    setSelectedService(service);
  };

  return (
    <CalendarDialogContext.Provider 
      value={{
        showDialog,
        roadmapItems,
        selectedService,
        openCalendarDialog,
        closeCalendarDialog,
        selectCalendarService
      }}
    >
      {children}
    </CalendarDialogContext.Provider>
  );
};

export const useCalendarDialog = (): CalendarDialogContextType => {
  const context = useContext(CalendarDialogContext);
  if (context === undefined) {
    throw new Error('useCalendarDialog must be used within a CalendarDialogProvider');
  }
  return context;
};