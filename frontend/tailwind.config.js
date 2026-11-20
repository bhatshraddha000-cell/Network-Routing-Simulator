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
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],       // 12px
        'xs': ['0.8125rem', { lineHeight: '1.125rem' }],   // 13px
        'sm': ['0.90625rem', { lineHeight: '1.375rem' }],  // 14.5px
        'base': ['1rem', { lineHeight: '1.5rem' }],        // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],     // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],      // 20px
        '2xl': ['1.625rem', { lineHeight: '2.125rem' }],   // 26px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],    // 30px
      },
    },
  },
  plugins: [],
}
