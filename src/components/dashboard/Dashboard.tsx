import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCards } from './DashboardCards';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { DashboardMetrics } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';

export const Dashboard: React.FC<{ onViewAll?: (section: string) => void }> = ({ onViewAll }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const handleQuickAction = (action: string) => {
    console.log('Quick action triggered:', action);
    // Map quick actions to navigation or modal triggers
    if (action === 'create-line') {
      onViewAll?.('lines');
    } else if (action === 'add-agent') {
      onViewAll?.('users');
    } else if (action === 'view-reports') {
      onViewAll?.('analytics');
    } else if (action === 'export-data') {
      openExportModal();
    }
  };

  // Export modal state
  const [exportOpen, setExportOpen] = React.useState(false);
  const [exportLines, setExportLines] = React.useState<any[]>([]);
  const [exportAgents, setExportAgents] = React.useState<any[]>([]);
  const [selectedLineIds, setSelectedLineIds] = React.useState<string[]>([]);
  const [selectedAgentIds, setSelectedAgentIds] = React.useState<string[]>([]);
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [exportFormat, setExportFormat] = React.useState<'csv' | 'pdf'>('csv');

  const openExportModal = async () => {
    try {
      const lines = await dataService.getLines();
      const users = await dataService.getUsers();
      setExportLines(lines);
      setExportAgents(users.filter(u => u.role === 'agent'));
      setSelectedLineIds(lines.map(l => l.id));
      setSelectedAgentIds([]);
      setExportOpen(true);
    } catch (e) {
      console.error('Failed to load lines/agents for export', e);
    }
  };

  const toggleSelectLine = (id: string) => {
    setSelectedLineIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAgent = (id: string) => {
    setSelectedAgentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const performExport = async () => {
    try {
      const payload = {
        lineIds: selectedLineIds,
        agentIds: selectedAgentIds,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        format: exportFormat
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/exports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...( (localStorage.getItem('penny-count-token') ? { Authorization: `Bearer ${localStorage.getItem('penny-count-token')}` } : {}) ) },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Export failed: ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disp = res.headers.get('content-disposition') || '';
      let fname = 'export.csv';
      const m = /filename="?([^";]+)"?/.exec(disp);
      if (m) fname = m[1];
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  useEffect(() => {
    const loadMetrics = async () => {
      if (user) {
        try {
          const dashboardMetrics = await dataService.getDashboardMetrics(user.id, user.role);
          setMetrics(dashboardMetrics);
        } catch (error) {
          console.error('Error loading dashboard metrics:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMetrics();
  }, [user]);

  // If agent, ensure cashOnHand and collection metrics are accurate by computing from lines
  React.useEffect(() => {
    const computeAgentMetrics = async () => {
      if (!user || user.role !== 'agent') return;
      try {
        const lines = await dataService.getLines();
        // filter lines assigned to this agent
        const myLines = lines.filter(l => l.agentId === user.id);
        const totalInitial = myLines.reduce((s, l) => s + (Number(l.initialCapital) || 0), 0);
        const totalDisbursed = myLines.reduce((s, l) => s + (Number(l.totalDisbursed) || 0), 0);
        const totalCollected = myLines.reduce((s, l) => s + (Number(l.totalCollected) || 0), 0);
        const cashOnHand = totalInitial - totalDisbursed + totalCollected;
        const collectionRate = totalDisbursed > 0 ? Math.round((totalCollected / totalDisbursed) * 100) : 0;
        setMetrics(prev => prev ? ({ ...prev, cashOnHand, collectionEfficiency: collectionRate }) : prev);
      } catch (e) {
        console.warn('Failed to compute agent metrics', e);
      }
    };
    computeAgentMetrics();
  }, [user]);

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'owner':
        return 'Business Overview';
      case 'co-owner':
        return 'Line Management Dashboard';
      case 'agent':
        return 'Collection Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardSubtitle = () => {
    switch (user?.role) {
      case 'owner':
        return 'Monitor your entire lending operation';
      case 'co-owner':
        return 'Manage your lines and track performance';
      case 'agent':
        return 'Track your collections and borrowers';
      default:
        return 'Welcome back';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{getDashboardTitle()}</h1>
        <p className="text-gray-600">{getDashboardSubtitle()}</p>
      </motion.div>

      {/* Metrics Cards */}
      {metrics && <DashboardCards metrics={metrics} />}

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity onViewAll={onViewAll} />
        <QuickActions onAction={handleQuickAction} />
      </div>

      {/* Export Modal (simple) */}
      {exportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Export Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium mb-2">Select Lines</div>
                <div className="max-h-40 overflow-auto border p-2 rounded">
                  {exportLines.map(l => (
                    <label key={l.id} className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" checked={selectedLineIds.includes(l.id)} onChange={() => toggleSelectLine(l.id)} />
                      <span>{l.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Select Agents</div>
                <div className="max-h-40 overflow-auto border p-2 rounded">
                  {exportAgents.map(a => (
                    <label key={a.id} className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" checked={selectedAgentIds.includes(a.id)} onChange={() => toggleSelectAgent(a.id)} />
                      <span>{a.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 items-end">
              <div>
                <div className="text-sm font-medium">Start Date</div>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded p-2 w-full" />
              </div>
              <div>
                <div className="text-sm font-medium">End Date</div>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded p-2 w-full" />
              </div>
              <div>
                <div className="text-sm font-medium">Format</div>
                <select value={exportFormat} onChange={e => setExportFormat(e.target.value as any)} className="border rounded p-2 w-full">
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF (not supported server-side yet)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 rounded border" onClick={() => setExportOpen(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-emerald-500 text-white" onClick={performExport}>Export</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};