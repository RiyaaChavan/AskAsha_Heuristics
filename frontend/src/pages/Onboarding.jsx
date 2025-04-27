import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


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

  // Replace the submitForm function with this updated version
  const submitForm = async () => {
    try {
      let skills = [];
      
      // Extract skills from resume if a file was provided
      if (resume) {
        const formData = new FormData();
        formData.append('file', resume);
        
        try {
          // Extract skills from resume
          const skillsResponse = await axios.post('http://localhost:5001/extract-skills', formData);
          skills = skillsResponse.data.skills || [];
          console.log('Extracted skills:', skills);
        } catch (resumeError) {
          console.error('Error extracting skills:', resumeError);
        }
      }

      // Get all form data
      const userData = getFormData();

      // Send data to MongoDB through API (without uploading resume)
      const response = await axios.post('/api/onboarding', {
        ...userData,
        skills: skills, // Add extracted skills to the user data
        createdAt: new Date()
      });

      console.log('Server response:', response.data);

      setIsCompleted(true);

      setTimeout(() => {
        navigate('/chatbot');
      }, 2000);

    } catch (error) {
      console.error('Error during form submission:', error);
      if (error.response) {
        console.error('Server error:', error.response.data);
        alert(`Server error: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('No response from server. Please try again later.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };




 
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
          className="bg-gray-600 text-white px-6 py-2 rounded-md shadow-lg"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Back
        </motion.button>
        <motion.button
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-lg"
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
        <label className="text-white font-medium mb-2" htmlFor="gender">
          Gender<span className="text-red-500">*</span>
        </label>
        <select
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
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
          <option value="">Select your education level</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="postgraduate">Postgraduate</option>
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
          <option value="entry">Entry Level</option>
          <option value="mid">Mid Level</option>
          <option value="senior">Senior Level</option>
        </select>
      </motion.div>


      <motion.div className="flex justify-between mt-4" variants={itemVariants}>
        <motion.button
          onClick={prevStep}
          className="bg-gray-600 text-white px-6 py-2 rounded-md shadow-lg"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Back
        </motion.button>
        <motion.button
          onClick={submitForm}
          className="bg-green-600 text-white px-6 py-2 rounded-md shadow-lg"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Submit
        </motion.button>
      </motion.div>
    </motion.div>
  );


  const renderFinalStep = () => (
    <motion.div className="flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isCompleted ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="text-white text-center text-xl"
      >
        <h2 className="font-bold">Onboarding Complete!</h2>
        <p>You will be redirected shortly.</p>
      </motion.div>
    </motion.div>
  );


  return (
    <div className="bg-gray-800 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-md shadow-lg">
        {isCompleted ? renderFinalStep() : currentStep === 1 ? renderStep1() : currentStep === 2 ? renderStep2() : renderStep3()}
      </div>
    </div>
  );
};


export default Onboarding;
