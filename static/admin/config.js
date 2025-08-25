// ✅ No import line needed. CMS is available globally after script tag in index.html

CMS.init({
  config: {
    backend: {
      name: "git-gateway",
      branch: "main",
    },
    media_folder: "static/uploads",
    public_folder: "/uploads",
   collections: [
  {
    name: "chapters",
    label: "Chapters",
    folder: "content/chapters",
    create: true,
    slug: "{{slug}}",
    path: "{{slug}}/_index",
    format: "frontmatter",
    extension: "md",
    fields: [
      { label: "Title", name: "title", widget: "string" },
      { label: "Weight", name: "weight", widget: "number", default: 1 },
      { label: "Date", name: "date", widget: "datetime", format: "YYYY-MM-DD", required: false },
      { label: "Description", name: "description", widget: "string", hint: "SEO meta description (around 150 characters)" },
      { label: "Body", name: "body", widget: "markdown" },
    ],
  },
  {
  name: "blog",
  label: "Blog",
  folder: "content/blog",
  create: true,
  slug: "{{slug}}",
  fields: [
    { label: "Title", name: "title", widget: "string" },
    { label: "Weight", name: "weight", widget: "number", default: 1 },
    { label: "Description", name: "description", widget: "string", hint: "SEO meta description (around 150 characters)" },
    { label: "Body", name: "body", widget: "markdown" },
    ],
  },
  
  {
  name: "questions",
  label: "Questions",
  folder: "content/questions/jee-math",
  create: true,
  slug: "{{question | slugify}}", // Auto-generate slug from question text
  path: "{{chapter}}/{{slug}}",    // URL structure: /questions/jee-math/chapter/slug/
  fields: [
    { label: "Title", name: "title", widget: "string" },
    { label: "Slug", name: "slug", widget: "string", hint: "Enter URL slug manually" },
    {
      label: "Chapter",
      name: "chapter",
      widget: "select",
      options: ["circles", "straight-lines", "parabola"],
    },
    {
      label: "DPP",
      name: "dpp",
      widget: "select",
      options: ["dpp-1", "dpp-2", "dpp-3"],
    },
    { label: "Tags", name: "tags", widget: "list" },
    {
      label: "Difficulty",
      name: "difficulty",
      widget: "select",
      options: ["Easy", "Medium", "Hard"],
    },
    { label: "Question Type", name: "question_type", widget: "select", options: ["Single Choice", "Multiple Choice", "Integer Type"], default: "Single Choice" },
    { label: "Question Text", name: "question", widget: "markdown" },

    // Options field for Single or Multiple Choice
    { 
      label: "Options", 
      name: "options", 
      widget: "list", 
      field: { label: "Option", name: "option", widget: "string" },
      required: false,
      hint: "Only for Single or Multiple Choice questions",
      pattern: [".*", "Enter at least one option"],
      conditional: { field: "question_type", value: ["Single Choice", "Multiple Choice"] }
    },

    // Correct indices for Single or Multiple Choice
    { 
      label: "Correct Option Index(es)", 
      name: "correctIndices", 
      widget: "list", 
      field: { label: "Index", name: "index", widget: "number", min: 0 },
      required: false,
      hint: "Single number for single choice, multiple numbers for multiple choice",
      conditional: { field: "question_type", value: ["Single Choice", "Multiple Choice"] }
    },

    // Integer answer field
{
  label: "Numerical Answer",
  name: "numerical_answer",
  widget: "string",   // use string instead of number for full flexibility
  required: false,
  hint: "Enter your answer directly (decimals, fractions, negatives allowed)",
},



    { label: "Solution / Explanation", name: "solution", widget: "markdown" }
  ]
}

]
},
});
