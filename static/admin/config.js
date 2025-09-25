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
  name: "questions-maths-complex-numbers",
  label: "Questions-Maths-Complex-Numbers",
  folder: "content/questions/jee-math/complexnumbers",
  create: true,
      // Explicitly set the identifier field.
   identifier_field: "title",
   slug: "{{title}}",                  // file name (q1, q2…)
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
      hint: "type in manually dont repeat"
    },
{
  label: "Chapter",
  name: "chapter",
  widget: "select",
  options: ["complexnumbers"],
  default: "complexnumbers"
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
    },
      { 
  label: "Video Upload Date", 
  name: "videoUploadDate",   // 👈 new field
  widget: "datetime",          // use "date" if you only want date picker
  required: false,
  hint: "Select the actual upload date of the YouTube video" 
}

      ]
    },




     
{
  name: "questions",
  label: "Questions-Maths",
  folder: "content/questions/jee-math",
  create: true,
      // Explicitly set the identifier field.
   identifier_field: "title",
   slug: "{{title}}",                  // file name (q1, q2…)
    path: "{{chapter}}/{{title}}",   // SEO-friendly URL from question
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
      hint: "type in manually dont repeat"
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
    },
      { 
  label: "Video Upload Date", 
  name: "videoUploadDate",   // 👈 new field
  widget: "datetime",          // use "date" if you only want date picker
  required: false,
  hint: "Select the actual upload date of the YouTube video" 
}

      ]
    },
//questions for physics
     {
  name: "questionsp",
  label: "Questions-Physics",
  folder: "content/questions/jee-physics",
  create: true,
     // Explicitly set the identifier field.
   identifier_field: "title",
   slug: "{{title}}",                  // file name (q1, q2…)
    path: "{{chapter}}/{{title}}",   // SEO-friendly URL from question
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
      hint: "type in manually dont repeat"
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
     // Explicitly set the identifier field.
   identifier_field: "title",
   slug: "{{title}}",                  // file name (q1, q2…)
    path: "{{chapter}}/{{title}}",   // SEO-friendly URL from question
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
      hint: "type in manually dont repeat"
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

// ------------------ JEE Main Mock Tests Collection ------------------
{
  name: "mocktests",
  label: "Mock Tests",
  folder: "content/mocktests",
  create: true,
  slug: "{{slug}}",
  fields: [
    { label: "Test Name", name: "title", widget: "string" },
    { label: "Test UID", name: "uid", widget: "string" },
    { label: "Duration (minutes)",  name: "duration",  widget: "number",  default: 180,  min: 30,  step: 5},
        { 
      label: "Short Description", 
      name: "short_description", 
      widget: "text", 
      required: false, 
      hint: "Brief summary shown on the mock test card" 
    },
    { 
      label: "Tags", 
      name: "tags", 
      widget: "list", 
      required: false, 
      hint: "fst,parttest,maths,physics,chemistry" 
    },


    {
      label: "Maths Questions",
      name: "maths_questions",
      widget: "list",
      field: {
        label: "Question Path",
        name: "path",
        widget: "string",
        hint: "Enter full path e.g. questions/jee-math/chapter1/q1 without .md"
      }
    },
    {
      label: "Physics Questions",
      name: "physics_questions",
      widget: "list",
      field: {
        label: "Question Path",
        name: "path",
        widget: "string",
        hint: "Enter full path e.g. questions/jee-physics/chapter2/q15 without .md"
      }
    },
    {
      label: "Chemistry Questions",
      name: "chemistry_questions",
      widget: "list",
      field: {
        label: "Question Path",
        name: "path",
        widget: "string",
        hint: "Enter full path e.g. questions/jee-chemistry/chapter3/q20 without .md"
      }
    },

    {
      label: "Rank Preset",
      name: "rank_preset",
      widget: "list",
      fields: [
        { label: "Marks", name: "marks", widget: "number" },
        { label: "Estimated Rank", name: "rank", widget: "number" }
      ],
      hint: "Define marks-to-rank mapping (e.g. 300 → 100, 250 → 500)."
    }
  ]
},

     

// dpp creation in decap
     {
  name: "practice",
  label: "Practice Pages",
  folder: "content/practice",
  create: true,
  slug: "{{chapter}}-dpp-{{dpp}}",   // e.g., circles-dpp-1
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
