const { dialog, ipcMain } = require('electron');
const fs = require('fs').promises;

function setupFileOperations(mainWindow) {
  ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
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
        return {
          success: true,
          path: result.filePaths[0],
          content: content
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, canceled: true };
  });

  ipcMain.handle('save-file', async (event, { path, content }) => {
    try {
      await fs.writeFile(path, content, 'utf8');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-file-as', async (event, content) => {
    const result = await dialog.showSaveDialog(mainWindow, {
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
}

module.exports = { setupFileOperations };