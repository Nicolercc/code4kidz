import type { Lesson } from './lesson-01'

export const lesson03: Lesson = {
  id: 'lesson-03',
  lessonNumber: 3,
  title: 'Write Your Story',
  emoji: '📝',
  xpReward: 50,

  byteIntro: (topic: string) =>
    `A heading tells people WHAT the page is about.\n` +
    `A paragraph tells them the STORY.\n` +
    `Let us make your ${topic} page say something AMAZING.`,

  byteStoryMoment:
    `When I first learned about paragraphs I wrote one sentence ` +
    `that went on for forty words with no punctuation ` +
    `because I thought that was how computers read things.\n` +
    `It was not.`,

  celebrationQuote: (topic: string) =>
    `THREE paragraphs about ${topic}!\n` +
    `Your page has real content that real people could read.\n` +
    `You are a writer AND a coder.`,

  steps: [
    {
      id: 'warmup',
      type: 'warmup',
      instruction: (topic: string) =>
        `Quick warm-up — 60 seconds, no pressure!\n\n` +
        `Add an h1 about ${topic} and an h2 below it.\n` +
        `You already know how to do this from Lesson 2.`,
      // FIX 5: updated review prompt
      bytePrompt: `Add an h1 and an h2 to a page.
Your topic as h1, any subtitle as h2.
You learned this in Lesson 2.`,
      hint: `An h1 is your biggest heading. An h2 is smaller.\n` +
            `<h1>Main title</h1>\n` +
            `<h2>Subtitle here</h2>`,
      startingCode: '',
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('h1') !== null &&
        doc.querySelector('h2') !== null,
    },

    {
      id: 'step-1',
      type: 'write',
      instruction: (topic: string) =>
        `A paragraph is where you write actual sentences.\n\n` +
        `Below your headings, type:\n` +
        `<p>One sentence about ${topic} here.</p>\n\n` +
        `Write YOUR sentence — something true about ${topic}!`,
      bytePrompt: (topic: string) =>
        `The p tag is for paragraphs — real sentences people read.\n` +
        `Every article, every Wikipedia entry, every blog post\n` +
        `is made of p tags.\n` +
        `Tell me something true about ${topic}.`,
      hint: `A paragraph opens with <p> and closes with </p>.\n` +
            `Everything between those two tags is what people read.\n` +
            `Example: <p>This is my sentence.</p>`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <h2>Why I love it</h2>\n` +
        `    \n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('p') !== null &&
        (doc.querySelector('p')?.textContent?.length ?? 0) > 0,
    },

    {
      id: 'step-2',
      type: 'write',
      instruction: (topic: string) =>
        `Good! Now add a SECOND paragraph.\n\n` +
        `This one: write a fact about ${topic} that most people don't know.\n\n` +
        `Add another <p>...</p> below your first one.`,
      bytePrompt: (topic: string) =>
        `Two paragraphs means more information for your readers.\n` +
        `What is something interesting about ${topic}\n` +
        `that would surprise someone?`,
      hint: `Just add another p tag below the first one:\n` +
            `<p>First paragraph.</p>\n` +
            `<p>Second paragraph here.</p>`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <h2>Why I love it</h2>\n` +
        `    <p>Your first sentence about ${topic}.</p>\n` +
        `    \n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelectorAll('p').length >= 2,
    },

    {
      id: 'step-3',
      type: 'identify',
      instruction: (topic: string) =>
        `Now add a THIRD paragraph to complete the story.\n\n` +
        `Think of your three paragraphs like this:\n` +
        `• Paragraph 1: Introduce ${topic}\n` +
        `• Paragraph 2: A cool fact about ${topic}\n` +
        `• Paragraph 3: Why ${topic} matters to YOU\n\n` +
        `Add that third paragraph now!`,
      bytePrompt: (topic: string) =>
        `Three paragraphs tell a story: beginning, middle, end.\n` +
        `Every article you have ever read does this.\n` +
        `What does ${topic} mean to YOU? That is paragraph 3.`,
      hint: `Add one more paragraph — your third and final one:\n` +
            `<p>Third paragraph here — personal and real.</p>`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <h2>Why I love it</h2>\n` +
        `    <p>First fact about ${topic}.</p>\n` +
        `    <p>Something surprising about ${topic}.</p>\n` +
        `    \n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelectorAll('p').length >= 3,
    },

    {
      id: 'step-4',
      type: 'fix',
      instruction: (_topic: string) =>
        `Byte's code has a bug! One paragraph is not closed properly.\n\n` +
        `Find the missing closing tag and fix it.\n` +
        `The preview looks broken — that is your clue!`,
      bytePrompt: (_topic: string) =>
        `Ugh — I did it again. I forgot to close a tag.\n` +
        `Look at the paragraph tags carefully.\n` +
        `Every <p> needs a </p> to close it.\n` +
        `Which one is missing its partner?`,
      hint: `A paragraph needs two tags: one to open, one to close.\n` +
            `Open: <p>   Close: </p>\n` +
            `The closing tag has a forward slash /\n` +
            `Find the paragraph that is missing its </p>`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <p>This is the first fact about ${topic}.</p>\n` +
        `    <p>This is something surprising.\n` +
        `    <p>And this is why it matters to me.</p>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (_doc: Document, rawCode?: string) =>
        (rawCode ?? '').includes('</p>') || (rawCode ?? '').includes('</P>'),
    },

    {
      id: 'step-5',
      type: 'combine',
      editRequired: true,
      instruction: (topic: string) =>
        `Your ${topic} page is almost ready.\n\n` +
        `See the three p tags? Those are your paragraphs.\n` +
        `Replace each placeholder sentence with something\n` +
        `real about ${topic} — in your own words.\n\n` +
        `When you see YOUR words in the preview — you did it.`,
      bytePrompt: (topic: string) =>
        `This is the moment.\n` +
        `Your sentences. Your page. Your ${topic}.\n` +
        `Replace those placeholders and watch the preview.`,
      hint: `Make sure you have:\n` +
            `1. An h1 tag\n` +
            `2. An h2 tag\n` +
            `3. Three or more p tags\n` +
            `All inside the body. All properly opened and closed.`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <h2>My favorite thing</h2>\n` +
        `    <p>Write your first sentence here.</p>\n` +
        `    <p>Write a fact here.</p>\n` +
        `    <p>Write why it matters to you here.</p>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('h1') !== null &&
        doc.querySelector('h2') !== null &&
        doc.querySelectorAll('p').length >= 3,
    },
  ],
}
