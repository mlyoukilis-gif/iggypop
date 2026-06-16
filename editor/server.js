const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authMiddleware, registerAuthRoutes, getLocalIp } = require('./auth');
const {
  PROJECT_DIR,
  DEFAULT_FILE,
  PROJECT_PREFIX,
  resolveSitePath,
  listSiteFiles,
} = require('./paths');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
const pin = registerAuthRoutes(app);

app.use(authMiddleware);
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(`/${PROJECT_PREFIX}`, express.static(PROJECT_DIR));
app.use('/', express.static(PROJECT_DIR));

app.get('/api/files', (req, res) => {
  try {
    res.json(listSiteFiles());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/file', (req, res) => {
  const file = req.query.path;
  if (!file) return res.status(400).json({ error: 'missing path' });
  try {
    const safePath = resolveSitePath(file);
    fs.readFile(safePath, 'utf8', (err, data) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ content: data });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/file', (req, res) => {
  const { path: p, content } = req.body;
  if (!p) return res.status(400).json({ error: 'missing path' });
  try {
    const safePath = resolveSitePath(p);
    fs.writeFile(safePath, content || '', 'utf8', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ok: true });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const upload = multer({ dest: path.join(PROJECT_DIR, 'uploads') });
const { saveUploadedFile } = require('./upload');

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  try {
    const filename = saveUploadedFile(req.file.path, req.file.originalname);
    res.json({ ok: true, filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/preview', (req, res) => {
  const file = req.query.file || DEFAULT_FILE;
  try {
    const safePath = resolveSitePath(file);
    res.sendFile(safePath);
  } catch (err) {
    res.status(400).send('Invalid file');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mobile.html'));
});

const localIp = getLocalIp();

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('📱 IggyPop Mobile Editor');
  console.log('────────────────────────');
  console.log(`Site file:       ${DEFAULT_FILE}`);
  console.log(`On this Mac:     http://localhost:${PORT}`);
  console.log(`On your phone:   http://${localIp}:${PORT}`);
  console.log(`PIN:             ${pin}`);
  console.log('');
  console.log('Make sure your phone is on the same Wi‑Fi network.');
  console.log('Press Ctrl+C to stop.');
  console.log('');
});
