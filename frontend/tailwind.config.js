/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
        },
        background: {
          light: 'var(--bg-light)',
          dark: 'var(--bg-dark)',
        },
        text: {
          light: 'var(--text-light)',
          dark: 'var(--text-dark)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'ticker': 'ticker 20s linear infinite',
        'typing': 'typingAnimation 1.4s infinite ease-in-out',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};