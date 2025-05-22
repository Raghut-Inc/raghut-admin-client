/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        kyobohand: ['KyoboHand', 'sans-serif'],
      },
      flex: {
        2: "2 2 0%",
        3: "3 3 0%",
        4: "4 4 0%",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["hover"], // Ensure background color changes on hover are enabled
      backgroundOpacity: ["hover"], // Enable hover state for background opacity
    },
  },
  plugins: [],
};
