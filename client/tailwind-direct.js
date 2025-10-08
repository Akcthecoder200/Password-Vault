/**
 * tailwind-direct.js
 *
 * Enhanced Tailwind CSS processing and setup script to work around Render deployment issues.
 * This script:
 * 1. Creates or verifies the existence of critical Tailwind configuration files
 * 2. Generates a basic set of Tailwind-like utility classes as a fallback
 * 3. Updates the globals.css file with the generated styles if needed
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Starting Tailwind CSS setup and fallback generation...");

// Check and create configuration files if needed
const postcssConfigPath = path.join(__dirname, "postcss.config.js");
if (!fs.existsSync(postcssConfigPath)) {
  console.log("📄 Creating postcss.config.js...");
  const postcssConfig = `const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
`;
  fs.writeFileSync(postcssConfigPath, postcssConfig);
}

const tailwindConfigPath = path.join(__dirname, "tailwind.config.js");
if (!fs.existsSync(tailwindConfigPath)) {
  console.log("📄 Creating tailwind.config.js...");
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
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
`;
  fs.writeFileSync(tailwindConfigPath, tailwindConfig);
}

// Read the globals.css file
const cssPath = path.join(__dirname, "styles", "globals.css");
let cssContent = "";

if (fs.existsSync(cssPath)) {
  console.log("📄 Reading existing globals.css...");
  cssContent = fs.readFileSync(cssPath, "utf8");
} else {
  console.log(
    "⚠️ globals.css not found, creating it with Tailwind directives..."
  );
  cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #__next { height: 100%; }
`;
  fs.writeFileSync(cssPath, cssContent);
}

// Generate processed CSS with Tailwind-like utilities
console.log("⚙️ Generating fallback Tailwind CSS utilities...");
const processedCSS = cssContent
  .replace(
    /@tailwind base;/g,
    `
/* Tailwind Base Layer - Fallback for deployment */
*, ::before, ::after { box-sizing: border-box; border: 0 solid #e5e7eb; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; font-family: ui-sans-serif, system-ui, sans-serif; }
body { margin: 0; line-height: inherit; }
hr { height: 0; color: inherit; border-top-width: 1px; }
abbr:where([title]) { text-decoration: underline dotted; }
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
a { color: inherit; text-decoration: inherit; }
b, strong { font-weight: bolder; }
code, kbd, samp, pre { font-family: ui-monospace, monospace; font-size: 1em; }
small { font-size: 80%; }
sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
sub { bottom: -0.25em; }
sup { top: -0.5em; }
table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
button, input, optgroup, select, textarea { font-family: inherit; font-size: 100%; font-weight: inherit; line-height: inherit; color: inherit; margin: 0; padding: 0; }
button, select { text-transform: none; }
button, [type='button'], [type='reset'], [type='submit'] { -webkit-appearance: button; background-color: transparent; background-image: none; }
:-moz-focusring { outline: auto; }
:-moz-ui-invalid { box-shadow: none; }
progress { vertical-align: baseline; }
::-webkit-inner-spin-button, ::-webkit-outer-spin-button { height: auto; }
[type='search'] { -webkit-appearance: textfield; outline-offset: -2px; }
::-webkit-search-decoration { -webkit-appearance: none; }
::-webkit-file-upload-button { -webkit-appearance: button; font: inherit; }
summary { display: list-item; }
blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre { margin: 0; }
fieldset { margin: 0; padding: 0; }
legend { padding: 0; }
ol, ul, menu { list-style: none; margin: 0; padding: 0; }
textarea { resize: vertical; }
input::placeholder, textarea::placeholder { opacity: 1; color: #9ca3af; }
button, [role="button"] { cursor: pointer; }
:disabled { cursor: default; }
img, svg, video, canvas, audio, iframe, embed, object { display: block; }
img, video { max-width: 100%; height: auto; }
[hidden] { display: none; }
  `
  )
  .replace(
    /@tailwind components;/g,
    `
/* Tailwind Components Layer - Fallback for deployment */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-duration: 150ms;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
}

.form-input {
  display: block;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
}
  `
  )
  .replace(
    /@tailwind utilities;/g,
    `
/* Tailwind Utilities Layer - Fallback for deployment */
/* Layout */
.container { width: 100%; margin-left: auto; margin-right: auto; }
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }
.inline { display: inline; }
.inline-flex { display: inline-flex; }
.table { display: table; }

/* Flex & Grid */
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-initial { flex: 0 1 auto; }
.flex-none { flex: none; }
.flex-grow { flex-grow: 1; }
.flex-shrink { flex-shrink: 1; }
.flex-grow-0 { flex-grow: 0; }
.flex-shrink-0 { flex-shrink: 0; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.items-stretch { align-items: stretch; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* Spacing */
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }
.gap-6 { gap: 1.5rem; }
.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 0.75rem; }
.m-4 { margin: 1rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
.mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
.my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
.my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }

/* Sizing */
.h-full { height: 100%; }
.h-screen { height: 100vh; }
.h-auto { height: auto; }
.w-full { width: 100%; }
.w-screen { width: 100vw; }
.w-auto { width: auto; }
.min-h-screen { min-height: 100vh; }

/* Typography */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.font-thin { font-weight: 100; }
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.italic { font-style: italic; }
.not-italic { font-style: normal; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

/* Backgrounds & Colors */
.bg-transparent { background-color: transparent; }
.bg-black { background-color: #000000; }
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-gray-300 { background-color: #d1d5db; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-blue-100 { background-color: #dbeafe; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-blue-600 { background-color: #2563eb; }
.bg-blue-700 { background-color: #1d4ed8; }
.bg-primary-500 { background-color: #0ea5e9; }
.bg-primary-600 { background-color: #0284c7; }
.bg-primary-700 { background-color: #0369a1; }
.text-black { color: #000000; }
.text-white { color: #ffffff; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-gray-900 { color: #111827; }
.text-primary-500 { color: #0ea5e9; }
.text-primary-600 { color: #0284c7; }

/* Borders */
.rounded-none { border-radius: 0; }
.rounded-sm { border-radius: 0.125rem; }
.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-full { border-radius: 9999px; }
.border { border-width: 1px; }
.border-2 { border-width: 2px; }
.border-t { border-top-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-gray-200 { border-color: #e5e7eb; }
.border-gray-300 { border-color: #d1d5db; }

/* Effects */
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.opacity-0 { opacity: 0; }
.opacity-50 { opacity: 0.5; }
.opacity-75 { opacity: 0.75; }
.opacity-100 { opacity: 1; }

/* Primary color utilities */
.text-primary-50 { color: #f0f9ff; }
.text-primary-100 { color: #e0f2fe; }
.text-primary-200 { color: #bae6fd; }
.text-primary-300 { color: #7dd3fc; }
.text-primary-400 { color: #38bdf8; }
.text-primary-500 { color: #0ea5e9; }
.text-primary-600 { color: #0284c7; }
.text-primary-700 { color: #0369a1; }
.text-primary-800 { color: #075985; }
.text-primary-900 { color: #0c4a6e; }
.text-primary-950 { color: #082f49; }
.bg-primary-50 { background-color: #f0f9ff; }
.bg-primary-100 { background-color: #e0f2fe; }
.bg-primary-200 { background-color: #bae6fd; }
.bg-primary-300 { background-color: #7dd3fc; }
.bg-primary-400 { background-color: #38bdf8; }
.bg-primary-500 { background-color: #0ea5e9; }
.bg-primary-600 { background-color: #0284c7; }
.bg-primary-700 { background-color: #0369a1; }
.bg-primary-800 { background-color: #075985; }
.bg-primary-900 { background-color: #0c4a6e; }
.bg-primary-950 { background-color: #082f49; }
  `
  );

// Write the processed CSS to a new file
const outputPath = path.join(__dirname, "styles", "processed-globals.css");
fs.writeFileSync(outputPath, processedCSS);

// Create a simple fallback import file for Next.js
const fallbackImportPath = path.join(
  __dirname,
  "styles",
  "tailwind-fallback.js"
);
fs.writeFileSync(
  fallbackImportPath,
  `
// This file imports the processed CSS as a fallback when Tailwind CSS fails to load
import './processed-globals.css';
console.log('Using fallback Tailwind CSS styles');
`
);

console.log("✅ Enhanced Tailwind CSS setup complete!");
console.log("📄 Created processed-globals.css with fallback styles");
console.log("📄 Created tailwind-fallback.js import helper");
console.log(
  "💡 If Tailwind CSS fails during build, import these fallback styles in your _app.js"
);
