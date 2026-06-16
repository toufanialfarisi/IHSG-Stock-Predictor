export type ActionType = "BUY" | "STRONG_BUY" | "SELL" | "STRONG_SELL" | "HOLD";

export interface StockFundamentals {
  peRatio: number;
  pbvRatio: number;
  roe: number;
  dividendYield: number; // in percentage, e.g. 5.4% -> 5.4
  currentRatio: number;
  der: number;           // Debt to Equity Ratio
  prospectRating: string;
  financialStatus: string;
  dividendHunterNote: string;
  sharesOutstanding: string;
  marketCap: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  prevClose: number;
  change: number;
  high: number;
  low: number;
  volume: number;
  sector: string;
  fundamentals: StockFundamentals;
}

export interface TechnicalIndicators {
  ema20: number;
  bbUpper: number;
  bbLower: number;
  rsi: number;
  macdLine: number;
  macdSignal: number;
  macdHist: number;
}

export interface Candlestick {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  indicators?: TechnicalIndicators;
}

export interface PredictionResult {
  symbol: string;
  action: ActionType;
  confidence: number; // 0 to 100
  targetPrice: number;
  stopLoss: number;
  reasoningText: string;
  technicalAnalysisText: string;
  fundamentalAnalysisText: string;
  supportLevel: number;
  resistanceLevel: number;
  timestamp: string;
  modelCode: string; // The specific version string of the model
}

export interface EvaluationItem {
  date: string;
  predictedClose: number;
  actualClose: number;
  action: ActionType;
  isCorrect: boolean;
  notes: string;
}

export interface EvaluationStats {
  symbol: string;
  mae: number;
  rmse: number;
  accuracy: number; // 0 to 100
  predictionsEvaluated: number;
  successfulTrades: number;
  totalTrades: number;
  winRate: number; // percentage
  profitFactor: number;
  recentDecisions: EvaluationItem[];
}

export interface TrainingLogEntry {
  epoch: number;
  loss: number;
  validationLoss: number;
  accuracy: number;
  message: string;
}

export interface RetrainingResponse {
  symbol: string;
  status: "success" | "optimal";
  oldAccuracy: number;
  newAccuracy: number;
  upgradeLogs: TrainingLogEntry[];
  message: string;
  updatedWeightsCode: string;
}
