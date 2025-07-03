CMS.init({
  config: {
    backend: {
      name: "git-gateway",
      branch: "main",
    },
    load_config_file: false,
    media_folder: "static/uploads",
    public_folder: "/uploads",
    collections: [
      {
        name: "calculus",
        label: "Calculus",
        folder: "content/calculus",
        create: true,
        slug: "{{slug}}",
        fields: [
          { label: "Title", name: "title", widget: "string" },
          { label: "Body", name: "body", widget: "markdown" }
        ]
      }
    ]
  }
});
