import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CityData, SimulationResults } from '../types';
import { AlertCircle } from 'lucide-react';
import { SpatialAnalyticsEngine, ChokePoint, CitizenAgent, EvacuationRoute, ElevationPoint } from '../utils/spatialAnalytics';
import SpatialInspector from './SpatialInspector';

interface Map3DProps {
  city: CityData;
  simulationActive: boolean;
  results: SimulationResults | null;
  mapStyle: '2d' | '3d';
}

export default function Map3D({ city, simulationActive, results, mapStyle }: Map3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedChoke, setSelectedChoke] = useState<ChokePoint | null>(null);
  const [chokePoints, setChokePoints] = useState<ChokePoint[]>([]);
  const [evacuationRoutes, setEvacuationRoutes] = useState<EvacuationRoute[]>([]);
  const [agents, setAgents] = useState<CitizenAgent[]>([]);
  const spatialEngine = useRef<SpatialAnalyticsEngine | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const apiKey = import.meta.env.VITE_MAPTILER_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      setMapError('MapTiler API key not configured');
      return;
    }

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${apiKey}`,
        center: city.coordinates,
        zoom: city.zoom,
        pitch: mapStyle === '3d' ? city.pitch : 0,
        bearing: city.bearing,
        antialias: true,
      });

      map.current.on('load', () => {
        if (!map.current) return;

        map.current.addSource('mapillary', {
          type: 'vector',
          tiles: [`https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|82818e37e13f54d8775d39559e1d5a65`],
          minzoom: 6,
          maxzoom: 14,
        });

        if (map.current.getLayer('building')) {
          map.current.setPaintProperty('building', 'fill-extrusion-height', [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height'],
          ]);
          map.current.setPaintProperty('building', 'fill-extrusion-base', [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height'],
          ]);
        }
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      setMapError('Failed to initialize map');
      console.error('Map initialization error:', error);
    }
  }, [city]);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    map.current.easeTo({
      center: city.coordinates,
      zoom: city.zoom,
      pitch: mapStyle === '3d' ? city.pitch : 0,
      bearing: city.bearing,
      duration: 2000,
    });
  }, [city, mapStyle]);

  const renderChokePointsLayer = useCallback(() => {
    if (!map.current || chokePoints.length === 0) return;

    const mapInstance = map.current;

    if (mapInstance.getSource('choke-points')) {
      if (mapInstance.getLayer('choke-points-layer')) {
        mapInstance.removeLayer('choke-points-layer');
      }
      if (mapInstance.getLayer('choke-points-pulse')) {
        mapInstance.removeLayer('choke-points-pulse');
      }
      mapInstance.removeSource('choke-points');
    }

    const chokeFeatures: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: chokePoints.map((choke) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [choke.lng, choke.lat],
        },
        properties: {
          riskScore: choke.riskScore,
          waterDepth: choke.waterDepth,
        },
      })),
    };

    mapInstance.addSource('choke-points', {
      type: 'geojson',
      data: chokeFeatures,
    });

    mapInstance.addLayer({
      id: 'choke-points-layer',
      type: 'circle',
      source: 'choke-points',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['get', 'riskScore'], 0, 8, 100, 20],
        'circle-color': ['interpolate', ['linear'], ['get', 'riskScore'], 30, '#fbbf24', 60, '#f97316', 100, '#dc2626'],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    mapInstance.on('click', 'choke-points-layer', (e) => {
      if (e.features?.[0]) {
        const chokeId = chokePoints.findIndex(
          (c) => c.lat === e.features![0].geometry.coordinates[1] &&
                 c.lng === e.features![0].geometry.coordinates[0]
        );
        if (chokeId >= 0) {
          setSelectedChoke(chokePoints[chokeId]);
        }
      }
    });

    mapInstance.on('mouseenter', 'choke-points-layer', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'choke-points-layer', () => {
      mapInstance.getCanvas().style.cursor = '';
    });
  }, [chokePoints]);

  const renderEvacuationRoutes = useCallback(() => {
    if (!map.current || evacuationRoutes.length === 0) return;

    const mapInstance = map.current;

    if (mapInstance.getSource('evacuation-routes')) {
      if (mapInstance.getLayer('evacuation-routes-layer')) {
        mapInstance.removeLayer('evacuation-routes-layer');
      }
      mapInstance.removeSource('evacuation-routes');
    }

    const routeFeatures: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: evacuationRoutes.map((route, idx) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: route.waypoints,
        },
        properties: {
          congestion: route.congestion,
          id: idx,
        },
      })),
    };

    mapInstance.addSource('evacuation-routes', {
      type: 'geojson',
      data: routeFeatures,
    });

    mapInstance.addLayer({
      id: 'evacuation-routes-layer',
      type: 'line',
      source: 'evacuation-routes',
      paint: {
        'line-color': '#10b981',
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 4],
        'line-opacity': 0.8,
        'line-dasharray': [2, 2],
      },
    });
  }, [evacuationRoutes]);

  const renderAgents = useCallback(() => {
    if (!map.current || agents.length === 0) return;

    const mapInstance = map.current;

    if (mapInstance.getSource('agents')) {
      if (mapInstance.getLayer('agents-layer')) {
        mapInstance.removeLayer('agents-layer');
      }
      mapInstance.removeSource('agents');
    }

    const agentFeatures: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: agents.map((agent) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [agent.lng, agent.lat],
        },
        properties: {
          status: agent.status,
        },
      })),
    };

    mapInstance.addSource('agents', {
      type: 'geojson',
      data: agentFeatures,
    });

    mapInstance.addLayer({
      id: 'agents-layer',
      type: 'circle',
      source: 'agents',
      paint: {
        'circle-radius': 3,
        'circle-color': [
          'match',
          ['get', 'status'],
          'safe',
          '#10b981',
          'evacuating',
          '#f59e0b',
          'stuck',
          '#ef4444',
          '#6b7280',
        ],
        'circle-opacity': 0.7,
      },
    });
  }, [agents]);

  useEffect(() => {
    if (!map.current || !results || !simulationActive) return;

    const mapInstance = map.current;

    if (!spatialEngine.current) {
      spatialEngine.current = new SpatialAnalyticsEngine(
        city.coordinates[1],
        city.coordinates[0]
      );
    }

    const engine = spatialEngine.current;
    const elevationMap = engine.generateElevationMap(
      results.floodRisk / 100,
      results.floodRisk > 50 ? 0.6 : 0.3,
      results.trafficCongestion / 100
    );

    const newChokePoints = engine.detectChokePoints(
      elevationMap,
      results.trafficCongestion / 100,
      results.floodRisk / 100
    );

    const safeZones = engine.generateSafeZones(elevationMap);
    const newRoutes = engine.calculateEvacuationRoutes(newChokePoints, safeZones);
    const newAgents = engine.generateCitizenAgents(newChokePoints, newRoutes, true);

    setChokePoints(newChokePoints);
    setEvacuationRoutes(newRoutes);
    setAgents(newAgents);

    if (mapInstance.isStyleLoaded()) {
      renderChokePointsLayer();
      renderEvacuationRoutes();
      renderAgents();
    }

    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      if (spatialEngine.current) {
        const updatedAgents = spatialEngine.current.updateAgentPositions(
          agents,
          newChokePoints,
          deltaTime
        );
        setAgents(updatedAgents);
        renderAgents();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationActive, results, city, renderChokePointsLayer, renderEvacuationRoutes, renderAgents]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Map Configuration Required</h3>
          <p className="text-gray-400 mb-4">{mapError}</p>
          <div className="bg-gray-800 p-4 rounded-lg text-left text-sm">
            <p className="text-gray-300 mb-2">To enable 3D mapping:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-400">
              <li>Visit <a href="https://cloud.maptiler.com/account/keys/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">cloud.maptiler.com/account/keys/</a></li>
              <li>Create a free account and get your API key</li>
              <li>Add it to the <code className="bg-gray-700 px-1 rounded">.env</code> file as <code className="bg-gray-700 px-1 rounded">VITE_MAPTILER_KEY</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      {selectedChoke && (
        <SpatialInspector
          chokePoint={selectedChoke}
          onClose={() => setSelectedChoke(null)}
          onMitigate={(mitigation) => {
            console.log('Implementing mitigation:', mitigation);
            setSelectedChoke(null);
          }}
        />
      )}
    </div>
  );
}
