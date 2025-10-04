import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./auth";
import {
  deriveEncryptionKey,
  encryptVaultItem,
  decryptVaultItem,
  generateEncryptionSalt,
} from "./encryption";

// Create encryption context
const EncryptionContext = createContext();

export function EncryptionProvider({ children }) {
  const { user } = useAuth();
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [password, setPassword] = useState("");
  const [attemptedAutoInit, setAttemptedAutoInit] = useState(false);

  // Try to auto-initialize encryption from session storage
  useEffect(() => {
    const tryAutoInitialize = async () => {
      try {
        // Only try to auto-initialize once
        if (attemptedAutoInit) return;
        setAttemptedAutoInit(true);

        // If already initialized, don't try again
        if (encryptionReady) return;

        // If no user, can't initialize
        if (!user) return;

        // Check if we have a session stored password and salt
        const sessionPassword = sessionStorage.getItem("temp_password");
        const encSalt = localStorage.getItem("encSalt");

        if (sessionPassword && encSalt) {
          console.log("Auto-initializing encryption with stored credentials");
          await initializeEncryption(sessionPassword, encSalt);
          // Clear the session password after initialization for security
          // We keep it in memory in the password state
          sessionStorage.removeItem("temp_password");
        }
      } catch (error) {
        console.error("Failed to auto-initialize encryption:", error);
      }
    };

    tryAutoInitialize();
  }, [user]);

  // Reset encryption state when user changes
  useEffect(() => {
    setEncryptionKey(null);
    setEncryptionReady(false);
    setPassword("");
    setAttemptedAutoInit(false);
  }, [user]);

  // Initialize encryption with user's password and salt
  const initializeEncryption = async (userPassword, encSalt) => {
    try {
      console.log(
        "Initializing encryption with salt:",
        encSalt ? encSalt.substring(0, 5) + "..." : "undefined"
      );

      // Validate inputs
      if (!userPassword) {
        throw new Error("Password is required for encryption initialization");
      }

      if (!encSalt) {
        throw new Error("Salt is required for encryption initialization");
      }

      // Save password temporarily for key derivation
      setPassword(userPassword);

      // Also save in session storage for auto-recovery after page refresh
      // This is temporary and will be cleared after successful auto-initialization
      sessionStorage.setItem("temp_password", userPassword);

      // Derive encryption key
      const key = await deriveEncryptionKey(userPassword, encSalt);

      if (!key) {
        throw new Error("Failed to derive encryption key");
      }

      setEncryptionKey(key);
      setEncryptionReady(true);
      console.log("Encryption initialized successfully");

      return true;
    } catch (error) {
      console.error("Failed to initialize encryption:", error);
      setEncryptionReady(false);
      return false;
    }
  };

  // Encrypt a vault item
  const encrypt = async (item) => {
    if (!encryptionReady || !encryptionKey) {
      throw new Error("Encryption not initialized");
    }

    return await encryptVaultItem(item, encryptionKey);
  };

  // Decrypt a vault item
  const decrypt = async (encryptedItem) => {
    if (!encryptionReady || !encryptionKey) {
      throw new Error("Encryption not initialized");
    }

    return await decryptVaultItem(encryptedItem, encryptionKey);
  };

  // Generate a new salt for registration
  const generateSalt = async () => {
    return await generateEncryptionSalt();
  };

  // Re-derive key with existing password and new salt
  const updateEncryptionKey = async (newSalt) => {
    if (!password) {
      throw new Error("Password not available for key update");
    }

    const key = await deriveEncryptionKey(password, newSalt);
    setEncryptionKey(key);
    return true;
  };

  const value = {
    encryptionReady,
    initializeEncryption,
    encrypt,
    decrypt,
    generateSalt,
    updateEncryptionKey,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
}

export const useEncryption = () => useContext(EncryptionContext);
