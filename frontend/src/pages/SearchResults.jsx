import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults = () => {
  const query = useQuery();
  const q = query.get('q') || '';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      if (!q) return setUsers([]);
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users?search=${encodeURIComponent(q)}`);
        setUsers(res.data || []);
      } catch (err) {
        console.error('Search error', err);
        setError(err.response?.data?.message || err.message);
      }
      setLoading(false);
    };
    fetch();
  }, [q]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Search Results for "{q}"</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              users.map(u => (
                <div key={u._id} className="p-3 bg-white rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="font-bold">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email} • {u.role}</p>
                  </div>
                  <Link to={`/volunteer/profile?id=${u._id}`} className="text-blue-600 font-bold">View</Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
