import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Upload, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { offlineQueueService } from '../../services/offlineQueueService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const OfflineQueueStatus: React.FC = () => {
  const { user } = useAuth();
  const { push: pushToast } = useToast();
  const [queueStats, setQueueStats] = useState({ total: 0, pending: 0, synced: 0, failed: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    const stats = offlineQueueService.getQueueStats();
    setQueueStats(stats);
  };

  const handleSync = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await offlineQueueService.syncQueue(user.id);
      pushToast({
        type: 'success',
        message: `Synced ${result.success} items successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`
      });
      updateStats();
    } catch (error) {
      pushToast({
        type: 'error',
        message: 'Failed to sync offline data'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (queueStats.total === 0) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-md ${
          queueStats.pending > 0
            ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white'
            : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
        }`}
      >
        {queueStats.pending > 0 ? (
          <CloudOff className="w-4 h-4" />
        ) : (
          <Cloud className="w-4 h-4" />
        )}
        <span>{queueStats.pending} pending</span>
        {queueStats.pending > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
            {queueStats.pending}
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
              <h3 className="font-bold text-lg">Offline Queue</h3>
              <p className="text-xs text-emerald-50">Transactions waiting to sync</p>
            </div>

            {/* Stats */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Pending</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{queueStats.pending}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Synced</span>
                </div>
                <span className="text-lg font-bold text-green-600">{queueStats.synced}</span>
              </div>

              {queueStats.failed > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Failed</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{queueStats.failed}</span>
                </div>
              )}
            </div>

            {/* Sync Button */}
            {queueStats.pending > 0 && navigator.onLine && (
              <div className="p-4 border-t border-gray-200">
                <motion.button
                  onClick={handleSync}
                  disabled={isSyncing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all ${
                    isSyncing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </motion.button>
              </div>
            )}

            {/* Offline Warning */}
            {!navigator.onLine && queueStats.pending > 0 && (
              <div className="p-4 bg-amber-50 border-t border-amber-200">
                <div className="flex items-start space-x-2">
                  <CloudOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">You're offline</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Your data is safe. It will sync automatically when you're back online.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
