const storeDao = require('../models/storeDao');

const getStoresAndReviews = async (reviewId) => {
  return await storeDao.getStoresAndReviews(reviewId);
};

module.exports = { getStoresAndReviews };
