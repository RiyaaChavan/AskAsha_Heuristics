// Fast, lightweight markdown processor optimized for chat messages
// Replaces heavy 'marked' library for better performance

interface MarkdownCache {
  [key: string]: string;
}

// Simple LRU cache for processed markdown
class MarkdownLRUCache {
  private cache: Map<string, string> = new Map();
  private maxSize: number = 100; // Cache up to 100 processed messages

  get(key: string): string | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: string, value: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

const markdownCache = new MarkdownLRUCache();

// Fast markdown processing functions
const processInlineFormatting = (text: string): string => {
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code: `text`
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Strikethrough: ~~text~~
    .replace(/~~(.*?)~~/g, '<del>$1</del>');
};

const processLists = (text: string): string => {
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for unordered list
    if (/^[-*+]\s/.test(line)) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      const content = line.replace(/^[-*+]\s/, '');
      result.push(`<li>${processInlineFormatting(content)}</li>`);
    }
    // Check for ordered list
    else if (/^\d+\.\s/.test(line)) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      const content = line.replace(/^\d+\.\s/, '');
      result.push(`<li>${processInlineFormatting(content)}</li>`);
    }
    // Regular line
    else {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      if (line) {
        result.push(processInlineFormatting(line));
      } else {
        result.push('<br>');
      }
    }
  }

  // Close any open list
  if (inList) {
    result.push(`</${listType}>`);
  }

  return result.join('\n');
};

const processHeaders = (text: string): string => {
  return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${processInlineFormatting(content)}</h${level}>`;
  });
};

const processBlockquotes = (text: string): string => {
  return text.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
};

const processCodeBlocks = (text: string): string => {
  // Handle code blocks with language specification
  return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${language}>${code.trim()}</code></pre>`;
  });
};

const processLineBreaks = (text: string): string => {
  // Convert double line breaks to paragraphs
  return text
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    // Convert single line breaks to <br>
    .replace(/\n/g, '<br>');
};

// Main fast markdown processor
export const fastMarkdown = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Check cache first
  const cached = markdownCache.get(text);
  if (cached) return cached;

  let processed = text;

  // Process in order of complexity (most specific first)
  processed = processCodeBlocks(processed);
  processed = processHeaders(processed);
  processed = processBlockquotes(processed);
  processed = processLists(processed);
  processed = processLineBreaks(processed);

  // Clean up any double <br> tags
  processed = processed.replace(/<br><br>/g, '<br>');
  
  // Clean up empty paragraphs
  processed = processed.replace(/<p><\/p>/g, '');
  processed = processed.replace(/<p><br><\/p>/g, '<br>');

  // Cache the result
  markdownCache.set(text, processed);

  return processed;
};

// Lightweight alternative for simple formatting (even faster)
export const simpleFormat = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  const cacheKey = `simple_${text}`;
  const cached = markdownCache.get(cacheKey);
  if (cached) return cached;

  const processed = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>');

  markdownCache.set(cacheKey, processed);
  return processed;
};

// Clear cache function for memory management
export const clearMarkdownCache = (): void => {
  markdownCache.clear();
};

// Get cache stats for debugging
export const getMarkdownCacheStats = () => {
  return {
    size: markdownCache['cache'].size,
    maxSize: markdownCache['maxSize']
  };
}; 