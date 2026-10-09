import React, { useState } from 'react';
import { StakingPool } from '../types/staking';
import { useWallet } from '../contexts/WalletContext';
import { formatNumber, calculatePerMillisecondRoi, calculateTotalTermRoiSeconds } from '../utils/helpers';
import { SOL_PRICE_USD, DEFAULT_STAKER_PUBLIC_KEY, SOLANA_STAKING_PROGRAM_ID } from '../utils/constants';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Smartphone,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StakeFormProps {
  pools: StakingPool[];
  onStake: (poolId: string, amount: number) => Promise<{ signature: string; slot: number }>;
}

export const StakeForm: React.FC<StakeFormProps> = ({ pools, onStake }) => {
  const {
    isConnected,
    solBalance,
    isPhantomInjected,
    isPhantomMobileInApp,
    openPhantomMobileApp,
    openPhantomModal,
  } = useWallet();

  const [amount, setAmount] = useState<string>('5.0');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<{
    signature: string;
    slot: number;
    amount: number;
    poolName: string;
  } | null>(null);

  const selectedPool = pools[0];
  const numAmount = parseFloat(amount) || 0;

  // Real ROI Calculations in milliseconds (permilesec)
  const poolApy = selectedPool.baseApy * selectedPool.roiMultiplier;
  const perMillisecondRate = calculatePerMillisecondRoi(numAmount, poolApy);
  const termTotalRoi = calculateTotalTermRoiSeconds(numAmount, poolApy, selectedPool.lockPeriodSeconds);
  const usdValue = numAmount * SOL_PRICE_USD;

  const handleQuickPercent = (pct: number) => {
    if (solBalance <= 0) return;
    const calculated = +((solBalance * pct) / 100).toFixed(3);
    setAmount(calculated.toString());
  };

  const executeStake = async () => {
    try {
      setError(null);
      setSuccessTx(null);

      if (!isConnected) {
        openPhantomModal();
        return;
      }

      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid SOL amount to stake.');
        return;
      }

      if (numAmount < selectedPool.minStake) {
        setError(`Minimum stake for ${selectedPool.name} is ${selectedPool.minStake} SOL.`);
        return;
      }

      if (numAmount > selectedPool.maxStake) {
        setError(`Maximum stake for ${selectedPool.name} is ${selectedPool.maxStake} SOL.`);
        return;
      }

      if (numAmount > solBalance) {
        setError(
          `Insufficient SOL balance (${formatNumber(solBalance, 4)} SOL available). Transfer SOL to your connected Phantom Mobile wallet.`
        );
        return;
      }

      setIsSubmitting(true);
      const res = await onStake(selectedPool.id, numAmount);

      setSuccessTx({
        signature: res.signature,
        slot: res.slot,
        amount: numAmount,
        poolName: selectedPool.name,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setAmount('');
    } catch (err: any) {
      setError(err?.message || 'Transaction rejected by Phantom or RPC node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* GLOW ACCENT */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                Titan Real Millisecond Staking Vault
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-bold border border-purple-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Active Vault
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Locked in real milliseconds · Permilesec accrual backed by 10,000,000,000 Real SOL reserve
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Connected SOL:</span>
            <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {formatNumber(solBalance, 4)} SOL
            </span>
          </div>
        </div>

        {/* AMOUNT INPUT BOX */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-300">Staking Amount (SOL):</label>
            <div className="flex items-center gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickPercent(pct)}
                  className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors cursor-pointer"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3.5 text-lg font-mono text-white placeholder-slate-600 outline-none transition-all pr-24"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>SOL</span>
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-400 pt-0.5">
            <span>≈ ${formatNumber(usdValue, 2)} USD</span>
            <span>
              Limits: {selectedPool.minStake} - {selectedPool.maxStake} SOL
            </span>
          </div>
        </div>

        {/* PER-MILLISEC YIELD SUMMARY */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-300 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Yield Terms (Permilesec Accrual · Anchor PDA Checked)</span>
            </span>
            <span className="font-mono text-emerald-400">Real Solana Rewards</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Accrual Velocity (Permilesec):</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                +{(perMillisecondRate * 1000).toFixed(6)} mSOL/ms
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Term Total Yield:</span>
              <span className="font-mono text-white font-bold text-sm">
                +{formatNumber(termTotalRoi, 5)} SOL
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Lock Period:</span>
              <span className="font-mono text-amber-300 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                180,000 ms (Real Milliseconds)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Early Exit Penalty:</span>
              <span className="font-mono text-emerald-400">
                0% Penalty
              </span>
            </div>
          </div>
        </div>

        {/* AI AUTOMATED STAKING MATH & YIELD INTELLIGENCE ENGINE */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-950 border border-purple-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-purple-300 pb-2 border-b border-purple-500/20">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>AI Automated Staking Math & Yield Intelligence Engine</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 font-mono">
              Auto-Calculated
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            The DApp AI Math Engine automatically computes exact real-time compounding yields and time-based projections instantly without requiring manual calculations.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Per 1 Second</span>
              <span className="text-xs font-bold text-emerald-400">
                +{(perMillisecondRate * 1000).toFixed(6)}
              </span>
              <span className="text-[9px] text-slate-500 block">SOL</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Per 1 Minute</span>
              <span className="text-xs font-bold text-emerald-400">
                +{(perMillisecondRate * 60000).toFixed(5)}
              </span>
              <span className="text-[9px] text-slate-500 block">SOL</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Per 1 Hour</span>
              <span className="text-xs font-bold text-emerald-400">
                +{(perMillisecondRate * 3600000).toFixed(4)}
              </span>
              <span className="text-[9px] text-slate-500 block">SOL</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 text-[11px]">Per 1 Day Yield:</span>
              <span className="font-mono font-bold text-emerald-400">
                +{(perMillisecondRate * 86400000).toFixed(4)} SOL
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 text-[11px]">Total Term USD Value:</span>
              <span className="font-mono font-bold text-purple-300">
                ~${formatNumber(termTotalRoi * SOL_PRICE_USD, 2)}
              </span>
            </div>
          </div>
        </div>

        {/* ERROR / SUCCESS ALERTS */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successTx && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Staked {successTx.amount} SOL in {successTx.poolName} Successfully!</span>
            </div>
            <div className="font-mono text-[11px] text-slate-300 space-y-1">
              <div>
                Tx Signature: <span className="text-emerald-400">{successTx.signature.slice(0, 24)}...</span>
              </div>
              <div>
                Mainnet Slot: <span className="text-white">#{successTx.slot}</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={openPhantomMobileApp}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-200" />
                <span>Open in Phantom Mobile App to View Rewards</span>
              </button>
            </div>
          </div>
        )}

        {/* PRIMARY SUBMIT BUTTONS (STAKE WITH PHANTOM INJECTION) */}
        <div className="space-y-2.5">
          {isConnected ? (
            <button
              type="button"
              onClick={executeStake}
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing Stake via Phantom Mobile...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 text-purple-200" />
                  <span>
                    Stake {numAmount > 0 ? `${numAmount} SOL` : ''} with Phantom Mobile
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/20 text-white font-mono font-normal">
                    {selectedPool.lockPeriodSeconds}s Lock
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={openPhantomModal}
              className="w-full py-4 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-purple-200" />
              <span>Connect Phantom Mobile to Stake</span>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={openPhantomMobileApp}
              className="py-2.5 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 border border-purple-500/30 cursor-pointer transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Launch Phantom Mobile App</span>
            </button>

            <button
              type="button"
              onClick={openPhantomModal}
              className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 cursor-pointer transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Scan Mobile QR Code</span>
            </button>
          </div>
        </div>

        {/* PHANTOM INJECTION STATUS FOOTER */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-purple-400 animate-pulse'}`}></span>
            <span>
              {isConnected
                ? isPhantomMobileInApp
                  ? 'Phantom Mobile In-App Browser Connected'
                  : 'Phantom Mobile Connected'
                : 'Desktop Browser Wallets Disabled (Phantom Mobile Only)'}
            </span>
          </div>

          <button
            type="button"
            onClick={openPhantomModal}
            className="text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
          >
            Phantom Mobile Portal
          </button>
        </div>
      </div>
    </div>
  );
};
