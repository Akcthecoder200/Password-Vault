import { useState, useEffect } from "react";
import { withAuth } from "../../utils/auth";
import { vaultAPI } from "../../utils/api";
import { useEncryption } from "../../utils/encryptionContext";
import { searchVaultItems, sortVaultItems } from "../../utils/searchUtils";
import Button from "../../components/Button";
import VaultItem from "../../components/vault/VaultItem";
import VaultForm from "../../components/vault/VaultForm";
import SearchBar from "../../components/vault/SearchBar";
import GroupedVaultItems from "../../components/vault/GroupedVaultItems";
import { useGroupView } from "../../components/vault/GroupView";
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

  // Load vault items on initial render and whenever encryption becomes ready
  useEffect(() => {
    if (encryptionReady) {
      fetchVaultItems();
    } else {
      setLoading(true);
    }
  }, [encryptionReady]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({
    sortBy: "siteName",
    sortOrder: "asc",
  });

  // Update filtered items when vault items change or search/filter/sort changes
  useEffect(() => {
    // Apply search & filters
    let results = searchVaultItems(vaultItems, searchQuery, searchFilters);

    // Apply sorting
    results = sortVaultItems(results, sortConfig.sortBy, sortConfig.sortOrder);

    setFilteredItems(results);
  }, [vaultItems, searchQuery, searchFilters, sortConfig]);

  // Setup group view functionality - make sure to use the updated filteredItems
  const { isGroupView, groupBy, groupedItems, toggleGroupView, changeGroupBy } =
    useGroupView(filteredItems);

  // Fetch all vault items
  const fetchVaultItems = async () => {
    if (!encryptionReady) {
      setError(
        "Encryption is initializing. Please wait or try refreshing the page if this persists."
      );
      setLoading(false);

      // Retry after a delay to see if encryption becomes ready
      setTimeout(() => {
        if (encryptionReady) {
          setError("");
          fetchVaultItems();
        }
      }, 3000); // Wait 3 seconds and retry

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

  // Handle search and filtering
  const handleSearch = (query, filters = {}) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  };

  // Handle sorting
  const handleSort = (sortConfig) => {
    setSortConfig(sortConfig);
  };

  // Add new vault item
  const handleAddItem = async (formData) => {
    try {
      if (!encryptionReady) {
        // Provide more helpful information
        const message =
          "Encryption is not initialized. Please wait a moment and try again, or try refreshing the page.";
        setError(message);
        alert(message);

        // Automatically reload page to attempt recovery
        setTimeout(() => {
          if (!encryptionReady) {
            window.location.reload();
          }
        }, 2000);

        return;
      }

      // Set temporary loading state for better feedback
      setLoading(true);

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
      setError(""); // Clear any previous errors
      fetchVaultItems();
    } catch (err) {
      console.error("Failed to add vault item:", err);

      if (err.message === "Encryption not initialized") {
        // Special handling for encryption errors
        setError(
          "Encryption is not initialized. The page will reload automatically to fix this issue."
        );

        // Auto-reload after a brief delay
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert("Failed to add new password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit vault item
  const handleEdit = (item) => {
    setEditingItem(item);
  };

  // Update vault item
  const handleUpdateItem = async (formData) => {
    try {
      if (!encryptionReady) {
        // Provide more helpful information
        const message =
          "Encryption is not initialized. Please wait a moment and try again, or try refreshing the page.";
        setError(message);
        alert(message);

        // Automatically reload page to attempt recovery
        setTimeout(() => {
          if (!encryptionReady) {
            window.location.reload();
          }
        }, 2000);

        return;
      }

      // Set temporary loading state for better feedback
      setLoading(true);

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
      setError(""); // Clear any previous errors
      fetchVaultItems();
    } catch (err) {
      console.error("Failed to update vault item:", err);

      if (err.message === "Encryption not initialized") {
        // Special handling for encryption errors
        setError(
          "Encryption is not initialized. The page will reload automatically to fix this issue."
        );

        // Auto-reload after a brief delay
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
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
        <SearchBar
          onSearch={handleSearch}
          onFilter={handleSearch}
          onSort={handleSort}
        />
      </div>

      <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
        <p className="text-sm text-gray-500">
          {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "password" : "passwords"} found
          {filteredItems.length !== vaultItems.length &&
            ` (filtered from ${vaultItems.length} total)`}
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleGroupView}
            className={`px-3 py-1 text-sm rounded border ${
              isGroupView
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-50 text-gray-700 border-gray-300"
            }`}
          >
            {isGroupView ? "List View" : "Group View"}
          </button>

          {isGroupView && (
            <select
              value={groupBy}
              onChange={(e) => changeGroupBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="siteName">Group by: Site Name</option>
              <option value="domain">Group by: Domain</option>
              <option value="strength">Group by: Strength</option>
              <option value="createdAt">Group by: Date Added</option>
              <option value="updatedAt">Group by: Last Updated</option>
            </select>
          )}
        </div>
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
      ) : isGroupView ? (
        <GroupedVaultItems
          groupedItems={groupedItems || {}} // Provide empty object as fallback
          onEdit={handleEdit}
          onDelete={(id) => setShowDeleteConfirm(id)}
        />
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
