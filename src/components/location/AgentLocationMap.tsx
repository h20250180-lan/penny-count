import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, RefreshCw, Users } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';

export const AgentLocationMap: React.FC = () => {
  const { user } = useAuth();
  const { agentLocations, refreshAgentLocations } = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh && (user?.role === 'owner' || user?.role === 'co-owner')) {
      const interval = setInterval(() => {
        refreshAgentLocations();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, user?.role]);

  if (user?.role !== 'owner' && user?.role !== 'co-owner') {
    return null;
  }

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Agent Locations</h2>
              <p className="text-emerald-50 text-sm">Real-time tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => refreshAgentLocations()}
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="p-6">
        {agentLocations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Active Agents</h3>
            <p className="text-gray-600">No agents are currently sharing their location</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentLocations.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedAgent === agent.userId
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
                onClick={() => setSelectedAgent(agent.userId === selectedAgent ? null : agent.userId)}
              >
                {/* Agent Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {agent.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{agent.userName}</h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatLastUpdated(agent.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-600">Active</span>
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Latitude</span>
                    <span className="font-mono text-gray-900">{agent.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Longitude</span>
                    <span className="font-mono text-gray-900">{agent.longitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-medium text-emerald-600">±{agent.accuracy.toFixed(0)}m</span>
                  </div>
                </div>

                {/* View on Map Button */}
                <motion.a
                  href={getGoogleMapsUrl(agent.latitude, agent.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  <Navigation className="w-4 h-4" />
                  <span>View on Map</span>
                </motion.a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{agentLocations.length} active agent{agentLocations.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};
