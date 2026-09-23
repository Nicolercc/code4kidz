import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTimers } from './useTimers'

describe('useTimers', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('replaces a pending timer scheduled under the same key', () => {
    const { result } = renderHook(() => useTimers())
    const first = vi.fn()
    const second = vi.fn()
    result.current.schedule('check', first, 1000)
    result.current.schedule('check', second, 1000)
    vi.advanceTimersByTime(1000)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  it('cancels everything on unmount', () => {
    const { result, unmount } = renderHook(() => useTimers())
    const fn = vi.fn()
    result.current.schedule('advance', fn, 1500)
    unmount()
    vi.advanceTimersByTime(5000)
    expect(fn).not.toHaveBeenCalled()
  })
})
