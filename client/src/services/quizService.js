import api from "./api";

export const quizService = {
  generate: async (documentId, difficulty, { regenerate = false } = {}) => {
    const { data } = await api.post("/study/quiz", {
      documentId,
      difficulty,
      regenerate,
    });
    return data;
  },

  getByDocument: async (documentId, difficulty) => {
    const { data } = await api.get(`/study/quiz/${documentId}`, {
      params: difficulty ? { difficulty } : undefined,
    });
    return data;
  },

  remove: async (documentId, difficulty) => {
    const { data } = await api.delete(`/study/quiz/${documentId}`, {
      params: difficulty ? { difficulty } : undefined,
    });
    return data;
  },

  submitScore: async (documentId, payload) => {
    const { data } = await api.post(`/study/quiz/${documentId}/score`, payload);
    return data;
  },
};
