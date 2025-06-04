# AskAsha Chatbot

# ![Architecture Diagram](https://github.com/user-attachments/assets/325b76f7-8f1a-4215-8023-d2bdca68e3cd)

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)

---

## 🌟 Project Overview

AskAsha is an AI-powered virtual assistant aimed at enhancing user engagement on the HerKey , Linkedin , Glassdoor platform.  
It provides tools like:
- Career guidance (coaching, roadmaps, mock interviews)
- Job & event discovery (real-time listings, community events)
- Accessibility (resume uploads)
- Ethical AI (gender-bias detection, RAG for up-to-date information)

---

## ✨ Key Features

| Feature | Description |
|:--------|:------------|
| **Job Listings** | Searchable interface that fetches live, relevant job listings |
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
git clone -b riya https://github.com/RiyaaChavan/AskAsha_Heuristics.git
cd frontend

# Install dependencies
npm install

# Configure environment variables (.env)

# Start the development server
npm run dev
```

---

### Backend Setup

```bash
# Clone backend repository
git clone -b riya https://github.com/RiyaaChavan/AskAsha_Heuristics.git
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Configure backend environment variables (.env)

# Flask server
cd backend
python app.py
```
