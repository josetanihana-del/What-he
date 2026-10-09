export function formatNumber(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatCompact(val: number): string {
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(val);
}

export function formatAddress(address: string, slice: number = 4): string {
  if (!address || address.length < slice * 2) return address;
  return `${address.slice(0, slice)}...${address.slice(-slice)}`;
}

export function generateSolanaSignature(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSolanaAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function calculatePerMillisecondRoi(amount: number, apy: number, multiplier: number = 1.0): number {
  const effectiveApy = (apy * multiplier) / 100;
  return (amount * effectiveApy) / (365 * 86400 * 1000);
}

export function calculateDailyRoi(amount: number, apy: number, multiplier: number = 1.0): number {
  const effectiveApy = (apy * multiplier) / 100;
  return (amount * effectiveApy) / 365;
}

export function calculateTotalTermRoiSeconds(amount: number, apy: number, seconds: number, multiplier: number = 1.0): number {
  if (seconds <= 0) seconds = 180; // default benchmark
  const effectiveApy = (apy * multiplier) / 100;
  return (amount * effectiveApy * (seconds / (365 * 86400)));
}
