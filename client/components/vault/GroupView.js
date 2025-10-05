import { useState } from "react";

// Custom hook for group view toggle
export const useGroupView = (items, defaultGroupBy = null) => {
  const [isGroupView, setIsGroupView] = useState(Boolean(defaultGroupBy));
  const [groupBy, setGroupBy] = useState(defaultGroupBy || "none");

  // Group items if grouping is enabled and items exist
  const groupedItems =
    isGroupView && groupBy !== "none" && items && items.length > 0
      ? groupItemsByField(items, groupBy)
      : {};

  // Toggle group view
  const toggleGroupView = () => {
    setIsGroupView(!isGroupView);
  };

  // Change grouping field
  const changeGroupBy = (field) => {
    setGroupBy(field);
    if (!isGroupView) {
      setIsGroupView(true);
    }
  };

  return {
    isGroupView,
    groupBy,
    groupedItems,
    toggleGroupView,
    changeGroupBy,
  };
};

// Group items by a specific field
const groupItemsByField = (items, field) => {
  // Handle null, undefined, or empty items
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log("No items to group, returning empty object");
    return {};
  }

  // Special grouping handlers
  if (field === "strength") {
    return groupByStrength(items);
  } else if (field === "domain") {
    return groupByDomain(items);
  } else if (field === "createdAt") {
    return groupByDate(items, "createdAt");
  } else if (field === "updatedAt") {
    return groupByDate(items, "updatedAt");
  }

  // Default grouping by field value
  return items.reduce((groups, item) => {
    const value = item[field] || "Other";
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
};

// Group by password strength
const groupByStrength = (items) => {
  const strengthGroups = {
    "Very Weak": [],
    Weak: [],
    Moderate: [],
    Strong: [],
    "Very Strong": [],
  };

  items.forEach((item) => {
    const strength = getPasswordStrength(item.password);
    let group;

    if (strength <= 1) group = "Very Weak";
    else if (strength === 2) group = "Weak";
    else if (strength === 3) group = "Moderate";
    else if (strength === 4) group = "Strong";
    else group = "Very Strong";

    strengthGroups[group].push(item);
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(strengthGroups).filter(([_, items]) => items.length > 0)
  );
};

// Group by domain
const groupByDomain = (items) => {
  return items.reduce((groups, item) => {
    let domain = "No Domain";

    if (item.siteUrl) {
      try {
        // Handle URLs without protocol
        let url = item.siteUrl;
        if (!url.startsWith("http")) {
          url = "http://" + url;
        }

        const hostname = new URL(url).hostname;
        domain = hostname.replace("www.", "").split(".").slice(-2).join(".");
      } catch (e) {
        domain = "Invalid URL";
      }
    }

    if (!groups[domain]) {
      groups[domain] = [];
    }
    groups[domain].push(item);
    return groups;
  }, {});
};

// Group by date
const groupByDate = (items, dateField) => {
  return items.reduce((groups, item) => {
    const date = new Date(item[dateField]);

    // Format date as YYYY-MM
    const month = date.toLocaleString("default", {
      year: "numeric",
      month: "long",
    });

    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(item);
    return groups;
  }, {});
};

// Calculate password strength (0-5)
const getPasswordStrength = (password) => {
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
};
