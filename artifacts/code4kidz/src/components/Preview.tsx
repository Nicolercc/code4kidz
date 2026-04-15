import { useEffect, useRef } from 'react';

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
  onIframeReady?: (iframe: HTMLIFrameElement) => void;
}

export default function Preview({ code, onIframeReady }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = SHELL(code);
      if (onIframeReady) {
        onIframeReady(iframeRef.current);
      }
    }
  }, [code, onIframeReady]);

  return (
    <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-sm border border-brand-border">
      <div className="bg-brand-bg px-4 py-2 border-b border-brand-border flex gap-2">
        <div className="w-3 h-3 rounded-full bg-brand-red opacity-50" />
        <div className="w-3 h-3 rounded-full bg-brand-orange opacity-50" />
        <div className="w-3 h-3 rounded-full bg-brand-green opacity-50" />
      </div>
      <iframe
        ref={iframeRef}
        title="preview"
        className="w-full h-[calc(100%-40px)] border-none"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}