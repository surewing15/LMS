// src/services/publisherService.js
import api from "./api";

const publisherService = {
  getAll: async () => {
    const response = await api.get("/publishers");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/publishers/${id}`);
    return response.data;
  },
  create: async (publisherData) => {
    const response = await api.post("/publishers", publisherData);
    return response.data;
  },
  update: async (id, publisherData) => {
    const response = await api.put(`/publishers/${id}`, publisherData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/publishers/${id}`);
    return response.data;
  },
};

export default publisherService;
