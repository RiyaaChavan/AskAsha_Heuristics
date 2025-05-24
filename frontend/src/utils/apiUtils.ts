/**
 * Utility functions for handling API data safely
 * Prevents XSS and SQL injection attacks
 */

/**
 * Sanitizes a string to prevent XSS attacks by escaping HTML special characters
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitizes an object by recursively sanitizing all string values
 */
export const sanitizeObject = (data: any): any => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return sanitizeString(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeObject(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Validates input to check for SQL injection patterns
 * Returns true if input is safe, false if potentially dangerous
 */
export const isSqlSafe = (input: string): boolean => {
  if (!input) return true;
  
  // Common SQL injection patterns
  const sqlPatterns = [
    /(\b(select|insert|update|delete|drop|alter|exec|union|create|where)\b.*\b(from|into|table|database|values)\b)/i,
    /('|").*(\1).*;/i,
    /--/,
    /\/\*/,
    /;\s*$/,
    /\b(or|and)\b\s+\w+\s*(=|<|>|<=|>=)\s*\w+/i
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Creates a FormData object with sanitized string values
 */
export const createSanitizedFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (typeof value === 'string') {
        formData.append(key, sanitizeString(value));
      } else {
        formData.append(key, value);
      }
    }
  }
  
  return formData;
};
