import { useState, useEffect } from 'react';
import Map3D from './components/Map3D';
import ControlPanel from './components/ControlPanel';
import InsightsPanel from './components/InsightsPanel';
import { SimulationParameters, SimulationResults } from './types';
import { cities } from './data/cities';
import { runSimulation, generateAIInsights, generateRecommendations } from './utils/simulationEngine';
import { Layers, Layers3 } from 'lucide-react';

const defaultParameters: SimulationParameters = {
  city: 'Mumbai',
  rainfall: 0.3,
  riverLevel: 0.4,
  populationDensity: 0.7,
  trafficVolume: 0.6,
  evAdoption: 0.2,
  hasMetroLine: false,
  hasHighway: false,
  hasFlyover: false,
  hasChargingStations: false,
  hasFloodBarriers: false,
};

function App() {
  const [parameters, setParameters] = useState<SimulationParameters>(defaultParameters);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [mapStyle, setMapStyle] = useState<'2d' | '3d'>('3d');

  const selectedCity = cities.find((c) => c.name === parameters.city) || cities[0];

  const handleParameterChange = (updates: Partial<SimulationParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationActive(true);

    setTimeout(() => {
      const simulationResults = runSimulation(parameters);
      const aiInsights = generateAIInsights(parameters, simulationResults);
      const aiRecommendations = generateRecommendations(parameters, simulationResults);

      setResults(simulationResults);
      setInsights(aiInsights);
      setRecommendations(aiRecommendations);
      setIsSimulating(false);
    }, 1500);
  };

  const handleReset = () => {
    setParameters(defaultParameters);
    setResults(null);
    setInsights('');
    setRecommendations([]);
    setSimulationActive(false);
  };

  useEffect(() => {
    document.title = 'AI Digital Twin: Smart City Simulator';
  }, []);

  return (
    <div className="h-screen flex flex-col bg-black">
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Layers3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Digital Twin</h1>
              <p className="text-sm text-gray-400">Disaster & Smart City Simulator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMapStyle(mapStyle === '3d' ? '2d' : '3d')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 border border-gray-600"
            >
              {mapStyle === '3d' ? (
                <>
                  <Layers className="w-4 h-4" />
                  Switch to 2D
                </>
              ) : (
                <>
                  <Layers3 className="w-4 h-4" />
                  Switch to 3D
                </>
              )}
            </button>
            <div className="px-4 py-2 bg-green-950 border border-green-800 rounded-lg">
              <span className="text-green-400 text-sm font-medium">System Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-gray-800">
          <ControlPanel
            cities={cities}
            parameters={parameters}
            onParameterChange={handleParameterChange}
            onRunSimulation={handleRunSimulation}
            onReset={handleReset}
            isRunning={isSimulating}
          />
        </div>

        <div className="flex-1 relative">
          <Map3D
            city={selectedCity}
            simulationActive={simulationActive}
            results={results}
            mapStyle={mapStyle}
          />
          {simulationActive && results && (
            <div className="absolute bottom-6 left-6 right-6 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-400 text-xs mb-1">Flood Risk</div>
                  <div className="text-2xl font-bold text-white">{results.floodRisk.toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Traffic</div>
                  <div className="text-2xl font-bold text-white">{results.trafficCongestion.toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Evacuation</div>
                  <div className="text-2xl font-bold text-white">{results.evacuationDifficulty.toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Pollution</div>
                  <div className="text-2xl font-bold text-white">{results.pollutionIndex.toFixed(0)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-96 flex-shrink-0 border-l border-gray-800">
          <InsightsPanel
            results={results}
            insights={insights}
            recommendations={recommendations}
            isSimulating={isSimulating}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
