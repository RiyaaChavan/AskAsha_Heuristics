import React from 'react';
import PropTypes from 'prop-types';
import ThemeToggle from './ThemeToggle';
import { Menu, Bell } from 'lucide-react';

const Header = ({ toggleSidebar }) => { 
  return (
    <header className="bg-gradient-to-r from-[#9c4d6e] to-[#7a3a55] text-white py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg backdrop-blur-sm bg-opacity-90">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden hover:bg-white/20 rounded-lg p-2 transition-all duration-300 ease-in-out"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} className="text-white/90 hover:text-white" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-2xl backdrop-blur-md">
          <span className="font-black text-2xl bg-gradient-to-r from-[#8bc34a] to-[#8bc34a] bg-clip-text text-transparent">
            Asha
          </span>
          <span className="font-bold text-2xl text-white/90">Assistant</span>
          <span className="text-[#8bc34a] text-2xl font-black">.</span>
        </div>
      </div>

      {/* Removed middle section */}
      <div className="flex-1"></div>

      {/* Right controls with glass effect */}
      <div className="flex gap-4 items-center">
        <button className="hover:bg-white/20 p-2.5 rounded-lg transition-all duration-300 hidden sm:flex items-center justify-center relative group">
          <Bell size={20} className="text-white/80 group-hover:text-white" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#8bc34a] rounded-full"></span>
        </button>

        <ThemeToggle />

        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8bc34a] to-[#8bc34a] flex items-center justify-center text-white font-bold cursor-pointer shadow-lg hover:shadow-[#8bc34a]/25 transition-all duration-300 hover:-translate-y-0.5">
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

