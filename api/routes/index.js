const express = require('express');
const { storeRouter } = require('./storeRouter');
const { reviewRouter } = require('./reviewRouter');

const routes = express.Router();

routes.use('/stores', storeRouter);
routes.use('/reviews', reviewRouter);

module.exports = { routes };
