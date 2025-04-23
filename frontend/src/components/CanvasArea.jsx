import React from 'react';
import PropTypes from 'prop-types';
import { jobPosts } from '../data';
import { X, MapPin, DollarSign } from 'lucide-react';

const CanvasArea = ({ isOpen, toggleCanvas }) => {
  return (
    <div 
      className={`bg-white dark:bg-[#252525] h-[calc(100vh-70px)] sticky top-[70px] right-0 overflow-hidden transition-all duration-300 shadow-md z-10
        ${isOpen 
          ? 'w-[var(--canvas-width)] md:w-[var(--canvas-width)] fixed right-0 md:relative' 
          : 'w-0 md:w-0'}`}
    >
      <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
        <div className="font-semibold">Job Suggestions</div>
        <button 
          className="bg-transparent border-none text-lg cursor-pointer text-gray-600 dark:text-gray-400"
          onClick={toggleCanvas}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-5 overflow-y-auto h-[calc(100%-60px)]">
        <div className="flex flex-col gap-4">
          {jobPosts.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ job }) => {
  const { title, company, location, salary, tags } = job;
  
  return (
    <div className="p-4 rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30 backdrop-blur-md bg-white/15 dark:bg-black/15 border border-white/20 dark:border-white/5">
      <div className="font-semibold mb-1 text-[var(--primary-color)] dark:text-[var(--primary-light)]">
        {title}
      </div>
      <div className="text-sm mb-2">{company}</div>
      <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {location}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign size={12} />
          {salary}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <div 
            key={index} 
            className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs"
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

CanvasArea.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleCanvas: PropTypes.func.isRequired,
};

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    salary: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default CanvasArea;