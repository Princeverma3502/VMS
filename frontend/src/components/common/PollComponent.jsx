import React, { useState, useEffect } from 'react';
import { MessageCircle, BarChart3, X } from 'lucide-react';
import api from '../../services/api';

const PollComponent = ({ poll, onVote, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [poll._id]);

  const fetchResults = async () => {
    try {
      const response = await api.get(`/polls/${poll._id}/results`);
      setResults(response.data.data);
    } catch (error) {
      console.error('Failed to fetch poll results:', error);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) return;

    setLoading(true);
    try {
      await api.put(`/polls/${poll._id}/vote`, { optionIndex: selectedOption });
      setHasVoted(true);
      await fetchResults();
      if (onVote) onVote();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  const timeLeft = new Date(poll.expiresAt) - new Date();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{poll.title}</h3>
          {poll.description && <p className="text-sm text-gray-600 mt-1">{poll.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <BarChart3 size={14} /> {results?.totalVotes || 0} votes
            </span>
            <span>
              {hoursLeft}h {minutesLeft}m left
            </span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage =
            results?.totalVotes > 0 ? ((results?.results[index]?.votes / results?.totalVotes) * 100).toFixed(0) : 0;

          return (
            <div key={index} className={`p-3 border rounded-lg transition cursor-pointer ${
              selectedOption === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="poll-option"
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  disabled={hasVoted || loading}
                  className="w-4 h-4"
                />
                <span className="flex-1 text-sm font-medium text-gray-700">{option.text}</span>
              </label>

              {results && results.totalVotes > 0 && (
                <div className="mt-2 ml-7">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {results?.results[index]?.votes} votes ({percentage}%)
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!hasVoted && (
        <button
          onClick={handleVote}
          disabled={selectedOption === null || loading || !poll.isActive}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Submitting...' : 'Vote'}
        </button>
      )}

      {hasVoted && <p className="text-sm text-green-600 font-medium mt-4">✓ Your vote has been recorded</p>}
    </div>
  );
};

export default PollComponent;
