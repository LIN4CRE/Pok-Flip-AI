export type Marketplace = 
  | 'eBay'
  | 'TCGplayer'
  | 'Cardmarket'
  | 'Whatnot'
  | 'Facebook Marketplace'
  | 'Mercari'
  | 'Local Show';

export type CardCondition = 
  | 'PSA 10'
  | 'PSA 9'
  | 'PSA 8'
  | 'BGS 9.5 Gem'
  | 'CGC 10 Pristine'
  | 'Raw NM'
  | 'Raw LP'
  | 'Raw MP';

export interface Card {
  id: string;
  name: string;
  setName: string;
  setNumber: string;
  rarity: string;
  imageUrl: string;
  language: string;
  releaseYear: number;
  isGraded: boolean;
  grade?: string;
  popPsa10?: number;
  popPsa9?: number;
}

export interface ListingDeal {
  id: string;
  card: Card;
  marketplace: Marketplace;
  listingTitle: string;
  listingUrl: string;
  askingPrice: number;
  shippingCost: number;
  estimatedTax: number;
  sellerRatingPercentage: number;
  sellerSalesCount: number;
  fairMarketValue: number;
  expectedGrossProfit: number;
  netProfitAfterFees: number;
  roiPercentage: number;
  discountPercentage: number;
  confidenceScore: number; // 0-100
  riskScore: number; // 1-10
  estimatedResaleDays: number;
  listedTimeAgo: string;
  status: 'active' | 'purchased' | 'expired' | 'watched';
  aiRecommendationNote: string;
  buyStrategy: 'Instant Flip' | 'Hold 90 Days' | 'Grade Candidate' | 'Quick Liquidation';
}

export type InventoryStatus = 'In Stock' | 'Listed' | 'Sold' | 'At Grading' | 'In Transit';

export interface PortfolioItem {
  id: string;
  card: Card;
  purchasePrice: number;
  purchaseDate: string;
  sourceMarketplace: Marketplace;
  condition: CardCondition;
  currentMarketValue: number;
  targetResalePrice: number;
  status: InventoryStatus;
  folder: string;
  tags: string[];
  barcodeSerial?: string;
  notes?: string;
  // If sold
  soldPrice?: number;
  soldDate?: string;
  soldMarketplace?: Marketplace;
  platformFeesPaid?: number;
  shippingPaidBySeller?: number;
  netProfitRealized?: number;
}

export interface HistoricalPricePoint {
  date: string;
  timestamp: number;
  psa10Price: number;
  psa9Price: number;
  rawPrice: number;
  salesVolume: number;
}

export interface CardMarketAnalytics {
  cardId: string;
  cardName: string;
  setName: string;
  imageUrl: string;
  currentPsa10: number;
  currentRaw: number;
  change24h: number;
  change7d: number;
  change30d: number;
  volume24h: number;
  liquidityScore: 'Ultra High' | 'High' | 'Moderate' | 'Low';
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  marketCap: number;
  historicalPrices: HistoricalPricePoint[];
}

export interface SmartAlert {
  id: string;
  title: string;
  conditionType: 'price_drop' | 'roi_threshold' | 'rare_listing' | 'portfolio_value' | 'volatility';
  targetCardName?: string;
  thresholdValue: number;
  marketplaceFilter: Marketplace | 'All';
  isActive: boolean;
  notifyPush: boolean;
  notifySMS: boolean;
  notifyEmail: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export interface OrderFulfillment {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerAddress: string;
  cardTitle: string;
  cardImageUrl: string;
  salePrice: number;
  shippingFeePaidByBuyer: number;
  platformFee: number;
  netPayout: number;
  carrier: 'USPS' | 'FedEx' | 'UPS';
  trackingNumber: string;
  status: 'To Ship' | 'Label Generated' | 'In Transit' | 'Delivered';
  createdAt: string;
  shipDate?: string;
}

export interface AIValuationResult {
  fairMarketValue: number;
  estimatedBuyTarget: number;
  estimatedResaleTimeDays: number;
  confidencePercentage: number;
  riskScore: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  liquidityRating: 'Low' | 'Moderate' | 'High' | 'Ultra High';
  volatilityRating: 'Low' | 'Moderate' | 'High';
  popReport: { psa10: number; psa9: number; totalGraded: number };
  priceForecast30d: number;
  priceForecast90d: number;
  aiAnalysisSummary: string;
  keyVisualFeatures?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Senior Trader' | 'Analyst' | 'Vault Manager';
  avatarUrl: string;
  dealsReviewedCount: number;
  status: 'Active' | 'Away';
}
