/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0C14',
        panel: '#121520',
        'panel-hi': '#1B1F2E',
        'pixel-shadow': '#05060A',
        edge: '#2A3042',
        cyan: { DEFAULT: '#34D3FF', hi: '#7DE5FF' },
        bolt: '#486EFF',
        heal: '#4ADE80',
        gold: '#FACC15',
        blood: '#F85252',
        arcane: '#A855F7',
        ink: { DEFAULT: '#F5F7FF', 2: '#A7AEC4', 3: '#626A80' },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
        term: ['VT323', 'ui-monospace', 'monospace'],
      },
      borderRadius: { none: '0px', DEFAULT: '0px', sm: '2px' },
      boxShadow: { pixel: '4px 4px 0 #05060A' },
    },
  },
  plugins: [],
};
