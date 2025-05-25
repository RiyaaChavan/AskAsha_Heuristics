import React, { useState, useEffect, useCallback } from 'react';
import { performanceMonitor, usePerformanceMonitor } from '../utils/performanceMonitor';
import { getMarkdownCacheStats } from '../utils/fastMarkdown';

interface PerformanceDebugProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const PerformanceDebug: React.FC<PerformanceDebugProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [cacheStats, setCacheStats] = useState(getMarkdownCacheStats());
  const { logSummary, isSlowing } = usePerformanceMonitor();

  // Update metrics every 2 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setCacheStats(getMarkdownCacheStats());
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleLogSummary = useCallback(() => {
    logSummary();
  }, [logSummary]);

  const handleReset = useCallback(() => {
    performanceMonitor.reset();
    setMetrics(performanceMonitor.getMetrics());
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '8px 12px',
          backgroundColor: '#6b46c1',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        📊 Perf
      </button>
    );
  }

  const isPerformanceGood = metrics.averageProcessingTime < 5 && metrics.p95RenderTime < 16;
  const isSlowingDown = isSlowing();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      minWidth: '300px',
      maxHeight: '400px',
      overflowY: 'auto',
      border: `2px solid ${isPerformanceGood ? '#10b981' : '#ef4444'}`
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>
          🚀 Performance Monitor
          {isSlowingDown && <span style={{ color: '#ef4444' }}> ⚠️</span>}
        </h3>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#10b981', fontWeight: 'bold' }}>
          📊 Message Stats
        </div>
        <div>Total Messages: {metrics.totalMessages}</div>
        <div>Cache Hit Rate: {metrics.cacheHitRate.toFixed(1)}%</div>
        <div>Cache Size: {cacheStats.size}/{cacheStats.maxSize}</div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>
          ⚡ Markdown Processing
        </div>
        <div>Average: {metrics.averageProcessingTime.toFixed(2)}ms</div>
        <div>95th Percentile: {metrics.p95MarkdownTime.toFixed(2)}ms</div>
        <div style={{ 
          color: metrics.averageProcessingTime < 1 ? '#10b981' : 
                metrics.averageProcessingTime < 5 ? '#f59e0b' : '#ef4444'
        }}>
          Status: {
            metrics.averageProcessingTime < 1 ? 'Excellent' :
            metrics.averageProcessingTime < 5 ? 'Good' : 'Needs Improvement'
          }
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
          🎯 Render Performance
        </div>
        <div>95th Percentile: {metrics.p95RenderTime.toFixed(2)}ms</div>
        <div style={{ 
          color: metrics.p95RenderTime < 16 ? '#10b981' : '#ef4444'
        }}>
          Frame Rate: {metrics.p95RenderTime < 16 ? '60fps ✅' : 'Drops ⚠️'}
        </div>
      </div>

      {isSlowingDown && (
        <div style={{ 
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderRadius: '4px',
          border: '1px solid #ef4444'
        }}>
          <div style={{ color: '#ef4444', fontWeight: 'bold' }}>
            ⚠️ Performance Degradation Detected
          </div>
          <div style={{ fontSize: '11px' }}>
            Recent operations are 50% slower than before
          </div>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '8px',
        marginTop: '12px'
      }}>
        <button
          onClick={handleLogSummary}
          style={{
            padding: '4px 8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Log Summary
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '4px 8px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ 
        marginTop: '12px',
        fontSize: '10px',
        color: '#9ca3af'
      }}>
        Fast Markdown: {metrics.markdownProcessingTime.length} samples
        <br />
        Render Times: {metrics.componentRenderTime.length} samples
      </div>
    </div>
  );
};

export default React.memo(PerformanceDebug); 