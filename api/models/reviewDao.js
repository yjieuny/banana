const { AppDataSource } = require('./dataSource');

const getReviewListAll = async () => {
  try {
    const reviewListAll = await AppDataSource.query(
      `
      SELECT
        sr.id AS reviewId,
        u.nickname AS userName,
        s.name AS storeName,
        sr.text_review AS reviewText,
        sr.video_url AS reviewVideoUrl,
        DATE_FORMAT(sr.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
      FROM store_reviews sr
      LEFT JOIN users u ON sr.user_id = u.id
      LEFT JOIN stores s ON sr.store_id = s.id
      ORDER BY sr.created_at DESC;
      `
    );

    return reviewListAll;
  } catch (error) {
    console.error('Error executing query:', error);
    const newError = new Error('dataSource Error');
    newError.status = 400;
    throw newError;
  }
};

const getReviewListDetail = async (reviewId) => {
  try {
    const reviewDetail = await AppDataSource.query(
      `
      SELECT
        sr.id AS reviewId,
        u.nickname AS userName,
        s.name AS storeName,
        sr.text_review AS reviewText,
        sr.video_url AS reviewVideoUrl,
        DATE_FORMAT(sr.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
      FROM
        store_reviews sr
      LEFT JOIN
        users u ON sr.user_id = u.id
      LEFT JOIN
        stores s ON sr.store_id = s.id
      WHERE sr.id = ?
      `,
      [reviewId]
    );

    if (reviewDetail.length === 0) {
      throw new Error(`Review with id ${reviewId} not found`);
    }

    return reviewDetail[0];
  } catch (error) {
    console.error(
      `Error in getStoreReviewListDetail for reviewId ${reviewId}:`,
      error
    );
    throw new Error('Error retrieving store review detail');
  }
};

const createStoreReview = async (userId, storeId, textReview, videoUrl) => {
  try {
    const result = await AppDataSource.query(
      `
      INSERT INTO store_reviews (user_id, store_id, text_review, video_url, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `,
      [userId, storeId, textReview, videoUrl]
    );

    return result.insertId;
  } catch (error) {
    console.error('Error in createStoreReview:', error);
    console.error('Error details:', error);
    throw new Error('Error creating store review');
  }
};

module.exports = {
  getReviewListAll,
  getReviewListDetail,
  createStoreReview,
};
