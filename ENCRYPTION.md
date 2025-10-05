# Password Vault - Encryption Documentation

This document provides detailed information about the encryption implementation in the Password Vault application.

## Overview

Password Vault uses client-side encryption to ensure that sensitive data never leaves the user's device in an unencrypted form. All encryption and decryption operations are performed in the browser, and only encrypted data is transmitted to and stored on the server.

## Encryption Libraries

- **Primary Library**: [libsodium-wrappers](https://github.com/jedisct1/libsodium.js) (v0.7.11)
- **Fallback Mechanism**: Custom PBKDF2-like implementation for browsers with limited WebAssembly support

## Encryption Flow

### Key Derivation

1. **Salt Generation**: A random salt is generated during user registration
2. **Key Derivation**: The user's master password and salt are used to derive an encryption key using Argon2id
3. **Storage**: The salt is stored on the server, while the derived key exists only in browser memory

```javascript
// Key derivation example
const key = await deriveEncryptionKey(masterPassword, salt);
```

### Encryption Process

1. **Data Preparation**: Vault item is serialized to JSON
2. **Nonce Generation**: A random nonce is generated for each encryption operation
3. **Encryption**: XChaCha20-Poly1305 authenticated encryption is used to encrypt the data
4. **Result**: Encrypted data includes the ciphertext and nonce (both base64-encoded)

```javascript
// Encryption example
const encryptedData = await encrypt(vaultItem, encryptionKey);
// Result: { ciphertext: "...", nonce: "..." }
```

### Decryption Process

1. **Data Validation**: Ensure encrypted data contains ciphertext and nonce
2. **Decryption**: XChaCha20-Poly1305 authenticated decryption is used
3. **Parsing**: Decrypted JSON string is parsed back into an object

```javascript
// Decryption example
const decryptedItem = await decrypt(encryptedData, encryptionKey);
```

## Security Considerations

### Key Security

- The master password is never stored, even in memory for longer than necessary
- The encryption key is derived using Argon2id with the following parameters:
  - Operations limit: Interactive (4)
  - Memory limit: 33MB
  - Algorithm: Argon2id

### Encryption Security

- **Algorithm**: XChaCha20-Poly1305 (authenticated encryption)
- **Key Length**: 256 bits
- **Nonce Length**: 24 bytes (never reused)
- **Authentication**: Poly1305 MAC ensures data integrity

### Implementation Details

- **Initialization**: Encryption is initialized during login and persisted across page navigations
- **Auto-Recovery**: The system attempts to auto-recover encryption state if it's lost
- **Fallback Mechanism**: For browsers where WebAssembly or specific crypto functions aren't available

## Error Handling

### Common Error Scenarios

1. **"Encryption is not initialized"**

   - Cause: Encryption key not properly derived or lost
   - Resolution: Auto-recovery attempt or page reload

2. **"crypto_pwhash is not a function"**

   - Cause: libsodium not fully initialized or WebAssembly issues
   - Resolution: Fallback to alternative key derivation

3. **"Failed to decrypt vault item"**
   - Cause: Incorrect key, corrupted data, or tampered data
   - Resolution: Re-authentication to derive correct key

## Encryption Context

The `EncryptionContext` manages the encryption state across the application. It provides:

1. **Encryption Services**: Functions for encrypting and decrypting data
2. **State Management**: Tracks encryption initialization status
3. **Auto-Recovery**: Attempts to recover from lost encryption state

## Testing Encryption

A test page is available at `/test-sodium` to verify that the encryption system is working correctly.

Tests include:

1. Sodium initialization
2. Salt generation
3. Key derivation
4. Encryption and decryption

## Browser Compatibility

- **Full Support**: Chrome, Firefox, Edge, Safari (latest versions)
- **Limited Support**: Older browsers with fallback encryption
- **Not Supported**: Browsers without WebCrypto API

## Best Practices for Developers

1. **Never bypass encryption**: All sensitive data must go through the encryption process
2. **Use the EncryptionContext**: Always use the provided context instead of direct libsodium calls
3. **Handle errors gracefully**: Provide user-friendly feedback for encryption errors
4. **Test thoroughly**: Verify encryption works across different browsers and scenarios

## References

- [libsodium Documentation](https://doc.libsodium.org/)
- [XChaCha20-Poly1305 Specification](https://datatracker.ietf.org/doc/html/draft-arciszewski-xchacha)
- [Argon2 Key Derivation](https://github.com/P-H-C/phc-winner-argon2)
