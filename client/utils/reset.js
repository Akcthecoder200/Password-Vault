/**
 * Reset utilities for the app
 * This module provides functions to handle various reset scenarios
 */

/**
 * Reset the encryption state when there are decryption issues
 * This clears sessionStorage and localStorage items related to encryption
 */
export function resetEncryptionState() {
  console.log("Resetting encryption state due to decryption issues");

  // Clear encryption-related items from storage
  sessionStorage.removeItem("encryptionStatus");
  sessionStorage.removeItem("temp_password");

  // Don't remove encSalt as it's needed for re-login
  // localStorage.removeItem("encSalt");

  return true;
}

/**
 * Perform a full reset of the app state
 * This is more aggressive and removes all user data from storage
 * Should be used as a last resort when encountering persistent issues
 */
export function resetAppState() {
  console.log("Performing full app state reset");

  // Clear all relevant storage
  sessionStorage.clear();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("encSalt");

  return true;
}
