import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { LocateFixed, Search, X } from 'lucide-react';
import { searchCities } from '../dataSources';
import type { CitySuggestion } from '../types/airQuality';

interface LocationSearchProps {
  onSelectCity: (city: CitySuggestion) => void;
  onUseMyLocation: () => void;
  isLocating: boolean;
  onSearchEmptyError: (query: string) => void;
}

export function LocationSearch({
  onSelectCity,
  onUseMyLocation,
  isLocating,
  onSearchEmptyError,
}: LocationSearchProps) {
  const inputId = useId();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const skipNextLookupRef = useRef(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (skipNextLookupRef.current) {
      skipNextLookupRef.current = false;
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setNoResults(false);
      setSearchError(null);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchCities(trimmed, controller.signal);
        setSuggestions(results);
        setNoResults(results.length === 0);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setSuggestions([]);
        setNoResults(false);
        setSearchError(
          err instanceof Error ? err.message : 'Unable to search cities right now.'
        );
        setIsOpen(true);
      } finally {
        setIsSearching(false);
      }
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function commitSelection(city: CitySuggestion) {
    skipNextLookupRef.current = true;
    setQuery(city.name);
    setSuggestions([]);
    setIsOpen(false);
    setNoResults(false);
    setSearchError(null);
    setActiveIndex(-1);
    onSelectCity(city);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    if (activeIndex >= 0 && suggestions[activeIndex]) {
      commitSelection(suggestions[activeIndex]);
      return;
    }

    if (suggestions.length > 0) {
      commitSelection(suggestions[0]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchCities(trimmed);
      if (results.length > 0) {
        commitSelection(results[0]);
      } else {
        setNoResults(true);
        setIsOpen(true);
        onSearchEmptyError(trimmed);
      }
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : 'Unable to search cities right now.'
      );
      setIsOpen(true);
    } finally {
      setIsSearching(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function clearInput() {
    setQuery('');
    setSuggestions([]);
    setNoResults(false);
    setSearchError(null);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  return (
    <section aria-label="Location search" className="relative" ref={containerRef}>
      <form
        onSubmit={handleFormSubmit}
        className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <label htmlFor={inputId} className="sr-only">
            Search for a city
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0 || noResults || searchError) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search city (e.g. San Francisco, Tokyo, London)"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            className="h-12 w-full rounded-full border-[1.5px] border-neutral-950 bg-white pl-11 pr-11 text-sm text-neutral-950 placeholder:text-neutral-400 transition-colors focus:border-[#9D35FF] focus:outline-none focus:ring-2 focus:ring-[#9D35FF]/25 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-[#1CE0FF]"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={clearInput}
              aria-label="Clear city search"
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-[#9D35FF] dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onUseMyLocation}
          disabled={isLocating}
          className="inline-flex h-12 min-w-[44px] items-center justify-center gap-2 rounded-full border-[1.5px] border-neutral-950 bg-[#1CE0FF] px-5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-[#0bc9e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9D35FF] disabled:cursor-wait disabled:opacity-60 whitespace-nowrap shrink-0 dark:border-neutral-300 dark:bg-[#1CE0FF] dark:text-neutral-950 dark:hover:bg-[#5ce9ff]"
        >
          <LocateFixed
            className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{isLocating ? 'Locating…' : 'Use my location'}</span>
        </button>
      </form>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border-[1.5px] border-neutral-950 bg-white shadow-lg dark:border-neutral-600 dark:bg-neutral-900 sm:right-auto sm:w-[calc(100%-12rem)]"
        >
          {isSearching && (
            <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
              Searching cities…
            </div>
          )}

          {!isSearching && searchError && (
            <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {searchError}
            </div>
          )}

          {!isSearching && !searchError && noResults && (
            <div className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
              No city found for “{query.trim()}”. Try another spelling or nearby city.
            </div>
          )}

          {!isSearching &&
            !searchError &&
            suggestions.map((city, idx) => {
              const subtitleParts = [city.admin1, city.country].filter(Boolean);
              const isActive = idx === activeIndex;
              return (
                <button
                  key={city.id}
                  id={`${listboxId}-option-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => commitSelection(city)}
                  className={`flex min-h-[48px] w-full items-center justify-between gap-3 border-b border-neutral-200 px-4 py-2.5 text-left text-sm transition-colors last:border-b-0 dark:border-neutral-800 ${
                    isActive
                      ? 'bg-[#FDE800]/40 text-neutral-950 dark:bg-[#1CE0FF]/20 dark:text-white'
                      : 'text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800/70'
                  }`}
                >
                  <span className="font-semibold">{city.name}</span>
                  {subtitleParts.length > 0 && (
                    <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {subtitleParts.join(', ')}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      )}
    </section>
  );
}
