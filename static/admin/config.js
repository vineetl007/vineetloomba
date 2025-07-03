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
        name: "pages",
        label: "Pages",
        files: [
          {
            label: "Homepage",
            name: "index",
            file: "content/_index.md",
            fields: [
              { label: "Title", name: "title", widget: "string" },
              { label: "Body", name: "body", widget: "markdown" },
            ],
          },
        ],
      },
    ],
  },
});
