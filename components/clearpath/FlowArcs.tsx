'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface FlowArcsProps {
  map: mapboxgl.Map | null;
  hospitals: any[];
  proposedLocation: { lat: number; lng: number } | null;
  simulationResult: any;
}

export default function FlowArcs({ map, hospitals, proposedLocation, simulationResult }: FlowArcsProps) {
  useEffect(() => {
    if (!map || !proposedLocation || !simulationResult || hospitals.length === 0) return;

    const sourceId = 'flow-arcs';
    const layerId = 'flow-arc-lines';

    const features = hospitals
      .filter((h: any) => {
        const id = (h._id ?? h.id)?.toString();
        return simulationResult.delta && simulationResult.delta[id] < 0;
      })
      .map((h: any) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [h.longitude, h.latitude],
            [proposedLocation.lng, proposedLocation.lat]
          ]
        },
        properties: {
          delta: simulationResult.delta[(h._id ?? h.id)?.toString()] ?? 0,
          name: h.name
        }
      }));

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
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-dasharray': [2, 2],
        'line-opacity': 0.8
      }
    });

    return () => {
      try {
        if (map.getStyle()) {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        }
      } catch {
        // Map already destroyed during navigation — nothing to clean up
      }
    };
  }, [map, hospitals, proposedLocation, simulationResult]);

  return null;
}
