import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const problemProgress = sqliteTable('problem_progress', {
  questionId: integer('question_id').primaryKey(),
  solved: integer('solved', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
