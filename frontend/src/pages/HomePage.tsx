import React from 'react';
import './HomePage.css';
import chatbotImage from '../assets/chatbot.png';
import { PlaceholdersAndVanishInput } from '../Components/Homepage/PlaceholdersAndVanishInput';
import { BentoGridDemo } from '../Components/Homepage/BentoGrid';
import { StickyScroll } from '../Components/Homepage/StickyScroll'; 
import biasIcon from "../assets/bias.svg"
import agenticIcon from "../assets/agentic.svg"
import profanityIcon from "../assets/profanity.svg"
import securityIcon from "../assets/security.svg"
import "../Components/Homepage/StickyScroll.css"
import "./fixed-green-bg.css"

const HomePage: React.FC = () => {
  const placeholders = [
    "Find me jobs in Mumbai for Machine Learning",
    "Help me prepare for my interview",
    "How do I ask for a raise at my workplace ?  "
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  // Content for the sticky scroll section
  const journeyContent = [
    {
      title: "Profanity Filter with Gentle Moderation",
      description:
        "Screens every message using a Profanity Detection API, politely prompting users to rephrase instead of blocking them harshly.",
      content: (
      <div className="sticky-scroll-demo-content journey-step-1 green-bg">
          <img src={profanityIcon} alt="Skill Development" className="sticky-scroll-demo-image" />
        </div>
      ),
    },
    {
      title: "Ethical AI Guardrails",
      description:
        "Implements multi-layered safety checks — from toxicity detection to ethical rewriting — ensuring responses are always appropriate and empowering.",
      content: (
        <div style={{ backgroundColor: '#87c05a' }} className="sticky-scroll-demo-content journey-step-2 ">
          <img src={securityIcon} alt="Job Recommendations" className="sticky-scroll-demo-image" />
        </div>
      ),
    },
    {
      title: "Bias Detection & Correction",
      description:
        "Detects gender bias using TOXIC-BERT and rewrites harmful responses with Flan-T5 to ensure inclusive, respectful conversations. ",
      content: (
        <div style={{ backgroundColor: '#87c05a' }} className="sticky-scroll-demo-content journey-step-3">
          <img src={biasIcon} alt="Interview Prep" className="sticky-scroll-demo-image" />
        </div>
      ),
    },
    {
      title: "Agentic Chain-of-Thought Modeling",
      description:
        "Simulates human-like reasoning using Agentic AI flows, adapting dynamically to user responses during interviews and conversations.",
      content: (
        <div style={{ backgroundColor: '#87c05a' }} className="sticky-scroll-demo-content journey-step-4">
          <img src={agenticIcon} alt="Skill Development" className="sticky-scroll-demo-image" />
        </div>
      ),
    },
  ];

  return (
    <div className="main-wrapper">
      <section className="hero-section">
        <div className="container">
          <div className="glow"></div>
          <div className="content-wrapper">
            <div className="text-section">
              <h1>Opportunities for Her.<span> Impact for All.</span></h1>
              <p>Unlock personalized career guidance, curated job and event recommendations, expert interview prep, and step-by-step career roadmaps - all tailored to your goals!</p>
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
        <h2 className="section-title">
            Our Features
        </h2>
        <div className="app-container">
          <BentoGridDemo />
        </div>
      </section>

       {/* New section for the sticky scroll component */}
      <section className="journey-section">
        <h2 className="section-title">Your Career Journey</h2>
        <p className="section-subtitle">
          Navigate your professional growth with our intelligent platform
        </p>
        <div className="sticky-scroll-wrapper">
          <StickyScroll content={journeyContent} />
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;