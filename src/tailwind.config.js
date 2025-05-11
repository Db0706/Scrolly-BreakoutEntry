/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "var(--black)",
        dark: "var(--dark)",
        green: "var(--green)",
        grey: "var(--grey)",
      },
      fontFamily: {
        "h-1": "var(--h-1-font-family)",
        "h-2": "var(--h-2-font-family)",
        "h-3": "var(--h-3-font-family)",
        "h-4": "var(--h-4-font-family)",
        "h1-mob": "var(--h1-mob-font-family)",
        "h2-mob": "var(--h2-mob-font-family)",
        "h3-mob": "var(--h3-mob-font-family)",
        "h4-mob": "var(--h4-mob-font-family)",
        p: "var(--p-font-family)",
        "p-mob": "var(--p-mob-font-family)",
      },
    },
  },
  plugins: [],
};
