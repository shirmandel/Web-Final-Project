import api from "./api";

export interface Post {
  _id: string;
  text: string;
  image?: string;
  owner: {
    _id: string;
    username: string;
    profileImage: string;
  };
  tags?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface PostsResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  parsedQuery?: {
    textSearch: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    username: string | null;
    minLikes: number | null;
    minComments: number | null;
  };
}

export const postService = {
  async getAll(page = 1, limit = 10): Promise<PostsResponse> {
    const { data } = await api.get(`/api/posts?page=${page}&limit=${limit}`);
    return data;
  },

  async search(query: string, page = 1, limit = 10): Promise<PostsResponse> {
    const { data } = await api.post(
      `/api/posts/search?page=${page}&limit=${limit}`,
      { query },
    );
    return data;
  },

  async getById(id: string): Promise<Post> {
    const { data } = await api.get(`/api/posts/${id}`);
    return data;
  },

  async getByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PostsResponse> {
    const { data } = await api.get(
      `/api/posts/user/${userId}?page=${page}&limit=${limit}`,
    );
    return data;
  },

  async create(formData: FormData): Promise<Post> {
    const { data } = await api.post("/api/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async update(id: string, formData: FormData): Promise<Post> {
    const { data } = await api.put(`/api/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/posts/${id}`);
  },
};
