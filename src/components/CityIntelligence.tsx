import { CityProfile } from '../data/globalCities';
import { AlertTriangle, CloudRain, Zap, Flame, Wind, Eye } from 'lucide-react';

interface CityIntelligenceProps {
  city: CityProfile;
}

const disasterLabels = {
  flood: { label: 'Flood', icon: CloudRain, color: 'text-blue-400' },
  earthquake: { label: 'Earthquake', icon: Zap, color: 'text-yellow-400' },
  heatwave: { label: 'Heatwave', icon: Flame, color: 'text-red-400' },
  wildfire: { label: 'Wildfire', icon: Flame, color: 'text-orange-400' },
  cyclone: { label: 'Cyclone', icon: Wind, color: 'text-cyan-400' },
  pollution: { label: 'Pollution', icon: Eye, color: 'text-gray-400' },
};

export default function CityIntelligence({ city }: CityIntelligenceProps) {
  const sorted = Object.entries(city.disasterProfile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const totalVulnerability = Math.round(
    Object.values(city.disasterProfile).reduce((a, b) => a + b, 0) / 6
  );

  const generateInsight = (): string => {
    const topDisaster = sorted[0][0];
    const elevation = city.elevationLevel;
    const density = city.populationDensity;
    const green = city.greenCover;

    let insight = '';

    if (topDisaster === 'flood' && city.coastal) {
      insight = `This coastal city faces critical flood risk from both ${city.elevationLevel === 'low' ? 'sea-level rise and' : ''} monsoon rains. `;
    } else if (topDisaster === 'earthquake') {
      insight = `Located in a seismically active zone, earthquake preparedness is critical. `;
    } else if (topDisaster === 'heatwave') {
      insight = `Extreme heat stress is the primary threat, with ${density > 0.8 ? 'high urban density intensifying the heat island effect' : 'moderate temperature impacts'}. `;
    } else if (topDisaster === 'wildfire') {
      insight = `Wildfire risk is elevated${green < 0.35 ? ' due to limited green cover' : ''}. `;
    } else if (topDisaster === 'cyclone') {
      insight = `Tropical cyclones pose a significant threat to this region. `;
    } else if (topDisaster === 'pollution') {
      insight = `Air quality is a major concern with ${density > 0.85 ? 'severe urban congestion' : 'industrial'} contributing to pollution. `;
    }

    insight += `Infrastructure investments in ${sorted.slice(0, 2).map(([d]) => disasterLabels[d as keyof typeof disasterLabels].label.toLowerCase()).join(' and ')} mitigation are recommended.`;

    return insight;
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          City Risk DNA
        </h3>
        <p className="text-xs text-gray-500 mb-2">Based on geographic and urban factors</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {sorted.map(([disaster, score]) => {
          const config = disasterLabels[disaster as keyof typeof disasterLabels];
          const Icon = config.icon;

          return (
            <div
              key={disaster}
              className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 text-center hover:border-gray-500 transition-colors"
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${config.color}`} />
              <div className="text-xs font-semibold text-gray-300">{config.label}</div>
              <div className="text-lg font-bold text-white">{Math.round(score)}</div>
              <div className="w-full h-1 bg-gray-600 rounded mt-1 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    score > 80
                      ? 'bg-red-500'
                      : score > 60
                      ? 'bg-yellow-500'
                      : score > 40
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-950/40 rounded-lg p-3 border border-blue-800/50">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200 leading-relaxed">{generateInsight()}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-gray-400">Overall Risk</div>
          <div className="text-2xl font-bold text-white">{totalVulnerability}</div>
          <div className="text-xs text-gray-500">/100</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Elevation</div>
          <div className="text-lg font-semibold text-white capitalize">
            {city.elevationLevel}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Green Cover</div>
          <div className="text-lg font-semibold text-green-400">
            {Math.round(city.greenCover * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
