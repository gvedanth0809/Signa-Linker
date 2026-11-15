import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  Sparkles,
  Send,
  Volume2,
  Copy,
  Check,
  Edit2,
  CornerDownRight,
  MessageSquare
} from 'lucide-react';
import { rephraseTranscript } from '../services/api';

export default function TranscriptPanel({
  transcriptWords,
  onRemoveWord,
  onEditWord,
  onClearTranscript,
  onSpeakText
}) {
  const [rephrasedData, setRephrasedData] = useState(null);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [typedResponse, setTypedResponse] = useState('');
  const [copied, setCopied] = useState(false);

  const rawTranscriptString = transcriptWords.join(' ');

  const handleStartEdit = (index, word) => {
    setEditingIndex(index);
    setEditValue(word);
  };

  const handleSaveEdit = (index) => {
    if (editValue.trim()) {
      onEditWord(index, editValue.trim());
    }
    setEditingIndex(null);
  };

  const handleRephrase = async () => {
    if (!rawTranscriptString) return;
    setIsRephrasing(true);
    const result = await rephraseTranscript(rawTranscriptString);
    setRephrasedData(result);
    setIsRephrasing(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTypedResponse = () => {
    if (!typedResponse.trim()) return;
    onSpeakText(typedResponse.trim());
    setTypedResponse('');
  };

  return (
    <div className="card transcript-card">
      <div className="card-header">
        <div className="header-title-group">
          <FileText size={20} className="icon-header" />
          <h3>Conversation Transcript</h3>
        </div>
        <div className="transcript-header-actions">
          {transcriptWords.length > 0 && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={onClearTranscript}
              title="Clear Transcript"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="transcript-body">
        {transcriptWords.length === 0 ? (
          <div className="empty-transcript-state">
            <p>Your recognized words will appear here. Add gestures to build a sentence.</p>
          </div>
        ) : (
          <div className="transcript-chips-container">
            {transcriptWords.map((word, idx) => (
              <div key={idx} className="word-token-chip">
                {editingIndex === idx ? (
                  <input
                    type="text"
                    value={editValue}
                    autoFocus
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveEdit(idx)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                    className="token-edit-input"
                  />
                ) : (
                  <>
                    <span className="token-text" onClick={() => handleStartEdit(idx, word)}>
                      {word}
                    </span>
                    <button
                      className="token-action-btn"
                      onClick={() => handleStartEdit(idx, word)}
                      title="Edit word"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="token-action-btn token-delete"
                      onClick={() => onRemoveWord(idx)}
                      title="Remove word"
                    >
                      &times;
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {transcriptWords.length > 0 && (
          <div className="ai-rephrase-action-row">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRephrase}
              disabled={isRephrasing}
            >
              <Sparkles size={16} className="text-amber" />
              <span>{isRephrasing ? 'AI Rephrasing...' : 'Rephrase with AI Assistant (Gemma)'}</span>
            </button>
          </div>
        )}

        {rephrasedData && rephrasedData.rephrased && (
          <div className="rephrased-result-box">
            <div className="rephrased-header">
              <span className="rephrased-tag">
                <Sparkles size={14} /> Natural Rephrasing ({rephrasedData.source})
              </span>
              <div className="rephrased-tools">
                <button
                  className="icon-tool-btn"
                  onClick={() => onSpeakText(rephrasedData.rephrased)}
                  title="Speak aloud"
                >
                  <Volume2 size={15} />
                </button>
                <button
                  className="icon-tool-btn"
                  onClick={() => copyToClipboard(rephrasedData.rephrased)}
                  title="Copy text"
                >
                  {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                </button>
              </div>
            </div>
            <p className="rephrased-sentence">"{rephrasedData.rephrased}"</p>

            {rephrasedData.suggestions && rephrasedData.suggestions.length > 0 && (
              <div className="rephrase-suggestions">
                <span className="suggestion-label">Suggested Replies:</span>
                <div className="suggestion-chips">
                  {rephrasedData.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      className="suggestion-chip-btn"
                      onClick={() => onSpeakText(sug)}
                    >
                      <CornerDownRight size={12} /> {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="typed-response-section">
        <div className="typed-header">
          <MessageSquare size={16} />
          <h4>Partner Response (Type to Speak)</h4>
        </div>
        <p className="typed-hint">Non-signers can type their reply here to speak back:</p>
        <div className="typed-input-group">
          <input
            type="text"
            className="input-text"
            placeholder="Type your response to the sign language user..."
            value={typedResponse}
            onChange={(e) => setTypedResponse(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendTypedResponse()}
          />
          <button
            className="btn btn-primary btn-send-reply"
            onClick={handleSendTypedResponse}
            disabled={!typedResponse.trim()}
          >
            <Send size={16} />
            <span>Speak</span>
          </button>
        </div>
      </div>
    </div>
  );
}
