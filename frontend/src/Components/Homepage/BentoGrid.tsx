import React from 'react';
import { motion } from 'framer-motion';
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import './BentoGrid.css';

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

interface BentoGridItemProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  wide?: boolean;
  backgroundColor?: string; // Add this new property
}


const BentoGrid: React.FC<BentoGridProps> = ({ children }) => {
  return (
    <div className="bento-grid">
      {children}
    </div>
  );
};

const BentoGridItem: React.FC<BentoGridItemProps> = ({
  title,
  description,
  header,
  icon,
  wide,
  backgroundColor,
}) => {
  return (
    <div 
      className={`bento-grid-item ${wide ? 'bento-grid-item-wide' : ''}`}
      style={{ backgroundColor }}
    >
      {header}
      <div className="bento-content">
        {icon}
        <div className="bento-title">{title}</div>
        <div className="bento-description">{description}</div>
      </div>
    </div>
  );
};



const SkeletonOne: React.FC = () => {
  const variants = {
    initial: { x: 0 },
    animate: {
      x: 10,
      rotate: 5,
      transition: { duration: 0.2 },
    },
  };
  const variantsSecond = {
    initial: { x: 0 },
    animate: {
      x: -10,
      rotate: -5,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div initial="initial" whileHover="animate" className="skeleton-one">
      <motion.div variants={variants} className="skeleton-row">
        <div className="gradient-circle"></div>
        <div className="skeleton-line"></div>
      </motion.div>
      <motion.div variants={variantsSecond} className="skeleton-row-reverse">
        <div className="skeleton-line"></div>
        <div className="gradient-circle"></div>
      </motion.div>
      <motion.div variants={variants} className="skeleton-row">
        <div className="gradient-circle"></div>
        <div className="skeleton-line"></div>
      </motion.div>
    </motion.div>
  );
};

const SkeletonTwo: React.FC = () => {
  const variants = {
    initial: { width: 0 },
    animate: {
      width: "100%",
      transition: { duration: 0.2 },
    },
    hover: {
      width: ["0%", "100%"],
      transition: { duration: 2 },
    },
  };

  return (
    <motion.div initial="initial" animate="animate" whileHover="hover" className="skeleton-two">
      {Array(6).fill(0).map((_, i) => (
        <motion.div
          key={`skeleton-two-${i}`}
          variants={variants}
          style={{ maxWidth: Math.random() * (100 - 40) + 40 + "%" }}
          className="skeleton-line"
        />
      ))}
    </motion.div>
  );
};

const SkeletonThree: React.FC = () => {
  const variants = {
    initial: { backgroundPosition: "0 50%" },
    animate: { backgroundPosition: ["0, 50%", "100% 50%", "0 50%"] },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
      className="skeleton-three"
    >
      <motion.div className="gradient-box"></motion.div>
    </motion.div>
  );
};

const SkeletonFour: React.FC = () => {
  const first = {
    initial: { x: 20, rotate: -5 },
    hover: { x: 0, rotate: 0 },
  };
  const second = {
    initial: { x: -20, rotate: 5 },
    hover: { x: 0, rotate: 0 },
  };

  return (
    <motion.div initial="initial" animate="animate" whileHover="hover" className="skeleton-four">
      <motion.div variants={first} className="profile-card">
        
        <p className="profile-text">I found 4 new jobs in Mumbai</p>
        <p className="profile-tag delusional">ML Engineer</p>
      </motion.div>
      <motion.div className="profile-card center">
    
        <p className="profile-text">Amazon has a new opening for SWE role</p>
        <p className="profile-tag sensible">SWE-II</p>
      </motion.div>
      <motion.div variants={second} className="profile-card">
        <p className="profile-text">Based on your resume, here are 3 role suggestions</p>
        <p className="profile-tag helpless">Skills</p>
      </motion.div>
    </motion.div>
  );
};

const SkeletonFive: React.FC = () => {
  const variants = {
    initial: { x: 0 },
    animate: {
      x: 10,
      rotate: 5,
      transition: { duration: 0.2 },
    },
  };
  const variantsSecond = {
    initial: { x: 0 },
    animate: {
      x: -10,
      rotate: -5,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div initial="initial" whileHover="animate" className="skeleton-five">
      <motion.div variants={variants} className="chat-message">
       
        <p>Ready to master data science? I've mapped out a comprehensive learning journey for you.</p>
      </motion.div>
      <motion.div  className="chat-response">
        <p>Thank you!</p>
      </motion.div>
    </motion.div>
  );
};

const items = [
  {
    title: "Career Coach",
    description: <span>Confused or curious? AskAsha has your back with tailored guidance and support</span>,
    header: <SkeletonOne />,
    icon: <IconClipboardCopy className="icon" />,
  },
  {
    title: "Interview Assistant",
    description: <span>Practice with AI, get tips, and feel ready for any question that comes your way.</span>,
    header: <SkeletonTwo />,
    icon: <IconFileBroken className="icon" />,
  },
  {
    title: "Event Search",
    description: <span>From workshops to networking events — stay updated and attend with confidence</span>,
    header: <SkeletonThree />,
    icon: <IconSignature className="icon" />,
  },
  {
    title: "Personlised Job Hunt",
    description: <span>Let AskAsha recommend roles that align with your career goals and skills.</span>,
    header: <SkeletonFour />,
    icon: <IconTableColumn className="icon" />,
  },
  {
    title: "My Roadmap",
    description: <span>Visualize your path, set goals, and track your professional growth with ease.</span>,
    header: <SkeletonFive />,
    icon: <IconBoxAlignRightFilled className="icon" />,
  },
];

// BentoGrid.tsx
export const BentoGridDemo: React.FC = () => {
  return (
    <BentoGrid>
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          wide={i === 3} // Make the fourth item (index 3) wide
        />
      ))}
    </BentoGrid>
  );
};
