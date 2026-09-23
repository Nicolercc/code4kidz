import { describe, expect, it } from 'vitest'
import type { Lesson, LessonStep } from './lesson-01'
import { lesson01 } from './lesson-01'
import { lesson02 } from './lesson-02'
import { lesson03 } from './lesson-03'
import { lesson04 } from './lesson-04'
import { lesson05 } from './lesson-05'
import { lesson06 } from './lesson-06'
import { validate } from '../../utils/validator'

const TOPIC = 'Space'

function starterOf(step: LessonStep): string {
  const field = step.startingCode
  return typeof field === 'function' ? field(TOPIC) : field.replace(/\{topic\}/g, TOPIC)
}

const page = (head: string, body: string) =>
  `<html>\n  <head>\n    <title>${TOPIC}</title>\n${head}\n  </head>\n  <body>\n${body}\n  </body>\n</html>`
const style = (css: string) => `    <style>\n${css}\n    </style>`

interface Case {
  /** A correct answer a kid could plausibly type. */
  pass: string
  /** Plausible wrong answers that must NOT pass. */
  fail: string[]
  /** Warm-ups start empty and lesson 1's intro has no editor, so skip the starter check there. */
  skipStarter?: boolean
}

const CASES: Record<string, Record<string, Case>> = {
  'lesson-01': {
    'step-1': { pass: '<html></html>', fail: ['<html>', 'html', '<htm></htm>'] },
    'step-2': { pass: '<html>\n  <head></head>\n</html>', fail: ['<html>\n  <head>\n</html>'] },
    'step-3': {
      pass: '<html>\n  <head>\n    <title>Space</title>\n  </head>\n</html>',
      fail: ['<html>\n  <head>\n    <title></title>\n  </head>\n</html>'],
    },
    'step-4': {
      pass: page('', '    Space is awesome!\n  '),
      fail: ['<html>\n  <body>\n    Space is awesome!\n  <body/>\n</html>'],
    },
    'step-5': {
      pass: page('', '    <h1>Space has billions of stars</h1>'),
      fail: [page('', '    <h1>Space</h1>'), page('', '    <h1>   </h1>')],
    },
  },
  'lesson-02': {
    warmup: {
      skipStarter: true,
      pass: '<html>\n<head></head>\n<body>\n<h1>Space</h1>\n</body>\n</html>',
      fail: ['x', '<h1>Space</h1>', '<html><body></body></html>'],
    },
    'step-1': { pass: page('', '    <h1>Space</h1>'), fail: [page('', '    <h1></h1>')] },
    'step-2': {
      pass: page('', '    <h1>Space</h1>\n    <h2>Stars are hot</h2>'),
      fail: [page('', '    <h1>Space</h1>\n    <h2></h2>')],
    },
    'step-3': {
      pass: page('', '    <h1>Space</h1>\n    <h2>Why</h2>\n    <h3>A detail</h3>'),
      fail: [page('', '    <h1>Space</h1>\n    <h2>Why</h2>\n    <h4>A detail</h4>')],
    },
    'step-4': {
      pass: page('', '    <h1>Space</h1>\n    <h2>Why I love Space</h2>\n    <h3>One cool fact</h3>'),
      fail: [page('', '    <h1>Space</h1>\n    <h2>Why I love Space<h2/>\n    <h3>One cool fact</h3>')],
    },
    'step-5': {
      pass: page('', '    <h1>Space</h1>\n    <h2>Why</h2>\n    <h3>Fact</h3>\n    <h2>More</h2>'),
      fail: [page('', '    <h1>Space</h1>\n    <h2>Why</h2>\n    <h3>Fact</h3>\n    <h3>More</h3>')],
    },
  },
  'lesson-03': {
    warmup: { skipStarter: true, pass: '<h1>Space</h1>\n<h2>Stars</h2>', fail: ['x', '<h1>Space</h1>'] },
    'step-1': { pass: page('', '    <h1>Space</h1>\n    <p>Space is big.</p>'), fail: [page('', '    <p></p>')] },
    'step-2': { pass: page('', '    <p>One.</p>\n    <p>Two.</p>'), fail: [page('', '    <p>One.</p>')] },
    'step-3': { pass: page('', '    <p>1</p>\n    <p>2</p>\n    <p>3</p>'), fail: [page('', '    <p>1</p>\n    <p>2</p>')] },
    'step-4': {
      pass: page('', '    <h1>Space</h1>\n    <p>First.</p>\n    <p>Second.</p>\n    <p>Third.</p>'),
      fail: [page('', '    <p>First.</p>\n    <p>Second.<p>\n    <p>Third.</p>')],
    },
    'step-5': {
      pass: page('', '    <h1>Space</h1>\n    <h2>My favorite</h2>\n    <p>Stars are suns.</p>\n    <p>Mars is red.</p>\n    <p>I want to fly there.</p>'),
      fail: [
        page('', '    <h1>Space</h1>\n    <h2>My favorite</h2>\n    <p>Stars are suns.</p>\n    <p>Write a fact here.</p>\n    <p>I want to fly there.</p>'),
      ],
    },
  },
  'lesson-04': {
    warmup: { skipStarter: true, pass: '<p>a</p>\n<p>b</p>\n<p>c</p>', fail: ['x', '<p>a</p>\n<p>b</p>'] },
    'step-1': { pass: page(style(''), '    <h1>Space</h1>'), fail: [page('', '    <h1>Space</h1>')] },
    'step-2': {
      pass: page(style('      h1 {\n        color: hotpink;\n      }'), '    <h1>Space</h1>'),
      fail: [
        page(style('      '), '    <h1>Space</h1>'),
        page(style('      h1 {\n        color hotpink;\n      }'), '    <h1>Space</h1>'),
        page(style('      h1 {\n        color: notacolor;\n      }'), '    <h1>Space</h1>'),
        page(style('      p {\n        color: red;\n      }'), '    <h1>Space</h1>'),
      ],
    },
    'step-3': {
      pass: page(style('      h1 { color: purple; }\n      body {\n        background-color: navy;\n      }'), '    <h1>Space</h1>'),
      fail: [
        page(style('      h1 { color: purple; }'), '    <h1>Space</h1>'),
        page(style('      body {\n        background-color navy;\n      }'), '    <h1>Space</h1>'),
      ],
    },
    'step-4': {
      pass: page(style('      h1 {\n        color: purple;\n      }\n      body {\n        background-color: lightyellow;\n      }'), '    <h1>Space</h1>'),
      fail: [page(style('      h1 {\n        color purple;\n      }'), '    <h1>Space</h1>')],
    },
    'step-5': {
      pass: page(
        style('      body { background-color: lightyellow; }\n      h1 { color: purple; }\n      h2 { color: orange; }\n      p { color: darkblue; }'),
        '    <h1>Space</h1>\n    <h2>Why</h2>\n    <p>Text.</p>',
      ),
      fail: [
        page(
          style('      body { background-color: lightyellow; }\n      h1 { color: purple; }\n      h2 { color: orange; }'),
          '    <h1>Space</h1>\n    <h2>Why</h2>\n    <p>Text.</p>',
        ),
      ],
    },
  },
  'lesson-05': {
    warmup: {
      skipStarter: true,
      pass: '<style>h1 { color: red; }</style>\n<h1>Space</h1>',
      fail: ['x', '<h1>Space</h1>', '<style>h1 { color red; }</style>\n<h1>Space</h1>'],
    },
    'step-1': {
      pass: page('', '    <ul>\n      <li>a</li>\n      <li>b</li>\n      <li>c</li>\n    </ul>'),
      fail: [page('', '    <ul>\n      <li>a</li>\n      <li>b</li>\n    </ul>')],
    },
    'step-2': {
      pass: page('', '    <ol>\n      <li>1</li>\n      <li>2</li>\n      <li>3</li>\n    </ol>'),
      fail: [page('', '    <ul>\n      <li>1</li>\n      <li>2</li>\n      <li>3</li>\n    </ul>')],
    },
    'step-3': {
      pass: '<ul>\n  <li>First</li>\n  <li>Second</li>\n  <li>Third</li>\n</ul>',
      fail: ['<ul>\n  <li>First</li>\n  <li>Second<li>\n  <li>Third</li>\n</ul>'],
    },
    'step-4': {
      pass: page(style('      li {\n        color: blue;\n      }'), '    <ul>\n      <li>a</li>\n    </ul>'),
      fail: [page(style('      ul {\n        font-size: 20px;\n      }'), '    <ul>\n      <li>a</li>\n    </ul>')],
    },
    'step-5': {
      pass: page('', '    <ul>\n      <li>First\n        <ul>\n          <li>a</li>\n          <li>b</li>\n        </ul>\n      </li>\n    </ul>'),
      fail: [page('', '    <ul>\n      <li>First</li>\n    </ul>\n    <ul>\n      <li>a</li>\n    </ul>')],
    },
  },
  'lesson-06': {
    warmup: {
      skipStarter: true,
      pass: '<ul>\n<li>a</li>\n<li>b</li>\n<li>c</li>\n</ul>',
      fail: ['x', '<ul>\n<li>a</li>\n</ul>'],
    },
    'step-1': {
      pass: page('', '    <img src="https://picsum.photos/300/200">'),
      fail: [page('', '    <img>'), page('', '    <img src="IMAGE_URL_HERE">'), page('', '    <img src="">')],
    },
    'step-2': {
      pass: page('', '    <img src="https://picsum.photos/300/200" alt="A picture of Space">'),
      fail: [page('', '    <img src="https://picsum.photos/300/200" alt="">')],
    },
    'step-3': {
      pass: page(style('      img {\n        width: 300px;\n      }'), '    <img src="https://picsum.photos/300/200" alt="A picture">'),
      fail: [
        page(style('      /* Add image width here */'), '    <img src="https://picsum.photos/300/200" alt="A picture">'),
        page(style('      img {\n        width 300px;\n      }'), '    <img src="https://picsum.photos/300/200" alt="A picture">'),
      ],
    },
    'step-4': {
      pass: page('', '    <img src="https://picsum.photos/300/200" alt="A picture">'),
      fail: [page('', '    <img src="https://picsum.photos/300/200 alt="A picture">')],
    },
    'step-5': {
      pass: page('', '    <img src="https://picsum.photos/300/200" alt="First">\n    <img src="https://picsum.photos/300/201" alt="Second">'),
      fail: [page('', '    <img src="https://picsum.photos/300/200" alt="First">\n    <img src="https://picsum.photos/300/201">')],
    },
  },
}

const LESSONS: Lesson[] = [lesson01, lesson02, lesson03, lesson04, lesson05, lesson06]

describe.each(LESSONS.map((l) => [l.id, l] as const))('%s', (lessonId, lesson) => {
  const cases = CASES[lessonId]

  it('has a test case for every editable step', () => {
    const editable = lesson.steps.filter((s) => !(lesson.lessonNumber === 1 && s.type === 'warmup'))
    expect(Object.keys(cases).sort()).toEqual(editable.map((s) => s.id).sort())
  })

  describe.each(Object.entries(cases))('%s', (stepId, c) => {
    const step = lesson.steps.find((s) => s.id === stepId)!

    it.runIf(!c.skipStarter)('rejects the untouched starter code', () => {
      expect(validate(step, starterOf(step), TOPIC)).toBe('fail')
    })

    it('accepts a correct answer', () => {
      expect(validate(step, c.pass, TOPIC)).toBe('pass')
    })

    it.each(c.fail)('rejects near-miss %#', (code) => {
      expect(validate(step, code, TOPIC)).toBe('fail')
    })
  })
})
