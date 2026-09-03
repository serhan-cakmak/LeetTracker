CREATE TABLE `problem_progress` (
	`question_id` integer PRIMARY KEY NOT NULL,
	`solved` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
