/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // tokens serão adicionados na T-09 após definição do theme.css
    },
  },
  plugins: [],
}
