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
   slug: "{{title}}",                  // file name (q1, q2…)
  path: "{{chapter}}/{{question | slugify}}",   // SEO-friendly URL from question
    { 
      label: "Title (File Name)", 
      name: "title", 
      widget: "string",
      hint: "Used to name the file (e.g., q1, q2). Won't appear on frontend."
    },
    { 
      label: "Slug (URL)", 
      name: "slug", 
      widget: "string",
      required: false,
      hint: "Auto-generated from question text for URL"
    },
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
    { 
      label: "Question Type", 
      name: "question_type", 
      widget: "select", 
      options: ["Single Choice", "Multiple Choice", "Integer Type"], 
      default: "Single Choice" 
    },
    { label: "Question Text", name: "question", widget: "markdown" },

    // Options for Single or Multiple Choice
    { 
      label: "Options", 
      name: "options", 
      widget: "list", 
      field: { label: "Option", name: "option", widget: "string" },
      required: false,
      hint: "Only for Single or Multiple Choice questions",
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

    // Numerical answer for Integer / Decimal type
    {
      label: "Numerical Answer",
      name: "numerical_answer",
      widget: "string",   // string allows decimals, fractions, negatives
      required: false,
      hint: "Enter your answer directly"
    },

    { label: "Solution / Explanation", name: "solution", widget: "markdown" }
  ]
}

]
},
});
