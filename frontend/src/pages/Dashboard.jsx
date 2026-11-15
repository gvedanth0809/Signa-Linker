import React, { useState, useEffect, useCallback } from 'react';
import CameraPanel from '../components/CameraPanel';
import PredictionCard from '../components/PredictionCard';
import TranscriptPanel from '../components/TranscriptPanel';
import SpeechControls from '../components/SpeechControls';
import { predictGesture, fetchHealth } from '../services/api';
import { BookOpen, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

export default function Dashboard({ onNavigateToLearn }) {
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [transcriptWords, setTranscriptWords] = useState(['HELLO']);
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', service: 'SignaLink' });

  // Initial health check
  useEffect(() => {
    fetchHealth().then((data) => setBackendHealth(data));
    const interval = setInterval(() => {
      fetchHealth().then((data) => setBackendHealth(data));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle landmarks detected from webcam or simulator
  const handleLandmarksDetected = useCallback(async (landmarks) => {
    setIsPredicting(true);
    try {
      const result = await predictGesture(landmarks, 'ISL');
      setPrediction(result);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsPredicting(false);
    }
  }, []);

  // Transcript management actions
  const handleAddToTranscript = (word) => {
    if (!word || word === 'UNKNOWN') return;
    setTranscriptWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (index) => {
    setTranscriptWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditWord = (index, newWord) => {
    setTranscriptWords((prev) => {
      const copy = [...prev];
      copy[index] = newWord;
      return copy;
    });
  };

  const handleClearTranscript = () => {
    setTranscriptWords([]);
  };

  // Direct TTS trigger for any speech text
  const handleSpeakText = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const fullTranscriptText = transcriptWords.join(' ');

  return (
    <div className="dashboard-container">
      {/* Top status bar */}
      <div className="dashboard-topbar">
        <div className="topbar-left">
          <p className="app-tagline">AI-Powered Indian Sign Language Recognition & Communication Assistant</p>
        </div>
        <div className="topbar-right">
          <div className="health-badge">
            {backendHealth.status === 'healthy' ? (
              <span className="badge-online">
                <Wifi size={14} /> FastAPI Backend Connected
              </span>
            ) : (
              <span className="badge-offline">
                <WifiOff size={14} /> Backend Disconnected ({backendHealth.status})
              </span>
            )}
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={onNavigateToLearn}>
            <BookOpen size={16} />
            <span>Learn Signs Dictionary</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Computer Vision & Prediction */}
        <div className="dashboard-col left-col">
          <CameraPanel
            onLandmarksDetected={handleLandmarksDetected}
            isModelReady={backendHealth.status === 'healthy'}
          />
          <PredictionCard
            prediction={prediction}
            onAddToTranscript={handleAddToTranscript}
            isPredicting={isPredicting}
          />
        </div>

        {/* Right Column: Transcript, Speech & Two-Way Communication */}
        <div className="dashboard-col right-col">
          <TranscriptPanel
            transcriptWords={transcriptWords}
            onRemoveWord={handleRemoveWord}
            onEditWord={handleEditWord}
            onClearTranscript={handleClearTranscript}
            onSpeakText={handleSpeakText}
          />
          <SpeechControls textToSpeak={fullTranscriptText} />
        </div>
      </div>
    </div>
  );
}
