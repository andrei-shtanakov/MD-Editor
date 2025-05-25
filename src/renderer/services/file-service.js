class FileService {
  async saveFile(path, content) {
    return await window.electronAPI.saveFile(path, content);
  }

  async saveFileAs(content) {
    return await window.electronAPI.saveFileAs(content);
  }

  async openFile() {
    return await window.electronAPI.triggerOpenFile();
  }
}

export { FileService };