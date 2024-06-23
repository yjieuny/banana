const express = require('express');
const { storeRouter } = require('./storeRouter');

const routes = express.Router();

routes.use('/stores', storeRouter);

module.exports = { routes };
