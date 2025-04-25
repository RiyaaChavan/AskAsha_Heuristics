import React from 'react';
import PropTypes from 'prop-types';
import { conversations } from '../data';
import { Plus, Search, MessageSquare } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  return (
    <aside
      className={`
        w-[var(--sidebar-width)]
        bg-white dark:bg-[#1e1e1e]
        flex flex-col
        h-[calc(100vh-70px)]
        fixed top-[70px]
        transition-all duration-300 z-20
        shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-black/10 dark:border-white/10 mb-1 flex justify-between items-center">
        <h2 className="font-semibold text-lg">Chat History</h2>
        <button 
          className="bg-[var(--accent-color)] text-white rounded-full w-9 h-9 flex items-center justify-center 
                   hover:bg-opacity-85 transition-all shadow hover:shadow-md"
          aria-label="New conversation"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full py-2.5 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-800 
                     border-transparent focus:border-[var(--accent-color)] focus:bg-white 
                     dark:focus:bg-gray-700 focus:ring-0 text-sm transition-all"
          />
        </div>
      </div>

      {/* Scrollable List */}
      <div className="overflow-y-auto flex-1 px-2">
        {conversations.map((conv, index) => (
          <ConversationItem 
            key={conv.id} 
            conversation={conv} 
            style={{ animationDelay: `${index * 0.05}s` }} 
          />
        ))}
      </div>
    </aside>
  );
};

const ConversationItem = ({ conversation, style }) => {
  const { title, preview, time, active } = conversation;
  return (
    <div
      style={style}
      className={`
        px-4 py-3 my-1 flex items-center gap-3 cursor-pointer rounded-lg
        animate-slide-in transition-all
        ${active
          ? 'bg-[#f3e0e8] dark:bg-[rgba(156,77,110,0.2)] border-l-4 border-l-[var(--primary-color)]'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'}
      `}
    >
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center
        ${active 
          ? 'bg-[var(--primary-color)] text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
      `}>
        <MessageSquare size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {title}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
          {preview}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
        {time}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

ConversationItem.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    preview: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    active: PropTypes.bool,
  }).isRequired,
  style: PropTypes.object,
};

export default Sidebar;
