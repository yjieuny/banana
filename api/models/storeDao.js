const { AppDataSource } = require('./dataSource');

const getAllStoresAndReviews = async () => {
  try {
    const allStores = await AppDataSource.query(`
      SELECT
          stores.id AS storeId,
          stores.name AS storeName,
          stores.opening_hours AS openingHours,
          stores.address,
          stores.lat,
          stores.lng,
          store_reviews.id AS reviewId,
          store_reviews.rating,
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

    return allStores;
  } catch (error) {
    console.error('Error executing getStoresAndReviews query:', error);
    throw new Error('Error fetching stores and reviews data');
  }
};

const getAllStoresNearestAndReviews = async (lat, lng) => {
  try {
    const nearestStores = await AppDataSource.query(
      `
      SELECT
          stores.id AS storeId,
          stores.name AS storeName,
          stores.opening_hours AS openingHours,
          stores.address,
          stores.lat,
          stores.lng,
          store_reviews.id AS reviewId,
          store_reviews.rating,
          store_reviews.text_review AS textReview,
          store_reviews.video_url AS videoReviewUrl,
          categories.name AS category,
          ST_Distance_Sphere(point(stores.lng, stores.lat), point(?, ?)) AS distance
      FROM
          stores
      LEFT JOIN
          store_reviews ON stores.id = store_reviews.store_id
      LEFT JOIN
          categories ON stores.category_id = categories.id
      ORDER BY
          distance ASC
    `,
      [lng, lat]
    );

    return nearestStores;
  } catch (error) {
    console.error('Error executing getAllStoresAndReviews query:', error);
    throw new Error('Error fetching stores and reviews data');
  }
};

module.exports = { getAllStoresAndReviews, getAllStoresNearestAndReviews };
