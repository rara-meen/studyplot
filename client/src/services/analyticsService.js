import api from "./api";

export const analyticsService = {
  getStats: async () => {
    const { data } = await api.get("/study/analytics");
    return data;
  },

  getRecent: async () => {
    const { data } = await api.get("/study/recent");
    return data;
  },
};
