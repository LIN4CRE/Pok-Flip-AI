import React, { useState } from 'react';
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  Layers, 
  Flame, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  Info,
  Sliders
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MOCK_MARKET_ANALYTICS } from '../data/mockPokemonData';
import { CardMarketAnalytics } from '../types';

export const MarketAnalytics: React.FC = () => {
  const [analyticsList] = useState<CardMarketAnalytics[]>(MOCK_MARKET_ANALYTICS);
  const [primaryCard, setPrimaryCard] = useState<CardMarketAnalytics>(MOCK_MARKET_ANALYTICS[0]);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>(['card-umb-vmax', 'card-latias-latios']);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');

  // Multi-card comparison chart dataset builder
  const comparisonChartData = primaryCard.historicalPrices.map((item, index) => {
    const dataPoint: any = {
      date: item.date,
      [MOCK_MARKET_ANALYTICS[0].cardName]: MOCK_MARKET_ANALYTICS[0].historicalPrices[index]?.psa10Price || 0,
      [MOCK_MARKET_ANALYTICS[1].cardName]: MOCK_MARKET_ANALYTICS[1].historicalPrices[index]?.psa10Price || 0,
      [MOCK_MARKET_ANALYTICS[2].cardName]: MOCK_MARKET_ANALYTICS[2].historicalPrices[index]?.psa10Price || 0,
    };
    return dataPoint;
  });

  const toggleComparisonCard = (cardId: string) => {
    if (selectedComparisonIds.includes(cardId)) {
      if (selectedComparisonIds.length === 1) return; // Keep at least 1
      setSelectedComparisonIds(selectedComparisonIds.filter((id) => id !== cardId));
    } else {
      setSelectedComparisonIds([...selectedComparisonIds, cardId]);
    }
  };

  return (
    <div id="market-analytics-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Fintech Pricing & Population Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Historical Market Analytics & Heat Maps
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Track 6-month historical price trajectories, PSA 10 gem premiums, sales volume spikes, and side-by-side card correlation indices.
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {(['1M', '3M', '6M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Single Card Historical Price & Volume Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold">{primaryCard.setName}</div>
            <h2 className="text-xl font-bold text-white mt-0.5">{primaryCard.cardName}</h2>
            <div className="flex items-center space-x-3 text-xs mt-1">
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{primaryCard.change30d}% (30-Day)
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">PSA 10: <strong className="text-white">${primaryCard.currentPsa10}</strong></span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">Raw NM: <strong className="text-white">${primaryCard.currentRaw}</strong></span>
            </div>
          </div>

          {/* Card Switcher Dropdown */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Select Focus Card:</label>
            <select
              value={primaryCard.cardId}
              onChange={(e) => {
                const found = analyticsList.find((c) => c.cardId === e.target.value);
                if (found) setPrimaryCard(found);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/60"
            >
              {analyticsList.map((card) => (
                <option key={card.cardId} value={card.cardId}>
                  {card.cardName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Primary Chart Area */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={primaryCard.historicalPrices}>
              <defs>
                <linearGradient id="psa10Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rawGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="psa10Price"
                name="PSA 10 Gem Price ($)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#psa10Gradient)"
              />
              <Area
                type="monotone"
                dataKey="rawPrice"
                name="Raw Near Mint Price ($)"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rawGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Card Side-by-Side Overlay Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center">
              <Layers className="w-4 h-4 mr-2 text-amber-400" />
              Multi-Card Price Correlation & Overlay Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare 2 or 3 cards side-by-side on the same historical timeline to spot market leads and lags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {analyticsList.map((card) => {
              const isSelected = selectedComparisonIds.includes(card.cardId);
              return (
                <button
                  key={card.cardId}
                  onClick={() => toggleComparisonCard(card.cardId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all border ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
                  <span>{card.cardName.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {selectedComparisonIds.includes('card-umb-vmax') && (
                <Area type="monotone" dataKey={MOCK_MARKET_ANALYTICS[0].cardName} stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              )}
              {selectedComparisonIds.includes('card-char-1st') && (
                <Area type="monotone" dataKey={MOCK_MARKET_ANALYTICS[1].cardName} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
              )}
              {selectedComparisonIds.includes('card-latias-latios') && (
                <Area type="monotone" dataKey={MOCK_MARKET_ANALYTICS[2].cardName} stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Set Performance Heat Map & Market Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Heat Map */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Flame className="w-4 h-4 mr-2 text-rose-400" />
              Set Performance Heat Map (30-Day)
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Set Index: +14.2%
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Sword & Shield: Evolving Skies</div>
                <div className="text-[10px] text-slate-400">Secret Rare Alt Arts Focus</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">+24.5%</div>
                <div className="text-[10px] text-slate-500">Ultra High Volume</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Sun & Moon: Team Up</div>
                <div className="text-[10px] text-slate-400">Tag Team Alt Arts</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">+31.8%</div>
                <div className="text-[10px] text-slate-500">High Scarcity</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Scarlet & Violet: Pokémon 151</div>
                <div className="text-[10px] text-slate-400">Gen 1 Nostalgia SIRs</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">+12.2%</div>
                <div className="text-[10px] text-slate-500">Massive Retail Demand</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">WOTC Base Set 1st Edition</div>
                <div className="text-[10px] text-slate-400">Vintage Grails</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-400">+4.8%</div>
                <div className="text-[10px] text-slate-500">Stable Store of Value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Liquidity & Sentiment Index */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center">
            <BarChart2 className="w-4 h-4 mr-2 text-emerald-400" />
            Grading Premium & Population Ratios
          </h3>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">PSA 10 Gem Mint Multiplier:</span>
              <span className="font-bold text-emerald-400">1.82x over Raw NM</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[75%]"></div>
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              Submitting pack-fresh modern alt arts yields an average +82% net profit margin when hitting PSA 10 gem status.
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Market Liquidity Velocity Index:</span>
              <span className="font-bold text-amber-400">8.4 / 10 (Fast Turnover)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-400 h-full w-[84%]"></div>
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              Top 20 modern singles sell within an average of 4.2 days on eBay and TCGplayer when priced within 5% of fair market value.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
