import { useState, useEffect } from "react";
import { withAuth } from "../../utils/auth";
import { vaultAPI } from "../../utils/api";
import { useEncryption } from "../../utils/encryptionContext";
import Button from "../../components/Button";
import VaultItem from "../../components/vault/VaultItem";
import VaultForm from "../../components/vault/VaultForm";
import SearchBar from "../../components/vault/SearchBar";
import Link from "next/link";

function Dashboard() {
  const [vaultItems, setVaultItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const { encrypt, decrypt, encryptionReady } = useEncryption();

  // Load vault items on initial render
  useEffect(() => {
    fetchVaultItems();
  }, []);

  // Update filtered items when vault items change
  useEffect(() => {
    setFilteredItems(vaultItems);
  }, [vaultItems]);

  // Fetch all vault items
  const fetchVaultItems = async () => {
    if (!encryptionReady) {
      setError("Encryption is not initialized. Please reload the page.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await vaultAPI.getAll();

      // Decrypt all vault items
      const decryptedItems = await Promise.all(
        response.data.map(async (encryptedItem) => {
          try {
            // Skip if the item doesn't have ciphertext (for backward compatibility)
            if (!encryptedItem.ciphertext) {
              return encryptedItem;
            }

            // Decrypt the vault item
            const decryptedData = await decrypt({
              ciphertext: encryptedItem.ciphertext,
              nonce: encryptedItem.nonce,
            });

            // Return item with decrypted data and original ID
            return {
              _id: encryptedItem._id,
              ...decryptedData,
              createdAt: encryptedItem.createdAt,
              updatedAt: encryptedItem.updatedAt,
            };
          } catch (error) {
            console.error("Failed to decrypt item:", error);
            // Return a placeholder for failed decryption
            return {
              _id: encryptedItem._id,
              siteName: "Decryption Failed",
              username: "Unknown",
              password: "********",
              siteUrl: "",
              notes:
                "This item could not be decrypted. It may be corrupted or was encrypted with a different key.",
              createdAt: encryptedItem.createdAt,
              updatedAt: encryptedItem.updatedAt,
            };
          }
        })
      );

      setVaultItems(decryptedItems);
      setError("");
    } catch (err) {
      console.error("Failed to fetch vault items:", err);
      setError("Failed to load your passwords. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredItems(vaultItems);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = vaultItems.filter(
      (item) =>
        item.siteName.toLowerCase().includes(lowercaseQuery) ||
        item.username.toLowerCase().includes(lowercaseQuery) ||
        (item.siteUrl && item.siteUrl.toLowerCase().includes(lowercaseQuery)) ||
        (item.notes && item.notes.toLowerCase().includes(lowercaseQuery))
    );

    setFilteredItems(filtered);
  };

  // Add new vault item
  const handleAddItem = async (formData) => {
    if (!encryptionReady) {
      alert("Encryption is not initialized. Please reload the page.");
      return;
    }

    try {
      // Encrypt vault item data
      const encryptedData = await encrypt({
        siteName: formData.siteName,
        username: formData.username,
        password: formData.password,
        siteUrl: formData.siteUrl || "",
        notes: formData.notes || "",
      });

      // Send encrypted data to server
      await vaultAPI.create(encryptedData);
      setIsAddingNew(false);
      fetchVaultItems();
    } catch (err) {
      console.error("Failed to add vault item:", err);
      alert("Failed to add new password. Please try again.");
    }
  };

  // Edit vault item
  const handleEdit = (item) => {
    setEditingItem(item);
  };

  // Update vault item
  const handleUpdateItem = async (formData) => {
    if (!encryptionReady) {
      alert("Encryption is not initialized. Please reload the page.");
      return;
    }

    try {
      // Encrypt updated vault item data
      const encryptedData = await encrypt({
        siteName: formData.siteName,
        username: formData.username,
        password: formData.password,
        siteUrl: formData.siteUrl || "",
        notes: formData.notes || "",
      });

      // Send encrypted data to server
      await vaultAPI.update(editingItem._id, encryptedData);
      setEditingItem(null);
      fetchVaultItems();
    } catch (err) {
      console.error("Failed to update vault item:", err);
      alert("Failed to update password. Please try again.");
    }
  };

  // Delete vault item
  const handleDelete = async (id) => {
    try {
      await vaultAPI.delete(id);
      setShowDeleteConfirm(null);
      fetchVaultItems();
    } catch (err) {
      console.error("Failed to delete vault item:", err);
      alert("Failed to delete password. Please try again.");
    }
  };

  // Cancel form
  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Password Vault
          </h1>
          <p className="text-gray-600">
            Securely store and manage your passwords
          </p>
        </div>

        <div className="flex space-x-2">
          <Link href="/dashboard/generator" passHref legacyBehavior>
            <a>
              <Button variant="outline">Password Generator</Button>
            </a>
          </Link>
          <Button onClick={() => setIsAddingNew(true)}>Add New Password</Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {isAddingNew && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Password</h2>
          <VaultForm onSubmit={handleAddItem} onCancel={handleCancelForm} />
        </div>
      )}

      {editingItem && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Password</h2>
          <VaultForm
            initialData={editingItem}
            onSubmit={handleUpdateItem}
            onCancel={handleCancelForm}
            isEditing={true}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your passwords...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-10 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No passwords found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {vaultItems.length === 0
              ? "You haven't added any passwords yet."
              : "No passwords match your search criteria."}
          </p>
          {vaultItems.length === 0 && (
            <div className="mt-6">
              <Button onClick={() => setIsAddingNew(true)}>
                Add your first password
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <VaultItem
              key={item._id}
              item={item}
              onEdit={handleEdit}
              onDelete={(id) => setShowDeleteConfirm(id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this password? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with auth HOC to protect this page
export default withAuth(Dashboard);
