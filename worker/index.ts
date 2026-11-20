import webpush from 'web-push'
import scheduleData from '../src/data/schedule-data.json'

interface Env {
  DB: D1Database
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  VAPID_SUBJECT: string
}

interface SubscriptionRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  selected_bins: string
}

type MonthData = {
  year: number
  monthIndex: number
  collections: Record<string, string[]>
}

function londonParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  }
}

function tomorrowParts(now: Date) {
  const shifted = new Date(now)
  shifted.setUTCDate(shifted.getUTCDate() + 1)
  const london = londonParts(shifted)
  return london
}

export default {
  async scheduled(_controller: ScheduledController, env: Env) {
    const now = new Date()
    const local = londonParts(now)

    if (local.hour !== 18 || local.minute >= 15) return

    const tomorrow = tomorrowParts(now)
    const month = (scheduleData as unknown as MonthData[]).find(
      (item) => item.year === tomorrow.year && item.monthIndex === tomorrow.month - 1,
    )
    const binKeys = month?.collections[String(tomorrow.day)] || []
    if (binKeys.length === 0) return

    webpush.setVapidDetails(
      env.VAPID_SUBJECT || 'mailto:admin@example.com',
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY,
    )

    const result = await env.DB.prepare(`
      SELECT id, endpoint, p256dh, auth, selected_bins
      FROM push_subscriptions
      WHERE enabled = 1 AND postcode = 'EH25 9AW'
    `).all<SubscriptionRow>()

    for (const row of result.results || []) {
      let selectedBins: string[] = []
      try {
        selectedBins = JSON.parse(row.selected_bins)
      } catch {
        selectedBins = []
      }

      const binsToNotify = binKeys.filter((key) => selectedBins.length === 0 || selectedBins.includes(key))
      if (binsToNotify.length === 0) continue

      const collectionDate = `${tomorrow.year}-${String(tomorrow.month).padStart(2, '0')}-${String(tomorrow.day).padStart(2, '0')}`
      const existing = await env.DB.prepare(`
        SELECT 1 FROM reminder_deliveries
        WHERE subscription_id = ? AND collection_date = ?
      `).bind(row.id, collectionDate).first()
      if (existing) continue

      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          JSON.stringify({
            title: 'Bin collection tomorrow',
            body: `${binsToNotify.join(', ')} ${binsToNotify.length === 1 ? 'bin' : 'bins'} need to go out.`,
            url: '/',
          }),
        )

        await env.DB.prepare(`
          INSERT OR REPLACE INTO reminder_deliveries
            (subscription_id, collection_date, bin_keys, delivered_at)
          VALUES (?, ?, ?, ?)
        `).bind(row.id, collectionDate, JSON.stringify(binsToNotify), now.toISOString()).run()

        await env.DB.prepare(`
          UPDATE push_subscriptions SET last_delivery_at = ?, updated_at = ? WHERE id = ?
        `).bind(now.toISOString(), now.toISOString(), row.id).run()
      } catch (error) {
        const status = typeof error === 'object' && error && 'statusCode' in error
          ? Number((error as { statusCode: number }).statusCode)
          : 0
        if (status === 410 || status === 404) {
          await env.DB.prepare('DELETE FROM push_subscriptions WHERE id = ?').bind(row.id).run()
        }
      }
    }
  },
}
