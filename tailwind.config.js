/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0F172A',
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
          950: '#020617',
        },
        accent: {
          saffron: '#FF9933',
          green: '#138808',
          blue: '#1E3A8A',
        },
        success: {
          DEFAULT: '#138808',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#138808',
          600: '#0F7A06',
          700: '#0C5C04',
        },
        warning: {
          DEFAULT: '#FF9933',
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#FF9933',
          600: '#E67E0D',
          700: '#B86208',
        },
        error: {
          DEFAULT: '#DC2626',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(15, 23, 42, 0.06)',
        card: '0 4px 16px rgba(15, 23, 42, 0.08)',
        elevated: '0 8px 32px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
