/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bein: ["Bein", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2B9C8E",
        },
        background: {
          DEFAULT: "#F8FAFB",
          white: "#ffffff",
          primary: "#eaf5f4",
          secondary: "#55B1A5",
        },
        text: {
          DEFAULT: "#2F3541",
          secondary: "#555555",
        },
        accent: {
          DEFAULT: "#1DB954",
          red: "#F44336",
          yellow: "#FFC107",
        },
      },
    },
  },
  plugins: [],
};
