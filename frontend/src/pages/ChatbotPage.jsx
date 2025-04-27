import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import CanvasArea from '../components/CanvasArea';

const ChatbotPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCanvas = () => {
    setCanvasOpen(!canvasOpen);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-dark)] dark:text-[var(--text-light)] transition-colors duration-300">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex relative">
        <Sidebar isOpen={sidebarOpen} />
        <ChatArea />
        <CanvasArea isOpen={canvasOpen} toggleCanvas={toggleCanvas} />
      </div>
    </div>
  );
};

export default ChatbotPage;