const storeDao = require('../models/storeDao');

const getStoresAndReviews = async (postId) => {
  return await storeDao.getStoresAndReviews(postId);
};

module.exports = { getStoresAndReviews };
