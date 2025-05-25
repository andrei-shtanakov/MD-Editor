export function getFileName(filePath) {
  return filePath ? filePath.split(/[/\\]/).pop() : 'Новый документ';
}

export function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}