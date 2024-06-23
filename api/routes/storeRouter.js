const express = require('express');
const storeController = require('../controllers/storeController');
const storeRouter = express.Router();

storeRouter.get('/all', storeController.getStoreView);

module.exports = { storeRouter };
