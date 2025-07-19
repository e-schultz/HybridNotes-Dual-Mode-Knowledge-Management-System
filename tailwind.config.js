export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        'terminal-black': '#121212',
        'terminal-white': '#E0E0E0',
        'terminal-gray': '#888888',
        'terminal-green': '#4CAF50',
        'terminal-border': '#333333',
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
}