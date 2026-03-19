'use strict';
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 3000;
const strapiBin = path.join(__dirname, 'node_modules', '.bin', 'strapi');

function startStrapi() {
  console.log('Starting Strapi on port ' + PORT);
  const proc = spawn(strapiBin, ['start'], {
    cwd: __dirname, env: process.env, stdio: 'inherit'
  });
  proc.on('error', (err) => { console.error('Error:', err); process.exit(1); });
  proc.on('close', (code) => { process.exit(code); });
}

if (fs.existsSync(path.join(__dirname, 'dist'))) {
  startStrapi();
} else {
  console.log('No dist/ found — building admin panel first...');
  const placeholder = http.createServer((req, res) => {
    res.writeHead(503, { 'Retry-After': '90' });
    res.end('Starting up, please wait...');
  }).listen(PORT, () => console.log('Placeholder on port ' + PORT));

  const result = spawnSync(strapiBin, ['build'], {
    cwd: __dirname, env: process.env, stdio: 'inherit'
  });

  placeholder.close(() => {
    setTimeout(() => {
      if (result.status !== 0) { console.error('Build failed'); process.exit(1); }
      console.log('Build done, starting Strapi...');
      startStrapi();
    }, 1500);
  });
}
