import { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  // FIX 2: expose EditorView so LessonPage can position the cursor
  onEditorReady?: (view: EditorView) => void;
  // FIX 2: show a purple tint overlay that fades out (highlights scaffolded code)
  showHighlight?: boolean;
}

export default function Editor({ value, onChange, onEditorReady, showHighlight }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // FIX 3: prevents programmatic value updates from triggering onChange
  // Without this flag, setting startingCode via the value prop fires onChange,
  // which would let editRequired combine steps auto-pass before the kid types anything.
  const isProgrammaticRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const myTheme = EditorView.theme({
      "&": {
        backgroundColor: "#1A1A2E",
        color: "#D4D4D4",
        fontSize: "18px",
        lineHeight: "1.8",
        height: "100%"
      },
      ".cm-content": {
        padding: "20px"
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: "#5C3EBC"
      },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#5C3EBC40"
      },
      ".cm-gutters": {
        backgroundColor: "#1A1A2E",
        color: "#777775",
        borderRight: "1px solid #333",
        fontSize: "16px"
      }
    }, { dark: true });

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        html(),
        myTheme,
        EditorView.updateListener.of((update) => {
          // FIX 3: skip onChange when the update was triggered programmatically
          if (update.docChanged && !isProgrammaticRef.current) {
            onChange(update.state.doc.toString());
          }
          // Always reset the flag after processing
          if (update.docChanged) {
            isProgrammaticRef.current = false;
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;
    onEditorReady?.(view);

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      // FIX 3: mark this as programmatic so onChange is NOT fired
      isProgrammaticRef.current = true;
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      });
    }
  }, [value]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden" style={{ position: 'relative' }}>
      {/* FIX 2: purple tint overlay for scaffolded code — fades out over 1.5s */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(92, 62, 188, 0.12)',
          pointerEvents: 'none',
          zIndex: 10,
          opacity: showHighlight ? 1 : 0,
          transition: showHighlight ? 'none' : 'opacity 1.5s ease',
        }}
      />
    </div>
  );
}
