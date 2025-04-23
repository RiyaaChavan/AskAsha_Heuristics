import React from 'react';
import PropTypes from 'prop-types';
import { conversations } from '../data';
import { Plus } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  return (
    <div className={`w-[var(--sidebar-width)] bg-white dark:bg-[#252525] py-5 h-[calc(100vh-70px)] sticky top-[70px] shadow-md transition-all duration-300 z-10
      ${isOpen ? 'fixed left-0 md:relative md:left-auto' : 'fixed -left-full md:relative md:left-auto'}`}>
      <div className="px-5 pb-4 border-b border-black/10 dark:border-white/10 mb-4 flex justify-between items-center">
        <div className="font-semibold text-lg">Conversations</div>
        <button className="bg-[var(--accent-color)] text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-all hover:bg-opacity-80">
          <Plus size={18} />
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100%-60px)]">
        {conversations.map(conversation => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </div>
  );
};

const ConversationItem = ({ conversation }) => {
  const { title, preview, time, icon, active } = conversation;
  
  return (
    <div className={`px-5 py-3 cursor-pointer transition-all flex items-center gap-3 border-l-3 
      ${active 
        ? 'bg-[rgba(156,77,110,0.1)] dark:bg-[rgba(156,77,110,0.2)] border-l-[3px] border-l-[var(--primary-color)]' 
        : 'hover:bg-black/5 dark:hover:bg-white/5 border-l-[3px] border-transparent'}`}>
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[var(--primary-color)]">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
          {preview}
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-500">
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
    icon: PropTypes.string.isRequired,
    active: PropTypes.bool,
  }).isRequired,
};

export default Sidebar;