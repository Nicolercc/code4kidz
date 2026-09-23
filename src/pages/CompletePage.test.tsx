import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CompletePage from './CompletePage'
import { useGameStore } from '../store/gameStore'

vi.mock('../utils/sounds', () => ({ play: vi.fn() }))
vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

describe('CompletePage', () => {
  it('does not award a locked lesson reached by typing its URL', () => {
    useGameStore.setState({ topicName: 'Space', completedLessons: [], xp: 0 })
    render(
      <MemoryRouter initialEntries={['/complete/6']}>
        <Routes>
          <Route path="/complete/:id" element={<CompletePage />} />
          <Route path="/map" element={<p>map</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('map')).toBeTruthy()
    expect(useGameStore.getState().completedLessons).toEqual([])
  })
})
