import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Trash2, Download, Calendar } from 'lucide-react';

const DemoCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    certificateName: '',
    year: new Date().getFullYear(),
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await api.get('/demo-certificates');
      setCertificates(data.data);
    } catch (error) {
      toast.error('Failed to fetch certificates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast.error('Please select a PDF or image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a certificate file');
      return;
    }

    if (!formData.certificateName.trim()) {
      toast.error('Please enter certificate name');
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('certificate', selectedFile);
      uploadData.append('certificateName', formData.certificateName);
      uploadData.append('year', formData.year);

      await api.post('/demo-certificates', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Certificate uploaded successfully');
      setFormData({ certificateName: '', year: new Date().getFullYear() });
      setSelectedFile(null);
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to upload certificate');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await api.delete(`/demo-certificates/${id}`);
        toast.success('Certificate deleted successfully');
        fetchCertificates();
      } catch (error) {
        toast.error('Failed to delete certificate');
        console.error(error);
      }
    }
  };

  if (loading) {
    return <Layout><Loader /></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Certificates</h1>
          <p className="text-gray-600">Upload demo certificates that volunteers can download with their names</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Certificate</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Name
                </label>
                <input
                  type="text"
                  value={formData.certificateName}
                  onChange={(e) => setFormData({ ...formData, certificateName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., NSS Volunteer Certificate 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="2020"
                  max="2030"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate File (PDF or Image)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="certificate-file"
                />
                <label
                  htmlFor="certificate-file"
                  className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100"
                >
                  <Upload size={16} className="mr-2" />
                  Choose File
                </label>
                {selectedFile && (
                  <span className="text-sm text-gray-600">{selectedFile.name}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Certificate'}
            </button>
          </form>
        </div>

        {/* Certificates List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Uploaded Certificates</h2>
          </div>

          {certificates.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No certificates uploaded yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {certificates.map((cert) => (
                <div key={cert._id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{cert.certificateName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Year {cert.year}
                        </span>
                        <span>Downloads: {cert.downloadCount}</span>
                        <span>Uploaded by: {cert.uploadedBy?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="View Certificate"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => handleDelete(cert._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Certificate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DemoCertificates;