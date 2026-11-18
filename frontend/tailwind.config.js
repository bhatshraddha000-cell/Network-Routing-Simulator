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
          sidebar: '#101A2B',
          surface: '#142136',
          elevated: '#1B2B43',
          border: '#26364B',
          accent: '#38BDF8',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          textPrimary: '#F1F5F9',
          textSecondary: '#94A3B8',
          source: '#22C55E',
          dest: '#F97316',
          router: '#3B82F6',
          edge: '#64748B',
        },
      },
    },
  },
  plugins: [],
}
