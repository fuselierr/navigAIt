'use client';
import { useState } from 'react';
import { useGemini } from '@/hooks/useGemini';

export default function OnboardingAssistant() {
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState(null);
  const [answer, setAnswer] = useState('');
  const { askGemini, loading, error } = useGemini();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result.split(',')[1];
        setImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question || !image) {
      alert('Please upload an image and enter a question');
      return;
    }

    const response = await askGemini(question, image);

    if (response.error) {
      console.error('API Error:', response.error);
    } else {
      setAnswer(response.answer);
    }
  };

  return (
    <div className="onboarding-assistant">
      <h1>Onboarding Helper</h1>

      {/* Image Upload */}
      <div className="image-upload-section">
        <label htmlFor="imageUpload">Upload an Image:</label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={loading}
        />
        {image && (
          <img
            src={`data:image/png;base64,${image}`}
            alt="Uploaded"
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
