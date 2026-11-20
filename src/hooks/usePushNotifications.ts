import { useCallback, useEffect, useState } from 'react'

type ReminderStatus = 'unsupported' | 'denied' | 'disabled' | 'enabled' | 'loading'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)))
}

export function usePushNotifications() {
  const [status, setStatus] = useState<ReminderStatus>('loading')
  const [message, setMessage] = useState('')

  const refreshStatus = useCallback(async () => {
    if (!window.isSecureContext || !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      setMessage('Reminders are not supported by this browser.')
      return
    }

    if (Notification.permission === 'denied') {
      setStatus('denied')
      setMessage('Notifications are blocked. Enable them in browser settings.')
      return
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      setStatus('enabled')
      setMessage('Reminders are enabled for 18:00 the day before collection.')
    } else {
      setStatus('disabled')
      setMessage('Reminders are off.')
    }
  }, [])

  useEffect(() => {
    refreshStatus().catch(() => {
      setStatus('unsupported')
      setMessage('Reminder status could not be loaded.')
    })
  }, [refreshStatus])

  const enableReminders = useCallback(async () => {
    setStatus('loading')
    try {
      if (!window.isSecureContext) throw new Error('Secure HTTPS is required.')

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'disabled')
        setMessage(permission === 'denied' ? 'Notifications are blocked in browser settings.' : 'Reminder permission was not granted.')
        return
      }

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        const publicKeyResponse = await fetch('/api/push/public-key')
        if (!publicKeyResponse.ok) throw new Error('Reminder service is not configured yet.')
        const { publicKey } = await publicKeyResponse.json() as { publicKey: string }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey).buffer,
        })
      }

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: 'EH25 9AW',
          subscription: subscription.toJSON(),
          selectedBins: ['Fd', 'Gy', 'Gn', 'Bl', 'Rd', 'Br'],
        }),
      })
      if (!response.ok) throw new Error('Could not save the reminder subscription.')

      setStatus('enabled')
      setMessage('Reminders are enabled for 18:00 the day before collection.')
    } catch (error) {
      setStatus('disabled')
      setMessage(error instanceof Error ? error.message : 'Could not enable reminders.')
    }
  }, [])

  const disableReminders = useCallback(async () => {
    setStatus('loading')
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        await subscription.unsubscribe()
      }
      setStatus('disabled')
      setMessage('Reminders are off.')
    } catch (error) {
      setStatus('disabled')
      setMessage(error instanceof Error ? error.message : 'Could not disable reminders.')
    }
  }, [])

  return { status, message, enableReminders, disableReminders }
}
