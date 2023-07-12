const project = {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt",
          type: "string",
        },
      ],
    },
    {
      name: "url",
      title: "URL",
      type: "url",
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "h1", value: "h1" },
            { title: "h2", value: "h2" },
            { title: "h3", value: "h3" },
            { title: "h4", value: "h4" },
            { title: "h5", value: "h5" },
            { title: "h6", value: "h6" },
            { title: "Intro/Conclusion", value: "intro" },
            { title: "Quote", value: "blockquote" },
          ],
        },
        {
          type: "image",
        },
      ],
    },
  ],
};

export default project;
