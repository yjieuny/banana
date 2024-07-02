const { AppDataSource } = require('./dataSource');

const getStoresAndReviews = async () => {
  try {
    const storesAndReviews = await AppDataSource.query(`
      SELECT
          stores.id AS storeId,
          stores.name AS storeName,
          stores.opening_hours AS openingHours,
          stores.address,
          stores.lat,
          stores.lng,
          store_reviews.id AS reviewId,
          store_reviews.text_review AS textReview,
          store_reviews.video_url AS videoReviewUrl,
          categories.name AS category
      FROM
          stores
      LEFT JOIN
          store_reviews ON stores.id = store_reviews.store_id
      LEFT JOIN
          categories ON stores.category_id = categories.id;
    `);

    return storesAndReviews;
  } catch (error) {
    console.error('Error executing getStoresAndReviews query:', error);
    throw new Error('Error fetching stores and reviews data');
  }
};

module.exports = { getStoresAndReviews };
