import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivitySelector } from './components/ActivitySelector';
import { BestWindowCard } from './components/BestWindowCard';
import { ErrorBanner } from './components/ErrorBanner';
import { Footer } from './components/Footer';
import { ForecastChart } from './components/ForecastChart';
import { Header } from './components/Header';
import { HeroCard } from './components/HeroCard';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { LocationSearch } from './components/LocationSearch';
import { PollutantGrid } from './components/PollutantGrid';
import { getAirQuality } from './dataSources';
import type {
  ActivityType,
  CitySuggestion,
  LocationInfo,
  NormalizedAirQuality,
} from './types/airQuality';

const DEFAULT_LOCATION: LocationInfo = {
  name: 'San Francisco',
  region: 'California',
  country: 'United States',
  latitude: 37.7749,
  longitude: -122.4194,
};

const STORAGE_THEME_KEY = 'clearwindow_theme';
const STORAGE_LOC_KEY = 'clearwindow_location';

function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = window.localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Ignore storage access restrictions
  }
  return 'light';
}

function getInitialLocation(): LocationInfo {
  try {
    const raw = window.localStorage.getItem(STORAGE_LOC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocationInfo>;
      if (
        typeof parsed.name === 'string' &&
        typeof parsed.latitude === 'number' &&
        typeof parsed.longitude === 'number'
      ) {
        return {
          name: parsed.name,
          region: parsed.region,
          country: parsed.country,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        };
      }
    }
  } catch {
    // Ignore malformed saved location
  }
  return DEFAULT_LOCATION;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [activeLocation, setActiveLocation] = useState<LocationInfo>(getInitialLocation);
  const [airQuality, setAirQuality] = useState<NormalizedAirQuality | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('run');

  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const loadLocationAirQuality = useCallback(async (loc: LocationInfo) => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      /**
       * STAGE 2 EXTENSION POINT:
       * Replace `getAirQuality` with `getAllSourceReadings` to compare
       * Open-Meteo modeled AQI against OpenAQ / WAQI ground stations.
       */
      const normalized = await getAirQuality(loc.latitude, loc.longitude, {
        locationMeta: loc,
        signal: controller.signal,
      });

      setAirQuality(normalized);
      setActiveLocation(loc);

      try {
        window.localStorage.setItem(STORAGE_LOC_KEY, JSON.stringify(loc));
      } catch {
        // Ignore storage errors
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to load air quality data. Please try again.'
      );
    } finally {
      if (fetchControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadLocationAirQuality(activeLocation);
    return () => {
      fetchControllerRef.current?.abort();
    };
    // Initial mount load only; subsequent loads are triggered by user selection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectCity(city: CitySuggestion) {
    const nextLoc: LocationInfo = {
      name: city.name,
      region: city.admin1,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
    };
    void loadLocationAirQuality(nextLoc);
  }

  function handleUseMyLocation() {
    if (!('geolocation' in navigator)) {
      setErrorMsg(
        'Geolocation is not supported in this browser. Search for a city above instead.'
      );
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        void loadLocationAirQuality({
          name: 'Current Location',
          region: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
          latitude,
          longitude,
        });
      },
      (geoError) => {
        setIsLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setErrorMsg(
            'Location permission was denied. Enable location access in your browser or search for a city above.'
          );
        } else if (geoError.code === geoError.TIMEOUT) {
          setErrorMsg(
            'Location lookup timed out. Please try again or search for your city.'
          );
        } else {
          setErrorMsg(
            'Could not determine your current location. Search for a city above instead.'
          );
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  function handleSearchEmptyError(failedQuery: string) {
    setErrorMsg(
      `City "${failedQuery}" was not found. Check the spelling or choose a nearby city.`
    );
  }

  return (
    <div id="top" className="neo-backdrop min-h-screen sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col bg-white sm:min-h-0 sm:overflow-hidden sm:rounded-[28px] sm:border-2 sm:border-neutral-950 sm:shadow-[0_24px_60px_rgba(17,17,17,0.18)] dark:bg-neutral-950 dark:sm:border-neutral-700">
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        />

        <main className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-8 sm:py-7">
          <LocationSearch
            onSelectCity={handleSelectCity}
            onUseMyLocation={handleUseMyLocation}
            isLocating={isLocating}
            onSearchEmptyError={handleSearchEmptyError}
          />

          {errorMsg && (
            <ErrorBanner
              message={errorMsg}
              onRetry={() => void loadLocationAirQuality(activeLocation)}
              onDismiss={() => setErrorMsg(null)}
            />
          )}

          {isLoading && <LoadingSkeleton />}

          {!isLoading && airQuality && (
            <div className="space-y-5">
              <HeroCard data={airQuality} />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <BestWindowCard
                  bestWindow={airQuality.bestWindow}
                  hourly={airQuality.hourly24h}
                />
                <ActivitySelector
                  selectedActivity={selectedActivity}
                  onSelectActivity={setSelectedActivity}
                  currentAqi={airQuality.current.usAqi}
                />
              </div>

              <ForecastChart
                hourly={airQuality.hourly24h}
                cleanestHour={airQuality.cleanestHour}
                theme={theme}
              />

              <PollutantGrid pollutants={airQuality.pollutants} />
            </div>
          )}

          {!isLoading && !airQuality && !errorMsg && (
            <div className="rounded-3xl border-[1.5px] border-neutral-950 bg-white p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              Search for a city or use your current location to view local air quality.
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
