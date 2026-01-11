import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const Assistant = () => {
  const { user } = useContext(AuthContext);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const { data } = await api.post('/ai/query', { prompt });
      setResponse(data.reply || JSON.stringify(data));
    } catch (err) {
      setResponse('Error: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole={user?.role}>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">AI Assistant</h1>
        <p className="text-sm text-gray-600 mb-4">Ask a question about the app or general queries. (If backend has OPENAI_API_KEY enabled you'll receive richer responses.)</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} className="w-full p-3 rounded-lg border" placeholder="Type your question here..." />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md">{loading ? 'Thinking...' : 'Ask'}</button>
            <button type="button" onClick={() => { setPrompt(''); setResponse(''); }} className="bg-gray-200 px-4 py-2 rounded-md">Clear</button>
          </div>
        </form>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Response</h2>
          <div className="mt-2 p-4 bg-white border rounded-md min-h-[120px] whitespace-pre-wrap">{response || <span className="text-gray-400">No response yet.</span>}</div>
        </div>
      </div>
    </Layout>
  );
};

export default Assistant;
