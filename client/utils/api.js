import axios from "axios";

// Create an axios instance with base URL and default settings
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
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
