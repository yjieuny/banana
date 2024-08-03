-- migrate:up
CREATE TABLE `stores` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `opening_hours` varchar(255),
  `address` varchar(255),
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `created_at` timestamp NOT NULL
);

-- migrate:down

