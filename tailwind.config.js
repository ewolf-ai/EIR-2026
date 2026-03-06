/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nursing: {
          50: '#fdf4f9',
          100: '#fbe9f3',
          200: '#f8d3e8',
          300: '#f3b0d4',
          400: '#eb7fb8',
          500: '#e0559c',
          600: '#ce3581',
          700: '#b32468',
          800: '#942056',
          900: '#7a1f4a',
        },
        pastel: {
          blue: '#B4D4E1',
          pink: '#F8D7DA',
          mint: '#D1F2EB',
          lavender: '#E8DAEF',
          peach: '#FFE5CC',
          sage: '#D5E8D4',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
