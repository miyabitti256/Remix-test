import { createContextKey, type Middleware } from 'remix/router'

export interface WorkerEnv {
  DB: D1Database
}

export const d1BindingKey = createContextKey<D1Database>()
export const visitorIdKey = createContextKey<string>()

type RequestBindings = readonly [
  { key: typeof d1BindingKey; value: D1Database },
  { key: typeof visitorIdKey; value: string },
]

const VISITOR_COOKIE = 'mori_visitor'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function bindRequestContext(env: WorkerEnv): Middleware<RequestBindings> {
  return async (context, next) => {
    const cookieHeader = context.request.headers.get('Cookie') ?? ''
    const match = cookieHeader.match(/(?:^|;\s*)mori_visitor=([^;]+)/)
    const cookieValue = match?.[1]
    const hasValidCookie = cookieValue != null && UUID_PATTERN.test(cookieValue)
    const visitorId = hasValidCookie ? cookieValue : crypto.randomUUID()

    context.set(d1BindingKey, env.DB)
    context.set(visitorIdKey, visitorId)

    const response = await next()
    if (hasValidCookie) return response

    const headers = new Headers(response.headers)
    const secure = context.url.protocol === 'https:' ? '; Secure' : ''
    headers.append(
      'Set-Cookie',
      VISITOR_COOKIE + '=' + visitorId + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000' + secure,
    )

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}
