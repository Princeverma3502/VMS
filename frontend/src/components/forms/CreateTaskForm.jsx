import React, { useState } from 'react';
import api from '../../services/api';
import Input from '../common/Input';
import Button from '../common/Button';
import { ClipboardList, Plus } from 'lucide-react';

const CreateTaskForm = ({ onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    xpReward: 20
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/tasks', formData);
      alert("Task Created Successfully!");
      setFormData({ title: '', description: '', deadline: '', xpReward: 20 });
      if(onTaskCreated) onTaskCreated(data); // Refresh parent list
    } catch (error) {
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
        <Plus className="text-nss-blue" size={20}/> Assign New Task
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
            label="Task Title" 
            name="title" 
            placeholder="e.g. Design Poster for Blood Donation" 
            value={formData.title} 
            onChange={handleChange} 
            required 
        />

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Input 
                label="Deadline" 
                type="date" 
                name="deadline" 
                value={formData.deadline} 
                onChange={handleChange} 
                required 
            />
            <Input 
                label="XP Reward" 
                type="number" 
                name="xpReward" 
                value={formData.xpReward} 
                onChange={handleChange} 
                required 
            />
        </div>

        <Button type="submit" isLoading={loading} className="w-full">
            Publish Task
        </Button>
      </form>
    </div>
  );
};

export default CreateTaskForm;