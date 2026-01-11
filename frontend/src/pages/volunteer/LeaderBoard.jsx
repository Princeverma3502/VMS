import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { Trophy, Medal, Award, Zap } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useContext(AuthContext);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/users/leaderboard');
        setLeaders(data);
        
        // Find user's rank
        const userRank = data?.findIndex(u => u._id === user?._id) + 1;
        if (userRank > 0) {
          setMyRank({
            rank: userRank,
            xp: user?.gamification?.xpPoints || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [user]);

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Trophy className="text-yellow-500" size={24} fill="currentColor"/>;
      case 1: return <Medal className="text-gray-400" size={24} fill="currentColor"/>;
      case 2: return <Medal className="text-orange-500" size={24} fill="currentColor"/>;
      default: return <span className="font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  const getHaloColor = (index) => {
    switch(index) {
      case 0: return 'ring-4 ring-yellow-400';
      case 1: return 'ring-4 ring-gray-300';
      case 2: return 'ring-4 ring-orange-300';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Layout showBackButton={true}>
        
        <SkeletonLoader count={5} type="list" />
      </Layout>
    );
  }

  return (
    <Layout userRole="Volunteer" showBackButton={true}>
      
      <div className="text-center mb-6 sm:mb-8 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
          <Award className="text-blue-600" size={24} />
          <span className="hidden sm:inline">Wall of Fame</span>
          <span className="sm:hidden">Fame</span>
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Top contributors making a difference.</p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden pb-4 sm:pb-6 px-2 sm:px-0">
        {leaders && leaders.length > 0 ? (
          <>
            {/* Podium Section */}
            <div className="bg-gradient-to-b from-blue-50 to-white p-3 sm:p-6 border-b border-gray-100 mb-3 sm:mb-4">
              <div className="flex justify-center items-end gap-2 sm:gap-4 mb-4 sm:mb-6">
                {/* Silver (2nd) */}
                {leaders[1] && (
                  <div className="text-center flex-1 scale-75 sm:scale-100">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-2 rounded-full flex items-center justify-center bg-gray-100 ${getHaloColor(1)}`}>
                      <span className="text-lg sm:text-2xl font-black">2</span>
                    </div>
                    <p className="font-bold text-[10px] sm:text-xs text-gray-700 line-clamp-1">{leaders[1].name}</p>
                    <p className="text-[8px] sm:text-[10px] text-gray-500">{leaders[1].gamification?.xpPoints || 0} XP</p>
                  </div>
                )}

                {/* Gold (1st) */}
                {leaders[0] && (
                  <div className="text-center flex-1 scale-90 sm:scale-110">
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-1 sm:mb-2 rounded-full flex items-center justify-center bg-yellow-100 ${getHaloColor(0)}`}>
                      <Trophy className="text-yellow-500" size={24} fill="currentColor" />
                    </div>
                    <p className="font-bold text-[10px] sm:text-sm text-gray-800 line-clamp-1">{leaders[0].name}</p>
                    <p className="text-[8px] sm:text-xs font-bold text-yellow-600">{leaders[0].gamification?.xpPoints || 0} XP</p>
                  </div>
                )}

                {/* Bronze (3rd) */}
                {leaders[2] && (
                  <div className="text-center flex-1 scale-75 sm:scale-100">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-2 rounded-full flex items-center justify-center bg-orange-100 ${getHaloColor(2)}`}>
                      <span className="text-lg sm:text-2xl font-black">3</span>
                    </div>
                    <p className="font-bold text-[10px] sm:text-xs text-gray-700 line-clamp-1">{leaders[2].name}</p>
                    <p className="text-[8px] sm:text-[10px] text-gray-500">{leaders[2].gamification?.xpPoints || 0} XP</p>
                  </div>
                )}
              </div>
            </div>

            {/* Full Rankings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] sm:text-xs font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-2 sm:p-4 text-center w-12 sm:w-16">Rank</th>
                    <th className="p-2 sm:p-4">Name</th>
                    <th className="p-2 sm:p-4 text-center text-[9px] sm:text-xs">Year</th>
                    <th className="p-2 sm:p-4 text-right">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaders.map((vol, index) => (
                    <tr key={vol._id} className={`hover:bg-blue-50/50 transition text-xs sm:text-sm ${index < 3 ? 'bg-blue-50/30' : ''}`}>
                      <td className="p-2 sm:p-4 text-center">
                        {getRankIcon(index)}
                      </td>
                      <td className="p-2 sm:p-4 font-bold text-gray-800 line-clamp-1">
                        {vol.name}
                        {index === 0 && <span className="ml-1 sm:ml-2 text-[8px] sm:text-[10px] bg-yellow-100 text-yellow-800 px-1.5 sm:px-2 py-0.5 rounded-full font-black hidden sm:inline">MVP</span>}
                      </td>
                      <td className="p-2 sm:p-4 text-center text-gray-600 text-[9px] sm:text-xs">{vol.year}</td>
                      <td className="p-2 sm:p-4 text-right font-mono font-black text-blue-600 text-xs sm:text-base">{vol.gamification?.xpPoints || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <Award size={32} className="mx-auto mb-2 opacity-50 sm:hidden" />
            <Award size={40} className="mx-auto mb-2 opacity-50 hidden sm:block" />
            <p className="text-sm">No volunteers found yet</p>
          </div>
        )}
      </div>

      {/* My Rank Sticky Footer */}
      {myRank && (
        <div className="fixed bottom-24 left-0 right-0 z-20 bg-white border-t-2 border-blue-600 shadow-2xl">
          <div className="max-w-md mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-sm sm:text-base">
            <div>
              <p className="text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Your Rank</p>
              <p className="text-lg sm:text-xl font-black text-gray-800">#{myRank.rank}</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
              <Zap size={16} className="text-blue-600 sm:hidden" />
              <Zap size={20} className="text-blue-600 hidden sm:block" />
              <div className="text-right">
                <p className="text-[9px] sm:text-[10px] text-gray-500">Total XP</p>
                <p className="text-base sm:text-lg font-black text-blue-600">{myRank.xp}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Leaderboard;