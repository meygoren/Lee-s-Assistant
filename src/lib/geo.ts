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

export const TIME_ZONE_CITIES: TimeZoneCity[] = [
  { name: { zh: "上海", en: "Shanghai" }, lat: 31.23, lon: 121.47, timeZone: "Asia/Shanghai" },
  { name: { zh: "东京", en: "Tokyo" }, lat: 35.68, lon: 139.69, timeZone: "Asia/Tokyo" },
  { name: { zh: "伦敦", en: "London" }, lat: 51.51, lon: -0.13, timeZone: "Europe/London" },
  { name: { zh: "纽约", en: "New York" }, lat: 40.71, lon: -74.01, timeZone: "America/New_York" },
];
