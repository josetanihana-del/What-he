import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useWallet } from '../contexts/WalletContext';
import {
  Smartphone,
  X,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  AlertCircle,
} from 'lucide-react';

interface PhantomMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhantomMobileModal: React.FC<PhantomMobileModalProps> = ({ isOpen, onClose }) => {
  const {
    phantomUrls,
    isPhantomInjected,
    isPhantomMobileInApp,
    connectPhantomInjection,
    openPhantomMobileApp,
  } = useWallet();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState<string | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      const targetUrl = phantomUrls.universalBrowseUrl || currentUrl;
      QRCode.toDataURL(targetUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR', err));
    }
  }, [isOpen, phantomUrls.universalBrowseUrl, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleConnectInjected = async () => {
    try {
      setConnecting(true);
      setConnectMsg(null);
      const res = await connectPhantomInjection();
      if (res.success) {
        setConnectMsg(res.message || 'Connected to Phantom Mobile successfully!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setConnectMsg(res.message || 'Opening Phantom Mobile...');
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-purple-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg">Phantom Wallet Connection</h3>
            </div>
            <p className="text-xs text-slate-400">
              Connect your verified Phantom wallet on browser extension or mobile device.
            </p>
          </div>
        </div>

        {/* INJECTION STATUS CARD */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Phantom Wallet Status:
            </span>
            {isPhantomInjected ? (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Injected & Detected
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] border border-purple-500/30">
                Scan QR or Open App
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            {isPhantomInjected
              ? 'Phantom wallet extension is ready to connect and sign Solana staking transactions.'
              : 'Scan the QR code below with your Phantom mobile app or launch the mobile portal.'}
          </p>

          {isPhantomInjected && (
            <button
              type="button"
              onClick={handleConnectInjected}
              disabled={connecting}
              className="w-full mt-1 py-2.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-purple-200" />
              <span>{connecting ? 'Requesting Authorization...' : 'Connect Injected Phantom Wallet'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {connectMsg && (
            <p className="text-xs text-emerald-400 font-mono text-center pt-1">{connectMsg}</p>
          )}
        </div>

        {/* PHANTOM MOBILE APP LAUNCH SECTION */}
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
          <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            <span>Open in Phantom Mobile App</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Opening in Phantom Mobile app launches the in-app browser with <code className="text-purple-300 font-mono">window.phantom.solana</code> injection active for instant signing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={openPhantomMobileApp}
              className="py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-purple-200" />
              <span>Open in Phantom App</span>
            </button>

            <a
              href={phantomUrls.universalBrowseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 border border-purple-500/30 transition-all text-center"
            >
              <ExternalLink className="w-4 h-4 text-purple-300" />
              <span>Universal Web Link</span>
            </a>
          </div>
        </div>

        {/* PHANTOM QR CODE SECTION */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-purple-400" />
              Scan with Phantom Mobile Camera:
            </span>
            <span className="text-[11px] text-purple-400 font-mono">Mobile Injection</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Phantom Mobile QR Code"
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center shrink-0 font-bold">
                  1
                </span>
                <span>Open the Phantom mobile app on iOS or Android.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center shrink-0 font-bold">
                  2
                </span>
                <span>Tap the QR code scanner icon in Phantom.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center shrink-0 font-bold">
                  3
                </span>
                <span>The dApp opens in Phantom mobile in-app browser with mobile wallet injection ready.</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM UTILITY ACTIONS */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy dApp Link'}</span>
          </button>

          <a
            href={phantomUrls.phantomDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Phantom App</span>
          </a>
        </div>
      </div>
    </div>
  );
};
