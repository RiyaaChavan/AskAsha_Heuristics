import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "./UserProfile.css";
import { apiService } from '../services/apiService';

interface WorkExperience {
  company?: string;
  position?: string;
  duration?: string;
  description?: string;
}

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
  resume_file?: string;
  work_experience?: WorkExperience[];
  created_at?: string;
}

export default function UserProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!currentUser?.uid) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }
        
        console.log("Fetching profile for user ID:", currentUser.uid);
        setLoading(true);
        
        const data = await apiService.getProfile(currentUser.uid);
        console.log("Profile data received:", data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setProfile(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please make sure your profile is set up.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleUpdateProfile = () => {
    navigate('/profile-setup');
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        
        // Validate file type
        const fileType = file.type;
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
          alert("Please select a valid resume file (PDF, DOC, or DOCX)");
          return;
        }
        
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          alert("File is too large. Maximum size is 5MB.");
          return;
        }
        
        setResumeFile(file);
        console.log(`Resume file selected: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)}KB)`);
      }
    } catch (error) {
      console.error("Error handling resume file selection:", error);
      alert("There was a problem selecting the resume file. Please try again.");
    }
  };
  
  const handleUpdateResume = async () => {
    if (!resumeFile || !currentUser?.uid) {
      return;
    }
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('uid', currentUser.uid);
      
      await apiService.createProfile(formData);
      
      // Refetch the profile to get updated skills & experience from the new resume
      const updatedProfile = await apiService.getProfile(currentUser.uid);
      setProfile(updatedProfile);
      
      setUploadSuccess(true);
      setResumeFile(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error updating resume:", error);
      alert("Failed to update resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewResume = () => {
    if (profile?.resume_file) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const pdfUrl = `${apiUrl}/uploads/${profile.resume_file}`;
        
        // Check if filename is valid first
        if (profile.resume_file === 'no_resume_provided') {
          alert('No resume has been uploaded yet. Please upload a resume first.');
          return;
        }
        
        // Set modal visibility
        setShowPdfModal(true);
        
        // Or open in new tab
        window.open(pdfUrl, '_blank');
      } catch (error) {
        console.error('Error opening resume:', error);
        alert('There was an error viewing your resume. Please try again.');
      }
    } else {
      alert('No resume available. Please upload a resume first.');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="btn-primary">
            Refresh
          </button>
          <button onClick={() => navigate('/profile-setup')} className="btn-secondary">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="user-profile-container">
      <div className="profile-main">
        <div className="profile-left-panel">
          <div className="profile-avatar">
            <img src="/profile-placeholder.svg" alt="Profile" />
          </div>
          <h2 className="profile-name">{profile?.name || "User"}</h2>
          <p className="profile-email">{profile?.email || "No email available"}</p>
          <p className="profile-stage">{profile?.professionalStage || "Professional"}</p>
          
          <div className="profile-details">
            <div className="detail-item">
              <h3>Phone</h3>
              <p>{profile?.phone || "N/A"}</p>
            </div>
            <div className="detail-item">
              <h3>Location</h3>
              <p>{profile?.location || "N/A"}</p>
            </div>
            <div className="detail-item">
              <h3>Gender</h3>
              <p>{profile?.gender || "N/A"}</p>
            </div>
          </div>
          
          <div className="sidebar-buttons">
            <button className="sidebar-btn active">
              <i className="fas fa-user"></i> My Profile
            </button>
            <button className="sidebar-btn" onClick={handleUpdateProfile}>
              <i className="fas fa-edit"></i> Update Profile
            </button>
            <button className="sidebar-btn logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
        
        <div className="profile-right-panel">
          <div className="profile-section">
            <h2>Professional Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Education</span>
                <span className="info-value">{profile?.education || "Not specified"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location Preference</span>
                <span className="info-value">{profile?.locationPreference || "Not specified"}</span>
              </div>
            </div>
          </div>
            
          <div className="profile-section document-section">
            <div className="section-header">
              <h2>Resume</h2>
              <div className="document-status">
                {profile?.resume_file && profile.resume_file !== 'no_resume_provided' ? (
                  <span className="status-badge">Updated: {formatDate(profile?.created_at)}</span>
                ) : (
                  <span className="status-badge missing">No resume</span>
                )}
              </div>
            </div>
            
            <div className="resume-preview-container">
              <div className="resume-pdf-container">
                {profile?.resume_file && profile.resume_file !== 'no_resume_provided' ? (
                  <div className="resume-pdf-viewer">
                    <div className="pdf-preview">
                      <img src={profile.resume_file.toLowerCase().endsWith('.pdf') ? 
                        "/pdf-preview.png" : "/doc-preview.png"} 
                        alt="Resume preview" 
                        className="preview-image" />
                    </div>
                    <div className="pdf-filename">
                      {profile.resume_file.split('_').pop()}
                    </div>
                  </div>
                ) : (
                  <div className="no-resume-container">
                    <div className="no-file-icon">
                      <i className="fas fa-file-upload"></i>
                    </div>
                    <p>No resume uploaded</p>
                  </div>
                )}
              </div>
              
              <div className="resume-actions-column">
                {profile?.resume_file && profile.resume_file !== 'no_resume_provided' && (
                  <button onClick={handleViewResume} className="resume-action-btn view-resume-btn">
                    <i className="fas fa-eye"></i> View Resume
                  </button>
                )}
                
                <div className="resume-upload-container">
                  <label className="resume-action-btn upload-resume-btn" htmlFor="resume-upload">
                    <i className="fas fa-upload"></i> {profile?.resume_file && profile.resume_file !== 'no_resume_provided' ? 
                      'Update Resume' : 'Upload Resume'}
                  </label>
                  <input 
                    id="resume-upload"
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleResumeChange} 
                    style={{display: 'none'}}
                  />
                </div>
                
                {resumeFile && (
                  <div className="selected-file">
                    <p title={resumeFile.name}>{resumeFile.name}</p>
                    <button onClick={handleUpdateResume} className="btn-primary">
                      <i className="fas fa-check"></i> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Skills & Expertise</h2>
            <div className="skills-container">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="skill-bubble">
                    {skill}
                  </span>
                ))
              ) : (
                <div className="no-data-container">
                  <i className="fas fa-lightbulb"></i>
                  <p className="no-data">No skills found. Upload a resume to extract skills.</p>
                </div>
              )}
            </div>
          </div>
            
          <div className="profile-section">
            <h2>Work Experience</h2>
            <div className="experience-container">
              {profile?.work_experience && profile.work_experience.length > 0 ? (
                profile.work_experience.map((exp, index) => (
                  <div key={index} className="experience-card">
                    <div className="experience-header">
                      <h3>{exp.position || "Position"}</h3>
                      <span className="experience-duration">{exp.duration || "Current"}</span>
                    </div>
                    <p className="experience-company">{exp.company || "Company"}</p>
                    {exp.description && <p className="experience-description">{exp.description}</p>}
                  </div>
                ))
              ) : (
                <div className="no-data-container">
                  <i className="fas fa-briefcase"></i>
                  <p className="no-data">No work experience found. Upload a resume to extract work history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {uploadSuccess && (
        <div className="success-notification">
          <i className="fas fa-check-circle"></i> Resume successfully updated!
        </div>
      )}
    </div>
  );
}