import React, { useState, useEffect } from 'react';
import { CheckCircle2, HelpCircle, PlusCircle, Gauge, Activity, AlertTriangle } from 'lucide-react';

export default function PredictionCard({ prediction, onAddToTranscript, isPredicting }) {
  const [autoAdd, setAutoAdd] = useState(false);
  const [lastAutoAdded, setLastAutoAdded] = useState(null);

  // Auto-add logic when confidence > 0.85 and sign has been stable
  useEffect(() => {
    if (autoAdd && prediction && prediction.supported && !prediction.is_unknown) {
      if (prediction.confidence >= 0.85 && prediction.label !== lastAutoAdded) {
        onAddToTranscript(prediction.label);
        setLastAutoAdded(prediction.label);
      }
    }
  }, [autoAdd, prediction, lastAutoAdded, onAddToTranscript]);

  if (!prediction) {
    return (
      <div className="card prediction-card card-waiting">
        <div className="card-header">
          <Activity size={20} className="icon-header" />
          <h3>Real-Time Prediction</h3>
        </div>
        <div className="prediction-empty">
          <HelpCircle size={48} className="empty-icon pulse" />
          <p>No hand detected yet. Raise your hand in front of the camera or use the simulator above.</p>
        </div>
      </div>
    );
  }

  const { label, confidence, supported, is_unknown, details, all_probabilities } = prediction;
  const confidencePercent = Math.round((confidence || 0) * 100);

  const getStatusColor = () => {
    if (is_unknown || !supported) return 'var(--color-warning)';
    if (confidencePercent >= 85) return 'var(--color-primary)';
    return 'var(--color-teal)';
  };

  return (
    <div className={`card prediction-card ${is_unknown ? 'border-warning' : 'border-success'}`}>
      <div className="card-header">
        <div className="header-title-group">
          <Activity size={20} className="icon-header" />
          <h3>Real-Time Prediction</h3>
        </div>
        {isPredicting && <span className="inference-ping">Predicting...</span>}
      </div>

      <div className="prediction-main-content">
        <div className="prediction-label-container">
          <div className="sign-display-badge">
            <h1 className="sign-label-title" style={{ color: getStatusColor() }}>
              {is_unknown ? 'UNKNOWN SIGN' : label}
            </h1>
            <span className={`pill-badge ${is_unknown ? 'pill-warning' : 'pill-success'}`}>
              {is_unknown ? (
                <>
                  <AlertTriangle size={14} /> Uncertain / Noise
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Supported ISL Sign
                </>
              )}
            </span>
          </div>

          <div className="confidence-meter-group">
            <div className="meter-label-row">
              <span className="meter-caption">
                <Gauge size={16} /> Confidence Score
              </span>
              <span className="meter-value" style={{ color: getStatusColor() }}>
                {confidencePercent}%
              </span>
            </div>
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{
                  width: `${confidencePercent}%`,
                  backgroundColor: getStatusColor()
                }}
              />
            </div>
            {details && <p className="prediction-details-note">{details}</p>}
          </div>
        </div>

        <div className="prediction-action-row">
          <button
            className="btn btn-primary btn-add-transcript"
            onClick={() => onAddToTranscript(label)}
            disabled={is_unknown || !supported}
          >
            <PlusCircle size={18} />
            <span>Add "{label}" to Transcript</span>
          </button>

          <label className="toggle-container">
            <input
              type="checkbox"
              checked={autoAdd}
              onChange={(e) => setAutoAdd(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Auto-add when confident (&gt;85%)</span>
          </label>
        </div>

        {all_probabilities && Object.keys(all_probabilities).length > 0 && (
          <div className="probabilities-mini-table">
            <span className="sub-heading">Top Candidates:</span>
            <div className="prob-chips-container">
              {Object.entries(all_probabilities)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([cls, prob]) => (
                  <span key={cls} className="prob-chip">
                    <strong>{cls}:</strong> {Math.round(prob * 100)}%
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
