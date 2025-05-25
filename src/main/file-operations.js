const { dialog } = require('electron');
const fs = require('fs').promises;

class FileOperations {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  async openFile() {
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      try {
        const content = await fs.readFile(result.filePaths[0], 'utf8');
        this.mainWindow.webContents.send('file-opened', {
          path: result.filePaths[0],
          content: content
        });
      } catch (error) {
        dialog.showErrorBox('Ошибка', `Не удалось открыть файл: ${error.message}`);
      }
    }
  }
                            

  // Метод для регистрации IPC обработчиков
  registerIpcHandlers(ipcMain) {
    ipcMain.handle('save-file', async (event, { path, content }) => {
      try {
        await fs.writeFile(path, content, 'utf8');
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('save-file-as', async (event, content) => {
      const result = await dialog.showSaveDialog(this.mainWindow, {
        filters: [
          { name: 'Markdown Files', extensions: ['md'] },
          { name: 'Text Files', extensions: ['txt'] }
        ]
      });

      if (!result.canceled) {
        try {
          await fs.writeFile(result.filePath, content, 'utf8');
          return { success: true, path: result.filePath };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
      return { success: false, canceled: true };
    });

    ipcMain.on('trigger-open-file', () => {
      this.openFile(); // Вызываем существующую функцию
    });
  }

}

module.exports = { FileOperations };