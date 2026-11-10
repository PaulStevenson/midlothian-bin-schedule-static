# Midlothian Bin Schedule

A React + TypeScript + Vite web app for viewing kerbside bin collection dates for postcode EH25 9AW.

The app includes:

- A 12-month calendar view (Nov 2026 to Oct 2027)
- Next-up collection highlight card
- Bin-by-bin summaries with frequencies
- Recycling acceptance guide (what goes in each bin)
- Filter controls by bin type
- Print-friendly layout
- Basic install prompt support for mobile (PWA-style)

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- lucide-react (icons)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal (typically http://localhost:5173 or next available port).

## Available Scripts

- `npm run dev`: Start local development server
- `npm run build`: Type-check and build for production
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run Oxlint

## Project Structure

- `src/App.tsx`: Main app UI and logic
- `src/index.css`: Global styles and Tailwind import
- `src/main.tsx`: App bootstrap

## Updating Collection Data

Collection data is stored in JSON files:

- `src/data/bins-config.json`: Bin names, colors, frequencies, accepted/rejected items
- `src/data/schedule-data.json`: Month-by-month collection schedule

If collection dates change, update `src/data/schedule-data.json` first.

## Notes

- The app currently targets one postcode and schedule dataset (EH25 9AW).
- For wider area support, extract schedule data into separate JSON or API-backed sources.
