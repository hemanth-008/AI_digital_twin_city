import { SimulationResults, AIRecommendation } from '../types';
import { AlertTriangle, TrendingUp, Clock, Brain as Train, TrafficCone, Navigation, Shield, Zap, DollarSign, Droplets, ArrowRight } from 'lucide-react';

interface InsightsPanelProps {
  results: SimulationResults | null;
  insights: string;
  recommendations: AIRecommendation[];
  isSimulating: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  Train: <Train className="w-5 h-5" />,
  TrafficCone: <TrafficCone className="w-5 h-5" />,
  Navigation: <Navigation className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Highway: <ArrowRight className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  Droplets: <Droplets className="w-5 h-5" />,
};

export default function InsightsPanel({
  results,
  insights,
  recommendations,
  isSimulating,
}: InsightsPanelProps) {
  if (!results && !isSimulating) {
    return (
      <div className="bg-gray-900 h-full flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Simulation Data</h3>
          <p className="text-gray-500 text-sm">
            Configure parameters and run a simulation to see AI insights and recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Analysis</h2>
          <p className="text-gray-400 text-sm">Real-time insights and recommendations</p>
        </div>

        {isSimulating && !results && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div>
                <p className="text-white font-medium">Processing simulation...</p>
                <p className="text-gray-400 text-sm">Analyzing city dynamics</p>
              </div>
            </div>
          </div>
        )}

        {results && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Flood Risk"
                value={results.floodRisk}
                color={results.floodRisk > 70 ? 'red' : results.floodRisk > 40 ? 'yellow' : 'green'}
              />
              <MetricCard
                label="Traffic"
                value={results.trafficCongestion}
                color={
                  results.trafficCongestion > 70
                    ? 'red'
                    : results.trafficCongestion > 40
                    ? 'yellow'
                    : 'green'
                }
              />
              <MetricCard
                label="Evacuation"
                value={results.evacuationDifficulty}
                color={
                  results.evacuationDifficulty > 70
                    ? 'red'
                    : results.evacuationDifficulty > 40
                    ? 'yellow'
                    : 'green'
                }
              />
              <MetricCard
                label="Pollution"
                value={results.pollutionIndex}
                color={
                  results.pollutionIndex > 70
                    ? 'red'
                    : results.pollutionIndex > 40
                    ? 'yellow'
                    : 'green'
                }
              />
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-lg p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                AI Insights
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{insights}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Recommended Actions
              </h3>

              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>

              {recommendations.length === 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
                  <p className="text-gray-400">
                    Current parameters are optimal. No critical recommendations at this time.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Simulation Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Affected Areas</span>
                  <span className="text-white font-semibold">{results.affectedAreas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Evacuation Time</span>
                  <span className="text-white font-semibold">{results.evacuationTime} min</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'red' | 'yellow' | 'green';
}) {
  const colorClasses = {
    red: 'from-red-600 to-red-700 border-red-500',
    yellow: 'from-yellow-600 to-yellow-700 border-yellow-500',
    green: 'from-green-600 to-green-700 border-green-500',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-4 border shadow-lg`}
    >
      <div className="text-white/80 text-xs font-medium mb-1">{label}</div>
      <div className="text-3xl font-bold text-white">{value.toFixed(0)}</div>
      <div className="text-white/70 text-xs mt-1">Risk Score</div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: AIRecommendation }) {
  const impactColors = {
    High: 'text-red-400 bg-red-950 border-red-800',
    Medium: 'text-yellow-400 bg-yellow-950 border-yellow-800',
    Low: 'text-green-400 bg-green-950 border-green-800',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-600 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-950 rounded-lg border border-blue-800">
          {iconMap[recommendation.icon] || <AlertTriangle className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-white font-semibold">{recommendation.title}</h4>
            <span
              className={`px-2 py-1 rounded text-xs font-medium border ${
                impactColors[recommendation.impact]
              }`}
            >
              {recommendation.impact}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">{recommendation.description}</p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-3 h-3" />
              <span>+{recommendation.improvement}% improvement</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{recommendation.timeEstimate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
