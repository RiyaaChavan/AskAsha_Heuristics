import React from 'react';
import './HomePage.css';
import chatbotImage from '../assets/chatbot.png';
import { PlaceholdersAndVanishInput } from '../Components/Homepage/PlaceholdersAndVanishInput';
import { BentoGridDemo } from '../Components/Homepage/BentoGrid';

const HomePage: React.FC = () => {
    const placeholders = [
      "Find me jobs in Mumbai for Machine Learning" , 
      "Help me prepare for my interview" , 
      "How do I ask for a raise at my workplace ?  "
    ];
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
    };
    
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("submitted");
    };

  return (
    <div className="main-wrapper">
      <section className="hero-section">
        <div className="container">
          <div className="glow"></div>
          <div className="content-wrapper">
            <div className="text-section">
              <h1>Opportunities for Her.<span> Impact for All. </span></h1>
              <p>Get personalized career guidance, job recommendations, and interview preparation help.</p>
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
              />
            </div>
            <div className="image-section">
              <img 
                src={chatbotImage} 
                alt="AI Career Assistant"
                className="featured-image"
              />
            </div>
          </div>
        </div>
      </section>

       <section className="features-section">
        <h2 className="section-title">Our Features</h2>
        {/* Add debugging content */}
        <div style={{ padding: '20px', background: 'red', color: 'white', marginBottom: '20px' }}>
          Debug: This should be visible if the section renders
        </div>
        <BentoGridDemo />
        {/* Fallback content to test if BentoGridDemo is the issue */}
        <div style={{ padding: '20px', background: 'blue', color: 'white', marginTop: '20px' }}>
          Debug: Content after BentoGridDemo
        </div>
      </section>
    </div>
  );
};

export default HomePage;