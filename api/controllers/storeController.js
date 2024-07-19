const { catchAsync } = require('../utils/error');
const storeDao = require('../models/storeDao');

const getStoreView = catchAsync(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await storeDao.getStoresAndReviews(storeId);
  res.status(201).json({ data: store });
});

module.exports = { getStoreView };
