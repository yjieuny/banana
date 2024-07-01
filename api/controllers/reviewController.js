const { catchAsync } = require('../utils/error');
const reviewService = require('../services/reviewService');

const getReviewList = catchAsync(async (req, res) => {
  const reviewId = req.params.reviewId;
  const allReviews = await reviewService.getReviewListAll(reviewId);
  res.status(201).json({ data: allReviews });
});

const getReviewListDetail = catchAsync(async (req, res) => {
  const reviewId = req.params.reviewId;
  const review = await reviewService.getReviewListDetail(reviewId);
  res.status(201).json({ data: review });
});

//제거 예정
// const createReview = catchAsync(async (req, res) => {
//   const userId = req.user.userId;
//   const { category, title, content } = req.body;
//   const imageUrls = req.files.map((file) => file.location);
//   const thread = await reviewService.createReview(
//     userId,
//     category,
//     title,
//     content,
//     imageUrls
//   );
//   res.status(201).json({ message: 'Review created successfully', id: thread });
// });

const createReview = catchAsync(async (req, res) => {
  const { userId, storeId, textReview, videoUrl } = req.body;
  const reviewId = await reviewService.createStoreReview(
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
