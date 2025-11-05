import api from '../config/api';

export const uploadService = {
  // Upload une image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data.url;
  },

  // Upload plusieurs images
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const { data } = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data.images.map(img => img.url);
  },

  // Upload une vidéo
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('video', file);

    const { data } = await api.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data.url;
  }
};

export default uploadService;

