import { useState } from 'react';
import { useCopyToClipboard } from '../../utils/passwordUtils';
import Button from '../Button';

export default function VaultItem({
  item,
  onEdit,
  onDelete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleCopyPassword = () => {
    copyToClipboard(item.password);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 transition-all hover:shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full">
            {/* Display first letter of site name or icon */}
            {item.siteName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{item.siteName}</h3>
            <p className="text-sm text-gray-500">{item.username}</p>
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-400">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mt-2">
          <label className="text-sm font-medium text-gray-700">Password:</label>
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type={showPassword ? 'text' : 'password'}
                value={item.password}
                readOnly
                className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <button
              onClick={toggleShowPassword}
              className="p-1 text-gray-500 hover:text-gray-800"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <span className="text-sm">Hide</span>
              ) : (
                <span className="text-sm">Show</span>
              )}
            </button>
            <button
              onClick={handleCopyPassword}
              className="p-1 text-gray-500 hover:text-gray-800"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <span className="text-sm text-green-600">Copied!</span>
              ) : (
                <span className="text-sm">Copy</span>
              )}
            </button>
          </div>
        </div>
        
        {item.notes && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Notes:</span> {item.notes}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          variant="outline"
          className="py-1 px-3 text-sm"
          onClick={() => onEdit(item)}
        >
          Edit
        </Button>
        <Button
          variant="secondary"
          className="py-1 px-3 text-sm"
          onClick={() => onDelete(item._id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}