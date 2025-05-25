import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import "./StickyScroll.css";

interface ContentItem {
  title: string;
  description: string;
  content?: React.ReactNode;
}

interface StickyScrollProps {
  content: ContentItem[];
  contentClassName?: string;
}

export const StickyScroll: React.FC<StickyScrollProps> = ({
  content,
  contentClassName,
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#924f72", // slate-900
    "#924f72", // black
    "#924f72", // neutral-900
  ];

  // IMPORTANT: Remove the linearGradients and backgroundGradient state completely
  // Or comment them out if you need to keep them for reference

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="sticky-scroll-container"
      ref={ref}
    >
      <div className="sticky-scroll-content-wrapper">
        <div className="sticky-scroll-text-column">
          {content.map((item, index) => (
            <div key={item.title + index} className="sticky-scroll-card">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="sticky-scroll-title"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="sticky-scroll-description"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="sticky-scroll-spacer"></div>
        </div>
      </div>
      {/* CRITICAL CHANGE: Remove the style prop completely and add a fixed green-bg class */}
      <div
        className={`sticky-scroll-visual-container green-bg ${contentClassName || ""}`}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};