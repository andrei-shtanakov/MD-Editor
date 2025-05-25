// src/main/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Menu handlers
  onMenuNewFile: (callback) => ipcRenderer.on('menu-new-file', callback),
  onMenuOpenFile: (callback) => ipcRenderer.on('menu-open-file', callback),
  onMenuSaveFile: (callback) => ipcRenderer.on('menu-save-file', callback),
  onMenuSaveFileAs: (callback) => ipcRenderer.on('menu-save-file-as', callback),
  
  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFile: (path, content) => ipcRenderer.invoke('save-file', { path, content }),
  saveFileAs: (content) => ipcRenderer.invoke('save-file-as', content),
  
  // Cleanup
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

