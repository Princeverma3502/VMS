import React, { useState, useEffect, useContext } from 'react';
import { Search, BookOpen, HelpCircle, FileText, Video, Download } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const KnowledgeBase = () => {
  const { user } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'all', label: 'All Articles', icon: BookOpen },
    { name: 'Getting Started', label: 'Getting Started', icon: HelpCircle },
    { name: 'Guidelines', label: 'Guidelines', icon: FileText },
    { name: 'Procedures', label: 'Procedures', icon: FileText },
    { name: 'FAQ', label: 'FAQ', icon: HelpCircle },
    { name: 'Resources', label: 'Resources', icon: Download },
  ];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchQuery]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let url = '/knowledge-base';
      if (selectedCategory !== 'all') {
        url = `/knowledge-base/category/${selectedCategory}`;
      } else if (searchQuery) {
        url = `/knowledge-base/search/${searchQuery}`;
      }
      const response = await api.get(url);
      setArticles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleSelect = async (article) => {
    try {
      const response = await api.get(`/knowledge-base/${article.slug}`);
      setSelectedArticle(response.data.data);
    } catch (error) {
      console.error('Failed to fetch article:', error);
    }
  };

  const handleMarkHelpful = async (helpful) => {
    try {
      await api.put(`/knowledge-base/${selectedArticle.slug}/helpful`, { helpful });
      alert(helpful ? 'Thanks for finding this helpful!' : 'Thanks for the feedback');
    } catch (error) {
      console.error('Failed to mark helpful:', error);
    }
  };

  return (
    <Layout showBackButton={true}>
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <BookOpen size={32} className="text-blue-600" />
            Knowledge Base
          </h1>
          <p className="text-gray-600">Find answers and learn how to get the most out of the application</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(({ name, label, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
                selectedCategory === name
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Articles List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-100 border-b">
                <h2 className="font-bold text-gray-800">
                  {selectedCategory === 'all' ? 'All Articles' : selectedCategory}
                </h2>
                <p className="text-sm text-gray-600">{articles.length} articles</p>
              </div>

              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {articles.map((article) => (
                    <button
                      key={article._id}
                      onClick={() => handleArticleSelect(article)}
                      className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
                        selectedArticle?._id === article._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <h3 className="font-medium text-gray-800 text-sm">{article.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{article.views} views</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    {selectedArticle.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedArticle.title}</h1>
                  <p className="text-gray-600">{selectedArticle.description}</p>
                </div>

                {selectedArticle.videoUrl && (
                  <div className="mb-6 bg-black rounded-lg overflow-hidden h-64 sm:h-96 flex items-center justify-center">
                    <Video size={48} className="text-gray-400" />
                    {/* Replace with actual video player */}
                  </div>
                )}

                <div className="prose max-w-none mb-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedArticle.content}</div>
                </div>

                {selectedArticle.attachments && selectedArticle.attachments.length > 0 && (
                  <div className="mb-6 border-t pt-6">
                    <h3 className="font-bold text-gray-800 mb-3">Attachments</h3>
                    <div className="space-y-2">
                      {selectedArticle.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.fileUrl}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Download size={18} className="text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">{attachment.fileName}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpful Section */}
                <div className="border-t pt-6 mt-6">
                  <p className="text-sm text-gray-600 mb-3">Was this article helpful?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleMarkHelpful(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                    >
                      👍 Yes
                    </button>
                    <button
                      onClick={() => handleMarkHelpful(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                    >
                      👎 No
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Select an article to read</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KnowledgeBase;
