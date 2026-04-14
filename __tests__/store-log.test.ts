import { describe, it, expect, beforeEach } from 'vitest'
import { useLogStore } from '../src/store/log'

describe('useLogStore', () => {
  beforeEach(() => {
    useLogStore.getState().clear()
  })

  it('pushEvents appends to events array', () => {
    useLogStore.getState().pushEvents([
      { type: 'damage', detail: 'hit for 3' },
    ])
    expect(useLogStore.getState().events).toHaveLength(1)
    expect(useLogStore.getState().events[0].detail).toBe('hit for 3')
  })

  it('multiple pushEvents accumulate', () => {
    useLogStore.getState().pushEvents([
      { type: 'damage', detail: 'first' },
    ])
    useLogStore.getState().pushEvents([
      { type: 'heal', detail: 'second' },
      { type: 'energy', detail: 'third' },
    ])
    expect(useLogStore.getState().events).toHaveLength(3)
    expect(useLogStore.getState().events[0].detail).toBe('first')
    expect(useLogStore.getState().events[1].detail).toBe('second')
    expect(useLogStore.getState().events[2].detail).toBe('third')
  })

  it('clear resets to empty', () => {
    useLogStore.getState().pushEvents([
      { type: 'damage', detail: 'hit' },
    ])
    expect(useLogStore.getState().events).toHaveLength(1)
    useLogStore.getState().clear()
    expect(useLogStore.getState().events).toHaveLength(0)
  })
})
