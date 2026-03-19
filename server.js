'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Gather diagnostic info
const strapiBin = path.join(__dirname, 'node_modules', '.bin', 'strapi');
const distDir = path.join(__dirname, 'dist');

const info = {
  port: PORT,
  nodeVersion: process.version,
  cwd: process.cwd(),
  dirname: __dirname,
  strapiBinExists: fs.existsSync(strapiBin),
  distExists: fs.existsSync(distDir),
  distContents: fs.existsSync(distDir) ? fs.readdirSync(distDir) : 'NOT FOUND',
  envVars: Object.keys(process.env)
    .filter(k => k.startsWith('DATABASE') || ['PORT','NODE_ENV','HOST'].includes(k))
    .reduce((a, k) => ({ ...a, [k]: process.env[k] }), {})
};

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(info, null, 2));
}).listen(PORT, () => console.log('Debug server on port ' + PORT));
