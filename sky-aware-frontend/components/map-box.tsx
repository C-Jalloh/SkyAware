'use client';

import { useRef, useEffect } from 'react';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl, { type Marker } from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import type { MapProps, TempoDataPoint } from '@/types/map';
import { coordsAreEqual } from '@/utils/helpers';

const mapBoxApiKey =
  process.env.NEXT_MAPBOX_API_KEY ??
  'pk.eyJ1IjoiYy1qYWxsb2giLCJhIjoiY21nYnd4N2M1MTJudTJtcXdxY2oxdWQzdCJ9.QBxmXdQ7LU0iaNGffCKa0Q';

const MapboxView = ({
  map: mapResult,
  locations,
  onLocationSelect,
  selectedLocation,
}: Readonly<MapProps>) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;

    script.onload = () => {
      if (!mapContainerRef.current) return;

      mapboxgl.accessToken = mapBoxApiKey;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-98.5795, 39.8283],
        zoom: 4,
        projection: 'mercator',
      });

      mapRef.current = mapResult ?? map;

      map.on('load', () => {
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        locations.forEach((location: TempoDataPoint) => {
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.cssText = `
            width: 50px;
            height: 50px;
            cursor: pointer;
            position: relative;
            transition: transform 0.3s ease;
          `;

          el.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background: ${location.color};
                border: 3px solid rgba(255,255,255,0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                color: #000;
                box-shadow: 0 0 20px ${location.color}80, 0 4px 12px rgba(0,0,0,0.4);
                transition: all 0.3s ease;
              ">
                ${location.aqi}
              </div>
            </div>
          `;

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.15)';
          });

          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
          });

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
          }).setHTML(`
            <div style="padding: 12px; color: #000; min-width: 180px;">
              <div style="font-size: 24px; font-weight: bold; color: ${location.color}; margin: 8px 0;">AQI: ${location.aqi}</div>
              <span style="font-size: 13px; color: #333; font-weight: 500;">${location.category}</span>
            </div>
          `);

          const marker = new mapboxgl.Marker(el)
            .setLngLat([
              location.coordinates.longitude,
              location.coordinates.latitude,
            ])
            .setPopup(popup)
            .addTo(map);

          el.addEventListener('click', () => {
            onLocationSelect(location);
            map.flyTo({
              center: [
                location.coordinates.longitude,
                location.coordinates.latitude,
              ],
              zoom: 10,
              duration: 2000,
            });
          });

          markersRef.current.push(marker);
        });

        map.addSource('tempo-data', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: locations.map((loc: TempoDataPoint) => ({
              type: 'Feature',
              properties: { aqi: loc.aqi },
              geometry: {
                type: 'Point',
                coordinates: [
                  loc.coordinates.longitude,
                  loc.coordinates.latitude,
                ],
              },
            })),
          },
        });

        map.addLayer({
          id: 'tempo-heat',
          type: 'heatmap',
          source: 'tempo-data',
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'aqi'],
              0,
              0,
              200,
              1,
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              1,
              9,
              3,
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(0,228,0,0)',
              0.2,
              'rgba(0,228,0,0.3)',
              0.4,
              'rgba(255,255,0,0.3)',
              0.6,
              'rgba(255,126,0,0.4)',
              0.8,
              'rgba(255,0,0,0.5)',
              1,
              'rgba(126,0,35,0.6)',
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              20,
              9,
              40,
            ],
            'heatmap-opacity': 0.6,
          },
        });
      });

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
        marker: true, // add marker on result
      });
      map.addControl(geocoder, 'top-left');

      map.on('click', e => {
        console.log('Clicked coordinates:', e.lngLat);
      });
    };

    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('load', () => {});
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations, onLocationSelect, mapResult]);

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      markersRef.current.forEach((marker: Marker, index) => {
        const el = marker.getElement();
        const circle = el.querySelector<HTMLDivElement>('div > div')!;

        if (
          coordsAreEqual(
            locations[index].coordinates,
            selectedLocation.coordinates,
          )
        ) {
          circle.style.border = '4px solid #fff';
          circle.style.transform = 'scale(1.2)';
          circle.style.boxShadow = `0 0 30px ${locations[index].color}, 0 6px 16px rgba(0,0,0,0.5)`;
        } else {
          circle.style.border = '3px solid rgba(255,255,255,0.9)';
          circle.style.transform = 'scale(1)';
          circle.style.boxShadow = `0 0 20px ${locations[index].color}80, 0 4px 12px rgba(0,0,0,0.4)`;
        }
      });
    }
  }, [selectedLocation, locations]);

  return <div ref={mapContainerRef} className='w-full h-full' />;
};

export default MapboxView;
