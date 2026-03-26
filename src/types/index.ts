export interface SimulationParameters {
  city: string;
  rainfall: number;
  riverLevel: number;
  populationDensity: number;
  trafficVolume: number;
  evAdoption: number;
  hasMetroLine: boolean;
  hasHighway: boolean;
  hasFlyover: boolean;
  hasChargingStations: boolean;
  hasFloodBarriers: boolean;
}

export interface SimulationResults {
  floodRisk: number;
  trafficCongestion: number;
  evacuationDifficulty: number;
  pollutionIndex: number;
  affectedAreas: number;
  evacuationTime: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  improvement: number;
  timeEstimate: string;
  icon: string;
}

export interface CityData {
  name: string;
  coordinates: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}
