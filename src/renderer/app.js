// src/renderer/app.js
console.log('app.js загружен');
console.log('electronAPI доступно:', window.electronAPI);

class MarkdownEditor {
  constructor() {
    this.currentFilePath = null;
    this.isModified = false;
    this.originalContent = '';
    
    this.initializeElements();
    this.setupEventListeners();
    this.setupIpcListeners();
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

    console.log('Элементы инициализированы:', {
      editor: !!this.editor,
      preview: !!this.preview,
      newBtn: !!this.newBtn,
      openBtn: !!this.openBtn,
      saveBtn: !!this.saveBtn,
      saveAsBtn: !!this.saveAsBtn
    });
  }

  setupEventListeners() {
    // Обновление превью при вводе
    this.editor.addEventListener('input', () => {
      this.updatePreview();
      this.updateWordCount();
      this.markAsModified();
    });

    // Кнопки в панели инструментов
    this.newBtn.addEventListener('click', () => {
      console.log('Кнопка New нажата');
      this.newFile();
    });
    
    this.openBtn.addEventListener('click', () => {
      console.log('Кнопка Open нажата');
      this.triggerOpenFile();
    });
    
    this.saveBtn.addEventListener('click', () => {
      console.log('Кнопка Save нажата');
      this.saveFile();
    });
    
    this.saveAsBtn.addEventListener('click', () => {
      console.log('Кнопка SaveAs нажата');
      this.saveFileAs();
    });

    this.openBtn.addEventListener('click', () => this.openFile());


    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            this.newFile();
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

    // Предотвращение закрытия с несохраненными изменениями
    window.addEventListener('beforeunload', (e) => {
      if (this.isModified) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  setupIpcListeners() {
    // Обработчики меню
    window.electronAPI.onMenuNewFile(() => this.newFile());
    window.electronAPI.onMenuSaveFile(() => this.saveFile());
    window.electronAPI.onMenuSaveFileAs(() => this.saveFileAs());
    
    // Обработчик открытия файла
    window.electronAPI.onFileOpened((event, data) => {
      this.loadFile(data.path, data.content);
    });
  }

  triggerOpenFile() {
    if (this.isModified && !confirm('У вас есть несохраненные изменения. Продолжить?')) {
      return;
    }
    console.log('Отправляем событие trigger-open-file');
    window.electronAPI.triggerOpenFile();
  }

  newFile() {
    if (this.isModified && !confirm('У вас есть несохраненные изменения. Продолжить?')) {
      return;
    }
    
    this.editor.value = '';
    this.currentFilePath = null;
    this.isModified = false;
    this.originalContent = '';
    this.updateFilePath();
    this.updatePreview();
    this.updateWordCount();
    this.updateStatus('Новый файл создан');
  }

  loadFile(filePath, content) {
    this.editor.value = content;
    this.currentFilePath = filePath;
    this.originalContent = content;
    this.isModified = false;
    this.updateFilePath();
    this.updatePreview();
    this.updateWordCount();
    this.updateStatus('Файл загружен');
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
        this.updateStatus('Файл сохранен');
      } else {
        this.updateStatus('Ошибка сохранения: ' + result.error);
      }
    } catch (error) {
      this.updateStatus('Ошибка сохранения: ' + error.message);
    }
  }
  // И добавьте этот метод в класс MarkdownEditor:
  async openFile() {
    if (this.isModified && !confirm('У вас есть несохраненные изменения. Продолжить?')) {
      return;
    }

    try {
      const result = await window.electronAPI.openFileDialog();
      if (result.success && !result.canceled) {
        this.loadFile(result.path, result.content);
      } else if (result.error) {
        this.updateStatus('Ошибка открытия: ' + result.error);
      }
    } catch (error) {
      this.updateStatus('Ошибка открытия: ' + error.message);
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
        this.updateStatus('Файл сохранен');
      } else if (result.error) {
        this.updateStatus('Ошибка сохранения: ' + result.error);
      }
    } catch (error) {
      this.updateStatus('Ошибка сохранения: ' + error.message);
    }
  }

  updatePreview() {
    const markdownText = this.editor.value;
    
    // Настройка marked для подсветки синтаксиса
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
    this.wordCount.textContent = `Слов: ${words} | Символов: ${chars}`;
  }

  updateFilePath() {
    const fileName = this.currentFilePath 
      ? this.currentFilePath.split(/[/\\]/).pop() 
      : 'Новый документ';
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
      this.status.textContent = 'Готов';
    }, 3000);
  }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM готов, создаем MarkdownEditor');
  new MarkdownEditor();
});