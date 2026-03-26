import { SimulationParameters, SimulationResults, AIRecommendation } from '../types';

export function runSimulation(params: SimulationParameters): SimulationResults {
  const baseFloodRisk = (params.rainfall * 0.4 + params.riverLevel * 0.6) * 100;
  const floodReduction = params.hasFloodBarriers ? 25 : 0;
  const floodRisk = Math.max(0, Math.min(100, baseFloodRisk - floodReduction));

  const baseTraffic = (params.trafficVolume * 0.5 + params.populationDensity * 0.3) * 100;
  const trafficReduction =
    (params.hasMetroLine ? 15 : 0) +
    (params.hasHighway ? 12 : 0) +
    (params.hasFlyover ? 8 : 0);
  const trafficCongestion = Math.max(0, Math.min(100, baseTraffic - trafficReduction));

  const evacuationBase = (floodRisk * 0.4 + trafficCongestion * 0.4 + params.populationDensity * 20);
  const evacuationReduction =
    (params.hasMetroLine ? 10 : 0) +
    (params.hasHighway ? 15 : 0);
  const evacuationDifficulty = Math.max(0, Math.min(100, evacuationBase - evacuationReduction));

  const basePollution = (params.trafficVolume * 60 + params.populationDensity * 30);
  const pollutionReduction = params.evAdoption * 30 + (params.hasChargingStations ? 10 : 0);
  const pollutionIndex = Math.max(0, Math.min(100, basePollution - pollutionReduction));

  const affectedAreas = Math.round((floodRisk / 100) * 45);
  const evacuationTime = Math.round(60 + (evacuationDifficulty / 100) * 180);

  return {
    floodRisk,
    trafficCongestion,
    evacuationDifficulty,
    pollutionIndex,
    affectedAreas,
    evacuationTime,
  };
}

export function generateAIInsights(
  params: SimulationParameters,
  results: SimulationResults
): string {
  const insights: string[] = [];

  if (results.floodRisk > 70) {
    insights.push(
      `Critical flood risk detected (${results.floodRisk.toFixed(1)}%). Low-lying areas near rivers and coastal zones are highly vulnerable. Current rainfall levels combined with river conditions create severe flooding conditions.`
    );
  } else if (results.floodRisk > 40) {
    insights.push(
      `Moderate flood risk (${results.floodRisk.toFixed(1)}%). Several areas show vulnerability to flooding. Implementation of additional drainage systems recommended.`
    );
  } else {
    insights.push(
      `Low flood risk (${results.floodRisk.toFixed(1)}%). Current conditions are within manageable parameters.`
    );
  }

  if (results.trafficCongestion > 60) {
    insights.push(
      `Severe traffic congestion detected (${results.trafficCongestion.toFixed(1)}%). Major arterial roads are experiencing gridlock. Average commute times increased by ${Math.round(results.trafficCongestion * 1.2)}%.`
    );
  } else if (results.trafficCongestion > 30) {
    insights.push(
      `Moderate traffic levels (${results.trafficCongestion.toFixed(1)}%). Peak hour congestion in central districts.`
    );
  }

  if (results.evacuationDifficulty > 70) {
    insights.push(
      `Emergency evacuation would be extremely challenging. Estimated evacuation time: ${results.evacuationTime} minutes for affected zones. ${results.affectedAreas} areas require immediate attention.`
    );
  } else if (results.evacuationDifficulty > 40) {
    insights.push(
      `Evacuation procedures are feasible but require optimization. Approximately ${results.evacuationTime} minutes needed for safe evacuation.`
    );
  }

  if (results.pollutionIndex > 60) {
    insights.push(
      `Air quality index at concerning levels (${results.pollutionIndex.toFixed(1)}%). Vehicle emissions are the primary contributor. Accelerating EV adoption would significantly improve air quality.`
    );
  }

  if (!params.hasMetroLine && results.trafficCongestion > 50) {
    insights.push(
      'Mass transit infrastructure deficit identified. A metro rail network would reduce congestion by an estimated 25-30%.'
    );
  }

  return insights.join(' ');
}

export function generateRecommendations(
  params: SimulationParameters,
  results: SimulationResults
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  if (!params.hasMetroLine && results.trafficCongestion > 40) {
    recommendations.push({
      id: 'metro',
      title: 'Expand Metro Rail Network',
      description: 'Build 3 new metro lines connecting major hubs to reduce traffic by 25%',
      impact: 'High',
      improvement: 25,
      timeEstimate: '3-5 years',
      icon: 'Train',
    });
  }

  if (results.trafficCongestion > 50) {
    recommendations.push({
      id: 'traffic-ai',
      title: 'Deploy Smart Traffic Signals',
      description: 'AI-powered traffic management system with real-time optimization',
      impact: 'Medium',
      improvement: 15,
      timeEstimate: '6-12 months',
      icon: 'TrafficCone',
    });
  }

  if (results.evacuationDifficulty > 60) {
    recommendations.push({
      id: 'evacuation',
      title: 'Optimize Evacuation Routes',
      description: 'Establish dedicated evacuation corridors with clear signage',
      impact: 'High',
      improvement: 30,
      timeEstimate: '1-2 years',
      icon: 'Navigation',
    });
  }

  if (results.floodRisk > 50 && !params.hasFloodBarriers) {
    recommendations.push({
      id: 'flood-barriers',
      title: 'Install Flood Barriers',
      description: 'Deploy advanced flood control systems in vulnerable zones',
      impact: 'High',
      improvement: 35,
      timeEstimate: '2-3 years',
      icon: 'Shield',
    });
  }

  if (results.pollutionIndex > 50 && params.evAdoption < 0.5) {
    recommendations.push({
      id: 'ev-incentives',
      title: 'Accelerate EV Adoption',
      description: 'Implement subsidies and expand charging infrastructure',
      impact: 'Medium',
      improvement: 20,
      timeEstimate: '2-4 years',
      icon: 'Zap',
    });
  }

  if (!params.hasHighway && results.trafficCongestion > 55) {
    recommendations.push({
      id: 'highway',
      title: 'Build Ring Road Highway',
      description: 'Construct peripheral highway to divert through-traffic',
      impact: 'High',
      improvement: 28,
      timeEstimate: '4-6 years',
      icon: 'Highway',
    });
  }

  if (results.trafficCongestion > 65) {
    recommendations.push({
      id: 'congestion-pricing',
      title: 'Implement Congestion Pricing',
      description: 'Dynamic toll system for city center during peak hours',
      impact: 'Medium',
      improvement: 18,
      timeEstimate: '6-12 months',
      icon: 'DollarSign',
    });
  }

  if (results.floodRisk > 40) {
    recommendations.push({
      id: 'drainage',
      title: 'Upgrade Drainage System',
      description: 'Modernize storm water management with smart sensors',
      impact: 'Medium',
      improvement: 22,
      timeEstimate: '1-2 years',
      icon: 'Droplets',
    });
  }

  return recommendations.slice(0, 6);
}
