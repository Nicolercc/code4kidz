const SHELL = (code: string) => {
  const trimmed = code.trim();

  // If the kid writes structural HTML (<html>...), do NOT wrap it inside our <body>.
  // Wrapping would produce <body><html>...</html></body> which is malformed.
  // Match a real opening <html> tag (with optional attributes), not unrelated "html" substrings.
  const isStructuralHtml = /<html[\s>]/i.test(trimmed);

  const styleTag = `<style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 1.5rem 1.75rem; margin: 0; color: #111111; line-height: 1.7; background: #FAFAF8; min-height: 100vh; }
      * { box-sizing: border-box; }
      h1 { font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem; }
      h2 { font-size: 1.4rem; font-weight: 700; margin: 1rem 0 0.4rem; }
      h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.3rem; }
      p  { margin: 0.5rem 0; }
      img { max-width: 100%; border-radius: 8px; }
      ul, ol { padding-left: 1.5rem; }
      li { margin: 0.3rem 0; }
    </style>`;

  if (isStructuralHtml) {
    const lower = trimmed.toLowerCase();
    if (lower.includes('</head>')) {
      return '<!DOCTYPE html>' + trimmed.replace(/<\/head>/i, styleTag + '</head>');
    }
    return '<!DOCTYPE html>' + trimmed;
  }

  // Default: wrap fragments inside our shell (e.g. later steps that only output body content).
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    ${styleTag}
  </head>
  <body>${code}</body>
</html>`;
};

interface PreviewProps {
  code: string;
}

/** The page's <title>, shown on the fake browser tab like a real browser would. */
function pageTitle(code: string): string {
  return new DOMParser().parseFromString(code, 'text/html').title.trim();
}

export default function Preview({ code }: PreviewProps) {
  const title = pageTitle(code);
  return (
    <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-sm border border-brand-border">
      <div className="bg-brand-bg px-4 py-2 border-b border-brand-border flex items-center gap-2 h-10">
        <div aria-hidden="true" className="w-3 h-3 shrink-0 rounded-full bg-brand-red opacity-50" />
        <div aria-hidden="true" className="w-3 h-3 shrink-0 rounded-full bg-brand-orange opacity-50" />
        <div aria-hidden="true" className="w-3 h-3 shrink-0 rounded-full bg-brand-green opacity-50" />
        <div className="ml-2 min-w-0 truncate rounded-t-md bg-white border border-b-0 border-brand-border px-3 py-0.5 text-xs font-semibold text-brand-dark">
          <span className="sr-only">Browser tab: </span>{title || 'Untitled page'}
        </div>
      </div>
      {/* Kid code runs fully sandboxed: no scripts, and a unique origin so it can
          never reach the app's DOM or localStorage. Validation reads the raw code
          (utils/validator.ts), so nothing needs to look inside this frame. */}
      <iframe
        srcDoc={SHELL(code)}
        title="Live preview of your page"
        className="w-full h-[calc(100%-40px)] border-none"
        sandbox=""
      />
    </div>
  );
}