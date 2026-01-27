import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { useToast } from '../../contexts/ToastContext';

export const PendingTeamRequestBanner: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.approvalStatus !== 'pending' || dismissed) {
    return null;
  }

  const handleResponse = async (response: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await dataService.respondToTeamRequest(response);

      if (response === 'approved') {
        showToast('You have successfully joined the team!', 'success');
      } else {
        showToast('You have declined the team invitation', 'info');
      }

      await refreshUser();
      setDismissed(true);
    } catch (error: any) {
      showToast(error.message || 'Error responding to request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-[100] p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold text-base sm:text-lg">Team Invitation Pending</p>
              <p className="text-xs sm:text-sm text-white/90">
                You've been invited to join a team. Please review and respond to this request.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResponse('approved')}
              disabled={loading}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 bg-white text-green-600 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResponse('rejected')}
              disabled={loading}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <X className="w-4 h-4" />
              Decline
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};