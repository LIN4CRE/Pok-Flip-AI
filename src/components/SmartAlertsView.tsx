import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Zap, 
  Trash2, 
  Check, 
  Smartphone, 
  Mail, 
  MessageSquare,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { SmartAlert, Marketplace } from '../types';

interface SmartAlertsViewProps {
  alerts: SmartAlert[];
  onAddAlert: (newAlert: SmartAlert) => void;
  onDeleteAlert: (id: string) => void;
  onSimulateTrigger: (alert: SmartAlert) => void;
}

export const SmartAlertsView: React.FC<SmartAlertsViewProps> = ({
  alerts,
  onAddAlert,
  onDeleteAlert,
  onSimulateTrigger,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [targetCard, setTargetCard] = useState<string>('Umbreon VMAX Alt Art');
  const [threshold, setThreshold] = useState<string>('950.00');
  const [conditionType, setConditionType] = useState<SmartAlert['conditionType']>('price_drop');
  const [marketplace, setMarketplace] = useState<Marketplace | 'All'>('All');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAlert: SmartAlert = {
      id: `alert-${Date.now()}`,
      title,
      conditionType,
      targetCardName: targetCard,
      thresholdValue: parseFloat(threshold) || 100,
      marketplaceFilter: marketplace,
      isActive: true,
      notifyPush: true,
      notifySMS: false,
      notifyEmail: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddAlert(newAlert);
    setIsAdding(false);
    setTitle('');
  };

  return (
    <div id="smart-alerts-container" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>Real-Time Push Notification Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Smart Price Drop & Arbitrage Alert Rules
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Get notified immediately via Push, SMS, or Email when a targeted card drops below fair market value or when ROI thresholds exceed 25%.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Alert Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-amber-400">
                  {alert.conditionType.toUpperCase().replace('_', ' ')}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>

              <h3 className="font-bold text-white text-sm">{alert.title}</h3>
              <p className="text-xs text-slate-400 mt-1">Target: <strong className="text-slate-200">{alert.targetCardName || 'All Cards'}</strong></p>

              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-400 text-[10px]">Trigger Condition:</div>
                <div className="font-bold text-emerald-400">Threshold: ${alert.thresholdValue}</div>
                <div className="text-slate-500 text-[10px]">Marketplace: {alert.marketplaceFilter}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onSimulateTrigger(alert)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center space-x-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Trigger</span>
              </button>

              <button
                onClick={() => onDeleteAlert(alert.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Alert Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Create Smart Alert Rule</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Umbreon VMAX Under $900"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Target Card Name</label>
                <input
                  type="text"
                  value={targetCard}
                  onChange={(e) => setTargetCard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Trigger Price ($)</label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Marketplace</label>
                  <select
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="All">All Marketplaces</option>
                    <option value="eBay">eBay</option>
                    <option value="TCGplayer">TCGplayer</option>
                    <option value="Cardmarket">Cardmarket</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Activate Smart Alert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
