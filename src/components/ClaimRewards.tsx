import React, { useState, useEffect } from 'react';
import { UserStake } from '../types/staking';
import { formatNumber } from '../utils/helpers';
import { SOL_PRICE_USD } from '../utils/constants';
import { ShieldCheck, Award, Clock, CheckCircle2, Lock, Unlock, Zap, Coins } from 'lucide-react';

interface ClaimRewardsProps {
  userStakes: UserStake[];
  onClaim: (stakeId: string) => Promise<{ amount: number; signature: string; slot: number }>;
  onClaimAll: () => Promise<{ totalClaimed: number; signature: string; slot: number }>;
  onCompound: (stakeId: string) => Promise<{ additionalSolPrincipal: number; signature: string; slot: number }>;
}

export const ClaimRewards: React.FC<ClaimRewardsProps> = ({
  userStakes,
  onClaim,
  onClaimAll,
  onCompound,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [compoundingId, setCompoundingId] = useState<string | null>(null);
  const [claimAllLoading, setClaimAllLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalStaked = userStakes.reduce((acc, s) => acc + s.amount, 0);
  const totalAccruedRewards = userStakes.reduce((acc, s) => acc + s.accumulatedRewards, 0);

  const handleClaim = async (stakeId: string) => {
    try {
      setClaimingId(stakeId);
      setStatusMsg(null);
      const res = await onClaim(stakeId);
      setStatusMsg({
        type: 'success',
        text: `Claimed ${formatNumber(res.amount, 6)} SOL rewards successfully!`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to claim rewards',
      });
    } finally {
      setClaimingId(null);
    }
  };

  const handleCompound = async (stakeId: string) => {
    try {
      setCompoundingId(stakeId);
      setStatusMsg(null);
      const res = await onCompound(stakeId);
      setStatusMsg({
        type: 'success',
        text: `Compounded ${formatNumber(res.additionalSolPrincipal, 6)} SOL back into principal!`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to compound rewards',
      });
    } finally {
      setCompoundingId(null);
    }
  };

  const handleClaimAll = async () => {
    try {
      setClaimAllLoading(true);
      setStatusMsg(null);
      const res = await onClaimAll();
      setStatusMsg({
        type: 'success',
        text: `Claimed total of ${formatNumber(res.totalClaimed, 6)} SOL rewards across all vaults!`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to claim all rewards',
      });
    } finally {
      setClaimAllLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Staking Positions & Reward Settlement Hub</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real on-chain yield settlement funded by the 10,000,000,000 SOL Vault reserve. Secure staking principal.
          </p>
        </div>

        {totalAccruedRewards > 0 && (
          <button
            onClick={handleClaimAll}
            disabled={claimAllLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all self-start sm:self-auto"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{claimAllLoading ? 'Processing...' : `Claim All (${formatNumber(totalAccruedRewards, 4)} SOL)`}</span>
          </button>
        )}
      </div>

      {statusMsg && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-600/40 text-emerald-300'
              : 'bg-red-950/40 border border-red-800/40 text-red-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TELEMETRY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 block">Active Principal Staked</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {formatNumber(totalStaked, 4)}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-sans">SOL</span>
          </div>
          <span className="text-xs text-slate-500 font-mono mt-0.5 block">
            ~${formatNumber(totalStaked * SOL_PRICE_USD, 2)} USD
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 block">Accrued Real Rewards</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {formatNumber(totalAccruedRewards, 6)}
            </span>
            <span className="text-xs text-slate-400 font-sans">SOL</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono mt-0.5 block">
            ~${formatNumber(totalAccruedRewards * SOL_PRICE_USD, 4)} USD
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 block">Reward Vault Reserve</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">10,000,000,000 SOL Vault</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono mt-1 block">
            Solvent & On-Chain Verified
          </span>
        </div>
      </div>

      {/* ACTIVE POSITIONS TABLE / LIST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Your Active Vault Stakes ({userStakes.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Real rewards accrue per second
          </span>
        </div>

        {userStakes.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">No active staked SOL positions</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Deposit SOL into a Titan staking vault to earn real ROI backed by the 10B SOL reserve.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userStakes.map((stake) => {
              const remainingMs = Math.max(0, stake.lockUntil - currentTime);
              const remainingSec = Math.ceil(remainingMs / 1000);
              const isLocked = remainingSec > 0;
              const hasClaimable = stake.accumulatedRewards > 0;

              return (
                <div
                  key={stake.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{stake.poolName}</span>
                      {isLocked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked ({remainingSec}s)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Unlock className="w-2.5 h-2.5" />
                          <span>Matured</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                      <span>Staked: <strong className="text-white">{formatNumber(stake.amount, 4)} SOL</strong></span>
                      <span>APY: <strong className="text-emerald-400">{stake.apy}%</strong></span>
                      <span>Earned: <strong className="text-emerald-300">{formatNumber(stake.accumulatedRewards, 6)} SOL</strong></span>
                      <span className="text-[11px] text-emerald-400/90 font-sans">Zero Price-Move Loss</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleClaim(stake.id)}
                      disabled={!hasClaimable || claimingId === stake.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{claimingId === stake.id ? 'Claiming...' : 'Claim'}</span>
                    </button>

                    <button
                      onClick={() => handleCompound(stake.id)}
                      disabled={!hasClaimable || compoundingId === stake.id}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{compoundingId === stake.id ? 'Compounding...' : 'Compound'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
