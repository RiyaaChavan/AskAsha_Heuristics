// Performance monitoring utility for tracking chat optimization improvements

interface PerformanceMetrics {
  markdownProcessingTime: number[];
  componentRenderTime: number[];
  messageCount: number;
  cacheHitRate: number;
  averageProcessingTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    markdownProcessingTime: [],
    componentRenderTime: [],
    messageCount: 0,
    cacheHitRate: 0,
    averageProcessingTime: 0
  };

  private maxSamples = 100; // Keep last 100 measurements

  // Track markdown processing time
  trackMarkdownProcessing<T>(fn: () => T, label?: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    this.metrics.markdownProcessingTime.push(duration);
    
    // Keep only recent samples
    if (this.metrics.markdownProcessingTime.length > this.maxSamples) {
      this.metrics.markdownProcessingTime.shift();
    }

    // Update average
    this.updateAverageProcessingTime();

    if (label && duration > 10) { // Log slow operations
      console.warn(`Slow markdown processing (${label}): ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  // Track component render time
  trackComponentRender<T>(fn: () => T, componentName?: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    this.metrics.componentRenderTime.push(duration);
    
    if (this.metrics.componentRenderTime.length > this.maxSamples) {
      this.metrics.componentRenderTime.shift();
    }

    if (componentName && duration > 16) { // Log renders slower than 60fps
      console.warn(`Slow component render (${componentName}): ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  // Update message count
  incrementMessageCount(): void {
    this.metrics.messageCount++;
  }

  // Update cache hit rate
  updateCacheHitRate(hits: number, total: number): void {
    this.metrics.cacheHitRate = total > 0 ? (hits / total) * 100 : 0;
  }

  // Calculate average processing time
  private updateAverageProcessingTime(): void {
    const times = this.metrics.markdownProcessingTime;
    if (times.length > 0) {
      this.metrics.averageProcessingTime = times.reduce((a, b) => a + b, 0) / times.length;
    }
  }

  // Get performance summary
  getMetrics(): PerformanceMetrics & {
    p95MarkdownTime: number;
    p95RenderTime: number;
    totalMessages: number;
  } {
    const markdownTimes = [...this.metrics.markdownProcessingTime].sort((a, b) => a - b);
    const renderTimes = [...this.metrics.componentRenderTime].sort((a, b) => a - b);

    const p95Index = Math.floor(0.95 * markdownTimes.length);
    const p95RenderIndex = Math.floor(0.95 * renderTimes.length);

    return {
      ...this.metrics,
      p95MarkdownTime: markdownTimes[p95Index] || 0,
      p95RenderTime: renderTimes[p95RenderIndex] || 0,
      totalMessages: this.metrics.messageCount
    };
  }

  // Log performance summary
  logPerformanceSummary(): void {
    const metrics = this.getMetrics();
    
    console.group('🚀 Chat Performance Metrics');
    console.log(`📊 Total Messages: ${metrics.totalMessages}`);
    console.log(`⚡ Average Markdown Processing: ${metrics.averageProcessingTime.toFixed(2)}ms`);
    console.log(`📈 95th Percentile Markdown: ${metrics.p95MarkdownTime.toFixed(2)}ms`);
    console.log(`🎯 95th Percentile Render: ${metrics.p95RenderTime.toFixed(2)}ms`);
    console.log(`💾 Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`);
    
    // Performance assessment
    if (metrics.averageProcessingTime < 1) {
      console.log('✅ Excellent markdown performance');
    } else if (metrics.averageProcessingTime < 5) {
      console.log('✅ Good markdown performance');
    } else {
      console.log('⚠️ Markdown performance could be improved');
    }

    if (metrics.p95RenderTime < 16) {
      console.log('✅ Smooth 60fps rendering');
    } else {
      console.log('⚠️ Some renders may cause frame drops');
    }

    console.groupEnd();
  }

  // Reset metrics
  reset(): void {
    this.metrics = {
      markdownProcessingTime: [],
      componentRenderTime: [],
      messageCount: 0,
      cacheHitRate: 0,
      averageProcessingTime: 0
    };
  }

  // Check if performance is degrading
  isPerformanceDegrading(): boolean {
    const recent = this.metrics.markdownProcessingTime.slice(-10);
    const older = this.metrics.markdownProcessingTime.slice(-20, -10);
    
    if (recent.length < 5 || older.length < 5) return false;

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    return recentAvg > olderAvg * 1.5; // 50% slower than before
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure async operations
export const measureAsync = async <T>(
  fn: () => Promise<T>, 
  label?: string
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    if (label && duration > 100) { // Log slow async operations
      console.warn(`Slow async operation (${label}): ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    console.error(`Failed async operation (${label}): ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    trackMarkdown: performanceMonitor.trackMarkdownProcessing.bind(performanceMonitor),
    trackRender: performanceMonitor.trackComponentRender.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    logSummary: performanceMonitor.logPerformanceSummary.bind(performanceMonitor),
    isSlowing: performanceMonitor.isPerformanceDegrading.bind(performanceMonitor)
  };
}; 