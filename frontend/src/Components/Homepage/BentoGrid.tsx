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
}) => {
  return (
    <div className="bento-grid-item">
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
        <img
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          alt="avatar"
          className="avatar"
        />
        <p className="profile-text">Just code in Vanilla Javascript</p>
        <p className="profile-tag delusional">Delusional</p>
      </motion.div>
      <motion.div className="profile-card center">
        <img
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          alt="avatar"
          className="avatar"
        />
        <p className="profile-text">Tailwind CSS is cool, you know</p>
        <p className="profile-tag sensible">Sensible</p>
      </motion.div>
      <motion.div variants={second} className="profile-card">
        <img
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          alt="avatar"
          className="avatar"
        />
        <p className="profile-text">I love angular, RSC, and Redux.</p>
        <p className="profile-tag helpless">Helpless</p>
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
        <img
          src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
          alt="avatar"
          className="avatar"
        />
        <p>There are a lot of cool frameworks out there like React, Angular,
          Vue, Svelte that can make your life ....</p>
      </motion.div>
      <motion.div variants={variantsSecond} className="chat-response">
        <p>Use PHP.</p>
        <div className="gradient-circle"></div>
      </motion.div>
    </motion.div>
  );
};

const items = [
  {
    title: "AI Content Generation",
    description: <span>Experience the power of AI in generating unique content.</span>,
    header: <SkeletonOne />,
    icon: <IconClipboardCopy className="icon" />,
  },
  {
    title: "Automated Proofreading",
    description: <span>Let AI handle the proofreading of your documents.</span>,
    header: <SkeletonTwo />,
    icon: <IconFileBroken className="icon" />,
  },
  {
    title: "Contextual Suggestions",
    description: <span>Get AI-powered suggestions based on your writing context.</span>,
    header: <SkeletonThree />,
    icon: <IconSignature className="icon" />,
  },
  {
    title: "Sentiment Analysis",
    description: <span>Understand the sentiment of your text with AI analysis.</span>,
    header: <SkeletonFour />,
    icon: <IconTableColumn className="icon" />,
  },
  {
    title: "Text Summarization",
    description: <span>Summarize your lengthy documents with AI technology.</span>,
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
        />
      ))}
    </BentoGrid>
  );
};