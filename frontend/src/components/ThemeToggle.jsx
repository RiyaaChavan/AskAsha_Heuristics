import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-1.5 rounded-full transition-all duration-300
        ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/20'}
        hover:bg-opacity-80
      `}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon size={18} className="text-white-300" />
      ) : (
        <Sun size={18} className="text-yellow-300" />
      )}
    </button>
  );
};

export default ThemeToggle;