import api from "./api";

export const noteService = {
  list: async (documentId) => {
    const { data } = await api.get("/notes", {
      params: documentId ? { documentId } : undefined,
    });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/notes/${id}`);
    return data;
  },

  create: async ({ title, content, documentId }) => {
    const { data } = await api.post("/notes", { title, content, documentId });
    return data;
  },

  update: async (id, { title, content }) => {
    const { data } = await api.put(`/notes/${id}`, { title, content });
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/notes/${id}`);
    return data;
  },

  assist: async (action, content) => {
    const { data } = await api.post("/study/notes-assist", { action, content });
    return data;
  },
};
