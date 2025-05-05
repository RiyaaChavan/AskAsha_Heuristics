// src/services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiService = {
  createProfile: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/create-profile`, {
        method: 'POST',
        body: formData,
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
      const response = await fetch(`${API_BASE_URL}/api/profile/${uid}`);
      
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
      const response = await fetch(`${API_BASE_URL}/api/update-profile/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
};