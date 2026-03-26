import { ChokePoint } from '../utils/spatialAnalytics';
import { X, AlertTriangle, Droplets, DollarSign, ShieldAlert, TrendingDown } from 'lucide-react';

interface SpatialInspectorProps {
  chokePoint: ChokePoint;
  onClose: () => void;
  onMitigate?: (mitigation: string) => void;
}

export default function SpatialInspector({
  chokePoint,
  onClose,
  onMitigate,
}: SpatialInspectorProps) {
  const mitigationOptions = [
    {
      id: 'barrier',
      name: 'Build Flood Barrier',
      cost: 5000000,
      effectiveness: 75,
      timeline: '18 months',
      description: 'Construct physical barriers to prevent water ingress',
    },
    {
      id: 'drainage',
      name: 'Advanced Drainage',
      cost: 2500000,
      effectiveness: 55,
      timeline: '12 months',
      description: 'Install smart drainage system with pumps',
    },
    {
      id: 'elevation',
      name: 'Terrain Elevation',
      cost: 8000000,
      effectiveness: 85,
      timeline: '24 months',
      description: 'Raise ground elevation in flood-prone area',
    },
    {
      id: 'routing',
      name: 'Improve Evacuation Routes',
      cost: 1500000,
      effectiveness: 40,
      timeline: '6 months',
      description: 'Enhance road infrastructure and signage',
    },
  ];

  const formatCurrency = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-white">Zone Inspector</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Water Depth</div>
              <div className="text-3xl font-bold text-blue-400">
                {chokePoint.waterDepth.toFixed(1)} m
              </div>
              <div className="text-xs text-gray-500 mt-1">Current accumulation</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Risk Score</div>
              <div className="text-3xl font-bold text-red-400">
                {chokePoint.riskScore.toFixed(0)}/100
              </div>
              <div className="text-xs text-gray-500 mt-1">Critical hazard level</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Population at Risk</div>
              <div className="text-3xl font-bold text-yellow-400">
                {(chokePoint.population / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-500 mt-1">Estimated residents</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Economic Damage</div>
              <div className="text-3xl font-bold text-orange-400">
                {formatCurrency(chokePoint.economicDamage)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Potential loss</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-950 to-orange-950 rounded-lg p-4 border border-red-800">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">Situation Assessment</h3>
                <p className="text-red-200 text-sm">
                  This zone shows {chokePoint.waterDepth > 2 ? 'severe' : 'significant'} flood risk
                  with {chokePoint.waterDepth.toFixed(1)}m of water accumulation. The area hosts
                  approximately {Math.round(chokePoint.population)} residents who need immediate
                  evacuation support. Economic impact: {formatCurrency(chokePoint.economicDamage)}.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-400" />
              Recommended Mitigation Strategies
            </h3>

            <div className="space-y-3">
              {mitigationOptions.map((option) => (
                <div
                  key={option.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-600 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{option.name}</h4>
                      <p className="text-gray-400 text-sm">{option.description}</p>
                    </div>
                    <button
                      onClick={() => onMitigate?.(option.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Implement
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-700/50 rounded p-2">
                      <div className="text-gray-400 mb-1">Cost</div>
                      <div className="text-white font-semibold">
                        {formatCurrency(option.cost)}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded p-2">
                      <div className="text-gray-400 mb-1">Effectiveness</div>
                      <div className="text-green-400 font-semibold">
                        +{option.effectiveness}%
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded p-2">
                      <div className="text-gray-400 mb-1">Timeline</div>
                      <div className="text-white font-semibold">{option.timeline}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-950 rounded-lg p-4 border border-blue-800">
            <div className="flex items-start gap-3">
              <Droplets className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">Hydrological Data</h3>
                <div className="text-blue-200 text-sm space-y-1">
                  <div>
                    Elevation: <span className="font-mono">{chokePoint.elevation.toFixed(1)}m</span>
                  </div>
                  <div>
                    Runoff Flow: <span className="font-mono">High accumulation zone</span>
                  </div>
                  <div>
                    Drainage Capacity: <span className="font-mono">Critical deficit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
