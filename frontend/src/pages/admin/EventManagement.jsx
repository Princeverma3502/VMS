import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/events');
      setEvents(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events.');
      toast.error('Failed to fetch events.');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await api.delete(`/events/${eventId}`);
        toast.success('Event deleted successfully');
        fetchEvents(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete event.');
        console.error(error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Layout><Loader /></Layout>;
  }

  if (error) {
    return <Layout><div className="text-red-500 text-center">{error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Event Management</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-b">
                  <td className="py-2 px-4">{event.name}</td>
                  <td className="py-2 px-4">{formatDate(event.date)}</td>
                  <td className="py-2 px-4">{event.type}</td>
                  <td className="py-2 px-4">{event.status}</td>
                  <td className="py-2 px-4">
                    <Link to={`/events/${event._id}`} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">View</Link>
                    <button onClick={() => handleDelete(event._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default EventManagement;
