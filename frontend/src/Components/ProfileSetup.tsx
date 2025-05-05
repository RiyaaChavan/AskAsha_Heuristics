import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import './ProfileSetup.css';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  locationPreference: string;
  gender: string;
  education: string;
  professionalStage: string;
  resume: File | null;
}

export const ProfileSetup = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    location: '',
    locationPreference: '',
    gender: '',
    education: '',
    professionalStage: '',
    resume: null
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const checkProfile = async () => {
      if (!currentUser?.uid) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/${currentUser.uid}`);
        if (response.ok) {
          navigate('/jobsearch');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        resume: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Add this line to clear any previous errors
    
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        formDataToSend.append(key, value);
      }
    });
    formDataToSend.append('uid', currentUser?.uid || '');

    try {
      console.log("Submitting profile to:", `${import.meta.env.VITE_API_URL}/create-profile`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/create-profile`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        console.log("Profile created successfully");
        // Add a small delay before redirecting
        setTimeout(() => {
          navigate('/jobsearch', { replace: true });
        }, 300);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Network error while creating profile. Please try again.');
        console.error("Profile creation failed:", errorData);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Network error while creating profile. Please try again.');
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <div className="loading-spinner"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-header">
        <h2 className="setup-title">
          Complete Your Profile
        </h2>

        <div className="progress-section">
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar"
              initial={{ width: "0%" }}
              animate={{ width: `${(step/3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="progress-labels">
            <span className={`progress-label ${step >= 1 ? 'active' : ''}`}>Basic Info</span>
            <span className={`progress-label ${step >= 2 ? 'active' : ''}`}>Location & Preferences</span>
            <span className={`progress-label ${step >= 3 ? 'active' : ''}`}>Professional Details</span>
          </div>
        </div>
      </div>

      <div className="form-wrapper">
        <motion.div 
          className="form-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form className="setup-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="form-step"
              >
                <div className="form-field">
                  <label className="field-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                    readOnly
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="form-step"
              >
                <div className="form-field">
                  <label className="field-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Location Preference</label>
                  <select
                    name="locationPreference"
                    value={formData.locationPreference}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                  >
                    <option value="">Select preference</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="form-step"
              >
                <div className="form-field">
                  <label className="field-label">Education</label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Professional Stage</label>
                  <select
                    name="professionalStage"
                    value={formData.professionalStage}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                  >
                    <option value="">Select stage</option>
                    <option value="student">Student</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">Resume</label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                    className="field-input file-input"
                    accept=".pdf,.doc,.docx"
                    required
                  />
                </div>
              </motion.div>
            )}

            <div className="form-navigation">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="nav-button prev-button"
                >
                  Previous
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="nav-button next-button"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="nav-button submit-button"
                >
                  Complete Profile
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};