'use strict';
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 3000;

function resolvedBin(name) {
  const bin = path.join(__dirname, 'node_modules', '.bin', name);
  try { return fs.realpathSync(bin); } catch(e) { return bin; }
}

function fixPermissions() {
  const bins = [
    path.join(__dirname, 'node_modules', '@esbuild', 'linux-x64', 'bin', 'esbuild'),
    resolvedBin('strapi'),
  ];
  bins.forEach(b => {
    if (fs.existsSync(b)) {
      try { fs.chmodSync(b, '755'); console.log('chmod 755:', b); }
      catch(e) { console.log('chmod failed:', b, e.message); }
    }
  });
}

function startStrapi() {
  console.log('Starting Strapi on port ' + PORT);
  const bin = resolvedBin('strapi');
  const proc = spawn(process.execPath, [bin, 'start'], {
    cwd: __dirname, env: process.env, stdio: ['inherit', 'inherit', 'pipe']
  });

  let stderrBuf = '';
  proc.stderr.on('data', d => {
    stderrBuf += d.toString();
    process.stderr.write(d);
  });

  proc.on('error', (err) => { console.error('Spawn error:', err.message); process.exit(1); });
  proc.on('close', (code, signal) => {
    console.error('Strapi exited — code:', code, '| signal:', signal);
    if (stderrBuf) console.error('stderr:', stderrBuf.slice(-1000));
    process.exit(1);
  });
}

fixPermissions();

if (fs.existsSync(path.join(__dirname, 'dist'))) {
  startStrapi();
} else {
  console.log('No dist/ found — building admin panel...');
  const placeholder = http.createServer((req, res) => {
    res.writeHead(503, { 'Retry-After': '90' });
    res.end('Starting up, please wait...');
  }).listen(PORT, () => console.log('Placeholder on port ' + PORT));

  const bin = resolvedBin('strapi');
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
