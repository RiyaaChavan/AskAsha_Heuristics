import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from '../context/ThemeContext';
import { newsTicker } from '../data';
import ThemeToggle from './ThemeToggle';
import { Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-[var(--primary-color)] text-white py-3 px-5 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <button 
        className="md:hidden text-white text-2xl focus:outline-none" 
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </button>
      
      <div className="font-bold text-xl flex items-center">
        <span className="text-[var(--accent-color)]">Career</span>
        Assistant
        <span className="text-[var(--accent-color)]">.</span>
      </div>
      
      <div className="flex-1 max-w-[600px] mx-5 overflow-hidden whitespace-nowrap relative hidden md:block">
        <div className="inline-block text-white/90 animate-[ticker_20s_linear_infinite]">
          {newsTicker}
        </div>
      </div>
      
      <div className="flex gap-5 items-center">
        <div className="cursor-pointer text-lg hidden sm:block">
          <i className="fas fa-calendar-alt"></i>
        </div>
        <ThemeToggle />
        <div className="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold cursor-pointer">
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