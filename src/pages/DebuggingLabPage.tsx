import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Editor from '../components/Editor'
import Preview from '../components/Preview'
import { lesson01 } from '../data/lessons/lesson-01'
import { checkAnswer } from '../utils/validator'

const tasks = [
  {
    title: 'Make a home for Robots',
    mission: 'Keep the Robots paragraph. Add opening and closing html tags around it.',
    starter: '<p>Robots</p>',
    topic: 'Robots',
  },
  {
    title: 'Fix the Space page',
    mission: 'Keep the Space heading. Find and fix the missing tag.',
    starter: '<html>\n  <h1>Space</h1>',
    topic: 'Space',
  },
] as const

const draftKey = 'code4kidz-debugging-lab'
type TaskIndex = 0 | 1

interface Draft {
  task: TaskIndex
  code: string
}

function readDraft(): Draft {
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null')
    if ((draft?.task === 0 || draft?.task === 1) && typeof draft.code === 'string') return draft
  } catch {
    // Practice still works when storage is unavailable.
  }
  return { task: 0, code: tasks[0].starter }
}

export default function DebuggingLabPage() {
  const [draft, setDraft] = useState(readDraft)
  const [feedback, setFeedback] = useState('')
  const [passed, setPassed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const task = tasks[draft.task]

  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(draft))
    } catch {
      // The current session remains usable through React state.
    }
  }, [draft])

  useEffect(() => {
    heading.current?.focus()
  }, [draft.task])

  function editCode(code: string) {
    setDraft({ task: draft.task, code })
    setFeedback('')
    setPassed(false)
  }

  function checkCode() {
    const answer = checkAnswer(lesson01.steps[1], draft.code, task.topic)
    if (answer.result === 'fail') {
      setFeedback(draft.task === 0 ? answer.message : 'Check the tags around the Space heading and try again.')
      return
    }

    // A structural pass alone can succeed with an empty page. The lab also
    // asks learners to preserve the visible content inside the HTML tags.
    const wrappedContent = draft.task === 0
      ? /^\s*<html>\s*<p>\s*Robots\s*<\/p>\s*<\/html>\s*$/i
      : /^\s*<html>\s*<h1>\s*Space\s*<\/h1>\s*<\/html>\s*$/i
    if (!wrappedContent.test(draft.code)) {
      setFeedback(`Keep the ${task.topic} text and its tags inside the html tags.`)
      return
    }

    setPassed(true)
    setFeedback(draft.task === 0
      ? 'You added both html tags and kept Robots on the page.'
      : 'You fixed a new page on your own. The preview can show your text even when a tag is missing.')
  }

  function changeTask(nextTask: TaskIndex) {
    setDraft({ task: nextTask, code: tasks[nextTask].starter })
    setPassed(false)
    setFeedback('')
    setShowHint(false)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <Link to="/" className="inline-flex min-h-11 items-center font-semibold text-brand-purple underline">Code4Kidz home</Link>
      <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Byte’s Debugging Lab</h1>
      <h2 ref={heading} tabIndex={-1} className="mt-6 text-xl font-bold">{task.title}</h2>
      <p className="mt-2 max-w-prose text-brand-mid">{task.mission}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <section aria-labelledby="lab-code-title" className="min-w-0">
          <h3 id="lab-code-title" className="mb-2 font-semibold">Code editor</h3>
          <div className="h-48 overflow-hidden rounded-xl border border-brand-border">
            <Editor key={draft.task} value={draft.code} onChange={editCode} onSubmit={checkCode} />
          </div>
        </section>
        <section aria-labelledby="lab-preview-title" className="min-w-0">
          <h3 id="lab-preview-title" className="mb-2 font-semibold">Live preview</h3>
          <div className="h-36 md:h-48"><Preview code={draft.code} /></div>
        </section>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={checkCode} className="min-h-11 rounded-lg bg-brand-purple px-4 font-semibold text-white">Check my code</button>
        {draft.task === 0 && !passed && (
          <button type="button" aria-expanded={showHint} aria-controls="lab-hint" onClick={() => setShowHint(!showHint)}
            className="min-h-11 rounded-lg border border-brand-purple px-4 font-semibold text-brand-purple">
            {showHint ? 'Hide hint' : 'Need a hint?'}
          </button>
        )}
      </div>
      <p role="status" className="mt-3 min-h-6 font-semibold text-brand-dark">{feedback}</p>
      {draft.task === 0 && !passed && (
        <p id="lab-hint" hidden={!showHint} className="mt-2 rounded-lg bg-brand-purpleL p-3">
          Put <code>&lt;html&gt;</code> before the paragraph. Use a slash in the tag that goes after it.
        </p>
      )}
      {passed && (
        <button type="button" onClick={() => changeTask(draft.task === 0 ? 1 : 0)}
          className="mt-3 min-h-11 rounded-lg bg-brand-purple px-4 font-semibold text-white">
          {draft.task === 0 ? 'Try a new page' : 'Start again'}
        </button>
      )}
    </main>
  )
}
