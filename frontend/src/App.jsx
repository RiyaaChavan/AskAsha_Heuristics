import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import CanvasArea from './components/CanvasArea';
import ExampleComponent from './components/GoogleSignIn';
import GoogleSignIn from './components/GoogleSignIn';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCanvas = () => {
    setCanvasOpen(!canvasOpen);
  };

  return (
    <GoogleSignIn></GoogleSignIn>
  );
}

export default App;