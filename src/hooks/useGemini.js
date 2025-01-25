import { useState } from 'react';

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askGemini = async (question, imageBase64) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, imageBase64 }),
      });

      if (!response.ok) {
        console.error('Fetch failed:', response.status, await response.text());
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { askGemini, loading, error };
}