import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { user } from './auth-schema.ts'

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    tag: text('tag').notNull(),
    kind: text('kind').notNull(),
    done: integer('done', { mode: 'boolean' }).notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('tasks_user_created_idx').on(table.userId, table.createdAt)],
)

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
