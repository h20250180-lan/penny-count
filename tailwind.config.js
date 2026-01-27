/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef6ee',
          100: '#fde9d6',
          200: '#facfac',
          300: '#f7ad77',
          400: '#f48140',
          500: '#f16524',
          600: '#e24710',
          700: '#bb3410',
          800: '#952b15',
          900: '#7a2714',
        },
        copper: {
          50: '#fef6ee',
          100: '#fde9d6',
          200: '#facfac',
          300: '#f7ad77',
          400: '#f48140',
          500: '#e87234',
          600: '#d95a1a',
          700: '#b44516',
          800: '#90381a',
          900: '#743018',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};