import type { Lesson } from './lesson-01'

export const lesson05: Lesson = {
  id: 'lesson-05',
  lessonNumber: 5,
  title: 'Make a List of Things',
  emoji: '📋',
  xpReward: 50,

  byteIntro: (topic: string) =>
    `What are the TOP 5 things about ${topic}?\n` +
    `Or a collection of facts?\n` +
    `LISTS are how you organize information on the web.\n` +
    `And they are EVERYWHERE.`,

  byteStoryMoment:
    `I once made a list of 47 things I wanted to learn.\n` +
    `I forgot the closing tags on almost all of them.\n` +
    `The browser tried its best.\n` +
    `It looked like modern art.`,

  celebrationQuote: (topic: string) =>
    `A nested list about ${topic}!\n` +
    `That is the same structure Wikipedia uses\n` +
    `to organize every article on the site.\n` +
    `Seriously.`,

  steps: [
    {
      id: 'warmup',
      type: 'warmup',
      instruction: (topic: string) =>
        `Warm-up — 60 seconds!\n\n` +
        `Give your h1 a color in CSS.\n` +
        `One rule: h1 { color: [any color]; }\n\n` +
        `Your ${topic} page. Your color choice.`,
      // FIX 5: updated review prompt
      bytePrompt: `Add a style tag and give your h1 a color.
One CSS rule. Just one.
You learned this in Lesson 4.`,
      hint: `Add a style tag in the head, then:\n` +
            `h1 {\n` +
            `  color: red;\n` +
            `}\n` +
            `Change red to any color name you like.`,
      startingCode: '',
      xp: 10,
      validate: (_doc: Document, _raw?: string, iframeWin?: Window) => {
        if (!iframeWin) return false
        const h1 = iframeWin.document.querySelector('h1')
        if (!h1) return false
        return iframeWin.getComputedStyle(h1).color !== 'rgb(0, 0, 0)'
      },
    },

    {
      id: 'step-1',
      type: 'write',
      instruction: (topic: string) =>
        `An unordered list gives you bullet points.\n\n` +
        `Type this in your body:\n\n` +
        `<ul>\n` +
        `  <li>Thing 1 about ${topic}</li>\n` +
        `  <li>Thing 2 about ${topic}</li>\n` +
        `  <li>Thing 3 about ${topic}</li>\n` +
        `</ul>\n\n` +
        `Change the items to real things about ${topic}!`,
      bytePrompt: (topic: string) =>
        `ul stands for Unordered List — bullet points.\n` +
        `li stands for List Item — each bullet.\n` +
        `What are three things about ${topic} worth listing?`,
      hint: `ul is the container, li is each item:\n` +
            `<ul>\n` +
            `  <li>First item</li>\n` +
            `  <li>Second item</li>\n` +
            `  <li>Third item</li>\n` +
            `</ul>\n` +
            `Make sure each li has a closing </li>`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    \n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('ul') !== null &&
        doc.querySelectorAll('li').length >= 3,
    },

    {
      id: 'step-2',
      type: 'write',
      instruction: (topic: string) =>
        `Now add a numbered list for your TOP 5!\n\n` +
        `ol = Ordered List (numbered automatically)\n\n` +
        `<ol>\n` +
        `  <li>Best thing about ${topic}</li>\n` +
        `  <li>Second best thing</li>\n` +
        `  <li>Third best</li>\n` +
        `  <li>Fourth</li>\n` +
        `  <li>Fifth</li>\n` +
        `</ol>`,
      bytePrompt: (topic: string) =>
        `ol is like ul but numbered.\n` +
        `The browser counts for you — you just write the li items.\n` +
        `Rank your top 5 things about ${topic}.\n` +
        `Number 1 is the best. No pressure.`,
      hint: `ol works exactly like ul but creates numbers:\n` +
            `<ol>\n` +
            `  <li>First (gets the number 1)</li>\n` +
            `  <li>Second (gets the number 2)</li>\n` +
            `</ol>\n` +
            `You do not type the numbers — the browser does that!`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <ul>\n` +
        `      <li>One thing</li>\n` +
        `      <li>Another thing</li>\n` +
        `      <li>A third thing</li>\n` +
        `    </ul>\n` +
        `    \n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('ol') !== null &&
        doc.querySelectorAll('ol li').length >= 3,
    },

    {
      id: 'step-3',
      type: 'identify',
      instruction: (_topic: string) =>
        `Byte's list is broken. One item is not showing up.\n\n` +
        `Find the missing tag and fix it.\n` +
        `Clue: look at the list items carefully.`,
      bytePrompt: (_topic: string) =>
        `One of my list items is missing something.\n` +
        `Look at each li tag.\n` +
        `Every item needs both an opening tag AND a closing tag.\n` +
        `Which one is incomplete?`,
      hint: `Each list item needs:\n` +
            `<li>Content here</li>\n` +
            `Both the opening <li> AND the closing </li>\n` +
            `The missing tag is probably a closing </li>`,
      startingCode: (topic: string) =>
        `<ul>\n` +
        `  <li>First thing about ${topic}</li>\n` +
        `  <li>Second thing about ${topic}\n` +
        `  <li>Third thing about ${topic}</li>\n` +
        `</ul>`,
      xp: 10,
      validate: (_doc: Document, rawCode?: string) =>
        (rawCode ?? '').includes('</li>') || (rawCode ?? '').includes('</LI>'),
    },

    {
      id: 'step-4',
      type: 'combine',
      editRequired: true,
      instruction: (topic: string) =>
        `Your ${topic} list is in the preview.\n\n` +
        `Now give the list items a color.\n` +
        `Add this inside the style tags: li { color: [your color]; }\n\n` +
        `When you see colored list items in the preview — you did it.`,
      bytePrompt: (topic: string) =>
        `CSS works on list items too.\n` +
        `Your color. Your list. Your ${topic}.\n` +
        `Add that li color and watch the preview.`,
      hint: `Use li as the CSS selector:\n` +
            `li {\n` +
            `  color: blue;\n` +
            `}\n` +
            `This affects ALL list items on the page.`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head>\n` +
        `    <title>${topic}</title>\n` +
        `    <style>\n` +
        `      /* Style your list here */\n` +
        `      \n` +
        `    </style>\n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <ul>\n` +
        `      <li>First thing about ${topic}</li>\n` +
        `      <li>Second thing about ${topic}</li>\n` +
        `      <li>Third thing about ${topic}</li>\n` +
        `    </ul>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (_doc: Document, _raw?: string, iframeWin?: Window) => {
        if (!iframeWin) return false
        const li = iframeWin.document.querySelector('li')
        if (!li) return false
        return iframeWin.getComputedStyle(li).color !== 'rgb(0, 0, 0)'
      },
    },

    {
      id: 'step-5',
      type: 'combine',
      editRequired: true,
      instruction: (topic: string) =>
        `Your ${topic} list is almost complete.\n\n` +
        `See the first li? It has a comment waiting for you.\n` +
        `Add a nested ul with two li items inside that first li.\n\n` +
        `When you see a list inside a list in the preview — you did it.`,
      bytePrompt: (topic: string) =>
        `A list inside a list.\n` +
        `Your details. Your page. Your ${topic}.\n` +
        `Add that nested ul and watch the structure appear.`,
      hint: `Put a ul INSIDE one of your li tags:\n` +
            `<li>Main item\n` +
            `  <ul>\n` +
            `    <li>Sub-item 1</li>\n` +
            `    <li>Sub-item 2</li>\n` +
            `  </ul>\n` +
            `</li>\n` +
            `Make sure the inner ul is BEFORE the closing </li>`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <ul>\n` +
        `      <li>First thing about ${topic}\n` +
        `        <!-- Add a nested ul here -->\n` +
        `      </li>\n` +
        `      <li>Second thing about ${topic}</li>\n` +
        `      <li>Third thing about ${topic}</li>\n` +
        `    </ul>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) => {
        const nestedUl = doc.querySelector('li ul') || doc.querySelector('li ol')
        return nestedUl !== null
      },
    },
  ],
}
