import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ProfileSetup.css';

// Define the Props interface
interface ProfileSetupProps {
  onProfileComplete: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileComplete }) => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        locationPreference: '',
        gender: '',
        education: '',
        professionalStage: '',
        resume: null as File | null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                resume: file,
            }));
        }
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setSubmitting(true);
        setError('');
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'resume' && value !== null) {
                    formDataToSend.append(key, String(value));
                }
            });
            if (formData.resume instanceof File) {
                formDataToSend.append('resume', formData.resume);
            }

            // Simulated API call
            console.log("Submitting profile data", formDataToSend);
            
            // Call the callback to show the header
            onProfileComplete();
            
            // Redirect to jobsearch after successful submission
            navigate('/jobsearch', { replace: true });
        } catch (err) {
            console.error("Profile submission error:", err);
            setError('Error creating profile. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Rest of the component remains the same
    return (
        <div className="profile-setup-page">
            {/* ... existing JSX ... */}
            <div className="profile-setup-header">
                <h2 className="setup-title">Complete Your Profile</h2>
            </div>
            <div className="form-wrapper">
                <motion.div 
                    className="form-container" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                >
                    <form className="setup-form" onSubmit={handleSubmit}>
                        {/* ... form steps ... */}
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
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Complete Profile'}
                                </button>
                            )}
                        </div>
                        {error && <p className="error-message">{error}</p>}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfileSetup;