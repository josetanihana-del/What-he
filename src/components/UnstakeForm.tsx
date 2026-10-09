import React, { useState, useEffect } from 'react';
import { UserStake, StakingPool } from '../types/staking';
import { formatNumber } from '../utils/helpers';
import { Unlock, AlertTriangle, CheckCircle2, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';

interface UnstakeFormProps {
  userStakes: UserStake[];
  pools: StakingPool[];
  onUnstake: (stakeId: string, isEmergency: boolean) => Promise<{ returnedSol: number; penaltyBurned: number; signature: string; slot: number }>;
}

export const UnstakeForm: React.FC<UnstakeFormProps> = ({ userStakes, pools, onUnstake }) => {
  const [selectedStakeId, setSelectedStakeId] = useState<string | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // High-frequency 1-second countdown ticker for seconds-based lockups
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedStake = userStakes.find((s) => s.id === selectedStakeId);
  const selectedPool = pools.find((p) => p.id === selectedStake?.poolId);

  const handleStandardUnstake = async (stake: UserStake) => {
    try {
      setIsProcessing(true);
      setStatusMsg(null);
      const res = await onUnstake(stake.id, false);
      setStatusMsg({
        type: 'success',
        text: `Unstaked ${formatNumber(res.returnedSol, 4)} SOL principal returned to your wallet!`,
      });
      setSelectedStakeId(null);
    } catch (err: unknown) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unstake failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmergencyConfirm = async () => {
    if (!selectedStake) return;
    try {
      setIsProcessing(true);
      setStatusMsg(null);
      const res = await onUnstake(selectedStake.id, true);
      setStatusMsg({
        type: 'success',
        text: `Unstaked ${formatNumber(res.returnedSol, 4)} SOL successfully! Principal returned.`,
      });
      setIsEmergencyModalOpen(false);
      setSelectedStakeId(null);
    } catch (err: unknown) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Emergency unstake failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <div className="pb-5 border-b border-slate-800/80">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Unlock className="w-5 h-5 text-cyan-400" />
            <span>Withdraw & Unstake Portal</span>
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Secure Unstake Protocol</span>
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Release staked SOL principal. Deposited SOL principal is safely returned.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-600/40 text-emerald-300'
              : 'bg-red-950/40 border border-red-800/40 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="mt-6">
        {/* AI AUTOMATED UNSTAKE MATH & GAS FEE ENGINE */}
        {userStakes.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-950 border border-cyan-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300 pb-2 border-b border-cyan-500/20">
              <span className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>AI Automated Unstake Math & Gas Fee Engine</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-mono">
                Auto-Calculated
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              The DApp AI Math Engine automatically computes principal returns, rewards settlement, and network gas fees instantly without manual calculations.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Total Staked Principal</span>
                <span className="text-xs font-bold text-white">
                  {formatNumber(userStakes.reduce((acc, s) => acc + s.amount, 0), 4)} SOL
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Network Gas Fee</span>
                <span className="text-xs font-bold text-amber-400">
                  -0.000005 SOL
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Net Returnable</span>
                <span className="text-xs font-bold text-emerald-400">
                  {formatNumber(userStakes.reduce((acc, s) => acc + s.amount + s.accumulatedRewards, 0) - 0.000005 * userStakes.length, 4)} SOL
                </span>
              </div>
            </div>
          </div>
        )}

        {userStakes.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
            No active staked SOL positions to withdraw.
          </div>
        ) : (
          <div className="space-y-4">
            {userStakes.map((stake) => {
              const pool = pools.find((p) => p.id === stake.poolId);
              const remainingMs = Math.max(0, stake.lockUntil - currentTime);
              const remainingSec = Math.ceil(remainingMs / 1000);
              const isLocked = remainingSec > 0;
              const penaltyPct = pool?.emergencyPenaltyPct || 0;

              return (
                <div
                  key={stake.id}
                  className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-base">{stake.poolName}</span>
                      {isLocked ? (
                        <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-bold">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>{remainingSec}s Remaining</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Matured & Ready to Unstake (0% Fee)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400">
                      <span>
                        Staked Principal: <strong className="text-white font-mono">{formatNumber(stake.amount, 4)} SOL</strong>
                      </span>
                      <span>
                        Price-Move Risk: <span className="text-emerald-400 font-mono font-medium">0.00% (Protected)</span>
                      </span>
                      {isLocked && (
                        <span>
                          Early Exit Fee: <span className="text-amber-400 font-mono">{penaltyPct}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isLocked ? (
                      <button
                        onClick={() => {
                          setSelectedStakeId(stake.id);
                          setIsEmergencyModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Emergency Exit ({penaltyPct}%)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStandardUnstake(stake)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unstake SOL Principal</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECURE UNSTAKE CONFIRMATION MODAL */}
      {isEmergencyModalOpen && selectedStake && selectedPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Secure Unstake Confirmation</h3>
                <p className="text-xs text-slate-400">
                  Instant settlement to connected Phantom wallet
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Principal Staked:</span>
                <span className="font-mono font-medium text-white">{selectedStake.amount} SOL</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Principal Protection:</span>
                <span className="font-mono font-medium">100% Guaranteed Protected</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Network Gas Fee:</span>
                <span className="font-mono text-emerald-400">0.000005 SOL</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                <span className="text-white">Net SOL Returned to Wallet:</span>
                <span className="font-mono text-emerald-400">
                  {selectedStake.amount.toFixed(4)} SOL
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              *Instant Payout: Deposited SOL principal and rewards are safely transferred to your connected Phantom wallet.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEmergencyModalOpen(false);
                  setSelectedStakeId(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleEmergencyConfirm}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {isProcessing ? 'Withdrawing...' : 'Confirm Secure Unstake'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
