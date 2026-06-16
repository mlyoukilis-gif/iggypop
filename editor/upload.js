const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PROJECT_DIR, PROJECT_PREFIX } = require('./paths');

function safeUploadName(original) {
  let name = path.basename(original || 'photo.jpg').replace(/\s+/g, '-');
  name = name.replace(/[^\w.\-]/g, '');
  return name || 'photo.jpg';
}

function uniquePath(directory, filename) {
  let dest = path.join(directory, filename);
  if (!fs.existsSync(dest)) return dest;
  const ext = path.extname(filename);
  const stem = path.basename(filename, ext);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return path.join(directory, `${stem}-${stamp}${ext}`);
}

function convertHeicToJpeg(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.heic', '.heif'].includes(ext)) return filePath;

  const jpgPath = filePath.replace(/\.(heic|heif)$/i, '.jpg');
  try {
    execFileSync('sips', ['-s', 'format', 'jpeg', filePath, '--out', jpgPath]);
    fs.unlinkSync(filePath);
    return jpgPath;
  } catch {
    return filePath;
  }
}

function saveUploadedFile(tempPath, originalName) {
  const filename = safeUploadName(originalName);
  let dest = uniquePath(PROJECT_DIR, filename);
  fs.renameSync(tempPath, dest);
  dest = convertHeicToJpeg(dest);
  return `${PROJECT_PREFIX}/${path.basename(dest)}`;
}

module.exports = { saveUploadedFile };
