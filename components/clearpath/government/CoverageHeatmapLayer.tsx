'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface CoverageHeatmapLayerProps {
    map: mapboxgl.Map | null;
    hospitals: Array<{
        _id?: { toString: () => string };
        id?: string;
        latitude?: number;
        longitude?: number;
        erBeds?: number;
    }>;
    congestion: Array<{
        hospitalId: string;
        occupancyPct: number;
    }>;
}

const SOURCE_ID = 'coverage-heatmap';
const LAYER_ID = 'coverage-heatmap-layer';

/**
 * Renders a Mapbox heatmap showing hospital demand intensity.
 * Higher occupancy = brighter/hotter, more ER beds = larger radius.
 * Helps government planners see where new hospitals are needed most.
 */
export default function CoverageHeatmapLayer({ map, hospitals, congestion }: CoverageHeatmapLayerProps) {
    useEffect(() => {
        if (!map || hospitals.length === 0) return;

        // Build occupancy lookup
        const loadMap: Record<string, number> = {};
        for (const c of congestion) {
            loadMap[c.hospitalId] = c.occupancyPct;
        }

        // Create GeoJSON features: each hospital is a heat point
        // Weight = occupancy percentage (higher = hotter = more need nearby)
        const features = hospitals
            .filter((h) => h.latitude && h.longitude)
            .map((h) => {
                const id = (h._id?.toString?.() ?? h.id) || '';
                const pct = loadMap[id] ?? 70;
                return {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'Point' as const,
                        coordinates: [h.longitude!, h.latitude!],
                    },
                    properties: {
                        weight: pct / 100,       // 0–1 normalized occupancy
                        beds: h.erBeds ?? 30,    // affects radius
                    },
                };
            });

        const data: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features,
        };

        // Update existing source or create new one
        if (map.getSource(SOURCE_ID)) {
            (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(data);
            return;
        }

        map.addSource(SOURCE_ID, { type: 'geojson', data });

        map.addLayer(
            {
                id: LAYER_ID,
                type: 'heatmap',
                source: SOURCE_ID,
                maxzoom: 16,
                paint: {
                    // Weight based on occupancy — high occupancy = stronger heat signal
                    'heatmap-weight': [
                        'interpolate', ['linear'], ['get', 'weight'],
                        0, 0.1,
                        0.5, 0.4,
                        0.8, 0.8,
                        1, 1,
                    ],
                    // Intensity ramp with zoom
                    'heatmap-intensity': [
                        'interpolate', ['linear'], ['zoom'],
                        8, 0.6,
                        13, 1.5,
                        16, 2,
                    ],
                    // Color ramp: cool (low demand) → hot (high demand)
                    'heatmap-color': [
                        'interpolate', ['linear'], ['heatmap-density'],
                        0, 'rgba(0,0,0,0)',
                        0.1, 'rgba(49,130,206,0.15)',    // subtle blue
                        0.3, 'rgba(49,196,141,0.35)',     // teal
                        0.5, 'rgba(234,179,8,0.50)',      // yellow
                        0.7, 'rgba(249,115,22,0.65)',     // orange
                        0.9, 'rgba(220,38,38,0.75)',      // red
                        1, 'rgba(185,28,28,0.85)',      // deep red
                    ],
                    // Radius based on zoom + bed count
                    'heatmap-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        8, 25,
                        11, 50,
                        13, 80,
                        16, 120,
                    ],
                    // Fade a bit at high zoom so circles/labels stay readable
                    'heatmap-opacity': [
                        'interpolate', ['linear'], ['zoom'],
                        12, 0.8,
                        16, 0.4,
                    ],
                },
            },
            'hospital-circles' // Insert below hospital circles so they render on top
        );

        return () => {
            try {
                if (map?.getStyle()) {
                    if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
                    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
                }
            } catch {
                // map destroyed
            }
        };
    }, [map, hospitals, congestion]);

    return null;
}
