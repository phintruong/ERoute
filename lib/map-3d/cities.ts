import type { CityConfig } from './types';

export const CITIES: CityConfig[] = [
  {
    id: 'toronto',
    name: 'Toronto',
    center: [-79.3832, 43.6532],
    zoom: 11.5,
    pitch: 45,
    bearing: -17.6,
  },
  {
    id: 'waterloo',
    name: 'Waterloo',
    center: [-80.4922, 43.4516],
    zoom: 11.5,
    pitch: 45,
    bearing: 0,
  },
  {
    id: 'mississauga',
    name: 'Mississauga',
    center: [-79.6441, 43.589],
    zoom: 11.5,
    pitch: 45,
    bearing: 0,
  },
];

export function getCityById(id: string): CityConfig | undefined {
  return CITIES.find((c) => c.id === id);
}
