import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Bell, 
  Bot, 
  ShieldCheck, 
  Store, 
  Users, 
  Search,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { TeamMember } from '../types';

interface HeaderNavbarProps {
  activeTeam: TeamMember;
  onOpenPokeBot: () => void;
  onOpenMarketplaces: () => void;
  onOpenAlerts: () => void;
  unhandledAlertsCount: number;
  liveDealsCount: number;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTeam,
  onOpenPokeBot,
  onOpenMarketplaces,
  onOpenAlerts,
  unhandledAlertsCount,
  liveDealsCount,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Live Ticker Bar */}
      <div id="top-ticker-bar" className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/60 overflow-hidden flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-400">
          <span className="flex items-center text-emerald-400 font-medium bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50 text-[11px]">
            <Zap className="w-3 h-3 mr-1 animate-pulse text-emerald-400" />
            LIVE SCANNER ACTIVE ({liveDealsCount} Deals)
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            <span className="text-slate-400">Evolving Skies Umbreon #215 PSA 10:</span>{' '}
            <span className="text-emerald-400 font-semibold">$1,150 (+3.4%)</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            <span className="text-slate-400">Team Up Latias Alt Art PSA 10:</span>{' '}
            <span className="text-emerald-400 font-semibold">$1,250 (+5.1%)</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            <span className="text-slate-400">1st Ed Base Charizard PSA 8:</span>{' '}
            <span className="text-emerald-400 font-semibold">$9,800 (Stable)</span>
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="flex items-center text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            TOS Compliant API Feed
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div id="header-main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-900/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                PokéFlip<span className="text-amber-400">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Market Intelligence & Arbitrage Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Marketplace Sync Wizard Button */}
          <button
            id="btn-open-marketplaces"
            onClick={onOpenMarketplaces}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            <span>Marketplaces</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* Smart Alerts Button */}
          <button
            id="btn-open-alerts"
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors"
            title="Smart Price Alerts"
          >
            <Bell className="w-4 h-4" />
            {unhandledAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 animate-bounce">
                {unhandledAlertsCount}
              </span>
            )}
          </button>

          {/* AI PokéBot Launch Button */}
          <button
            id="btn-open-pokebot"
            onClick={onOpenPokeBot}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-950/40"
          >
            <Bot className="w-4 h-4 fill-slate-950/20" />
            <span className="hidden xs:inline">PokéBot AI</span>
            <Sparkles className="w-3 h-3 text-slate-950" />
          </button>

          {/* Active Workspace User Profile */}
          <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-800">
            <img
              src={activeTeam.avatarUrl}
              alt={activeTeam.name}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="hidden lg:block ml-2 text-left">
              <div className="text-xs font-medium text-slate-200 leading-none">{activeTeam.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{activeTeam.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
