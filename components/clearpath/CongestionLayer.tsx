'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface CongestionLayerProps {
  map: mapboxgl.Map | null;
  hospitals: any[];
  congestion: any[];
}

export default function CongestionLayer({ map, hospitals, congestion }: CongestionLayerProps) {
  useEffect(() => {
    if (!map || hospitals.length === 0) return;

    const loadMap: Record<string, number> = {};
    for (const s of congestion) {
      loadMap[s.hospitalId] = s.occupancyPct;
    }

    const features = hospitals.map((h: any) => {
      const pct = loadMap[h._id ?? h.id] ?? 70;
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [h.longitude, h.latitude]
        },
        properties: {
          name: h.name,
          occupancyPct: pct,
          id: h._id ?? h.id,
        }
      };
    });

    const sourceId = 'hospital-congestion';
    const layerId = 'hospital-circles';

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features
      });
      return;
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features }
    });

    map.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'occupancyPct'],
          0, 12,
          100, 30
        ],
        'circle-color': [
          'interpolate', ['linear'], ['get', 'occupancyPct'],
          0, '#22c55e',
          50, '#eab308',
          75, '#f97316',
          100, '#dc2626'
        ],
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    map.addLayer({
      id: 'hospital-labels',
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 2.5],
        'text-anchor': 'top',
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular']
      },
      paint: {
        'text-color': '#1e293b',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    });

    return () => {
      if (map.getLayer('hospital-labels')) map.removeLayer('hospital-labels');
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, hospitals, congestion]);

  return null;
}
