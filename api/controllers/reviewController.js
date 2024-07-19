const { catchAsync } = require('../utils/error');
const reviewDao = require('../models/reviewDao');

const getReviewList = catchAsync(async (req, res) => {
  const reviewId = req.params.reviewId;
  const allReviews = await reviewDao.getReviewListAll(reviewId);
  res.status(201).json({ data: allReviews });
});

const getReviewListDetail = catchAsync(async (req, res) => {
  const reviewId = req.params.reviewId;
  const review = await reviewDao.getReviewListDetail(reviewId);
  res.status(201).json({ data: review });
});

const createReview = catchAsync(async (req, res) => {
  const { userId, storeId, textReview, videoUrl } = req.body;
  const reviewId = await reviewDao.createStoreReview(
    userId,
    storeId,
    textReview,
    videoUrl
  );
  res
    .status(201)
    .json({ message: 'Review created successfully', id: reviewId });
});

module.exports = { getReviewList, getReviewListDetail, createReview };
