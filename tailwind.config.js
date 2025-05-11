module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      backgroundImage: {
        'gradient-custom': 'linear-gradient(135deg, #27e2a4 0%, #046477 100%)',
      },
      height: {
        'dvh': '95dvh', // 👈 Add this for mobile-safe height
      },
    },
  },
  plugins: [
    require('daisyui'),
    require("@tailwindcss/typography")
  ],
  daisyui: {
    styled: true,
    themes: [
      {
        'solana': {
          'primary': '#000000',
          'primary-focus': '#33ffbb',
          'primary-content': '#ffffff',

          'secondary': '#808080',
          'secondary-focus': '#f3cc30',
          'secondary-content': '#ffffff',

          'accent': '#33a382',
          'accent-focus': '#2aa79b',
          'accent-content': '#ffffff',

          'neutral': '#2b2b2b',
          'neutral-focus': '#2a2e37',
          'neutral-content': '#ffffff',

          'base-100': '#000000',         
          'base-200': '#046477',         
          'base-content': '#f9fafb',

          'info': '#2094f3',
          'success': '#009485',
          'warning': '#ff9900',
          'error': '#ff5724',
        },
      },
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
}
