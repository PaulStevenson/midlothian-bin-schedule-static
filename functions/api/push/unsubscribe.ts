export interface Env {
  DB: D1Database
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const body = await context.request.json() as { endpoint?: string }
    if (!body.endpoint) {
      return Response.json({ error: 'Endpoint is required.' }, { status: 400 })
    }

    await context.env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')
      .bind(body.endpoint)
      .run()

    return Response.json({ enabled: false })
  } catch {
    return Response.json({ error: 'Could not remove reminder subscription.' }, { status: 500 })
  }
}
