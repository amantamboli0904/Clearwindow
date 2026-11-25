import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBest2HourWindow,
  formatHourLabel,
  getActivityAdvice,
  getAQICategory,
} from './aqi';
import type { HourlyPoint } from '../types/airQuality';

test('getAQICategory covers all six US AQI brackets accurately', () => {
  assert.equal(getAQICategory(0).label, 'Good');
  assert.equal(getAQICategory(50).label, 'Good');
  assert.equal(getAQICategory(51).label, 'Moderate');
  assert.equal(getAQICategory(100).label, 'Moderate');
  assert.equal(getAQICategory(101).label, 'Unhealthy for Sensitive Groups');
  assert.equal(getAQICategory(150).label, 'Unhealthy for Sensitive Groups');
  assert.equal(getAQICategory(151).label, 'Unhealthy');
  assert.equal(getAQICategory(200).label, 'Unhealthy');
  assert.equal(getAQICategory(201).label, 'Very Unhealthy');
  assert.equal(getAQICategory(300).label, 'Very Unhealthy');
  assert.equal(getAQICategory(301).label, 'Hazardous');
  assert.equal(getAQICategory(450).label, 'Hazardous');
});

test('formatHourLabel parses ISO local hour without timezone drift', () => {
  assert.deepEqual(formatHourLabel('2026-11-25T00:00'), { short: '12 AM', full: '12:00 AM' });
  assert.deepEqual(formatHourLabel('2026-11-25T05:00'), { short: '5 AM', full: '5:00 AM' });
  assert.deepEqual(formatHourLabel('2026-11-25T12:00'), { short: '12 PM', full: '12:00 PM' });
  assert.deepEqual(formatHourLabel('2026-11-25T17:00', 1), { short: '6 PM', full: '6:00 PM' });
  assert.deepEqual(formatHourLabel('2026-11-25T23:00', 1), { short: '12 AM', full: '12:00 AM' });
});

test('computeBest2HourWindow selects the lowest average 2-hour contiguous slice', () => {
  const hourly: HourlyPoint[] = [
    { time: '2026-11-25T06:00', hourLabel: '6 AM', fullTimeLabel: '6:00 AM', aqi: 68, pm2_5: 18, isCleanest: false },
    { time: '2026-11-25T07:00', hourLabel: '7 AM', fullTimeLabel: '7:00 AM', aqi: 62, pm2_5: 16, isCleanest: false },
    { time: '2026-11-25T08:00', hourLabel: '8 AM', fullTimeLabel: '8:00 AM', aqi: 24, pm2_5: 6, isCleanest: false },
    { time: '2026-11-25T09:00', hourLabel: '9 AM', fullTimeLabel: '9:00 AM', aqi: 28, pm2_5: 7, isCleanest: true },
    { time: '2026-11-25T10:00', hourLabel: '10 AM', fullTimeLabel: '10:00 AM', aqi: 54, pm2_5: 14, isCleanest: false },
  ];

  const result = computeBest2HourWindow(hourly);
  assert.ok(result);
  assert.equal(result.startLabel, '8:00 AM');
  assert.equal(result.endLabel, '10:00 AM');
  assert.equal(result.avgAqi, 26);
  assert.match(result.sentence, /8:00 AM to 10:00 AM/);
});

test('getActivityAdvice adapts guidance by activity and AQI threshold', () => {
  const cleanRun = getActivityAdvice('run', 28);
  const badRun = getActivityAdvice('run', 165);
  const moderateKids = getActivityAdvice('walk_kids', 78);
  const cleanHome = getActivityAdvice('stay_home', 30);

  assert.equal(cleanRun.status, 'Go for it');
  assert.equal(badRun.status, 'Move indoors');
  assert.equal(moderateKids.status, 'Generally safe');
  assert.equal(cleanHome.status, 'Open windows');
});
