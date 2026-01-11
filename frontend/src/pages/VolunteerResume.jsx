import React, { useState, useEffect, useContext } from 'react';
import { Download, Share2, Award, Clock, Zap, Users, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';

const VolunteerResume = () => {
  const { user } = useContext(AuthContext);
  const { userId } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchResume();
  }, [userId]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await api.get(userId ? `/volunteer-resume/${userId}` : '/volunteer-resume');
      setResume(response.data.data);
      setBio(response.data.data.bio || '');
    } catch (error) {
      console.error('Failed to fetch resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBio = async () => {
    try {
      await api.put('/volunteer-resume', { bio });
      setResume({ ...resume, bio });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      const response = await api.post('/volunteer-resume/generate-certificate');
      alert('Certificate generated successfully!');
      window.open(response.data.data.certificateUrl, '_blank');
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  const handleDownloadResume = () => {
    // Implement PDF download logic
    alert('Resume download feature coming soon!');
  };

  if (loading) {
    return <Layout showBackButton={true}><div className="text-center py-12">Loading resume...</div></Layout>;
  }

  if (!resume) {
    return <Layout showBackButton={true}><div className="text-center py-12">Resume not found</div></Layout>;
  }

  return (
    <Layout showBackButton={true}>
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{resume.userId?.name}</h1>
              <p className="text-blue-100 text-sm sm:text-base">
                {resume.userId?.branch} • Year {resume.userId?.year}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{resume.level}</div>
              <p className="text-blue-100 text-sm">Current Level</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-blue-400">
            <div>
              <p className="text-blue-100 text-sm">Total XP</p>
              <p className="text-2xl font-bold">{resume.totalXP}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Hours</p>
              <p className="text-2xl font-bold">{resume.totalHours}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Events</p>
              <p className="text-2xl font-bold">{resume.eventsAttended.length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Badges</p>
              <p className="text-2xl font-bold">{resume.badges.length}</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={24} className="text-blue-600" />
            About
          </h2>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Write a brief bio about yourself and your volunteer journey..."
              />
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateBio}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Save Bio
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4">{bio || 'No bio added yet.'}</p>
              {!userId && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit Bio
                </button>
              )}
            </>
          )}
        </div>

        {/* Skills Section */}
        {resume.topSkills.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={24} className="text-yellow-500" />
              Top Skills
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resume.topSkills.map((skill, idx) => (
                <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{skill.name}</h3>
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      {skill.proficiency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{skill.tasksCompleted} tasks completed</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domains Contributed */}
        {resume.domainsContributed.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={24} className="text-green-600" />
              Domains Contributed
            </h2>

            <div className="space-y-3">
              {resume.domainsContributed.map((domain, idx) => (
                <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{domain.domainName}</h3>
                    <span className="bg-green-200 text-green-800 text-sm px-2 py-1 rounded">
                      {domain.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 {domain.tasksCompleted} tasks</span>
                    <span>⏱️ {domain.hoursSpent}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${domain.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {resume.badges.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award size={24} className="text-purple-600" />
              Achievements ({resume.badges.length})
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {resume.badges.map((badge, idx) => (
                <div key={idx} className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl mb-2">🏅</div>
                  <p className="font-bold text-sm text-gray-800">{badge.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerateCertificate}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Award size={20} />
            Generate Certificate
          </button>
          <button
            onClick={handleDownloadResume}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Download size={20} />
            Download Resume
          </button>
          <button
            onClick={() => {
              navigator.share({
                title: `${resume.userId?.name}'s Volunteer Resume`,
                url: window.location.href,
              });
            }}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <Share2 size={20} />
            Share
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default VolunteerResume;
