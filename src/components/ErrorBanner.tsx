import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      data-testid="error-banner"
      className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-red-700 bg-red-50 p-4 text-sm text-red-950 dark:border-red-700 dark:bg-red-950/50 dark:text-red-100 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-400"
          aria-hidden="true"
        />
        <span className="font-medium">{message}</span>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border-[1.5px] border-red-800 bg-white px-3.5 text-xs font-semibold text-red-900 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-600 dark:border-red-700 dark:bg-red-950 dark:text-red-100 dark:hover:bg-red-900/60"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-red-800 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-600 dark:text-red-200 dark:hover:bg-red-900/60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
