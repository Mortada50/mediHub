/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        bein: ["Bein", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2B9C8E",
          400: "#55b1a5",
        },
        background: {
          DEFAULT: "#F8FAFB",
          white: "#ffffff",
          primary: "#eaf5f4",
          secondary: "#55B1A5",
          light: "#fbfafb",
        },
        text: {
          DEFAULT: "#2F3541",
          secondary: "#555555",
        },
        border: {
          primary: "#E8E8E8",
        },
        accent: {
          DEFAULT: "#1DB954",
          red: "#F44336",
          yellow: "#FFC107",
        },
        warning: {
          primary: "#ffc107",
        },
      },
    },
  },
  plugins: [],
};
