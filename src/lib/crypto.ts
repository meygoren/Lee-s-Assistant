export type CoinInfo = {
  id: string; // CoinGecko coin id
  symbol: string;
  name: { zh: string; en: string };
};

// A curated set of well-known coins. `id` matches CoinGecko's coin id exactly.
export const COIN_LIBRARY: CoinInfo[] = [
  { id: "bitcoin", symbol: "BTC", name: { zh: "比特币", en: "Bitcoin" } },
  { id: "ethereum", symbol: "ETH", name: { zh: "以太坊", en: "Ethereum" } },
  { id: "tether", symbol: "USDT", name: { zh: "泰达币", en: "Tether" } },
  { id: "binancecoin", symbol: "BNB", name: { zh: "币安币", en: "BNB" } },
  { id: "solana", symbol: "SOL", name: { zh: "索拉纳", en: "Solana" } },
  { id: "ripple", symbol: "XRP", name: { zh: "瑞波币", en: "XRP" } },
  { id: "usd-coin", symbol: "USDC", name: { zh: "USD Coin", en: "USD Coin" } },
  { id: "cardano", symbol: "ADA", name: { zh: "艾达币", en: "Cardano" } },
  { id: "dogecoin", symbol: "DOGE", name: { zh: "狗狗币", en: "Dogecoin" } },
  { id: "avalanche-2", symbol: "AVAX", name: { zh: "雪崩", en: "Avalanche" } },
  { id: "tron", symbol: "TRX", name: { zh: "波场", en: "TRON" } },
  { id: "chainlink", symbol: "LINK", name: { zh: "Chainlink", en: "Chainlink" } },
  { id: "polkadot", symbol: "DOT", name: { zh: "波卡", en: "Polkadot" } },
  { id: "matic-network", symbol: "MATIC", name: { zh: "Polygon", en: "Polygon" } },
  { id: "litecoin", symbol: "LTC", name: { zh: "莱特币", en: "Litecoin" } },
  { id: "shiba-inu", symbol: "SHIB", name: { zh: "柴犬币", en: "Shiba Inu" } },
  { id: "bitcoin-cash", symbol: "BCH", name: { zh: "比特币现金", en: "Bitcoin Cash" } },
  { id: "near", symbol: "NEAR", name: { zh: "NEAR", en: "NEAR Protocol" } },
  { id: "uniswap", symbol: "UNI", name: { zh: "Uniswap", en: "Uniswap" } },
  { id: "stellar", symbol: "XLM", name: { zh: "恒星币", en: "Stellar" } },
  { id: "monero", symbol: "XMR", name: { zh: "门罗币", en: "Monero" } },
  { id: "aptos", symbol: "APT", name: { zh: "Aptos", en: "Aptos" } },
  { id: "arbitrum", symbol: "ARB", name: { zh: "Arbitrum", en: "Arbitrum" } },
  { id: "optimism", symbol: "OP", name: { zh: "Optimism", en: "Optimism" } },
  { id: "sui", symbol: "SUI", name: { zh: "Sui", en: "Sui" } },
  { id: "pepe", symbol: "PEPE", name: { zh: "Pepe", en: "Pepe" } },
];

export const DEFAULT_CRYPTO_COINS = ["bitcoin", "ethereum", "solana", "binancecoin", "ripple"];
export const MAX_TRACKED_COINS = 5;

export function resolveCoins(coinIds: string[] | null | undefined): CoinInfo[] {
  const ids = coinIds && coinIds.length > 0 ? coinIds : DEFAULT_CRYPTO_COINS;
  return ids
    .map((id) => COIN_LIBRARY.find((c) => c.id === id))
    .filter((c): c is CoinInfo => Boolean(c));
}

export type CoinPrice = {
  usd: number;
  usd_24h_change: number | null;
};

export async function fetchCoinPrices(coinIds: string[]): Promise<Record<string, CoinPrice>> {
  if (coinIds.length === 0) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    coinIds.join(",")
  )}&vs_currencies=usd&include_24hr_change=true`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`CoinGecko request failed: ${res.status}`);
  return res.json();
}
