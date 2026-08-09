import axios from "axios";

const TOKEN_KEY = "studyplot-token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((requestConfig) => {
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/signup");

    if (error?.response?.status === 401 && !isAuthEndpoint) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem("studyplot-user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
