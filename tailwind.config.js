/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Specialty colors - text
    'text-green-700', 'text-pink-700', 'text-sky-700', 'text-yellow-700', 'text-orange-700', 'text-blue-700',
    // Specialty colors - background
    'bg-green-100', 'bg-pink-100', 'bg-sky-100', 'bg-yellow-100', 'bg-orange-100', 'bg-blue-100',
    // Specialty colors - border
    'border-green-300', 'border-pink-300', 'border-sky-300', 'border-yellow-300', 'border-orange-300', 'border-blue-300',
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
