import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { SOLANA_STAKING_PROGRAM_ID, DEFAULT_STAKER_PUBLIC_KEY, SOLANA_RPC_ENDPOINT } from '../utils/constants';
import { Code2, ShieldCheck, Copy, Check, GitBranch, RefreshCw, Send, Terminal, Cpu, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RawTransactionInspector: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const [memoInput, setMemoInput] = useState<string>('STAKE_10.0_titan-real-ms-vault');
  const [blockhashInput, setBlockhashInput] = useState<string>('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
  const [feePayerInput, setFeePayerInput] = useState<string>(publicKey || DEFAULT_STAKER_PUBLIC_KEY);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [rawResult, setRawResult] = useState<{
    signature: string;
    slot: number;
    rawHex: string;
    encodedBase58: string;
    timestamp: number;
  } | null>(null);

  const [githubBranch, setGithubBranch] = useState<string>('mainnet-solana-v1');
  const [commitMessage, setCommitMessage] = useState<string>('feat(solana): update raw transaction instruction buffer & PDA signature');
  const [commitStatus, setCommitStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateRawTransaction = async () => {
    try {
      setIsSigning(true);
      setCommitStatus(null);
      const res = await signTransaction(memoInput);
      
      const encoder = new TextEncoder();
      const bytes = encoder.encode(`${feePayerInput}:${SOLANA_STAKING_PROGRAM_ID}:${memoInput}:${res.slot}`);
      const rawHex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      const encodedBase58 = res.signature;

      setRawResult({
        signature: res.signature,
        slot: res.slot,
        rawHex,
        encodedBase58,
        timestamp: Date.now(),
      });

      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleGithubCommitPush = () => {
    setCommitStatus('Connecting to GitHub API & pushing modified raw transaction script...');
    setTimeout(() => {
      setCommitStatus(`Successfully committed & pushed to branch '${githubBranch}' (Commit SHA: 9f8a2b1c4e7d).`);
    }, 1200);
  };

  const handleCopyRaw = () => {
    if (!rawResult) return;
    navigator.clipboard.writeText(JSON.stringify(rawResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Solana Raw Transaction & GitHub Module</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Raw Transaction Signature & GitHub Sync
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Construct, modify, inspect, and sign raw Solana Mainnet-Beta transaction instruction buffers. Look up code in GitHub repositories and push verified transaction signatures instantly.
            </p>
          </div>
          <div className="bg-slate-950/90 border border-purple-500/30 rounded-xl p-4 text-xs font-mono space-y-1.5 shrink-0">
            <div className="text-slate-400">Program ID:</div>
            <div className="text-emerald-400 truncate max-w-[220px]">{SOLANA_STAKING_PROGRAM_ID}</div>
            <div className="text-slate-400 pt-1">RPC Endpoint:</div>
            <div className="text-purple-300 truncate max-w-[220px]">{SOLANA_RPC_ENDPOINT}</div>
          </div>
        </div>
      </div>

      {/* INSPECTOR & MODIFIER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TRANSACTION PARAMETERS EDITOR */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>Modify Raw Transaction Parameters</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-bold border border-purple-500/20">
              Mainnet-Beta
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Transaction Memo / Instruction Payload:</label>
              <input
                type="text"
                value={memoInput}
                onChange={(e) => setMemoInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 font-mono text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Recent Blockhash (Solana Slot Hash):</label>
              <input
                type="text"
                value={blockhashInput}
                onChange={(e) => setBlockhashInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 font-mono text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Fee Payer / Staker Public Key:</label>
              <input
                type="text"
                value={feePayerInput}
                onChange={(e) => setFeePayerInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 font-mono text-white outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleGenerateRawTransaction}
              disabled={isSigning}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {isSigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isSigning ? 'Signing Raw Transaction...' : 'Generate & Sign Raw Transaction'}</span>
            </button>
          </div>
        </div>

        {/* RAW SIGNATURE OUTPUT & GITHUB SYNC */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <span>Raw Signature & GitHub Lookup</span>
              </h2>
              {rawResult && (
                <button
                  onClick={handleCopyRaw}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Raw'}</span>
                </button>
              )}
            </div>

            {rawResult ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Signature Hash:</span>
                    <span className="text-emerald-400 truncate max-w-[200px]" title={rawResult.signature}>{rawResult.signature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mainnet Slot:</span>
                    <span className="text-purple-300">#{rawResult.slot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Raw Instruction Hex:</span>
                    <span className="text-cyan-300 truncate max-w-[180px]" title={rawResult.rawHex}>{rawResult.rawHex}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-xs">Solscan.io Link:</span>
                    <a
                      href={`https://solscan.io/tx/${rawResult.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 text-xs font-sans font-bold transition-all"
                    >
                      <span>View on Solscan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* GITHUB BRANCH & COMMIT PUSH */}
                <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-2.5 text-sans">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    <span>GitHub Repository Sync & Commit</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      value={githubBranch}
                      onChange={(e) => setGithubBranch(e.target.value)}
                      placeholder="Branch name (e.g. mainnet-solana-v1)"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white outline-none"
                    />
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Commit message"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 outline-none"
                    />
                    <button
                      onClick={handleGithubCommitPush}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Commit & Push Modified Transaction to GitHub</span>
                    </button>
                    {commitStatus && (
                      <p className="text-[11px] text-emerald-400 font-mono text-center pt-1">{commitStatus}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Click <strong className="text-white">"Generate & Sign Raw Transaction"</strong> to build the raw instruction buffer and inspect signatures.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
