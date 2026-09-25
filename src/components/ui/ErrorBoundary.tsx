import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render/lifecycle errors anywhere in the routed page tree so a single
 * component crash never white-screens the whole app (AUDIT §1).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Route render failed:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="w-full max-w-md bg-falla-paper border-2 border-falla-ink rounded-[2rem] shadow-solid p-10 flex flex-col items-center gap-6">
            <div className="w-14 h-14 bg-falla-fire rounded-full ink-border" />
            <h1 className="font-display text-2xl uppercase tracking-widest text-falla-ink">
              Something broke
            </h1>
            <p className="text-sm font-bold text-falla-ink/60 leading-relaxed">
              This page hit an unexpected error. The rest of the site is still
              fine — try again or head back home.
            </p>
            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-falla-fire text-white border-2 border-falla-ink rounded-xl shadow-solid-sm active:scale-95 font-black text-xs uppercase tracking-widest transition-all"
              >
                Reload
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-falla-paper text-falla-ink border-2 border-falla-ink rounded-xl shadow-solid-sm active:scale-95 font-black text-xs uppercase tracking-widest transition-all"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
