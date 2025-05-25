class SettingsService {
  constructor() {
    this.settings = {
      theme: 'light',
      fontSize: 14,
      fontFamily: 'Monaco, Consolas, monospace',
      wordWrap: true,
      lineNumbers: true,
      autoSave: false,
      autoSaveInterval: 30000,
      previewEnabled: true,
      syncScroll: true
    };
    this.init();
  }

  init() {
    this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('mde-settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('mde-settings', JSON.stringify(this.settings));
      this.notifyChange();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }

  getAll() {
    return { ...this.settings };
  }

  reset() {
    this.settings = {
      theme: 'light',
      fontSize: 14,
      fontFamily: 'Monaco, Consolas, monospace',
      wordWrap: true,
      lineNumbers: true,
      autoSave: false,
      autoSaveInterval: 30000,
      previewEnabled: true,
      syncScroll: true
    };
    this.saveSettings();
  }

  notifyChange() {
    window.dispatchEvent(new CustomEvent('settings-changed', {
      detail: this.settings
    }));
  }

  applyTheme() {
    document.body.setAttribute('data-theme', this.settings.theme);
  }

  applyEditorSettings(editor) {
    if (editor && editor.updateOptions) {
      editor.updateOptions({
        fontSize: this.settings.fontSize,
        fontFamily: this.settings.fontFamily,
        wordWrap: this.settings.wordWrap ? 'on' : 'off',
        lineNumbers: this.settings.lineNumbers ? 'on' : 'off'
      });
    }
  }
}

window.SettingsService = SettingsService;