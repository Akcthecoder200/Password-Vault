// Search and filter utilities for vault items

/**
 * Search and filter vault items based on query and filters
 * @param {Array} items - Decrypted vault items
 * @param {String} query - Search query string
 * @param {Object} filters - Filter options
 * @returns {Array} - Filtered vault items
 */
export function searchVaultItems(items, query = "", filters = {}) {
  if (!items || !items.length) return [];

  let results = [...items];

  // Apply text search if query exists
  if (query && query.trim()) {
    const lowercaseQuery = query.toLowerCase().trim();
    results = results.filter(
      (item) =>
        (item.siteName &&
          item.siteName.toLowerCase().includes(lowercaseQuery)) ||
        (item.username &&
          item.username.toLowerCase().includes(lowercaseQuery)) ||
        (item.siteUrl && item.siteUrl.toLowerCase().includes(lowercaseQuery)) ||
        (item.notes && item.notes.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Apply specific field filters
  if (filters) {
    // Filter by site name
    if (filters.siteName) {
      const siteNameLower = filters.siteName.toLowerCase();
      results = results.filter(
        (item) =>
          item.siteName && item.siteName.toLowerCase().includes(siteNameLower)
      );
    }

    // Filter by username
    if (filters.username) {
      const usernameLower = filters.username.toLowerCase();
      results = results.filter(
        (item) =>
          item.username && item.username.toLowerCase().includes(usernameLower)
      );
    }

    // Filter by date created (if provided)
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      results = results.filter((item) => new Date(item.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the whole day
      results = results.filter((item) => new Date(item.createdAt) <= toDate);
    }

    // Filter by password strength (if implemented)
    if (filters.minStrength !== undefined) {
      // This assumes you have a function to calculate password strength
      // and store it or can calculate it on demand
      results = results.filter((item) => {
        const strength = getPasswordStrength(item.password);
        return strength >= filters.minStrength;
      });
    }
  }

  return results;
}

/**
 * Get password strength score (0-5)
 * @param {String} password
 * @returns {Number} - Strength score between 0 and 5
 */
function getPasswordStrength(password) {
  if (!password) return 0;

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let score = 0;

  // Length check
  if (length > 8) score += 1;
  if (length > 12) score += 1;
  if (length > 16) score += 1;

  // Character variety check
  if (hasLower) score += 1;
  if (hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 1;

  // Cap score at 5
  return Math.min(5, score);
}

/**
 * Sort vault items
 * @param {Array} items - Items to sort
 * @param {String} sortBy - Field to sort by
 * @param {String} sortOrder - 'asc' or 'desc'
 * @returns {Array} - Sorted items
 */
export function sortVaultItems(items, sortBy = "siteName", sortOrder = "asc") {
  if (!items || !items.length) return [];

  const sortedItems = [...items];

  sortedItems.sort((a, b) => {
    let valueA, valueB;

    // Handle special sort fields
    if (sortBy === "strength") {
      valueA = getPasswordStrength(a.password);
      valueB = getPasswordStrength(b.password);
    } else if (sortBy === "createdAt" || sortBy === "updatedAt") {
      valueA = new Date(a[sortBy]).getTime();
      valueB = new Date(b[sortBy]).getTime();
    } else {
      // Default string comparison for other fields
      valueA = (a[sortBy] || "").toLowerCase();
      valueB = (b[sortBy] || "").toLowerCase();
    }

    // Compare based on sort order
    if (sortOrder === "asc") {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });

  return sortedItems;
}

/**
 * Group vault items by a specific field
 * @param {Array} items - Vault items to group
 * @param {String} groupBy - Field to group by
 * @returns {Object} - Grouped items
 */
export function groupVaultItems(items, groupBy = "siteName") {
  if (!items || !items.length) return {};

  // Group items by the specified field
  return items.reduce((groups, item) => {
    // For date fields, format and group by date
    let groupKey;

    if (groupBy === "createdAt" || groupBy === "updatedAt") {
      const date = new Date(item[groupBy]);
      groupKey = date.toLocaleDateString();
    }
    // For password strength, calculate and group
    else if (groupBy === "strength") {
      const strength = getPasswordStrength(item.password);
      const strengthLabels = [
        "Very Weak",
        "Weak",
        "Moderate",
        "Strong",
        "Very Strong",
      ];
      groupKey = strengthLabels[Math.min(Math.floor(strength), 4)];
    }
    // For domain, extract domain from siteUrl
    else if (groupBy === "domain") {
      groupKey = item.siteUrl ? extractDomain(item.siteUrl) : "No Domain";
    }
    // Default grouping by the actual field value
    else {
      groupKey = item[groupBy] || "Other";
    }

    // Create the group if it doesn't exist
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(item);
    return groups;
  }, {});
}

/**
 * Extract domain from URL
 * @param {String} url
 * @returns {String}
 */
function extractDomain(url) {
  try {
    // Handle URLs without protocol
    if (!url.startsWith("http")) {
      url = "http://" + url;
    }

    const domain = new URL(url).hostname.replace("www.", "");
    return domain || "Unknown";
  } catch (error) {
    return "Invalid URL";
  }
}
