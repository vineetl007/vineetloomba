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
  label: "Questions – JEE Math",
  folder: "content/questions/jee-math",
  create: true,
  slug: "{{slug}}",
  fields: [
    { label: "Title", name: "title", widget: "string" },
    { label: "Question", name: "body", widget: "markdown" },
    {
      label: "Chapter",
      name: "chapter",
      widget: "select",
      options: ["Circles", "Straight Lines", "Parabola", "Ellipse", "Hyperbola"],
    },
    {
      label: "DPP",
      name: "dpp",
      widget: "select",
      options: ["DPP-1", "DPP-2", "DPP-3", "DPP-4", "DPP-5"],
    },
    {
      label: "Difficulty",
      name: "difficulty",
      widget: "select",
      options: ["Easy", "Medium", "Hard"],
    },
    { label: "Tags", name: "tags", widget: "list" },
    { label: "Video ID", name: "video", widget: "string", required: false },
  ],
},

]
},
});
