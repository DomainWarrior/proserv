import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1628',
          light:   '#112240',
          mid:     '#1a3356',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light:   '#e8c97a',
          pale:    '#fdf6e3',
        },
        brand: {
          green:  '#1a6b3c',
          'green-light': '#e8f5ef',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        xl:  '14px',
        '2xl': '20px',
      },
      keyframes: {
        'slide-in': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.4s ease forwards',
        'fade-in':  'fade-in 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
