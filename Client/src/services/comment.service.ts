import api from './api';

export interface Comment {
  _id: string;
  content: string;
  postId: string;
  owner: {
    _id: string;
    username: string;
    profileImage: string;
  };
  createdAt: string;
}

export const commentService = {
  async getByPost(postId: string): Promise<Comment[]> {
    const { data } = await api.get(`/api/comments/${postId}`);
    return data;
  },

  async create(postId: string, content: string): Promise<Comment> {
    const { data } = await api.post('/api/comments', { postId, content });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/comments/${id}`);
  },
};
