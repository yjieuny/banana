const reviewDao = require('../models/reviewDao');

const getReviewListAll = async () => {
  return await reviewDao.getReviewListAll();
};

const getReviewListDetail = async (reviewId) => {
  return await reviewDao.getReviewListDetail(reviewId);
};

const createStoreReview = async (userId, storeId, textReview, videoUrl) => {
  return await reviewDao.createStoreReview(
    userId,
    storeId,
    textReview,
    videoUrl
  );
};

module.exports = {
  getReviewListAll,
  getReviewListDetail,
  createStoreReview,
};
