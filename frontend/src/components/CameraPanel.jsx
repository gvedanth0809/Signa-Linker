import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Video, Sparkles, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

// Canonical landmark profiles for real-time testing / simulation
const TEST_PROFILES = {
  HELLO: [
    0.5, 0.8, 0.0, 0.42, 0.72, -0.01, 0.38, 0.65, -0.01, 0.35, 0.58, -0.01, 0.32, 0.52, -0.01,
    0.45, 0.55, 0.0, 0.43, 0.47, 0.0, 0.41, 0.39, 0.0, 0.39, 0.31, 0.0,
    0.50, 0.53, 0.0, 0.50, 0.45, 0.0, 0.50, 0.37, 0.0, 0.50, 0.29, 0.0,
    0.55, 0.55, 0.0, 0.56, 0.47, 0.0, 0.57, 0.39, 0.0, 0.58, 0.31, 0.0,
    0.60, 0.58, 0.0, 0.62, 0.51, 0.0, 0.64, 0.44, 0.0, 0.66, 0.37, 0.0
  ],
  PEACE: [
    0.5, 0.8, 0.0, 0.42, 0.72, -0.01, 0.44, 0.75, 0.03, 0.44, 0.78, 0.02, 0.44, 0.76, 0.01,
    0.45, 0.55, 0.0, 0.42, 0.47, 0.0, 0.39, 0.39, 0.0, 0.36, 0.31, 0.0,
    0.50, 0.53, 0.0, 0.53, 0.45, 0.0, 0.56, 0.37, 0.0, 0.59, 0.29, 0.0,
    0.55, 0.55, 0.0, 0.55, 0.59, 0.05, 0.55, 0.63, 0.03, 0.55, 0.61, 0.01,
    0.60, 0.58, 0.0, 0.60, 0.62, 0.05, 0.60, 0.66, 0.03, 0.60, 0.64, 0.01
  ],
  GOOD: [
    0.5, 0.8, 0.0, 0.42, 0.72, -0.01, 0.38, 0.64, 0.0, 0.36, 0.56, 0.0, 0.34, 0.48, 0.0,
    0.45, 0.55, 0.0, 0.45, 0.59, 0.05, 0.45, 0.63, 0.03, 0.45, 0.61, 0.01,
    0.50, 0.53, 0.0, 0.50, 0.57, 0.05, 0.50, 0.61, 0.03, 0.50, 0.59, 0.01,
    0.55, 0.55, 0.0, 0.55, 0.59, 0.05, 0.55, 0.63, 0.03, 0.55, 0.61, 0.01,
    0.60, 0.58, 0.0, 0.60, 0.62, 0.05, 0.60, 0.66, 0.03, 0.60, 0.64, 0.01
  ],
  YES: [
    0.5, 0.8, 0.0, 0.42, 0.72, -0.01, 0.42, 0.76, 0.05, 0.42, 0.80, 0.03, 0.42, 0.78, 0.01,
    0.45, 0.55, 0.0, 0.45, 0.59, 0.05, 0.45, 0.63, 0.03, 0.45, 0.61, 0.01,
    0.50, 0.53, 0.0, 0.50, 0.57, 0.05, 0.50, 0.61, 0.03, 0.50, 0.59, 0.01,
    0.55, 0.55, 0.0, 0.55, 0.59, 0.05, 0.55, 0.63, 0.03, 0.55, 0.61, 0.01,
    0.60, 0.58, 0.0, 0.60, 0.62, 0.05, 0.60, 0.66, 0.03, 0.60, 0.64, 0.01
  ],
  NO: [
    0.5, 0.8, 0.0, 0.42, 0.72, -0.01, 0.42, 0.76, 0.05, 0.42, 0.80, 0.03, 0.42, 0.78, 0.01,
    0.45, 0.55, 0.0, 0.45, 0.47, 0.0, 0.45, 0.39, 0.0, 0.45, 0.31, 0.0,
    0.50, 0.53, 0.0, 0.50, 0.57, 0.05, 0.50, 0.61, 0.03, 0.50, 0.59, 0.01,
    0.55, 0.55, 0.0, 0.55, 0.59, 0.05, 0.55, 0.63, 0.03, 0.55, 0.61, 0.01,
    0.60, 0.58, 0.0, 0.60, 0.62, 0.05, 0.60, 0.66, 0.03, 0.60, 0.64, 0.01
  ],
  I_LOVE_YOU: [
    0.5, 0.8, 0.0, 0.42, 0.72, -0.01, 0.34, 0.67, 0.0, 0.28, 0.62, 0.0, 0.22, 0.57, 0.0,
    0.45, 0.55, 0.0, 0.45, 0.47, 0.0, 0.45, 0.39, 0.0, 0.45, 0.31, 0.0,
    0.50, 0.53, 0.0, 0.50, 0.57, 0.05, 0.50, 0.61, 0.03, 0.50, 0.59, 0.01,
    0.55, 0.55, 0.0, 0.55, 0.59, 0.05, 0.55, 0.63, 0.03, 0.55, 0.61, 0.01,
    0.60, 0.58, 0.0, 0.65, 0.51, 0.0, 0.70, 0.44, 0.0, 0.75, 0.37, 0.0
  ]
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17]                               // Palm base
];

export default function CameraPanel({ onLandmarksDetected, isModelReady }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const handsModelRef = useRef(null);
  const lastInferenceTime = useRef(0);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [fps, setFps] = useState(0);
  const [activeSimulation, setActiveSimulation] = useState(null);

  // Draw landmarks on overlay canvas
  const drawLandmarks = useCallback((landmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || landmarks.length < 63) return;

    // Draw skeletal connections
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2d6a4f';
    HAND_CONNECTIONS.forEach(([i, j]) => {
      const x1 = landmarks[i * 3] * canvas.width;
      const y1 = landmarks[i * 3 + 1] * canvas.height;
      const x2 = landmarks[j * 3] * canvas.width;
      const y2 = landmarks[j * 3 + 1] * canvas.height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw keypoints
    for (let i = 0; i < 21; i++) {
      const x = landmarks[i * 3] * canvas.width;
      const y = landmarks[i * 3 + 1] * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, [4, 8, 12, 16, 20].includes(i) ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = [4, 8, 12, 16, 20].includes(i) ? '#e63946' : '#52b788';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }, []);

  // Initialize MediaPipe Hands in browser if available
  useEffect(() => {
    let hands = null;
    if (window.Hands) {
      try {
        hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65
        });
        hands.onResults((results) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandDetected(true);
            const raw = results.multiHandLandmarks[0];
            const flat = [];
            raw.forEach((lm) => flat.push(lm.x, lm.y, lm.z));
            drawLandmarks(flat);

            const now = Date.now();
            if (now - lastInferenceTime.current > 300) {
              lastInferenceTime.current = now;
              onLandmarksDetected(flat);
            }
          } else {
            setHandDetected(false);
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        });
        handsModelRef.current = hands;
      } catch (e) {
        console.warn('MediaPipe hands load error:', e);
      }
    }
    return () => {
      if (hands) hands.close();
    };
  }, [drawLandmarks, onLandmarksDetected]);

  // Frame processing loop for active camera
  const processFrame = useCallback(async () => {
    if (videoRef.current && videoRef.current.readyState >= 2 && handsModelRef.current) {
      try {
        await handsModelRef.current.send({ image: videoRef.current });
      } catch (err) {
        // Ignored during shutdown
      }
    }
    if (isCameraActive) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isCameraActive]);

  useEffect(() => {
    if (isCameraActive) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraActive, processFrame]);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setActiveSimulation(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Webcam permission denied. Please allow camera access in your browser settings to use live sign recognition.'
          : `Unable to access webcam (${err.message}). You can use the Quick Test Simulator below to test sign recognition.`
      );
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setHandDetected(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Trigger simulated canonical gesture
  const triggerSimulation = (signKey) => {
    setActiveSimulation(signKey);
    stopCamera();
    const landmarks = TEST_PROFILES[signKey];
    if (landmarks) {
      drawLandmarks(landmarks);
      setHandDetected(true);
      onLandmarksDetected(landmarks);
    }
  };

  return (
    <div className="card camera-card">
      <div className="card-header">
        <div className="header-title-group">
          <Video className="icon-header" size={22} />
          <h2>Camera & Gesture Input</h2>
        </div>
        <div className="badge-group">
          <span className={`status-badge ${isCameraActive ? 'badge-success' : 'badge-neutral'}`}>
            {isCameraActive ? (handDetected ? '🟢 Hand Detected' : '🟡 Searching for Hand') : '⚪ Camera Idle'}
          </span>
        </div>
      </div>

      <div className="camera-viewport-container">
        <video
          ref={videoRef}
          className="camera-video-stream"
          width={640}
          height={480}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="camera-overlay-canvas"
          width={640}
          height={480}
        />

        {!isCameraActive && !activeSimulation && (
          <div className="camera-placeholder">
            <Camera size={56} className="placeholder-icon" />
            <h3>Webcam is turned off</h3>
            <p>Click "Start Camera" to enable real-time hand-landmark recognition.</p>
            <div className="security-note">
              <ShieldCheck size={16} />
              <span>Camera frames are analyzed locally in browser memory. No video is recorded or stored.</span>
            </div>
          </div>
        )}

        {activeSimulation && !isCameraActive && (
          <div className="simulation-banner">
            <Sparkles size={16} />
            <span>Simulating gesture: <strong>{activeSimulation}</strong></span>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="alert alert-warning">
          <AlertCircle size={20} className="alert-icon" />
          <div className="alert-content">
            <strong>Camera Notice:</strong> {cameraError}
          </div>
        </div>
      )}

      <div className="camera-controls-bar">
        {!isCameraActive ? (
          <button className="btn btn-primary" onClick={startCamera}>
            <Camera size={18} />
            <span>Start Camera</span>
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopCamera}>
            <CameraOff size={18} />
            <span>Stop Camera</span>
          </button>
        )}
      </div>

      <div className="simulator-section">
        <div className="simulator-header">
          <Sparkles size={16} />
          <h4>Interactive Sign Simulator (Webcam Alternative)</h4>
        </div>
        <p className="simulator-hint">
          Click any gesture below to load its 21 MediaPipe hand landmarks directly into the inference engine:
        </p>
        <div className="simulation-chips">
          {Object.keys(TEST_PROFILES).map((signKey) => (
            <button
              key={signKey}
              className={`chip-btn ${activeSimulation === signKey ? 'chip-active' : ''}`}
              onClick={() => triggerSimulation(signKey)}
            >
              {signKey}
            </button>
          ))}
          <button
            className="chip-btn chip-unknown"
            onClick={() => {
              setActiveSimulation('UNKNOWN');
              const randomVector = Array.from({ length: 63 }, () => Math.random() * 0.4 - 0.2);
              drawLandmarks(randomVector);
              onLandmarksDetected(randomVector);
            }}
          >
            Random Noise (Unknown)
          </button>
        </div>
      </div>
    </div>
  );
}
