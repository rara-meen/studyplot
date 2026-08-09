import api from "./api";

export const chatService = {
  send: async (documentId, message) => {
    const { data } = await api.post("/study/chat", { documentId, message });
    return data;
  },

  getHistory: async (documentId) => {
    const { data } = await api.get(`/study/chat/${documentId}`);
    return data;
  },

  clear: async (documentId) => {
    const { data } = await api.delete(`/study/chat/${documentId}`);
    return data;
  },
};
