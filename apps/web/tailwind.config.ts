import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          500: '#3577f0',
          600: '#255fe0',
          700: '#1f4ec3'
        }
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
export default config;
