const { catchAsync } = require('../utils/error');
const viewService = require('../services/storeService');

const getStoreView = catchAsync(async (req, res) => {
  const storeId = req.params.storeId;
  const store = await viewService.getStoresAndReviews(storeId);
  res.status(201).json({ data: store });
});

module.exports = { getStoreView };
