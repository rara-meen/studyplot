import api from "./api";

export const notificationService = {
  list: async () => {
    const { data } = await api.get("/notifications");
    return data;
  },

  markRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async () => {
    const { data } = await api.put("/notifications/read-all");
    return data;
  },

  clear: async () => {
    const { data } = await api.delete("/notifications");
    return data;
  },
};
