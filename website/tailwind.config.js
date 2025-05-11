/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // If using Next.js App Router
  ],
  theme: {
    extend: {
      // Add your theme extensions here
    },
  },
  plugins: [],
}; 