import React, { useState } from 'react';
import { 
  Scan, 
  Upload, 
  Camera, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  ShieldCheck, 
  Plus, 
  RotateCcw,
  Bot,
  Info
} from 'lucide-react';
import { AIValuationResult, CardCondition } from '../types';
import { scanCardImage, fetchCardValuation } from '../lib/geminiApi';

interface AiValuationScannerProps {
  onAddToPortfolio: (itemData: any) => void;
  onOpenPokeBot: () => void;
}

const SAMPLE_PRESETS = [
  {
    name: 'Umbreon VMAX Alt Art #215',
    setName: 'Evolving Skies',
    setNumber: '215/203',
    grade: 'PSA 10 Candidate',
    imgUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
  },
  {
    name: '1st Edition Charizard Holo #4',
    setName: 'Base Set 1st Ed',
    setNumber: '4/102',
    grade: 'PSA 8 NM-MT',
    imgUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
  },
  {
    name: 'Gengar VMAX Alt Art #271',
    setName: 'Fusion Strike',
    setNumber: '271/264',
    grade: 'Raw Pack Fresh',
    imgUrl: 'https://images.pokemontcg.io/swsh8/271_hires.png',
  },
];

export const AiValuationScanner: React.FC<AiValuationScannerProps> = ({
  onAddToPortfolio,
  onOpenPokeBot,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_PRESETS[0].imgUrl);
  const [cardName, setCardName] = useState<string>(SAMPLE_PRESETS[0].name);
  const [setName, setSetName] = useState<string>(SAMPLE_PRESETS[0].setName);
  const [setNumber, setSetNumber] = useState<string>(SAMPLE_PRESETS[0].setNumber);
  const [gradeCondition, setGradeCondition] = useState<string>('PSA 10');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [valuation, setValuation] = useState<AIValuationResult | null>({
    fairMarketValue: 1150.0,
    estimatedBuyTarget: 890.0,
    estimatedResaleTimeDays: 4,
    confidencePercentage: 96,
    riskScore: 2,
    recommendation: 'BUY',
    liquidityRating: 'Ultra High',
    volatilityRating: 'Low',
    popReport: { psa10: 11450, psa9: 4210, totalGraded: 18200 },
    priceForecast30d: 1220.0,
    priceForecast90d: 1350.0,
    aiAnalysisSummary: 'Umbreon VMAX #215 Alt Art is the centerpiece modern grail of the Sword & Shield era. Population growth is slowing while collector demand remains at record highs. Target purchases below $920 yield a high-probability flip opportunity.',
    keyVisualFeatures: ['Perfection centering 50/50', 'Zero edge whitening', 'Deep texture foil relief', 'Sharp gem corners']
  });

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      runAiScanAndValuation(base64);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Scan
  const runAiScanAndValuation = async (imgBase64?: string) => {
    setIsAnalyzing(true);
    try {
      if (imgBase64) {
        const ocrResult = await scanCardImage(imgBase64);
        if (ocrResult) {
          setCardName(ocrResult.cardName || cardName);
          setSetName(ocrResult.setName || setName);
          setSetNumber(ocrResult.setNumber || setNumber);
          if (ocrResult.estimatedGrade) setGradeCondition(ocrResult.estimatedGrade);
        }
      }

      const valResult = await fetchCardValuation({
        cardName,
        setName,
        setNumber,
        grade: gradeCondition,
      });

      setValuation(valResult);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setSelectedImage(preset.imgUrl);
    setCardName(preset.name);
    setSetName(preset.setName);
    setSetNumber(preset.setNumber);
    setGradeCondition(preset.grade);
    runAiScanAndValuation();
  };

  return (
    <div id="ai-valuation-scanner-container" className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Modal Card Vision & Valuation Model</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              AI Card Scanner & Market Valuation Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Upload a photo or enter card parameters. Gemini AI examines visual centering, foil texture, PSA population reports, and recent auction price points to generate fair market value and flip guidance.
            </p>
          </div>

          <button
            onClick={onOpenPokeBot}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>Consult PokéBot AI</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Presets */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Card Image Scanner</span>
              <span className="text-[10px] text-slate-400 font-normal">Supports JPEG / PNG</span>
            </h3>

            {/* Dropzone */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950 rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center min-h-[220px]">
              {selectedImage ? (
                <div className="relative group w-full flex flex-col items-center">
                  <img
                    src={selectedImage}
                    alt="Scanned Card"
                    className="max-h-56 object-contain rounded-lg border border-slate-800 shadow-xl"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-600">
                      Change Image
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-6">
                  <Upload className="w-10 h-10 text-slate-500 mb-2" />
                  <span className="text-xs font-bold text-slate-200">Drop Card Photo or Click to Upload</span>
                  <span className="text-[10px] text-slate-500 mt-1">Automatic OCR & visual condition check</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Sample Presets */}
            <div>
              <div className="text-xs font-medium text-slate-400 mb-2">Test with Instant Sample Presets:</div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                  >
                    <img
                      src={preset.imgUrl}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pokemontcg.io/swsh7/215_hires.png';
                      }}
                      className="w-full h-14 object-cover rounded-md mb-1.5 opacity-80 group-hover:opacity-100"
                    />
                    <div className="text-[10px] font-bold text-slate-200 truncate">{preset.name}</div>
                    <div className="text-[9px] text-amber-400">{preset.grade}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Form Inputs */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Card Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Set Name</label>
                  <input
                    type="text"
                    value={setName}
                    onChange={(e) => setSetName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Grade / Format</label>
                  <select
                    value={gradeCondition}
                    onChange={(e) => setGradeCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="PSA 10">PSA 10 Gem Mint</option>
                    <option value="PSA 9">PSA 9 Mint</option>
                    <option value="PSA 8">PSA 8 NM-MT</option>
                    <option value="BGS 9.5 Gem">BGS 9.5 Gem</option>
                    <option value="CGC 10 Pristine">CGC 10 Pristine</option>
                    <option value="Raw NM">Raw Near Mint</option>
                    <option value="Raw LP">Raw Lightly Played</option>
                  </select>
                </div>
              </div>

              <button
                id="btn-run-valuation"
                onClick={() => runAiScanAndValuation()}
                disabled={isAnalyzing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-950/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Running AI Valuation Model...' : 'Analyze Market Value'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Valuation Analysis Results */}
        <div className="lg:col-span-7 space-y-5">
          {valuation && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Top Highlights Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs text-amber-400 font-semibold">{setName} #{setNumber}</div>
                  <h2 className="text-xl font-bold text-white mt-0.5">{cardName}</h2>
                  <div className="text-xs text-slate-400 mt-1">Condition Format: <span className="text-slate-200 font-semibold">{gradeCondition}</span></div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      valuation.recommendation === 'BUY'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : valuation.recommendation === 'SELL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    RECOMMENDATION: {valuation.recommendation}
                  </span>
                </div>
              </div>

              {/* Valuation Core Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] font-medium text-slate-400">Fair Market Value</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    ${valuation.fairMarketValue.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">30d Benchmark</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] font-medium text-slate-400">Target Buy Price</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    ${valuation.estimatedBuyTarget.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-amber-500 mt-0.5">Max Profitable Entry</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] font-medium text-slate-400">Model Confidence</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {valuation.confidencePercentage}%
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">High Precision</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] font-medium text-slate-400">Est. Resale Days</div>
                  <div className="text-xl font-bold text-indigo-400 mt-1">
                    ~{valuation.estimatedResaleTimeDays} days
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Liquidity Speed</div>
                </div>
              </div>

              {/* Forecast Trajectory */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Price Trajectory Forecast</span>
                  <span className="text-[10px] text-slate-500">Gemini Predictive Model</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">30-Day Forecast:</span>
                    <span className="font-bold text-emerald-400">${valuation.priceForecast30d.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">90-Day Forecast:</span>
                    <span className="font-bold text-emerald-400">${valuation.priceForecast90d.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Visual Inspection Features */}
              {valuation.keyVisualFeatures && valuation.keyVisualFeatures.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">AI Visual Centering & Condition Audit:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {valuation.keyVisualFeatures.map((feat, i) => (
                      <div key={i} className="flex items-center space-x-2 text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Strategic Summary */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  <span>Strategic Market Thesis</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {valuation.aiAnalysisSummary}
                </p>
              </div>

              {/* Add to Stock Action */}
              <div className="pt-2 flex justify-end">
                <button
                  id="btn-add-scanned-to-portfolio"
                  onClick={() =>
                    onAddToPortfolio({
                      card: {
                        id: `scanned-${Date.now()}`,
                        name: cardName,
                        setName: setName,
                        setNumber: setNumber,
                        rarity: 'Scanned Card',
                        imageUrl: selectedImage || 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80',
                        language: 'English',
                        releaseYear: 2023,
                        isGraded: gradeCondition.includes('PSA') || gradeCondition.includes('BGS'),
                        grade: gradeCondition,
                      },
                      purchasePrice: valuation.estimatedBuyTarget,
                      purchaseDate: new Date().toISOString().split('T')[0],
                      sourceMarketplace: 'Local Show',
                      condition: gradeCondition,
                      currentMarketValue: valuation.fairMarketValue,
                      targetResalePrice: valuation.priceForecast30d,
                      status: 'In Stock',
                      folder: 'Scanned Vault',
                      tags: ['AI Valued'],
                    })
                  }
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-950/40 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Scanned Card to Portfolio Stock</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
