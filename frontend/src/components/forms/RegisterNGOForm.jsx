import React, { useState } from 'react';
import { Upload, FileImage } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const RegisterNGOForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  // Handle Text Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setPreviewUrl(URL.createObjectURL(file)); // Create local preview
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData object for file upload
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    if (formData.logo) {
      data.append('logo', formData.logo);
    }

    onSubmit(data);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-nss-blue mb-4">Register New NGO</h3>
      
      <form onSubmit={handleSubmit}>
        <Input 
          label="NGO Name"
          name="name"
          placeholder="e.g. Green Earth Foundation"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            name="description"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-nss-blue focus:ring-nss-light transition-all"
            placeholder="Brief details..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* File Upload UI */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo Upload</label>
          <div className="flex items-center gap-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {previewUrl ? (
                   <img src={previewUrl} alt="Preview" className="h-20 object-contain" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> logo
                    </p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Register NGO
        </Button>
      </form>
    </div>
  );
};

export default RegisterNGOForm;