import { AppStore } from '../../store/app-store.js';

class Editor {
  constructor(element, store) {
    this.element = element;
    this.store = store;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.element.addEventListener('input', () => {
      this.store.setState({
        content: this.element.value,
        isModified: true
      });
    });
  }

  setValue(content) {
    this.element.value = content;
  }

  getValue() {
    return this.element.value;
  }
}

export { Editor };