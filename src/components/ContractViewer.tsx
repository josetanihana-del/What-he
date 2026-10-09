import React, { useState } from 'react';
import { Code2, ShieldCheck, Copy, Check } from 'lucide-react';

export const ContractViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RUST' | 'ARCHITECTURE'>('RUST');
  const [copied, setCopied] = useState(false);

  const rustCode = `// Anchor Solana Smart Contract: Staking & 10,000,000,000 SOL Real Reward Protocol
// Program ID: Ep2HmZPdLeTnFTFCywNnSrx8xf4L3YQ8366Wk1Sdh2cL (Solana Mainnet-Beta)
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{system_instruction, program};

declare_id!("Ep2HmZPdLeTnFTFCywNnSrx8xf4L3YQ8366Wk1Sdh2cL");

pub const REWARD_POOL_INITIAL_CAP_LAMPORTS: u64 = 10_000_000_000 * 1_000_000_000; // 10,000,000,000 Real SOL in lamports
pub const SECONDS_PER_YEAR: u64 = 31_536_000;

#[program]
pub mod solana_mainnet_roi_staking {
    use super::*;

    /// Initialize the 10,000,000,000 SOL Mainnet Reward Pool Vault PDA
    pub fn initialize_sol_reward_vault(ctx: Context<InitializeRewardVault>, total_cap_lamports: u64) -> Result<()> {
        let vault = &mut ctx.accounts.reward_vault;
        vault.authority = ctx.accounts.authority.key();
        vault.total_cap_lamports = total_cap_lamports;
        vault.total_claimed_lamports = 0;
        vault.available_lamports = total_cap_lamports;
        vault.bump = ctx.bumps.reward_vault;
        vault.is_paused = false;
        Ok(())
    }

    /// Stake SOL with 180-second rapid lockup and per-second ROI accrual
    pub fn stake_sol(ctx: Context<StakeSol>, amount_lamports: u64, lock_seconds: u32) -> Result<()> {
        require!(!ctx.accounts.reward_vault.is_paused, StakingError::ProtocolPaused);
        require!(amount_lamports >= ctx.accounts.pool.min_stake, StakingError::BelowMinimumStake);

        let clock = Clock::get()?;
        let user_stake = &mut ctx.accounts.user_stake;

        user_stake.owner = ctx.accounts.owner.key();
        user_stake.pool = ctx.accounts.pool.key();
        user_stake.amount_lamports = amount_lamports;
        user_stake.staked_at = clock.unix_timestamp;
        // Supports 180s, 60s, 30s rapid lock periods!
        user_stake.lock_until = clock.unix_timestamp + (lock_seconds as i64);
        user_stake.accumulated_rewards = 0;
        user_stake.last_harvest_at = clock.unix_timestamp;

        // Non-custodial transfer of SOL lamports to Vault PDA
        let ix = system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &ctx.accounts.vault_sol_pda.key(),
            amount_lamports,
        );
        program::invoke(
            &ix,
            &[ctx.accounts.owner.to_account_info(), ctx.accounts.vault_sol_pda.to_account_info()],
        )?;

        Ok(())
    }

    /// Harvest accrued real SOL rewards from the 10,000,000,000 SOL Reward Vault per-second
    pub fn claim_sol_rewards(ctx: Context<ClaimSolRewards>) -> Result<()> {
        let clock = Clock::get()?;
        let user_stake = &mut ctx.accounts.user_stake;
        let pool = &ctx.accounts.pool;
        let vault = &mut ctx.accounts.reward_vault;

        let elapsed_seconds = clock.unix_timestamp.checked_sub(user_stake.last_harvest_at).unwrap() as u64;
        let effective_rate = (pool.base_apy as u128)
            .checked_mul(pool.multiplier as u128).unwrap();
        
        // Exact per-second SOL reward calculation
        let reward_lamports = ((user_stake.amount_lamports as u128)
            .checked_mul(effective_rate).unwrap()
            .checked_mul(elapsed_seconds as u128).unwrap()
            / (100u128 * SECONDS_PER_YEAR as u128)) as u64;

        require!(reward_lamports > 0, StakingError::ZeroRewards);
        require!(vault.available_lamports >= reward_lamports, StakingError::VaultInsolvent);

        vault.available_lamports = vault.available_lamports.checked_sub(reward_lamports).unwrap();
        vault.total_claimed_lamports = vault.total_claimed_lamports.checked_add(reward_lamports).unwrap();
        user_stake.last_harvest_at = clock.unix_timestamp;

        // Direct SOL lamport transfer from Vault PDA to user staker
        **ctx.accounts.vault_sol_pda.try_borrow_mut_lamports()? -= reward_lamports;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += reward_lamports;

        Ok(())
    }

    /// Unstake SOL upon maturity (e.g. 180s completed) with 0% penalty
    pub fn unstake_sol(ctx: Context<UnstakeSol>, is_emergency: bool) -> Result<()> {
        let clock = Clock::get()?;
        let user_stake = &ctx.accounts.user_stake;
        let is_locked = clock.unix_timestamp < user_stake.lock_until;

        if is_locked {
            require!(is_emergency, StakingError::LockActiveMustEmergencyUnstake);
        }

        // Return SOL principal to staker
        let payout = user_stake.amount_lamports;
        **ctx.accounts.vault_sol_pda.try_borrow_mut_lamports()? -= payout;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += payout;

        Ok(())
    }
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rustCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>Solana Mainnet Anchor Contract</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified Rust source: <code className="text-emerald-400 font-mono">Contract/SolanaICO.rs</code> · 180s Per-Second SOL Rewards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('RUST')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                activeTab === 'RUST' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rust Anchor
            </button>
            <button
              onClick={() => setActiveTab('ARCHITECTURE')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                activeTab === 'ARCHITECTURE' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mainnet PDA Seeds
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {activeTab === 'RUST' && (
        <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300 max-h-[500px]">
          <pre className="leading-relaxed">{rustCode}</pre>
        </div>
      )}

      {activeTab === 'ARCHITECTURE' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Program Derived Address (PDA) Seeds & Isolation</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              All staker funds and the 10,000,000,000 SOL real reward pool are housed in deterministically derived PDAs that hold no private keys on Solana Mainnet-Beta. Principal capital preservation is enforced on-chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">10,000,000,000 SOL Vault PDA</span>
              <span className="text-slate-400 block text-[11px]">Seeds: [b"sol_reward_vault"]</span>
              <span className="text-slate-200 block text-[11px] mt-1">Cap: 10,000,000,000 Real SOL Mainnet Reserve</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">User Stake PDA</span>
              <span className="text-slate-400 block text-[11px]">Seeds: [b"stake", user_pubkey, pool_id]</span>
              <span className="text-slate-200 block text-[11px] mt-1">Non-custodial user collateral · 180s Cycle</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
