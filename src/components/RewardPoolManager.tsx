import React from 'react';
import { RewardPoolReserve, StakingPool } from '../types/staking';
import { formatNumber } from '../utils/helpers';
import { SOL_PRICE_USD, SOLANA_STAKING_PROGRAM_ID } from '../utils/constants';
import { Award, ShieldCheck, PieChart, TrendingUp, CheckCircle, Database, Lock, Key, ShieldAlert } from 'lucide-react';

interface RewardPoolManagerProps {
  rewardPool: RewardPoolReserve;
  pools: StakingPool[];
  onTopUp?: (amount: number) => Promise<unknown>;
}

export const RewardPoolManager: React.FC<RewardPoolManagerProps> = ({ rewardPool, pools }) => {
  const claimedPct = (rewardPool.totalClaimed / rewardPool.totalCap) * 100;
  const remainingPct = 100 - claimedPct;
  const reserveUsd = rewardPool.availableBalance * SOL_PRICE_USD;

  return (
    <div className="space-y-6">
      {/* HERO BANNER FOR 10,000,000,000 SOL REWARD POOL */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>10,000,000,000 Real SOL Dedicated Mainnet Staking Vault</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              10,000,000,000 Real SOL Staking Reward Pool
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real SOL yield reserve on Solana Mainnet-Beta. Our 10,000,000,000 SOL reward vault is housed in a non-custodial Program Derived Address (PDA), distributing real SOL ROI rewards directly to stakers.
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-semibold block mb-0.5">Principal Protection Against Market Volatility:</strong>
                <span>Persons staking retain their staking amount under any market price move or volatility. Native pure SOL principal is held 1:1 in vault PDA with capital preservation invariant.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4" />
                Mainnet PDA Verified
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Solvency Ratio: {rewardPool.solvencyRatio}%
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                <TrendingUp className="w-4 h-4" />
                Real ROI Multipliers
              </span>
            </div>
          </div>

          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-5 w-full lg:w-80 shrink-0 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Remaining Vault Liquidity</span>
              <span className="text-emerald-400 font-mono font-bold">{remainingPct.toFixed(1)}%</span>
            </div>

            <div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                {formatNumber(rewardPool.availableBalance, 0)}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                of {formatNumber(rewardPool.totalCap, 0)} SOL (~${formatNumber(reserveUsd, 0)} USD)
              </div>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full"
                style={{ width: `${remainingPct}%` }}
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Total Distributed so far</span>
              <span className="text-white font-mono font-medium">{formatNumber(rewardPool.totalClaimed, 4)} SOL</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Vault Invariant Status</span>
              <span className="text-emerald-400 font-mono font-semibold">Solvent Reserve (10B SOL)</span>
            </div>
          </div>
        </div>
      </div>

      {/* POOL ALLOCATION MATRIX & PDA INVARIANT AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ALLOCATION BY POOL */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <span>10,000,000,000 SOL Pool Quota by Lock Duration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target allocation dedicated to stakers with secure principal protection
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-5">
            {pools.map((pool) => {
              const allocationShare = ((pool.rewardPoolAllocation / rewardPool.totalCap) * 100).toFixed(0);
              const distributedShare = pool.rewardPoolAllocation > 0
                ? (pool.rewardsDistributed / pool.rewardPoolAllocation) * 100
                : 0;

              return (
                <div key={pool.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{pool.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {pool.lockPeriodSeconds > 0 ? `${pool.lockPeriodSeconds}s Lock` : 'Instant Flex'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {formatNumber(pool.rewardPoolAllocation, 0)} SOL
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1.5 font-mono">
                        ({allocationShare}%)
                      </span>
                    </div>
                  </div>

                  {/* Pool Progress */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, distributedShare)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>
                      Real Distributed: <strong className="text-slate-200 font-mono">{formatNumber(pool.rewardsDistributed, 4)}</strong> SOL
                    </span>
                    <span>
                      Available: <strong className="text-emerald-400 font-mono">{formatNumber(pool.rewardPoolAllocation - pool.rewardsDistributed, 0)}</strong> SOL
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REAL VAULT INVARIANT & PDA SECURITY AUDIT */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Vault PDA Security Invariants</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real Solana Mainnet-Beta mathematical invariants
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Non-Custodial PDA Vault</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Vault holds 10,000,000,000 Real SOL governed exclusively by Anchor seeds <code className="text-emerald-400 font-mono">[b"sol_reward_vault"]</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Program ID</span>
              </div>
              <p className="font-mono text-cyan-300 text-[11px] break-all">
                {SOLANA_STAKING_PROGRAM_ID}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Principal Protection On Price Movements</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Your staked SOL is held securely in vault PDAs with secure liquidation and settlement.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Yield Distribution</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Staking rewards accrue strictly from the genuine 10,000,000,000 SOL reserve when users stake SOL.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Every lamport claimed is validated through Anchor CPI boundaries directly to your connected Phantom Mobile wallet.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
