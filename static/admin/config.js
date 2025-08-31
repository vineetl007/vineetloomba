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
    name: "video-lectures",
    label: "Video Lectures",
    folder: "content/video-lectures",
    create: true,
    slug: "{{slug}}",
    path: "{{slug}}/_index",
    format: "frontmatter",
    extension: "md",
    fields: [
      { label: "Title", name: "title", widget: "string" },
      { label: "Weight", name: "weight", widget: "number", default: 1 },
    {
      label: "Chapter",
      name: "chapter",
      widget: "select",
      options: ["circles", "straight-lines", "parabola","binomial-theorem","indefinite-integration","permutations-combinations","quadratic-equations"],
    },
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
  label: "Questions-Maths",
  folder: "content/questions/jee-math",
  create: true,
   slug: "{{title}}",                  // file name (q1, q2…)
  path: "{{chapter}}/{{question | slugify}}",   // SEO-friendly URL from question
    fields: [
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
      options: ["circles", "straight-lines", "parabola","binomial-theorem","indefinite-integration","permutations-combinations","quadratic-equations"],
    },
    { 
  label: "DPP", 
  name: "dpp", 
  widget: "number", 
  value_type: "int",
  min: 1,
  hint: "Enter DPP number (e.g., 1 for DPP-1)"
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

    { label: "Solution / Explanation", name: "solution", widget: "markdown" },
      // ✅ Add Video Solution Fields
    { 
      label: "Video Solution (YouTube ID)", 
      name: "video", 
      widget: "string", 
      required: false,
      hint: "Enter only the YouTube video ID (e.g., ZBKvhm1KnDA)" 
    },
    { 
      label: "Start Time (seconds)", 
      name: "start_time", 
      widget: "number", 
      required: false, 
      hint: "Enter start time in seconds (default 0)" 
    }
      ]
    },
//questions for physics
     {
  name: "questionsp",
  label: "Questions-Physics",
  folder: "content/questions/jee-physics",
  create: true,
   slug: "{{title}}",                  // file name (q1, q2…)
  path: "{{chapter}}/{{question | slugify}}",   // SEO-friendly URL from question
    fields: [
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
      options: ["kinematics", "laws-of-motion", "work-power-energy"],
    },
    { 
  label: "DPP", 
  name: "dpp", 
  widget: "number", 
  value_type: "int",
  min: 1,
  hint: "Enter DPP number (e.g., 1 for DPP-1)"
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

    { label: "Solution / Explanation", name: "solution", widget: "markdown" },
      // ✅ Add Video Solution Fields
    { 
      label: "Video Solution (YouTube ID)", 
      name: "video", 
      widget: "string", 
      required: false,
      hint: "Enter only the YouTube video ID (e.g., ZBKvhm1KnDA)" 
    },
    { 
      label: "Start Time (seconds)", 
      name: "start_time", 
      widget: "number", 
      required: false, 
      hint: "Enter start time in seconds (default 0)" 
    }
      ]
    },
//questions for chemistry 
     {
  name: "questionsc",
  label: "Questions-Chemistry",
  folder: "content/questions/jee-chemistry",
  create: true,
   slug: "{{title}}",                  // file name (q1, q2…)
  path: "{{chapter}}/{{question | slugify}}",   // SEO-friendly URL from question
    fields: [
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
      options: ["chemical-bonding", "pblock", "sblock","atomic-structure"],
    },
    { 
  label: "DPP", 
  name: "dpp", 
  widget: "number", 
  value_type: "int",
  min: 1,
  hint: "Enter DPP number (e.g., 1 for DPP-1)"
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

    { label: "Solution / Explanation", name: "solution", widget: "markdown" },
      // ✅ Add Video Solution Fields
    { 
      label: "Video Solution (YouTube ID)", 
      name: "video", 
      widget: "string", 
      required: false,
      hint: "Enter only the YouTube video ID (e.g., ZBKvhm1KnDA)" 
    },
    { 
      label: "Start Time (seconds)", 
      name: "start_time", 
      widget: "number", 
      required: false, 
      hint: "Enter start time in seconds (default 0)" 
    }
      ]
    },
     
     // Mock Tests collection for Decap 
// config.js (partial — add inside collections[])
// ✅ JEE Main Mock Tests
// ------------------ JEE Main Mock Tests Collection ------------------
{
  name: "mock-tests",
  label: "JEE Main Mock Tests",
  folder: "content/mock-tests",
  create: true,
  slug: "{{slug}}",
  fields: [
    {
      label: "Test UID",
      name: "test_uid",
      widget: "string",
      hint: "Unique ID for this test. Enter manually or generate elsewhere.",
    },
    { label: "Test Title", name: "title", widget: "string" },

    {
      label: "Subjects",
      name: "subjects",
      widget: "select",
      multiple: true,
      options: ["Maths", "Physics", "Chemistry"],
      hint: "Select one or more subjects for this mock test."
    },

    {
      label: "Duration per Subject (minutes)",
      name: "duration",
      widget: "number",
      default: 60,
      hint: "Duration per subject (total = subjects * duration)."
    },

    {
      label: "Chapter Selection",
      name: "chapters",
      widget: "list",
      summary: "{{fields.subject}} → {{fields.chapter}}",
      hint: "Select chapters per subject.",
      fields: [
        {
          label: "Subject",
          name: "subject",
          widget: "select",
          options: ["Maths", "Physics", "Chemistry"]
        },
        {
          label: "Chapter",
          name: "chapter",
          widget: "select",
          options: [], // lazy-loaded dynamically from question folder
          hint: "Select chapter for this subject."
        }
      ]
    },

    {
      label: "Filters",
      name: "filters",
      widget: "object",
      fields: [
        {
          label: "Tags",
          name: "tags",
          widget: "select",
          multiple: true,
          options: [], // dynamically fetch all tags from questions
          hint: "Filter questions by tags (e.g., jeemain, pyq)"
        },
        {
          label: "Difficulty",
          name: "difficulty",
          widget: "select",
          multiple: true,
          options: ["Easy", "Medium", "Hard"]
        }
      ]
    },

    {
      label: "Question Picker (Curated)",
      name: "questions",
      widget: "list",
      summary: "{{fields.title}}",
      hint: "Select questions manually per subject. 20 Single + 5 Integer per subject.",
      fields: [
        {
          label: "Subject",
          name: "subject",
          widget: "select",
          options: ["Maths", "Physics", "Chemistry"]
        },
        {
          label: "Question Title",
          name: "title",
          widget: "relation",
          collection: "questions", // default Maths
          search_fields: ["title", "chapter", "tags"],
          value_field: "title",
          display_fields: ["title", "chapter", "difficulty", "question_type"],
          required: true,
          hint: "Will dynamically point to questions of chosen subject and chapter."
        }
      ]
    },

    {
      label: "Selected Questions Preview",
      name: "selected_preview",
      widget: "markdown",
      default: "No questions selected yet.",
      hint: "Auto-generated Markdown showing selected questions grouped by subject and type."
    },

    {
      label: "Estimated AIR Mapping",
      name: "air_mapping",
      widget: "markdown",
      hint: "Enter score-to-percentile mapping (used for ranking)."
    },

    {
      label: "Status",
      name: "status",
      widget: "select",
      options: ["Draft", "Published"],
      default: "Draft"
    }
  ]
},


// dpp creation in decap
     {
  name: "practice",
  label: "Practice Pages",
  folder: "content/practice",
  create: true,
  slug: "{{chapter}}-{{dpp}}",   // e.g., circles-dpp-1
  fields: [
    { label: "Title", name: "title", widget: "string" },
    { 
      label: "Subject", 
      name: "subject", 
      widget: "select", 
      options: ["maths", "physics", "chemistry"], 
      default: "maths"
    },
    { 
      label: "Chapter", 
      name: "chapter", 
      widget: "select", 
      options: ["circles", "straight-lines", "parabola"] 
    },
 { 
  label: "DPP", 
  name: "dpp", 
  widget: "number", 
  value_type: "int",
  min: 1,
  hint: "Enter DPP number (e.g., 1 for DPP-1)"
},

    { 
      label: "Layout", 
      name: "layout", 
      widget: "hidden", 
      default: "practice" 
    }
  ]
}

]
},
});
