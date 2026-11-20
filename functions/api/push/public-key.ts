export interface Env {
  VAPID_PUBLIC_KEY?: string
}

export async function onRequestGet(context: { env: Env }) {
  if (!context.env.VAPID_PUBLIC_KEY) {
    return Response.json({ error: 'Push reminders are not configured.' }, { status: 503 })
  }

  return Response.json({ publicKey: context.env.VAPID_PUBLIC_KEY })
}
