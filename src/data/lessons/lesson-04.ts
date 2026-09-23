import type { Lesson } from './lesson-01'

export const lesson04: Lesson = {
  id: 'lesson-04',
  lessonNumber: 4,
  title: 'Paint With Colors!',
  emoji: '🎨',
  xpReward: 50,

  byteIntro: (topic: string) =>
    `Your ${topic} page has structure.\n` +
    `Now let us give it a VIBE.\n` +
    `What colors FEEL like ${topic}?\n` +
    `Because you get to choose — and there are 16 MILLION options.`,

  byteStoryMoment:
    `My first CSS experiment turned my entire page completely black.\n` +
    `Not on purpose.\n` +
    `I typed background-color: black just to see what would happen.\n` +
    `Now I know. Now YOU know too.`,

  celebrationQuote: (topic: string) =>
    `Your ${topic} page has a VIBE now!\n` +
    `Graphic designers spend entire careers choosing colors.\n` +
    `You just became a color designer in 5 minutes.`,

  steps: [
    {
      id: 'warmup',
      type: 'warmup',
      instruction: (topic: string) =>
        `Warm-up — 60 seconds!\n\n` +
        `Write three p tags — each one a sentence about ${topic}.\n` +
        `No colors yet. Just three paragraphs.\n` +
        `You have done this. Show me.`,
      // FIX 5: updated review prompt
      bytePrompt: `Write three p tags — each one a sentence about your topic.
Just paragraphs. No CSS yet.
You learned this in Lesson 3.`,
      hint: `Three p tags:\n` +
            `<p>Sentence one.</p>\n` +
            `<p>Sentence two.</p>\n` +
            `<p>Sentence three.</p>`,
      startingCode: '',
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelectorAll('p').length >= 3,
    },

    {
      id: 'step-1',
      type: 'write',
      instruction: (_topic: string) =>
        `CSS lives in a special tag called style.\n\n` +
        `Add this inside your <head> tags:\n\n` +
        `<style>\n` +
        `\n` +
        `</style>\n\n` +
        `This is where all your colors will go.`,
      bytePrompt: (_topic: string) =>
        `CSS is a completely different language from HTML.\n` +
        `HTML says what things ARE.\n` +
        `CSS says what things LOOK LIKE.\n` +
        `The style tag is where CSS lives.`,
      hint: `The style tag goes INSIDE your head section:\n` +
            `<head>\n` +
            `  <title>My Page</title>\n` +
            `  <style>\n` +
            `  </style>\n` +
            `</head>`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head>\n` +
        `    <title>${topic}</title>\n` +
        `    \n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <p>Something about ${topic}.</p>\n` +
        `    <p>A fact about ${topic}.</p>\n` +
        `    <p>Why ${topic} matters to me.</p>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('style') !== null,
    },

    {
      id: 'step-2',
      type: 'write',
      instruction: (topic: string) =>
        `Now make your heading a color that FEELS like ${topic}!\n\n` +
        `Inside your style tags, type:\n` +
        `h1 {\n` +
        `  color: hotpink;\n` +
        `}\n\n` +
        `Change "hotpink" to ANY color you want.\n` +
        `Try: red, blue, gold, coral, purple, orange...`,
      bytePrompt: (topic: string) =>
        `What color is ${topic} in your mind?\n` +
        `Give that color to your h1 heading.\n` +
        `CSS uses a colon between the property and the value.\n` +
        `color: [color name];`,
      hint: `CSS looks like this:\n` +
            `h1 {\n` +
            `  color: red;\n` +
            `}\n` +
            `The part before the colon is the PROPERTY.\n` +
            `The part after is the VALUE. It ends with a semicolon ;`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head>\n` +
        `    <title>${topic}</title>\n` +
        `    <style>\n` +
        `      \n` +
        `    </style>\n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <p>Something about ${topic}.</p>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (_doc: Document, _raw?: string, iframeWin?: Window) => {
        if (!iframeWin) return false
        const h1 = iframeWin.document.querySelector('h1')
        if (!h1) return false
        const color = iframeWin.getComputedStyle(h1).color
        return color !== 'rgb(0, 0, 0)' && color !== ''
      },
    },

    {
      id: 'step-3',
      type: 'identify',
      instruction: (topic: string) =>
        `Now change the page background color!\n\n` +
        `Inside your style, add:\n` +
        `body {\n` +
        `  background-color: lightyellow;\n` +
        `}\n\n` +
        `Change "lightyellow" to a color that fits ${topic}.\n` +
        `Watch the whole page change in the preview!`,
      bytePrompt: (_topic: string) =>
        `background-color changes the color BEHIND everything.\n` +
        `The entire page background.\n` +
        `Pick something that makes your h1 color pop.\n` +
        `Contrast is the secret of good design.`,
      hint: `Add this inside your style tags:\n` +
            `body {\n` +
            `  background-color: lightyellow;\n` +
            `}\n` +
            `"body" selects the entire page.\n` +
            `"background-color" is the property.\n` +
            `The color name goes after the colon.`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head>\n` +
        `    <title>${topic}</title>\n` +
        `    <style>\n` +
        `      h1 {\n` +
        `        color: purple;\n` +
        `      }\n` +
        `      \n` +
        `    </style>\n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <p>Something about ${topic}.</p>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (_doc: Document, _raw?: string, iframeWin?: Window) => {
        if (!iframeWin) return false
        const bg = iframeWin.getComputedStyle(iframeWin.document.body).backgroundColor
        return bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' && bg !== ''
      },
    },

    {
      id: 'step-4',
      type: 'fix',
      instruction: (_topic: string) =>
        `Byte's CSS is broken! The color is not showing up.\n\n` +
        `Find the mistake and fix it.\n` +
        `Clue: CSS properties always need a colon between the name and the value.`,
      bytePrompt: (_topic: string) =>
        `I wrote this CSS and it does not work.\n` +
        `Can you see what I did wrong?\n` +
        `Every CSS rule needs a colon between the property and the value.\n` +
        `color: red — see the colon? Find where mine is missing.`,
      hint: `CSS always looks like this:\n` +
            `property: value;\n` +
            `The COLON goes between the property name and the value.\n` +
            `Without it, the browser ignores the rule completely.`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head>\n` +
        `    <title>${topic}</title>\n` +
        `    <style>\n` +
        `      h1 {\n` +
        `        color purple;\n` +
        `      }\n` +
        `      body {\n` +
        `        background-color: lightyellow;\n` +
        `      }\n` +
        `    </style>\n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <p>Something about ${topic}.</p>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (_doc: Document, _raw?: string, iframeWin?: Window) => {
        if (!iframeWin) return false
        const h1 = iframeWin.document.querySelector('h1')
        if (!h1) return false
        return iframeWin.getComputedStyle(h1).color !== 'rgb(0, 0, 0)'
      },
    },

    {
      id: 'step-5',
      type: 'combine',
      editRequired: true,
      instruction: (topic: string) =>
        `Your ${topic} page already has a background and an h1 color.\n\n` +
        `Now give h2 and p their own colors too.\n` +
        `Add CSS rules for h2 and p inside the style tags.\n\n` +
        `When you see THREE colored elements in the preview — you did it.`,
      bytePrompt: (topic: string) =>
        `Three elements. Three colors. One vibe.\n` +
        `Your palette. Your page. Your ${topic}.\n` +
        `Add h2 and p colors and watch it come alive.`,
      hint: `Add separate CSS rules for each element:\n` +
            `h1 { color: purple; }\n` +
            `h2 { color: orange; }\n` +
            `p { color: darkblue; }\n` +
            `Each rule targets a different element.`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head>\n` +
        `    <title>${topic}</title>\n` +
        `    <style>\n` +
        `      body {\n` +
        `        background-color: lightyellow;\n` +
        `      }\n` +
        `      h1 {\n` +
        `        color: purple;\n` +
        `      }\n` +
        `      /* Add h2 and p colors below */\n` +
        `      \n` +
        `    </style>\n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <h2>Why it is amazing</h2>\n` +
        `    <p>Your paragraph about ${topic}.</p>\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (_doc: Document, _raw?: string, iframeWin?: Window) => {
        if (!iframeWin) return false
        const iDoc = iframeWin.document
        const h1 = iDoc.querySelector('h1')
        const hasBackground = iframeWin.getComputedStyle(iDoc.body).backgroundColor !== 'rgba(0, 0, 0, 0)'
        const hasColor = h1 && iframeWin.getComputedStyle(h1).color !== 'rgb(0, 0, 0)'
        return hasBackground && !!hasColor
      },
    },
  ],
}
