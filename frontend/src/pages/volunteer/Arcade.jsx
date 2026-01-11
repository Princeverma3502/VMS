import React, { useState, useContext } from 'react';
import Layout from '../../components/layout/Layout';
import XPProgressBar from '../../components/gamification/XPProgressBar';
import Badge from '../../components/gamification/Badge';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Gift, BrainCircuit } from 'lucide-react';

const Arcade = () => {
  const { user } = useContext(AuthContext);
  const [xp, setXp] = useState(user?.gamification?.xpPoints || 0);
  const [spinResult, setSpinResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSpin = async () => {
    try {
        if (!user) {
          alert("User not authenticated. Please login again.");
          return;
        }
        setIsLoading(true);
        const { data } = await api.post('/game/spin');
        setSpinResult(data);
        setXp(data.totalXP || data.gamification?.xpPoints || 0); // Update UI
    } catch (error) {
        const errorMsg = error.response?.data?.message || "Spin failed or already used today!";
        alert(errorMsg);
        console.error("Spin error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Layout userRole="Volunteer" showBackButton={true}>
      
      
      <div className="mb-6 sm:mb-8 px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Volunteer Arcade 🎮</h1>
        <p className="text-xs sm:text-sm text-gray-500">Level up by completing tasks and attending events.</p>
      </div>

      <XPProgressBar currentXP={xp} level={user?.gamification?.level || 1} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8 px-2 sm:px-0">
        {/* Spin Wheel */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-xl shadow-sm border border-gray-100 text-center">
            <Gift className="mx-auto text-purple-500 mb-3 sm:mb-4" size={32} />
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Daily Spin</h3>
            {spinResult ? (
                <div className="animate-fade-in">
                    <p className="text-xl sm:text-2xl font-bold text-gamification-gold">+{spinResult.xpAwarded} XP</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{spinResult.message}</p>
                </div>
            ) : (
                <button 
                    onClick={handleSpin}
                    className="bg-nss-blue text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-blue-700 transition text-sm sm:text-base min-h-[40px] sm:min-h-[auto]"
                >
                    Spin Now
                </button>
            )}
        </div>

        {/* Badges */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <BrainCircuit size={18} />Your Badges
            </h3>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <Badge name="Rookie" description="Joined NSS" isUnlocked={true} />
                <Badge name="Explorer" description="First Event" isUnlocked={xp > 100} />
                <Badge name="Leader" description="Domain Head" isUnlocked={false} />
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Arcade;