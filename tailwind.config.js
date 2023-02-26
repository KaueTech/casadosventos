/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {

    extend: {
      keyframes: {
        shake: {
          '10%, 90%': {
            transform: 'translate(-1px, 0)',
          },
          '20%, 80%': {
            transform: 'translate(2px, 0)',
          },
          '30%, 50%, 70%': {
            transform: 'translate(-4px, 0)',
          },
          '40%, 60%': {
            transform: 'translate(4px, 0)',
          },
        },
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 0.5 },
        },


        scaleShow: {
          from: { opacity: 0.5, transform: "translate(-50%, -50%) scale(0.5)" },
          to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
        },

        scaleHide: {
          from: { opacity: 1, transform: "scale(1)" },
          to: { opacity: 0.5, transform: "scale(0.5)" },

        },
        overlayHide: {
          from: { opacity: 0.5 },
          to: { opacity: 0 },
        },
        contentShow: {
          from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
        contentHide: {
          from: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          to: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
        },
      },
      animation: {
        overlayShow: 'overlayShow 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        overlayHide: 'overlayHide 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentHide: 'contentHide 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        shake: 'shake 600ms',
        scaleShow: 'scaleShow 300ms',
        scaleHide: 'scaleHide 300ms',
      },
    },
  },
  plugins: [],
}
