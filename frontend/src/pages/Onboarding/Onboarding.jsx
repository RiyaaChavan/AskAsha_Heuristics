import { useState, useEffect, useRef } from 'react';
import './Onboarding.css';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fileName, setFileName] = useState('No file chosen');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    locationPreference: '',
    resume: null,
    gender: '',
    education: '',
    professionalStage: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileName(selectedFile ? selectedFile.name : 'No file chosen');
    setFormData({ ...formData, resume: selectedFile });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        alert('Please fill in all required fields');
        return;
      }
      
      if (!validateEmail(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.location) {
        alert('Please provide your location');
        return;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.education || !formData.professionalStage) {
        alert('Please select your education level and professional stage');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const submitForm = () => {
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    setIsCompleted(true);
  };

  const startChatbot = () => {
    alert('Redirecting to Asha AI chatbot...');
    // Redirect logic here
    // window.location.href = '/chatbot';
  };

  useEffect(() => {
    // Simulate location detection
    const detectLocation = () => {
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          location: 'New York, NY'
        }));
      }, 1500);
    };
    
    detectLocation();
  }, []);

  const renderStep1 = () => (
    <div className="form-step">
      <h2>Basic Information</h2>
      <p>Let's start with your essential details</p>
      
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleInputChange} 
          required 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          value={formData.email} 
          onChange={handleInputChange} 
          required 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          name="phone" 
          value={formData.phone} 
          onChange={handleInputChange} 
          required 
        />
      </div>
      
      <div className="buttons">
        <div></div> {/* Empty div for flex spacing */}
        <button type="button" className="btn-next" onClick={() => nextStep()}>Continue</button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2>Location & Resume</h2>
      <p>Tell us where you're based and share your background</p>
      
      <div className="form-group">
        <label htmlFor="location" id="location-label">
          {formData.location ? 'Your Location (Auto-detected)' : 'Your Location'}
        </label>
        <input 
          type="text" 
          id="location" 
          name="location" 
          value={formData.location}
          onChange={handleInputChange}
          placeholder={formData.location ? '' : 'Detecting your location...'}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="locationPreference" className="optional-label">Location Preference</label>
        <select 
          id="locationPreference" 
          name="locationPreference"
          value={formData.locationPreference}
          onChange={handleInputChange}
        >
          <option value="">Select preference (if different from current)</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="resume">Upload Resume</label>
        <div className="file-input-container">
          <label htmlFor="resume" className="file-input-label">Choose File</label>
          <input 
            type="file" 
            id="resume" 
            name="resume"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <div className="file-name">{fileName}</div>
        </div>
      </div>
      
      <div className="buttons">
        <button type="button" className="btn-prev" onClick={() => prevStep()}>Back</button>
        <button type="button" className="btn-next" onClick={() => nextStep()}>Continue</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h2>Personal Details</h2>
      <p>Help us understand your background better</p>
      
      <div className="form-group">
        <label>Gender</label>
        <div className="gender-options">
          <div className="gender-option">
            <input 
              type="radio" 
              id="gender-male" 
              name="gender" 
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleInputChange}
            />
            <label htmlFor="gender-male">Male</label>
          </div>
          
          <div className="gender-option">
            <input 
              type="radio" 
              id="gender-female" 
              name="gender" 
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleInputChange}
            />
            <label htmlFor="gender-female">Female</label>
          </div>
          
          <div className="gender-option">
            <input 
              type="radio" 
              id="gender-other" 
              name="gender" 
              value="other"
              checked={formData.gender === 'other'}
              onChange={handleInputChange}
            />
            <label htmlFor="gender-other">Other</label>
          </div>
          
          <div className="gender-option">
            <input 
              type="radio" 
              id="gender-prefer-not" 
              name="gender" 
              value="prefer-not"
              checked={formData.gender === 'prefer-not'}
              onChange={handleInputChange}
            />
            <label htmlFor="gender-prefer-not">Prefer not to say</label>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="education">Education Level</label>
        <select 
          id="education" 
          name="education"
          value={formData.education}
          onChange={handleInputChange}
          required
        >
          <option value="">Select your highest level of education</option>
          <option value="high-school">High School</option>
          <option value="associate">Associate Degree</option>
          <option value="bachelor">Bachelor's Degree</option>
          <option value="master">Master's Degree</option>
          <option value="phd">Ph.D.</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="professionalStage">Professional Stage</label>
        <select 
          id="professionalStage" 
          name="professionalStage"
          value={formData.professionalStage}
          onChange={handleInputChange}
          required
        >
          <option value="">Select your current professional stage</option>
          <option value="student">Student / Early-Career Professional</option>
          <option value="mid-level">Mid-Level Professional (3–7 years' experience)</option>
          <option value="senior">Senior / Leadership Role (8+ years' experience)</option>
          <option value="entrepreneur">Entrepreneur / Founder</option>
          <option value="caregiver">Full-Time Family Caregiver</option>
          <option value="retired">Retired / Semi-Retired</option>
          <option value="other">Other / Prefer not to say</option>
        </select>
      </div>
      
      <div className="buttons">
        <button type="button" className="btn-prev" onClick={() => prevStep()}>Back</button>
        <button type="button" className="btn-submit" onClick={() => submitForm()}>Complete</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="header">
        <div className="logo">Asha AI</div>
        <div className="subheading">Getting to know you better</div>
      </div>
      
      <div className="form-container">
        {!isCompleted ? (
          <>
            <div className="steps">
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>1</div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>2</div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>3</div>
            </div>
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </>
        ) : (
          <div className="completion-message active">
            <div className="check-icon">✓</div>
            <h2>All Done!</h2>
            <p>Thank you for completing your profile. Asha AI is now ready to assist you better.</p>
            <div className="buttons centered">
              <button className="btn-next" onClick={startChatbot}>Start Using Asha AI</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;