import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Boom(): never {
  throw new Error("kaboom");
}

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>lesson content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("lesson content")).toBeTruthy();
  });

  it("shows a recovery screen instead of a blank page when a child throws", () => {
    // React logs caught render errors; keep the test output readable.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /back to the start/i }).getAttribute("href")).toBe("/");
    spy.mockRestore();
  });
});
