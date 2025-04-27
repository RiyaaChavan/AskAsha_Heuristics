AskAsha - Career Empowerment Chatbot for HerKey.
AskAsha is a conversational AI assistant built for the HerKey platform to empower women's careers.
It provides career guidance, job discovery, interview practice, skill roadmaps, and more — through an accessible, ethical, and voice-enabled chatbot experience.

✨ Key Features
Job Listings Search (real-time based on location/skills)

Events & Community Program Discovery

Interview Assistant with Mock Q&A

Personalized Career Roadmap Generation

Resume Parsing & Skill Extraction

Voice Assistant (Indian English, Female Voice)

Bias Detection for Ethical AI Interactions

Multimodal File Uploads

Smooth Onboarding Experience

⚙️ Tech Stack

Frontend: React, TypeScript, TailwindCSS, lucide-react, framer-motion

Speech: Web Speech API (Speech-to-Text, Text-to-Speech)

Backend: Node.js (Express) / Python (FastAPI)

AI/NLP: LangChain, Cohere, OpenAI GPT-4o-mini, HuggingFace Transformers

Database: MongoDB


🛠️ Local Setup Instructions

Frontend

cd frontend

npm install

npm run dev

Frontend will typically run on http://localhost:5173 (or similar).


Backend


cd backend
python app.py
Backend will start the API services — make sure Python dependencies are installed (e.g., fastapi, uvicorn, langchain, openai, etc.).

🏗️ System Architecture

Frontend (React) → API Layer (Node.js/Python) → AI Services (LLMs, RAG, NER, Bias Detection)
Frontend sends user input (chat, uploads, voice) to backend.

API Layer processes requests and interacts with AI/NLP services.

Responses are returned and rendered dynamically in the chat interface.

📁 Project Structure

/frontend     # React app

/backend      # Python app (FastAPI/Node services)
