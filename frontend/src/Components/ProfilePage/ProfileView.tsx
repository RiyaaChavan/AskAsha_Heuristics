// ProfileView.tsx
"use client"

import { useState } from "react"
import { User, MapPin, Phone, GraduationCap, Edit2, Check, X } from "lucide-react"
import "./ProfileView.css"
import ResumeSection from "./ResumeSection"

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  locationPreference: string;
  gender: string;
  education: string;
  professionalStage: string;
  resumeFile: string;
  resumeUpdated: string;
}

interface ProfileViewProps {
  profile: ProfileData;
  skills: string[];
  onUpdateProfile: (field: keyof ProfileData, value: string) => Promise<void>;
}

// EditableField Component
interface EditableFieldProps {
  value: string;
  label: string;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
}

function EditableField({ value, label, onSave, className = "" }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(editedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  return (
    <div className={`editable-field ${className}`}>
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="edit-input"
          />
          <div className="edit-actions">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="save-btn"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="cancel-btn"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <span>{value || `No ${label} available`}</span>
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfileView({ profile, skills, onUpdateProfile }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "resume">("profile")

  // Capitalize first letter of each word
  const capitalize = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const handleSaveField = async (field: keyof ProfileData, value: string) => {
    await onUpdateProfile(field, value);
  };

  return (
    <div className="profile-grid">
      {/* Left sidebar */}
      <div className="sidebar">
        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-container">
              <User className="profile-avatar-icon" />
            </div>
          </div>

          <div className="profile-info">
            <h2 className="profile-name">
              <EditableField
                value={profile.name}
                label="name"
                onSave={(value) => handleSaveField("name", value)}
                className="name-field"
              />
            </h2>
            <p className="profile-email">
              <EditableField
                value={profile.email}
                label="email"
                onSave={(value) => handleSaveField("email", value)}
                className="email-field"
              />
            </p>
            <div className="profile-stage">
              <EditableField
                value={profile.professionalStage}
                label="professional stage"
                onSave={(value) => handleSaveField("professionalStage", value)}
              />
            </div>
          </div>

          <div className="profile-details">
            <div className="details-list">
              <div className="detail-item">
                <div className="detail-icon">
                  <Phone className="icon-small" />
                </div>
                <div className="detail-content">
                  <p className="detail-label">PHONE</p>
                  <EditableField
                    value={profile.phone}
                    label="phone"
                    onSave={(value) => handleSaveField("phone", value)}
                  />
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <MapPin className="icon-small" />
                </div>
                <div className="detail-content">
                  <p className="detail-label">LOCATION</p>
                  <EditableField
                    value={profile.location}
                    label="location"
                    onSave={(value) => handleSaveField("location", value)}
                  />
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <User className="icon-small" />
                </div>
                <div className="detail-content">
                  <p className="detail-label">GENDER</p>
                  <EditableField
                    value={profile.gender}
                    label="gender"
                    onSave={(value) => handleSaveField("gender", value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Professional Information */}
        <div className="info-card">
          <h2 className="section-title">Professional Information</h2>
          <div className="section-divider"></div>

          <div className="professional-info-grid">
            <div className="info-item">
              <div className="info-icon green">
                <GraduationCap className="icon-medium" />
              </div>
              <div className="info-content">
                <p className="info-label">Education</p>
                <EditableField
                  value={profile.education}
                  label="education"
                  onSave={(value) => handleSaveField("education", value)}
                />
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon green">
                <MapPin className="icon-medium" />
              </div>
              <div className="info-content">
                <p className="info-label">Location Preference</p>
                <EditableField
                  value={profile.locationPreference}
                  label="location preference"
                  onSave={(value) => handleSaveField("locationPreference", value)}
                />
              </div>
            </div>
          </div>

          <div className="skills-section">
            <h3 className="skills-title">Skills & Expertise</h3>

            <div className="skills-container">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="no-skills-message">No skills listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Resume Section */}
        <ResumeSection resumeFile={profile.resumeFile} resumeUpdated={profile.resumeUpdated} />
      </div>
    </div>
  )
}