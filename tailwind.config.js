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

   // Generic hover background colors for dynamic tags, difficulty, question type
{ pattern: /hover:bg-(gray|green|purple|red|blue|white|yellow|black)-(100|300|400|500|600|700|800)/ },


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
  { pattern: /(sm|md|lg):.*/ },
   // Shadows
'shadow-md',
'shadow-lg',

// Rounded variants
'rounded-lg',
'rounded-xl',

// Font weights
'font-semibold',

// Text colors
'text-gray-300',

// Fixed / z-index / transforms / transitions
'fixed',
'z-50',
'-translate-x-full',
'transition-transform',
'duration-300',

// Arbitrary heights / widths
'min-h-[400px]',
'max-w-[1800px]',
'max-w-xl',
'w-full',

// Additional spacing
'space-y-1',
   // New colors
'bg-gray-800',
'bg-blue-500',
'hover:bg-blue-400',

// Font sizes
'text-3xl',
'text-2xl',
'text-xl',

// Margin / padding
'mt-2',
'mt-3',
'ml-4',

// Inline utilities
'inline-block',

// HTML elements
'details',
'summary',

   'bg-[#0D163D]',
'text-[#ffb84d]',
'mt-10',
'uppercase',
   'text-3xl',
'font-semibold',
'py-8',
'p-3',
'mt-3',
'mt-2',
'ml-4',
'space-y-4',
'space-y-2',
'max-w-5xl',
     'flex',
  'flex-wrap',
  'gap-1',
  'gap-2',
  'gap-3',
  'space-y-1',
  'space-y-3'



],

  theme: {
    extend: {},
  },
  plugins: [],
}
