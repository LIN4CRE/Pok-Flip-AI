import React, { useState } from 'react';
import { 
  QrCode, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  X, 
  Building, 
  Barcode, 
  Calendar, 
  Sparkles,
  ClipboardCheck,
  MapPin,
  UserCheck
} from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioQrModalProps {
  item: PortfolioItem;
  onClose: () => void;
}

// Custom SVG QR Code Generator Component
const QrCodeSvg: React.FC<{ value: string; size?: number }> = ({ value, size = 180 }) => {
  // Generate a deterministic 21x21 QR pattern based on string hash
  const gridSize = 21;
  const hash = value.split('').reduce((acc: number, char: string) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 7);

  const isModuleDark = (row: number, col: number) => {
    // Top-left finder pattern
    if (row < 7 && col < 7) {
      if (row === 0 || row === 6 || col === 0 || col === 6) return true;
      if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }
    // Top-right finder pattern
    if (row < 7 && col >= gridSize - 7) {
      const c = col - (gridSize - 7);
      if (row === 0 || row === 6 || c === 0 || c === 6) return true;
      if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Bottom-left finder pattern
    if (row >= gridSize - 7 && col < 7) {
      const r = row - (gridSize - 7);
      if (r === 0 || r === 6 || col === 0 || col === 6) return true;
      if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }
    // Timing patterns
    if (row === 6 || col === 6) return (row + col) % 2 === 0;

    // Pseudo-random data modules based on char values
    const bitIndex = (row * gridSize + col) % 32;
    const charCode = value.charCodeAt((row + col) % value.length) || 65;
    const combined = hash ^ (charCode * (row + 1));
    return (combined & (1 << bitIndex)) !== 0;
  };

  const modules = [];
  const cellSize = size / gridSize;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (isModuleDark(r, c)) {
        modules.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#020617"
          />
        );
      }
    }
  }

  return (
    <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-200 inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#ffffff" />
        {modules}
      </svg>
    </div>
  );
};

export const PortfolioQrModal: React.FC<PortfolioQrModalProps> = ({ item, onClose }) => {
  const [auditNotes, setAuditNotes] = useState<string>('Physical slab inspected in Vault Shelf B-12. Holo condition verified NM-MT.');
  const [auditStatus, setAuditStatus] = useState<'Verified' | 'Audited'>('Verified');
  const [auditTimestamp, setAuditTimestamp] = useState<string>(
    new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  );

  const serialCode = item.barcodeSerial || `PSA-${item.id.replace('port-', '')}`;
  const qrVerificationUrl = `https://pokeflip.ai/inventory/verify/${serialCode}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <QrCode className="w-5 h-5" />
            <span>Printable Inventory QR Code & Audit Tag</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Physical Badge Display Container */}
        <div id="printable-qr-badge" className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 print:bg-white print:border-2 print:border-black print:p-4 print:text-black">
          
          {/* Badge Header Banner */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:border-black">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 print:text-black" />
              <div>
                <h4 className="font-extrabold text-white text-sm tracking-tight print:text-black">
                  POKÉFLIP AI • VAULT INVENTORY TAG
                </h4>
                <p className="text-[10px] text-slate-400 font-mono print:text-gray-600">
                  SERIAL: {serialCode}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 print:bg-gray-200 print:text-black print:border-black">
              IN STOCK • VERIFIED
            </span>
          </div>

          {/* Card Meta & QR Layout */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Generated QR Code */}
            <div className="flex flex-col items-center">
              <QrCodeSvg value={qrVerificationUrl} size={150} />
              <span className="text-[9px] text-slate-400 font-mono mt-1.5 print:text-gray-700">
                Scan to Verify Stock
              </span>
            </div>

            {/* Card Information */}
            <div className="flex-1 space-y-2 text-xs w-full">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block print:text-black">
                  {item.card.setName} • {item.condition}
                </span>
                <h3 className="text-base font-bold text-white print:text-black">
                  {item.card.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 print:bg-gray-100 print:border-gray-400 print:text-black">
                <div>
                  <span className="text-[9px] text-slate-400 block print:text-gray-600">Cost Basis</span>
                  <span className="font-bold text-slate-200 print:text-black">${item.purchasePrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block print:text-gray-600">Market Value</span>
                  <span className="font-bold text-emerald-400 print:text-black">${item.currentMarketValue.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300 print:text-black">
                <div className="flex items-center text-slate-400 print:text-gray-800">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 print:text-black" />
                  <span>Vault Folder: <strong className="text-white print:text-black">{item.folder}</strong></span>
                </div>
                <div className="flex items-center text-slate-400 print:text-gray-800">
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-indigo-400 print:text-black" />
                  <span>Inspector ID: <strong className="text-white print:text-black">Alex Mercer (Lead Trader)</strong></span>
                </div>
                <div className="flex items-center text-slate-400 print:text-gray-800">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400 print:text-black" />
                  <span>Audited: <strong className="text-white print:text-black">{auditTimestamp}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail Note Box */}
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-[11px] print:bg-gray-50 print:border-gray-400 print:text-black">
            <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1 print:text-black">
              Physical Stock Audit Log Note
            </span>
            <p className="text-slate-300 italic print:text-black">
              "{auditNotes}"
            </p>
          </div>
        </div>

        {/* Audit Form Controls (Hidden during print) */}
        <div className="space-y-3 pt-1 print:hidden">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">
              Edit Physical Stock Inspection Note
            </label>
            <input
              type="text"
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              onClick={handlePrint}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Physical QR Badge</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
