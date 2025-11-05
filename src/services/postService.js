import api from '../config/api';

export const postService = {
  // Récupérer les posts
  getPosts: async (lat, lng, radius, type = 'all') => {
    const { data } = await api.get('/posts', {
      params: { lat, lng, radius, type }
    });
    return data.posts;
  },

  // Créer un post
  createPost: async (postData) => {
    const { data } = await api.post('/posts', postData);
    return data.post;
  },

  // Liker un post
  likePost: async (postId) => {
    const { data } = await api.post(`/posts/${postId}/like`);
    return data;
  },

  // Disliker un post
  dislikePost: async (postId) => {
    const { data } = await api.post(`/posts/${postId}/dislike`);
    return data;
  },

  // Commenter un post
  addComment: async (postId, content) => {
    const { data } = await api.post(`/posts/${postId}/comments`, { content });
    return data.comment;
  },

  // Supprimer un post
  deletePost: async (postId) => {
    await api.delete(`/posts/${postId}`);
  }
};

export default postService;

