import * as sodium from "libsodium-wrappers";

/**
 * Encryption utilities for client-side encryption using libsodium
 */

// Wait for sodium to initialize
const sodiumReady = sodium.ready;

/**
 * Derives an encryption key from password and salt
 * @param {string} password - User's password
 * @param {string} salt - Salt retrieved from the server
 * @returns {Uint8Array} - Derived encryption key
 */
export async function deriveEncryptionKey(password, salt) {
  await sodiumReady;

  // Convert password and salt to Uint8Array
  const passwordBuffer = sodium.from_string(password);
  const saltBuffer = sodium.from_base64(salt);

  // Derive a key using Argon2id
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    passwordBuffer,
    saltBuffer,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  return key;
}

/**
 * Encrypts a vault item using XChaCha20-Poly1305
 * @param {Object} item - Vault item to encrypt
 * @param {Uint8Array} key - Encryption key
 * @returns {Object} - Encrypted item with ciphertext and nonce
 */
export async function encryptVaultItem(item, key) {
  await sodiumReady;

  // Convert item to JSON string and then to Uint8Array
  const messageJson = JSON.stringify(item);
  const messageBuffer = sodium.from_string(messageJson);

  // Generate a random nonce
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  // Encrypt the message
  const ciphertext = sodium.crypto_secretbox_easy(messageBuffer, nonce, key);

  // Convert binary data to base64 for storage
  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
  };
}

/**
 * Decrypts a vault item using XChaCha20-Poly1305
 * @param {Object} encryptedItem - Encrypted item with ciphertext and nonce
 * @param {Uint8Array} key - Encryption key
 * @returns {Object} - Decrypted vault item
 */
export async function decryptVaultItem(encryptedItem, key) {
  await sodiumReady;

  // Convert base64 to Uint8Array
  const ciphertext = sodium.from_base64(encryptedItem.ciphertext);
  const nonce = sodium.from_base64(encryptedItem.nonce);

  try {
    // Decrypt the ciphertext
    const messageBuffer = sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      key
    );

    // Convert Uint8Array to string and parse JSON
    const messageJson = sodium.to_string(messageBuffer);
    return JSON.parse(messageJson);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error(
      "Failed to decrypt vault item. The encryption key may be incorrect."
    );
  }
}

/**
 * Generates a random encryption salt
 * @returns {string} - Base64 encoded salt
 */
export async function generateEncryptionSalt() {
  await sodiumReady;

  // Generate a random salt
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

  // Convert to base64 for storage
  return sodium.to_base64(salt);
}
