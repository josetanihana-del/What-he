import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { formatNumber, formatAddress } from '../utils/helpers';
import { SOL_PRICE_USD } from '../utils/constants';
import {
  ShieldCheck,
  Coins,
  Award,
  TrendingUp,
  Settings,
  Code2,
  ChevronDown,
  LogOut,
  QrCode,
  Smartphone,
  Terminal,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentTab: 'VAULTS' | 'REWARD_POOL' | 'AUDIT' | 'PERFORMANCE' | 'ADMIN' | 'CONTRACT' | 'PHANTOM' | 'RAW_TX';
  onTabChange: (tab: 'VAULTS' | 'REWARD_POOL' | 'AUDIT' | 'PERFORMANCE' | 'ADMIN' | 'CONTRACT' | 'PHANTOM' | 'RAW_TX') => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentTab,
  onTabChange,
}) => {
  const {
    isConnected,
    publicKey,
    solBalance,
    openPhantomModal,
    openPhantomMobileApp,
    disconnect,
  } = useWallet();

  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* BRANDING */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-400 p-0.5 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Coins className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    SOLANA TITAN
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono font-bold border border-purple-500/20">
                    PHANTOM MOBILE
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400 font-mono font-medium">10,000,000,000 SOL Real Reward Pool</span>
                  <span>·</span>
                  <span className="text-amber-300 font-medium">Principal Protection Shield</span>
                </div>
              </div>
            </div>

            {/* WALLET BUTTON (PHANTOM MOBILE INJECTION ONLY) */}
            <div className="flex items-center gap-3">
              {isConnected && publicKey ? (
                <div className="relative">
                  <button
                    onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/40 hover:border-purple-500 text-xs font-mono transition-all shadow-md shadow-purple-900/20 cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div className="flex items-center gap-1.5 text-purple-200">
                      <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-semibold text-white">
                        {formatAddress(publicKey, 4)}
                      </span>
                    </div>
                    <span className="text-slate-500">|</span>
                    <span className="text-emerald-400 font-bold">
                      {formatNumber(solBalance, 2)} SOL
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* DROPDOWN MENU */}
                  {walletDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-white">Phantom Mobile Injected</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Active
                        </span>
                      </div>

                      <div className="space-y-1 font-mono">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Mainnet Address:</span>
                          <span className="text-white font-mono text-[11px] truncate max-w-[140px]">{formatAddress(publicKey, 6)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>On-Chain Balance:</span>
                          <span className="text-white font-semibold">{formatNumber(solBalance, 4)} SOL</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>USD Value:</span>
                          <span className="text-emerald-400 font-semibold">${formatNumber(solBalance * SOL_PRICE_USD, 2)}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <button
                          onClick={() => {
                            openPhantomMobileApp();
                            setWalletDropdownOpen(false);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-purple-500/30 cursor-pointer"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Open in Phantom App</span>
                        </button>

                        <button
                          onClick={() => {
                            openPhantomModal();
                            setWalletDropdownOpen(false);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-purple-400" />
                          <span>Show Mobile QR Code</span>
                        </button>

                        <div className="pt-1">
                          <button
                            onClick={() => {
                              disconnect();
                              setWalletDropdownOpen(false);
                            }}
                            className="w-full py-1 rounded text-red-400 hover:text-red-300 font-medium text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Disconnect Wallet</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openPhantomModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 cursor-pointer transition-all"
                  >
                    <Smartphone className="w-4 h-4 text-purple-200" />
                    <span>Connect Phantom Mobile</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 -mb-[1px]">
            {[
              { id: 'VAULTS', label: 'Staking Vaults', icon: Coins },
              { id: 'REWARD_POOL', label: '10,000,000,000 SOL Reward Pool', icon: Award },
              { id: 'PHANTOM', label: 'Phantom Mobile Portal', icon: Smartphone },
              { id: 'AUDIT', label: 'Mainnet Security Audit', icon: ShieldCheck },
              { id: 'PERFORMANCE', label: 'Real Yield Metrics', icon: TrendingUp },
              { id: 'ADMIN', label: 'ROI Admin & Config', icon: Settings },
              { id: 'CONTRACT', label: 'Anchor Rust Contract', icon: Code2 },
              { id: 'RAW_TX', label: 'Raw Tx & GitHub', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'border-purple-400 text-purple-300 bg-purple-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Solana Mainnet-Beta · 10,000,000,000 Real SOL Staking Vault · Secure Principal Protection · Phantom Mobile Web3</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={openPhantomMobileApp}
              className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Launch in Phantom Mobile</span>
            </button>
            <span>·</span>
            <button
              onClick={openPhantomModal}
              className="hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mobile QR Scanner</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
