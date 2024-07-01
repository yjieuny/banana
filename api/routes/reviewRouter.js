const express = require('express');
const reviewController = require('../controllers/reviewController');
const reviewRouter = express.Router();
//const { upload } = require('../utils/aws');

reviewRouter.get('/all', reviewController.getReviewList);
reviewRouter.get('/:reviewId', reviewController.getReviewListDetail);
reviewRouter.post('/upload', reviewController.createReview);

module.exports = { reviewRouter };
