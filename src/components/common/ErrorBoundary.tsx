import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends (Component as any) {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('⚠️ [ErrorBoundary Caught Exception]:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    try {
      // Clear version flags or potentially corrupted caches to ensure fresh recovery
      localStorage.removeItem('lumina_cart');
      localStorage.removeItem('lumina_enrollments');
    } catch (e) {
      console.warn('Storage reset warning:', e);
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleHardReload = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Local storage clear warning:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          id="error-boundary-screen"
          dir="rtl"
          className="min-h-screen bg-[#F3F8F6] dark:bg-[#071318] text-[#082F3B] dark:text-[#F1F7F6] flex items-center justify-center p-4 font-sans antialiased"
        >
          <div className="max-w-lg w-full bg-white dark:bg-[#0c2229] border border-teal-900/10 dark:border-teal-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle size={32} />
            </div>

            {/* Error Headlines */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#06242e] dark:text-white">
                {this.props.fallbackTitle || 'مشکلی در بارگذاری صفحه رخ داد'}
              </h1>
              <p className="text-xs sm:text-sm text-[#456774] dark:text-slate-300 leading-relaxed">
                سیستم با یک خطای غیرمنتظره در رندر المان‌ها مواجه شد. با فشردن دکمه‌های زیر می‌توانید صفحه را مجدداً بارگذاری کنید.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="error-boundary-reload-btn"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0b3b49] hover:bg-[#06242e] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home size={16} />
                <span>بازگشت به صفحه اصلی</span>
              </button>

              <button
                id="error-boundary-clear-cache-btn"
                onClick={this.handleHardReload}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-[#0b3b49] dark:text-[#5eead4] border border-teal-600/20 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>بارگذاری مجدد و تازه‌سازی</span>
              </button>
            </div>

            {/* Technical details toggle */}
            {this.state.error && (
              <div className="pt-4 border-t border-slate-100 dark:border-teal-900/40 text-start">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>جزئیات فنی خطا</span>
                  {this.state.showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-48 scrollbar-thin text-left dir-ltr">
                    <p className="font-bold text-rose-400">{this.state.error.toString()}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="mt-2 text-[10px] text-slate-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
