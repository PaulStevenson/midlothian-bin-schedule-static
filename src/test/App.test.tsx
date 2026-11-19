// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

describe('App collection cards', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows a left-side action card for collections today', () => {
    vi.setSystemTime(new Date(2026, 10, 18))
    render(<App />)

    expect(screen.getByText('Action Required')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Collection Today' })).toBeTruthy()
    expect(screen.getByText('Put your bin out now')).toBeTruthy()
    expect(screen.getAllByText('Glass Box').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Blue Bin').length).toBeGreaterThan(0)
  })

  it('shows tomorrow collection guidance and the next future collection', () => {
    vi.setSystemTime(new Date(2026, 10, 16))
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Collection Tomorrow' })).toBeTruthy()
    expect(screen.getByText('Put your bin out tonight')).toBeTruthy()
    expect(screen.getAllByText('Tue 17/11/2026').length).toBeGreaterThan(0)
  })

  it('does not show an action card when today and tomorrow are clear', () => {
    vi.setSystemTime(new Date(2026, 10, 20))
    render(<App />)

    expect(screen.queryByText('Action Required')).toBeNull()
    expect(screen.getAllByText('Tue 24/11/2026').length).toBeGreaterThan(0)
  })
})

describe('App interactions', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  it('switches to the bin summaries tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Bin Summaries & Frequencies' }))

    expect(screen.getByText('Bin Summaries & Collection Frequencies')).toBeTruthy()
  })

  it('switches to the recycling guide tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Recycling Guide' }))

    expect(screen.getByText('What Goes in Your Bins? (Acceptance Guide)')).toBeTruthy()
  })

  it('allows the install banner to be dismissed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(screen.queryByText(/Install on Mobile/)).toBeNull()
  })

  it('calls window.print from the print button', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Print' }))

    expect(printSpy).toHaveBeenCalledOnce()
    printSpy.mockRestore()
  })
})
