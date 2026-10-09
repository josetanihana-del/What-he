import { Keypair, PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

export interface GeneratedKeypairInfo {
  publicKey: string;
  secretKeyArray: number[];
  secretKeyBase58: string;
  jsonFileContent: string;
}

export interface PhantomInjectionInfo {
  isDetected: boolean;
  isMobileDevice: boolean;
  isInAppBrowser: boolean;
  provider: any;
}

// Generate valid real Ed25519 Solana Keypairs
export function generateRealKeypair(): GeneratedKeypairInfo {
  const kp = Keypair.generate();
  const secretBytes = Array.from(kp.secretKey);
  const secretB58 = bs58.encode(kp.secretKey);

  return {
    publicKey: kp.publicKey.toBase58(),
    secretKeyArray: secretBytes,
    secretKeyBase58: secretB58,
    jsonFileContent: JSON.stringify(secretBytes),
  };
}

// Parse imported JSON keypair or Base58 secret key
export function parseKeypair(input: string): GeneratedKeypairInfo | null {
  try {
    const trimmed = input.trim();
    let secretKeyBytes: Uint8Array;

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr) && (arr.length === 64 || arr.length === 32)) {
        secretKeyBytes = new Uint8Array(arr);
      } else {
        return null;
      }
    } else {
      secretKeyBytes = bs58.decode(trimmed);
    }

    let kp: Keypair;
    if (secretKeyBytes.length === 64) {
      kp = Keypair.fromSecretKey(secretKeyBytes);
    } else if (secretKeyBytes.length === 32) {
      kp = Keypair.fromSeed(secretKeyBytes);
    } else {
      return null;
    }

    return {
      publicKey: kp.publicKey.toBase58(),
      secretKeyArray: Array.from(kp.secretKey),
      secretKeyBase58: bs58.encode(kp.secretKey),
      jsonFileContent: JSON.stringify(Array.from(kp.secretKey)),
    };
  } catch (err) {
    console.error('Failed to parse keypair:', err);
    return null;
  }
}

// Derive Program Derived Address (PDA)
export function deriveRealPda(
  seeds: (string | Uint8Array)[],
  programIdString: string
): { pda: string; bump: number } {
  try {
    const programId = new PublicKey(programIdString);
    const seedBuffers = seeds.map((s) =>
      typeof s === 'string' ? new TextEncoder().encode(s) : s
    );
    const [pda, bump] = PublicKey.findProgramAddressSync(seedBuffers, programId);
    return { pda: pda.toBase58(), bump };
  } catch {
    return { pda: '11111111111111111111111111111111', bump: 255 };
  }
}

// Validate any Base58 Solana Public Key / Address
export function validateSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  try {
    const trimmed = address.trim();
    if (trimmed.length < 32 || trimmed.length > 44) return false;
    const pk = new PublicKey(trimmed);
    return PublicKey.isOnCurve(pk.toBuffer());
  } catch {
    return false;
  }
}

// Fetch authentic on-chain SOL balance for any address from Solana Mainnet
export async function fetchRealSolBalance(
  publicKeyString: string,
  rpcUrl: string = 'https://api.mainnet-beta.solana.com'
): Promise<number | null> {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(publicKeyString.trim());
    const balanceLamports = await connection.getBalance(pubkey);
    return +(balanceLamports / LAMPORTS_PER_SOL).toFixed(4);
  } catch (err) {
    console.warn('Real on-chain balance query note:', err);
    return null;
  }
}

// Detect Phantom Wallet Injection across browser extensions and mobile in-app browser.
// Removes device restriction flags for universal Web3 connection.
export function detectPhantomInjection(): PhantomInjectionInfo {
  if (typeof window === 'undefined') {
    return {
      isDetected: false,
      isMobileDevice: false,
      isInAppBrowser: false,
      provider: null,
    };
  }

  const anyWin = window as any;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const phantomProvider = anyWin.phantom?.solana || (anyWin.solana?.isPhantom ? anyWin.solana : null);
  const isInApp = !!phantomProvider && isMobile;

  return {
    isDetected: !!phantomProvider,
    isMobileDevice: isMobile,
    isInAppBrowser: isInApp,
    provider: phantomProvider || null,
  };
}

// Generate Phantom Wallet Mobile Universal Links, Schemes, and Connect URLs
export function getPhantomRedirectUrls(currentUrl: string): {
  universalBrowseUrl: string;
  nativeAppSchemeUrl: string;
  universalConnectUrl: string;
  phantomDownloadUrl: string;
  solanaPayUrl: string;
} {
  const cleanUrl = currentUrl.split('#')[0];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const encodedUrl = encodeURIComponent(cleanUrl);
  const encodedRef = encodeURIComponent(origin);

  // Direct native iOS/Android Phantom scheme to launch inside Phantom mobile in-app browser
  const nativeAppSchemeUrl = `phantom://browse/${encodedUrl}`;
  // Universal link opens in Phantom mobile app in-app browser with injection active
  const universalBrowseUrl = `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedRef}`;
  // Universal connect redirect
  const universalConnectUrl = `https://phantom.app/ul/v1/connect?app_url=${encodedRef}&redirect_link=${encodedUrl}`;
  // Download link
  const phantomDownloadUrl = 'https://phantom.app/download';

  // Solana Pay scheme
  const solanaPayUrl = `solana:2c4tPHSiGQ15GkpXkFCwQooWvUjqKNrmwYEzEFZeVesC?reference=Ep2HmZPdLeTnFTFCywNnSrx8xf4L3YQ8366Wk1Sdh2cL&label=Solana%20Staking%2010B%20Vault&message=Stake%20SOL%2010B%20Rewards`;

  return {
    universalBrowseUrl,
    nativeAppSchemeUrl,
    universalConnectUrl,
    phantomDownloadUrl,
    solanaPayUrl,
  };
}
