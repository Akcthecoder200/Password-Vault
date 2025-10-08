#!/bin/bash

# This script helps build the Next.js application on Render
echo " Debugging environment..."
pwd
ls -la

echo " Installing dependencies..."
npm install

echo " Installing Tailwind CSS and related packages..."
npm install tailwindcss@latest postcss@latest autoprefixer@latest --save-dev

echo " Checking for Tailwind CSS installation..."
if npm list tailwindcss > /dev/null 2>&1; then
  echo " Tailwind CSS is installed!"
else
  echo " Tailwind CSS is NOT installed. Trying alternative installation method..."
  npm install tailwindcss@latest postcss@latest autoprefixer@latest --force
fi

echo " Ensuring postcss.config.js exists and is correct..."
cat > postcss.config.js << "EOL"
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
EOL

echo " Ensuring tailwind.config.js exists and is correct..."
cat > tailwind.config.js << "EOL"
/** @type {import("tailwindcss").Config} */
const config = {
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

export default config;
EOL

echo " Ensuring globals.css has proper Tailwind directives..."
cat > styles/globals.css << "EOL"
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #__next { height: 100%; }
EOL

echo " Building Next.js application..."
NODE_ENV=production npm run build

echo " Build completed!"
