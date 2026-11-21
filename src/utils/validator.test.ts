import { describe, expect, it } from 'vitest'
import { lesson01 } from '../data/lessons/lesson-01'
import { checkAnswer, RETRY_MESSAGE, validate } from './validator'

const step = lesson01.steps[1]

describe('HTML container feedback', () => {
  it.each([
    ['<p>Robots</p>', /appears in the preview/],
    ['<HTML>', /closing html tag with a slash/],
    ['<p>', RETRY_MESSAGE],
    ['&lt;html&gt;', RETRY_MESSAGE],
    ['<!-- <html></html> -->', RETRY_MESSAGE],
  ])('explains an explicit failure for %s without changing the grade', (code, message) => {
    expect(validate(step, code, 'Robots')).toBe('fail')
    expect(checkAnswer(step, code, 'Robots')).toEqual({
      result: 'fail',
      message: typeof message === 'string' ? message : expect.stringMatching(message),
    })
  })

  it.each(['<html></html>', '<HTML lang="en"><p>Robots</p></HTML>'])('accepts %s', (code) => {
    expect(checkAnswer(step, code, 'Robots')).toEqual({ result: 'pass' })
  })
})
