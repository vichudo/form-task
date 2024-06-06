/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      scrollbarHide: {
        "-ms-overflow-style": "none", // for Internet Explorer, Edge
        "scrollbar-width": "none", // for Firefox
        "&::-webkit-scrollbar": {
          // for Chrome, Safari, and Opera
          display: "none",
        },
      },
    },
    plugins: [require("@tailwindcss/forms")],
  },
};
