import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[NetRoute ErrorBoundary caught an error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B1220] select-none min-h-[360px]">
          <div className="max-w-lg w-full bg-[#142136] border border-rose-800/60 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#F1F5F9]">
                {this.props.title || 'Component Error Encountered'}
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                An unexpected error occurred while rendering this section. The application remains interactive.
              </p>
            </div>

            {/* Error detail box */}
            <div className="p-3 bg-[#0B1220] border border-[#26364B] rounded-lg text-left overflow-x-auto max-h-40 text-xs font-mono text-rose-300">
              <div className="font-bold text-rose-400 mb-1">
                {this.state.error?.name || 'Error'}: {this.state.error?.message}
              </div>
              {this.state.error?.stack && (
                <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-tight mt-1">
                  {this.state.error.stack.split('\n').slice(1, 4).join('\n')}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Component
              </button>
              {this.props.onNavigateToDashboard && (
                <button
                  type="button"
                  onClick={this.props.onNavigateToDashboard}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B2B43] hover:bg-[#26364B] text-[#F1F5F9] text-sm font-semibold border border-[#26364B] transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#38BDF8]" />
                  Return to Overview
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

