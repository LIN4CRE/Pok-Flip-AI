import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Filter, 
  Search, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  Bookmark, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Store,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { ListingDeal, Marketplace, CardCondition } from '../types';
import { MARKETPLACE_FEES } from '../data/mockPokemonData';

interface LiveDealScannerProps {
  deals: ListingDeal[];
  onPurchaseDeal: (deal: ListingDeal) => void;
  onAddToWatchlist: (deal: ListingDeal) => void;
  onSimulateNewDeal: () => void;
  onInspectValuation: (deal: ListingDeal) => void;
}

export const LiveDealScanner: React.FC<LiveDealScannerProps> = ({
  deals,
  onPurchaseDeal,
  onAddToWatchlist,
  onSimulateNewDeal,
  onInspectValuation,
}) => {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('All');
  const [minRoi, setMinRoi] = useState<number>(10);
  const [maxRisk, setMaxRisk] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [isLiveScanning, setIsLiveScanning] = useState<boolean>(true);
  const [selectedDealForCheckout, setSelectedDealForCheckout] = useState<ListingDeal | null>(null);

  // Live interval simulator
  useEffect(() => {
    if (!isLiveScanning) return;
    const interval = setInterval(() => {
      // Periodic pulse effect
    }, 8000);
    return () => clearInterval(interval);
  }, [isLiveScanning]);

  // Filtered deals
  const filteredDeals = deals.filter((deal) => {
    if (selectedMarketplace !== 'All' && deal.marketplace !== selectedMarketplace) return false;
    if (deal.roiPercentage < minRoi) return false;
    if (deal.riskScore > maxRisk) return false;
    if (gradeFilter === 'Graded' && !deal.card.isGraded) return false;
    if (gradeFilter === 'Raw' && deal.card.isGraded) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = deal.card.name.toLowerCase().includes(q);
      const matchSet = deal.card.setName.toLowerCase().includes(q);
      const matchTitle = deal.listingTitle.toLowerCase().includes(q);
      if (!matchName && !matchSet && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div id="live-deal-scanner-container" className="space-y-6">
      {/* Top Banner & Live Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Sub-Second Feed Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Real-Time Opportunity Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Continuously scanning 7 marketplaces for undervalued Pokémon card listings. AI calculates fees, net margins, liquidity, and risk scores instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              id="btn-toggle-live-scan"
              onClick={() => setIsLiveScanning(!isLiveScanning)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isLiveScanning
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveScanning ? 'animate-spin' : ''}`} />
              <span>{isLiveScanning ? 'Live Feed On' : 'Feed Paused'}</span>
            </button>

            <button
              id="btn-simulate-deal-drop"
              onClick={onSimulateNewDeal}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/30 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950/20" />
              <span>Trigger Deal Drop</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="input-search-deals"
              type="text"
              placeholder="Search card, set, grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Marketplace Select */}
          <div>
            <select
              id="select-marketplace-filter"
              value={selectedMarketplace}
              onChange={(e) => setSelectedMarketplace(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="All">All Marketplaces (7)</option>
              <option value="eBay">eBay</option>
              <option value="TCGplayer">TCGplayer</option>
              <option value="Cardmarket">Cardmarket</option>
              <option value="Whatnot">Whatnot</option>
              <option value="Mercari">Mercari</option>
              <option value="Facebook Marketplace">Facebook Marketplace</option>
              <option value="Local Show">Local Show</option>
            </select>
          </div>

          {/* Min ROI Slider */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex flex-col justify-center">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Min ROI %</span>
              <span className="font-bold text-amber-400">{minRoi}%</span>
            </div>
            <input
              id="range-min-roi"
              type="range"
              min="5"
              max="50"
              step="5"
              value={minRoi}
              onChange={(e) => setMinRoi(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded"
            />
          </div>

          {/* Max Risk Score */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex flex-col justify-center">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Max Risk Score</span>
              <span className="font-bold text-emerald-400">{maxRisk} / 10</span>
            </div>
            <input
              id="range-max-risk"
              type="range"
              min="1"
              max="10"
              step="1"
              value={maxRisk}
              onChange={(e) => setMaxRisk(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded"
            />
          </div>

          {/* Condition Filter */}
          <div>
            <select
              id="select-grade-filter"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="All">All Formats (Graded & Raw)</option>
              <option value="Graded">Graded Slabs Only (PSA/BGS/CGC)</option>
              <option value="Raw">Raw Cards Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div id="deals-list-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDeals.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-semibold text-white">No active deals match current filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Try adjusting your Min ROI threshold or Risk level, or click 'Trigger Deal Drop' to inject a fresh high-margin listing.
            </p>
            <button
              onClick={() => {
                setSelectedMarketplace('All');
                setMinRoi(5);
                setMaxRisk(8);
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredDeals.map((deal) => {
            const feeConfig = MARKETPLACE_FEES[deal.marketplace] || { feeRate: 0.10, label: '10%' };
            const estResale = deal.fairMarketValue;
            const approxFee = estResale * feeConfig.feeRate;
            const netFlipProfit = deal.netProfitAfterFees;

            return (
              <div
                key={deal.id}
                id={`deal-card-${deal.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Header Tag Bar */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-indigo-300 flex items-center">
                      <Store className="w-3 h-3 mr-1 text-indigo-400" />
                      {deal.marketplace}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-xs font-bold flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" />
                      +{deal.roiPercentage}% ROI
                    </span>
                  </div>

                  {/* Card Main Info */}
                  <div className="flex items-start gap-3">
                    <img
                      src={deal.card.imageUrl}
                      alt={deal.card.name}
                      className="w-20 h-24 object-cover rounded-xl border border-slate-700 shadow-md flex-shrink-0 bg-slate-950"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider truncate">
                        {deal.card.setName}
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 mt-0.5 leading-snug">
                        {deal.card.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        {deal.card.isGraded ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 text-[10px] font-bold">
                            {deal.card.grade}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                            Raw Condition
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-500" />
                          {deal.listedTimeAgo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Financial Matrix */}
                  <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Asking Price</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        ${deal.askingPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        +{deal.shippingCost === 0 ? 'Free Ship' : `$${deal.shippingCost} ship`}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">AI Market Value</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        ${deal.fairMarketValue.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-emerald-500 font-medium mt-0.5">
                        ${netFlipProfit.toFixed(2)} Net Margin
                      </div>
                    </div>
                  </div>

                  {/* AI Insights & Strategy Note */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-amber-400 font-semibold flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Strategy: {deal.buyStrategy}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Est. Resale: ~{deal.estimatedResaleDays} days
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-2 text-[10px] leading-relaxed">
                      {deal.aiRecommendationNote}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      id={`btn-watchlist-${deal.id}`}
                      onClick={() => onAddToWatchlist(deal)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Save to Watchlist"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-inspect-valuation-${deal.id}`}
                      onClick={() => onInspectValuation(deal)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Inspect AI Valuation Model"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    id={`btn-assisted-buy-${deal.id}`}
                    onClick={() => setSelectedDealForCheckout(deal)}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-950/40"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Assisted Buy</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assisted Checkout Modal */}
      {selectedDealForCheckout && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Assisted Purchase Hub</h3>
                  <p className="text-xs text-slate-400">Policy-Compliant One-Tap Ordering Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDealForCheckout(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Deal Summary */}
            <div className="flex gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
              <img
                src={selectedDealForCheckout.card.imageUrl}
                alt={selectedDealForCheckout.card.name}
                className="w-16 h-20 object-cover rounded-lg border border-slate-700"
              />
              <div className="text-xs space-y-1">
                <span className="text-amber-400 font-semibold">{selectedDealForCheckout.card.setName}</span>
                <div className="font-bold text-white text-sm">{selectedDealForCheckout.card.name}</div>
                <div className="text-slate-400">Format: {selectedDealForCheckout.card.grade || 'Raw NM'}</div>
                <div className="text-emerald-400 font-bold">
                  Expected Profit: +${selectedDealForCheckout.netProfitAfterFees.toFixed(2)} ({selectedDealForCheckout.roiPercentage}% ROI)
                </div>
              </div>
            </div>

            {/* Comprehensive Fee Breakdown */}
            <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs">
              <div className="font-semibold text-slate-200 mb-2 border-b border-slate-800/80 pb-1">
                Financial Cost Breakdown
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Asking Purchase Price:</span>
                <span className="font-semibold text-white">${selectedDealForCheckout.askingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee:</span>
                <span>${selectedDealForCheckout.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Sales Tax (7%):</span>
                <span>${selectedDealForCheckout.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Resale Platform Fee ({MARKETPLACE_FEES[selectedDealForCheckout.marketplace]?.label}):</span>
                <span>-${(selectedDealForCheckout.fairMarketValue * (MARKETPLACE_FEES[selectedDealForCheckout.marketplace]?.feeRate || 0.10)).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span className="text-white">Net Project Profit:</span>
                <span className="text-emerald-400">+${selectedDealForCheckout.netProfitAfterFees.toFixed(2)}</span>
              </div>
            </div>

            {/* Smart Purchase Recommendation */}
            <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-200 leading-relaxed">
              <strong>Smart Buying Tip:</strong> Seller has {selectedDealForCheckout.sellerRatingPercentage}% positive feedback with {selectedDealForCheckout.sellerSalesCount} completed sales.
            </div>

            {/* Final Action Buttons */}
            <div className="flex gap-3 pt-2">
              <a
                href={selectedDealForCheckout.listingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs text-center flex items-center justify-center space-x-1 border border-slate-700"
              >
                <span>View Direct Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  onPurchaseDeal(selectedDealForCheckout);
                  setSelectedDealForCheckout(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs text-center shadow-lg shadow-emerald-950/40"
              >
                Confirm Purchase & Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
