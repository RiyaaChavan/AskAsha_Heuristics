import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`w-12 h-6 bg-black/20 rounded-full relative cursor-pointer transition-all duration-300`}
      onClick={toggleDarkMode}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-[2px] transition-all duration-300
          ${darkMode ? 'left-[27px]' : 'left-[2px]'}`}
      ></div>
    </div>
  );
};

export default ThemeToggle;