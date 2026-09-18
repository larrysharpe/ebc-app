import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ebc: {
          burgundy: '#891619',
          'burgundy-dark': '#781D24',
          gold: '#EBBF5F',
          'gold-bright': '#FEB01C',
          green: '#527E4C',
          'green-dark': '#376052',
          navy: '#003E60',
        },
      },
      fontFamily: {
        sans: ['var(--font-roboto-condensed)', 'system-ui', 'sans-serif'],
        display: ['Blacksword', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
