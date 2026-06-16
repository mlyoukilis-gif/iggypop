const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const SITE_ROOT = path.resolve(PROJECT_DIR, '..');
const DEFAULT_FILE = 'Iggypop.html';
const PROJECT_PREFIX = 'Iggypop 2';

const ALLOWED_EXTENSIONS = new Set([
  '.html', '.css', '.js', '.txt', '.md',
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.heic', '.heif',
]);

function resolveSitePath(relativePath) {
  const rel = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!rel) throw new Error('missing path');

  if (rel === DEFAULT_FILE) {
    return path.join(SITE_ROOT, DEFAULT_FILE);
  }

  if (rel.startsWith(`${PROJECT_PREFIX}/`)) {
    const inner = rel.slice(PROJECT_PREFIX.length + 1);
    const safePath = path.resolve(PROJECT_DIR, inner);
    if (!safePath.startsWith(PROJECT_DIR)) throw new Error('invalid path');
    return safePath;
  }

  const safePath = path.resolve(PROJECT_DIR, rel);
  if (!safePath.startsWith(PROJECT_DIR)) throw new Error('invalid path');
  if (path.basename(safePath).startsWith('.')) throw new Error('invalid path');
  return safePath;
}

function listSiteFiles() {
  const files = [];
  const mainFile = path.join(SITE_ROOT, DEFAULT_FILE);
  if (fs.existsSync(mainFile)) files.push(DEFAULT_FILE);

  for (const name of fs.readdirSync(PROJECT_DIR)) {
    if (name.startsWith('.')) continue;
    const full = path.join(PROJECT_DIR, name);
    if (!fs.statSync(full).isFile()) continue;
    if (!ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase())) continue;
    files.push(`${PROJECT_PREFIX}/${name}`);
  }

  return files.sort();
}

module.exports = {
  PROJECT_DIR,
  SITE_ROOT,
  DEFAULT_FILE,
  PROJECT_PREFIX,
  resolveSitePath,
  listSiteFiles,
};
