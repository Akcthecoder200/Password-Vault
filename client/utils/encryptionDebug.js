/**
 * Encryption status checker - helps detect and debug encryption issues
 */

// Add this to any component where you need to check encryption status
export const useEncryptionStatus = () => {
  useEffect(() => {
    const checkEncryption = () => {
      // Check session storage
      const password = sessionStorage.getItem("temp_password");
      const status = sessionStorage.getItem("encryptionStatus");
      const salt = localStorage.getItem("encSalt");

      console.log("Encryption Status Check:", {
        passwordStored: !!password,
        encryptionStatus: status || "not set",
        saltStored: !!salt,
      });

      return {
        passwordStored: !!password,
        encryptionStatus: status,
        saltStored: !!salt,
      };
    };

    // Initial check
    const initialStatus = checkEncryption();

    // Set up periodic checks
    const intervalId = setInterval(checkEncryption, 5000);

    return () => clearInterval(intervalId);
  }, []);
};

// Function to reset encryption state (for troubleshooting)
export const resetEncryptionState = () => {
  console.log("Resetting encryption state...");
  sessionStorage.removeItem("temp_password");
  sessionStorage.removeItem("encryptionStatus");
  // Don't remove encSalt as it's needed for authentication
};

// Function to manually reinitialize encryption (for troubleshooting)
export const reinitializeEncryption = async (encryptionContext) => {
  if (!encryptionContext) return false;

  const password = sessionStorage.getItem("temp_password");
  const salt = localStorage.getItem("encSalt");

  if (!password || !salt) {
    console.error("Cannot reinitialize: missing password or salt");
    return false;
  }

  console.log("Manually reinitializing encryption...");
  return await encryptionContext.initializeEncryption(password, salt);
};
