export default function Test() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">
        Tailwind Test Page
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {/* Basic colors */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Colors</h2>
          <div className="space-y-2">
            <div className="h-8 bg-blue-500 rounded"></div>
            <div className="h-8 bg-green-500 rounded"></div>
            <div className="h-8 bg-red-500 rounded"></div>
            <div className="h-8 bg-yellow-500 rounded"></div>
            <div className="h-8 bg-purple-500 rounded"></div>
          </div>
        </div>

        {/* Typography */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Typography</h2>
          <p className="text-sm text-gray-500">Small text</p>
          <p className="text-base text-gray-700">Normal text</p>
          <p className="text-lg text-gray-800">Large text</p>
          <p className="text-xl font-medium text-gray-900">Extra large</p>
          <p className="text-2xl font-bold text-black">Heading</p>
        </div>

        {/* Buttons */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Buttons</h2>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Primary
            </button>
            <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Secondary
            </button>
            <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
              Outline
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Success
            </button>
          </div>
        </div>

        {/* Spacing */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Spacing</h2>
          <div className="space-y-2">
            <div className="p-1 bg-blue-100 border border-blue-300 text-center">
              p-1
            </div>
            <div className="p-2 bg-blue-100 border border-blue-300 text-center">
              p-2
            </div>
            <div className="p-4 bg-blue-100 border border-blue-300 text-center">
              p-4
            </div>
            <div className="p-8 bg-blue-100 border border-blue-300 text-center">
              p-8
            </div>
          </div>
        </div>

        {/* Flex */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Flex Layout</h2>
          <div className="flex space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
            <div className="w-8 h-8 bg-blue-600 rounded"></div>
            <div className="w-8 h-8 bg-blue-700 rounded"></div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="h-8 bg-green-500 rounded"></div>
            <div className="h-8 bg-green-600 rounded"></div>
            <div className="h-8 bg-green-700 rounded"></div>
          </div>
        </div>

        {/* Grid */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Grid Layout</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-8 bg-purple-500 rounded"></div>
            <div className="h-8 bg-purple-500 rounded"></div>
            <div className="h-8 bg-purple-500 rounded"></div>
            <div className="h-8 bg-purple-600 rounded"></div>
            <div className="h-8 bg-purple-600 rounded"></div>
            <div className="h-8 bg-purple-600 rounded"></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:underline">
          Back to Home
        </a>
      </div>
    </div>
  );
}
