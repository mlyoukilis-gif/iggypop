const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PIN_FILE = path.join(__dirname, '..', '.editor-pin');
const sessions = new Map();

function loadOrCreatePin() {
  if (process.env.EDITOR_PIN) return process.env.EDITOR_PIN.trim();
  if (fs.existsSync(PIN_FILE)) {
    return fs.readFileSync(PIN_FILE, 'utf8').trim();
  }
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  fs.writeFileSync(PIN_FILE, pin, 'utf8');
  return pin;
}

function createSession() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, Date.now());
  return token;
}

function isAuthorized(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token && sessions.has(token);
}

function authMiddleware(req, res, next) {
  if (req.path === '/api/auth' || req.path === '/api/auth/status') return next();
  if (req.path.startsWith('/api/') && !isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function registerAuthRoutes(app) {
  const pin = loadOrCreatePin();

  app.post('/api/auth', (req, res) => {
    const submitted = String(req.body?.pin || '').trim();
    if (submitted !== pin) {
      return res.status(401).json({ error: 'Wrong PIN' });
    }
    res.json({ token: createSession() });
  });

  app.get('/api/auth/status', (req, res) => {
    if (!isAuthorized(req)) return res.status(401).json({ ok: false });
    res.json({ ok: true });
  });

  return pin;
}

function getLocalIp() {
  const nets = require('os').networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

module.exports = { authMiddleware, registerAuthRoutes, getLocalIp };
