import api from "./api";

export const documentService = {
  list: async () => {
    const { data } = await api.get("/documents");
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/documents/${id}`);
    return data;
  },
};
