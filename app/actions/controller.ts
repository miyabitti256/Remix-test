import { and, desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { createController } from 'remix/router'

import { d1BindingKey, visitorIdKey } from '../db.ts'
import { tasks } from '../db/schema.ts'
import { routes } from '../routes.ts'
import { renderHomePage } from './home.ts'

const noStore = { 'Cache-Control': 'no-store' }

function clientTask(task: typeof tasks.$inferSelect) {
  return {
    id: task.id,
    title: task.title,
    tag: task.tag,
    kind: task.kind,
    done: task.done,
    createdAt: task.createdAt,
  }
}

function dbFor(context: { get: (key: typeof d1BindingKey) => D1Database | undefined }) {
  const binding = context.get(d1BindingKey)
  if (!binding) throw new Error('Missing D1 database binding')
  return drizzle(binding, { schema: { tasks } })
}

function ownerFor(context: { get: (key: typeof visitorIdKey) => string | undefined }) {
  const ownerId = context.get(visitorIdKey)
  if (!ownerId) throw new Error('Missing anonymous visitor identity')
  return ownerId
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: noStore })
}

export default createController(routes, {
  actions: {
    home() {
      return renderHomePage()
    },

    health() {
      return Response.json({ status: 'ok' }, { headers: noStore })
    },

    async tasksIndex(context) {
      const db = dbFor(context)
      const ownerId = ownerFor(context)
      const rows = await db
        .select()
        .from(tasks)
        .where(eq(tasks.ownerId, ownerId))
        .orderBy(desc(tasks.createdAt))
        .all()

      return Response.json(rows.map(clientTask), { headers: noStore })
    },

    async tasksCreate(context) {
      let payload: unknown
      try {
        payload = await context.request.json()
      } catch {
        return jsonError('リクエストのJSONを読み取れませんでした。', 400)
      }

      const title =
        typeof payload === 'object' && payload !== null && 'title' in payload
          ? payload.title
          : undefined

      if (typeof title !== 'string' || title.trim().length === 0) {
        return jsonError('タスク名を入力してください。', 400)
      }

      const db = dbFor(context)
      const task = {
        id: crypto.randomUUID(),
        ownerId: ownerFor(context),
        title: title.trim().slice(0, 120),
        tag: '新しいタスク',
        kind: 'work',
        done: false,
        createdAt: Date.now(),
      }

      await db.insert(tasks).values(task).run()
      return Response.json(clientTask(task), { status: 201, headers: noStore })
    },

    async taskToggle(context) {
      const db = dbFor(context)
      const ownerId = ownerFor(context)
      const row = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.ownerId, ownerId), eq(tasks.id, context.params.id)))
        .limit(1)
        .all()
      const task = row[0]

      if (!task) return jsonError('タスクが見つかりません。', 404)

      await db
        .update(tasks)
        .set({ done: !task.done })
        .where(and(eq(tasks.ownerId, ownerId), eq(tasks.id, task.id)))
        .run()

      return Response.json({ ok: true, done: !task.done }, { headers: noStore })
    },

    async taskDelete(context) {
      const db = dbFor(context)
      const ownerId = ownerFor(context)
      await db
        .delete(tasks)
        .where(and(eq(tasks.ownerId, ownerId), eq(tasks.id, context.params.id)))
        .run()

      return Response.json({ ok: true }, { headers: noStore })
    },

    async tasksClearCompleted(context) {
      const db = dbFor(context)
      const ownerId = ownerFor(context)
      await db
        .delete(tasks)
        .where(and(eq(tasks.ownerId, ownerId), eq(tasks.done, true)))
        .run()

      return Response.json({ ok: true }, { headers: noStore })
    },
  },
})
