import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface JobData {
  id: number | string;
  title: string;
  company_name: string;
  location_name: string;
  skills: string[] | string;
  status: string;
  company_logo?: string;
  min_year?: number;
  max_year?: number;
  work_mode?: string[] | string;
  job_types?: string[] | string;
  boosted?: boolean;
  expires_on?: string;
  skillMatchScore?: number;
  platform?: string;
  platform_job_url?: string;
}

interface VirtualizedJobListProps {
  jobs: JobData[];
  onJobSelect: (jobId: number | string) => void;
  renderJobCard: (job: JobData, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

const VirtualizedJobList: React.FC<VirtualizedJobListProps> = ({
  jobs,
  onJobSelect,
  renderJobCard,
  itemHeight = 200,
  containerHeight = 600,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      jobs.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, jobs.length]);

  // Handle scroll with throttling for performance
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Memoize visible items to prevent unnecessary re-renders
  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (jobs[i]) {
        items.push({
          index: i,
          job: jobs[i],
          style: {
            position: 'absolute' as const,
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          }
        });
      }
    }
    return items;
  }, [jobs, visibleRange, itemHeight]);

  const totalHeight = jobs.length * itemHeight;

  return (
    <div
      ref={setContainerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
      className="virtualized-job-list"
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, job, style }) => (
          <div key={`${job.id}-${index}`} style={style}>
            {renderJobCard(job, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export default React.memo(VirtualizedJobList); 