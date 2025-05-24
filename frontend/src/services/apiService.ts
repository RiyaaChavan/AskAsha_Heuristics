// src/services/apiService.ts
import { sanitizeObject, createSanitizedFormData, isSqlSafe } from '../utils/apiUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiService = {
  createProfile: async (formData: FormData) => {
    try {
      // Using sanitized FormData
      const sanitizedFormData = new FormData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          // if (!isSqlSafe(value)) {
          //   throw new Error('Potentially unsafe input detected');
          // }
          sanitizedFormData.append(key, value);
        } else {
          sanitizedFormData.append(key, value);
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/create-profile`, {
        method: 'POST',
        body: sanitizedFormData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  getProfile: async (uid: string) => {
    try {
      // Validate uid to prevent injection
      if (!isSqlSafe(uid)) {
        throw new Error('Potentially unsafe input detected');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/profile/${uid}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (uid: string, data: any) => {
    try {
      // Validate uid and sanitize data
      if (!isSqlSafe(uid)) {
        throw new Error('Potentially unsafe input detected');
      }
      
      const sanitizedData = sanitizeObject(data);
      
      const response = await fetch(`${API_BASE_URL}/api/update-profile/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(sanitizedData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  parseResume: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch(`${API_BASE_URL}/api/parse-resume`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw error;
    }
  },

  async chat(message: string, userId: string) {
    try {
      // Validate and sanitize inputs
      if (!isSqlSafe(message) || !isSqlSafe(userId)) {
        throw new Error('Potentially unsafe input detected');
      }
      
      const sanitizedMessage = sanitizeObject(message);
      const sanitizedUserId = sanitizeObject(userId);
      
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          message: sanitizedMessage, 
          userId: sanitizedUserId 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in chat API:', error);
      throw error;
    }
  },
};