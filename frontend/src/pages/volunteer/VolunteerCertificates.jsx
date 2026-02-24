import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Download, FileText, Calendar, Award } from 'lucide-react';

const VolunteerCertificates = () => {
  const { user } = useContext(AuthContext);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    fetchAvailableCertificates();
  }, []);

  const fetchAvailableCertificates = async () => {
    try {
      const { data } = await api.get('/demo-certificates/available');
      setCertificates(data.data);
    } catch (error) {
      toast.error('Failed to fetch certificates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (certificateId, certificateName) => {
    setGenerating(certificateId);

    try {
      const { data } = await api.post(`/demo-certificates/${certificateId}/generate`);

      // Create a temporary link to download the certificate
      const link = document.createElement('a');
      link.href = data.data.certificateUrl;
      link.download = `${certificateName}_${user.name}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate certificate');
      console.error(error);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return <Layout><Loader /></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">Download personalized certificates for your volunteer work</p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Available</h3>
            <p className="text-gray-600">
              Certificates for your year ({user?.year}) are not available yet.
              Please check back later or contact your secretary.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.certificateName}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar size={14} className="mr-1" />
                        Year {cert.year}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    This certificate will be personalized with your name and details.
                  </p>
                </div>

                <button
                  onClick={() => handleGenerateCertificate(cert._id, cert.certificateName)}
                  disabled={generating === cert._id}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  {generating === cert._id ? 'Generating...' : 'Download Certificate'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Certificates are personalized with your name automatically</li>
            <li>• Only certificates for your academic year are available</li>
            <li>• Download and save your certificates for future use</li>
            <li>• Contact your secretary if certificates are not available</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default VolunteerCertificates;