# 🎓 StudyMate: AI-Education Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**StudyMate** is a cutting-edge, multi-modal AI synthesis platform built for the **CIT Datathon**. It empowers students, teachers, and parents with personalized educational insights by leveraging advanced RAG (Retrieval-Augmented Generation) and Large Language Models.

---

## ✨ Key Features

- 🧠 **Educational Memory**: Remembers past performance and insights using Supabase to provide a truly personalized learning journey.
- 🤖 **RAG-Powered Chatbot**: Ask questions about your study materials and get context-aware answers backed by FAISS vector search.
- 📊 **Dynamic Dashboards**:
    - **Students**: Interactive learning and progress tracking.
    - **Teachers**: Automated student summaries and intervention triggers.
    - **Parents**: Clear insights into their child's academic growth.
- 🌍 **Multi-lingual Support**: Real-time translation of AI-generated summaries and chatbot responses.
- 📄 **Multi-modal Processing**: Upload PDFs and documents for instant AI analysis and synthesis.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router 7

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **AI Orchestration:** LangChain
- **LLM:** Google Gemini 1.5 Flash
- **Vector Database:** FAISS (CPU)
- **Embeddings:** HuggingFace / Gemini Embeddings
- **PDF Parsing:** PyMuPDF (fitz)

### Database & Security
- **Backend-as-a-Service:** Supabase (PostgreSQL + Auth)
- **Environment Management:** Python Dotenv

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Google Gemini API Key
- Supabase Project URL & Anon Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adhithyavm/AI-ED.git
   cd AI-ED
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   Create a `.env` file in `backend/`:
   ```env
   GEMINI_API_KEY=your_key
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   ```
   Start the backend:
   ```bash
   python main.py
   ```

3. **Frontend Setup:**
   ```bash
   cd ../ai-platform
   npm install
   ```
   Create a `.env` file in `ai-platform/`:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_GEMINI_KEY=your_key
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
AI-ED/
├── ai-platform/          # React Frontend application
│   ├── src/
│   │   ├── pages/       # Dashboard, Capture, Chatbot
│   │   ├── services/    # API & Supabase integration
│   │   └── components/  # Reusable UI elements
├── backend/              # FastAPI Python server
│   ├── main.py          # Entry point
│   ├── studymate.py      # Core RAG logic
│   └── uploads/         # Temporary storage for processed files
└── .gitignore            # Root-level git ignore rules
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for the CIT Datathon**
