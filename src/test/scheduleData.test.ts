import { describe, expect, it } from 'vitest'
import { BINS_CONFIG, CALENDAR_DATA, type BinKey } from '../App'

describe('schedule data', () => {
  it('contains one configuration for every supported bin key', () => {
    const binKeys = ['Fd', 'Gy', 'Gn', 'Bl', 'Rd', 'Br'] as BinKey[]

    expect(Object.keys(BINS_CONFIG)).toEqual(binKeys)
    for (const binKey of binKeys) {
      expect(BINS_CONFIG[binKey].id).toBe(binKey)
      expect(BINS_CONFIG[binKey].name).not.toBe('')
      expect(BINS_CONFIG[binKey].summary).not.toBe('')
      expect(BINS_CONFIG[binKey].acceptedItems.length).toBeGreaterThan(0)
      expect(BINS_CONFIG[binKey].rejectedItems.length).toBeGreaterThan(0)
    }
  })

  it('only references supported bins and valid day numbers', () => {
    const supported = new Set(Object.keys(BINS_CONFIG))

    for (const month of CALENDAR_DATA) {
      for (const [dayText, binKeys] of Object.entries(month.collections)) {
        const day = Number(dayText)
        expect(day).toBeGreaterThanOrEqual(1)
        expect(day).toBeLessThanOrEqual(month.days)

        for (const binKey of binKeys) {
          expect(supported.has(binKey)).toBe(true)
        }
      }
    }
  })

  it('has no duplicate collection entries within a month', () => {
    for (const month of CALENDAR_DATA) {
      const entries = Object.entries(month.collections)
      const dayNumbers = entries.map(([day]) => Number(day))
      expect(new Set(dayNumbers).size).toBe(dayNumbers.length)

      for (const [, binKeys] of entries) {
        expect(new Set(binKeys).size).toBe(binKeys.length)
      }
    }
  })
})
