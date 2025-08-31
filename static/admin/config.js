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
{
  name: "mock-tests",
  label: "Mock Tests",
  folder: "content/mock-tests",
  create: true,
  slug: "{{slug}}",
  fields: [
    { label: "Test UID", name: "test_uid", widget: "string", hint: "Stable unique id (eg: jee-main-mock-1). Use slug or UUID." },
    { label: "Title", name: "title", widget: "string" },
    { label: "Slug (URL)", name: "slug", widget: "string", hint: "URL part (eg: jee-main-mock-1)" },
    { label: "Version", name: "version", widget: "number", default: 1, hint: "Increase when you update test content" },
    { label: "Duration (minutes)", name: "duration", widget: "number", min: 1, default: 180 },

    {
      label: "Preset (marking template)",
      name: "preset",
      widget: "select",
      options: ["JEE Main", "JEE Advanced"],
      default: "JEE Main",
      hint: "Choose preset — you can still edit marking below"
    },

    {
      label: "Marking Scheme",
      name: "marking_scheme",
      widget: "object",
      fields: [
        { label: "Points for Correct", name: "correct", widget: "number", default: 4 },
        { label: "Points for Wrong", name: "wrong", widget: "number", default: -1 },
        { label: "Points for Unattempted", name: "unattempted", widget: "number", default: 0 },
        {
          label: "Multiple-correct scoring",
          name: "multiple_correct_scoring",
          widget: "select",
          options: ["all-or-nothing", "partial"],
          default: "all-or-nothing",
          hint: "Partial = partial credit, All-or-nothing = full marks only if all correct options selected"
        }
      ]
    },

    {
      label: "Subjects (select one or more)",
      name: "subjects",
      widget: "list",
      field: {
        label: "Subject",
        name: "subject",
        widget: "select",
        options: ["Maths", "Physics", "Chemistry"]
      },
      hint: "Sections will be created per selected subject"
    },

    {
      label: "Question counts (applies PER subject)",
      name: "counts_per_subject",
      widget: "object",
      fields: [
        { label: "Single choice per subject", name: "single", widget: "number", default: 20 },
        { label: "Integer type per subject", name: "integer", widget: "number", default: 5 },
        { label: "Multiple-correct per subject", name: "multiple", widget: "number", default: 0 }
      ],
      hint: "These counts are applied to each selected subject when curating the test"
    },

    {
      label: "Curated Questions (add in exact test order)",
      name: "questions",
      widget: "list",
      hint: "Add questions in the order you want them to appear. Use the appropriate relation field below depending on subject.",
      fields: [
        { label: "Section subject", name: "subject", widget: "select", options: ["Maths", "Physics", "Chemistry"] },
        { label: "Chapter", name: "chapter", widget: "string", hint: "Free text or chapter slug (for reference)" },

        // Relations: admin should fill only the correct relation field per subject.
        {
          label: "Question (Maths) — use only if Subject = Maths",
          name: "question_math",
          widget: "relation",
          collection: "questions",
          searchFields: ["title", "question"],
          valueField: "title",
          displayFields: ["title"],
          required: false
        },
        {
          label: "Question (Physics) — use only if Subject = Physics",
          name: "question_physics",
          widget: "relation",
          collection: "questionsp",
          searchFields: ["title", "question"],
          valueField: "title",
          displayFields: ["title"],
          required: false
        },
        {
          label: "Question (Chemistry) — use only if Subject = Chemistry",
          name: "question_chemistry",
          widget: "relation",
          collection: "questionsc",
          searchFields: ["title", "question"],
          valueField: "title",
          displayFields: ["title"],
          required: false
        },

        { label: "Question ID override (optional)", name: "question_id", widget: "string", required: false, hint: "If you want a custom id/filename for this question in the test snapshot." },
        { label: "Notes (admin-only)", name: "notes", widget: "text", required: false }
      ]
    },

    {
      label: "AIR / Rank Mapping (score → estimated rank)",
      name: "rank_mapping",
      widget: "list",
      hint: "Define non-overlapping ranges. Frontend picks the first matching range for user's score.",
      fields: [
        { label: "Min score (inclusive)", name: "min_score", widget: "number" },
        { label: "Max score (inclusive)", name: "max_score", widget: "number" },
        { label: "Estimated Rank / Text", name: "rank_text", widget: "string", hint: "e.g. Top 500 / ~2000" }
      ]
    },

    {
      label: "Display & behaviour",
      name: "display",
      widget: "object",
      fields: [
        { label: "Shuffle questions", name: "shuffle_questions", widget: "boolean", default: false, hint: "Keep false to preserve curated order" },
        { label: "Shuffle options", name: "shuffle_options", widget: "boolean", default: false },
        { label: "Show name/email capture before start", name: "capture_user", widget: "boolean", default: true }
      ]
    },

    { label: "Preview URL (optional)", name: "preview_url", widget: "string", required: false, hint: "Frontend preview location if you want one" },

    { label: "Published", name: "published", widget: "boolean", default: false },
    { label: "Created by", name: "created_by", widget: "string", required: false },
    { label: "Created at", name: "created_at", widget: "datetime", required: false }
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
