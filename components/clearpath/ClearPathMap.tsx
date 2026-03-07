'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import CongestionLayer from './CongestionLayer';
import FlowArcs from './FlowArcs';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

interface ClearPathMapProps {
  mode: 'government' | 'civilian';
  simulationResult: any;
  recommendedHospital: any;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  proposedLocation?: { lat: number; lng: number } | null;
}

export default function ClearPathMap({
  mode,
  simulationResult,
  recommendedHospital,
  onMapClick,
  proposedLocation,
}: ClearPathMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [congestion, setCongestion] = useState<any[]>([]);
  const proposedMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const recommendedMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-79.3832, 43.6532],
      zoom: 11.5,
      pitch: 45,
      bearing: -17.6,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 12,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );

      setMapReady(true);
    });

    map.on('click', (e) => {
      onMapClick?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [hospRes, congRes] = await Promise.all([
          fetch('/api/clearpath/hospitals?city=toronto'),
          fetch('/api/clearpath/congestion?city=toronto'),
        ]);
        const hospData = await hospRes.json();
        const congData = await congRes.json();
        setHospitals(hospData);
        setCongestion(congData);
      } catch (err) {
        console.warn('Failed to fetch hospital data, using empty state', err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !proposedLocation) {
      proposedMarkerRef.current?.remove();
      proposedMarkerRef.current = null;
      return;
    }

    if (proposedMarkerRef.current) {
      proposedMarkerRef.current.setLngLat([proposedLocation.lng, proposedLocation.lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'proposed-hospital-pin';
      el.style.cssText = `
        width: 24px; height: 24px; border-radius: 50%;
        background: #3b82f6; border: 3px solid #fff;
        box-shadow: 0 0 12px rgba(59,130,246,0.6);
        cursor: grab;
      `;
      proposedMarkerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat([proposedLocation.lng, proposedLocation.lat])
        .addTo(mapRef.current);

      proposedMarkerRef.current.on('dragend', () => {
        const lngLat = proposedMarkerRef.current!.getLngLat();
        onMapClick?.({ lng: lngLat.lng, lat: lngLat.lat });
      });
    }
  }, [proposedLocation, onMapClick]);

  useEffect(() => {
    if (!mapRef.current) return;

    recommendedMarkerRef.current?.remove();
    recommendedMarkerRef.current = null;

    if (!recommendedHospital) return;

    const h = recommendedHospital.hospital ?? recommendedHospital;
    if (!h?.latitude || !h?.longitude) return;

    const el = document.createElement('div');
    el.style.cssText = `
      width: 32px; height: 32px; border-radius: 50%;
      background: #22c55e; border: 3px solid #fff;
      box-shadow: 0 0 16px rgba(34,197,94,0.7);
      animation: bounce 1s infinite;
    `;

    recommendedMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([h.longitude, h.latitude])
      .addTo(mapRef.current);

    mapRef.current.flyTo({
      center: [h.longitude, h.latitude],
      zoom: 13,
      speed: 1.2,
    });
  }, [recommendedHospital]);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />
      {mapReady && (
        <>
          <CongestionLayer map={mapRef.current} hospitals={hospitals} congestion={congestion} />
          <FlowArcs
            map={mapRef.current}
            hospitals={hospitals}
            proposedLocation={proposedLocation ?? null}
            simulationResult={simulationResult}
          />
        </>
      )}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
