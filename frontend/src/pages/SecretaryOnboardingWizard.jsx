import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ChevronRight, Upload } from 'lucide-react';

const SecretaryOnboardingWizard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [collegeData, setCollegeData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    primaryColor: '#1d4ed8'
  });

  const [sessionData, setSessionData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const handleCollegeChange = (e) => {
    const { name, value } = e.target;
    setCollegeData(prev => ({ ...prev, [name]: value }));
    if (name === 'name') {
      setCollegeData(prev => ({ ...prev, slug: value.toLowerCase().replace(/\s+/g, '-') }));
    }
  };

  const handleSessionChange = (e) => {
    const { name, value } = e.target;
    setSessionData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCollegeData(prev => ({ ...prev, logoUrl: evt.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const createCollege = async () => {
    setLoading(true);
    try {
      const response = await api.post('/colleges', collegeData);
      const collegeId = response.data._id;

      // Assign college to current user
      await api.put('/users/assign-college', { collegeId });

      // Move to session creation step
      setStep(2);
    } catch (error) {
      alert('Error creating college: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    setLoading(true);
    try {
      const payload = {
        name: sessionData.name,
        startDate: sessionData.startDate,
        endDate: sessionData.endDate,
        collegeId: user?.collegeId,
        metadata: {}
      };

      await api.post('/sessions', payload);
      alert('College and session created successfully!');
      navigate('/secretary/dashboard');
    } catch (error) {
      alert('Error creating session: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'Secretary') {
    return <div className="text-center mt-10">Only Secretaries can access this wizard.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-nss-blue to-blue-900 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {step === 1 ? (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Register Your NSS Unit</h2>
            <p className="text-gray-600 mb-8">Step 1 of 2: College Details</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">College Name</label>
                <input
                  type="text"
                  name="name"
                  value={collegeData.name}
                  onChange={handleCollegeChange}
                  placeholder="e.g., IIT Delhi"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nss-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">College Slug (URL-friendly)</label>
                <input
                  type="text"
                  name="slug"
                  value={collegeData.slug}
                  onChange={handleCollegeChange}
                  placeholder="e.g., iit-delhi"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nss-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-nss-blue rounded-lg cursor-pointer hover:bg-blue-50">
                  <div className="flex items-center gap-2">
                    <Upload size={20} className="text-nss-blue" />
                    <span className="text-nss-blue font-medium">Click to upload</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Brand Color</label>
                <input
                  type="color"
                  name="primaryColor"
                  value={collegeData.primaryColor}
                  onChange={handleCollegeChange}
                  className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>

              <button
                onClick={createCollege}
                disabled={!collegeData.name || !collegeData.slug || loading}
                className="w-full bg-nss-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating...' : 'Continue to Session Setup'} <ChevronRight size={20} />
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Academic Session</h2>
            <p className="text-gray-600 mb-8">Step 2 of 2: Session Details</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Name</label>
                <input
                  type="text"
                  name="name"
                  value={sessionData.name}
                  onChange={handleSessionChange}
                  placeholder="e.g., 2024-25"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nss-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={sessionData.startDate}
                    onChange={handleSessionChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nss-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={sessionData.endDate}
                    onChange={handleSessionChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nss-blue outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Back
                </button>
                <button
                  onClick={createSession}
                  disabled={!sessionData.name || !sessionData.startDate || !sessionData.endDate || loading}
                  className="flex-1 bg-nss-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecretaryOnboardingWizard;
