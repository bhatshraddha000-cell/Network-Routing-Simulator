/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          main: '#0B1220',
          panel: '#111C2F',
          secondary: '#19263A',
          border: '#24344D',
          accent: '#38BDF8',
          source: '#22C55E',
          dest: '#F97316',
          router: '#3B82F6',
          edge: '#64748B',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
}

