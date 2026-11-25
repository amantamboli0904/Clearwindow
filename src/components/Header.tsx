import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <a
          href="#top"
          className="flex items-center gap-2.5 text-base font-bold tracking-tight text-neutral-950 whitespace-nowrap shrink-0 dark:text-white"
        >
          {/* Multi-color geometric petal mark echoing the reference brand mark */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <circle cx="8.5" cy="9" r="5" fill="#17C9F6" />
            <circle cx="15" cy="8.5" r="5" fill="#FF1D8E" fillOpacity="0.88" />
            <circle cx="11.5" cy="15" r="5" fill="#FDE800" fillOpacity="0.92" />
            <circle cx="12" cy="11.5" r="3" fill="#111111" />
          </svg>
          <span>ClearWindow</span>
        </a>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-[1.5px] border-neutral-950 bg-white px-4 text-xs font-semibold text-neutral-950 transition-colors hover:bg-[#FDE800] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9D35FF] whitespace-nowrap shrink-0 dark:border-neutral-300 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Light mode</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Dark mode</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
