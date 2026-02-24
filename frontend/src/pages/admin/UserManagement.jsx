import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', college: '' });
  const [filters, setFilters] = useState({ search: '', role: 'all', bloodGroup: 'all' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.role !== 'all') queryParams.append('role', filters.role);
      if (filters.bloodGroup !== 'all') queryParams.append('bloodGroup', filters.bloodGroup);
      
      const { data } = await api.get(`/users?${queryParams.toString()}`);
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users.');
      toast.error('Failed to fetch users.');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college?._id || ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/users/${editingUser}`, editForm);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: '', college: '' });
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
        console.error(error);
      }
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/users/${userId}/approve`);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to approve user');
      console.error(error);
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      try {
        await api.put(`/users/${userId}/reject`);
        toast.success('User rejected');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to reject user');
        console.error(error);
      }
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
      console.error(error);
    }
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
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, roll number"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Secretary">Secretary</option>
                <option value="Domain Head">Domain Head</option>
                <option value="Associate Head">Associate Head</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', role: 'all', bloodGroup: 'all' })}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">College</th>
                <th className="py-2 px-4">Blood Group</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="py-2 px-4">
                    {editingUser === user._id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="border px-2 py-1 w-full"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingUser === user._id ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="border px-2 py-1 w-full"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingUser === user._id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="border px-2 py-1 w-full"
                      >
                        <option value="Volunteer">Volunteer</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Domain Head">Domain Head</option>
                        <option value="Associate Head">Associate Head</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${user.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-2 px-4">{user.college?.name || 'N/A'}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${user.bloodGroup ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                      {user.bloodGroup || 'Not Set'}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {editingUser === user._id ? (
                      <>
                        <button onClick={handleSaveEdit} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
                        <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                      </>
                    ) : (
                      <>
                        {!user.isApproved && (
                          <button onClick={() => handleApprove(user._id)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Approve</button>
                        )}
                        {!user.isApproved && (
                          <button onClick={() => handleReject(user._id)} className="bg-red-500 text-white px-2 py-1 rounded mr-2">Reject</button>
                        )}
                        <button onClick={() => handleEdit(user)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                        <button onClick={() => handleDelete(user._id)} className="bg-gray-500 text-white px-2 py-1 rounded">Delete</button>
                      </>
                    )}
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

export default UserManagement;
