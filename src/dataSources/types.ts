import type { DataSourceId, LocationInfo, NormalizedAirQuality } from '../types/airQuality';

export interface AirQualityFetchOptions {
  locationMeta?: Partial<LocationInfo>;
  signal?: AbortSignal;
}

/**
 * Adapter contract for air quality providers.
 *
 * STAGE 2 EXTENSION POINT:
 * Future adapters (e.g., `openAqAdapter`, `waqiAdapter`) implement this
 * interface so `compareAirQualitySources(lat, lon)` can fetch all enabled
 * adapters via `Promise.allSettled` and display station-vs-model variance.
 */
export interface AirQualityAdapter {
  readonly id: DataSourceId;
  readonly label: string;
  readonly attribution: string;
  getAirQuality(
    lat: number,
    lon: number,
    options?: AirQualityFetchOptions
  ): Promise<NormalizedAirQuality>;
}
