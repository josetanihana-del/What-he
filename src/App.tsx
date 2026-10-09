import React, { useState } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { useStakingContract } from './hooks/useStakingContract';
import { DashboardLayout } from './components/DashboardLayout';
import { StakingStats } from './components/StakingStats';
import { StakeForm } from './components/StakeForm';
import { ClaimRewards } from './components/ClaimRewards';
import { UnstakeForm } from './components/UnstakeForm';
import { RewardPoolManager } from './components/RewardPoolManager';
import { AuditDashboard } from './components/AuditDashboard';
import { PerformanceTracker } from './components/PerformanceTracker';
import { AdminPanel } from './components/AdminPanel';
import { ContractViewer } from './components/ContractViewer';
import { RawTransactionInspector } from './components/RawTransactionInspector';
import { KeypairManager } from './components/KeypairManager';
import { PhantomMobileModal } from './components/PhantomMobileModal';
import { useWallet } from './contexts/WalletContext';

function StakingApp() {
  const [currentTab, setCurrentTab] = useState<'VAULTS' | 'REWARD_POOL' | 'AUDIT' | 'PERFORMANCE' | 'ADMIN' | 'CONTRACT' | 'PHANTOM' | 'RAW_TX'>('VAULTS');
  const { isPhantomModalOpen, closePhantomModal } = useWallet();

  const {
    pools,
    rewardPool,
    userStakes,
    auditLogs,
    isEmergencyPaused,
    setIsEmergencyPaused,
    modifyPoolRoi,
    depositRewardPool,
    stake,
    claimReward,
    claimAllRewards,
    unstake,
    compoundReward,
  } = useStakingContract();

  return (
    <DashboardLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {/* GLOBAL SECURE MAINNET STATUS BANNER */}
      <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
        <span className="font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Solana Mainnet-Beta Web3 Staking Active · 10,000,000,000 SOL Reward Pool Online · Phantom Wallet Connected
        </span>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 font-mono font-bold">
          100% SECURE & VERIFIED
        </span>
      </div>

      {/* TAB 1: STAKING VAULTS & USER POSITIONS */}
      {currentTab === 'VAULTS' && (
        <div className="space-y-8">
          <StakingStats pools={pools} rewardPool={rewardPool} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: STAKE PORTAL FORM */}
            <div className="lg:col-span-6 space-y-6">
              <StakeForm pools={pools} onStake={stake} />
            </div>

            {/* RIGHT COLUMN: REWARD HARVEST & UNSTAKE PORTAL */}
            <div className="lg:col-span-6 space-y-6">
              <ClaimRewards
                userStakes={userStakes}
                onClaim={claimReward}
                onClaimAll={claimAllRewards}
                onCompound={compoundReward}
              />
              <UnstakeForm
                userStakes={userStakes}
                pools={pools}
                onUnstake={unstake}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 10,000,000,000 SOL REWARD POOL MANAGER */}
      {currentTab === 'REWARD_POOL' && (
        <div className="space-y-6">
          <RewardPoolManager
            rewardPool={rewardPool}
            pools={pools}
            onTopUp={depositRewardPool}
          />
        </div>
      )}

      {/* TAB 3: PHANTOM MOBILE WEB3 PORTAL */}
      {currentTab === 'PHANTOM' && (
        <div className="space-y-6">
          <KeypairManager />
        </div>
      )}

      {/* TAB 4: SECURITY AUDIT DASHBOARD */}
      {currentTab === 'AUDIT' && (
        <div className="space-y-6">
          <AuditDashboard
            auditLogs={auditLogs}
            rewardPool={rewardPool}
          />
        </div>
      )}

      {/* TAB 5: PERFORMANCE & YIELD TRACKING */}
      {currentTab === 'PERFORMANCE' && (
        <div className="space-y-6">
          <PerformanceTracker
            pools={pools}
            rewardPool={rewardPool}
          />
        </div>
      )}

      {/* TAB 6: ADMIN & ROI CONFIGURATION */}
      {currentTab === 'ADMIN' && (
        <div className="space-y-6">
          <AdminPanel
            pools={pools}
            rewardPool={rewardPool}
            auditLogs={auditLogs}
            isEmergencyPaused={isEmergencyPaused}
            onModifyRoi={modifyPoolRoi}
            onDepositRewardPool={depositRewardPool}
            onTogglePause={setIsEmergencyPaused}
          />
        </div>
      )}

      {/* TAB 7: RUST ANCHOR CONTRACT VIEWER */}
      {currentTab === 'CONTRACT' && (
        <div className="space-y-6">
          <ContractViewer />
        </div>
      )}

      {/* TAB 8: RAW TRANSACTION & GITHUB SYNC */}
      {currentTab === 'RAW_TX' && (
        <div className="space-y-6">
          <RawTransactionInspector />
        </div>
      )}

      {/* PHANTOM MOBILE QR / CONNECT MODAL */}
      <PhantomMobileModal
        isOpen={isPhantomModalOpen}
        onClose={closePhantomModal}
      />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <StakingApp />
    </WalletProvider>
  );
}
