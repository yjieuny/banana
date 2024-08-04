const { catchAsync } = require('../utils/error');
const storeDao = require('../models/storeDao');

const getAllStores = catchAsync(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await storeDao.getAllStoresAndReviews(storeId);
  res.status(200).json({ data: store });
});

const getAllStoresNearest = catchAsync(async (req, res) => {
  const lat = req.header('Latitude');
  const lng = req.header('Longitude');

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: 'Latitude and longitude are required in headers' });
  }

  const stores = await storeDao.getAllStoresNearestAndReviews(
    parseFloat(lat),
    parseFloat(lng)
  );
  res.status(200).json({ data: stores });
});

const getAllStoresRecommendation = catchAsync(async (req, res) => {
  const lat = req.header('Latitude');
  const lng = req.header('Longitude');

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: 'Latitude and longitude are required in headers' });
  }

  const stores = await storeDao.getAllStoresRecommendationAndReviews(
    parseFloat(lat),
    parseFloat(lng)
  );
  res.status(200).json({ data: stores });
});

module.exports = {
  getAllStores,
  getAllStoresNearest,
  getAllStoresRecommendation,
};
