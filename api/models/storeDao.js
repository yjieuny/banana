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
          store_reviews.text_review AS textReview,
          store_reviews.video_url AS videoReviewUrl,
          categories.name AS category
      FROM
          stores
      LEFT JOIN
          store_reviews ON stores.id = store_reviews.store_id
      LEFT JOIN
          categories ON stores.category_id = categories.id
      ORDER BY
          RAND();

    `);
    return allStores;
  } catch (error) {
    console.error('Error executing getAllStoresAndReviews query:', error);
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

const getAllStoresRecommendationAndReviews = async (lat, lng) => {
  try {
    const recommendedStores = await AppDataSource.query(
      `
      SELECT
          stores.id AS storeId,
          stores.name AS storeName,
          stores.opening_hours AS openingHours,
          stores.address,
          stores.lat,
          stores.lng,
          store_reviews.id AS reviewId,
          ROUND(AVG(store_reviews.rating), 1) AS rating,          
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
      GROUP BY
          stores.id, store_reviews.id, categories.id
      ORDER BY
          rating DESC,
          distance ASC
    `,
      [lng, lat]
    );

    return recommendedStores.map((store) => ({
      ...store,
      rating: store.rating ? parseFloat(store.rating) : null,
      distance: parseFloat(store.distance),
    }));
  } catch (error) {
    console.error(
      'Error executing getAllStoresRecommendationAndReviews query:',
      error
    );
    throw new Error('Error fetching recommended stores and reviews data');
  }
};

module.exports = {
  getAllStoresAndReviews,
  getAllStoresNearestAndReviews,
  getAllStoresRecommendationAndReviews,
};
