import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { UserPlus, ArrowLeft, LockKeyhole } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    whatsappNumber: '',
    password: '',
    branch: '',
    year: '1st',
    role: 'Volunteer', // Default
    collegeId: '',
    adminSecret: ''
  });
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIC: AUTO-ASSIGN ROLE BASED ON YEAR ---
  useEffect(() => {
    // If user manually selects Secretary, we don't overwrite it based on year
    if (formData.role === 'Secretary') return;

    let autoRole = 'Volunteer';
    switch(formData.year) {
        case '1st': autoRole = 'Volunteer'; break;
        case '2nd': autoRole = 'Associate Head'; break;
        case '3rd': autoRole = 'Domain Head'; break;
        case '4th': autoRole = 'Domain Head'; break; // or Secretary
        default: autoRole = 'Volunteer';
    }
    setFormData(prev => ({ ...prev, role: autoRole }));
  }, [formData.year]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await import('../services/api').then(m => m.default.get('/colleges'));
        const list = res.data || [];
        setColleges(list);
        const hbtu = list.find(c => /harcourt butler/i.test(c.name));
        if (hbtu) setFormData(prev => ({ ...prev, collegeId: hbtu._id }));
        else if (list.length > 0) setFormData(prev => ({ ...prev, collegeId: list[0]._id }));
      } catch (err) {
        console.error('Failed to load colleges', err);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handler for Role change to allow switching to 'Secretary' manually
    if (name === 'role' && value === 'Secretary') {
        setFormData({ ...formData, role: 'Secretary' });
    } else if (name === 'role' && value !== 'Secretary') {
        // If they try to switch back from Secretary, re-run year logic
        const year = formData.year;
        let autoRole = 'Volunteer';
        if (year === '2nd') autoRole = 'Associate Head';
        if (year === '3rd') autoRole = 'Domain Head';
        setFormData({ ...formData, role: autoRole });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const result = await register(formData);

    if (result.success) {
      if (result.pending) {
        setSuccessMsg(result.message);
      } else {
        navigate('/secretary/dashboard');
      }
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  if (successMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-green-500 animate-fade-in">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{successMsg}</p>
            <Link to="/login" className="block w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-transform hover:scale-[1.02]">
                Return to Login
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100 animate-fade-in">
        
        <div className="flex items-center gap-2 mb-6 text-gray-400 hover:text-gray-600 transition-colors w-fit">
            <ArrowLeft size={18} />
            <Link to="/login" className="text-sm font-medium">Back</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-500 mb-8">Join the National Service Scheme (NSS)</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-center justify-center">
                {error}
            </div>
          )}

          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
          <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="e.g. 250108048" />

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1.5">College / University</label>
            <select name="collegeId" value={formData.collegeId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none">
              <option value="">Select College</option>
              {colleges.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Branch</label>
                <select name="branch" value={formData.branch} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer text-gray-700">
                  <option value="">Select Branch</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="EE">EE</option>
                  <option value="ET">ET</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="CHE">CHE</option>
                  <option value="BE">BE</option>
                  <option value="PT">PT</option>
                  <option value="PL">PL</option>
                  <option value="OT">OT</option>
                  <option value="FT">FT</option>
                  <option value="LFT">LFT</option>
                  <option value="BIOTECH">BIOTECH</option>
                  <option value="BBA">BBA</option>
                  <option value="B.PHARMA">B.PHARMA</option>
                  <option value="BS-MS">BS-MS</option>
                </select>
            </div>
            
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">Year</label>
                <div className="relative">
                    <select 
                        name="year" 
                        value={formData.year} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer text-gray-700"
                    >
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                    </select>
                </div>
            </div>
          </div>

          <Input label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />

          {/* Role Selection (Locked based on Year) */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Role <span className="text-xs text-gray-400 font-normal">(Based on your Year)</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
                <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl outline-none transition-all font-bold text-gray-800
                        ${formData.role === 'Secretary' ? 'bg-red-50 border-red-200' : 'bg-gray-100 cursor-not-allowed'}
                    `}
                >
                    {/* Only show the auto-assigned role OR Secretary */}
                    <option value={formData.role}>{formData.role}</option>
                    <option value="Secretary">Secretary (Admin Access)</option>
                </select>
            </div>
          </div>

          {formData.role === 'Secretary' && (
             <div className="animate-fade-in bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-2 text-red-800 font-bold text-sm">
                    <LockKeyhole size={16} /> Admin Verification
                </div>
                <Input type="password" name="adminSecret" placeholder="Enter Admin Secret Key" value={formData.adminSecret} onChange={handleChange} className="bg-white" required />
             </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-3 mt-4" isLoading={isLoading}>
            Submit Registration
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;