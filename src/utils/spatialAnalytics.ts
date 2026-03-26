import { SimulationResults } from '../types';

export interface ElevationPoint {
  lat: number;
  lng: number;
  elevation: number;
  isLowLying: boolean;
}

export interface ChokePoint {
  id: string;
  lat: number;
  lng: number;
  population: number;
  elevation: number;
  riskScore: number;
  waterDepth: number;
  economicDamage: number;
}

export interface EvacuationRoute {
  id: string;
  waypoints: [number, number][];
  safeZoneId: string;
  distance: number;
  estimatedTime: number;
  congestion: number;
  capacity: number;
}

export interface CitizenAgent {
  id: string;
  lat: number;
  lng: number;
  targetLat: number;
  targetLng: number;
  status: 'normal' | 'evacuating' | 'stuck' | 'safe';
  speed: number;
  assignedRoute: string;
}

export interface SafeZone {
  id: string;
  lat: number;
  lng: number;
  name: string;
  capacity: number;
  currentPopulation: number;
  elevation: number;
}

export class SpatialAnalyticsEngine {
  private cityCenter: [number, number];
  private gridSize: number = 0.01;

  constructor(centerLat: number, centerLng: number) {
    this.cityCenter = [centerLng, centerLat];
  }

  generateElevationMap(
    rainfall: number,
    riverLevel: number,
    populationDensity: number
  ): ElevationPoint[] {
    const elevationPoints: ElevationPoint[] = [];
    const gridRadius = 0.15;

    for (let i = -gridRadius; i < gridRadius; i += this.gridSize) {
      for (let j = -gridRadius; j < gridRadius; j += this.gridSize) {
        const lat = this.cityCenter[1] + i;
        const lng = this.cityCenter[0] + j;

        const distFromCenter = Math.sqrt(i * i + j * j);
        const baseElevation = 100 + distFromCenter * 200;

        const noiseX = Math.sin(lng * 10) * Math.cos(lat * 10);
        const noiseY = Math.sin(lat * 15) * Math.cos(lng * 15);
        const elevation = baseElevation + noiseX * 50 + noiseY * 50;

        const riverEffect = Math.abs(lng - this.cityCenter[0]) < 0.03 ? -30 * riverLevel : 0;
        const finalElevation = elevation + riverEffect;

        const isLowLying = finalElevation < 120;

        elevationPoints.push({
          lat,
          lng,
          elevation: finalElevation,
          isLowLying,
        });
      }
    }

    return elevationPoints;
  }

  detectChokePoints(
    elevationMap: ElevationPoint[],
    populationDensity: number,
    rainfall: number
  ): ChokePoint[] {
    const chokePoints: ChokePoint[] = [];
    const clusterSize = 4;
    const clusterElevation: { [key: string]: ElevationPoint[] } = {};

    elevationMap.forEach((point) => {
      const clusterKey = `${Math.round(point.lat / clusterSize) * clusterSize}_${Math.round(point.lng / clusterSize) * clusterSize}`;
      if (!clusterElevation[clusterKey]) clusterElevation[clusterKey] = [];
      clusterElevation[clusterKey].push(point);
    });

    Object.entries(clusterElevation).forEach(([key, points]) => {
      const lowLyingCount = points.filter((p) => p.isLowLying).length;
      const avgElevation =
        points.reduce((sum, p) => sum + p.elevation, 0) / points.length;

      if (lowLyingCount > points.length * 0.5) {
        const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
        const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;

        const populationFactor = populationDensity * 50;
        const waterDepth = Math.max(
          0,
          (120 - avgElevation) * (rainfall + 0.5) * 2
        );
        const riskScore = Math.min(
          100,
          (waterDepth * 0.4 + populationFactor * 0.6) * rainfall * 150
        );

        const economicDamage =
          waterDepth * populationFactor * 15000;

        if (riskScore > 25) {
          chokePoints.push({
            id: `choke_${key}`,
            lat,
            lng,
            population: Math.round(populationFactor * 100),
            elevation: avgElevation,
            riskScore: Math.min(100, riskScore),
            waterDepth: Math.max(0, waterDepth),
            economicDamage,
          });
        }
      }
    });

    return chokePoints.sort((a, b) => b.riskScore - a.riskScore).slice(0, 15);
  }

  generateSafeZones(elevationMap: ElevationPoint[]): SafeZone[] {
    const safeZones: SafeZone[] = [];
    const highElevationPoints = elevationMap.filter((p) => p.elevation > 150);

    const clusters: { [key: string]: ElevationPoint[] } = {};
    highElevationPoints.forEach((point) => {
      const clusterKey = `${Math.round(point.lat / 0.03) * 0.03}_${Math.round(point.lng / 0.03) * 0.03}`;
      if (!clusters[clusterKey]) clusters[clusterKey] = [];
      clusters[clusterKey].push(point);
    });

    let zoneIndex = 0;
    Object.values(clusters).forEach((points) => {
      if (points.length > 3) {
        const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
        const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
        const avgElevation =
          points.reduce((sum, p) => sum + p.elevation, 0) / points.length;

        safeZones.push({
          id: `safe_${zoneIndex}`,
          lat: avgLat,
          lng: avgLng,
          name: `Safe Zone ${zoneIndex + 1}`,
          capacity: 5000,
          currentPopulation: 0,
          elevation: avgElevation,
        });
        zoneIndex++;
      }
    });

    return safeZones;
  }

  calculateEvacuationRoutes(
    chokePoints: ChokePoint[],
    safeZones: SafeZone[]
  ): EvacuationRoute[] {
    const routes: EvacuationRoute[] = [];

    chokePoints.forEach((choke, index) => {
      const nearestSafeZone = safeZones.reduce((nearest, zone) => {
        const dist =
          Math.sqrt(
            Math.pow(zone.lat - choke.lat, 2) +
              Math.pow(zone.lng - choke.lng, 2)
          ) * 111;
        return dist < nearest.dist ? { zone, dist } : nearest;
      }, { zone: safeZones[0], dist: Infinity });

      const distance =
        Math.sqrt(
          Math.pow(
            nearestSafeZone.zone.lat - choke.lat,
            2
          ) +
            Math.pow(
              nearestSafeZone.zone.lng - choke.lng,
              2
            )
        ) * 111;

      const elevationDiff = Math.max(
        0,
        nearestSafeZone.zone.elevation - choke.elevation
      );
      const difficulty = Math.sqrt(elevationDiff) * 0.5 + 1;
      const estimatedTime = (distance / (5 * difficulty)) * 60;

      const waypoints: [number, number][] = [
        [choke.lng, choke.lat],
      ];

      for (let i = 0; i < 2; i++) {
        const t = (i + 1) / 3;
        const interpLat =
          choke.lat + (nearestSafeZone.zone.lat - choke.lat) * t;
        const interpLng =
          choke.lng + (nearestSafeZone.zone.lng - choke.lng) * t;
        waypoints.push([interpLng, interpLat]);
      }
      waypoints.push([nearestSafeZone.zone.lng, nearestSafeZone.zone.lat]);

      routes.push({
        id: `route_${index}`,
        waypoints,
        safeZoneId: nearestSafeZone.zone.id,
        distance,
        estimatedTime,
        congestion: choke.riskScore / 100,
        capacity: Math.round(choke.population / estimatedTime * 10),
      });
    });

    return routes;
  }

  generateCitizenAgents(
    chokePoints: ChokePoint[],
    routes: EvacuationRoute[],
    disasterActive: boolean
  ): CitizenAgent[] {
    const agents: CitizenAgent[] = [];
    let agentId = 0;

    chokePoints.forEach((choke) => {
      const agentCount = Math.round(choke.population / 500);
      const route = routes.find((r) => r.waypoints[0][1] === choke.lat);

      for (let i = 0; i < agentCount; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.01;
        const offsetLng = (Math.random() - 0.5) * 0.01;

        const targetLat = route
          ? route.waypoints[route.waypoints.length - 1][1]
          : choke.lat + 0.05;
        const targetLng = route
          ? route.waypoints[route.waypoints.length - 1][0]
          : choke.lng + 0.05;

        agents.push({
          id: `agent_${agentId}`,
          lat: choke.lat + offsetLat,
          lng: choke.lng + offsetLng,
          targetLat,
          targetLng,
          status: disasterActive ? 'evacuating' : 'normal',
          speed: 5 + Math.random() * 10,
          assignedRoute: route?.id || '',
        });

        agentId++;
      }
    });

    return agents;
  }

  updateAgentPositions(
    agents: CitizenAgent[],
    chokePoints: ChokePoint[],
    deltaTime: number
  ): CitizenAgent[] {
    return agents.map((agent) => {
      if (agent.status === 'safe') return agent;

      const dx = agent.targetLng - agent.lng;
      const dy = agent.targetLat - agent.lat;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.001) {
        return { ...agent, status: 'safe' };
      }

      const choke = chokePoints.find(
        (c) =>
          Math.abs(c.lat - agent.lat) < 0.005 &&
          Math.abs(c.lng - agent.lng) < 0.005
      );

      const isStuck = choke && choke.riskScore > 75;

      if (isStuck) {
        return { ...agent, status: 'stuck' };
      }

      const moveDistance = (agent.speed * deltaTime) / 100000;
      const moveRatio = Math.min(1, moveDistance / distance);

      return {
        ...agent,
        lng: agent.lng + dx * moveRatio,
        lat: agent.lat + dy * moveRatio,
        status: agent.status,
      };
    });
  }
}
