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
        // ⭐ Palette principale - Sellora Indigo
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // ⭐ Eto no ampiasaina ho Active Pill (bg-primary-600)
          700: '#02010e',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        // ⭐ Palette secondaire - Violet
        secondary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        // ⭐ Succès - Vert
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // ⭐ Danger - Rouge
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // ⭐ Warning - Orange
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // ⭐ Gold - Premium (Logo Ring)
        gold: {
          50: '#FDF8F0',
          100: '#FBF0DD',
          200: '#F7E1BB',
          300: '#F3D299',
          400: '#EFC377',
          500: '#D4A84F', // ⭐ Ho an'ny peratra volamena manodidina ny Logo
          600: '#C49A3F',
          700: '#B48A2F',
          800: '#A47A1F',
          900: '#8A6615',
        },
        // ⭐ Gris - Tailwind standard
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155', // ⭐ Borders amin'ny Dark Mode
          800: '#1E293B',
          900: '#1F2937',
          950: '#020617',
        },
        // ⭐ Alias ho an'ny fampiasana mora kokoa
        indigo: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
          pale: '#EEF2FF',
        },
        violet: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          dark: '#6D28D9',
          pale: '#F5F3FF',
        },
        slate: {
          DEFAULT: '#1F2937',
          light: '#64748B',
          dark: '#020617',
          pale: '#F8FAFC',
        },
        // ⭐ Background ampiasaina amin'ny dark mode
        darkBg: '#0B1120', // ⭐ FANITSARA: Nalaina tahaka tsara ilay loko ao amin'ny sary sidebar
        lightBg: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 15px 50px rgba(0, 0, 0, 0.12)',
        'premium': '0 20px 50px -12px rgba(99, 102, 241, 0.25)',
        'soft': '0 4px 20px rgba(99, 102, 241, 0.15)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
        'dark': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'stat': '0 2px 12px rgba(99, 102, 241, 0.12)',
        'stat-hover': '0 6px 24px rgba(99, 102, 241, 0.20)',
        'sidebar': '0 0 40px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'slideUp': 'slideUp 0.4s ease-out forwards',
        'slideRight': 'slideRight 0.4s ease-out forwards',
        'pulse-indigo': 'pulseIndigo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'count-up': 'countUp 1s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseIndigo: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(99, 102, 241, 0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 168, 79, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212, 168, 79, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      backgroundImage: {
        'gradient-indigo': 'linear-gradient(160deg, #4F46E5, #7C3AED)',
        'gradient-indigo-light': 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
        'gradient-gold': 'linear-gradient(145deg, #C49A3F, #D4A84F)',
        'gradient-success': 'linear-gradient(145deg, #059669, #10B981)',
        'gradient-danger': 'linear-gradient(145deg, #DC2626, #EF4444)',
        'gradient-dark': 'linear-gradient(145deg, #1F2937, #1E293B)',
        'gradient-sidebar': 'linear-gradient(160deg, #4F46E5 0%, #7C3AED 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        'gradient-stat': 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.05))',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};