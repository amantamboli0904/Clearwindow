import type { DataSourceId, NormalizedAirQuality } from '../types/airQuality';
import {
  DataSourceError,
  getAirQuality as getOpenMeteoAirQuality,
  normalizeOpenMeteoResponse,
  openMeteoAdapter,
  searchCities,
} from './openMeteo';
import type { AirQualityAdapter, AirQualityFetchOptions } from './types';

/**
 * STAGE 2 EXTENSION POINT:
 * Register additional ground-station adapters (OpenAQ, WAQI) here.
 * Components call `getAirQuality(lat, lon)` in Stage 1 and will call
 * `getMultiSourceAirQuality(lat, lon)` in Stage 2 without modifying UI contracts.
 */
const ADAPTER_REGISTRY: Partial<Record<DataSourceId, AirQualityAdapter>> = {
  'open-meteo': openMeteoAdapter,
  // Stage 2:
  // openaq: openAqAdapter,
  // waqi: waqiAdapter,
};

export function getRegisteredSources(): AirQualityAdapter[] {
  return Object.values(ADAPTER_REGISTRY).filter(
    (adapter): adapter is AirQualityAdapter => Boolean(adapter)
  );
}

/**
 * Primary Stage 1 entry point for fetching normalized air quality data.
 */
export async function getAirQuality(
  lat: number,
  lon: number,
  options?: AirQualityFetchOptions
): Promise<NormalizedAirQuality> {
  return getOpenMeteoAirQuality(lat, lon, options);
}

/**
 * Stage 2 placeholder: fetches all registered sources concurrently for comparison.
 * Currently returns the Stage 1 Open-Meteo result wrapped in a single-item array.
 */
export async function getAllSourceReadings(
  lat: number,
  lon: number,
  options?: AirQualityFetchOptions
): Promise<NormalizedAirQuality[]> {
  const adapters = getRegisteredSources();
  const settled = await Promise.allSettled(
    adapters.map((adapter) => adapter.getAirQuality(lat, lon, options))
  );
  return settled
    .filter((res): res is PromiseFulfilledResult<NormalizedAirQuality> => res.status === 'fulfilled')
    .map((res) => res.value);
}

export { DataSourceError, normalizeOpenMeteoResponse, openMeteoAdapter, searchCities };
export type { AirQualityAdapter, AirQualityFetchOptions };
