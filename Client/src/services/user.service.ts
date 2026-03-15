import api from "./api";

export const userService = {
  async getById(id: string) {
    const { data } = await api.get(`/api/users/${id}`);
    return data;
  },

  async update(id: string, formData: FormData) {
    const { data } = await api.put(`/api/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
