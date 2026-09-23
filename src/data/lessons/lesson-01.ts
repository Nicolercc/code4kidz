type StrOrFn = string | ((topic: string) => string)

export interface LessonStep {
  id: string
  type: 'warmup' | 'write' | 'fix' | 'identify' | 'combine'
  instruction: StrOrFn
  bytePrompt: StrOrFn
  passMessage?: StrOrFn
  hint: StrOrFn
  startingCode: StrOrFn
  xp: number
  // FIX 3: if true, the step will NOT pass until the kid types at least one character
  editRequired?: boolean
  // iframeWin is provided for CSS computed-style checks (lessons 4+)
  validate: (doc: Document, rawCode?: string, iframeWin?: Window) => boolean
}

export interface Lesson {
  id: string
  lessonNumber: number
  title: string
  emoji: string
  xpReward: number
  byteIntro: StrOrFn
  byteStoryMoment: string
  steps: LessonStep[]
  celebrationQuote: StrOrFn
}

export const lesson01: Lesson = {
  id: 'lesson-01',
  lessonNumber: 1,
  title: 'Say Hello to the Web!',
  emoji: '👋',
  xpReward: 50,

  byteIntro: `Hey! I am Byte — your robot coding buddy!
Today you are going to build your FIRST ever webpage — about {topic}!
Millions of people will be able to see what you make.
Let us start RIGHT NOW.`,

  byteStoryMoment: `I have wanted to make my own webpage for SO long.
I tried once and the whole thing was just a blank screen.
I think this time will be different. Because this time I have you.`,

  celebrationQuote: `YOU BUILT IT!
A real webpage about {topic} — the same kind of code Google uses.
You are not pretending to code. You ARE coding.
I am so proud of us.`,

  steps: [
    // ── STEP 0: WARM-UP (Lesson 1 only — cinematic splash, auto-advances) ──
    {
      id: 'warmup',
      type: 'warmup',
      instruction: `No warm-up for Lesson 1 — this IS the warm-up!
Just open and start. We are building your {topic} page right now.`,
      bytePrompt: `This is your first time here — we jump straight in.
Today we build a {topic} page together. Ready? Let us go.`,
      passMessage: `Here we go! Time to build something real.`,
      hint: '',
      startingCode: '',
      xp: 0,
      validate: () => true
    },

    // ── STEP 1: WRITE — The container ──
    {
      id: 'step-1',
      type: 'write',
      instruction: `Every webpage on the internet starts with a container.
Type this exactly:

<html></html>

This tells the browser: "A webpage lives here."
When you type it correctly, you will move to the next step!`,
      bytePrompt: `This one tag — html — is the very first thing on EVERY website.
YouTube starts with it. Roblox starts with it.
Now your {topic} page does too.`,
      passMessage: (topic: string) =>
        `YES! <html> is the container of EVERY website.\n` +
        `Google starts with it. YouTube starts with it.\n` +
        `Now your ${topic} page does too.`,
      hint: `It starts with < and ends with >. The word inside is html.
Opening: <html>  Closing: </html>
The / in the closing tag tells the browser where it ends.`,
      startingCode: '',
      xp: 10,
      // Use rawCode — DOMParser always inserts <html> even for empty strings.
      validate: (_doc, rawCode?: string) => {
        const code = (rawCode ?? '').trim().toLowerCase()
        return /<html(\s[^>]*)?>/.test(code) && code.includes('</html>')
      }
    },

    // ── STEP 2: WRITE — The head ──
    {
      id: 'step-2',
      type: 'write',
      instruction: `Great! Now add a head section INSIDE your html tags.
The head holds secret info about your {topic} page.

Type this inside your <html> tags:
<head></head>`,
      bytePrompt: `The head is like the brain of your {topic} page.
People cannot see it, but it controls everything — tab titles, page settings.`,
      passMessage: `The brain of your {topic} page is in place!`,
      hint: `The head tag goes inside the html tags.
It should look like this:
<html>
  <head></head>
</html>
Notice it is INSIDE — between the opening and closing html tags.`,
      startingCode: '<html>\n  \n</html>',
      xp: 10,
      validate: (_doc, rawCode?: string) => {
        const code = (rawCode ?? '').trim().toLowerCase()
        return code.includes('<head>') && code.includes('</head>')
      }
    },

    // ── STEP 3: WRITE — The title ──
    {
      id: 'step-3',
      type: 'write',
      instruction: `Now give your {topic} page a name!
Inside your <head> tags, type:

<title>{topic}</title>

Watch it appear in the browser tab above the preview!`,
      bytePrompt: `The title shows up in the little tab at the top of the browser.
Your page is called {topic} — let the whole browser know it!`,
      passMessage: `The browser tab now says your topic. That is YOUR page name!`,
      hint: `The title goes INSIDE the head tags. Like this:
<head>
  <title>{topic}</title>
</head>
Make sure it has a / in the closing tag: </title>`,
      startingCode: '<html>\n  <head>\n    \n  </head>\n</html>',
      xp: 10,
      validate: (doc) => {
        const title = doc.querySelector('title')
        return title !== null && (title.textContent?.length ?? 0) > 0
      }
    },

    // ── STEP 4: FIX — The body (bug: missing closing tag) ──
    {
      id: 'step-4',
      type: 'fix',
      instruction: `Something is broken! Can you find the mistake?

Byte tried to add a body section — the part people actually SEE —
but something is wrong. Fix it so the {topic} page works correctly.`,
      bytePrompt: `Uh oh... I made a mistake while building your {topic} page.
Look carefully at the body tag. Something is missing.
Every opening tag needs a closing partner!`,
      passMessage: `You found it! The {topic} page is fixed. Nice debugging!`,
      hint: `Every HTML tag comes in pairs — one that opens and one that closes.
The closing tag has a / before the word.
Look at the body tags: does one of them have a / and the other does not?`,
      startingCode: `<html>
  <head>
    <title>{topic}</title>
  </head>
  <body>
    {topic} is awesome!
  <body>
</html>`,
      xp: 10,
      // FIX 6: raw code check — browser auto-closes tags in DOM, so check rawCode
      validate: (_doc, rawCode?: string) => {
        if (rawCode !== undefined) {
          return rawCode.includes('</body>') || rawCode.includes('</BODY>')
        }
        return _doc.querySelector('body') !== null
      }
    },

    // ── STEP 5: COMBINE — First words on screen ──
    {
      id: 'step-5',
      type: 'combine',
      editRequired: true,
      instruction: (topic: string) =>
        `Your ${topic} page is almost ready.\n\n` +
        `See the h1 tag? That is YOUR main title.\n` +
        `Click on it and change the words to something\n` +
        `real about ${topic} — in your own words.\n\n` +
        `When you see YOUR words in the preview — you did it.`,
      bytePrompt: (topic: string) =>
        `This is the moment.\n` +
        `Your words. Your page. Your ${topic}.\n` +
        `Change that h1 and watch the preview.`,
      passMessage: `YES! Your {topic} page has words on it. People can read this!`,
      hint: `The h1 tag is inside the body — that is the big heading.
Change the text between the h1 tags to anything about {topic}.
<body>
  <h1>Type your {topic} words here</h1>
</body>`,
      startingCode: `<html>
  <head>
    <title>{topic}</title>
  </head>
  <body>
    <h1>{topic}</h1>
  </body>
</html>`,
      xp: 10,
      validate: (doc) => {
        const h1 = doc.querySelector('h1')
        return h1 !== null && (h1.textContent?.length ?? 0) > 0
      }
    },
  ]
}
