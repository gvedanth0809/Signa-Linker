const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000/api'
    : '/api');

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API health check error:', err);
    return { status: 'offline', service: 'SignaLink API (Disconnected)' };
  }
}

export async function fetchSupportedSigns() {
  try {
    const res = await fetch(`${API_BASE_URL}/signs`);
    if (!res.ok) throw new Error(`Failed to load signs: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch signs from backend, using default catalog:', err);
    return {
      signs: [
        { id: 'HELLO', label: 'HELLO', name: 'Hello / Greetings', description: 'Open palm facing forward with fingers upright.', gesture_hint: 'Raise hand with open palm facing camera, all 5 fingers extended.', category: 'Greetings' },
        { id: 'THANK_YOU', label: 'THANK_YOU', name: 'Thank You', description: 'Expression of gratitude with flat hand extending outward.', gesture_hint: 'Flat open hand with fingers together, moving outward from chin.', category: 'Courtesy' },
        { id: 'YES', label: 'YES', name: 'Yes / Affirmation', description: 'Nodding fist gesture indicating agreement.', gesture_hint: 'Closed fist with thumb resting across fingers.', category: 'Responses' },
        { id: 'NO', label: 'NO', name: 'No / Negation', description: 'Negative response sign.', gesture_hint: 'Index finger extended vertically while other fingers are folded.', category: 'Responses' },
        { id: 'PLEASE', label: 'PLEASE', name: 'Please', description: 'Polite request sign with flat palm.', gesture_hint: 'Flat hand with fingers together over chest area.', category: 'Courtesy' },
        { id: 'GOOD', label: 'GOOD', name: 'Good / Approval', description: 'Thumbs up sign indicating approval.', gesture_hint: 'Fist with thumb pointed straight upward.', category: 'Appraisal' },
        { id: 'BAD', label: 'BAD', name: 'Bad / Disapproval', description: 'Thumbs down sign indicating disapproval.', gesture_hint: 'Fist with thumb pointed straight downward.', category: 'Appraisal' },
        { id: 'PEACE', label: 'PEACE', name: 'Peace / Victory', description: 'Peace sign with index and middle fingers.', gesture_hint: 'Extend index and middle fingers in a V shape.', category: 'Expressions' },
        { id: 'HELP', label: 'HELP', name: 'Help / Assist', description: 'Emergency or assistive sign requesting aid.', gesture_hint: 'Flat hand supporting upright thumb/fist.', category: 'Emergency' },
        { id: 'I_LOVE_YOU', label: 'I_LOVE_YOU', name: 'I Love You (ILY)', description: 'Universal / ISL sign.', gesture_hint: 'Extend thumb, index, and pinky fingers.', category: 'Expressions' }
      ],
      count: 10
    };
  }
}

export async function predictGesture(landmarks, language = 'ISL') {
  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landmarks, language }),
    });
    if (!res.ok) throw new Error(`Prediction failed with status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Prediction request error:', err);
    return {
      label: 'ERROR',
      confidence: 0,
      supported: false,
      is_unknown: true,
      details: 'Connection error to prediction service'
    };
  }
}

export async function rephraseTranscript(text, mode = 'polite') {
  try {
    const res = await fetch(`${API_BASE_URL}/assistant/rephrase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode }),
    });
    if (!res.ok) throw new Error(`Rephrase failed with status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Rephrase fallback:', err);
    return {
      original: text,
      rephrased: text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') + '.',
      suggestions: [
        'I understand, thank you!',
        'Could you please repeat that?',
        'How can I help you?'
      ],
      source: 'Client Fallback'
    };
  }
}
