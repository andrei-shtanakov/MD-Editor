class FileTree {
  constructor(container) {
    this.container = container;
    this.currentPath = null;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="filetree-header">
        <h3>Files</h3>
        <button id="open-folder-btn" class="btn-icon" title="Open Folder">📁</button>
      </div>
      <div class="filetree-content">
        <div class="no-folder">No folder selected</div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const openFolderBtn = this.container.querySelector('#open-folder-btn');
    openFolderBtn.addEventListener('click', () => this.openFolder());
  }

  async openFolder() {
    try {
      const result = await window.electronAPI.openFolderDialog();
      if (result.success) {
        this.currentPath = result.path;
        await this.loadFolderContents(result.path);
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  }

  async loadFolderContents(path) {
    try {
      const files = await window.electronAPI.readDirectory(path);
      this.renderFileTree(files);
    } catch (error) {
      console.error('Error loading folder contents:', error);
      this.renderError('Error loading folder contents');
    }
  }

  renderFileTree(files) {
    const content = this.container.querySelector('.filetree-content');
    content.innerHTML = '';

    const tree = document.createElement('ul');
    tree.className = 'file-list';

    files.forEach(file => {
      const item = document.createElement('li');
      item.className = `file-item ${file.isDirectory ? 'directory' : 'file'}`;
      
      const icon = file.isDirectory ? '📁' : this.getFileIcon(file.name);
      item.innerHTML = `
        <span class="file-icon">${icon}</span>
        <span class="file-name">${file.name}</span>
      `;

      if (!file.isDirectory && this.isMarkdownFile(file.name)) {
        item.addEventListener('click', () => this.openFile(file.path));
        item.classList.add('clickable');
      }

      tree.appendChild(item);
    });

    content.appendChild(tree);
  }

  getFileIcon(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'md':
      case 'markdown':
        return '📝';
      case 'txt':
        return '📄';
      case 'js':
        return '🟨';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  }

  isMarkdownFile(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['md', 'markdown', 'txt'].includes(ext);
  }

  async openFile(filepath) {
    try {
      const result = await window.electronAPI.readFile(filepath);
      if (result.success) {
        window.dispatchEvent(new CustomEvent('file-opened', {
          detail: {
            path: filepath,
            content: result.content
          }
        }));
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }

  renderError(message) {
    const content = this.container.querySelector('.filetree-content');
    content.innerHTML = `<div class="error">${message}</div>`;
  }
}

window.FileTree = FileTree;