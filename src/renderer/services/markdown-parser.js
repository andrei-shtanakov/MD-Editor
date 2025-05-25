class MarkdownService {
  constructor() {
    // Настройка marked
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {}
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });
  }

  parseMarkdown(text) {
    return marked.parse(text);
  }
}

export { MarkdownService };