import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last line of defence: without this, any render error unmounts the whole app
 * and leaves a blank page. Progress lives in localStorage, so reloading is safe.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Code4Kidz crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-dvh flex items-center justify-center bg-brand-bg p-6">
        <div role="alert" className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-black text-brand-dark">Oops, Byte tripped over a wire.</h1>
          <p className="text-brand-dark">
            Something went wrong on this screen. Your progress is saved, so it's safe to try again.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-3 rounded-xl font-bold text-white bg-brand-purple focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-purple"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-5 py-3 rounded-xl font-bold text-brand-purple border-2 border-brand-purple focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-purple"
            >
              Back to the start
            </a>
          </div>
        </div>
      </main>
    );
  }
}
