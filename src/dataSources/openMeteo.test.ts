import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOpenMeteoResponse, type OpenMeteoAirQualityResponse } from './openMeteo';

test('normalizeOpenMeteoResponse slices 24 hours from current hour and marks cleanest hour', () => {
  const times: string[] = [];
  const aqis: number[] = [];
  const pm25s: number[] = [];

  for (let h = 0; h < 48; h++) {
    const day = h < 24 ? '2026-11-25' : '2026-11-26';
    const hourStr = String(h % 24).padStart(2, '0');
    times.push(`${day}T${hourStr}:00`);
    // Make hour 14 (2 PM on day 1) the cleanest at AQI 19
    aqis.push(h === 14 ? 19 : 45 + (h % 10));
    pm25s.push(h === 14 ? 4.2 : 11.4);
  }

  const mockRaw: OpenMeteoAirQualityResponse = {
    latitude: 37.77,
    longitude: -122.42,
    timezone: 'America/Los_Angeles',
    current_units: {
      us_aqi: 'USAQI',
      pm2_5: 'μg/m³',
      pm10: 'μg/m³',
      ozone: 'μg/m³',
      nitrogen_dioxide: 'μg/m³',
      sulphur_dioxide: 'μg/m³',
      carbon_monoxide: 'μg/m³',
    },
    current: {
      time: '2026-11-25T05:15',
      us_aqi: 48,
      pm2_5: 11.2,
      pm10: 19.8,
      ozone: 42.1,
      nitrogen_dioxide: 14.5,
      sulphur_dioxide: 2.3,
      carbon_monoxide: 210.4,
    },
    hourly: {
      time: times,
      us_aqi: aqis,
      pm2_5: pm25s,
    },
  };

  const normalized = normalizeOpenMeteoResponse(mockRaw, {
    name: 'San Francisco',
    region: 'California',
    country: 'United States',
  });

  assert.equal(normalized.source, 'open-meteo');
  assert.equal(normalized.location.name, 'San Francisco');
  assert.equal(normalized.current.usAqi, 48);
  assert.equal(normalized.current.category.label, 'Good');
  assert.equal(normalized.pollutants.length, 6);
  assert.equal(normalized.pollutants[0].formula, 'PM2.5');
  assert.equal(normalized.pollutants[0].value, 11.2);
  assert.equal(normalized.hourly24h.length, 24);
  assert.equal(normalized.hourly24h[0].time, '2026-11-25T05:00');
  assert.equal(normalized.cleanestHour?.time, '2026-11-25T14:00');
  assert.equal(normalized.cleanestHour?.aqi, 19);
  assert.equal(normalized.cleanestHour?.isCleanest, true);
  assert.ok(normalized.bestWindow);
  assert.match(normalized.bestWindow.sentence, /AQI/);
});
