import api from './api';

const uploadService = {
  
  // Upload NGO Logo or Event Images
  uploadImage: async (formData) => {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default uploadService;