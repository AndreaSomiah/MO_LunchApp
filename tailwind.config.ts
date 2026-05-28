import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#082B63',
          50:  '#E8EEF8',
          100: '#C5D3EC',
          500: '#1E4FA1',
          900: '#041635',
        },
      },
    },
  },
  plugins: [],
};

export default config;
