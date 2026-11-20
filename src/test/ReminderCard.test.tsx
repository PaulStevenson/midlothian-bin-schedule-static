// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ReminderCard } from '../components/ReminderCard'

afterEach(cleanup)

describe('ReminderCard', () => {
  it('allows an opt-in reminder to be enabled', async () => {
    const onEnable = vi.fn()
    render(
      <ReminderCard
        status="disabled"
        message="Reminders are off."
        onEnable={onEnable}
        onDisable={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Enable reminders' }))
    expect(onEnable).toHaveBeenCalledOnce()
  })

  it('allows an enabled reminder to be disabled', async () => {
    const onDisable = vi.fn()
    render(
      <ReminderCard
        status="enabled"
        message="Reminders are enabled for 18:00 the day before collection."
        onEnable={vi.fn()}
        onDisable={onDisable}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Turn off reminders' }))
    expect(onDisable).toHaveBeenCalledOnce()
  })

  it('hides the action for unsupported browsers', () => {
    render(
      <ReminderCard
        status="unsupported"
        message="Reminders are not supported by this browser."
        onEnable={vi.fn()}
        onDisable={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button')).toBeNull()
  })
})
