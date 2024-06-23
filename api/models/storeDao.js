const { AppDataSource } = require('./dataSource');

const getStoresAndReviews = async () => {
  const query = `
        SELECT
            stores.name AS store_name,
            stores.opening_hours,
            stores.address,
            store_reviews.text_review,
            store_reviews.video_url,
            categories.name AS category_name
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
