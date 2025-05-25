"use client"

import { useState, useEffect } from "react"
import "./ProfilePage.css"
import ProfileView from "../Components/ProfilePage/ProfileView"
import { apiService } from "../services/apiService"

// Make sure this interface matches exactly what ProfileView expects
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  locationPreference: string;
  gender: string;
  education: string;
  professionalStage: string;
  resumeFile: string; // Not optional to match ProfileView's expectation
  resumeUpdated: string; // Not optional to match ProfileView's expectation
}

interface WorkExperience {
  company?: string;
  position?: string;
  duration?: string;
  description?: string;
}

export default function ProfilePage(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([])
  const [error, setError] = useState<string>("")

  // ProfilePage.tsx
  const handleUpdateProfile = async (field: keyof ProfileData, value: string) => {
    try {
      // Assuming you have the user's UID available
      const uid = "current_user_uid"; // Replace with actual user UID

      const response = await fetch(`/api/update-profile/${uid}`, {  // Updated URL
        method: 'PUT',  // Changed from PATCH to PUT to match Flask route
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: value
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local state if needed
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [field]: value,
        };
      });

      // Optionally show success message
      // toast.success('Profile updated successfully');

    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error message
      // toast.error('Failed to update profile');
      throw error;
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)

      // Get userId from localStorage
      const userId = localStorage.getItem('userId')

      if (!userId) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        // Fetch profile data from API
        const data = await apiService.getProfile(userId)

        if (data) {
          // Set basic profile data with defaults for required fields
          setProfile({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            locationPreference: data.locationPreference || "",
            gender: data.gender || "",
            education: data.education || "",
            professionalStage: data.professionalStage || "",
            resumeFile: data.resumeFile || "No resume uploaded", // Default value instead of undefined
            resumeUpdated: data.resumeUpdated || "Not available" // Default value instead of undefined
          })

          // Set skills from profile data
          if (data.skills && Array.isArray(data.skills)) {
            setSkills(data.skills)
          } else if (typeof data.skills === 'string') {
            try {
              // Try parsing if skills are stored as JSON string
              const parsedSkills = JSON.parse(data.skills)
              setSkills(Array.isArray(parsedSkills) ? parsedSkills : [])
            } catch (e) {
              console.error("Error parsing skills:", e)
              setSkills([])
            }
          }

          // Set work experience from profile data
          if (data.work_experience && Array.isArray(data.work_experience)) {
            setWorkExperience(data.work_experience)
          } else if (typeof data.work_experience === 'string') {
            try {
              // Try parsing if work_experience is stored as JSON string
              const parsedWorkExp = JSON.parse(data.work_experience)
              setWorkExperience(Array.isArray(parsedWorkExp) ? parsedWorkExp : [])
            } catch (e) {
              console.error("Error parsing work experience:", e)
              setWorkExperience([])
            }
          }
        } else {
          setError("Profile not found")
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="error-container">
        <h2>Profile Not Found</h2>
        <p>Unable to load profile information.</p>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="content-container">
        <ProfileView
          profile={profile}
          skills={skills}
          onUpdateProfile={handleUpdateProfile}
        />
      </div>
    </div>
  )
}