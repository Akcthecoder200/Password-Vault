import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/router";
import { authAPI } from "../utils/api";
import { generateEncryptionSalt } from "./encryption";

// Create auth context
const AuthContext = createContext();

// Safe localStorage access (for Next.js SSR compatibility)
const getLocalStorage = (key) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key, value) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorage = (key) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    async function loadUserFromToken() {
      const token = getLocalStorage("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.verifyToken();
        setUser(response.data.user);
      } catch (error) {
        console.error("Token verification failed:", error);
        removeLocalStorage("token");
      } finally {
        setLoading(false);
      }
    }

    loadUserFromToken();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // Extract user from response
      const userData = {
        _id: response.data._id,
        email: response.data.email,
        name: response.data.name || response.data.email.split("@")[0],
        encSalt: response.data.encSalt, // Get encryption salt from response
      };
      setLocalStorage("token", response.data.token);
      // Store salt for later use
      setLocalStorage("encSalt", response.data.encSalt);
      setUser(userData);
      return {
        success: true,
        encSalt: response.data.encSalt, // Return salt for encryption initialization
        userData,
      };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      // Generate encryption salt for the user
      const encSalt = await generateEncryptionSalt();

      // Add encryption salt to user data
      const userDataWithSalt = {
        ...userData,
        encSalt,
      };

      // Register user with the generated salt
      await authAPI.register(userDataWithSalt);
      return {
        success: true,
        encSalt, // Return salt for future reference
      };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  // Logout function
  const logout = () => {
    removeLocalStorage("token");
    setUser(null);
    router.push("/login");
  };

  // Auth context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Higher-order component to protect routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.replace("/login");
      }
    }, [loading, isAuthenticated, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      );
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}
