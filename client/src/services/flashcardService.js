import api from "./api";

export const flashcardService = {
  generate: async (documentId, { regenerate = false } = {}) => {
    const { data } = await api.post("/study/flashcards", {
      documentId,
      regenerate,
    });
    return data;
  },

  getByDocument: async (documentId) => {
    const { data } = await api.get(`/study/flashcards/${documentId}`);
    return data;
  },

  remove: async (documentId) => {
    const { data } = await api.delete(`/study/flashcards/${documentId}`);
    return data;
  },
};
