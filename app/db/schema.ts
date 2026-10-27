import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    title: text('title').notNull(),
    tag: text('tag').notNull(),
    kind: text('kind').notNull(),
    done: integer('done', { mode: 'boolean' }).notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (table) => [index('tasks_owner_created_idx').on(table.ownerId, table.createdAt)],
)

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
