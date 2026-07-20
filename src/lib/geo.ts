export function latLonToVector3(
  latDeg: number,
  lonDeg: number,
  radius: number
): [number, number, number] {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.sin(lon);
  return [x, y, z];
}

export type TimeZoneCity = {
  name: { zh: string; en: string };
  lat: number;
  lon: number;
  timeZone: string;
};

// A curated set of major cities spanning the globe's time zones. `timeZone`
// (an IANA identifier) is the stable key used everywhere — in Settings and
// on the globe — so it doubles as this list's unique id.
export const CITY_LIBRARY: TimeZoneCity[] = [
  { name: { zh: "上海", en: "Shanghai" }, lat: 31.23, lon: 121.47, timeZone: "Asia/Shanghai" },
  { name: { zh: "东京", en: "Tokyo" }, lat: 35.68, lon: 139.69, timeZone: "Asia/Tokyo" },
  { name: { zh: "首尔", en: "Seoul" }, lat: 37.57, lon: 126.98, timeZone: "Asia/Seoul" },
  { name: { zh: "香港", en: "Hong Kong" }, lat: 22.32, lon: 114.17, timeZone: "Asia/Hong_Kong" },
  { name: { zh: "新加坡", en: "Singapore" }, lat: 1.35, lon: 103.82, timeZone: "Asia/Singapore" },
  { name: { zh: "曼谷", en: "Bangkok" }, lat: 13.76, lon: 100.5, timeZone: "Asia/Bangkok" },
  { name: { zh: "孟买", en: "Mumbai" }, lat: 19.08, lon: 72.88, timeZone: "Asia/Kolkata" },
  { name: { zh: "迪拜", en: "Dubai" }, lat: 25.2, lon: 55.27, timeZone: "Asia/Dubai" },
  { name: { zh: "莫斯科", en: "Moscow" }, lat: 55.76, lon: 37.62, timeZone: "Europe/Moscow" },
  { name: { zh: "伦敦", en: "London" }, lat: 51.51, lon: -0.13, timeZone: "Europe/London" },
  { name: { zh: "巴黎", en: "Paris" }, lat: 48.86, lon: 2.35, timeZone: "Europe/Paris" },
  { name: { zh: "柏林", en: "Berlin" }, lat: 52.52, lon: 13.4, timeZone: "Europe/Berlin" },
  { name: { zh: "罗马", en: "Rome" }, lat: 41.9, lon: 12.5, timeZone: "Europe/Rome" },
  { name: { zh: "开罗", en: "Cairo" }, lat: 30.04, lon: 31.24, timeZone: "Africa/Cairo" },
  { name: { zh: "内罗毕", en: "Nairobi" }, lat: -1.29, lon: 36.82, timeZone: "Africa/Nairobi" },
  { name: { zh: "纽约", en: "New York" }, lat: 40.71, lon: -74.01, timeZone: "America/New_York" },
  { name: { zh: "芝加哥", en: "Chicago" }, lat: 41.88, lon: -87.63, timeZone: "America/Chicago" },
  { name: { zh: "洛杉矶", en: "Los Angeles" }, lat: 34.05, lon: -118.24, timeZone: "America/Los_Angeles" },
  { name: { zh: "多伦多", en: "Toronto" }, lat: 43.65, lon: -79.38, timeZone: "America/Toronto" },
  { name: { zh: "墨西哥城", en: "Mexico City" }, lat: 19.43, lon: -99.13, timeZone: "America/Mexico_City" },
  { name: { zh: "圣保罗", en: "São Paulo" }, lat: -23.55, lon: -46.63, timeZone: "America/Sao_Paulo" },
  { name: { zh: "悉尼", en: "Sydney" }, lat: -33.87, lon: 151.21, timeZone: "Australia/Sydney" },
  { name: { zh: "奥克兰", en: "Auckland" }, lat: -36.85, lon: 174.76, timeZone: "Pacific/Auckland" },
  { name: { zh: "檀香山", en: "Honolulu" }, lat: 21.31, lon: -157.86, timeZone: "Pacific/Honolulu" },
];

export const DEFAULT_TIME_ZONES = [
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Europe/London",
  "America/New_York",
];

export function resolveTimeZoneCities(timeZoneIds: string[] | null | undefined): TimeZoneCity[] {
  const ids = timeZoneIds && timeZoneIds.length > 0 ? timeZoneIds : DEFAULT_TIME_ZONES;
  return ids
    .map((id) => CITY_LIBRARY.find((c) => c.timeZone === id))
    .filter((c): c is TimeZoneCity => Boolean(c));
}
