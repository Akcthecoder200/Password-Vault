import axios from "axios";

// API Base URL - automatically switches between development and production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

console.log("API Base URL:", API_BASE_URL);

// Create an axios instance with base URL and default settings
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on 401
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  verifyToken: () => api.get("/auth/verify"),
};

// Vault API functions
export const vaultAPI = {
  getAll: () => api.get("/vault"),
  getById: (id) => api.get(`/vault/${id}`),
  create: (vaultItem) => api.post("/vault", vaultItem),
  update: (id, vaultItem) => api.put(`/vault/${id}`, vaultItem),
  delete: (id) => api.delete(`/vault/${id}`),
};

export default api;
