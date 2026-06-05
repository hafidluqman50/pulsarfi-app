/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── PulsarFi Design Tokens ───────────────────────────────
      colors: {
        // Canvas
        canvas:      '#fbfaf7',
        'canvas-soft': '#f3f0ea',
        // Surface
        surface:     '#ffffff',
        'surface-2': '#f6f3ed',
        // Ink
        ink:         '#16110e',
        'ink-soft':  '#2a231e',
        body:        '#6b635c',
        // Borders
        hairline:      '#e7e1d6',
        'hairline-strong': '#c8bfb0',
        // Brand
        merah:       '#c8102e',
        'merah-deep': '#9a0c24',
        'merah-soft': '#fbeceb',
        // Semantic
        positive:    '#1f7a4b',
        negative:    '#c8102e',
        // Dark mode overrides (prefix with dark-)
        'dark-canvas':   '#131110',
        'dark-surface':  '#1e1a17',
        'dark-ink':      '#f6f1e9',
        'dark-body':     '#a89c8d',
      },
      fontFamily: {
        display:  ['Fraunces_400Regular'],
        serif:    ['InstrumentSerif_400Regular_Italic'],
        sans:     ['Inter_400Regular'],
        mono:     ['JetBrainsMono_400Regular'],
      },
      borderRadius: {
        card:   '20px',
        btn:    '14px',
        pill:   '9999px',
        avatar: '11px',
      },
      spacing: {
        pad:  '18px',
        gap:  '14px',
      },
    },
  },
  plugins: [],
};
