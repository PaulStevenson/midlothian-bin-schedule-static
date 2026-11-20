import { Bell, BellOff, LoaderCircle } from 'lucide-react'

export type ReminderStatus = 'unsupported' | 'denied' | 'disabled' | 'enabled' | 'loading'

export function ReminderCard({
  status,
  message,
  onEnable,
  onDisable,
}: {
  status: ReminderStatus
  message: string
  onEnable: () => void
  onDisable: () => void
}) {
  const enabled = status === 'enabled'

  return (
    <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-lg p-2 ${enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
          {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Collection reminders</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600">
            {message || 'Optional reminders are sent at 18:00 the day before collection.'}
          </p>
        </div>
      </div>

      {status !== 'unsupported' && status !== 'denied' && (
        <button
          type="button"
          onClick={enabled ? onDisable : onEnable}
          disabled={status === 'loading'}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${
            enabled
              ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {status === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {enabled ? 'Turn off reminders' : 'Enable reminders'}
        </button>
      )}

      {status === 'denied' && (
        <span className="text-xs font-semibold text-amber-700">Change notification permission in browser settings</span>
      )}
    </section>
  )
}
