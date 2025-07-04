/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'], // your file paths
  safelist: [
    'bg-[#f0f0f0]', // Add all the arbitrary classes you use in code
    'bg-[#3a0a5f]',
    'bg-[#d8b4fe]',
    'bg-[#FF9CE9]',
    // ...etc
  ],
}