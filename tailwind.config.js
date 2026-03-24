/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface:           'var(--surface)',
        'surface-low':     'var(--surface-low)',
        'surface-container': 'var(--surface-container)',
        'surface-high':    'var(--surface-high)',
        'surface-highest': 'var(--surface-highest)',
        'surface-bright':  'var(--surface-bright)',
        primary:           'var(--primary)',
        'primary-dim':     'var(--primary-dim)',
        'on-primary':      'var(--on-primary)',
        secondary:         'var(--secondary)',
        tertiary:          'var(--tertiary)',
        'on-surface':      'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        outline:           'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        error:             'var(--error)',
        success:           'var(--success)',
      },
      fontFamily: {
        hed:  ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        xl2: 'var(--r-xl)',
        lg2: 'var(--r-lg)',
        md2: 'var(--r-md)',
      },
    },
  },
  plugins: [],
}
