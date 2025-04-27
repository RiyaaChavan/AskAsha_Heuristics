import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Search, MessageSquare, Menu, FileText, Users, BookOpen, Briefcase, Calendar } from 'lucide-react';

// Sample conversations data
const conversations = [
  {
    id: '1',
    title: 'Project Discussion',
    preview: 'Let\'s discuss the new features...',
    time: '2h ago',
    active: true
  },
  {
    id: '2',
    title: 'UI Design Review',
    preview: 'I think we should revise the colors...',
    time: 'Yesterday',
    active: false
  },
  {
    id: '3',
    title: 'Bug Fixes',
    preview: 'Found issues with the sidebar toggle...',
    time: '2d ago',
    active: false
  }
];

// Square Icon Component
const SquareIcon = ({ icon, bgColor, iconColor }) => {
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
      {React.cloneElement(icon, { className: iconColor })}
    </div>
  );
};

// Feature Item Component
const FeatureItem = ({ icon, title, bgColor, iconColor }) => {
  return (
    <div className="px-4 py-3 my-1 flex items-center gap-3 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
      <SquareIcon icon={icon} bgColor={bgColor} iconColor={iconColor} />
      <div className="font-medium">{title}</div>
    </div>
  );
};

// Conversation Item Component
// Find the ConversationItem component and update its className:

const ConversationItem = ({ conversation }) => {
  const { title, preview, time, active } = conversation;
  return (
    <div
      className={`
        px-4 py-3 my-1 flex items-center gap-3 cursor-pointer rounded-lg
        transition-all
        ${active
          ? 'bg-[#e4c5d2] dark:bg-[#FFD1DC]/20 border-l-4 border-l-[#FFD1DC]'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'}
      `}
    >
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center
        ${active 
          ? 'bg-[#e0b9c7] text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
      `}>
        <MessageSquare size={20} />
      </div>
      
      
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{title}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{preview}</div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">{time}</div>
    </div>
  );
};

// Main Sidebar Component
const Sidebar = ({ isOpen }) => {
  return (
    <aside
      className={`
        w-[var(--sidebar-width)]
        bg-white dark:bg-[#252525]
        flex flex-col
        h-[calc(100vh-70px)]
        fixed top-[70px]
        transition-all duration-300 z-10
        shadow-md
        ${isOpen 
          ? 'left-0 md:relative md:left-auto md:fixed' 
          : '-left-full md:relative md:left-auto md:fixed'}
      `}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-black/10 dark:border-white/10 mb-1 flex justify-between items-center">
        <h2 className="font-semibold text-lg">Chat History</h2>
        <button
  className="bg-[#8bc34d] text-white rounded-full w-9 h-9 flex items-center justify-center 
             hover:bg-[#7aaf2b] transition-all shadow hover:shadow-md"
  aria-label="Chat history"
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
                     border-transparent focus:border-blue-500 focus:bg-white 
                     dark:focus:bg-gray-700 focus:ring-0 text-sm transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="overflow-y-auto flex-1 px-2">
        {conversations.map((conv) => (
          <ConversationItem key={conv.id} conversation={conv} />
        ))}
      </div>

      {/* Divider */}
      <div className="px-4 py-2">
        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">More Features</h3>
        <div className="mb-4">
          <FeatureItem 
            icon={<Briefcase size={20} />}
            title="Opportunities" 
            bgColor="bg-pink-100 dark:bg-pink-900/20"
            iconColor="text-pink-500"
          />
          <FeatureItem 
            icon={<Users size={20} />}
            title="Community" 
            bgColor="bg-yellow-100 dark:bg-yellow-900/20"
            iconColor="text-yellow-500"
          />
          <FeatureItem 
            icon={<BookOpen size={20} />}
            title="Learning" 
            bgColor="bg-green-100 dark:bg-green-900/20"
            iconColor="text-green-500"
          />
          <FeatureItem 
            icon={<FileText size={20} />}
            title="Resume Parser" 
            bgColor="bg-purple-100 dark:bg-purple-900/20"
            iconColor="text-purple-500"
          />
          <FeatureItem 
            icon={<Calendar size={20} />}
            title="Interview Assistant" 
            bgColor="bg-blue-100 dark:bg-blue-900/20"
            iconColor="text-blue-500"
          />
        </div>
      </div>
    </aside>
  );
};

// PropTypes
SquareIcon.propTypes = {
  icon: PropTypes.node.isRequired,
  bgColor: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
};

FeatureItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
};

ConversationItem.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    preview: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    active: PropTypes.bool,
  }).isRequired,
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Sidebar;