# 🎙️ EthioTalk — Voice AI Assistant for Ethiopian Languages

> **A bilingual (Amharic/English) voice-powered conversational AI platform** — Speak, get intelligently replied to, and track your progress. Built with React + NestJS + Groq/Gemini.

---

## ✨ What Is EthioTalk?

EthioTalk is a **full-stack voice AI application** that lets users speak naturally in **Amharic**, **Oromigna**, or **English** and receive intelligent, context-aware responses powered by **Groq (Mixtral 8x7B)** and **Google Gemini 2.0 Flash**. It transcribes speech in real time using the **Web Speech API**, detects the spoken language automatically, and reads the AI's response back aloud — creating a **hands-free, conversational experience**.

Designed for Ethiopian language speakers, language learners, and accessibility use cases, EthioTalk bridges the gap between cutting-edge AI and underserved languages.

---

## 🚀 Features

### 🎤 Voice Recording & Speech Recognition
- **Tap-to-record** with real-time audio waveform visualization
- Native **Web Speech API** support for Amharic (`am-ET`), Oromigna (`om-ET`), and English (`en-US`)
- **Language auto-detection** from transcribed text (Amharic Unicode vs. Latin script)
- **Recording timer** and visual feedback animations

### 🤖 AI-Powered Conversations
- **Dual AI engine** — Groq Mixtral 8x7B (English) and Gemini 2.0 Flash (Amharic) with automatic fallback
- **Intelligent language routing** — detects the spoken language and routes to the best AI model
- **Translation** between Amharic and English using Gemini
- **Editable transcriptions** — correct speech-to-text errors before sending to AI

### 🔊 Text-to-Speech
- Browser-native **speechSynthesis** reads AI responses aloud
- **Language-matched voice selection** — Amharic voices for Amharic text, English voices for English text
- One-click **speak/copy** for every AI response

### 📊 Statistics & Progress Tracking
- **Pronunciation scoring** — clarity scores tracked per recording
- **Usage dashboard** with total recordings, average scores, language breakdown bar chart
- **Recent score grid** — visualize improvement over time
- **Most-used language** insights

### 💾 Data Persistence
- **Dual-storage architecture**: NestJS + PostgreSQL (production) with seamless **localStorage fallback**
- **Full chat history** with date stamps, language badges, and per-message actions
- **Vercel-ready serverless API** with in-memory storage for zero-config deployment

### 🎨 User Experience
- **Dark/Light mode** toggle with persistent preference
- **Responsive, mobile-first** design with Tailwind CSS
- **Canvas-based animations** — particle orb visualization (idle), voice waveform (recording), SVG progress ring
- **Framer Motion** page transitions for a polished feel
- **Bilingual error messages** — errors shown in both Amharic and English

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, JavaScript (JSX) |
| **Styling** | Tailwind CSS 3, PostCSS |
| **Animation** | Framer Motion 12, Canvas API |
| **Icons** | Lucide React, React Icons |
| **Routing** | React Router DOM 7 |
| **Backend** | NestJS 10 (TypeScript) / Express (serverless) |
| **Database** | PostgreSQL + Prisma ORM |
| **AI / ML** | Groq API (Mixtral 8x7B), Google Gemini 2.0 Flash |
| **Speech** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Deployment** | Vercel (frontend SPA + serverless functions) |

---

## 📁 Project Structure

```
ethio-talk/
├── frontend/              # React SPA (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages (Home, About, Chat History, Stats)
│   │   └── utils/         # AI services, TTS, language detection, chat history
│   └── ...
├── backend/               # NestJS API + Prisma
│   ├── src/
│   │   ├── ai/            # AI controller & service (Groq + Gemini)
│   │   ├── chat/          # Chat CRUD controller & service
│   │   └── prisma/        # Database module & schema
│   ├── api/               # Vercel serverless entry point
│   └── ...
└── vercel.json            # Deployment configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** (optional — app works with localStorage-only mode)
- API keys for [Groq](https://console.groq.com) and [Google Gemini](https://aistudio.google.com)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/ethio-talk.git
cd ethio-talk

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Environment Variables
**Frontend** (`frontend/.env`):
```env
VITE_GROQ_API_KEY=gsk_your_groq_key
VITE_GEMINI_API_KEY=your_gemini_key
```

**Backend** (`backend/.env`):
```env
GROQ_API_KEY=gsk_your_groq_key
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=postgresql://user:pass@localhost:5432/ethiotalk
```

### 3. Run Locally
```bash
# Start backend (NestJS on port 3001)
cd backend && npm run start:dev

# Start frontend (Vite on port 5173)
cd frontend && npm run dev
```

### 4. Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```
Set `GROQ_API_KEY` and `GEMINI_API_KEY` in Vercel environment variables.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Send message → get AI response |
| POST | `/api/ai/translate` | Translate text between Amharic ↔ English |
| POST | `/api/chat` | Save chat message |
| GET | `/api/chat` | Get chat history (`?limit=N`) |
| DELETE | `/api/chat` | Clear chat history |
| GET | `/api/chat/stats` | Get usage statistics |
| DELETE | `/api/chat/stats` | Clear statistics |

---

## 🧪 Use Cases

- **🎯 Language Learning** — Practice Amharic or English by speaking and getting corrected responses
- **♿ Accessibility** — Hands-free voice interface for users who cannot type
- **🗣️ Voice Assistants** — Template for building Amharic/English voice agents
- **📊 Speech Analytics** — Track pronunciation scores and language usage over time
- **🌍 Bridging the Digital Divide** — Bringing AI to Ethiopian languages with minimal infrastructure

---

## 🧠 Architecture Highlights

- **Graceful Degradation** — Works fully offline/localStorage when the backend is unreachable; falls back to browser-to-AI direct calls
- **Smart AI Routing** — Amharic text → Gemini; English text → Groq; each falls back to the other
- **Dual Deployment** — Traditional Node/NestJS or Vercel serverless from the same codebase
- **Zero Auth Required** — Designed as a single-user/personal tool (easily extendable to multi-user)



---

## 🤝 Let's Build Together

**EthioTalk** is a demonstration of what's possible when modern AI meets Ethiopian languages. Whether you're looking to:
- Build a custom voice assistant for your product
- Add Amharic/English voice support to your app
- Create a language learning platform
- Deploy a production-ready AI voice stack

**I'm available for freelance work.** Let's discuss your project — reach out to collaborate or customize this solution for your needs.

---

> **Made with ❤️ for Ethiopian languages and the global AI community.**
