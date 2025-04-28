# AskAsha Chatbot
Empowering Women’s Careers on the HerKey Platform 🌟

# ![Architecture Diagram](https://github.com/user-attachments/assets/325b76f7-8f1a-4215-8023-d2bdca68e3cd)

---

**AskAsha** is a next-generation AI-powered virtual assistant, purpose-built to empower women at every stage of their career journey through the **HerKey** platform.  
Designed with **empathy**, **inclusivity**, and **innovation**, AskAsha bridges the gaps women often face in accessing career growth resources, mentorship, and community support.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)

---

## 🌟 Project Overview

AskAsha is an AI-powered virtual assistant aimed at enhancing user engagement on the HerKey platform.  
Its mission is to empower women by providing:
- Career guidance (coaching, roadmaps, mock interviews)
- Job & event discovery (real-time listings, community events)
- Accessibility (voice interfaces, resume uploads)
- Ethical AI (gender-bias detection, RAG for up-to-date information)

---

## ✨ Key Features

| Feature | Description |
|:--------|:------------|
| **Job Listings** | Searchable interface that fetches live, relevant job listings via HerKey API. |
| **Events & Programs** | Curated discovery of women-focused events using RAG. |
| **Interview Assistant** | Mock interview sessions with real-time Q&A and personalized feedback. |
| **Roadmap Generator** | AI-driven progressive learning plans for career skills. |
| **Career Coach** | Advisory chatbot for resumes, negotiation, and confidence building. |
| **Voice Assistant** | Indian-English female voice interaction with speech-to-text and text-to-speech. |
| **Resume Parsing** | Upload resumes to auto-extract skills and improve personalization. |
| **Bias Detection** | Flagging and remediation of toxic or biased inputs via Ethical AI. |
| **Multimodal Attachments** | Send/receive documents, images, resumes directly within chat. |
| **User Onboarding** | Captures profile data for tailoring the entire user experience. |

---

## 🛠 Technologies Used

| Layer | Tools/Frameworks |
|:------|:-----------------|
| **Frontend** | React.js, TypeScript, TailwindCSS, lucide-react, framer-motion, Web Speech API |
| **Backend/API** | Node.js (Express), Python (FastAPI) |
| **AI & NLP** | LangChain, Cohere APIs, OpenAI GPT-4o-mini, HuggingFace Transformers |
| **Database** | MongoDB Atlas |
| **Resume Parsing** | pdfplumber, docx2txt, HuggingFace NER Models |
| **Voice Assistant** | webkitSpeechRecognition, SpeechSynthesisUtterance |
| **Bias Detection** | Toxic-BERT, FLAN-T5 |

---

## ⚙️ Setup Instructions

### Frontend Setup

```bash
# Clone frontend repository
git clone -b pushing https://github.com/RiyaaChavan/AskAsha_Heuristics.git
cd frontend

# Install dependencies
npm install

# Configure environment variables (.env)
VITE_API_URL=http://localhost:8000/api

# Start the development server
npm run dev
```

---

### Backend Setup

```bash
# Clone backend repository
git clone -b pushing https://github.com/RiyaaChavan/AskAsha_Heuristics.git
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure backend environment variables (.env)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/askasha
OPENAI_API_KEY=your_openai_key
COHERE_API_KEY=your_cohere_key

# Start services
# Node.js server
npm install
npm start

# Flask server
cd backend
python app.py
```
