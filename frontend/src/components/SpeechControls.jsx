import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sliders, AudioLines } from 'lucide-react';

export default function SpeechControls({ textToSpeak }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (available.length > 0 && !selectedVoice) {
          // Prefer Indian English voice or standard English
          const indianVoice = available.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
          const defaultVoice = indianVoice || available.find(v => v.lang.startsWith('en')) || available[0];
          setSelectedVoice(defaultVoice.name);
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (!textToSpeak || !textToSpeak.trim()) {
      alert('Transcript is empty. Add sign words first before speaking.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (selectedVoice) {
      const voiceObj = voices.find(v => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="card speech-controls-card">
      <div className="card-header">
        <div className="header-title-group">
          <Volume2 size={20} className="icon-header" />
          <h3>Speech Synthesis (TTS)</h3>
        </div>
        <button
          className="btn-icon-toggle"
          onClick={() => setShowSettings(!showSettings)}
          title="Audio Settings"
        >
          <Sliders size={18} />
        </button>
      </div>

      <div className="speech-actions">
        {!isSpeaking ? (
          <button
            className="btn btn-secondary btn-speak"
            onClick={handleSpeak}
            disabled={!textToSpeak || !textToSpeak.trim()}
          >
            <Volume2 size={18} />
            <span>Speak Transcript Aloud</span>
          </button>
        ) : (
          <button className="btn btn-danger btn-speak" onClick={handleStop}>
            <VolumeX size={18} />
            <span>Stop Speaking</span>
          </button>
        )}

        {isSpeaking && (
          <div className="speaking-indicator">
            <AudioLines size={20} className="pulse text-teal" />
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="speech-settings-drawer">
          <div className="setting-control-group">
            <label>Voice:</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="select-input"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="slider-row">
            <div className="setting-control-group">
              <label>Speed: {rate}x</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
              />
            </div>

            <div className="setting-control-group">
              <label>Pitch: {pitch}</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
