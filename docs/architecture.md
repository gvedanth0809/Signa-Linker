# SignaLink System Architecture

SignaLink is designed as a five-layer assistive communication system that translates Indian Sign Language (ISL) hand gestures into real-time text and synthesized speech, while providing an intuitive typed communication interface.

```
       +---------------------------------------------+
       |           Layer 1: Input Layer              |
       |  Webcam Video Stream | Virtual Text Typing  |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |      Layer 2: Computer Vision Layer         |
       |  MediaPipe Hands (21 3D Skeletal Landmarks) |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |      Layer 3: Machine Learning Layer        |
       |  Wrist-Centered Coordinate Normalization    |
       |  Scale-Invariant Feature Extraction         |
       |  Random Forest & Heuristic Classifier       |
       |  Confidence & Unknown Rejection Engine      |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |        Layer 4: Application Layer           |
       |  FastAPI Backend (/api/predict, /api/signs) |
       |  React + Vite Responsive Web UI             |
       |  Web Speech API (Text-to-Speech Engine)     |
       |  Interactive Transcript Manager             |
       +---------------------------------------------+
                              |
                              v
       +---------------------------------------------+
       |      Layer 5: Generative AI Assistance      |
       |  Ollama Local Model Runtime (Gemma:2b)      |
       |  Contextual Rephrasing & Response Suggester |
       +---------------------------------------------+
```

## 1. Input Layer
- **Hardware Capture:** Accesses user webcam at 30 fps using `navigator.mediaDevices.getUserMedia`.
- **Privacy First:** Frames are processed locally in memory. No video or raw camera streams are persisted or uploaded externally.
- **Bi-directional Input:** Includes keyboard text input for hearing/non-signing participants.

## 2. Computer Vision Layer
- **Hand Detection:** MediaPipe extracts 21 3D spatial coordinates `(x, y, z)` per hand.
- **Landmark Topology:** Tracks wrist, thumb (CMC, MCP, IP, Tip), and four fingers (MCP, PIP, DIP, Tip).

## 3. Machine Learning Layer
- **Geometric Invariance:** Coordinates are translated relative to wrist landmark 0:
  $$\Delta \mathbf{p}_i = \mathbf{p}_i - \mathbf{p}_0$$
  and scaled by the maximum Euclidean distance:
  $$d_{\max} = \max_{i} \|\Delta \mathbf{p}_i\|_2$$
  $$\mathbf{f}_i = \frac{\Delta \mathbf{p}_i}{d_{\max}}$$
- **Classifier Models:** Evaluated Logistic Regression, Support Vector Machine (RBF kernel), and Random Forest.
- **Confidence Filtering:** Predictions with confidence below $0.65$ or classified as `UNKNOWN` are automatically rejected to prevent noise from entering conversation transcripts.

## 4. Application Layer
- **Backend:** FastAPI asynchronously serves `/api/health`, `/api/signs`, `/api/predict`, and `/api/assistant/rephrase`.
- **Frontend:** Built with React 19 and Vite, featuring dark green/teal accessibility color palette, large tactile buttons, and Web Speech API synthesis.

## 5. Generative AI Assistance
- Connects to local Ollama runtime hosting Gemma. Rephrases raw recognized gestures into natural, polite conversational sentences and generates quick response chips.
