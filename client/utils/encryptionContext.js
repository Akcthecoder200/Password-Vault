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

  // Reset encryption state when user changes
  useEffect(() => {
    setEncryptionKey(null);
    setEncryptionReady(false);
    setPassword("");
  }, [user]);

  // Initialize encryption with user's password and salt
  const initializeEncryption = async (userPassword, encSalt) => {
    try {
      // Save password temporarily for key derivation
      setPassword(userPassword);

      // Derive encryption key
      const key = await deriveEncryptionKey(userPassword, encSalt);
      setEncryptionKey(key);
      setEncryptionReady(true);

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
