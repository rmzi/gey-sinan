import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        'primary-dark': '#047857',
      },
      fontFamily: {
        arabic: ['Amiri-Regular'],
        'arabic-bold': ['Amiri-Bold'],
        ethiopic: ['NotoSansEthiopic-Regular'],
        'ethiopic-bold': ['NotoSansEthiopic-Bold'],
      },
    },
  },
  plugins: [],
};

export default config;
