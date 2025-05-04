import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import profileIcon from "../assets/profile.png"
import Header from '../Components/Header';
import "./Profile.css"

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  locationPreference: string;
  gender: string;
  education: string;
  professionalStage: string;
  skills: string[];
}

export default function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/profile/${currentUser?.uid}`);
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#934f73]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="profile-container"
        >
          <div className="profile-grid">
            {/* Left Sidebar */}
            <div className="profile-sidebar">
              <div className="profile-header">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="profile-image-container"
                >
                  <div className="profile-image">
                    <img src={profileIcon} alt="Profile" />
                  </div>
                </motion.div>
                <h2 className="profile-name">{profile?.name}</h2>
                <p className="profile-email">{profile?.email}</p>
                <p className="profile-stage">{profile?.professionalStage}</p>
              </div>

              <div className="profile-info">
                <div className="info-item">
                  <p className="info-label">Phone</p>
                  <p className="info-value">{profile?.phone}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Location</p>
                  <p className="info-value">{profile?.location}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Gender</p>
                  <p className="info-value">{profile?.gender}</p>
                </div>
              </div>

              <button className="edit-profile-btn">
                Edit Profile
              </button>
            </div>

            {/* Main Content */}
            <div className="profile-content">
              <div className="professional-info">
                <h3 className="section-title">Professional Information</h3>
                <div className="info-grid">
                  <div>
                    <p className="info-label">Education</p>
                    <p className="info-value">{profile?.education}</p>
                  </div>
                  <div>
                    <p className="info-label">Location Preference</p>
                    <p className="info-value">{profile?.locationPreference}</p>
                  </div>
                </div>
              </div>

              <div className="skills-section">
                <h3 className="section-title">Skills & Expertise</h3>
                <div className="skills-container">
                  {profile?.skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="skill-tag"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="resume-section">
                <div className="resume-header">
                  <div>
                    <h3 className="section-title">Resume</h3>
                    <p className="update-text">Last updated: 2 days ago</p>
                  </div>
                  <button className="download-btn">
                    Download Resume
                  </button>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <p className="metric-value">12</p>
                  <p className="metric-label">Applications</p>
                </div>
                <div className="metric-card">
                  <p className="metric-value">5</p>
                  <p className="metric-label">Interviews</p>
                </div>
                <div className="metric-card">
                  <p className="metric-value">8</p>
                  <p className="metric-label">Saved Jobs</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

