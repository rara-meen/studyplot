import api from "./api";

export const summaryService = {
  generate: async (documentId, { regenerate = false } = {}) => {
    const { data } = await api.post("/study/summary", {
      documentId,
      regenerate,
    });
    return data;
  },
};
