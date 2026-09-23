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

  it('renders the kid code into the frame', () => {
    const { container } = render(<Preview code="<h1>Space</h1>" />)
    expect(container.querySelector('iframe')!.getAttribute('srcdoc')).toContain('<h1>Space</h1>')
  })
})
