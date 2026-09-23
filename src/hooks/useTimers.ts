import { useCallback, useEffect, useMemo, useRef } from 'react'

export interface Timers {
  /** Run `fn` after `ms`. Scheduling the same key again replaces the pending timer. */
  schedule: (key: string, fn: () => void, ms: number) => void
  cancel: (key: string) => void
  cancelAll: () => void
}

/**
 * Named timeouts owned by a component. Every pending timer is cancelled on
 * unmount, so a celebration or penalty can never fire after the learner has
 * left the screen.
 */
export function useTimers(): Timers {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const cancel = useCallback((key: string) => {
    const id = timers.current.get(key)
    if (id !== undefined) clearTimeout(id)
    timers.current.delete(key)
  }, [])

  const schedule = useCallback(
    (key: string, fn: () => void, ms: number) => {
      cancel(key)
      timers.current.set(
        key,
        setTimeout(() => {
          timers.current.delete(key)
          fn()
        }, ms),
      )
    },
    [cancel],
  )

  const cancelAll = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id))
    timers.current.clear()
  }, [])

  useEffect(() => cancelAll, [cancelAll])

  return useMemo(() => ({ schedule, cancel, cancelAll }), [schedule, cancel, cancelAll])
}
