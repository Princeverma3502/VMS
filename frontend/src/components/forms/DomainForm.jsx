import React, { useState } from 'react';
import { Network } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const DomainForm = ({ users = [], onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [headId, setHeadId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, headId });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Network className="text-collab-purple" size={20} /> Create New Domain
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Domain Name"
          placeholder="e.g. Technical Team"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Dropdown for Domain Head */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Domain Head</label>
          <select 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-nss-blue focus:ring-nss-light bg-white"
            value={headId}
            onChange={(e) => setHeadId(e.target.value)}
            required
          >
            <option value="">-- Select a User --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Only users with role 'Domain Head' should be selected.
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-collab-purple text-white hover:bg-purple-700"
          isLoading={isLoading}
        >
          Create Domain
        </Button>
      </form>
    </div>
  );
};

export default DomainForm;