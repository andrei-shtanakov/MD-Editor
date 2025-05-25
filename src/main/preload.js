// src/main/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Обработчики меню
  onMenuNewFile: (callback) => ipcRenderer.on('menu-new-file', callback),
  onMenuSaveFile: (callback) => ipcRenderer.on('menu-save-file', callback),
  onMenuSaveFileAs: (callback) => ipcRenderer.on('menu-save-file-as', callback),
  
  // Обработчик открытия файла
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  // В contextBridge.exposeInMainWorld добавьте:
  triggerOpenFile: () => ipcRenderer.send('trigger-open-file'),
  
  // Методы для сохранения файлов
  saveFile: (path, content) => ipcRenderer.invoke('save-file', { path, content }),
  saveFileAs: (content) => ipcRenderer.invoke('save-file-as', content),
  
  // Удаление слушателей
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

