import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import MapPage from './MapPage'
import OnboardingPage from './OnboardingPage'
import NotFoundPage from './NotFoundPage'
import { useGameStore } from '../store/gameStore'

vi.mock('../utils/sounds', () => ({ play: vi.fn() }))

const renderAt = (path: string, element: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  )

describe('MapPage accessibility', () => {
  beforeEach(() => useGameStore.setState({ topicName: 'Space', completedLessons: ['lesson-01'], playedDates: [] }))

  it('has a main landmark and one h1', () => {
    renderAt('/map', <MapPage />)
    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('names lesson links by lesson, not by emoji', () => {
    renderAt('/map', <MapPage />)
    expect(screen.getByRole('link', { name: 'Lesson 1: Say Hello to the Web! (completed, play again)' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Lesson 2: Make a Big Title! (start here)' })).toBeTruthy()
  })

  it('says why a real lesson is locked instead of "coming soon"', () => {
    renderAt('/map', <MapPage />)
    expect(screen.getByRole('button', { name: 'Lesson 3: Write Your Story. Locked: finish lesson 2 first.' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Build a Button!. Coming soon.' })).toBeTruthy()
  })
})

describe('OnboardingPage accessibility', () => {
  beforeEach(() => useGameStore.setState({ topicName: '' }))

  it('labels the topic field and says which chip is chosen', async () => {
    renderAt('/onboarding', <OnboardingPage />)
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }))

    // Step 2 mounts after step 1's exit animation (AnimatePresence mode="wait").
    const field = await screen.findByRole('textbox', { name: /what do you love/i })
    expect(field).toBeTruthy()
    const space = screen.getByRole('button', { name: 'Space' })
    expect(space.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(space)
    expect(space.getAttribute('aria-pressed')).toBe('true')
  })

  it('shows the celebration screens after the topic is chosen instead of jumping to the map', async () => {
    renderAt('/onboarding', <OnboardingPage />)
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    fireEvent.change(await screen.findByRole('textbox', { name: /what do you love/i }), { target: { value: 'Dinosaurs' } })
    fireEvent.click(screen.getByRole('button', { name: /build my Dinosaurs page/i }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Dinosaurs!' })).toBeTruthy()
  })

  it('gives every onboarding step an h1', () => {
    renderAt('/onboarding', <OnboardingPage />)
    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})

describe('NotFoundPage', () => {
  it('explains the page is missing and links home', () => {
    renderAt('/nope', <NotFoundPage />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/can't find/i)
    expect(screen.getByRole('link', { name: /home/i }).getAttribute('href')).toBe('/')
  })
})
