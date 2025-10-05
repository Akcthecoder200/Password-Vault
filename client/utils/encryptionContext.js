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
        // If already initialized, don't try again
        if (encryptionReady) {
          console.log("Encryption already initialized, skipping auto-init");
          return;
        }

        // If no user, can't initialize
        if (!user) {
          console.log("No user, skipping encryption initialization");
          return;
        }

        // Check encryption status flag
        const encryptionStatus = sessionStorage.getItem("encryptionStatus");

        if (encryptionStatus === "initializing") {
          console.log("Encryption initialization in progress, waiting...");
          return; // Another initialization is in progress
        }

        // Check if we have a session stored password and salt
        const sessionPassword = sessionStorage.getItem("temp_password");
        const encSalt = localStorage.getItem("encSalt");

        if (sessionPassword && encSalt) {
          console.log("Auto-initializing encryption with stored credentials");

          // Set flag to prevent multiple initialization attempts
          sessionStorage.setItem("encryptionStatus", "initializing");

          const success = await initializeEncryption(sessionPassword, encSalt);

          if (success) {
            console.log("Auto-initialization successful");
            // Update status flag to indicate success
            sessionStorage.setItem("encryptionStatus", "initialized");
            // We keep password in memory but remove from session storage for security
            sessionStorage.removeItem("temp_password");
          } else {
            console.error("Auto-initialization failed");
            // Clear flag to allow retry
            sessionStorage.removeItem("encryptionStatus");
          }
        } else {
          console.log("Missing credentials for auto-initialization");
          setAttemptedAutoInit(true);
        }
      } catch (error) {
        console.error("Failed to auto-initialize encryption:", error);
        // Clear flag to allow retry
        sessionStorage.removeItem("encryptionStatus");
      }
    };

    // Try to initialize immediately
    tryAutoInitialize();

    // Also set up a periodic check to ensure encryption is initialized
    const checkInterval = setInterval(() => {
      if (!encryptionReady && user) {
        console.log("Periodic encryption check - attempting initialization");
        tryAutoInitialize();
      } else if (encryptionReady) {
        // Clear interval once encryption is ready
        clearInterval(checkInterval);
      }
    }, 2000); // Check every 2 seconds

    // Clean up interval on unmount
    return () => clearInterval(checkInterval);
  }, [user, encryptionReady]);

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

      // If already initialized, don't derive key again
      if (encryptionReady && encryptionKey) {
        console.log("Encryption already initialized, reusing key");
        return true;
      }

      // Save password temporarily for key derivation
      setPassword(userPassword);

      // Also save in session storage for auto-recovery after page refresh
      // This is temporary and will be cleared after successful auto-initialization
      sessionStorage.setItem("temp_password", userPassword);

      // Store salt in localStorage for persistence
      localStorage.setItem("encSalt", encSalt);

      // Derive encryption key with retry mechanism
      let key = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!key && attempts < maxAttempts) {
        attempts++;
        try {
          console.log(
            `Deriving encryption key (attempt ${attempts}/${maxAttempts})...`
          );
          key = await deriveEncryptionKey(userPassword, encSalt);

          if (!key) {
            console.warn("Key derivation returned null, retrying...");
            // Short delay before retry
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (keyError) {
          console.error(`Key derivation attempt ${attempts} failed:`, keyError);
          if (attempts >= maxAttempts) throw keyError;
          // Longer delay before retry after error
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!key) {
        throw new Error(
          "Failed to derive encryption key after multiple attempts"
        );
      }

      // Update state and session storage
      setEncryptionKey(key);
      setEncryptionReady(true);
      setAttemptedAutoInit(true);
      sessionStorage.setItem("encryptionStatus", "initialized");
      console.log("Encryption initialized successfully");

      return true;
    } catch (error) {
      console.error("Failed to initialize encryption:", error);
      setEncryptionReady(false);
      sessionStorage.removeItem("encryptionStatus");
      return false;
    }
  };

  // Encrypt a vault item
  const encrypt = async (item) => {
    if (!encryptionReady || !encryptionKey) {
      console.warn("Encryption not initialized, attempting recovery...");

      // Try to auto-recover encryption before failing
      const recovered = await tryRecoverEncryption();

      if (!recovered) {
        throw new Error("Encryption not initialized");
      }
    }

    return await encryptVaultItem(item, encryptionKey);
  };

  // Decrypt a vault item
  const decrypt = async (encryptedItem) => {
    if (!encryptionReady || !encryptionKey) {
      console.warn("Encryption not initialized, attempting recovery...");

      // Try to auto-recover encryption before failing
      const recovered = await tryRecoverEncryption();

      if (!recovered) {
        throw new Error("Encryption not initialized");
      }
    }

    return await decryptVaultItem(encryptedItem, encryptionKey);
  };

  // Helper function to try to recover encryption state
  const tryRecoverEncryption = async () => {
    // Check if we have required data to recover
    const sessionPassword = sessionStorage.getItem("temp_password");
    const encSalt = localStorage.getItem("encSalt");

    if (sessionPassword && encSalt) {
      console.log("Attempting to recover encryption state...");
      try {
        const success = await initializeEncryption(sessionPassword, encSalt);
        return success;
      } catch (error) {
        console.error("Failed to recover encryption state:", error);
        return false;
      }
    }

    return false;
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
