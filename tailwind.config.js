/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        'cream': '#F9F8F6',
        'sand': '#EFE9E3',
        'stone': '#D9CFC7',
        'warm': '#C9B59C',
        'forest': '#6F8F72',
        'forest-light': '#EEF3EE',
        'ember': '#F2A65A',
        'ember-light': '#FEF3E8',
        'charcoal': '#2C2C2C',
        'muted': '#7A736C',
        'border': '#DDD8D2',
        'fail-red': '#C0392B',
        // keep old names working too
        'fb-cream': '#F9F8F6',
        'fb-border': '#DDD8D2',
        'fb-muted': '#7A736C',
        'fb-charcoal': '#2C2C2C',
        'fb-blue': '#6F8F72',
        'fb-blue-light': '#EEF3EE',
        'fb-red': '#C0392B',
        'fail-shame': '#8B4040',
        'fail-gold': '#C9A84C',
      },
    },
  },
  plugins: [],
}
