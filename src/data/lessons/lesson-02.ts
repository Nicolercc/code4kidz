import type { Lesson } from './lesson-01'

export const lesson02: Lesson = {
  id: 'lesson-02',
  lessonNumber: 2,
  title: 'Make a Big Title!',
  emoji: '🔤',
  xpReward: 50,

  byteIntro: `You came back — your streak is going!
Today we make your {topic} page look like it MEANS something.
Big titles. Small subtitles. Real hierarchy.
This is what every website, every newspaper, every app uses.`,

  byteStoryMoment: `Fun fact: the first heading I ever tried to make came out this big.
[imagine tiny tiny text]
I thought I had broken the whole internet.
Turns out I just needed an h1 instead of an h6. Now you will know that too.`,

  celebrationQuote: `Look at your {topic} page — those headings getting smaller as the numbers go up!
That is called hierarchy.
Real web designers use exactly this every single day.
And now so do you.`,

  steps: [
    // ── STEP 0: WARM-UP (60 seconds, no hearts, reviews Lesson 1) ──
    {
      id: 'warmup',
      type: 'warmup',
      instruction: `Quick warm-up before we start! 60 seconds.

Build a {topic} page skeleton — html, head, and body.
Put one heading about {topic} inside the body.

You have done this before. You have got this.`,
      // FIX 5: updated to clearly state what is being reviewed
      bytePrompt: `Show me an html page with a body tag.
Type the structure — html, head, body.
You learned this in Lesson 1.`,
      passMessage: `That is the {topic} page structure! Locked in. Let us keep going.`,
      hint: `Start with <html>, then <head></head>, then <body></body>.
Inside the body — add <h1>{topic}</h1>.
You already know this from Lesson 1!`,
      startingCode: '',
      xp: 10,
      validate: (_doc, rawCode?: string) => {
        const code = (rawCode ?? '').trim().toLowerCase()
        // DOMParser auto-inserts html/body; validate structure from raw code.
        const hasHtml = /<html(\s[^>]*)?>/.test(code) && code.includes('</html>')
        const hasBody = code.includes('<body>') && code.includes('</body>')
        const hasH1 = code.includes('<h1') && code.includes('</h1>')
        return hasHtml && hasBody && hasH1
      }
    },

    // ── STEP 1: WRITE — h1 about their topic ──
    {
      id: 'step-1',
      type: 'write',
      instruction: `Let us build on your {topic} page!

Add a big main heading about {topic}.
Inside your <body> tags, type:

<h1>{topic}</h1>

Make it yours — this is the title of YOUR page!`,
      bytePrompt: `h1 is the BIGGEST heading. The most important thing on your {topic} page.
What is the most important thing you want people to know about {topic}?`,
      passMessage: `{topic} has a big h1 heading! People can see it now.`,
      hint: `An h1 tag looks like this:
<h1>{topic}</h1>
The number after h tells you how big it is. h1 = biggest.
It goes inside your body tags.`,
      startingCode: `<html>
  <head>
    <title>{topic}</title>
  </head>
  <body>
    
  </body>
</html>`,
      xp: 10,
      validate: (doc) => {
        const h1 = doc.querySelector('h1')
        return h1 !== null && (h1.textContent?.length ?? 0) > 0
      }
    },

    // ── STEP 2: WRITE — h2 subtitle ──
    {
      id: 'step-2',
      type: 'write',
      instruction: `Now add a smaller subtitle BELOW your h1.

An h2 is smaller than h1 — it is for subtitles and supporting info.

Below your h1, add:
<h2>A fact or subtitle about {topic}</h2>`,
      bytePrompt: `h2 is smaller than h1 — like the subtitle under a book title.
What is one interesting thing about {topic} you want people to know?`,
      passMessage: `Your {topic} page now has two levels of headings. Looking real!`,
      hint: `The h2 tag goes AFTER your h1, inside the body:
<body>
  <h1>{topic}</h1>
  <h2>Subtitle about {topic}</h2>
</body>
Notice how it gets smaller? That is the hierarchy working!`,
      startingCode: `<html>
  <head><title>{topic}</title></head>
  <body>
    <h1>{topic}</h1>
    
  </body>
</html>`,
      xp: 10,
      validate: (doc) => {
        const h2 = doc.querySelector('h2')
        return h2 !== null && (h2.textContent?.length ?? 0) > 0
      }
    },

    // ── STEP 3: IDENTIFY — h3 for detail ──
    {
      id: 'step-3',
      type: 'identify',
      instruction: `Now the smallest heading — h3.

It is for details and third-level info about {topic}.

Add an h3 BELOW your h2:
<h3>One small detail about {topic}</h3>

Then look at all three headings in the preview — see them get smaller?
That is hierarchy!`,
      bytePrompt: `h1, h2, h3 — the heading hierarchy of your {topic} page.
h1 = BIGGEST (most important)
h2 = Medium (supporting)
h3 = Small (detail)
The New York Times uses this exact system!`,
      passMessage: `Three levels of headings on your {topic} page. That is real web design!`,
      hint: `Add an h3 after your h2:
<h2>Your {topic} subtitle</h2>
<h3>A small detail here</h3>
See the pattern? The numbers go up, the text gets smaller.`,
      startingCode: `<html>
  <head><title>{topic}</title></head>
  <body>
    <h1>{topic}</h1>
    <h2>Why {topic} is amazing</h2>
    
  </body>
</html>`,
      xp: 10,
      validate: (doc) => doc.querySelector('h3') !== null
    },

    // ── STEP 4: FIX — Missing slash in closing h2 tag ──
    {
      id: 'step-4',
      type: 'fix',
      instruction: `Byte broke the {topic} page! Can you find the mistake?

There is a broken heading below.
One of the tags is wrong — it is not closing properly.
Find it and fix it!`,
      bytePrompt: `I got so excited about the {topic} page that I typed too fast.
Something is wrong with one of these heading tags.
Look at the closing tags carefully — do they all have a / in them?`,
      passMessage: `You debugged the {topic} page! That skill is worth a lot.`,
      hint: `Every closing tag needs a forward slash / before the tag name.
<h2>This is correct</h2>   ← has the /
<h2>This is broken<h2>    ← missing the /
Look at each closing tag. Which one is missing its slash?`,
      startingCode: `<html>
  <head><title>{topic}</title></head>
  <body>
    <h1>{topic}</h1>
    <h2>Why I love {topic}<h2>
    <h3>One cool fact</h3>
  </body>
</html>`,
      xp: 10,
      validate: (_doc, rawCode?: string) => {
        if (rawCode !== undefined) {
          return rawCode.includes('</h2>') || rawCode.includes('</H2>')
        }
        const headings = _doc.querySelectorAll('h2')
        return headings.length >= 1
      }
    },

    // ── STEP 5: COMBINE — Second h2, full hierarchy ──
    {
      id: 'step-5',
      type: 'combine',
      editRequired: true,
      instruction: (topic: string) =>
        `Your ${topic} page already has a title and two headings.\n\n` +
        `Real websites have more than one section.\n` +
        `Add a second h2 below the h3 — write something different about ${topic}.\n\n` +
        `When you see two h2 sections in the preview — you did it.`,
      bytePrompt: (topic: string) =>
        `Two h2 sections means a real structure.\n` +
        `Your page. Your ${topic}. Your sections.\n` +
        `Add that h2 and watch the page grow.`,
      passMessage: `Your {topic} page is done! Look at that beautiful heading hierarchy.`,
      hint: `Your code should look like this:
<h1>{topic}</h1>
<h2>...</h2>
<h3>...</h3>
<h2>...</h2>  ← add this one!`,
      startingCode: `<html>
  <head><title>{topic}</title></head>
  <body>
    <h1>{topic}</h1>
    <h2>Why I love {topic}</h2>
    <h3>One cool fact</h3>
    
  </body>
</html>`,
      xp: 10,
      validate: (doc) => {
        const h2s = doc.querySelectorAll('h2')
        return h2s.length >= 2
      }
    },
  ]
}
