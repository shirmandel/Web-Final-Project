import api from './api';

export const likeService = {
  async toggle(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data } = await api.post(`/api/likes/${postId}`);
    return data;
  },

  async getStatus(postId: string): Promise<{ liked: boolean }> {
    const { data } = await api.get(`/api/likes/${postId}/status`);
    return data;
  },
};
