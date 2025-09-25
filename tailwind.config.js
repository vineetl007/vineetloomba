module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
    "./themes/**/*.html"
  ],
  safelist: [

      // Palette
  'palette-btn','w-10','h-10','rounded-full','hover:opacity-90','transition',
  'outline','outline-2','outline-yellow-400',
  'bg-gray-700','bg-white','bg-green-600','bg-purple-600','bg-gray-500','bg-red-600',
  'text-white','text-black','text-yellow-400','text-yellow-300',
  'col-span-full','text-center','font-bold','my-1',

  // Question card
  'border','rounded-lg','p-4','shadow','mb-4',
  'flex','items-center','gap-2',
  'px-2','py-1','font-concert',
  'bg-blue-600','bg-red-700','mt-2',
  'question-text','mb-4',
  'rounded','p-2','w-32','bg-gray-800','placeholder-gray-400',
  'space-y-2','cursor-pointer','hover:bg-gray-100/10',
  'mt-6','grid','grid-cols-2','sm:flex','sm:justify-between','sm:items-center',
  'px-4','py-2','sm:ml-0','sm:ml-2','px-3','text-base',
    'font-concert'
    
],
  theme: {
    extend: {},
  },
  plugins: [],
}
