import React from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { Menu, Calendar, Bell } from 'lucide-react';

const Header = ({ toggleSidebar }) => { 
  return (
    <header className="bg-gradient-to-r from-[#9c4d6e] to-[#8a435e] text-white py-3.5 px-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <button 
          className="md:hidden text-white hover:bg-white/10 rounded-full p-1.5 transition-all"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <div className="font-bold text-2xl flex items-center space-x-1">
          <span className="text-[#8bc34a] font-extrabold tracking-wide">Career</span>
          <span className="text-white dark:text-white">Assistant</span>
          <span className="text-[#8bc34a] text-2xl">.</span>
        </div>
      </div>

      {/* Optional middle section (like a news ticker) */}
      <div className="flex-1 max-w-[600px] mx-8 overflow-hidden whitespace-nowrap relative hidden md:block">
        {/* Add any scrolling text or middle content here */}
      </div>

      {/* Right controls */}
      <div className="flex gap-5 items-center">
        {/* Optional calendar icon or similar */}
        <button className="hover:bg-white/10 p-1.5 rounded-full transition-colors hidden sm:block">
          {/* <Calendar size={20} /> if needed */}
        </button>

        

        <ThemeToggle />

        <div className="w-10 h-10 rounded-full bg-[#8bc34a] flex items-center justify-center text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all">
          R
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
};

export default Header;
