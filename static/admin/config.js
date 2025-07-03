import CMS from "https://unpkg.com/decap-cms@3.1.0/dist/decap-cms.js";

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
        folder: "content/calculus",
        create: true,
        slug: "{{slug}}",
        fields: [
          { label: "Title", name: "title", widget: "string" },
          { label: "Body", name: "body", widget: "markdown" },
        ],
      },
    ],
  },
});
