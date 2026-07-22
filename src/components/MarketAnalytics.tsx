import React, { useState, useMemo } from 'react';
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  TrendingDown,
  Layers, 
  Flame, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  Info,
  Sliders,
  Calendar,
  DollarSign,
  Award,
  Sparkles,
  Zap,
  Eye,
  Activity,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  ReferenceLine
} from 'recharts';
import { MOCK_MARKET_ANALYTICS } from '../data/mockPokemonData';
import { CardMarketAnalytics, HistoricalPricePoint } from '../types';

type TimeframeOption = '30D' | '90D' | '6M' | '1Y';
type ProjectionScenario = 'base' | 'bull' | 'bear';

const USD_TO_GBP = 0.79; // 1 USD = £0.79 GBP exchange rate

export const MarketAnalytics: React.FC = () => {
  const [analyticsList] = useState<CardMarketAnalytics[]>(MOCK_MARKET_ANALYTICS);
  const [primaryCard, setPrimaryCard] = useState<CardMarketAnalytics>(MOCK_MARKET_ANALYTICS[0]);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([
    'card-umb-vmax', 
    'card-latias-latios', 
    'card-char-1st'
  ]);
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30D');
  
  // Chart visual & projection settings
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [showPsa10, setShowPsa10] = useState(true);
  const [showPsa9, setShowPsa9] = useState(true);
  const [showRaw, setShowRaw] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [showProjection, setShowProjection] = useState(true);
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  const [projectionScenario, setProjectionScenario] = useState<ProjectionScenario>('base');
  const [isNormalized, setIsNormalized] = useState(true); // % return vs absolute £ for multi-card

  // Color palette for up to 3 compared cards
  const COMPARISON_COLORS = ['#10b981', '#f59e0b', '#6366f1'];

  // Helper function to format GBP
  const formatGBP = (usdAmount: number, compact: boolean = false) => {
    const gbp = usdAmount * USD_TO_GBP;
    if (compact && gbp >= 1000) {
      return `£${(gbp / 1000).toFixed(1)}k`;
    }
    return `£${gbp.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Get active dataset for timeframe converted to GBP (£)
  const activeDatasetGbp = useMemo(() => {
    const rawSet = timeframe === '30D' ? primaryCard.historicalPrices30d || primaryCard.historicalPrices
                 : timeframe === '90D' ? primaryCard.historicalPrices90d || primaryCard.historicalPrices
                 : timeframe === '1Y'  ? primaryCard.historicalPrices1y || primaryCard.historicalPrices
                 : primaryCard.historicalPrices;

    return rawSet.map(pt => ({
      ...pt,
      psa10Gbp: Number((pt.psa10Price * USD_TO_GBP).toFixed(2)),
      psa9Gbp: Number((pt.psa9Price * USD_TO_GBP).toFixed(2)),
      rawGbp: Number((pt.rawPrice * USD_TO_GBP).toFixed(2)),
    }));
  }, [primaryCard, timeframe]);

  // Derived statistics for active timeframe in GBP £
  const timeframeStats = useMemo(() => {
    if (!activeDatasetGbp || activeDatasetGbp.length === 0) {
      return { changePct: 0, high: 0, low: 0, avg: 0, totalVolume: 0 };
    }
    const prices = activeDatasetGbp.map(d => d.psa10Gbp);
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const changePct = startPrice > 0 ? Number((((endPrice - startPrice) / startPrice) * 100).toFixed(1)) : 0;
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const totalVolume = activeDatasetGbp.reduce((sum, item) => sum + item.salesVolume, 0);

    return { changePct, high, low, avg, totalVolume };
  }, [activeDatasetGbp]);

  // Future Value Projection calculation engine based on historical volatility and trend
  const { combinedDatasetWithProjection, projectionSummary } = useMemo(() => {
    if (!activeDatasetGbp || activeDatasetGbp.length === 0) {
      return { combinedDatasetWithProjection: [], projectionSummary: { projectedPrice: 0, projectedReturnPct: 0, volatilityPct: 0, confidenceScore: 0 } };
    }

    const prices = activeDatasetGbp.map(d => d.psa10Gbp);
    const n = prices.length;
    const currentPrice = prices[n - 1];

    // Calculate step returns
    const returns: number[] = [];
    for (let i = 1; i < n; i++) {
      if (prices[i - 1] > 0) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      }
    }

    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0.02;
    const variance = returns.length > 0 
      ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length 
      : 0.001;
    const volatility = Math.sqrt(variance); // Standard deviation of period returns

    // Scenario rate adjustment
    const scenarioMultiplier = projectionScenario === 'bull' ? 1.6 : projectionScenario === 'bear' ? -0.8 : 1.0;
    const expectedStepGrowth = avgReturn * scenarioMultiplier;

    // Define future date labels based on active timeframe
    const futureDateLabels = timeframe === '30D' 
      ? ['+1 Wk Proj', '+2 Wk Proj', '+3 Wk Proj', '+1 Mo Proj']
      : timeframe === '90D'
      ? ['+2 Wk Proj', '+1 Mo Proj', '+2 Mo Proj', '+3 Mo Proj']
      : timeframe === '6M'
      ? ['+1 Mo Proj', '+2 Mo Proj', '+4 Mo Proj', '+6 Mo Proj']
      : ['+2 Mo Proj', '+4 Mo Proj', '+8 Mo Proj', '+12 Mo Proj'];

    // Build combined dataset
    const combined: Record<string, any>[] = activeDatasetGbp.map((pt, idx) => {
      const isLastHistorical = idx === n - 1;
      return {
        date: pt.date,
        isProjection: false,
        psa10Gbp: pt.psa10Gbp,
        psa9Gbp: pt.psa9Gbp,
        rawGbp: pt.rawGbp,
        salesVolume: pt.salesVolume,
        futureProjection: isLastHistorical ? pt.psa10Gbp : null,
        projectionUpper: isLastHistorical ? pt.psa10Gbp : null,
        projectionLower: isLastHistorical ? pt.psa10Gbp : null,
      };
    });

    // Generate projected points
    let lastProj = currentPrice;
    futureDateLabels.forEach((label, step) => {
      const stepNum = step + 1;
      const projValue = currentPrice * Math.pow(1 + expectedStepGrowth, stepNum);
      const confidenceMargin = projValue * volatility * Math.sqrt(stepNum) * 1.2;

      lastProj = projValue;

      combined.push({
        date: label,
        isProjection: true,
        psa10Gbp: null,
        psa9Gbp: null,
        rawGbp: null,
        salesVolume: null,
        futureProjection: Number(projValue.toFixed(2)),
        projectionUpper: Number((projValue + confidenceMargin).toFixed(2)),
        projectionLower: Number(Math.max(0, projValue - confidenceMargin).toFixed(2)),
      });
    });

    const projectedReturnPct = currentPrice > 0 ? Number((((lastProj - currentPrice) / currentPrice) * 100).toFixed(1)) : 0;
    const volatilityPct = Number((volatility * 100).toFixed(1));
    const confidenceScore = Math.min(96, Math.max(72, Math.round(90 - volatilityPct * 1.5 + (primaryCard.liquidityScore === 'Ultra High' ? 6 : 2))));

    return {
      combinedDatasetWithProjection: combined,
      projectionSummary: {
        projectedPrice: Number(lastProj.toFixed(2)),
        projectedReturnPct,
        volatilityPct,
        confidenceScore
      }
    };
  }, [activeDatasetGbp, timeframe, projectionScenario, primaryCard]);

  // Multi-card comparison dataset in GBP £
  const comparisonChartData = useMemo(() => {
    const selectedCards = analyticsList.filter(c => selectedComparisonIds.includes(c.cardId));
    if (selectedCards.length === 0) return [];

    // Reference timeline based on timeframe
    const baselineData = (() => {
      if (timeframe === '30D') return primaryCard.historicalPrices30d || primaryCard.historicalPrices;
      if (timeframe === '90D') return primaryCard.historicalPrices90d || primaryCard.historicalPrices;
      if (timeframe === '1Y') return primaryCard.historicalPrices1y || primaryCard.historicalPrices;
      return primaryCard.historicalPrices;
    })();

    return baselineData.map((point, idx) => {
      const dataPoint: Record<string, any> = { date: point.date };
      
      selectedCards.forEach(card => {
        const cardDataset = (() => {
          if (timeframe === '30D') return card.historicalPrices30d || card.historicalPrices;
          if (timeframe === '90D') return card.historicalPrices90d || card.historicalPrices;
          if (timeframe === '1Y') return card.historicalPrices1y || card.historicalPrices;
          return card.historicalPrices;
        })();

        const match = cardDataset[idx] || cardDataset[cardDataset.length - 1] || point;
        const initialPriceGbp = (cardDataset[0]?.psa10Price || 1) * USD_TO_GBP;
        const currentMatchGbp = match.psa10Price * USD_TO_GBP;

        if (isNormalized) {
          // % Gain relative to start of period
          const pctReturn = (((currentMatchGbp - initialPriceGbp) / initialPriceGbp) * 100);
          dataPoint[card.cardName] = Number(pctReturn.toFixed(1));
        } else {
          dataPoint[card.cardName] = Number(currentMatchGbp.toFixed(2));
        }
      });

      return dataPoint;
    });
  }, [analyticsList, selectedComparisonIds, timeframe, isNormalized, primaryCard]);

  // Selected heatmap tile state
  const [selectedHeatmapIndex, setSelectedHeatmapIndex] = useState<number | null>(null);

  // Market Volatility Heatmap calculation based on historical price deltas and sales volume
  const volatilityHeatmapData = useMemo(() => {
    if (!activeDatasetGbp || activeDatasetGbp.length === 0) return [];

    const maxVolume = Math.max(...activeDatasetGbp.map(d => d.salesVolume || 1), 1);

    return activeDatasetGbp.map((pt, idx) => {
      const prevPrice = idx > 0 ? activeDatasetGbp[idx - 1].psa10Gbp : pt.psa10Gbp;
      const priceDeltaGbp = pt.psa10Gbp - prevPrice;
      const pctChange = prevPrice > 0 ? ((priceDeltaGbp / prevPrice) * 100) : 0;
      const absPctChange = Math.abs(pctChange);
      const volumeRatio = pt.salesVolume / maxVolume;

      // Volatility Index Score (0 - 100)
      const volatilityScore = Math.min(100, Math.round(absPctChange * 9 + volumeRatio * 40));

      let level: 'spike' | 'rally' | 'dip' | 'active' | 'stable' = 'stable';
      let label = 'Stable Baseline';
      let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
      let tileColor = 'bg-slate-800/80 border-slate-700 hover:border-slate-500';

      if (pctChange >= 4.5 || volatilityScore >= 55) {
        level = 'spike';
        label = '🔥 High Price Spike';
        badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        tileColor = 'bg-gradient-to-t from-rose-950 to-rose-600/90 border-rose-400/80 shadow-lg shadow-rose-950/50';
      } else if (pctChange >= 2.0 || (volumeRatio > 0.65 && pctChange > 0)) {
        level = 'rally';
        label = '⚡ Volume Rally';
        badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        tileColor = 'bg-gradient-to-t from-amber-950 to-amber-500/80 border-amber-400/80 shadow-md';
      } else if (pctChange <= -2.5) {
        level = 'dip';
        label = '📉 Price Compression / Dip';
        badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
        tileColor = 'bg-gradient-to-t from-purple-950 to-purple-600/80 border-purple-400/80 shadow-md';
      } else if (volatilityScore >= 20 || volumeRatio > 0.35) {
        level = 'active';
        label = '📈 Active Trading';
        badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        tileColor = 'bg-gradient-to-t from-emerald-950 to-emerald-600/70 border-emerald-500/60';
      }

      return {
        date: pt.date,
        priceGbp: pt.psa10Gbp,
        priceDeltaGbp: Number(priceDeltaGbp.toFixed(2)),
        pctChange: Number(pctChange.toFixed(1)),
        salesVolume: pt.salesVolume,
        volatilityScore,
        level,
        label,
        badgeColor,
        tileColor
      };
    });
  }, [activeDatasetGbp]);

  const heatmapHighlights = useMemo(() => {
    if (!volatilityHeatmapData || volatilityHeatmapData.length === 0) {
      return { peakSpike: null, peakVolume: null, avgScore: 0 };
    }
    const peakSpike = [...volatilityHeatmapData].sort((a, b) => b.pctChange - a.pctChange)[0];
    const peakVolume = [...volatilityHeatmapData].sort((a, b) => b.salesVolume - a.salesVolume)[0];
    const avgScore = Math.round(volatilityHeatmapData.reduce((acc, curr) => acc + curr.volatilityScore, 0) / volatilityHeatmapData.length);

    return { peakSpike, peakVolume, avgScore };
  }, [volatilityHeatmapData]);

  // Toggle card comparison logic (max 3)

  const toggleComparisonCard = (cardId: string) => {
    if (selectedComparisonIds.includes(cardId)) {
      if (selectedComparisonIds.length === 1) return; // Keep at least 1
      setSelectedComparisonIds(selectedComparisonIds.filter(id => id !== cardId));
    } else {
      if (selectedComparisonIds.length >= 3) {
        setSelectedComparisonIds([selectedComparisonIds[0], selectedComparisonIds[1], cardId]);
      } else {
        setSelectedComparisonIds([...selectedComparisonIds, cardId]);
      }
    }
  };

  const handleSlotChange = (slotIndex: number, newCardId: string) => {
    if (newCardId === 'none') {
      const updated = selectedComparisonIds.filter((_, idx) => idx !== slotIndex);
      if (updated.length > 0) setSelectedComparisonIds(updated);
      return;
    }
    const updated = [...selectedComparisonIds];
    updated[slotIndex] = newCardId;
    const unique = Array.from(new Set(updated));
    setSelectedComparisonIds(unique);
  };

  // Custom Tooltip for Primary Chart
  const CustomPrimaryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isProjPoint = payload.some((p: any) => p.payload?.isProjection);
      return (
        <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 shadow-2xl text-xs space-y-2.5 min-w-[220px] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" />
              {label}
              {isProjPoint && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-cyan-500/20 text-cyan-300 rounded font-semibold border border-cyan-500/30">
                  AI Model
                </span>
              )}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
              {primaryCard.cardName.split(' ')[0]}
            </span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              if (entry.value === null || entry.value === undefined) return null;
              return (
                <div key={`primary-item-${index}`} className="flex items-center justify-between p-1 rounded bg-slate-900/60 border border-slate-800/60">
                  <span className="flex items-center space-x-1.5" style={{ color: entry.color }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-300 font-medium">{entry.name}:</span>
                  </span>
                  <span className="font-bold text-white">
                    {entry.dataKey === 'salesVolume' 
                      ? `${entry.value} units` 
                      : `£${entry.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Interactive Tooltip for Multi-Card Comparison Chart with exact GBP £ prices
  const CustomMultiComparisonTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2.5 min-w-[250px] shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" />
              {label}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {timeframe} Multi-Card
            </span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const cardName = entry.name;
              const cardObj = analyticsList.find(c => c.cardName === cardName);
              
              // Lookup exact price in GBP (£) for this date point
              const cardDataset = timeframe === '30D' ? cardObj?.historicalPrices30d || cardObj?.historicalPrices
                                : timeframe === '90D' ? cardObj?.historicalPrices90d || cardObj?.historicalPrices
                                : timeframe === '1Y'  ? cardObj?.historicalPrices1y || cardObj?.historicalPrices
                                : cardObj?.historicalPrices;
              
              const matchPoint = cardDataset?.find((p: any) => p.date === label) || cardDataset?.[0];
              const priceGbp = matchPoint ? (matchPoint.psa10Price * USD_TO_GBP) : 0;

              return (
                <div key={`multi-tooltip-${index}`} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <div>
                      <span className="font-bold text-white block text-xs">{cardName}</span>
                      <span className="text-[10px] text-slate-400">{cardObj?.setName || 'Pokemon Singles'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-300 block text-xs">
                      £{priceGbp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {isNormalized && (
                      <span className={`text-[10px] font-semibold block ${entry.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {entry.value >= 0 ? `+${entry.value}%` : `${entry.value}%`} ROI
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="market-analytics-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>GBP (£) Fintech Pricing & Predictive Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center">
              Historical Market Analytics & AI Value Projections
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Analyze interactive 30-day, 90-day, 6-month, and 1-year price trajectories in British Pounds (£), featuring Monte Carlo AI future value projections and multi-card correlation metrics.
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto shadow-inner">
            <span className="text-[10px] text-slate-500 uppercase font-semibold px-2 hidden sm:inline">Timeframe:</span>
            {(['30D', '90D', '6M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tf === '30D' ? '30 Days' : tf === '90D' ? '90 Days' : tf === '6M' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Card Historical Price Chart Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start space-x-4">
            <img 
              src={primaryCard.imageUrl} 
              alt={primaryCard.cardName} 
              className="w-14 h-18 object-cover rounded-xl border border-slate-700 shadow-md flex-shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-amber-400 font-semibold">{primaryCard.setName}</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded-full border border-slate-700">
                  {primaryCard.liquidityScore} Liquidity
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  primaryCard.sentiment === 'Bullish'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {primaryCard.sentiment}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{primaryCard.cardName}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1.5">
                <span className="text-slate-300">
                  PSA 10: <strong className="text-white text-sm">{formatGBP(primaryCard.currentPsa10)}</strong>
                </span>
                <span className="text-slate-300">
                  Raw NM: <strong className="text-slate-200">{formatGBP(primaryCard.currentRaw)}</strong>
                </span>
                <span className={`font-bold flex items-center ${
                  timeframeStats.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {timeframeStats.changePct >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-0.5" />
                  )}
                  {timeframeStats.changePct >= 0 ? `+${timeframeStats.changePct}%` : `${timeframeStats.changePct}%`}
                  <span className="text-slate-500 font-normal ml-1">({timeframe} trend)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Controls Right Column */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-medium">Focus Card:</label>
              <select
                value={primaryCard.cardId}
                onChange={(e) => {
                  const found = analyticsList.find((c) => c.cardId === e.target.value);
                  if (found) setPrimaryCard(found);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500/60"
              >
                {analyticsList.map((card) => (
                  <option key={card.cardId} value={card.cardId}>
                    {card.cardName} ({formatGBP(card.currentPsa10)})
                  </option>
                ))}
              </select>
            </div>

            {/* Chart Type Toggle */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-medium">Style:</label>
              <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    chartType === 'area' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    chartType === 'line' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Line
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe KPI Quick Stats Grid (in GBP £) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-[11px] text-slate-400 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {timeframe} Period High (£)
            </div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              £{timeframeStats.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {timeframe} Period Low (£)
            </div>
            <div className="text-base font-bold text-slate-300 mt-0.5">
              £{timeframeStats.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {timeframe} Avg Price (£)
            </div>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              £{timeframeStats.avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 flex items-center">
              <BarChart2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Total Sales Volume
            </div>
            <div className="text-base font-bold text-indigo-400 mt-0.5">
              {timeframeStats.totalVolume} units
            </div>
          </div>
        </div>

        {/* AI Future Value Projection Control Panel */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center">
                  Future Value Projection Model (AI Trend & Volatility Engine)
                </h4>
                <p className="text-[10px] text-slate-400">
                  Projects upcoming price points based on historical drift rate, volatility variance, and market liquidity.
                </p>
              </div>
            </div>

            {/* Projection Scenario Controls */}
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Scenario:</span>
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 text-[11px]">
                <button
                  onClick={() => setProjectionScenario('bear')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    projectionScenario === 'bear' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bearish (-0.8σ)
                </button>
                <button
                  onClick={() => setProjectionScenario('base')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    projectionScenario === 'base' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Base Trend
                </button>
                <button
                  onClick={() => setProjectionScenario('bull')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    projectionScenario === 'bull' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bullish (+1.6σ)
                </button>
              </div>
            </div>
          </div>

          {/* Metric Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Projected Target (£):</span>
              <span className="font-bold text-cyan-400 text-sm">
                £{projectionSummary.projectedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Expected Return (%):</span>
              <span className={`font-bold text-sm ${projectionSummary.projectedReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {projectionSummary.projectedReturnPct >= 0 ? `+${projectionSummary.projectedReturnPct}%` : `${projectionSummary.projectedReturnPct}%`}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Historical Volatility (σ):</span>
              <span className="font-bold text-amber-400 text-sm">{projectionSummary.volatilityPct}%</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Model Reliability Score:</span>
              <span className="font-bold text-indigo-400 text-sm">{projectionSummary.confidenceScore}% (High)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Legend Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800/60">
          <span className="text-slate-400 font-medium text-[11px]">Display Layers:</span>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showPsa10} 
                onChange={(e) => setShowPsa10(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900" 
              />
              <span className="text-emerald-400 font-semibold flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
                PSA 10 Gem (£)
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showPsa9} 
                onChange={(e) => setShowPsa9(e.target.checked)}
                className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900" 
              />
              <span className="text-indigo-400 font-medium flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5" />
                PSA 9 Mint (£)
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showRaw} 
                onChange={(e) => setShowRaw(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900" 
              />
              <span className="text-amber-400 font-medium flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
                Raw NM (£)
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showProjection} 
                onChange={(e) => setShowProjection(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900" 
              />
              <span className="text-cyan-400 font-semibold flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-cyan-400" />
                Future Value Proj. (£)
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showConfidenceBands} 
                onChange={(e) => setShowConfidenceBands(e.target.checked)}
                className="rounded border-slate-700 text-slate-500 focus:ring-slate-500 bg-slate-900" 
              />
              <span className="text-slate-400 font-medium text-[11px]">
                Confidence Bounds
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showVolume} 
                onChange={(e) => setShowVolume(e.target.checked)}
                className="rounded border-slate-700 text-purple-500 focus:ring-purple-500 bg-slate-900" 
              />
              <span className="text-purple-400 font-medium flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5" />
                Sales Volume
              </span>
            </label>
          </div>
        </div>

        {/* Recharts Primary Historical & Projected Chart in GBP £ */}
        <div className="h-88 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={combinedDatasetWithProjection}>
                <defs>
                  <linearGradient id="psa10Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="psa9Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="rawGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="projBandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis 
                  yAxisId="left"
                  stroke="#64748b" 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={(val) => `£${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`}
                />
                {showVolume && (
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#a855f7" 
                    tick={{ fontSize: 11 }}
                    domain={[0, 'dataMax + 10']}
                  />
                )}
                <Tooltip content={<CustomPrimaryTooltip />} />
                <ReferenceLine 
                  yAxisId="left" 
                  y={timeframeStats.avg} 
                  stroke="#475569" 
                  strokeDasharray="3 3" 
                  label={{ value: `Avg: £${timeframeStats.avg}`, fill: '#94a3b8', fontSize: 10 }} 
                />
                
                {/* Confidence Bounds Area */}
                {showProjection && showConfidenceBands && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="projectionUpper"
                    name="Upper Confidence Band (+1.2σ)"
                    stroke="transparent"
                    fill="url(#projBandGrad)"
                  />
                )}

                {showPsa10 && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="psa10Gbp"
                    name="PSA 10 Gem (£)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#psa10Grad)"
                  />
                )}
                {showPsa9 && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="psa9Gbp"
                    name="PSA 9 Mint (£)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#psa9Grad)"
                  />
                )}
                {showRaw && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="rawGbp"
                    name="Raw NM (£)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#rawGrad)"
                  />
                )}

                {/* Future Value Projection Line */}
                {showProjection && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="futureProjection"
                    name="Future Value Proj. (AI Engine)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    dot={{ r: 4, fill: '#06b6d4', stroke: '#0891b2', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#22d3ee' }}
                    connectNulls={true}
                  />
                )}

                {showVolume && (
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="salesVolume"
                    name="Sales Volume"
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    fillOpacity={0.1}
                    fill="#a855f7"
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart data={combinedDatasetWithProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={(val) => `£${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`}
                />
                <Tooltip content={<CustomPrimaryTooltip />} />
                {showPsa10 && (
                  <Line type="monotone" dataKey="psa10Gbp" name="PSA 10 Gem (£)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                )}
                {showPsa9 && (
                  <Line type="monotone" dataKey="psa9Gbp" name="PSA 9 Mint (£)" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                )}
                {showRaw && (
                  <Line type="monotone" dataKey="rawGbp" name="Raw NM (£)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                )}
                {showProjection && (
                  <Line
                    type="monotone"
                    dataKey="futureProjection"
                    name="Future Value Proj. (AI Engine)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    dot={{ r: 4, fill: '#06b6d4' }}
                    connectNulls={true}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Volatility Heatmap Visualization Component */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Trading Activity & Price Spikes Engine</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Market Volatility Heatmap ({timeframe})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Highlights trading activity volume, sharp price movements, and sudden market rallies across the {timeframe} timeframe in British Pounds (£). Click or hover over any tile to inspect date metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-3 text-[11px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Intensity Legend:</span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                <span className="text-rose-300 font-semibold">Spike</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span className="text-amber-300 font-semibold">Rally</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span className="text-emerald-300 font-semibold">Active</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-purple-500" />
                <span className="text-purple-300 font-semibold">Dip</span>
              </span>
            </div>
          </div>
        </div>

        {/* Heatmap Highlights KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Peak Single Spike Event</span>
              <span className="text-sm font-bold text-rose-400 mt-0.5 block">
                {heatmapHighlights.peakSpike ? `+${heatmapHighlights.peakSpike.pctChange}% (£${heatmapHighlights.peakSpike.priceDeltaGbp > 0 ? `+${heatmapHighlights.peakSpike.priceDeltaGbp}` : heatmapHighlights.peakSpike.priceDeltaGbp})` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500">
                {heatmapHighlights.peakSpike ? `Date: ${heatmapHighlights.peakSpike.date}` : ''}
              </span>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Highest Volume Cluster</span>
              <span className="text-sm font-bold text-amber-400 mt-0.5 block">
                {heatmapHighlights.peakVolume ? `${heatmapHighlights.peakVolume.salesVolume} units sold` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500">
                {heatmapHighlights.peakVolume ? `Date: ${heatmapHighlights.peakVolume.date} (£${heatmapHighlights.peakVolume.priceGbp})` : ''}
              </span>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Volatility Index Avg</span>
              <span className="text-sm font-bold text-indigo-400 mt-0.5 block">
                {heatmapHighlights.avgScore} / 100 ({heatmapHighlights.avgScore > 40 ? 'Moderate High' : 'Stable'})
              </span>
              <span className="text-[10px] text-slate-500">Period Avg Liquidity Velocity</span>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Heatmap Grid Visual Ribbon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Timeframe Timeline Checkpoints ({volatilityHeatmapData.length} data points)</span>
            <span className="text-[11px] text-amber-400 font-medium">Hover or click tiles for price breakdown</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-20 gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
            {volatilityHeatmapData.map((tile, idx) => {
              const isSelected = selectedHeatmapIndex === idx;
              return (
                <button
                  key={`tile-${idx}`}
                  onClick={() => setSelectedHeatmapIndex(isSelected ? null : idx)}
                  onMouseEnter={() => setSelectedHeatmapIndex(idx)}
                  className={`h-12 rounded-lg p-1 text-left transition-all relative group flex flex-col justify-between border ${tile.tileColor} ${
                    isSelected ? 'ring-2 ring-amber-400 scale-105 z-10' : ''
                  }`}
                >
                  <span className="text-[9px] font-semibold text-slate-200 truncate leading-none block">
                    {tile.date.split(' ')[0]}
                  </span>
                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-[9px] font-bold ${tile.pctChange >= 0 ? 'text-white' : 'text-purple-200'}`}>
                      {tile.pctChange >= 0 ? `+${tile.pctChange}%` : `${tile.pctChange}%`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Heatmap Tile Detail Card */}
        {selectedHeatmapIndex !== null && volatilityHeatmapData[selectedHeatmapIndex] && (
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">
                  Date: {volatilityHeatmapData[selectedHeatmapIndex].date}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${volatilityHeatmapData[selectedHeatmapIndex].badgeColor}`}>
                  {volatilityHeatmapData[selectedHeatmapIndex].label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
                <span>
                  PSA 10 Price: <strong className="text-amber-300">£{volatilityHeatmapData[selectedHeatmapIndex].priceGbp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
                <span>
                  Price Delta: <strong className={volatilityHeatmapData[selectedHeatmapIndex].priceDeltaGbp >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {volatilityHeatmapData[selectedHeatmapIndex].priceDeltaGbp >= 0 ? `+£${volatilityHeatmapData[selectedHeatmapIndex].priceDeltaGbp}` : `-£${Math.abs(volatilityHeatmapData[selectedHeatmapIndex].priceDeltaGbp)}`} ({volatilityHeatmapData[selectedHeatmapIndex].pctChange}%)
                  </strong>
                </span>
                <span>
                  Trading Volume: <strong className="text-indigo-300">{volatilityHeatmapData[selectedHeatmapIndex].salesVolume} units</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Volatility Score</span>
                <span className="font-bold text-amber-400 text-sm">
                  {volatilityHeatmapData[selectedHeatmapIndex].volatilityScore} / 100
                </span>
              </div>
              <button
                onClick={() => setSelectedHeatmapIndex(null)}
                className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Card Side-by-Side Correlation & Return Overlay Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                Multi-Card Price Correlation & Return Overlay (GBP £)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select up to 3 Pokémon cards to compare price trajectories and relative gains side-by-side in British Pounds (£) on the same {timeframe} Recharts graph.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => setIsNormalized(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isNormalized 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                % Return Gain
              </button>
              <button
                onClick={() => setIsNormalized(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  !isNormalized 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Absolute (£)
              </button>
            </div>
          </div>
        </div>

        {/* Persistent Legend Bar for Compared Cards */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Persistent Comparison Legend ({selectedComparisonIds.length} Active Cards)</span>
            </span>
            <span className="text-[10px] text-slate-500">Live GBP (£) Trajectory</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {selectedComparisonIds.map((cardId, idx) => {
              const cardObj = analyticsList.find(c => c.cardId === cardId);
              if (!cardObj) return null;
              const color = COMPARISON_COLORS[idx % COMPARISON_COLORS.length];
              
              // calculate period return
              const cardDataset = timeframe === '30D' ? cardObj.historicalPrices30d || cardObj.historicalPrices
                                : timeframe === '90D' ? cardObj.historicalPrices90d || cardObj.historicalPrices
                                : timeframe === '1Y'  ? cardObj.historicalPrices1y || cardObj.historicalPrices
                                : cardObj.historicalPrices;
              const startP = cardDataset[0]?.psa10Price || 1;
              const endP = cardDataset[cardDataset.length - 1]?.psa10Price || startP;
              const returnPct = Number((((endP - startP) / startP) * 100).toFixed(1));

              return (
                <div key={`legend-bar-${cardId}`} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="min-w-0">
                      <span className="font-bold text-white text-xs truncate block">{cardObj.cardName}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{cardObj.setName}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="font-bold text-amber-300 text-xs block">
                      {formatGBP(cardObj.currentPsa10)}
                    </span>
                    <span className={`text-[10px] font-semibold ${returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {returnPct >= 0 ? `+${returnPct}%` : `${returnPct}%`} ({timeframe})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dropdowns for up to 3 Cards Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          {[0, 1, 2].map((slotIndex) => {
            const currentCardId = selectedComparisonIds[slotIndex] || '';
            const slotColor = COMPARISON_COLORS[slotIndex];
            return (
              <div key={slotIndex} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center space-x-1.5" style={{ color: slotColor }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slotColor }} />
                    <span>Card Slot {slotIndex + 1}</span>
                  </span>
                  {selectedComparisonIds.length > 1 && currentCardId && (
                    <button
                      onClick={() => handleSlotChange(slotIndex, 'none')}
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  value={currentCardId}
                  onChange={(e) => handleSlotChange(slotIndex, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500/60"
                >
                  <option value="none">-- Select Card {slotIndex + 1} --</option>
                  {analyticsList.map((card) => (
                    <option key={card.cardId} value={card.cardId}>
                      {card.cardName} ({formatGBP(card.currentPsa10)})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* Quick Toggle Pills (Capped at 3 Cards) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select (Max 3):</span>
          {analyticsList.map((card) => {
            const isSelected = selectedComparisonIds.includes(card.cardId);
            const selectedIdx = selectedComparisonIds.indexOf(card.cardId);
            const color = isSelected ? COMPARISON_COLORS[selectedIdx % COMPARISON_COLORS.length] : undefined;

            return (
              <button
                key={card.cardId}
                onClick={() => toggleComparisonCard(card.cardId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all border ${
                  isSelected
                    ? 'bg-slate-950 text-white border-amber-500/50 shadow-md'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: isSelected ? color : '#475569' }} 
                />
                <span>{card.cardName}</span>
                {isSelected && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                    #{selectedIdx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Multi Chart Container in GBP £ */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickFormatter={(val) => isNormalized ? `${val}%` : `£${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomMultiComparisonTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              {selectedComparisonIds.map((cardId, index) => {
                const cardObj = analyticsList.find(c => c.cardId === cardId);
                if (!cardObj) return null;
                const lineColor = COMPARISON_COLORS[index % COMPARISON_COLORS.length];
                return (
                  <Line 
                    key={cardId} 
                    type="monotone" 
                    dataKey={cardObj.cardName} 
                    name={cardObj.cardName} 
                    stroke={lineColor} 
                    strokeWidth={2.5} 
                    dot={{ r: 3, fill: lineColor }} 
                  />
                );
              })}
            </LineChart>
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
              Set Performance Heat Map ({timeframe})
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
            Grading Premium & Population Ratios (GBP £)
          </h3>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">PSA 10 Gem Mint Multiplier:</span>
              <span className="font-bold text-emerald-400">1.82x over Raw NM</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[75%]" />
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              Submitting pack-fresh modern alt arts yields an average +82% net profit margin in British Pounds (£) when hitting PSA 10 gem status.
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Market Liquidity Velocity Index:</span>
              <span className="font-bold text-amber-400">8.4 / 10 (Fast Turnover)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-400 h-full w-[84%]" />
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed">
              Top 20 modern singles sell within an average of 4.2 days on UK & global marketplaces when priced within 5% of fair market value.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
