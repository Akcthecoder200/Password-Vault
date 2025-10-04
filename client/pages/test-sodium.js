import React, { useEffect, useState } from "react";
import {
  deriveEncryptionKey,
  encryptVaultItem,
  decryptVaultItem,
  generateEncryptionSalt,
} from "../utils/encryption";

export default function SodiumTest() {
  const [status, setStatus] = useState("Testing...");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testSodium() {
      try {
        setResults((prev) => [
          ...prev,
          "Testing new encryption implementation...",
        ]);

        // Step 1: Generate a salt
        setResults((prev) => [...prev, "Generating salt..."]);
        const salt = await generateEncryptionSalt();
        setResults((prev) => [
          ...prev,
          `✅ Salt generated: ${salt.substring(0, 10)}...`,
        ]);

        // Step 2: Derive a key
        setResults((prev) => [...prev, "Deriving encryption key..."]);
        const testPassword = "test-password";
        const key = await deriveEncryptionKey(testPassword, salt);

        if (key) {
          setResults((prev) => [
            ...prev,
            `✅ Key derived successfully (length: ${key.length} bytes)`,
          ]);
        } else {
          throw new Error("Key derivation returned null or undefined");
        }

        // Step 3: Test encryption
        setResults((prev) => [...prev, "Testing encryption..."]);
        const testItem = {
          title: "Test Item",
          username: "test@example.com",
          password: "SuperSecretPassword123!",
          notes: "This is a test note",
        };

        const encrypted = await encryptVaultItem(testItem, key);
        setResults((prev) => [
          ...prev,
          `✅ Encrypted successfully: ${JSON.stringify(encrypted).substring(
            0,
            40
          )}...`,
        ]);

        // Step 4: Test decryption
        setResults((prev) => [...prev, "Testing decryption..."]);
        const decrypted = await decryptVaultItem(encrypted, key);

        // Verify decrypted content
        if (
          decrypted.title === testItem.title &&
          decrypted.username === testItem.username &&
          decrypted.password === testItem.password &&
          decrypted.notes === testItem.notes
        ) {
          setResults((prev) => [
            ...prev,
            "✅ Decryption successful - content matches!",
          ]);
          setStatus("All tests passed!");
        } else {
          setResults((prev) => [
            ...prev,
            "❌ Decryption failed - content doesn't match",
          ]);
          setError("Decrypted content doesn't match original");
          setStatus("Tests failed");
        }
      } catch (error) {
        console.error("Encryption test failed:", error);
        setError(`${error.name}: ${error.message}`);
        setStatus("Tests failed");
        setResults((prev) => [...prev, `❌ Error: ${error.message}`]);
      }
    }

    testSodium();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Enhanced Encryption Test</h1>

      <div className="mb-4 p-3 bg-gray-100 rounded-md">
        <p className="font-semibold">
          Status:
          <span
            className={
              status.includes("passed")
                ? "text-green-600 ml-2"
                : "text-yellow-600 ml-2"
            }
          >
            {status}
          </span>
        </p>
        {error && (
          <div className="mt-2 p-3 bg-red-100 text-red-800 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
        <h2 className="font-semibold mb-2">Test Results:</h2>
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {results.map((line, index) => (
            <div
              key={index}
              className={`py-1 ${
                line.includes("❌")
                  ? "text-red-600"
                  : line.includes("✅")
                  ? "text-green-600"
                  : ""
              }`}
            >
              {line}
            </div>
          ))}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
        <h2 className="font-semibold mb-2">About This Test</h2>
        <p>
          This test page verifies that our enhanced encryption implementation
          works correctly by testing the full encryption flow:
        </p>
        <ol className="list-decimal pl-5 mt-2">
          <li>Generate a cryptographic salt</li>
          <li>Derive an encryption key from a password</li>
          <li>Encrypt sample vault data</li>
          <li>Decrypt the data and verify it matches</li>
        </ol>
        <p className="mt-2">
          This implementation includes fallback methods in case of browser
          compatibility issues.
        </p>
      </div>
    </div>
  );
}
