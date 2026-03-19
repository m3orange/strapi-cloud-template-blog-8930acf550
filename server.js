'use strict';
const strapi = require('@strapi/strapi');
strapi({ appDir: __dirname })
  .start()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
