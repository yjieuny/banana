const express = require('express');
const reviewController = require('../controllers/reviewController');
const reviewRouter = express.Router();
const { upload } = require('../utils/aws');

// const multer = require('multer');
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// const bucketName = process.env.BUCKET_NAME;
// const bucketRegion = process.env.BUCKET_REGION;
// const accessKey = process.env.ACCESS_KEY;
// const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: accessKey,
//     secretAccessKey: secretAccessKey,
//   },
//   region: bucketRegion,
// });

reviewRouter.get('/all', reviewController.getReviewList);
reviewRouter.get('/:reviewId', reviewController.getReviewListDetail);
reviewRouter.post(
  '/upload',
  upload.array('selectedFile'),
  reviewController.createReview
);

module.exports = { reviewRouter };

//postRouter.post('/posts/upload', loginRequired, upload.array('selectedFile'), postController.postCommunity);

// reviewRouter.post(
//   '/upload',
//   upload.single('video'),
//   reviewController.createReview,
//   async (req, res) => {
//     console.log('req.body', req.body);
//     console.log('req.file', req.file);

//     req.file.buffer;

//     const params = {
//       Bucket: bucketName,
//       Key: req.file.originalname,
//       Body: req.file.buffer,
//       ContentType: req.file.mimetype,
//     };
//     const command = new PutObjectCommand({ params });

//     await s3.send(command);

//     res.send({});
//   }
// );
