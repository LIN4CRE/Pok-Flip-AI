import React, { useState } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { LiveDealScanner } from './components/LiveDealScanner';
import { AiValuationScanner } from './components/AiValuationScanner';
import { MarketAnalytics } from './components/MarketAnalytics';
import { PortfolioManager } from './components/PortfolioManager';
import { ShippingFulfillment } from './components/ShippingFulfillment';
import { SmartAlertsView } from './components/SmartAlertsView';
import { TeamWorkspaceView } from './components/TeamWorkspaceView';
import { PokeBotAssistant } from './components/PokeBotAssistant';
import { MarketplaceConnectionsModal } from './components/MarketplaceConnectionsModal';
import { OnboardingModal } from './components/OnboardingModal';

import { 
  ListingDeal, 
  PortfolioItem, 
  SmartAlert, 
  OrderFulfillment, 
  TeamMember 
} from './types';
import { 
  INITIAL_DEALS, 
  INITIAL_PORTFOLIO, 
  INITIAL_SMART_ALERTS, 
  INITIAL_ORDERS, 
  INITIAL_TEAM_MEMBERS 
} from './data/mockPokemonData';
import { Zap, CheckCircle2, Bell } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('deals');
  const [deals, setDeals] = useState<ListingDeal[]>(INITIAL_DEALS);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO);
  const [alerts, setAlerts] = useState<SmartAlert[]>(INITIAL_SMART_ALERTS);
  const [orders, setOrders] = useState<OrderFulfillment[]>(INITIAL_ORDERS);
  const [teamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [activeMember, setActiveMember] = useState<TeamMember>(INITIAL_TEAM_MEMBERS[0]);

  // Modal controls
  const [isPokeBotOpen, setIsPokeBotOpen] = useState<boolean>(false);
  const [isMarketplacesOpen, setIsMarketplacesOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Active Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string } | null>(null);

  const showToast = (title: string, body: string) => {
    setToastMessage({ title, body });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handler: Purchase Deal & add to stock
  const handlePurchaseDeal = (deal: ListingDeal) => {
    const newStock: PortfolioItem = {
      id: `port-${Date.now()}`,
      card: deal.card,
      purchasePrice: deal.askingPrice,
      purchaseDate: new Date().toISOString().split('T')[0],
      sourceMarketplace: deal.marketplace,
      condition: (deal.card.grade as any) || 'Raw NM',
      currentMarketValue: deal.fairMarketValue,
      targetResalePrice: deal.fairMarketValue * 1.1,
      status: 'In Stock',
      folder: 'Quick Flips',
      tags: ['Assisted Buy', deal.marketplace],
      barcodeSerial: `PSA-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: `Purchased via Assisted Buy from ${deal.marketplace}. Expected profit: +$${deal.netProfitAfterFees.toFixed(2)}`,
    };

    setPortfolioItems((prev) => [newStock, ...prev]);
    setDeals((prev) => prev.filter((d) => d.id !== deal.id));
    showToast('Stock Purchased Successfully!', `Added ${deal.card.name} to inventory stock.`);
  };

  // Handler: Simulate New Deal Drop
  const handleSimulateNewDeal = () => {
    const sampleDealNames = [
      { name: 'Special Illustration Rare Charizard #228', set: 'Scarlet & Violet: 151', price: 140, fair: 210, mkt: 'eBay' as const },
      { name: 'Rayquaza VMAX Alt Art #218', set: 'Evolving Skies', price: 310, fair: 460, mkt: 'TCGplayer' as const },
      { name: 'Mario Pikachu Full Art #294/XY-P', set: 'XY Japanese Promos', price: 2100, fair: 2900, mkt: 'Whatnot' as const },
    ];

    const pick = sampleDealNames[Math.floor(Math.random() * sampleDealNames.length)];
    const newDeal: ListingDeal = {
      id: `deal-${Date.now()}`,
      card: {
        id: `card-${Date.now()}`,
        name: pick.name,
        setName: pick.set,
        setNumber: '101/200',
        rarity: 'Secret Rare',
        imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80',
        language: 'English',
        releaseYear: 2023,
        isGraded: true,
        grade: 'PSA 10',
      },
      marketplace: pick.mkt,
      listingTitle: `${pick.name} PSA 10 Instant Buy Listing`,
      listingUrl: 'https://ebay.com',
      askingPrice: pick.price,
      shippingCost: 0,
      estimatedTax: pick.price * 0.07,
      sellerRatingPercentage: 99.8,
      sellerSalesCount: 1420,
      fairMarketValue: pick.fair,
      expectedGrossProfit: pick.fair - pick.price,
      netProfitAfterFees: (pick.fair * 0.88) - pick.price,
      roiPercentage: Math.round(((pick.fair - pick.price) / pick.price) * 100),
      discountPercentage: 28.5,
      confidenceScore: 95,
      riskScore: 2,
      estimatedResaleDays: 3,
      listedTimeAgo: 'Just now',
      status: 'active',
      aiRecommendationNote: 'Sub-second real-time listing detected 28% under market benchmarks. High velocity flip opportunity.',
      buyStrategy: 'Instant Flip',
    };

    setDeals((prev) => [newDeal, ...prev]);
    showToast('🔥 Fresh Deal Detected!', `${newDeal.card.name} listed on ${newDeal.marketplace} for $${newDeal.askingPrice} (+${newDeal.roiPercentage}% ROI)`);
  };

  // Handler: Add to Watchlist
  const handleAddToWatchlist = (deal: ListingDeal) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === deal.id ? { ...d, status: 'watched' as const } : d))
    );
    showToast('Saved to Watchlist', `Added ${deal.card.name} to watch rules.`);
  };

  // Handler: Inspect Valuation
  const handleInspectValuation = (deal: ListingDeal) => {
    setActiveTab('valuation');
  };

  // Handler: Add Portfolio Item
  const handleAddPortfolioItem = (newItem: PortfolioItem) => {
    setPortfolioItems((prev) => [newItem, ...prev]);
    showToast('Stock Added', `Added ${newItem.card.name} to portfolio vault.`);
  };

  // Handler: Update Item Status
  const handleUpdateItemStatus = (id: string, updated: Partial<PortfolioItem>) => {
    setPortfolioItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Stock Status Updated', 'Recorded inventory change.');
  };

  // Handler: Delete Item
  const handleDeletePortfolioItem = (id: string) => {
    setPortfolioItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Handler: Add Smart Alert
  const handleAddAlert = (newAlert: SmartAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
    showToast('Alert Rule Created', `Monitoring ${newAlert.targetCardName || 'listings'} threshold.`);
  };

  // Handler: Delete Smart Alert
  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Handler: Simulate Alert Trigger
  const handleSimulateAlertTrigger = (alert: SmartAlert) => {
    showToast('🚨 Alert Triggered!', `Price drop detected for ${alert.targetCardName || 'Target Card'} on ${alert.marketplaceFilter}. Threshold: $${alert.thresholdValue}`);
  };

  // Handler: Update Order Status
  const handleUpdateOrderStatus = (id: string, status: OrderFulfillment['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    showToast('Shipment Updated', `Order status changed to ${status}.`);
  };

  const ordersToShipCount = orders.filter((o) => o.status === 'To Ship').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 pb-20 md:pb-8">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900 border-2 border-emerald-500 text-slate-100 p-4 rounded-2xl shadow-2xl flex items-start space-x-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-white">{toastMessage.title}</div>
            <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toastMessage.body}</div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <HeaderNavbar
        activeTeam={activeMember}
        onOpenPokeBot={() => setIsPokeBotOpen(true)}
        onOpenMarketplaces={() => setIsMarketplacesOpen(true)}
        onOpenAlerts={() => setActiveTab('alerts')}
        unhandledAlertsCount={alerts.length}
        liveDealsCount={deals.length}
      />

      {/* Main Tab Strip */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        dealsBadgeCount={deals.length}
        alertsBadgeCount={alerts.length}
        ordersToShipCount={ordersToShipCount}
      />

      {/* Primary Workspace Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'deals' && (
          <LiveDealScanner
            deals={deals}
            onPurchaseDeal={handlePurchaseDeal}
            onAddToWatchlist={handleAddToWatchlist}
            onSimulateNewDeal={handleSimulateNewDeal}
            onInspectValuation={handleInspectValuation}
          />
        )}

        {activeTab === 'valuation' && (
          <AiValuationScanner
            onAddToPortfolio={handleAddPortfolioItem}
            onOpenPokeBot={() => setIsPokeBotOpen(true)}
          />
        )}

        {activeTab === 'analytics' && <MarketAnalytics />}

        {activeTab === 'portfolio' && (
          <PortfolioManager
            portfolioItems={portfolioItems}
            onAddItem={handleAddPortfolioItem}
            onUpdateItemStatus={handleUpdateItemStatus}
            onDeleteItem={handleDeletePortfolioItem}
          />
        )}

        {activeTab === 'shipping' && (
          <ShippingFulfillment
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'alerts' && (
          <SmartAlertsView
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onDeleteAlert={handleDeleteAlert}
            onSimulateTrigger={handleSimulateAlertTrigger}
          />
        )}

        {activeTab === 'team' && (
          <TeamWorkspaceView
            teamMembers={teamMembers}
            activeMember={activeMember}
            onSwitchMember={setActiveMember}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <PokeBotAssistant
        isOpen={isPokeBotOpen}
        onClose={() => setIsPokeBotOpen(false)}
      />

      <MarketplaceConnectionsModal
        isOpen={isMarketplacesOpen}
        onClose={() => setIsMarketplacesOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
