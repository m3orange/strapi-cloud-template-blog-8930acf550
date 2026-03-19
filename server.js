'use strict';
const { spawn } = require('child_process');
const path = require('path');

process.on('uncaughtException', (err) => {
  process.stderr.write('UNCAUGHT: ' + err.stack + '\n');
  process.exit(1);
});

const strapi = spawn(
  path.join(__dirname, 'node_modules', '.bin', 'strapi'),
  ['start'],
  { cwd: __dirname, env: process.env, stdio: 'inherit' }
);

strapi.on('error', (err) => {
  console.error('Failed to start Strapi:', err);
  process.exit(1);
});

strapi.on('close', (code) => {
  console.log('Strapi exited with code', code);
  process.exit(code);
});
