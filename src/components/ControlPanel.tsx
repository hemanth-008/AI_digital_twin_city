import { SimulationParameters } from '../types';
import { CityData } from '../types';
import { Cloud, Droplets, Users, Car, Zap, Brain as Train, SignalHigh as Highway, Badge as Bridge, BatteryCharging, Shield, Play, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  cities: CityData[];
  parameters: SimulationParameters;
  onParameterChange: (params: Partial<SimulationParameters>) => void;
  onRunSimulation: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export default function ControlPanel({
  cities,
  parameters,
  onParameterChange,
  onRunSimulation,
  onReset,
  isRunning,
}: ControlPanelProps) {
  return (
    <div className="bg-gray-900 h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Control Center</h2>
          <p className="text-gray-400 text-sm">Configure simulation parameters</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City Selection
            </label>
            <select
              value={parameters.city}
              onChange={(e) => onParameterChange({ city: e.target.value })}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" />
              Environmental Conditions
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    Rainfall Intensity
                  </label>
                  <span className="text-sm font-semibold text-white">
                    {(parameters.rainfall * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={parameters.rainfall}
                  onChange={(e) => onParameterChange({ rainfall: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    River Water Level
                  </label>
                  <span className="text-sm font-semibold text-white">
                    {(parameters.riverLevel * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={parameters.riverLevel}
                  onChange={(e) => onParameterChange({ riverLevel: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Urban Parameters
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    Population Density
                  </label>
                  <span className="text-sm font-semibold text-white">
                    {(parameters.populationDensity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={parameters.populationDensity}
                  onChange={(e) =>
                    onParameterChange({ populationDensity: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <Car className="w-4 h-4 text-red-400" />
                    Traffic Volume
                  </label>
                  <span className="text-sm font-semibold text-white">
                    {(parameters.trafficVolume * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={parameters.trafficVolume}
                  onChange={(e) =>
                    onParameterChange({ trafficVolume: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    EV Adoption Rate
                  </label>
                  <span className="text-sm font-semibold text-white">
                    {(parameters.evAdoption * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={parameters.evAdoption}
                  onChange={(e) => onParameterChange({ evAdoption: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4">Infrastructure Upgrades</h3>

            <div className="space-y-3">
              <ToggleItem
                icon={<Train className="w-4 h-4" />}
                label="Metro Rail Network"
                checked={parameters.hasMetroLine}
                onChange={(checked) => onParameterChange({ hasMetroLine: checked })}
              />
              <ToggleItem
                icon={<Highway className="w-4 h-4" />}
                label="Ring Road Highway"
                checked={parameters.hasHighway}
                onChange={(checked) => onParameterChange({ hasHighway: checked })}
              />
              <ToggleItem
                icon={<Bridge className="w-4 h-4" />}
                label="Elevated Flyovers"
                checked={parameters.hasFlyover}
                onChange={(checked) => onParameterChange({ hasFlyover: checked })}
              />
              <ToggleItem
                icon={<BatteryCharging className="w-4 h-4" />}
                label="EV Charging Stations"
                checked={parameters.hasChargingStations}
                onChange={(checked) => onParameterChange({ hasChargingStations: checked })}
              />
              <ToggleItem
                icon={<Shield className="w-4 h-4" />}
                label="Flood Barriers"
                checked={parameters.hasFloodBarriers}
                onChange={(checked) => onParameterChange({ hasFloodBarriers: checked })}
              />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <button
              onClick={onRunSimulation}
              disabled={isRunning}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              {isRunning ? 'Running Simulation...' : 'Run Simulation'}
            </button>

            <button
              onClick={onReset}
              className="w-full bg-gray-800 text-gray-300 font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 border border-gray-700"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3 text-gray-300">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
