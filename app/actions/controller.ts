import { and, desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { createController } from 'remix/router'

import { d1BindingKey, userIdKey } from '../db.ts'
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

function userFor(context: { get: (key: typeof userIdKey) => string | null | undefined }) {
  return context.get(userIdKey) ?? null
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: noStore })
}

function ensureSameOrigin(context: { url: URL; request: Request }) {
  const origin = context.request.headers.get('Origin')
  return origin == null || origin === context.url.origin
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
      const userId = userFor(context)
      if (!userId) return jsonError('ログインしてください。', 401)

      const rows = await dbFor(context)
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt))
        .all()

      return Response.json(rows.map(clientTask), { headers: noStore })
    },

    async tasksCreate(context) {
      const userId = userFor(context)
      if (!userId) return jsonError('ログインしてください。', 401)
      if (!ensureSameOrigin(context)) return jsonError('不正なリクエストです。', 403)

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

      const task = {
        id: crypto.randomUUID(),
        userId,
        title: title.trim().slice(0, 120),
        tag: '新しいタスク',
        kind: 'work',
        done: false,
        createdAt: Date.now(),
      }

      await dbFor(context).insert(tasks).values(task).run()
      return Response.json(clientTask({ ...task }), { status: 201, headers: noStore })
    },

    async taskToggle(context) {
      const userId = userFor(context)
      if (!userId) return jsonError('ログインしてください。', 401)
      if (!ensureSameOrigin(context)) return jsonError('不正なリクエストです。', 403)

      const db = dbFor(context)
      const row = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.id, context.params.id)))
        .limit(1)
        .all()
      const task = row[0]
      if (!task) return jsonError('タスクが見つかりません。', 404)

      await db
        .update(tasks)
        .set({ done: !task.done })
        .where(and(eq(tasks.userId, userId), eq(tasks.id, task.id)))
        .run()

      return Response.json({ ok: true, done: !task.done }, { headers: noStore })
    },

    async taskDelete(context) {
      const userId = userFor(context)
      if (!userId) return jsonError('ログインしてください。', 401)
      if (!ensureSameOrigin(context)) return jsonError('不正なリクエストです。', 403)

      await dbFor(context)
        .delete(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.id, context.params.id)))
        .run()

      return Response.json({ ok: true }, { headers: noStore })
    },

    async tasksClearCompleted(context) {
      const userId = userFor(context)
      if (!userId) return jsonError('ログインしてください。', 401)
      if (!ensureSameOrigin(context)) return jsonError('不正なリクエストです。', 403)

      await dbFor(context)
        .delete(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.done, true)))
        .run()

      return Response.json({ ok: true }, { headers: noStore })
    },
  },
})
