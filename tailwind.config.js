module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
    "./themes/**/*.html"
  ],
  safelist: [
    // Palette buttons & general
    'palette-btn',
    'question-text',
    'font-concert',
    'font-bold',
    'font-semibold',
    'text-center',
    'inline-block',

    // Layout utilities
    'flex',
    'flex-wrap',
    'items-center',
    'justify-between',
    'justify-center',
    'cursor-pointer',
    'col-span-full',

    // Spacing / sizing
    'w-10', 'h-10',
    'mt-2', 'mt-3', 'ml-4', 'my-1',
    'px-3', 'px-4', 'py-2', 'py-8', 'p-3',
    'min-h-[400px]',
    'max-w-[1800px]',
    'max-w-xl',
    'w-full',
    'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4',
    'gap-1', 'gap-2', 'gap-3',

    // Typography / text
    'text-xl', 'text-2xl', 'text-3xl',
    'uppercase',
    'text-gray-300',
    'text-[#ffb84d]',

    // Backgrounds / colors
    'bg-gray-800', 'bg-gray-900', 'bg-blue-500', 'hover:bg-blue-400', 'bg-[#0D163D]',

    // Borders / outlines
    { pattern: /border-(gray|green|red|blue|yellow|purple)-(100|300|400|500|600|700|800)/ },
    { pattern: /outline(-\d+)?/ },

    // Dynamic background / hover colors
    { pattern: /bg-(gray|green|purple|red|blue|white|yellow|black)-(100|300|400|500|600|700|800)/ },
    { pattern: /hover:bg-(gray|green|purple|red|blue|white|yellow|black)-(100|300|400|500|600|700|800)/ },

    // Text colors patterns
    { pattern: /text-(white|black|yellow)-(300|400)/ },

    // Hover / opacity
    { pattern: /(hover:)?opacity-\d+/ },
    { pattern: /(hover:)?bg-gray-(100|700)\/?10?/ },

    // Grid utilities
    { pattern: /grid(-(cols|rows)-\d+)?/ },

    // Responsive variants
    { pattern: /(sm|md|lg):.*/ },

    // Shadows / rounding / positioning / transforms
    'shadow-md', 'shadow-lg',
    'rounded-full', 'rounded-lg', 'rounded-xl',
    'fixed', 'z-50',
    '-translate-x-full',
    'transition', 'transition-transform', 'duration-300',

    // HTML elements
    'details', 'summary',
    'p-4', 'py-4', 'px-6', 'py-6', 'px-2', 'py-2', 'p-2', 'mb-4', 'mb-3'
  ],

  theme: {
    extend: {},
  },
  plugins: [],
}
