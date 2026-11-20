interface PushSubscriptionJSON {
  endpoint: string
  keys?: {
    p256dh: string
    auth: string
  }
}

export interface Env {
  DB: D1Database
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const body = await context.request.json() as {
      postcode?: string
      subscription?: PushSubscriptionJSON
      selectedBins?: string[]
    }

    if (body.postcode !== 'EH25 9AW' || !body.subscription?.endpoint || !body.subscription.keys?.p256dh || !body.subscription.keys?.auth) {
      return Response.json({ error: 'Invalid reminder subscription.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const id = crypto.randomUUID()

    await context.env.DB.prepare(`
      INSERT INTO push_subscriptions (
        id, endpoint, p256dh, auth, postcode, selected_bins, enabled, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        selected_bins = excluded.selected_bins,
        postcode = excluded.postcode,
        enabled = 1,
        updated_at = excluded.updated_at
    `).bind(
      id,
      body.subscription.endpoint,
      body.subscription.keys.p256dh,
      body.subscription.keys.auth,
      body.postcode,
      JSON.stringify(body.selectedBins || []),
      now,
      now,
    ).run()

    return Response.json({ enabled: true })
  } catch {
    return Response.json({ error: 'Could not save reminder subscription.' }, { status: 500 })
  }
}
