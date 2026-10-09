export interface StakingPool {
  id: string;
  name: string;
  tokenSymbol: string;
  rewardTokenSymbol: string; // 'SOL' (Mainnet)
  baseApy: number; // e.g. 24.5%
  roiMultiplier: number; // e.g. 1.25x
  lockPeriodSeconds: number; // 0 for flexible, 30s, 60s, 180s per-second staking!
  minStake: number;
  maxStake: number;
  totalStaked: number;
  stakersCount: number;
  rewardPoolAllocation: number; // slice from the 10,000,000,000 SOL pool
  rewardsDistributed: number;
  emergencyPenaltyPct: number;
  status: 'ACTIVE' | 'PAUSED' | 'DEPRECATED';
  description: string;
  tierBadge: string;
}

export interface UserStake {
  id: string;
  poolId: string;
  poolName: string;
  amount: number;
  stakedAt: number; // timestamp ms
  lockUntil: number; // timestamp ms
  apy: number;
  rewardPerMillisecond: number; // SOL accrued per millisecond (permilesec)
  accumulatedRewards: number; // SOL accumulated
  lastHarvestAt: number;
  txSignature: string;
  isLocked: boolean;
  autoCompound: boolean;
}

export interface RewardPoolReserve {
  totalCap: number; // 10,000,000,000 SOL (10 Billion Real SOL)
  totalAllocated: number;
  totalClaimed: number;
  availableBalance: number;
  emissionsPerDay: number;
  emissionsPerSec: number;
  runwayDays: number;
  vaultPda: string;
  solvencyRatio: number; // e.g. 154.2%
  lastAuditSlot: number;
}

export interface AuditCheck {
  id: string;
  category: 'SECURITY' | 'SOLVENCY' | 'SMART_CONTRACT' | 'ORACLE' | 'GOVERNANCE';
  name: string;
  description: string;
  status: 'PASS' | 'WARNING' | 'CRITICAL';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  evidence: string;
  verifiedAt: string;
}

export interface TransactionAuditLog {
  id: string;
  txHash: string;
  slot: number;
  timestamp: number;
  type: 'STAKE' | 'UNSTAKE' | 'CLAIM_REWARD' | 'AUTO_COMPOUND' | 'ADMIN_ROI_UPDATE' | 'POOL_TOPUP' | 'EMERGENCY_WITHDRAW';
  user: string;
  amount: number;
  token: string;
  feeSol: number;
  status: 'CONFIRMED' | 'FINALIZED' | 'FAILED';
  verificationProof: string;
}

export interface PerformanceSnapshot {
  slot: number;
  timestamp: number;
  tvlSol: number;
  activeStakers: number;
  dailyRewardDistributed: number;
  averageApy: number;
  poolUtilizationPct: number;
}
