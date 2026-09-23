/**
 * Helpers the lesson validators use to check what the kid actually typed.
 *
 * Everything here is a pure function of the raw code. Validators used to read
 * computed styles out of the live preview iframe, but the preview adds its own
 * default styles (dark body text, off-white background), so "is the h1 not
 * black?" passed before the kid wrote any CSS. Reading the kid's own CSS
 * instead is deterministic, testable, and ignores the preview's defaults.
 */

/** Parse the kid's code the same way the browser would, without rendering it. */
export function parseHtml(rawCode: string): Document {
  return new DOMParser().parseFromString(rawCode, 'text/html')
}

/**
 * True when `tag` is opened at least once and every opening tag has a closing
 * partner. The parser auto-closes tags, so this has to look at the raw text.
 */
export function tagsBalanced(rawCode: string, tag: string): boolean {
  const opens = rawCode.match(new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi'))?.length ?? 0
  const closes = rawCode.match(new RegExp(`</${tag}\\s*>`, 'gi'))?.length ?? 0
  return opens > 0 && opens === closes
}

/** Trimmed text of the first element matching `selector`, or '' if none. */
export function textOf(doc: Document, selector: string): string {
  return doc.querySelector(selector)?.textContent?.trim() ?? ''
}

/** Uses the browser's own CSS parser: an invalid value is simply dropped. */
function isValidValue(property: string, value: string): boolean {
  const probe = document.createElement('div').style
  probe.setProperty(property, value)
  return probe.getPropertyValue(property) !== ''
}

interface Declaration {
  property: string
  value: string
}

/** `color: red; width 3px` → [{color, red}]. Declarations without a colon are ignored, as a browser would. */
function parseDeclarations(block: string): Declaration[] {
  return block
    .split(';')
    .map((part) => {
      const colon = part.indexOf(':')
      if (colon === -1) return null
      const property = part.slice(0, colon).trim().toLowerCase()
      const value = part.slice(colon + 1).replace(/!important/i, '').trim()
      return property && value ? { property, value } : null
    })
    .filter((d): d is Declaration => d !== null)
}

function matches(el: Element, selector: string): boolean {
  try {
    return el.matches(selector)
  } catch {
    return false // a half-typed selector like "h1 >" should not crash validation
  }
}

/**
 * The value the kid set for `property` on `el`, from <style> rules whose
 * selector matches it or from its inline style attribute (last one wins).
 * Returns null when nothing valid was written for it.
 *
 * Deliberately simpler than the real cascade (no specificity, no inheritance):
 * the lessons ask kids to target elements directly, e.g. `h1 { color: red; }`.
 */
export function declaredStyle(doc: Document, el: Element, property: string): string | null {
  const wanted = property.toLowerCase()
  let found: string | null = null

  const consider = (declarations: Declaration[]) => {
    for (const { property: p, value } of declarations) {
      if (p === wanted && isValidValue(p, value)) found = value
    }
  }

  for (const styleEl of Array.from(doc.querySelectorAll('style'))) {
    const css = (styleEl.textContent ?? '').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const [, selectorList, block] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selectors = selectorList.split(',').map((s) => s.trim()).filter(Boolean)
      if (selectors.some((s) => matches(el, s))) consider(parseDeclarations(block))
    }
  }

  const inline = el.getAttribute('style')
  if (inline) consider(parseDeclarations(inline))

  return found
}

/** Shorthand: does the first `selector` match have a valid `property` set by the kid? */
export function hasDeclaredStyle(doc: Document, selector: string, ...properties: string[]): boolean {
  const el = doc.querySelector(selector)
  return !!el && properties.some((p) => declaredStyle(doc, el, p) !== null)
}
