import { describe, expect, it } from 'vitest'
import { declaredStyle, hasDeclaredStyle, parseHtml, tagsBalanced } from './htmlChecks'

const h1Style = (html: string) => {
  const doc = parseHtml(html)
  return declaredStyle(doc, doc.querySelector('h1')!, 'color')
}

describe('declaredStyle', () => {
  it('ignores the preview defaults and only sees what the kid wrote', () => {
    expect(h1Style('<h1>Space</h1>')).toBeNull()
  })

  it('reads a matching rule, including selector lists', () => {
    expect(h1Style('<style>h2, h1 { color: gold; }</style><h1>Space</h1>')).toBe('gold')
  })

  it('lets an inline style win over a stylesheet rule', () => {
    expect(h1Style('<style>h1 { color: gold; }</style><h1 style="color: red">Space</h1>')).toBe('red')
  })

  it('drops declarations a browser would drop', () => {
    expect(h1Style('<style>h1 { color gold; }</style><h1>Space</h1>')).toBeNull()
    expect(h1Style('<style>h1 { color: sparkly; }</style><h1>Space</h1>')).toBeNull()
    expect(h1Style('<style>/* h1 { color: gold; } */</style><h1>Space</h1>')).toBeNull()
  })

  it('does not crash on a half-typed selector', () => {
    expect(h1Style('<style>h1 > { color: gold; } h1 { color: red; }</style><h1>Space</h1>')).toBe('red')
  })

  it('accepts either of several properties', () => {
    const doc = parseHtml('<style>body { background: navy; }</style><p>x</p>')
    expect(hasDeclaredStyle(doc, 'body', 'background-color', 'background')).toBe(true)
  })
})

describe('tagsBalanced', () => {
  it('needs every opening tag to have a closing partner', () => {
    expect(tagsBalanced('<p>a</p><p>b</p>', 'p')).toBe(true)
    expect(tagsBalanced('<p>a</p><p>b', 'p')).toBe(false)
  })

  it('does not confuse similar tag names', () => {
    expect(tagsBalanced('<p>a</p><pre>b</pre>', 'p')).toBe(true)
  })

  it('is false when the tag never appears', () => {
    expect(tagsBalanced('<h1>a</h1>', 'p')).toBe(false)
  })
})
