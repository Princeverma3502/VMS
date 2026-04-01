import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import StreakModal from '../components/modals/StreakModal';


const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showStreak, setShowStreak] = useState(false);
  const [newStreakCount, setNewStreakCount] = useState(0);
  
  const [rememberMe, setRememberMe] = useState(true);
  
  const { login, loading, user } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getRedirectPath = (role) => {
    const r = role?.toLowerCase();
    if (r === 'secretary') return '/secretary/dashboard';
    if (r === 'domain head') return '/domain-head/dashboard';
    if (r === 'associate head') return '/associate-head/dashboard';
    return '/volunteer/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Try to login with remember me flag
    const result = await login(formData.email, formData.password, rememberMe);
    
    if (result && result.success && result.user) {
      // Check if streak increased
      if (result.user.gamification?.streak > 0) {
        setNewStreakCount(result.user.gamification.streak);
        setShowStreak(true);
      } else {
        navigate(getRedirectPath(result.user.role));
      }
    } else if (result && !result.success) {
      setError(result.message || 'Login failed');
    }
  };

  const handleCloseStreak = () => {
    setShowStreak(false);
    navigate(getRedirectPath(user?.role));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-3 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-700">
      
      {/* STREAK ALERT POPUP */}
      {showStreak && (
        <StreakModal 
          streak={newStreakCount} 
          onClose={handleCloseStreak} 
        />
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-24 sm:w-32 h-24 sm:h-32 mx-auto mb-4 sm:mb-6 transform hover:rotate-6 transition-transform duration-500">
          <img src="/logo.png" alt="NSS Logo" className="w-full h-full object-contain filter drop-shadow-2xl" />
        </div>
        <h2 className="text-center text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
          Welcome <span className="text-blue-600">Back</span>
        </h2>
        <p className="mt-2 text-center text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-[0.3em]">
          Operational Mission Access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-12 shadow-2xl shadow-slate-900/5 border border-slate-100 rounded-[3rem]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2">
                Identifier (Email)
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 font-bold text-slate-800 transition-all outline-none"
                  placeholder="name@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2">
                Access Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 font-bold text-slate-800 transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* STAY SIGNED IN TOGGLE */}
            <div className="flex items-center justify-between px-1">
               <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${rememberMe ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 transform ${rememberMe ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Stay signed in</span>
               </label>
               <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-slate-900 transition-colors">
                 Lost Key?
               </Link>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3 animate-shake">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-5 px-4 rounded-[1.5rem] shadow-xl shadow-blue-600/20 text-[10px] font-black uppercase tracking-[0.3em] text-white bg-blue-600 hover:bg-slate-900 focus:outline-none transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={18} />}
              <span>{loading ? 'Authenticating...' : 'Engage System'}</span>
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