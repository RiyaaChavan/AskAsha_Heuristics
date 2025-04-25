import React, { useState } from 'react';
import { Menu, PlusCircle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CanvasArea from '../components/CanvasArea';
import ChatArea from '../components/ChatArea';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCanvas = () => setCanvasOpen(!canvasOpen);
  const startNewChat = () => {
    console.log("Starting new chat");
    // Add new chat logic here
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 relative">
        {/* Mobile overlay when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        <Sidebar isOpen={sidebarOpen} />
        
        <div className="flex-1 relative flex">
          {/* Toggle sidebar button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute top-2 left-2 z-20"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* New chat button */}
          <Button
            onClick={startNewChat}
            className="absolute top-2 left-14 z-20 gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            New Chat
          </Button>

          <div className="flex-1 overflow-hidden mt-14">
            <ChatArea />
          </div>
          
          <CanvasArea isOpen={canvasOpen} toggleCanvas={toggleCanvas} />
        </div>
      </div>
    </div>
  );
};

export default Index;
