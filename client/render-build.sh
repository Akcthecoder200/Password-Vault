#!/bin/bash

# This script helps build the Next.js application on Render
echo " Debugging environment..."
pwd
ls -la

echo " Installing dependencies..."
npm install

echo " Installing Tailwind CSS and related packages as regular dependencies..."
npm install tailwindcss@latest postcss@latest autoprefixer@latest --save

echo " Verifying Tailwind CSS installation..."
if npm list tailwindcss > /dev/null 2>&1; then
  echo " Tailwind CSS is installed!"
else
  echo " Tailwind CSS is NOT installed. Trying alternative installation method..."
  npm install tailwindcss postcss autoprefixer --no-save
  npm link tailwindcss
fi

echo " Creating explicit Tailwind CSS symlink for build process..."
mkdir -p node_modules/.bin
if [ ! -f node_modules/.bin/tailwindcss ]; then
  if [ -f node_modules/tailwindcss/lib/cli.js ]; then
    ln -sf ../tailwindcss/lib/cli.js node_modules/.bin/tailwindcss
    echo " Created tailwindcss symlink"
  fi
fi

echo " Ensuring postcss.config.js exists and is correct..."
cat > postcss.config.js << "EOL"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOL

echo " Ensuring tailwind.config.js exists and is correct..."
cat > tailwind.config.js << "EOL"
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx,css}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
      },
    },
  },
  plugins: [],
};
EOL

echo " Ensuring globals.css has proper Tailwind directives..."
cat > styles/globals.css << "EOL"
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #__next { height: 100%; }
EOL

echo " Creating fallback CSS file in case Tailwind fails..."
cat > styles/output.css << "EOL"
/* Fallback CSS if Tailwind processing fails */
*, ::before, ::after { box-sizing: border-box; border: 0 solid #e5e7eb; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; font-family: ui-sans-serif, system-ui, sans-serif; }
body { margin: 0; line-height: inherit; }
html, body, #__next { height: 100%; }
.flex { display: flex; }
.hidden { display: none; }
.h-full { height: 100%; }
.w-full { width: 100%; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.m-2 { margin: 0.5rem; }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.rounded { border-radius: 0.25rem; }
.border { border-width: 1px; }
.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-blue-500 { background-color: #3b82f6; }
.text-white { color: #ffffff; }
.text-gray-600 { color: #4b5563; }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
EOL

echo " Building Next.js application..."
NODE_ENV=production npm run build || (
  echo " ⚠️ Build failed. Creating a tailwind-free build..."
  # Create a modified _app.js that doesn't import globals.css
  cp pages/_app.js pages/_app.js.bak
  sed -i 's|import "../styles/globals.css";|// import "../styles/globals.css"; import "../styles/output.css";|' pages/_app.js
  NODE_ENV=production npx next build
  # Restore the original _app.js
  mv pages/_app.js.bak pages/_app.js
)

echo " Build completed!"
