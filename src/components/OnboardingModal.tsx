import React from 'react';
import { 
  Zap, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 font-bold mb-1 shadow-lg shadow-amber-950/40">
            <Zap className="w-6 h-6 fill-slate-950/20" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome to PokéFlip<span className="text-amber-400">.AI</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The intelligent Pokémon card market intelligence and flipping platform for discovering undervalued listings and managing stock.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
            <span className="text-amber-400 font-bold text-sm">1.</span>
            <div>
              <div className="font-bold text-white">Sub-Second Real-Time Deal Engine</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scans eBay, TCGplayer, Cardmarket, Whatnot & Mercari. Calculates gross profit and net margin after marketplace fees.</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
            <span className="text-emerald-400 font-bold text-sm">2.</span>
            <div>
              <div className="font-bold text-white">AI Vision & OCR Valuation Engine</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Upload card photos or enter set details. Gemini AI audits centering, foil texture, PSA pop reports, and 90-day price trajectories.</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
            <span className="text-indigo-400 font-bold text-sm">3.</span>
            <div>
              <div className="font-bold text-white">Fulfillment & Multi-User Syndicate</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Generate QR code shipping labels, track portfolio ROI, and share watchlists securely across team members.</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-950/40"
        >
          <span>Launch Workspace Demo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
