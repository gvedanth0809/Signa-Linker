# SIGNALINK
> **"Bridging Hands, Connecting Voices."**

SignaLink is an AI-powered communication assistant designed to bridge communication barriers between individuals who use sign language and those who do not understand it.

---

## 🌟 Highlights & Features
- **Real-Time Hand Landmark Extraction:** Uses MediaPipe to track 21 3D hand skeletal landmarks through a standard webcam.
- **Scale- & Position-Invariant ML:** Normalized feature extraction (wrist-relative translation and maximum Euclidean distance scaling) ensures accuracy across diverse camera angles and distances.
- **Trained ISL Classifier:** Pre-trained classifier supporting core Indian Sign Language vocabulary (`HELLO`, `THANK_YOU`, `YES`, `NO`, `PLEASE`, `GOOD`, `BAD`, `PEACE`, `HELP`, `I_LOVE_YOU`).
- **Confidence Filtering & Unknown Rejection:** Automatically identifies out-of-distribution noise and ambiguous hand poses, rejecting false triggers.
- **Editable Conversation Transcript:** Users can build sentences, edit tokens, and clear conversation history.
- **Text-to-Speech (TTS):** Integrated Web Speech API synthesizes spoken speech from confirmed sign sequences.
- **Two-Way Communication:** Non-signers can type responses back, enabling natural bidirectional conversation.
- **AI-Powered Language Assistant:** Optional Gemma/Ollama integration to polish raw sign sequences into natural, polite sentences.
- **Learning & Practice Mode:** Visual dictionary cards displaying hand gestures and guidance for students and beginners.

---

## 🏗️ System Architecture

```
Webcam Frame ──> MediaPipe (21 3D Landmarks) ──> Feature Normalization
                                                        │
                                                        ▼
Text-to-Speech <── Transcript Panel <── Prediction Card <── ML Classifier
```

- **Frontend:** React.js, Vite, Lucide Icons, Web Speech API
- **Backend:** FastAPI, Uvicorn, Pydantic, Scikit-learn, NumPy, Joblib
- **Local AI (Optional):** Ollama + Gemma 2B

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# In project root
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# Install backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI backend
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in Chrome or any modern browser with webcam permissions enabled.

---

## 🧪 Testing

Run backend automated tests:
```bash
python -m pytest backend/tests/test_api.py -v
```

Train and evaluate the gesture models:
```bash
python training/prepare_dataset.py
python training/train_classifier.py
python training/evaluate_model.py
```

---

## 🔒 Security & Privacy
- **Local Processing:** Camera frames are processed strictly in the client's browser memory via MediaPipe. No video streams are saved to disk or transmitted to third-party servers.
- **Permission Control:** Webcam feeds can be initiated and paused anytime with the explicit Start/Stop controls.
- **Responsible Assistive Tech:** Clearly identifies recognized vocabulary while safely discarding ambiguous gestures.
