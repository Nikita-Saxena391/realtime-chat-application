/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ai-purple": "#E0BBFF", // custom light purple for AI messages
      },
    },
  },
  plugins: [],
};
