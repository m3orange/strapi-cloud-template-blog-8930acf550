'use strict';
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 3000;
const strapiBin = path.join(__dirname, 'node_modules', '.bin', 'strapi');

function runStrapi(args) {
  // Resolve symlink to actual JS file, run with Node directly (bypasses shebang issues)
  let bin = strapiBin;
  try { bin = fs.realpathSync(strapiBin); } catch(e) {}
  return { bin, args };
}

function startStrapi() {
  console.log('Starting Strapi on port ' + PORT);
  const { bin, args } = runStrapi(['start']);
  const proc = spawn(process.execPath, [bin, ...args], {
    cwd: __dirname, env: process.env, stdio: 'inherit'
  });
  proc.on('error', (err) => { console.error('Start error:', err.message); process.exit(1); });
  proc.on('close', (code) => { process.exit(code); });
}

if (fs.existsSync(path.join(__dirname, 'dist'))) {
  startStrapi();
} else {
  console.log('No dist/ found — building admin panel...');
  const placeholder = http.createServer((req, res) => {
    res.writeHead(503, { 'Retry-After': '90' });
    res.end('Starting up, please wait...');
  }).listen(PORT, () => console.log('Placeholder on port ' + PORT));

  const { bin } = runStrapi([]);
  console.log('Running build via:', process.execPath, bin);
  const result = spawnSync(process.execPath, [bin, 'build'], {
    cwd: __dirname, env: process.env, stdio: 'inherit'
  });
  console.log('Build exit status:', result.status, '| error:', result.error ? result.error.message : 'none');

  placeholder.close(() => {
    setTimeout(() => {
      if (result.status !== 0) { console.error('Build failed'); process.exit(1); }
      startStrapi();
    }, 1500);
  });
}
