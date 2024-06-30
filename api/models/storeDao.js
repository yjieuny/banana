const { AppDataSource } = require('./dataSource');

const getStoresAndReviews = async () => {
  const query = `
        SELECT
            stores.id AS storeId,
            stores.name AS storeName,
            stores.opening_hours AS openingHours,
            stores.address,
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
    `;

  const result = await AppDataSource.query(query);
  return result;
};

module.exports = { getStoresAndReviews };
