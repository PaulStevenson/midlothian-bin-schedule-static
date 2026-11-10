import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Trash2, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Info, 
  Printer, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Download
} from 'lucide-react';

// ==========================================
// 1. CONSTANTS & DATA CONFIGURATIONS
// ==========================================

export const BINS_CONFIG = {
  Fd: {
    id: 'Fd',
    name: 'Food Bin',
    fullName: 'Food Caddy',
    color: '#374151',
    badgeClass: 'bg-gray-700 text-white',
    frequency: 'Weekly',
    summary: 'For cooked and uncooked food waste.',
    acceptedItems: [
      'Raw & cooked food',
      'Meat, fish & bones',
      'Fruit & vegetable peelings',
      'Tea bags & coffee grounds',
      'Plate scrapings',
      'Dairy products & eggs'
    ],
    rejectedItems: ['Packaging of any kind', 'Liquids & oils', 'Garden waste', 'Pet waste']
  },
  Gy: {
    id: 'Gy',
    name: 'Grey Bin',
    fullName: 'Grey Non-Recyclable Bin',
    color: '#6b7280',
    badgeClass: 'bg-gray-500 text-white',
    frequency: 'Every 3 weeks',
    summary: 'For non-recyclable household materials.',
    acceptedItems: [
      'General non-recyclable waste',
      'Nappies & sanitary products',
      'Plastic bags & film wrappers',
      'Polystyrene & crisp packets',
      'Broken toys & ceramics'
    ],
    rejectedItems: ['Recyclable card/paper', 'Glass bottles', 'Garden waste', 'Batteries & electricals']
  },
  Gn: {
    id: 'Gn',
    name: 'Green Bin',
    fullName: 'Green Paper & Card Bin',
    color: '#15803d',
    badgeClass: 'bg-green-700 text-white',
    frequency: 'Every 3 weeks',
    summary: 'For clean paper and cardboard.',
    acceptedItems: [
      'Newspapers & magazines',
      'Cardboard boxes (flattened)',
      'Envelopes & office paper',
      'Cereal boxes & food cartons (clean)',
      'Junk mail & brochures'
    ],
    rejectedItems: ['Soiled paper or pizza boxes', 'Tissues & kitchen roll', 'Plastic wrap', 'Gift foil wrap']
  },
  Bl: {
    id: 'Bl',
    name: 'Blue Bin',
    fullName: 'Blue Packaging Bin',
    color: '#1d4ed8',
    badgeClass: 'bg-blue-600 text-white',
    frequency: 'Every 3 weeks',
    summary: 'For clean, dry plastics, cans, and cartons.',
    acceptedItems: [
      'Plastic bottles (milk, drinks, shampoo)',
      'Plastic tubs, trays & pots',
      'Drink cans & food tins',
      'Empty aerosols',
      'Clean foil & drink cartons (Tetra Pak)'
    ],
    rejectedItems: ['Black plastic trays', 'Soft plastic bags/film', 'Expanded polystyrene', 'Glass bottles']
  },
  Rd: {
    id: 'Rd',
    name: 'Glass Box',
    fullName: 'Red Glass Box',
    color: '#dc2626',
    badgeClass: 'bg-red-600 text-white',
    frequency: 'Every 4 weeks',
    summary: 'For clean glass bottles and jars.',
    acceptedItems: [
      'Clear & coloured glass bottles',
      'Glass food jars',
      'Non-food glass bottles (perfume, medicine)'
    ],
    rejectedItems: ['Drinking glasses & Pyrex', 'Window glass & mirrors', 'Light bulbs', 'Lids & caps (recycle separately)']
  },
  Br: {
    id: 'Br',
    name: 'Brown Bin',
    fullName: 'Brown Garden Waste Bin',
    color: '#92400e',
    badgeClass: 'bg-amber-800 text-white',
    frequency: 'Seasonal / Every 4 weeks',
    summary: 'For garden waste.',
    acceptedItems: [
      'Grass clippings & weeds',
      'Leaves & plant trimmings',
      'Small twigs & branches',
      'Cut flowers'
    ],
    rejectedItems: ['Soil, turf & stones', 'Food waste', 'Plastic bags', 'Treated wood & timber']
  }
};

export const CALENDAR_DATA = [
  {
    month: "November 2026", year: 2026, monthIndex: 10, days: 30, startDay: 6,
    collections: { 9: ["Fd"], 10: ["Fd"], 11: ["Br", "Gy", "Fd"], 17: ["Fd"], 18: ["Rd", "Bl", "Fd"], 24: ["Fd"], 25: ["Gn", "Fd"] }
  },
  {
    month: "December 2026", year: 2026, monthIndex: 11, days: 31, startDay: 1,
    collections: { 1: ["Fd"], 2: ["Rd", "Gy", "Fd"], 8: ["Fd"], 9: ["Bl", "Fd"], 15: ["Fd"], 16: ["Gn", "Rd", "Fd"], 22: ["Fd"], 23: ["Gy", "Fd"], 29: ["Fd"], 30: ["Rd", "Bl", "Fd"] }
  },
  {
    month: "January 2027", year: 2027, monthIndex: 0, days: 31, startDay: 4,
    collections: { 5: ["Fd"], 6: ["Gn", "Fd"], 12: ["Fd"], 13: ["Rd", "Gy", "Fd"], 19: ["Fd"], 20: ["Bl", "Fd"], 26: ["Fd"], 27: ["Gn", "Rd", "Fd"] }
  },
  {
    month: "February 2027", year: 2027, monthIndex: 1, days: 28, startDay: 0,
    collections: { 2: ["Fd"], 3: ["Gy", "Fd"], 9: ["Fd"], 10: ["Rd", "Bl", "Fd"], 16: ["Fd"], 17: ["Gn", "Fd"], 23: ["Fd"], 24: ["Rd", "Gy", "Fd"] }
  },
  {
    month: "March 2027", year: 2027, monthIndex: 2, days: 31, startDay: 0,
    collections: { 2: ["Fd"], 3: ["Bl", "Fd"], 9: ["Fd"], 10: ["Gn", "Rd", "Fd"], 16: ["Fd"], 17: ["Gy", "Fd"], 23: ["Fd"], 24: ["Rd", "Bl", "Fd"], 30: ["Fd"], 31: ["Gn", "Fd"] }
  },
  {
    month: "April 2027", year: 2027, monthIndex: 3, days: 30, startDay: 3,
    collections: { 6: ["Fd"], 7: ["Rd", "Gy", "Fd"], 13: ["Fd"], 14: ["Bl", "Fd"], 20: ["Fd"], 21: ["Gn", "Rd", "Fd"], 27: ["Fd"], 28: ["Gy", "Fd"] }
  },
  {
    month: "May 2027", year: 2027, monthIndex: 4, days: 31, startDay: 5,
    collections: { 4: ["Fd"], 5: ["Rd", "Bl", "Fd"], 11: ["Fd"], 12: ["Gn", "Fd"], 18: ["Fd"], 19: ["Rd", "Gy", "Fd"], 25: ["Fd"], 26: ["Bl", "Fd"] }
  },
  {
    month: "June 2027", year: 2027, monthIndex: 5, days: 30, startDay: 1,
    collections: { 1: ["Fd"], 2: ["Gn", "Rd", "Fd"], 8: ["Fd"], 9: ["Gy", "Fd"], 15: ["Fd"], 16: ["Rd", "Bl", "Fd"], 22: ["Fd"], 23: ["Gn", "Fd"], 29: ["Fd"], 30: ["Rd", "Gy", "Fd"] }
  },
  {
    month: "July 2027", year: 2027, monthIndex: 6, days: 31, startDay: 3,
    collections: { 6: ["Fd"], 7: ["Bl", "Fd"], 13: ["Fd"], 14: ["Gn", "Rd", "Fd"], 20: ["Fd"], 21: ["Gy", "Fd"], 27: ["Fd"], 28: ["Rd", "Bl", "Fd"] }
  },
  {
    month: "August 2027", year: 2027, monthIndex: 7, days: 31, startDay: 6,
    collections: { 3: ["Fd"], 4: ["Gn", "Fd"], 10: ["Fd"], 11: ["Rd", "Gy", "Fd"], 17: ["Fd"], 18: ["Bl", "Fd"], 24: ["Fd"], 25: ["Gn", "Rd", "Fd"], 31: ["Fd"] }
  },
  {
    month: "September 2027", year: 2027, monthIndex: 8, days: 30, startDay: 2,
    collections: { 1: ["Gy", "Fd"], 7: ["Fd"], 8: ["Rd", "Bl", "Fd"], 14: ["Fd"], 15: ["Gn", "Fd"], 21: ["Fd"], 22: ["Rd", "Gy", "Fd"], 28: ["Fd"], 29: ["Bl", "Fd"] }
  },
  {
    month: "October 2027", year: 2027, monthIndex: 9, days: 31, startDay: 4,
    collections: { 5: ["Fd"], 6: ["Gn", "Rd", "Fd"], 12: ["Fd"], 13: ["Gy", "Fd"], 19: ["Fd"], 20: ["Rd", "Bl", "Fd"], 26: ["Fd"], 27: ["Gn", "Fd"] }
  }
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ==========================================
// 2. HELPER & UTILITY FUNCTIONS
// ==========================================

export function calculateNextCollections(nowDate) {
  const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const results = {};

  Object.keys(BINS_CONFIG).forEach((binKey) => {
    let earliestDate = null;

    CALENDAR_DATA.forEach((monthData) => {
      Object.entries(monthData.collections).forEach(([dayStr, bins]) => {
        if (bins.includes(binKey)) {
          const dayNum = parseInt(dayStr, 10);
          const candidateDate = new Date(monthData.year, monthData.monthIndex, dayNum);
          
          if (candidateDate >= today) {
            if (!earliestDate || candidateDate < earliestDate) {
              earliestDate = candidateDate;
            }
          }
        }
      });
    });

    if (earliestDate) {
      const diffTime = earliestDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const formattedDate = `${DAY_NAMES[earliestDate.getDay()]} ${String(earliestDate.getDate()).padStart(2, '0')}/${String(earliestDate.getMonth() + 1).padStart(2, '0')}/${earliestDate.getFullYear()}`;

      results[binKey] = {
        date: earliestDate,
        formatted: formattedDate,
        daysLeft: diffDays,
        isToday: diffDays === 0,
        isTomorrow: diffDays === 1
      };
    } else {
      results[binKey] = { formatted: 'No upcoming dates', daysLeft: null };
    }
  });

  return results;
}

export function getUpcomingHighlight(nextCollectionsMap) {
  let nearest = null;
  Object.entries(nextCollectionsMap).forEach(([binKey, data]) => {
    if (data.date && (!nearest || data.date < nearest.date)) {
      nearest = { binKey, ...data };
    }
  });
  return nearest;
}

// ==========================================
// 3. CUSTOM HOOKS
// ==========================================

function useClock(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}

function usePWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  useEffect(() => {
    const manifestObj = {
      name: "Midlothian Bin Schedule",
      short_name: "Bin Schedule",
      description: "Kerbside Bin Collection Guide & Calendar for EH25 9AW",
      start_url: "./",
      display: "standalone",
      background_color: "#0f172a",
      theme_color: "#0f172a",
      icons: [
        {
          src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2315803d'/><text y='65' x='50' text-anchor='middle' font-size='50' fill='white'>🗑️</text></svg>",
          sizes: "192x192 512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        }
      ]
    };
    
    const blob = new Blob([JSON.stringify(manifestObj)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestURL;

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
      `;
      const swBlob = new Blob([swCode], { type: 'application/javascript' });
      navigator.serviceWorker.register(URL.createObjectURL(swBlob)).catch(() => {});
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const triggerInstall = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    } else {
      alert("To install this app on your Android device:\n1. Open your browser menu (⋮ three dots)\n2. Tap 'Add to Home screen' or 'Install app'");
    }
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => setShowInstallBanner(false), []);

  return { showInstallBanner, triggerInstall, dismissBanner };
}

// ==========================================
// 4. SUB-COMPONENTS
// ==========================================

function AppHeader({ onInstall, onPrint }) {
  return (
    <header className="bg-slate-900 text-white shadow-md print:bg-white print:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold tracking-wide uppercase mb-1">
              <Trash2 className="w-4 h-4" /> Midlothian Council Kerbside Service
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bin Collection Schedule
            </h1>
            <p className="text-slate-400 text-sm mt-1 print:text-slate-600">
              Postcode: <span className="font-semibold text-slate-200 print:text-black">EH25 9AW</span> &nbsp;|&nbsp; Schedule valid: Nov 2026 – Oct 2027
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={onInstall}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-lg transition shadow-sm text-sm"
            >
              <Download className="w-4 h-4" /> Install App
            </button>
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-4 py-2.5 rounded-lg border border-slate-700 transition shadow-sm text-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div className="bg-slate-800 text-slate-100 px-4 py-3 print:hidden border-b border-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-green-400 shrink-0" />
          <span>
            <strong>Install on Mobile:</strong> Tap <strong>"Install App"</strong> or open Chrome menu (<strong>⋮</strong>) and select <strong>"Add to Home screen"</strong>.
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white underline text-xs shrink-0"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function UpcomingHighlightCard({ collection }) {
  if (!collection || !collection.binKey) return null;
  const config = BINS_CONFIG[collection.binKey];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8 shadow-xl border border-slate-800 print:hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400 mb-2">
            <Sparkles className="w-4 h-4" /> Next Upcoming Collection
          </div>
          <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <span>{config?.name}</span>
            <span className={`text-xs px-2.5 py-1 rounded font-bold ${config?.badgeClass}`}>
              {collection.binKey}
            </span>
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            {config?.summary}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-slate-700 shrink-0">
          <CalendarIcon className="w-8 h-8 text-green-400" />
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Collection Date</div>
            <div className="text-lg font-extrabold text-white">{collection.formatted}</div>
            <div className="text-xs text-green-400 font-semibold mt-0.5">
              {collection.isToday 
                ? '⚠️ Put out bin today!' 
                : collection.isTomorrow 
                ? '⏰ Put out bin tomorrow night!' 
                : `In ${collection.daysLeft} days`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ selectedFilter, onSelectFilter }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
        <Filter className="w-3 h-3" /> Filter:
      </span>
      <button
        onClick={() => onSelectFilter('ALL')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
          selectedFilter === 'ALL'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
        }`}
      >
        All Bins
      </button>
      {Object.entries(BINS_CONFIG).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onSelectFilter(key)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
            selectedFilter === key
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }}></span>
          {config.name}
        </button>
      ))}
    </div>
  );
}

function CalendarGrid({ filterBin, now }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-slate-600" /> 
          Collection Calendar (Nov 2026 – Oct 2027)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CALENDAR_DATA.map((monthData, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col print:break-inside-avoid"
          >
            <div className="bg-slate-800 text-white py-2 px-3 text-center font-bold text-sm">
              {monthData.month}
            </div>

            <div className="p-2 flex-grow">
              <table className="w-full text-center table-fixed border-collapse">
                <thead>
                  <tr>
                    {WEEKDAY_LABELS.map(d => (
                      <th key={d} className="text-[10px] font-bold text-slate-400 uppercase py-1 border-b border-slate-100">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil((monthData.startDay + monthData.days) / 7) }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {Array.from({ length: 7 }).map((_, colIndex) => {
                        const cellIndex = rowIndex * 7 + colIndex;
                        const dayNum = cellIndex - monthData.startDay + 1;
                        const isValidDay = dayNum > 0 && dayNum <= monthData.days;
                        const collectionBins = isValidDay ? (monthData.collections[dayNum] || []) : [];

                        const isToday = isValidDay && 
                          now.getFullYear() === monthData.year && 
                          now.getMonth() === monthData.monthIndex && 
                          now.getDate() === dayNum;

                        return (
                          <td 
                            key={colIndex} 
                            className={`h-11 border border-slate-50 align-top p-0.5 text-center transition ${
                              isToday ? 'bg-amber-100/80 font-bold border-2 border-amber-500 rounded-sm' : ''
                            }`}
                          >
                            {isValidDay && (
                              <div className="h-full flex flex-col justify-between">
                                <span className={`text-[10px] ${isToday ? 'text-amber-900 font-extrabold' : 'text-slate-500'}`}>
                                  {dayNum}
                                </span>
                                <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                                  {collectionBins.map(binKey => {
                                    const config = BINS_CONFIG[binKey];
                                    const isDimmed = filterBin !== 'ALL' && filterBin !== binKey;
                                    return (
                                      <span
                                        key={binKey}
                                        title={`${config?.name} collection`}
                                        className={`text-[9px] font-black px-1 rounded text-white tracking-tight ${
                                          isDimmed ? 'opacity-20' : 'opacity-100'
                                        }`}
                                        style={{ backgroundColor: config?.color || '#333' }}
                                      >
                                        {binKey}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </td>
                        );
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
  );
}

function BinSummaries({ nextCollectionsMap, onInspectGuide }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Trash2 className="w-5 h-5 text-slate-600" /> Bin Summaries &amp; Collection Frequencies
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(BINS_CONFIG).map(([key, config]) => {
          const nextData = nextCollectionsMap[key];
          return (
            <div 
              key={key} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between transition hover:shadow-md"
            >
              <div>
                <div className="h-3 w-full" style={{ backgroundColor: config.color }}></div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{config.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded font-bold ${config.badgeClass}`}>
                      {config.id}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {config.summary}
                  </p>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Frequency:</span>
                      <span className="font-bold text-slate-800">{config.frequency}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
                      <span className="text-slate-500 font-medium">Next Collection:</span>
                      <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {nextData?.formatted || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">EH25 9AW Kerbside</span>
                <button
                  onClick={() => onInspectGuide(config)}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  What goes inside? <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecyclingGuide() {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-slate-600" /> What Goes in Your Bins? (Acceptance Guide)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(BINS_CONFIG).map(([key, config]) => (
          <div 
            key={key} 
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-8 rounded" style={{ backgroundColor: config.color }}></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{config.fullName}</h3>
                  <span className="text-xs font-semibold text-slate-500">{config.frequency}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> YES - Put in this bin:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {config.acceptedItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-green-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> NO - Do NOT put in this bin:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {config.rejectedItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">•</span>
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
  );
}

// ==========================================
// 5. MAIN ROOT APPLICATION COMPONENT
// ==========================================

export default function App() {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('grid');
  
  const now = useClock();
  const { showInstallBanner, triggerInstall, dismissBanner } = usePWAManager();

  const nextCollectionsMap = useMemo(() => calculateNextCollections(now), [now]);
  const nearestCollection = useMemo(() => getUpcomingHighlight(nextCollectionsMap), [nextCollectionsMap]);

  const handleInspectGuide = useCallback((config) => {
    setActiveTab('guide');
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      <AppHeader onInstall={triggerInstall} onPrint={() => window.print()} />

      {showInstallBanner && (
        <InstallBanner onInstall={triggerInstall} onDismiss={dismissBanner} />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <UpcomingHighlightCard collection={nearestCollection} />

        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2 bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeTab === 'grid' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> 12-Month Calendar
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeTab === 'summary' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trash2 className="w-4 h-4" /> Bin Summaries &amp; Frequencies
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeTab === 'guide' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-4 h-4" /> Recycling Guide
            </button>
          </div>

          <FilterBar 
            selectedFilter={selectedFilter} 
            onSelectFilter={setSelectedFilter} 
          />
        </div>

        {/* Tab Displays */}
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

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 print:hidden">
        <p>Midlothian Council Kerbside Bin Schedule App &nbsp;|&nbsp; Postcode: EH25 9AW</p>
        <p className="mt-1">Collection details are correct at time of publishing. Always present bins by 6:30am on collection day.</p>
      </footer>
    </div>
  );
}