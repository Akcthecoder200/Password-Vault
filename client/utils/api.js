import axios from "axios";

// API Base URL - automatically switches between development and production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Remove trailing slash if it exists
const cleanBaseUrl = API_BASE_URL.endsWith("/")
  ? API_BASE_URL.slice(0, -1)
  : API_BASE_URL;

console.log("API Base URL:", cleanBaseUrl);

// Create an axios instance with base URL and default settings
const api = axios.create({
  baseURL: `${cleanBaseUrl}/api`,
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
    // Enhanced error logging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log("Unauthorized - redirecting to login");
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
