import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 select-none">
          <div className="max-w-md w-full bg-slate-900 border-4 border-red-700/80 rounded-lg p-6 pixel-box text-slate-100 shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-base font-pixel text-red-400 font-bold tracking-wider mb-2">
              TERJADI KESALAHAN SISTEM
            </h2>
            <p className="font-retro text-xs text-slate-300 mb-4 leading-relaxed">
              Game mengalami hambatan sementara. Silakan muat ulang atau pulihkan data permainan Anda.
            </p>
            {this.state.error && (
              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-red-300 mb-5 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="py-2.5 px-4 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-pixel text-xs font-bold tracking-wider cursor-pointer border border-amber-400"
              >
                🔄 MUAT ULANG
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('kotdk_savegame_v1');
                  } catch {
                    // ignore
                  }
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="py-2.5 px-4 rounded bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 font-pixel text-xs cursor-pointer border border-slate-700"
              >
                🗑️ RESET DATA
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
