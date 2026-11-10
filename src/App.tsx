import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Trash2,
  Calendar as CalendarIcon,
  Info,
  Printer,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Download,
} from 'lucide-react'
import binsConfigData from './data/bins-config.json'
import scheduleData from './data/schedule-data.json'

type BinKey = 'Fd' | 'Gy' | 'Gn' | 'Bl' | 'Rd' | 'Br'

type BinConfig = {
  id: BinKey
  name: string
  fullName: string
  color: string
  badgeClass: string
  frequency: string
  summary: string
  acceptedItems: string[]
  rejectedItems: string[]
}

type MonthData = {
  month: string
  year: number
  monthIndex: number
  days: number
  startDay: number
  collections: Record<string, BinKey[]>
}

type NextCollection = {
  date?: Date
  formatted: string
  daysLeft: number | null
  isToday?: boolean
  isTomorrow?: boolean
}

type UpcomingCollection = { binKey: BinKey } & NextCollection

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export const BINS_CONFIG: Record<BinKey, BinConfig> =
  binsConfigData as unknown as Record<BinKey, BinConfig>

export const CALENDAR_DATA: MonthData[] = scheduleData as unknown as MonthData[]

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function calculateNextCollections(nowDate: Date): Record<BinKey, NextCollection> {
  const today = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
  )
  const results = {} as Record<BinKey, NextCollection>

  for (const binKey of Object.keys(BINS_CONFIG) as BinKey[]) {
    let earliestDate: Date | null = null

    for (const monthData of CALENDAR_DATA) {
      for (const [dayStr, bins] of Object.entries(monthData.collections)) {
        if (bins.includes(binKey)) {
          const dayNum = Number.parseInt(dayStr, 10)
          const candidateDate = new Date(monthData.year, monthData.monthIndex, dayNum)

          if (candidateDate >= today) {
            if (!earliestDate || candidateDate < earliestDate) {
              earliestDate = candidateDate
            }
          }
        }
      }
    }

    if (earliestDate) {
      const diffTime = earliestDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const formattedDate = `${DAY_NAMES[earliestDate.getDay()]} ${String(earliestDate.getDate()).padStart(2, '0')}/${String(earliestDate.getMonth() + 1).padStart(2, '0')}/${earliestDate.getFullYear()}`

      results[binKey] = {
        date: earliestDate,
        formatted: formattedDate,
        daysLeft: diffDays,
        isToday: diffDays === 0,
        isTomorrow: diffDays === 1,
      }
    } else {
      results[binKey] = { formatted: 'No upcoming dates', daysLeft: null }
    }
  }

  return results
}

export function getUpcomingHighlight(
  nextCollectionsMap: Record<BinKey, NextCollection>,
): UpcomingCollection | null {
  let nearest: UpcomingCollection | null = null
  for (const [binKey, data] of Object.entries(nextCollectionsMap) as [BinKey, NextCollection][]) {
    if (data.date && (!nearest || data.date < nearest.date!)) {
      nearest = { binKey, ...data }
    }
  }
  return nearest
}

function useClock(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}

function usePWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [showInstallBanner, setShowInstallBanner] = useState(true)

  useEffect(() => {
    const manifestObj = {
      name: 'Midlothian Bin Schedule',
      short_name: 'Bin Schedule',
      description: 'Kerbside Bin Collection Guide & Calendar for EH25 9AW',
      start_url: './',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#0f172a',
      icons: [
        {
          src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2315803d'/><text y='65' x='50' text-anchor='middle' font-size='50' fill='white'>🗑️</text></svg>",
          sizes: '192x192 512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
    }

    const blob = new Blob([JSON.stringify(manifestObj)], {
      type: 'application/json',
    })
    const manifestURL = URL.createObjectURL(blob)
    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    manifestLink.href = manifestURL

    if ('serviceWorker' in navigator) {
      const swCode = `
        const CACHE_NAME = 'bin-schedule-v2';
        self.addEventListener('install', (e) => {
          e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(['./'])));
          self.skipWaiting();
        });
        self.addEventListener('fetch', (e) => {
          e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
        });
      `
      const swBlob = new Blob([swCode], { type: 'application/javascript' })
      navigator.serviceWorker.register(URL.createObjectURL(swBlob)).catch(() => {})
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const triggerInstall = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null)
        setShowInstallBanner(false)
      })
    } else {
      alert(
        "To install this app on your Android device:\n1. Open your browser menu (⋮ three dots)\n2. Tap 'Add to Home screen' or 'Install app'",
      )
    }
  }, [deferredPrompt])

  const dismissBanner = useCallback(() => setShowInstallBanner(false), [])

  return { showInstallBanner, triggerInstall, dismissBanner }
}

function AppHeader({ onInstall, onPrint }: { onInstall: () => void; onPrint: () => void }) {
  return (
    <header className="bg-slate-900 text-white shadow-md print:bg-white print:text-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-green-400">
              <Trash2 className="h-4 w-4" /> Midlothian Council Kerbside Service
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Bin Collection Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-400 print:text-slate-600">
              Postcode:{' '}
              <span className="font-semibold text-slate-200 print:text-black">EH25 9AW</span>{' '}
              | Schedule valid: Nov 2026 - Oct 2027
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={onInstall}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <Download className="h-4 w-4" /> Install App
            </button>
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 shadow-sm transition hover:bg-slate-700"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function InstallBanner({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <div className="border-b border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs sm:flex-row sm:text-sm">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 shrink-0 text-green-400" />
          <span>
            <strong>Install on Mobile:</strong> Tap <strong>Install App</strong> or open
            Chrome menu (<strong>⋮</strong>) and select <strong>Add to Home screen</strong>.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onInstall}
            className="rounded bg-green-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-green-700"
          >
            Install
          </button>
          <button
            onClick={onDismiss}
            className="shrink-0 text-xs text-slate-400 underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

function UpcomingHighlightCard({ collection }: { collection: UpcomingCollection | null }) {
  if (!collection || !collection.binKey) return null
  const config = BINS_CONFIG[collection.binKey]

  return (
    <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl print:hidden">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400">
            <Sparkles className="h-4 w-4" /> Next Upcoming Collection
          </div>
          <h2 className="flex items-center gap-3 text-2xl font-black sm:text-3xl">
            <span>{config?.name}</span>
            <span className={`rounded px-2.5 py-1 text-xs font-bold ${config?.badgeClass}`}>
              {collection.binKey}
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-300">{config?.summary}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-4 backdrop-blur-sm">
          <CalendarIcon className="h-8 w-8 text-green-400" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Collection Date
            </div>
            <div className="text-lg font-extrabold text-white">{collection.formatted}</div>
            <div className="mt-0.5 text-xs font-semibold text-green-400">
              {collection.isToday
                ? 'Put out bin today!'
                : collection.isTomorrow
                  ? 'Put out bin tomorrow night!'
                  : `In ${collection.daysLeft} days`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterBar({
  selectedFilter,
  onSelectFilter,
}: {
  selectedFilter: 'ALL' | BinKey
  onSelectFilter: (value: 'ALL' | BinKey) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Filter className="h-3 w-3" /> Filter:
      </span>
      <button
        onClick={() => onSelectFilter('ALL')}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          selectedFilter === 'ALL'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        All Bins
      </button>
      {Object.entries(BINS_CONFIG).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onSelectFilter(key as BinKey)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            selectedFilter === key
              ? 'bg-slate-900 text-white shadow-sm'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }}></span>
          {config.name}
        </button>
      ))}
    </div>
  )
}

function CalendarGrid({ filterBin, now }: { filterBin: 'ALL' | BinKey; now: Date }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <CalendarIcon className="h-5 w-5 text-slate-600" />
          Collection Calendar (Nov 2026 - Oct 2027)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CALENDAR_DATA.map((monthData, idx) => (
          <div
            key={idx}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid"
          >
            <div className="bg-slate-800 px-3 py-2 text-center text-sm font-bold text-white">
              {monthData.month}
            </div>

            <div className="flex-grow p-2">
              <table className="w-full table-fixed border-collapse text-center">
                <thead>
                  <tr>
                    {WEEKDAY_LABELS.map((d) => (
                      <th
                        key={d}
                        className="border-b border-slate-100 py-1 text-[10px] font-bold uppercase text-slate-400"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({
                    length: Math.ceil((monthData.startDay + monthData.days) / 7),
                  }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 7 }).map((__, colIndex) => {
                        const cellIndex = rowIndex * 7 + colIndex
                        const dayNum = cellIndex - monthData.startDay + 1
                        const isValidDay = dayNum > 0 && dayNum <= monthData.days
                        const collectionBins = isValidDay
                          ? (monthData.collections[String(dayNum)] || [])
                          : []

                        const isToday =
                          isValidDay &&
                          now.getFullYear() === monthData.year &&
                          now.getMonth() === monthData.monthIndex &&
                          now.getDate() === dayNum

                        return (
                          <td
                            key={colIndex}
                            className={`h-11 border border-slate-50 p-0.5 text-center align-top transition ${
                              isToday
                                ? 'rounded-sm border-2 border-amber-500 bg-amber-100/80 font-bold'
                                : ''
                            }`}
                          >
                            {isValidDay && (
                              <div className="flex h-full flex-col justify-between">
                                <span
                                  className={`text-[10px] ${
                                    isToday ? 'font-extrabold text-amber-900' : 'text-slate-500'
                                  }`}
                                >
                                  {dayNum}
                                </span>
                                <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                                  {collectionBins.map((binKey) => {
                                    const config = BINS_CONFIG[binKey]
                                    const isDimmed = filterBin !== 'ALL' && filterBin !== binKey
                                    return (
                                      <span
                                        key={binKey}
                                        title={`${config?.name} collection`}
                                        className={`rounded px-1 text-[9px] font-black tracking-tight text-white ${
                                          isDimmed ? 'opacity-20' : 'opacity-100'
                                        }`}
                                        style={{ backgroundColor: config?.color || '#333' }}
                                      >
                                        {binKey}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BinSummaries({
  nextCollectionsMap,
  onInspectGuide,
}: {
  nextCollectionsMap: Record<BinKey, NextCollection>
  onInspectGuide: () => void
}) {
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <Trash2 className="h-5 w-5 text-slate-600" /> Bin Summaries &amp; Collection Frequencies
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(BINS_CONFIG).map(([key, config]) => {
          const nextData = nextCollectionsMap[key as BinKey]
          return (
            <div
              key={key}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="h-3 w-full" style={{ backgroundColor: config.color }}></div>

                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{config.name}</h3>
                    <span className={`rounded px-2.5 py-1 text-xs font-bold ${config.badgeClass}`}>
                      {config.id}
                    </span>
                  </div>

                  <p className="mb-4 text-sm leading-relaxed text-slate-600">{config.summary}</p>

                  <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">Frequency:</span>
                      <span className="font-bold text-slate-800">{config.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                      <span className="font-medium text-slate-500">Next Collection:</span>
                      <span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-bold text-slate-900">
                        {nextData?.formatted || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
                <span className="text-xs font-semibold text-slate-500">EH25 9AW Kerbside</span>
                <button
                  onClick={onInspectGuide}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900"
                >
                  What goes inside? <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecyclingGuide() {
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <Info className="h-5 w-5 text-slate-600" /> What Goes in Your Bins? (Acceptance Guide)
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(BINS_CONFIG).map(([key, config]) => (
          <div
            key={key}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-8 w-4 rounded" style={{ backgroundColor: config.color }}></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{config.fullName}</h3>
                  <span className="text-xs font-semibold text-slate-500">{config.frequency}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> YES - Put in this bin:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {config.acceptedItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-green-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> NO - Do NOT put in this bin:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {config.rejectedItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-red-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | BinKey>('ALL')
  const [activeTab, setActiveTab] = useState<'grid' | 'summary' | 'guide'>('grid')

  const now = useClock()
  const { showInstallBanner, triggerInstall, dismissBanner } = usePWAManager()

  const nextCollectionsMap = useMemo(() => calculateNextCollections(now), [now])
  const nearestCollection = useMemo(
    () => getUpcomingHighlight(nextCollectionsMap),
    [nextCollectionsMap],
  )

  const handleInspectGuide = useCallback(() => {
    setActiveTab('guide')
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 pb-12 font-sans text-slate-800">
      <AppHeader onInstall={triggerInstall} onPrint={() => window.print()} />

      {showInstallBanner && (
        <InstallBanner onInstall={triggerInstall} onDismiss={dismissBanner} />
      )}

      <main className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <UpcomingHighlightCard collection={nearestCollection} />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2 rounded-xl bg-slate-200 p-1">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="h-4 w-4" /> 12-Month Calendar
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trash2 className="h-4 w-4" /> Bin Summaries &amp; Frequencies
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'guide'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="h-4 w-4" /> Recycling Guide
            </button>
          </div>

          <FilterBar selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />
        </div>

        <div className={activeTab === 'grid' ? 'block' : 'hidden print:block'}>
          <CalendarGrid filterBin={selectedFilter} now={now} />
        </div>

        <div className={`mt-8 ${activeTab === 'summary' ? 'block' : 'hidden print:block'}`}>
          <BinSummaries
            nextCollectionsMap={nextCollectionsMap}
            onInspectGuide={handleInspectGuide}
          />
        </div>

        <div className={`mt-8 ${activeTab === 'guide' ? 'block' : 'hidden print:block'}`}>
          <RecyclingGuide />
        </div>
      </main>

      <footer className="mx-auto mt-12 max-w-7xl border-t border-slate-200 px-4 pt-6 text-center text-xs text-slate-500 print:hidden sm:px-6 lg:px-8">
        <p>Midlothian Council Kerbside Bin Schedule App | Postcode: EH25 9AW</p>
        <p className="mt-1">
          Collection details are correct at time of publishing. Always present bins by
          6:30am on collection day.
        </p>
      </footer>
    </div>
  )
}
