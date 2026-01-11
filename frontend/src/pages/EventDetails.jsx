import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// --- Discussion Component ---
const EventDiscussion = ({ eventId }) => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/discussions/${eventId}`);
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch discussion posts", error);
      toast.error("Failed to load discussion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchPosts();
    }
  }, [eventId]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      await api.post(`/discussions/${eventId}`, { content: newPostContent });
      setNewPostContent('');
      toast.success('Your message has been posted!');
      fetchPosts(); // Refresh posts
    } catch (error) {
      toast.error("Failed to post message.");
      console.error("Failed to create post", error);
    }
  };
  
  const Post = ({ post }) => (
    <div className="flex items-start gap-3 mb-4">
      <img src={post.userId.profileImage || '/placeholder-logo.svg'} alt={post.userId.name} className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-1 bg-gray-100 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{post.userId.name}</span>
          <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleTimeString()}</span>
        </div>
        <p className="text-sm mt-1">{post.content}</p>
      </div>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Discussion</h3>
      <div className="space-y-4 mb-6">
        {posts.length > 0 ? posts.map(post => <Post key={post._id} post={post} />) : <p className="text-gray-500">No discussion yet. Be the first to comment!</p>}
      </div>
      <form onSubmit={handlePostSubmit} className="flex gap-2">
        <input
          type="text"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Ask a question or leave a comment..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Post</button>
      </form>
    </div>
  );
};


// --- Main Event Details Page ---
const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        setError('Failed to fetch event details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return <Layout><Loader /></Layout>;
  }

  if (error || !event) {
    return <Layout><div className="text-red-500 text-center p-8">{error || 'Event not found.'}</div></Layout>;
  }

  return (
    <Layout showBackButton={true}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
        <div className="text-gray-500 mb-4">
          <span>{new Date(event.date).toDateString()}</span> | <span>{event.location || 'Online'}</span>
        </div>
        <p className="mb-6">{event.description}</p>
        
        <div className="border-t border-gray-200 pt-6">
          <EventDiscussion eventId={event._id} />
        </div>
      </div>
    </Layout>
  );
};

export default EventDetails;
