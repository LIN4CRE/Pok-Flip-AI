import React from 'react';
import { 
  Zap, 
  Scan, 
  LineChart, 
  Briefcase, 
  Truck, 
  Bell, 
  Users 
} from 'lucide-react';

export type TabType = 'deals' | 'valuation' | 'analytics' | 'portfolio' | 'shipping' | 'alerts' | 'team';

interface NavigationTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  dealsBadgeCount?: number;
  alertsBadgeCount?: number;
  ordersToShipCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  dealsBadgeCount = 0,
  alertsBadgeCount = 0,
  ordersToShipCount = 0,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'deals', label: 'Live Deals', icon: <Zap className="w-4 h-4" />, badge: dealsBadgeCount },
    { id: 'valuation', label: 'AI Valuer & OCR', icon: <Scan className="w-4 h-4" /> },
    { id: 'analytics', label: 'Market Analytics', icon: <LineChart className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio & Stock', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'shipping', label: 'Fulfillment', icon: <Truck className="w-4 h-4" />, badge: ordersToShipCount },
    { id: 'alerts', label: 'Smart Alerts', icon: <Bell className="w-4 h-4" />, badge: alertsBadgeCount },
    { id: 'team', label: 'Team Vault', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Desktop / Tablet Navigation Bar */}
      <nav id="desktop-tab-nav" className="hidden md:block bg-slate-900 border-b border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex space-x-1 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-amber-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sticky Bottom Bar */}
      <nav id="mobile-tab-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 border-t border-slate-800 backdrop-blur-md px-2 py-1.5">
        <div className="grid grid-cols-5 gap-1 items-center text-center">
          {navItems.slice(0, 5).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-tab-btn-${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors relative ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
