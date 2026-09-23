import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import type { EditorView } from "@codemirror/view";
import Editor from "./Editor";

function typeInto(view: EditorView, text: string) {
  act(() => {
    view.dispatch({ changes: { from: view.state.doc.length, insert: text } });
  });
}

describe("Editor", () => {
  it("calls the latest onChange, not the one from the first render", () => {
    let view: EditorView | null = null;
    const first = vi.fn();
    const latest = vi.fn();

    const { rerender } = render(
      <Editor value="" onChange={first} onEditorReady={(v) => { view = v; }} />,
    );
    rerender(<Editor value="" onChange={latest} onEditorReady={(v) => { view = v; }} />);

    typeInto(view!, "<html>");

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledWith("<html>");
  });

  it("does not report programmatic value changes as user edits", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Editor value="" onChange={onChange} />);

    rerender(<Editor value="<h1>Space</h1>" onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();
  });
});
