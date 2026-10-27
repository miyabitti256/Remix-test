CREATE TABLE `tasks` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text NOT NULL,
  `title` text NOT NULL,
  `tag` text NOT NULL,
  `kind` text NOT NULL,
  `done` integer NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_owner_created_idx` ON `tasks` (`owner_id`, `created_at`);
