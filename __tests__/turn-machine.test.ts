import { describe, it, expect } from 'vitest'
import { createActor } from 'xstate'
import { turnMachine } from '../src/machine/turn'

function startedActor() {
  const actor = createActor(turnMachine)
  actor.start()
  return actor
}

describe('turn machine', () => {
  it('starts in idle state', () => {
    const actor = startedActor()
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('SPIN transitions idle -> rolling', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    expect(actor.getSnapshot().value).toBe('rolling')
  })

  it('SETTLE_DONE transitions rolling -> settling', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    actor.send({ type: 'SETTLE_DONE' })
    expect(actor.getSnapshot().value).toBe('settling')
  })

  it('SETTLE_DONE transitions settling -> resolving', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'SETTLE_DONE' })
    expect(actor.getSnapshot().value).toBe('resolving')
  })

  it('RESOLVE_DONE transitions resolving -> acting', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'RESOLVE_DONE' })
    expect(actor.getSnapshot().value).toBe('acting')
  })

  it('ACT_DONE transitions acting -> cleanup', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'RESOLVE_DONE' })
    actor.send({ type: 'ACT_DONE' })
    expect(actor.getSnapshot().value).toBe('cleanup')
  })

  it('NEXT_TURN transitions cleanup -> idle', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'RESOLVE_DONE' })
    actor.send({ type: 'ACT_DONE' })
    actor.send({ type: 'NEXT_TURN' })
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('GAME_OVER transitions cleanup -> done (final state)', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'SETTLE_DONE' })
    actor.send({ type: 'RESOLVE_DONE' })
    actor.send({ type: 'ACT_DONE' })
    actor.send({ type: 'GAME_OVER' })
    expect(actor.getSnapshot().value).toBe('done')
    expect(actor.getSnapshot().status).toBe('done')
  })

  it('LOCK_WHEEL stays in idle (self-transition)', () => {
    const actor = startedActor()
    actor.send({ type: 'LOCK_WHEEL', index: 2 })
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('ignores invalid events (SPIN during rolling)', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    expect(actor.getSnapshot().value).toBe('rolling')
    actor.send({ type: 'SPIN' })
    expect(actor.getSnapshot().value).toBe('rolling')
  })

  it('ignores NEXT_TURN in idle', () => {
    const actor = startedActor()
    actor.send({ type: 'NEXT_TURN' })
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('ignores RESOLVE_DONE in rolling', () => {
    const actor = startedActor()
    actor.send({ type: 'SPIN' })
    actor.send({ type: 'RESOLVE_DONE' })
    expect(actor.getSnapshot().value).toBe('rolling')
  })

  it('full cycle: idle -> rolling -> settling -> resolving -> acting -> cleanup -> idle', () => {
    const actor = startedActor()

    expect(actor.getSnapshot().value).toBe('idle')

    actor.send({ type: 'SPIN' })
    expect(actor.getSnapshot().value).toBe('rolling')

    actor.send({ type: 'SETTLE_DONE' })
    expect(actor.getSnapshot().value).toBe('settling')

    actor.send({ type: 'SETTLE_DONE' })
    expect(actor.getSnapshot().value).toBe('resolving')

    actor.send({ type: 'RESOLVE_DONE' })
    expect(actor.getSnapshot().value).toBe('acting')

    actor.send({ type: 'ACT_DONE' })
    expect(actor.getSnapshot().value).toBe('cleanup')

    actor.send({ type: 'NEXT_TURN' })
    expect(actor.getSnapshot().value).toBe('idle')
  })

  it('can run multiple full cycles', () => {
    const actor = startedActor()

    for (let i = 0; i < 3; i++) {
      actor.send({ type: 'SPIN' })
      actor.send({ type: 'SETTLE_DONE' })
      actor.send({ type: 'SETTLE_DONE' })
      actor.send({ type: 'RESOLVE_DONE' })
      actor.send({ type: 'ACT_DONE' })
      actor.send({ type: 'NEXT_TURN' })
      expect(actor.getSnapshot().value).toBe('idle')
    }
  })
})
