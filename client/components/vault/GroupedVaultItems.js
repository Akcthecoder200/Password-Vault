import { useState } from "react";
import VaultItem from "./VaultItem";

export default function GroupedVaultItems({ groupedItems, onEdit, onDelete }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Sort groups by name
  const sortedGroups = Object.keys(groupedItems).sort();

  return (
    <div className="space-y-5">
      {sortedGroups.map((groupName) => {
        const items = groupedItems[groupName];
        const isExpanded = expandedGroups[groupName] !== false; // Default to expanded

        return (
          <div
            key={groupName}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div
              onClick={() => toggleGroup(groupName)}
              className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {groupName}
                </h3>
                <span className="ml-3 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                  {items.length}
                </span>
              </div>
              <button className="text-gray-500">
                {isExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>

            {isExpanded && (
              <div className="p-4 divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item._id} className="py-3 first:pt-0 last:pb-0">
                    <VaultItem
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
