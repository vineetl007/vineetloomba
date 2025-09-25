module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
    "./themes/**/*.html"
  ],
 safelist: [
  // Palette buttons
  'palette-btn',
  'w-10',
  'h-10',
  'rounded-full',
  'transition',
  'col-span-full',
  'text-center',
  'font-bold',
  'my-1',
  'question-text',
  'font-concert',

  // Patterns for background colors used dynamically
  { pattern: /bg-(gray|green|purple|red|blue|white|yellow|black)-(100|300|400|500|600|700|800)/ },

     // Border colors dynamically used in analysis
   { pattern: /border-(gray|green|red|blue|yellow|purple)-(100|300|400|500|600|700|800)/ },

  // Patterns for text colors
  { pattern: /text-(white|black|yellow)-(300|400)/ },

  // Outline styles
  { pattern: /outline(-\d+)?/ },

  // Hover and cursor states
  { pattern: /(hover:)?opacity-\d+/ },
  { pattern: /(hover:)?bg-gray-(100|700)\/?10?/ },

  // Layout utilities
  { pattern: /(px|py|p|m|mt|mb|ml|mr)-\d+/ },
  { pattern: /(gap|space)-(x|y)?-\d+/ },
  { pattern: /(flex|items-center|justify-between|justify-center|cursor-pointer)/ },

  // Grid utilities
  { pattern: /grid(-(cols|rows)-\d+)?/ },

  // Responsive variants
  { pattern: /(sm|md|lg):.*/ }
],

  theme: {
    extend: {},
  },
  plugins: [],
}
