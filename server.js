'use strict';
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hostinger is working on port ' + PORT);
}).listen(PORT, () => {
  console.log('Test server running on port ' + PORT);
});
