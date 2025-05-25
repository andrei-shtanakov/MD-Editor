class MarkdownEditor {
  constructor() {
    this.currentFilePath = null;
    this.isModified = false;
    this.originalContent = '';
    
    this.initializeElements();
    this.setupEventListeners();
    this.setupMenuListeners();
    this.updatePreview();
  }

  initializeElements() {
    this.editor = document.getElementById('editor');
    this.preview = document.getElementById('preview');
    this.filePath = document.getElementById('filePath');
    this.status = document.getElementById('status');
    this.wordCount = document.getElementById('wordCount');
    
    this.newBtn = document.getElementById('newBtn');
    this.openBtn = document.getElementById('openBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.saveAsBtn = document.getElementById('saveAsBtn');
  }

  setupEventListeners() {
    this.editor.addEventListener('input', () => {
      this.updatePreview();
      this.updateWordCount();
      this.markAsModified();
    });

    this.newBtn.addEventListener('click', () => this.newFile());
    this.openBtn.addEventListener('click', () => this.openFile());
    this.saveBtn.addEventListener('click', () => this.saveFile());
    this.saveAsBtn.addEventListener('click', () => this.saveFileAs());

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            this.newFile();
            break;
          case 'o':
            e.preventDefault();
            this.openFile();
            break;
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              this.saveFileAs();
            } else {
              this.saveFile();
            }
            break;
        }
      }
    });

    window.addEventListener('beforeunload', (e) => {
      if (this.isModified) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  setupMenuListeners() {
    window.electronAPI.onMenuNewFile(() => this.newFile());
    window.electronAPI.onMenuOpenFile(() => this.openFile());
    window.electronAPI.onMenuSaveFile(() => this.saveFile());
    window.electronAPI.onMenuSaveFileAs(() => this.saveFileAs());
  }

  newFile() {
    if (this.isModified && !confirm('You have unsaved changes. Continue?')) {
      return;
    }
    
    this.editor.value = '';
    this.currentFilePath = null;
    this.isModified = false;
    this.originalContent = '';
    this.updateFilePath();
    this.updatePreview();
    this.updateWordCount();
    this.updateStatus('New file created');
  }

  async openFile() {
    if (this.isModified && !confirm('You have unsaved changes. Continue?')) {
      return;
    }

    try {
      const result = await window.electronAPI.openFileDialog();
      if (result.success && !result.canceled) {
        this.loadFile(result.path, result.content);
      } else if (result.error) {
        this.updateStatus('Error opening file: ' + result.error);
      }
    } catch (error) {
      this.updateStatus('Error opening file: ' + error.message);
    }
  }

  loadFile(filePath, content) {
    this.editor.value = content;
    this.currentFilePath = filePath;
    this.originalContent = content;
    this.isModified = false;
    this.updateFilePath();
    this.updatePreview();
    this.updateWordCount();
    this.updateStatus('File loaded');
  }

  async saveFile() {
    if (!this.currentFilePath) {
      return this.saveFileAs();
    }

    try {
      const result = await window.electronAPI.saveFile(this.currentFilePath, this.editor.value);
      if (result.success) {
        this.originalContent = this.editor.value;
        this.isModified = false;
        this.updateFilePath();
        this.updateStatus('File saved');
      } else {
        this.updateStatus('Error saving: ' + result.error);
      }
    } catch (error) {
      this.updateStatus('Error saving: ' + error.message);
    }
  }

  async saveFileAs() {
    try {
      const result = await window.electronAPI.saveFileAs(this.editor.value);
      if (result.success && !result.canceled) {
        this.currentFilePath = result.path;
        this.originalContent = this.editor.value;
        this.isModified = false;
        this.updateFilePath();
        this.updateStatus('File saved');
      } else if (result.error) {
        this.updateStatus('Error saving: ' + result.error);
      }
    } catch (error) {
      this.updateStatus('Error saving: ' + error.message);
    }
  }

  updatePreview() {
    const markdownText = this.editor.value;
    
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

    this.preview.innerHTML = marked.parse(markdownText);
  }

  updateWordCount() {
    const text = this.editor.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    this.wordCount.textContent = `Words: ${words} | Characters: ${chars}`;
  }

  updateFilePath() {
    const fileName = this.currentFilePath 
      ? this.currentFilePath.split(/[/\\]/).pop() 
      : 'New Document';
    const modified = this.isModified ? ' •' : '';
    this.filePath.textContent = fileName + modified;
  }

  markAsModified() {
    if (this.editor.value !== this.originalContent) {
      this.isModified = true;
      this.updateFilePath();
    }
  }

  updateStatus(message) {
    this.status.textContent = message;
    setTimeout(() => {
      this.status.textContent = 'Ready';
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MarkdownEditor();
});