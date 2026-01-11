import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import StreakModal from '../components/modals/StreakModal';


const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showStreak, setShowStreak] = useState(false);
  const [newStreakCount, setNewStreakCount] = useState(0);
  
  const { login, loading } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Try to login
    const result = await login(formData.email, formData.password);
    
    if (result && result.success && result.user) {
      const user = result.user;
      
      // Check if streak increased (Logic: compare server streak with a flag or just check if > 0)
      if (user.gamification?.streak > 0) {
        setNewStreakCount(user.gamification.streak);
        setShowStreak(true);
      } else {
        navigate('/dashboard');
      }
    } else if (result && !result.success) {
      setError(result.message || 'Login failed');
    }
  };

  const handleCloseStreak = () => {
    setShowStreak(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-3 sm:px-6 py-8 sm:py-12">
      
      {/* STREAK ALERT POPUP */}
      {showStreak && (
        <StreakModal 
          streak={newStreakCount} 
          onClose={handleCloseStreak} 
        />
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-blue-600 w-14 sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-blue-200">
          <LogIn className="text-white" size={28} />
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-1.5 sm:mt-2 text-center text-xs sm:text-sm text-gray-500 font-medium">
          Sign in to your NSS account
        </p>
      </div>

      <div className="mt-6 sm:mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-sm border border-gray-100 rounded-3xl sm:px-10">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm sm:text-base"
                  placeholder="name@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm sm:text-base"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-100 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all active:scale-95 min-h-[40px] sm:min-h-[auto]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <span className="hidden sm:inline">Sign In</span>}
              {loading && <span className="sm:hidden">Signing in...</span>}
              {!loading && <span className="sm:hidden">Sign In</span>}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-black text-blue-600 hover:text-blue-500">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;