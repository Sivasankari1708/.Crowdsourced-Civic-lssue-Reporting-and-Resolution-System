/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src//*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.4)',
      },
      // You can remove this entire line:
      // 'backgroundImage': {
      //   'pattern-chevrons': "url('/path/to/your/chevrons.svg')",
      // }
    },
  },
  plugins: [],
}