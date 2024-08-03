const express = require('express');
const storeController = require('../controllers/storeController');
const storeRouter = express.Router();

storeRouter.get('/all', storeController.getAllStores);
storeRouter.get('/all/nearest', storeController.getAllStoresNearest);

module.exports = { storeRouter };
