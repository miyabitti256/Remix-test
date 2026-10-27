-- Preserve the previous anonymous data for manual recovery, but never expose it to signed-in accounts.
ALTER TABLE `tasks` RENAME TO `tasks_legacy_anonymous`;
--> statement-breakpoint
CREATE TABLE `tasks` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `tag` text NOT NULL,
  `kind` text NOT NULL,
  `done` integer NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_user_created_idx` ON `tasks` (`user_id`, `created_at`);
