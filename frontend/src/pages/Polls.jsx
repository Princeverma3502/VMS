import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-hot-toast';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/polls');
      setPolls(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch polls.');
      toast.error('Failed to fetch polls.');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const vote = async (pollId, optionId) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionId });
      toast.success('Vote submitted successfully!');
      fetchPolls(); // Refresh to show updated results
    } catch (error) {
      toast.error('Failed to submit vote.');
      console.error(error);
    }
  };

  const hasVoted = (poll) => {
    return poll.votes?.some(vote => vote.user.toString() === localStorage.getItem('userId'));
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce((total, option) => total + (option.votes || 0), 0);
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center">{error}</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Polls</h1>

        <div className="space-y-6">
          {polls.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No polls available.
            </div>
          ) : (
            polls.map(poll => (
              <div key={poll._id} className="bg-white border rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">{poll.question}</h2>
                <p className="text-gray-600 mb-4">{poll.description}</p>

                <div className="space-y-3">
                  {poll.options.map(option => {
                    const percentage = getTotalVotes(poll) > 0 ? ((option.votes || 0) / getTotalVotes(poll)) * 100 : 0;
                    const userVoted = hasVoted(poll);

                    return (
                      <div key={option._id} className="relative">
                        <button
                          onClick={() => !userVoted && vote(poll._id, option._id)}
                          disabled={userVoted}
                          className={`w-full text-left p-3 border rounded-lg transition-colors ${
                            userVoted ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{option.text}</span>
                            {userVoted && (
                              <span className="text-sm text-gray-500">
                                {option.votes || 0} votes ({percentage.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </button>
                        {userVoted && (
                          <div
                            className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-lg transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Total votes: {getTotalVotes(poll)} • {hasVoted(poll) ? 'You have voted' : 'Click an option to vote'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Created: {new Date(poll.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Polls;