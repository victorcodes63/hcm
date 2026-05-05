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
        /** Accent red — CTAs, charts, links (STABEX red ~#D2232A) */
        primary: {
          50: '#FCE8E9',
          100: '#F7C6C8',
          200: '#EF9599',
          300: '#E7646B',
          400: '#DC3340',
          500: '#D2232A',
          600: '#B81D24',
          700: '#9A181E',
          800: '#7C1418',
          900: '#5E1012',
        },
        /** Navy — structural brand, nav active, headings ink (STABEX blue ~#1D2460) */
        secondary: {
          50: '#E8EAF4',
          100: '#C5CBE5',
          200: '#9BA6D0',
          300: '#7180BB',
          400: '#475AA6',
          500: '#1D2460',
          600: '#181F52',
          700: '#141A44',
          800: '#101536',
          900: '#0C1028',
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
        ink: '#1D2460',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
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
