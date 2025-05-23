// src/services/bookService.js
import api from "./api";

const bookService = {
  getAll: async () => {
    const response = await api.get("/books");
    return response.data;
  },
  getFormData: async () => {
    const response = await api.get("/books/form-data");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  create: async (bookData) => {
    const response = await api.post("/books", bookData);
    return response.data;
  },
  update: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
};

export default bookService;
