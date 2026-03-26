import { useState, useRef, useEffect } from 'react';
import { SimulationResults, SimulationParameters } from '../types';
import { CityProfile } from '../data/globalCities';
import { Send, MessageCircle, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AICopilotProps {
  city: CityProfile;
  results: SimulationResults | null;
  parameters: SimulationParameters;
  isOpen: boolean;
  onClose: () => void;
}

const generateResponse = (
  question: string,
  city: CityProfile,
  results: SimulationResults | null,
  parameters: SimulationParameters
): string => {
  const q = question.toLowerCase();

  if (!results) {
    return "I need simulation results to provide detailed analysis. Please run a simulation first to get insights tailored to your scenario.";
  }

  if (q.includes('biggest threat') || q.includes('main risk') || q.includes('most dangerous')) {
    const threats = Object.entries(city.disasterProfile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    return `Based on ${city.name}'s geographic profile, the biggest threats are ${threats.map(([d, s]) => `${d} (${Math.round(s)}/100)`).join(' and ')}. Currently, your simulation shows flood risk at ${results.floodRisk.toFixed(0)}% and traffic congestion at ${results.trafficCongestion.toFixed(0)}%. I recommend prioritizing flood infrastructure first given the city's vulnerability.`;
  }

  if (q.includes('flood') || q.includes('reduce flood') || q.includes('prevent flooding')) {
    const suggestions = [];
    if (!parameters.hasFloodBarriers) suggestions.push('install flood barriers');
    if (!parameters.hasMetroLine) suggestions.push('build metro lines to improve evacuation');
    if (parameters.rainfall > 0.6) suggestions.push('increase drainage capacity significantly');

    return `To reduce flood risk from ${results.floodRisk.toFixed(0)}%, I recommend: ${suggestions.length > 0 ? suggestions.join(', ') : 'your current infrastructure is optimized'}. Your current rainfall parameter is at ${(parameters.rainfall * 100).toFixed(0)}%. Consider elevating critical infrastructure and implementing nature-based solutions like wetland restoration for long-term resilience.`;
  }

  if (q.includes('invest') || q.includes('priority') || q.includes('first')) {
    const topDisaster = Object.entries(city.disasterProfile)
      .sort(([, a], [, b]) => b - a)[0];

    return `For maximum impact, prioritize ${topDisaster[0]} mitigation. With your current parameters, I recommend: 1) Build infrastructure for ${topDisaster[0]} (highest vulnerability at ${topDisaster[1]}/100), 2) Implement traffic management (congestion at ${results.trafficCongestion.toFixed(0)}%), 3) Expand green spaces. This sequencing ensures you tackle the most critical risks first while building sustainable infrastructure.`;
  }

  if (q.includes('traffic') || q.includes('congestion')) {
    const suggestions = [];
    if (!parameters.hasMetroLine) suggestions.push('metro rail system');
    if (!parameters.hasHighway) suggestions.push('ring road highway');
    if (!parameters.hasFlyover) suggestions.push('elevated flyovers');

    return `Traffic congestion is at ${results.trafficCongestion.toFixed(0)}%. To reduce it, consider building: ${suggestions.length > 0 ? suggestions.join(', ') : 'multiple transportation solutions'}. With population density at ${(parameters.populationDensity * 100).toFixed(0)}%, mass transit is critical. Each infrastructure addition should reduce congestion by 10-20%.`;
  }

  if (q.includes('evacuation') || q.includes('emergency') || q.includes('disaster response')) {
    return `Evacuation difficulty is at ${results.evacuationDifficulty.toFixed(0)}%. With ${results.affectedAreas} areas at risk, estimated evacuation time is ${results.evacuationTime} minutes. To improve response: 1) Establish dedicated evacuation corridors, 2) Enhance road infrastructure, 3) Deploy real-time traffic management. Your current metro network ${parameters.hasMetroLine ? 'can significantly assist evacuation' : 'would be crucial for mass evacuation'}.`;
  }

  if (q.includes('pollution') || q.includes('air quality')) {
    return `Pollution index is at ${results.pollutionIndex.toFixed(0)}/100. With current EV adoption at ${(parameters.evAdoption * 100).toFixed(0)}%, you can improve air quality by: 1) Accelerating EV adoption (each 10% increase reduces pollution by ~5%), 2) Expanding green spaces (currently ${(city.greenCover * 100).toFixed(0)}%), 3) Deploying smart traffic signals to reduce congestion. Green infrastructure is your most cost-effective solution.`;
  }

  if (q.includes('climate') || q.includes('heatwave') || q.includes('extreme heat')) {
    return `Heatwave risk in ${city.name} is ${city.disasterProfile.heatwave}/100. With population density at ${(parameters.populationDensity * 100).toFixed(0)}%, the urban heat island effect is severe. Mitigate by: 1) Increasing green cover (currently ${(city.greenCover * 100).toFixed(0)}%), 2) Cool roofing programs, 3) Urban parks and water bodies. Each 10% green space increase can reduce peak temperatures by 1-2°C.`;
  }

  if (q.includes('cost') || q.includes('budget') || q.includes('expensive')) {
    return `Infrastructure costs vary widely. Flood barriers ($5M-8M), Metro systems ($15M-25M), Smart traffic ($1-2M), Green restoration ($2-5M). Given ${city.name}'s profile, I recommend starting with lower-cost, high-impact solutions like smart signals and tree planting before major infrastructure projects.`;
  }

  if (q.includes('time') || q.includes('timeline') || q.includes('how long')) {
    return `Implementation timelines vary: Quick wins (green infrastructure, smart signals) = 6-12 months. Medium-term (metro rail, flood barriers) = 2-5 years. Long-term (complete urban transformation) = 10+ years. Start with quick wins to show immediate impact while planning major projects.`;
  }

  return `I can help analyze ${city.name}'s disaster risks and recommend mitigation strategies. Try asking about: flood risk reduction, traffic congestion, evacuation planning, air quality improvement, heatwave mitigation, or investment priorities. Current critical metrics: Flood ${results.floodRisk.toFixed(0)}%, Traffic ${results.trafficCongestion.toFixed(0)}%, Pollution ${results.pollutionIndex.toFixed(0)}%.`;
};

export default function AICopilot({
  city,
  results,
  parameters,
  isOpen,
  onClose,
}: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI Copilot for ${city.name}. I can analyze this city's disaster risks and recommend strategies. Ask me anything about flood risks, traffic solutions, evacuation planning, or infrastructure priorities.`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const response = generateResponse(input, city, results, parameters);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-2xl flex flex-col z-40">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/40 to-cyan-900/40">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-semibold text-white">AI Copilot</h3>
            <p className="text-xs text-gray-400">{city.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-100 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg rounded-bl-none text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-700 p-3 bg-gray-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about risks, priorities..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
