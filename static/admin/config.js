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
  slug: "{{slug}}",   // manual slug for SEO-friendly URL
  path: "{{chapter}}/{{slug}}", // DPP info will be a field, not folder
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
    {
      label: "Question Type",
      name: "question_type",
      widget: "select",
      options: ["single", "multiple", "integer"],
      default: "single"
    },
    { label: "Question Text", name: "question", widget: "markdown" },
    { 
      label: "Options", 
      name: "options", 
      widget: "list", 
      field: { label: "Option", name: "option", widget: "string" } 
    },
    { label: "Correct Option Index", name: "correctIndex", widget: "number", min: 0 },
    { label: "Solution / Explanation", name: "solution", widget: "markdown" },
  ],
},

]
},
});
