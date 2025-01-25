'use client';
import { useState } from 'react';
import { useGemini } from '@/hooks/useGemini';
import html2canvas from 'html2canvas';

export default function OnboardingAssistant() {
  const [question, setQuestion] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [answer, setAnswer] = useState('');
  const { askGemini, loading, error } = useGemini();

  const handleCapture = async () => {
    const canvas = await html2canvas(document.documentElement);
    const base64 = canvas.toDataURL('image/png').split(',')[1];
    setScreenshot(base64);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question || !screenshot) {
      alert('Please ask a question and capture your screen');
      return;
    }

    const response = await askGemini(question, screenshot);

    if (response.error) {
      console.error('API Error:', response.error);
    } else {
      setAnswer(response.answer);
    }
  };

  return (
    <div className="onboarding-assistant">
      <h1>Onboarding Helper</h1>

      {/* Screen Capture */}
      <div className="screenshot-section">
        <button onClick={handleCapture} disabled={loading}>
          {loading ? 'Capturing...' : 'Capture Screen'}
        </button>
        {screenshot && (
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Captured screen"
            className="preview-image"
          />
        )}
      </div>

      {/* Question Input */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about the onboarding process..."
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Asking Gemini...' : 'Ask Gemini'}
        </button>
      </form>

      {/* Display Results */}
      {error && <div className="error">Error: {error}</div>}
      {answer && (
        <div className="answer">
          <h3>Response:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
