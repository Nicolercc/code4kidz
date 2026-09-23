import type { Lesson } from './lesson-01'

export const lesson06: Lesson = {
  id: 'lesson-06',
  lessonNumber: 6,
  title: 'Add a Picture!',
  emoji: '🖼️',
  xpReward: 50,

  byteIntro: (topic: string) =>
    `Words are great.\n` +
    `But a picture of ${topic}?\n` +
    `NOW that is a webpage.\n` +
    `Let us add an image and make this thing feel REAL.`,

  byteStoryMoment:
    `I spent an hour once staring at a tiny broken image icon.\n` +
    `The tag was perfect. The URL pointed to a file I had deleted.\n` +
    `One wrong character. One hour.\n` +
    `This one we will get right.`,

  celebrationQuote: (topic: string) =>
    `Your ${topic} page has a PICTURE!\n` +
    `Every photo on every news site,\n` +
    `every product image on Amazon —\n` +
    `it all works exactly like what you just did.`,

  steps: [
    {
      id: 'warmup',
      type: 'warmup',
      instruction: (topic: string) =>
        `Warm-up — 60 seconds!\n\n` +
        `Make an unordered list of 3 things about ${topic}.\n` +
        `ul tag with 3 li items inside.\n` +
        `You have done this before. Quick!`,
      // FIX 5: updated review prompt
      bytePrompt: `Make an unordered list — ul with three li items.
About anything you want.
You learned this in Lesson 5.`,
      hint: `<ul>\n` +
            `  <li>Thing 1</li>\n` +
            `  <li>Thing 2</li>\n` +
            `  <li>Thing 3</li>\n` +
            `</ul>`,
      startingCode: '',
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('ul') !== null &&
        doc.querySelectorAll('li').length >= 3,
    },

    {
      id: 'step-1',
      type: 'write',
      instruction: (topic: string) =>
        `Images use a special tag: img\n\n` +
        `Add this inside your body:\n` +
        `<img src="IMAGE_URL_HERE">\n\n` +
        `Replace IMAGE_URL_HERE with a real URL.\n\n` +
        `Here is a free image URL you can use:\n` +
        `https://picsum.photos/300/200\n\n` +
        `(This gives you a random photo — perfect for your ${topic} page!)`,
      bytePrompt: (_topic: string) =>
        `The img tag is different from other tags.\n` +
        `It does not have a closing tag.\n` +
        `It is a self-closing tag — just one tag does everything.\n` +
        `The src attribute tells the browser WHERE the image lives.`,
      hint: `The img tag looks like this:\n` +
            `<img src="https://picsum.photos/300/200">\n` +
            `No closing tag needed.\n` +
            `The src must be a complete URL starting with https://`,
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
        doc.querySelector('img[src]') !== null,
    },

    {
      id: 'step-2',
      type: 'write',
      instruction: (topic: string) =>
        `Now add a description to your image.\n\n` +
        `This is called alt text — it helps people who cannot see images.\n\n` +
        `Update your img tag:\n` +
        `<img src="YOUR_URL" alt="A picture of ${topic}">\n\n` +
        `Describe what the image shows.`,
      bytePrompt: (topic: string) =>
        `Alt text is what a screen reader says out loud\n` +
        `for someone who cannot see the image.\n` +
        `It is also what shows when the image fails to load.\n` +
        `Always add alt text. Always.\n` +
        `Describe your ${topic} image.`,
      hint: `Add alt inside the img tag:\n` +
            `<img src="https://..." alt="Description here">\n` +
            `The alt goes INSIDE the same tag as src.\n` +
            `Separate them with a space.`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <img src="https://picsum.photos/300/200">\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('img[alt]') !== null &&
        (doc.querySelector('img')?.getAttribute('alt')?.length ?? 0) > 0,
    },

    {
      id: 'step-3',
      type: 'identify',
      instruction: (_topic: string) =>
        `Images can be resized with CSS!\n\n` +
        `Add a style rule to control your image size:\n\n` +
        `img {\n` +
        `  width: 300px;\n` +
        `}\n\n` +
        `Try different numbers — what happens in the preview?`,
      bytePrompt: (_topic: string) =>
        `Without a width, images can be HUGE or tiny.\n` +
        `CSS gives you control.\n` +
        `img is the CSS selector for all images.\n` +
        `width: 300px means 300 pixels wide.`,
      hint: `Add this in a style tag in the head:\n` +
            `<style>\n` +
            `  img {\n` +
            `    width: 300px;\n` +
            `  }\n` +
            `</style>\n` +
            `The height adjusts automatically to keep proportions.`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head>\n` +
        `    <title>${topic}</title>\n` +
        `    <style>\n` +
        `      /* Add image width here */\n` +
        `      \n` +
        `    </style>\n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <img src="https://picsum.photos/300/200" alt="A picture">\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (_doc: Document, _raw?: string, iframeWin?: Window) => {
        if (!iframeWin) return false
        const img = iframeWin.document.querySelector('img') as HTMLImageElement | null
        if (!img) return false
        const width = iframeWin.getComputedStyle(img).width
        return width !== '' && width !== 'auto'
      },
    },

    {
      id: 'step-4',
      type: 'fix',
      instruction: (_topic: string) =>
        `Byte's image is broken — the icon shows but no photo.\n\n` +
        `Find the mistake in the img tag.\n` +
        `Clue: attribute values need quotes around them.`,
      bytePrompt: (_topic: string) =>
        `This is the MOST COMMON image mistake.\n` +
        `Every attribute value needs quotes.\n` +
        `A quote to START the value.\n` +
        `A quote to END the value.\n` +
        `Count the quote marks in the src attribute.`,
      hint: `An attribute value needs TWO quote marks:\n` +
            `src="the url goes here"\n` +
            `One opening " at the start.\n` +
            `One closing " at the end.\n` +
            `If one is missing, the browser cannot read the URL.`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head><title>${topic}</title></head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <img src="https://picsum.photos/300/200 alt="A picture">\n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelector('img[src]') !== null &&
        doc.querySelector('img[alt]') !== null,
    },

    {
      id: 'step-5',
      type: 'combine',
      editRequired: true,
      instruction: (topic: string) =>
        `Your ${topic} page has one image.\n\n` +
        `Real pages have more.\n` +
        `Add a second img tag with a different URL and your own alt text.\n\n` +
        `When you see two images in the preview — you did it.`,
      bytePrompt: (topic: string) =>
        `Two images. Bigger page. More ${topic}.\n` +
        `Your second img. Your alt text. Your page.\n` +
        `Add it and watch the preview.`,
      hint: `Just copy your img tag and change the URL:\n` +
            `<img src="https://picsum.photos/300/201" alt="Second image">\n` +
            `(Change the number at the end for a different photo!)`,
      startingCode: (topic: string) =>
        `<html>\n` +
        `  <head>\n` +
        `    <title>${topic}</title>\n` +
        `    <style>\n` +
        `      img { width: 300px; }\n` +
        `    </style>\n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>${topic}</h1>\n` +
        `    <p>Something amazing about ${topic}.</p>\n` +
        `    <img src="https://picsum.photos/300/200" alt="First image">\n` +
        `    \n` +
        `  </body>\n` +
        `</html>`,
      xp: 10,
      validate: (doc: Document) =>
        doc.querySelectorAll('img[src]').length >= 2 &&
        doc.querySelectorAll('img[alt]').length >= 2,
    },
  ],
}
