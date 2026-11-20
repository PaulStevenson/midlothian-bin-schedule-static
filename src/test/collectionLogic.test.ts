import { describe, expect, it } from 'vitest'
import {
  calculateNextCollections,
  getActionRequiredCollections,
  getUpcomingHighlight,
  type ActionCollection,
  type BinKey,
} from '../App'

const localDate = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day)

describe('calculateNextCollections', () => {
  it('excludes today and finds the next future collection', () => {
    const result = calculateNextCollections(localDate(2026, 11, 19))

    expect(result.Fd.formatted).toBe('Tue 24/11/2026')
    expect(result.Fd.daysLeft).toBe(5)
    expect(result.Fd.isToday).toBe(false)
    expect(result.Fd.isTomorrow).toBe(false)
  })

  it('returns no future date for bins whose schedule has ended', () => {
    const result = calculateNextCollections(localDate(2028, 1, 1))

    expect(result.Fd.formatted).toBe('No upcoming dates')
    expect(result.Fd.daysLeft).toBeNull()
  })

  it('identifies tomorrow when the next collection is one day away', () => {
    const result = calculateNextCollections(localDate(2026, 11, 23))

    expect(result.Fd.isTomorrow).toBe(true)
    expect(result.Fd.daysLeft).toBe(1)
  })
})

describe('getUpcomingHighlight', () => {
  it('returns the nearest collection and preserves its bin key', () => {
    const nextCollections = calculateNextCollections(localDate(2026, 11, 19))
    const nearest = getUpcomingHighlight(nextCollections)

    expect(nearest?.binKey).toBe('Fd')
  })

  it('returns null when no collection has a date', () => {
    const empty = {
      Fd: { formatted: 'No upcoming dates', daysLeft: null },
    } as unknown as Record<BinKey, { formatted: string; daysLeft: number | null }>

    expect(getUpcomingHighlight(empty)).toBeNull()
  })
})

describe('getActionRequiredCollections', () => {
  it('returns today and all bins collected today', () => {
    const result = getActionRequiredCollections(localDate(2026, 11, 18))

    expect(result).toEqual<ActionCollection>({
      date: localDate(2026, 11, 18),
      binKeys: ['Rd', 'Bl'],
      isToday: true,
      isTomorrow: false,
    })
  })

  it('returns tomorrow before today action has passed', () => {
    const result = getActionRequiredCollections(localDate(2026, 11, 16))

    expect(result?.isTomorrow).toBe(true)
    expect(result?.isToday).toBe(false)
    expect(result?.binKeys).toEqual(['Fd'])
  })

  it('returns null when today and tomorrow have no collections', () => {
    expect(getActionRequiredCollections(localDate(2026, 11, 20))).toBeNull()
  })
})
