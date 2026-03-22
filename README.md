# 🚀 AI Models Arena (2026 Edition)

Compare leading Large Language Models (LLMs) side-by-side with a premium, high-performance interface. Built for the **GitHub Models Marketplace**, this arena supports 40+ models across all major providers.

![Demo Screen](https://img.shields.io/badge/Status-Live-success)
![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![LiteLLM](https://img.shields.io/badge/Routing-LiteLLM-orange)

## ✨ Features
- **Unrivaled Model Coverage**: Support for GPT-4o, GPT-4.5, o1, o3-mini, Llama 3.3, Mistral Large 2, DeepSeek-R1, Grok-3, and many more.
- **Premium UI/UX**: Dark-mode, glassmorphic design with real-time micro-animations.
- **Rich LLM Formatting**: Full **Markdown** rendering for code blocks, LaTeX, headers, and tables.
- **Dynamic Test Engine**: A standalone bulk-test script to validate model connectivity and latency across the entire marketplace.
- **Hybrid Routing**: Seamlessly handle multiple tokens and providers via LiteLLM.
- **Live Performance Stats**: Track tokens per second and latency for every inference call.

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons, React-Markdown.
- **Backend**: Python 3.12+, FastAPI, LiteLLM, HTTPX.
- **AI Hub**: GitHub Models (Azure AI Inference).

## 🚀 Getting Started

### 1. Prerequisites
- A GitHub account for OAuth.
- A **GitHub Personal Access Token (PAT)** with `models:read` scope for bulk testing.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory:
```env
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
FRONTEND_URL=http://localhost:5173
```
Run the server:
```bash
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Running the Bulk Test Engine
```bash
set GITHUB_TOKEN=your_pat_here
python backend/test_models.py
```

## 🛡️ Security
This project uses **GitHub OAuth** for zero-friction login. All tokens are handled securely and never logged. Sensitive environment variables are excluded from the repository.

## 📄 License
MIT License - Created by [Arjun123sh](https://github.com/Arjun123sh).
