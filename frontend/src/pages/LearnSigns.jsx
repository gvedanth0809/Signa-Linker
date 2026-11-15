import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Hand, Search, CheckCircle2, Sparkles } from 'lucide-react';
import { fetchSupportedSigns } from '../services/api';

export default function LearnSigns({ onBackToDashboard, onPracticeSign }) {
  const [signs, setSigns] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportedSigns().then((data) => {
      setSigns(data.signs || []);
      setLoading(false);
    });
  }, []);

  const categories = ['ALL', ...new Set(signs.map((s) => s.category).filter(Boolean))];

  const filteredSigns = signs.filter((s) => {
    const matchesCat = activeCategory === 'ALL' || s.category === activeCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="learn-container">
      <div className="learn-header-bar">
        <button className="btn btn-outline-secondary btn-sm" onClick={onBackToDashboard}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <div className="learn-title-block">
          <h2>
            <BookOpen size={24} className="icon-header" />
            Indian Sign Language (ISL) Vocabulary Guide
          </h2>
          <p>
            Learn the 10 static ISL signs currently supported in the SignaLink recognition model.
          </p>
        </div>
      </div>

      <div className="learn-filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search signs by name or gesture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${activeCategory === cat ? 'cat-pill-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading sign vocabulary...</p>
        </div>
      ) : (
        <div className="signs-grid">
          {filteredSigns.map((sign) => (
            <div key={sign.id} className="card sign-dict-card">
              <div className="card-header">
                <div className="sign-card-title">
                  <span className="sign-badge-label">{sign.label}</span>
                  <h3>{sign.name}</h3>
                </div>
                <span className="category-tag">{sign.category}</span>
              </div>

              <div className="sign-card-body">
                <p className="sign-description">{sign.description}</p>
                <div className="gesture-guide-box">
                  <div className="guide-title">
                    <Hand size={16} />
                    <span>How to perform this sign:</span>
                  </div>
                  <p className="guide-text">{sign.gesture_hint}</p>
                </div>
              </div>

              <div className="sign-card-footer">
                <button
                  className="btn btn-outline-primary btn-sm btn-practice"
                  onClick={() => {
                    if (onPracticeSign) onPracticeSign(sign.label);
                    onBackToDashboard();
                  }}
                >
                  <Sparkles size={14} />
                  <span>Practice in Camera / Simulator</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
