-- migrate:up
CREATE TABLE `store_reviews` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_id` int NOT NULL,
  `text_review` text,
  `video_url` varchar(1024),
  `created_at` timestamp NOT NULL
);

-- migrate:down

