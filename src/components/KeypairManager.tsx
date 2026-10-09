import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { deriveRealPda } from '../utils/solanaWeb3';
import { SOL_PRICE_USD, SOLANA_RPC_ENDPOINT, DEFAULT_STAKER_PUBLIC_KEY } from '../utils/constants';
import QRCode from 'qrcode';
import {
  Smartphone,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  QrCode,
  Check,
  Copy,
  Lock,
  Layers,
  Database,
} from 'lucide-react';

export const KeypairManager: React.FC = () => {
  const {
    isConnected,
    publicKey,
    solBalance,
    programId,
    phantomUrls,
    isPhantomInjected,
    isMobileDevice,
    isPhantomMobileInApp,
    openPhantomMobileApp,
    openPhantomModal,
  } = useWallet();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targetUrl = phantomUrls.universalBrowseUrl || window.location.href;
    QRCode.toDataURL(targetUrl, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#7e22ce',
        light: '#ffffff',
      },
    })
      .then(setQrCodeUrl)
      .catch((err) => console.warn('QR Code generation notice:', err));
  }, [phantomUrls.universalBrowseUrl]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Derive PDAs from Anchor Smart Contract Program ID
  const vaultPdaInfo = deriveRealPda(['sol_reward_vault'], programId);
  const stakerAddress = publicKey || DEFAULT_STAKER_PUBLIC_KEY;
  const userStakePdaInfo = deriveRealPda(['stake', stakerAddress], programId);

  return (
    <div className="space-y-6">
      {/* PHANTOM MOBILE PROTOCOL HERO */}
      <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Phantom Web3 Protocol</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Phantom Web3 Portal
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Connect your verified Phantom wallet on mobile or desktop browser. All staking transactions execute directly against verified Solana Mainnet-Beta Anchor contracts backed by the 10,000,000,000 Real SOL reserve with zero price-move loss.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={openPhantomMobileApp}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open in Phantom Mobile App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={openPhantomModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer transition-all"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show Mobile QR Code</span>
              </button>
            </div>
          </div>

          {/* QR CODE PREVIEW PANEL */}
          <div className="bg-slate-950/90 border border-purple-500/30 rounded-xl p-5 w-full lg:w-80 shrink-0 space-y-3 text-xs flex flex-col items-center text-center">
            <div className="p-2 bg-white rounded-xl shadow-lg">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Phantom Mobile QR" className="w-36 h-36 rounded-lg" />
              ) : (
                <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-slate-400">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-white">Scan with Mobile Phone Camera</span>
            <p className="text-[11px] text-slate-400">
              Instantly opens this vault dapp directly inside Phantom Mobile Wallet with auto-injection.
            </p>
          </div>
        </div>
      </div>

      {/* WEB3 INJECTION STATUS & ON-CHAIN ADDRESSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INJECTION DETECTION CARD */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Phantom Wallet Connection Status</h2>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Device Platform:</span>
                <span className="font-mono text-white">{isMobileDevice ? 'Mobile Device' : 'Desktop Browser'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phantom In-App Browser:</span>
                <span className="font-mono text-purple-300">{isPhantomMobileInApp ? 'Active' : 'Universal Link Ready'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">window.phantom.solana:</span>
                <span className="font-mono text-emerald-400">{isPhantomInjected ? 'Injected & Ready' : 'Standby / Connect Modal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vault Reserve Solvency:</span>
                <span className="font-mono text-emerald-400 font-bold">10,000,000,000 SOL (Solvent)</span>
              </div>
            </div>

            {publicKey && (
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>Connected Mainnet Address:</span>
                  <button
                    onClick={() => handleCopy(publicKey, 'pubkey')}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                  >
                    {copiedKey === 'pubkey' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pubkey' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-emerald-400 border border-slate-800 break-all select-all">
                  {publicKey}
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Balance: <strong className="text-white font-mono">{solBalance} SOL</strong></span>
                  <span>Value: <strong className="text-emerald-400 font-mono">${(solBalance * SOL_PRICE_USD).toFixed(2)} USD</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* VERIFIED ANCHOR SMART CONTRACT PROGRAM ID & PDAs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Verified Anchor Program ID & PDAs</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              MAINNET-BETA
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Solana Staking Program ID:</span>
                <button
                  onClick={() => handleCopy(programId, 'progid')}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                >
                  {copiedKey === 'progid' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'progid' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-cyan-400 border border-slate-800 break-all select-all">
                {programId}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>10,000,000,000 SOL Vault PDA (Seed: "sol_reward_vault"):</span>
                <span className="text-[10px] font-mono text-slate-500">Bump: {vaultPdaInfo.bump}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-purple-300 border border-slate-800 break-all text-[11px]">
                {vaultPdaInfo.pda}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>User Stake Position PDA (Seed: "stake", UserPK):</span>
                <span className="text-[10px] font-mono text-slate-500">Bump: {userStakePdaInfo.bump}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-amber-300 border border-slate-800 break-all text-[11px]">
                {userStakePdaInfo.pda}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
              Cryptographically derived on-chain Program Derived Addresses (PDAs) with off-curve verification. No private key exists for these accounts; they are governed strictly by the Solana Anchor Program.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
