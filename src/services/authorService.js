// src/services/authorService.js
import api from "./api";

const authorService = {
  getAll: async () => {
    const response = await api.get("/authors");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/authors/${id}`);
    return response.data;
  },

  create: async (authorData) => {
    const response = await api.post("/authors", authorData);
    return response.data;
  },

  update: async (id, authorData) => {
    const response = await api.put(`/authors/${id}`, authorData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/authors/${id}`);
    return response.data;
  },
};

export default authorService;
