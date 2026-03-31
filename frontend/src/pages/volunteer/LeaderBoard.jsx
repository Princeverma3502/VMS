import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { Trophy, Medal, Award, Zap, Star, TrendingUp, Target } from 'lucide-react';
import { EliteSkeleton } from '../../components/ui/EliteUI';

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

  if (loading) return (
    <Layout showBackButton={true}>
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-4">
        <EliteSkeleton className="h-40 rounded-[3rem]" />
        <EliteSkeleton className="h-96 rounded-[3rem]" />
      </div>
    </Layout>
  );

  const topThree = leaders.slice(0, 3);
  const others = leaders.slice(3);

  return (
    <Layout userRole="Volunteer" showBackButton={true}>
      
      <div className="max-w-5xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 1. HEADER */}
        <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-4 border border-indigo-100">
              <Star className="text-indigo-600 animate-pulse" size={14} fill="currentColor" />
              <span className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.3em]">Operational Wall of Fame</span>
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">
             Elite <span className="text-indigo-600">Contributors</span>
           </h1>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
             The most impactful volunteers in the system ecosystem.
           </p>
        </div>

        {/* 2. ELITE PODIUM BENTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
           
           {/* SILVER (2nd) */}
           {topThree[1] && (
             <div className="order-2 md:order-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5 text-center transform hover:scale-105 transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-300"></div>
                <Medal className="mx-auto mb-6 text-slate-300" size={48} />
                <div className="relative w-24 h-24 mx-auto mb-4">
                   <div className="w-full h-full rounded-[2rem] border-4 border-slate-50 overflow-hidden shadow-lg">
                      <img src={topThree[1].profileImage || `https://ui-avatars.com/api/?name=${topThree[1].name}&background=cbd5e1&color=fff`} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-400 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg">2</div>
                </div>
                <h3 className="font-black text-slate-900 tracking-tight text-lg truncate">{topThree[1].name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{topThree[1].gamification?.xpPoints || 0} XP EARNED</p>
             </div>
           )}

           {/* GOLD (1st) */}
           {topThree[0] && (
             <div className="order-1 md:order-2 bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-900/20 text-center transform hover:scale-110 transition-all duration-500 relative overflow-hidden group z-10">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <Trophy className="mx-auto mb-6 text-indigo-400 animate-bounce" size={64} fill="currentColor" />
                <div className="relative w-32 h-32 mx-auto mb-6">
                   <div className="w-full h-full rounded-[2.5rem] border-4 border-white/10 overflow-hidden shadow-2xl">
                      <img src={topThree[0].profileImage || `https://ui-avatars.com/api/?name=${topThree[0].name}&background=4f46e5&color=fff`} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-2xl border-4 border-slate-900">1</div>
                </div>
                <h3 className="font-black text-white tracking-tighter text-2xl truncate">{topThree[0].name}</h3>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-3">The Supreme Vanguard</p>
                <div className="mt-6 inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                   <Zap size={14} className="text-indigo-400" />
                   <span className="text-sm font-black tracking-tight">{topThree[0].gamification?.xpPoints || 0} XP Total</span>
                </div>
             </div>
           )}

           {/* BRONZE (3rd) */}
           {topThree[2] && (
             <div className="order-3 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5 text-center transform hover:scale-105 transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-300"></div>
                <Medal className="mx-auto mb-6 text-orange-300" size={48} />
                <div className="relative w-24 h-24 mx-auto mb-4">
                   <div className="w-full h-full rounded-[2rem] border-4 border-orange-50 overflow-hidden shadow-lg">
                      <img src={topThree[2].profileImage || `https://ui-avatars.com/api/?name=${topThree[2].name}&background=fb923c&color=fff`} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-400 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg">3</div>
                </div>
                <h3 className="font-black text-slate-900 tracking-tight text-lg truncate">{topThree[2].name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{topThree[2].gamification?.xpPoints || 0} XP EARNED</p>
             </div>
           )}
        </div>

        {/* 3. RANKINGS TABLE */}
        <div className="bg-white rounded-[3.5rem] shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                 <TrendingUp size={16} className="text-indigo-600" /> Operational Rankings
              </h3>
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Updating Live
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-[0.4em] border-b border-slate-100">
                  <tr>
                    <th className="p-8 w-24 text-center">Insignia</th>
                    <th className="p-8">Volunteer Asset</th>
                    <th className="p-8 text-center">Sector</th>
                    <th className="p-8 text-right">Power Score (XP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {others.map((vol, index) => (
                    <tr key={vol._id} className="hover:bg-slate-50 transition-all group">
                      <td className="p-8 text-center">
                         <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           {(index + 4)}
                         </span>
                      </td>
                      <td className="p-8">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden shadow-inner border border-slate-100">
                               <img src={vol.profileImage || `https://ui-avatars.com/api/?name=${vol.name}&background=f1f5f9&color=64748b`} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <p className="font-black text-slate-900 tracking-tight">{vol.name}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{vol.role}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-8 text-center">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">{vol.year || 'N/A'}</span>
                      </td>
                      <td className="p-8 text-right font-black text-indigo-600 text-lg tracking-tighter">
                         {vol.gamification?.xpPoints || 0}
                      </td>
                    </tr>
                  ))}
                  {others.length === 0 && topThree.length === 0 && (
                    <tr><td colSpan="4" className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">No assets deployed</td></tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>

        {/* 4. MY RANK STICKY FOOTER */}
        {myRank && (
          <div className="fixed bottom-32 left-0 right-0 z-50 px-4">
             <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 border-b-indigo-500 border-b-4">
                <div className="flex items-center gap-4 ml-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Target size={24} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user?.name}</p>
                      <p className="text-xl font-black text-white tracking-tighter">Rank #{myRank.rank}</p>
                   </div>
                </div>
                <div className="bg-white/10 px-6 py-3 rounded-2xl mr-2 flex flex-col items-end border border-white/5">
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sync XP</p>
                   <p className="text-xl font-black text-white tracking-tighter">{myRank.xp}</p>
                </div>
             </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Leaderboard;