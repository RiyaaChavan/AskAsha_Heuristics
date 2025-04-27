import { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const storage = getStorage(app);

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fileName, setFileName] = useState('No file chosen');
  const fileInputRef = useRef(null);
  
  // Separated state for each field to prevent form-wide re-renders
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [locationPreference, setLocationPreference] = useState('');
  const [resume, setResume] = useState(null);
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [professionalStage, setProfessionalStage] = useState('');

  // Get the complete form data when needed
  const getFormData = () => ({
    name,
    email,
    phone,
    location,
    locationPreference,
    resume,
    gender,
    education,
    professionalStage
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileName(selectedFile ? selectedFile.name : 'No file chosen');
    setResume(selectedFile);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!name || !email || !phone) {
        alert('Please fill in all required fields');
        return;
      }
      if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
      }
    }
    if (currentStep === 2) {
      if (!location) {
        alert('Please provide your location');
        return;
      }
    }
    if (currentStep === 3) {
      if (!education || !professionalStage) {
        alert('Please select your education level and professional stage');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const submitForm = async () => {
    try {
      let resumeURL = '';
      if (resume) {
        const storageRef = ref(storage, `resumes/${resume.name}`);
        await uploadBytes(storageRef, resume);
        resumeURL = await getDownloadURL(storageRef);
      }

      const formData = getFormData();
      
      await addDoc(collection(db, 'onboardingData'), {
        ...formData,
        resume: resumeURL,
        createdAt: new Date()
      });

      setIsCompleted(true);
      
      setTimeout(() => {
        navigate('/chatbot');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
    }
  };

  useEffect(() => {
    const detectLocation = () => {
      setTimeout(() => {
        setLocation('New York, NY');
      }, 1500);
    };
    detectLocation();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // Direct input components with individual state handlers
  const renderStep1 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.h2 className="text-2xl font-semibold text-white mb-4" variants={itemVariants}>
        Basic Information
      </motion.h2>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2" htmlFor="name">
          Full Name<span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </motion.div>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2" htmlFor="email">
          Email Address<span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </motion.div>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2" htmlFor="phone">
          Phone Number<span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </motion.div>
      
      <motion.div className="flex justify-end mt-4" variants={itemVariants}>
        <motion.button 
          onClick={nextStep} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-lg"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.h2 className="text-2xl font-semibold text-white mb-4" variants={itemVariants}>
        Location & Resume
      </motion.h2>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2" htmlFor="location">
          Location<span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={location ? '' : 'Detecting location...'}
          required
        />
      </motion.div>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2" htmlFor="locationPreference">
          Location Preference
        </label>
        <select
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          id="locationPreference"
          value={locationPreference}
          onChange={(e) => setLocationPreference(e.target.value)}
        >
          <option value="">Select preference (if different)</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </select>
      </motion.div>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2" htmlFor="resume">Upload Resume</label>
        <input
          type="file"
          id="resume"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="block w-full text-white bg-opacity-50 bg-black p-2 rounded-md"
        />
        <span className="text-gray-300 text-sm mt-1">{fileName}</span>
      </motion.div>
      
      <motion.div className="flex justify-between mt-4" variants={itemVariants}>
        <motion.button 
          onClick={prevStep} 
          className="text-white font-medium"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Back
        </motion.button>
        <motion.button 
          onClick={nextStep} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-lg"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.h2 className="text-2xl font-semibold text-white mb-4" variants={itemVariants}>
        Personal Details
      </motion.h2>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2">Gender</label>
        <div className="flex flex-wrap gap-4 bg-white bg-opacity-90 p-3 rounded-md">
          {['male', 'female', 'other', 'prefer-not'].map((g) => (
            <label key={g} className="flex items-center gap-2 text-gray-800">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={gender === g}
                onChange={(e) => setGender(e.target.value)}
              />
              {g === 'prefer-not' ? 'Prefer not to say' : g.charAt(0).toUpperCase() + g.slice(1)}
            </label>
          ))}
        </div>
      </motion.div>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2" htmlFor="education">
          Education Level<span className="text-red-500">*</span>
        </label>
        <select
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          id="education"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          required
        >
          <option value="">Select your highest education</option>
          <option value="high-school">High School</option>
          <option value="associate">Associate Degree</option>
          <option value="bachelor">Bachelor's Degree</option>
          <option value="master">Master's Degree</option>
          <option value="phd">Ph.D.</option>
          <option value="other">Other</option>
        </select>
      </motion.div>
      
      <motion.div className="flex flex-col mb-4" variants={itemVariants}>
        <label className="text-white font-medium mb-2" htmlFor="professionalStage">
          Professional Stage<span className="text-red-500">*</span>
        </label>
        <select
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          id="professionalStage"
          value={professionalStage}
          onChange={(e) => setProfessionalStage(e.target.value)}
          required
        >
          <option value="">Select your professional stage</option>
          <option value="student">Student / Early-Career</option>
          <option value="mid-level">Mid-Level Professional</option>
          <option value="senior">Senior / Leadership Role</option>
          <option value="entrepreneur">Entrepreneur / Founder</option>
          <option value="caregiver">Caregiver</option>
          <option value="retired">Retired / Semi-Retired</option>
          <option value="other">Other / Prefer not to say</option>
        </select>
      </motion.div>
      
      <motion.div className="flex justify-between mt-4" variants={itemVariants}>
        <motion.button 
          onClick={prevStep} 
          className="text-white font-medium"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Back
        </motion.button>
        <motion.button 
          onClick={submitForm} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-lg"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Complete
        </motion.button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-500 via-purple-700 to-rose-500">
      <motion.div 
        className="w-full max-w-xl p-8 bg-black bg-opacity-30 rounded-xl shadow-2xl backdrop-blur-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            className="text-3xl font-bold text-white mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Asha AI
          </motion.div>
          <p className="text-gray-200">Getting to know you better</p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="w-full bg-gray-200 bg-opacity-20 h-3 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        <div className="flex justify-center mb-8 space-x-4">
          {[1, 2, 3].map(step => (
            <motion.div 
              key={step} 
              className={`h-10 w-10 flex items-center justify-center rounded-full text-white shadow-md ${
                currentStep >= step 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                  : 'bg-gray-600'
              }`}
              whileHover={{ scale: 1.1 }}
              animate={currentStep >= step ? 
                { scale: [1, 1.2, 1], backgroundColor: "#8B5CF6" } : 
                { scale: 1 }
              }
              transition={{ duration: 0.3 }}
            >
              {currentStep > step ? (
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </motion.svg>
              ) : (
                step
              )}
            </motion.div>
          ))}
        </div>

        {!isCompleted ? (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </>
        ) : (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-6xl text-green-400 mb-4"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              ✓
            </motion.div>
            <motion.h2 
              className="text-2xl font-semibold mb-2 text-white"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              All Done!
            </motion.h2>
            <motion.p 
              className="text-gray-200 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Thank you for completing your profile. Asha AI is now ready to assist you better.
            </motion.p>
            <motion.div
              className="text-gray-200 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p>Redirecting to chatbot...</p>
              <div className="w-full mt-2 flex justify-center">
                <div className="w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;