/**
 * Tailwind configuration with HiveHR bee/hive color palette.
 * We override some default palette names (purple, pink, blue, green, cyan, orange)
 * to map to amber/yellow tones so existing utility classes automatically adopt
 * the new branding without massive code refactors.
 */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
      // Map common color keys used throughout the project to amber / hive palette
      purple: colors.amber,
      pink: colors.amber,
      blue: colors.amber,
      green: colors.green,
      cyan: colors.amber,
      orange: {
        ...colors.orange,
        ...{
          50:  '#EFEBE9',
          100: '#D7CCC8',
          200: '#BCAAA4',
          300: '#A1887F',
          400: '#8D6E63',
          500: '#795548',
          600: '#6D4C41',
          700: '#5D4037',
          800: '#4E342E',
          900: '#3E2723',
        }
      },
      // Keep amber & yellow as-is for flexibility
      amber: colors.amber,
      yellow: colors.yellow,
      // Additional brown wood-like palette for hive accents
      brown: {
        50:  '#EFEBE9',
        100: '#D7CCC8',
        200: '#BCAAA4',
        300: '#A1887F',
        400: '#8D6E63',
        500: '#795548',
        600: '#6D4C41',
        700: '#5D4037',
        800: '#4E342E',
        900: '#3E2723',
      },
      // Include the rest of Tailwind default colors you may still need
      slate: colors.slate,
      gray: colors.gray,
      zinc: colors.zinc,
      neutral: colors.neutral,
      stone: colors.stone,
      red: colors.red,
      lime: colors.lime,
      indigo: colors.indigo,
      violet: colors.violet,
      fuchsia: colors.fuchsia,
      rose: colors.rose,
    },
    extend: {
      // Additional customisations can go here
    },
  },
  plugins: [],
};
