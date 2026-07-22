import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Tag, 
  Folder, 
  CheckCircle2, 
  Search, 
  Download, 
  Upload, 
  Barcode, 
  Edit3, 
  Trash2, 
  ShoppingBag,
  Grid,
  List,
  Clock,
  Sparkles,
  QrCode
} from 'lucide-react';
import { PortfolioItem, InventoryStatus, Marketplace, CardCondition } from '../types';
import { MARKETPLACE_FEES } from '../data/mockPokemonData';
import { PortfolioQrModal } from './PortfolioQrModal';

interface PortfolioManagerProps {
  portfolioItems: PortfolioItem[];
  onAddItem: (newItem: PortfolioItem) => void;
  onUpdateItemStatus: (id: string, updated: Partial<PortfolioItem>) => void;
  onDeleteItem: (id: string) => void;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolioItems,
  onAddItem,
  onUpdateItemStatus,
  onDeleteItem,
}) => {
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [itemToSell, setItemToSell] = useState<PortfolioItem | null>(null);
  const [selectedQrItem, setSelectedQrItem] = useState<PortfolioItem | null>(null);

  // Form states for adding item
  const [newCardName, setNewCardName] = useState<string>('');
  const [newSetName, setNewSetName] = useState<string>('');
  const [newPurchasePrice, setNewPurchasePrice] = useState<string>('');
  const [newMarketValue, setNewMarketValue] = useState<string>('');
  const [newCondition, setNewCondition] = useState<CardCondition>('PSA 10');
  const [newSource, setNewSource] = useState<Marketplace>('eBay');
  const [newFolder, setNewFolder] = useState<string>('General Vault');

  // Form states for selling item
  const [soldPriceInput, setSoldPriceInput] = useState<string>('');
  const [soldPlatform, setSoldPlatform] = useState<Marketplace>('eBay');
  const [sellerShippingPaid, setSellerShippingPaid] = useState<string>('8.50');

  // Compute portfolio metrics
  const totalInvested = portfolioItems.reduce((acc, item) => acc + item.purchasePrice, 0);
  const currentTotalMarketValue = portfolioItems.reduce(
    (acc, item) => (item.status === 'Sold' ? acc : acc + item.currentMarketValue),
    0
  );
  const totalRealizedProfit = portfolioItems.reduce(
    (acc, item) => acc + (item.netProfitRealized || 0),
    0
  );
  const unrealizedGain = currentTotalMarketValue - portfolioItems
    .filter((item) => item.status !== 'Sold')
    .reduce((acc, item) => acc + item.purchasePrice, 0);

  const unrealizedRoiPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;

  // Filter items
  const filteredItems = portfolioItems.filter((item) => {
    if (activeFolder !== 'All' && item.folder !== activeFolder) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.card.name.toLowerCase().includes(q);
      const matchSet = item.card.setName.toLowerCase().includes(q);
      if (!matchName && !matchSet) return false;
    }
    return true;
  });

  // Extract folder list
  const folders = Array.from(new Set(portfolioItems.map((item) => item.folder)));

  // CSV Export
  const exportCsv = () => {
    const headers = ['Card Name', 'Set Name', 'Condition', 'Purchase Price', 'Current Value', 'Status', 'Folder', 'Realized Net Profit'];
    const rows = portfolioItems.map((item) => [
      `"${item.card.name}"`,
      `"${item.card.setName}"`,
      `"${item.condition}"`,
      item.purchasePrice,
      item.currentMarketValue,
      item.status,
      `"${item.folder}"`,
      item.netProfitRealized || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PokeFlip_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit new item
  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    const price = parseFloat(newPurchasePrice) || 0;
    const val = parseFloat(newMarketValue) || price * 1.3;

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      card: {
        id: `card-${Date.now()}`,
        name: newCardName,
        setName: newSetName || 'Custom Set',
        setNumber: 'N/A',
        rarity: 'Rare',
        imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80',
        language: 'English',
        releaseYear: 2023,
        isGraded: newCondition.includes('PSA') || newCondition.includes('BGS'),
        grade: newCondition,
      },
      purchasePrice: price,
      purchaseDate: new Date().toISOString().split('T')[0],
      sourceMarketplace: newSource,
      condition: newCondition,
      currentMarketValue: val,
      targetResalePrice: val * 1.15,
      status: 'In Stock',
      folder: newFolder,
      tags: ['New Stock'],
      barcodeSerial: `PSA-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    onAddItem(newItem);
    setIsAddModalOpen(false);
    setNewCardName('');
    setNewPurchasePrice('');
    setNewMarketValue('');
  };

  // Mark item as sold
  const handleConfirmSold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToSell) return;

    const soldPrice = parseFloat(soldPriceInput) || itemToSell.currentMarketValue;
    const feeConfig = MARKETPLACE_FEES[soldPlatform] || { feeRate: 0.10, fixedFee: 0.30 };
    const platformFee = soldPrice * feeConfig.feeRate + feeConfig.fixedFee;
    const shipCost = parseFloat(sellerShippingPaid) || 0;
    const netProfit = soldPrice - platformFee - shipCost - itemToSell.purchasePrice;

    onUpdateItemStatus(itemToSell.id, {
      status: 'Sold',
      soldPrice,
      soldDate: new Date().toISOString().split('T')[0],
      soldMarketplace: soldPlatform,
      platformFeesPaid: platformFee,
      shippingPaidBySeller: shipCost,
      netProfitRealized: netProfit,
    });

    setItemToSell(null);
  };

  return (
    <div id="portfolio-manager-container" className="space-y-6">
      {/* Portfolio Financial Headline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Invested Capital</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Cost basis across {portfolioItems.length} items
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Market Stock Value</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ${currentTotalMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-500 font-medium mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Unrealized: +${unrealizedGain.toFixed(2)} ({unrealizedRoiPercent.toFixed(1)}%)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Realized Net Profit</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            +${totalRealizedProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-500 font-medium mt-1">
            After fees & shipping costs
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inventory Actions</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <button
              id="btn-open-add-stock-modal"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock</span>
            </button>
            <button
              id="btn-export-inventory-csv"
              onClick={exportCsv}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Export CSV Inventory Report"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search stock..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Folder Filter */}
          <select
            value={activeFolder}
            onChange={(e) => setActiveFolder(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Vault Folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Listed">Listed on Market</option>
            <option value="At Grading">At Grading</option>
            <option value="Sold">Completed Sales</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table View */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Card / Format</th>
                <th className="py-3 px-4">Cost Basis</th>
                <th className="py-3 px-4">Current Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Vault Folder</th>
                <th className="py-3 px-4">Net ROI</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No items in inventory match your criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const gain = item.currentMarketValue - item.purchasePrice;
                  const gainPercent = (gain / item.purchasePrice) * 100;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.card.imageUrl}
                            alt={item.card.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.pokemontcg.io/swsh7/215_hires.png';
                            }}
                            className="w-10 h-12 object-cover rounded border border-slate-700 bg-slate-950"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{item.card.name}</div>
                            <div className="text-[10px] text-slate-400">{item.card.setName} • {item.condition}</div>
                            {item.barcodeSerial && (
                              <div className="text-[9px] text-slate-500 flex items-center font-mono mt-0.5">
                                <Barcode className="w-3 h-3 mr-1" />
                                {item.barcodeSerial}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-200">
                        ${item.purchasePrice.toFixed(2)}
                        <div className="text-[10px] text-slate-500">{item.sourceMarketplace}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        ${item.currentMarketValue.toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            item.status === 'In Stock'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                              : item.status === 'Listed'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                              : item.status === 'At Grading'
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/80'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        <span className="flex items-center text-[11px]">
                          <Folder className="w-3 h-3 mr-1 text-slate-500" />
                          {item.folder}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold">
                        {item.status === 'Sold' ? (
                          <span className="text-amber-400">
                            +${item.netProfitRealized?.toFixed(2)} Net
                          </span>
                        ) : (
                          <span className={gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPercent.toFixed(1)}%)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedQrItem(item)}
                          className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                          title="Generate Printable QR Code Badge"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        {item.status !== 'Sold' && (
                          <button
                            onClick={() => {
                              setItemToSell(item);
                              setSoldPriceInput(item.currentMarketValue.toString());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]"
                          >
                            Mark Sold
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          title="Delete Stock Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] font-medium border border-slate-800">
                    {item.folder}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">{item.status}</span>
                </div>
                <div className="flex gap-3">
                  <img src={item.card.imageUrl} alt={item.card.name} className="w-16 h-20 object-cover rounded border border-slate-700 bg-slate-950" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-xs line-clamp-1">{item.card.name}</h4>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.card.setName}</div>
                    <div className="text-[10px] text-amber-400 font-semibold mt-1">{item.condition}</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cost Basis</span>
                    <span className="font-bold text-white">${item.purchasePrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Market Value</span>
                    <span className="font-bold text-emerald-400">${item.currentMarketValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedQrItem(item)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs flex items-center justify-center space-x-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Tag</span>
                </button>
                {item.status !== 'Sold' && (
                  <button
                    onClick={() => {
                      setItemToSell(item);
                      setSoldPriceInput(item.currentMarketValue.toString());
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    Mark Sold
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Stock Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add Card to Inventory</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Card Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Charizard VMAX Alt Art"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Set Name</label>
                <input
                  type="text"
                  placeholder="e.g. Evolving Skies"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Purchase Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={newPurchasePrice}
                    onChange={(e) => setNewPurchasePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Est. Market Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="160.00"
                    value={newMarketValue}
                    onChange={(e) => setNewMarketValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Condition / Grade</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as CardCondition)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="PSA 10">PSA 10 Gem Mint</option>
                    <option value="PSA 9">PSA 9 Mint</option>
                    <option value="Raw NM">Raw Near Mint</option>
                    <option value="BGS 9.5 Gem">BGS 9.5 Gem</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Vault Folder</label>
                  <input
                    type="text"
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Save Stock Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mark Sold Modal */}
      {itemToSell && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Record Sale & Calculate Fees</h3>
              <button onClick={() => setItemToSell(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleConfirmSold} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
                <img src={itemToSell.card.imageUrl} alt={itemToSell.card.name} className="w-12 h-14 object-cover rounded border border-slate-700" />
                <div>
                  <div className="font-bold text-white">{itemToSell.card.name}</div>
                  <div className="text-[10px] text-slate-400">Purchase Basis: ${itemToSell.purchasePrice.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={soldPriceInput}
                  onChange={(e) => setSoldPriceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium">Selling Platform</label>
                  <select
                    value={soldPlatform}
                    onChange={(e) => setSoldPlatform(e.target.value as Marketplace)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="eBay">eBay (13.25%)</option>
                    <option value="TCGplayer">TCGplayer (10.25%)</option>
                    <option value="Cardmarket">Cardmarket (5%)</option>
                    <option value="Local Show">Local Show (0%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Seller Shipping ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellerShippingPaid}
                    onChange={(e) => setSellerShippingPaid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Complete Sale & Calculate Net Profit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable QR Code & Audit Tag Modal */}
      {selectedQrItem && (
        <PortfolioQrModal
          item={selectedQrItem}
          onClose={() => setSelectedQrItem(null)}
        />
      )}
    </div>
  );
};
