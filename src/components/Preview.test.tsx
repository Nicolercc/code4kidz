import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Preview from './Preview'

describe('Preview', () => {
  it('runs kid code in a fully locked sandbox', () => {
    const { container } = render(<Preview code="<h1>Space</h1>" />)
    const iframe = container.querySelector('iframe')!

    // An empty sandbox attribute applies every restriction: no scripts, and a
    // unique origin so the preview can never reach the app's DOM or storage.
    // (allow-scripts + allow-same-origin together let the frame un-sandbox itself.)
    expect(iframe.getAttribute('sandbox')).toBe('')
  })

  it('shows the page title on the browser tab, like lesson 1 promises', () => {
    const { getByText } = render(<Preview code="<html><head><title>Space facts</title></head></html>" />)
    expect(getByText('Space facts')).toBeTruthy()
  })

  it("puts the preview's default styles before the learner's, so the learner's CSS wins", () => {
    const code = '<html><head><title>T</title><style>body { background-color: lightyellow; }</style></head><body></body></html>'
    const { container } = render(<Preview code={code} />)
    const doc = container.querySelector('iframe')!.getAttribute('srcdoc')!
    const defaults = doc.indexOf('background: #FAFAF8')
    const learners = doc.indexOf('background-color: lightyellow')
    expect(defaults).toBeGreaterThan(-1)
    expect(defaults).toBeLessThan(learners)
  })

  it('renders the kid code into the frame', () => {
    const { container } = render(<Preview code="<h1>Space</h1>" />)
    expect(container.querySelector('iframe')!.getAttribute('srcdoc')).toContain('<h1>Space</h1>')
  })
})
