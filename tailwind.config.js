/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /** Accent blue — CTAs, charts, links (platform mark ~#0088FF) */
        primary: {
          50: 'var(--color-primary-50, #F0F8FF)',
          100: 'var(--color-primary-100, #E0F1FF)',
          200: 'var(--color-primary-200, #B8DEFF)',
          300: 'var(--color-primary-300, #85C6FF)',
          400: 'var(--color-primary-400, #47A9FF)',
          500: 'var(--color-primary-500, #0D9488)',
          600: 'var(--color-primary-600, #007DEB)',
          700: 'var(--color-primary-700, #0070D1)',
          800: 'var(--color-primary-800, #005CAD)',
          900: 'var(--color-primary-900, #004785)',
        },
        /** Navy — structural brand, nav active, headings ink */
        secondary: {
          50: 'var(--color-secondary-50, #E8EAF4)',
          100: 'var(--color-secondary-100, #C5CBE5)',
          200: 'var(--color-secondary-200, #9BA6D0)',
          300: 'var(--color-secondary-300, #7180BB)',
          400: 'var(--color-secondary-400, #475AA6)',
          500: 'var(--color-secondary-500, #0F172A)',
          600: 'var(--color-secondary-600, #181F52)',
          700: 'var(--color-secondary-700, #141A44)',
          800: 'var(--color-secondary-800, #101536)',
          900: 'var(--color-secondary-900, #0C1028)',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: '#15803D',
        warning: '#B45309',
        danger: '#B91C1C',
        ink: '#0F172A',
        /** Public marketing surface — derived from platform logo palette */
        pub: {
          primary: '#0D9488',
          'primary-hover': '#0078E0',
          'primary-subtle': '#EBF5FF',
          'primary-muted': '#B8DEFF',
          ink: '#0A2540',
          'ink-muted': '#425466',
          'ink-subtle': '#6B7F99',
          surface: '#FFFFFF',
          'surface-muted': '#F6F9FC',
          border: '#E3E8EE',
          'border-strong': '#C1C9D2',
        },
      },
      fontFamily: {
        sans: ['var(--font-figtree)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-figtree)', 'system-ui', 'sans-serif'],
        pub: ['var(--font-figtree)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04)',
        medium: '0 4px 12px rgba(15, 23, 42, 0.06)',
        large: '0 12px 32px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
}
